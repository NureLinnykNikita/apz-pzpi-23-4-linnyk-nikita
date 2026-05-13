param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$ImageName = "langbang-server:lab"
$NoProxyValue = "localhost,127.0.0.1,::1,kubernetes.docker.internal"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor DarkGray
}

function Invoke-Tool {
    param(
        [string]$FilePath,
        [string[]]$Arguments
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $FilePath $($Arguments -join ' ')"
    }
}

function Test-CommandAvailable {
    param([string]$Command)

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command '$Command' was not found. Install it or add it to PATH."
    }
}

function Assert-DockerReady {
    Test-CommandAvailable "docker"

    $serverVersion = & docker info --format "{{.ServerVersion}}" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw @"
Docker CLI is installed, but Docker daemon is not reachable.

What to check:
1. Start Docker Desktop.
2. Wait until Docker Desktop shows that the engine is running.
3. Use Linux containers / Docker Desktop Kubernetes.
4. Run: docker context use desktop-linux
5. Retry this script.

Docker output:
$serverVersion
"@
    }

    Write-Info "Docker daemon is available. Server version: $serverVersion"
}

function Assert-KubectlReady {
    Test-CommandAvailable "kubectl"
    Set-KubernetesNoProxy

    $context = & kubectl config current-context 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl is installed, but no Kubernetes context is available. Enable Kubernetes in Docker Desktop."
    }

    Write-Info "Current Kubernetes context: $context"
    Write-Info "Expected Kubernetes context for Docker Desktop: docker-desktop"
}

function Read-Default {
    param(
        [string]$Prompt,
        [string]$Default
    )

    $value = Read-Host "$Prompt [$Default]"
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }
    return $value.Trim()
}

function Set-KubernetesNoProxy {
    $env:NO_PROXY = $NoProxyValue
    $env:no_proxy = $NoProxyValue
}

function Assert-Prerequisites {
    param([bool]$RequireDocker = $true)

    Write-Step "Checking prerequisites"
    if ($RequireDocker) {
        Assert-DockerReady
    }
    Assert-KubectlReady
}

function Build-Image {
    if ($SkipBuild) {
        Write-Info "Skipping Docker build because -SkipBuild was provided."
        return
    }

    $answer = Read-Default "Build Docker image $ImageName?" "y"
    if ($answer.ToLowerInvariant() -notin @("y", "yes")) {
        return
    }

    Write-Step "Building Docker image"
    Invoke-Tool "docker" @("build", "-t", $ImageName, "./server")
}

function Apply-Config {
    Write-Step "Applying Kubernetes ConfigMap"
    Invoke-Tool "kubectl" @("apply", "-f", "k8s/01-config.yaml")
}

function New-Secret {
    Write-Step "Creating Kubernetes Secret"
    Write-Host "Database mode:"
    Write-Host "  1. Local PostgreSQL in Kubernetes"
    Write-Host "  2. External Neon PostgreSQL"
    $mode = Read-Default "Choose database mode" "1"

    $postgresDb = "langbang"
    $postgresUser = "langbang"
    $postgresPassword = "langbang"
    $databaseUrl = "postgresql://langbang:langbang@postgres:5432/langbang?schema=public"

    if ($mode -eq "2") {
        $databaseUrl = Read-Host "Enter Neon DATABASE_URL"
        if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
            throw "DATABASE_URL cannot be empty for Neon mode."
        }
        $postgresDb = ""
        $postgresUser = ""
        $postgresPassword = ""
    } else {
        $postgresDb = Read-Default "POSTGRES_DB" $postgresDb
        $postgresUser = Read-Default "POSTGRES_USER" $postgresUser
        $postgresPassword = Read-Default "POSTGRES_PASSWORD" $postgresPassword
        $databaseUrl = "postgresql://$postgresUser`:$postgresPassword@postgres:5432/$postgresDb`?schema=public"
    }

    $jwtAccessSecret = Read-Default "JWT_ACCESS_SECRET" "lab-access-secret-change-me"
    $jwtRefreshSecret = Read-Default "JWT_REFRESH_SECRET" "lab-refresh-secret-change-me"
    $cloudinaryCloudName = Read-Default "CLOUDINARY_CLOUD_NAME" "demo"
    $cloudinaryApiKey = Read-Default "CLOUDINARY_API_KEY" "demo"
    $cloudinaryApiSecret = Read-Default "CLOUDINARY_API_SECRET" "demo"

    $secretArgs = @(
        "create", "secret", "generic", "langbang-api-secret",
        "--from-literal=DATABASE_URL=$databaseUrl",
        "--from-literal=JWT_ACCESS_SECRET=$jwtAccessSecret",
        "--from-literal=JWT_REFRESH_SECRET=$jwtRefreshSecret",
        "--from-literal=CLOUDINARY_CLOUD_NAME=$cloudinaryCloudName",
        "--from-literal=CLOUDINARY_API_KEY=$cloudinaryApiKey",
        "--from-literal=CLOUDINARY_API_SECRET=$cloudinaryApiSecret"
    )

    if ($mode -ne "2") {
        $secretArgs += @(
            "--from-literal=POSTGRES_DB=$postgresDb",
            "--from-literal=POSTGRES_USER=$postgresUser",
            "--from-literal=POSTGRES_PASSWORD=$postgresPassword"
        )
    }

    $secretArgs += @("--dry-run=client", "-o", "yaml")
    $secretYaml = & kubectl @secretArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate Kubernetes Secret YAML."
    }

    $secretYaml | & kubectl apply -f -
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to apply Kubernetes Secret."
    }

    return $mode
}

function Deploy-PostgresIfNeeded {
    param([string]$DatabaseMode)

    if ($DatabaseMode -eq "2") {
        Write-Info "Skipping local PostgreSQL because Neon mode was selected."
        return
    }

    Write-Step "Deploying local PostgreSQL"
    Invoke-Tool "kubectl" @("apply", "-f", "k8s/02-postgres.yaml")
    Invoke-Tool "kubectl" @("wait", "--for=condition=available", "deployment/postgres", "--timeout=120s")
}

function Run-DatabaseSetup {
    Write-Step "Running Prisma migrations and seed"
    Invoke-Tool "kubectl" @("delete", "job", "langbang-db-setup", "--ignore-not-found=true")
    Invoke-Tool "kubectl" @("apply", "-f", "k8s/04-migrate-and-seed-job.yaml")

    & kubectl wait --for=condition=complete job/langbang-db-setup --timeout=180s
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Database setup job failed. Last logs:" -ForegroundColor Yellow
        & kubectl logs job/langbang-db-setup --tail=200
        throw "Database setup job did not complete."
    }
}

function Deploy-Api {
    Write-Step "Deploying API"
    Invoke-Tool "kubectl" @("apply", "-f", "k8s/03-api.yaml")
    Invoke-Tool "kubectl" @("wait", "--for=condition=available", "deployment/langbang-api", "--timeout=120s")
}

function Scale-Api {
    $replicas = Read-Default "How many langbang-api replicas?" "1"
    Write-Step "Scaling API to $replicas replica(s)"
    Invoke-Tool "kubectl" @("scale", "deployment/langbang-api", "--replicas=$replicas")
    Invoke-Tool "kubectl" @("rollout", "status", "deployment/langbang-api", "--timeout=120s")
    Invoke-Tool "kubectl" @("get", "pods", "-l", "app=langbang-api")
}

function Show-TestCommands {
    Write-Step "Commands for manual testing"
    Write-Host "Open a separate PowerShell and keep this running:"
    Write-Host '$env:NO_PROXY="localhost,127.0.0.1,::1,kubernetes.docker.internal"'
    Write-Host "kubectl port-forward svc/langbang-api 5000:80"
    Write-Host ""
    Write-Host "Then check API:"
    Write-Host "curl http://localhost:5000/health"
    Write-Host "curl http://localhost:5000/api/courses"
    Write-Host ""
    Write-Host "Run Locust:"
    Write-Host "pip install -r load-tests/requirements.txt"
    Write-Host "locust -f load-tests/locustfile.py --host=http://localhost:5000"
    Write-Host ""
    Write-Host "Open Locust UI: http://localhost:8089"
}

function Start-PortForward {
    Write-Step "Starting kubectl port-forward in a new PowerShell window"
    $command = "`$env:NO_PROXY='$NoProxyValue'; kubectl port-forward svc/langbang-api 5000:80"
    Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $command)
    Write-Info "A new PowerShell window should stay open while API is forwarded to http://localhost:5000."
}

function Test-ApiEndpoints {
    Write-Step "Checking API endpoints"

    $health = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
    Write-Host "GET /health -> $($health.StatusCode)"

    $courses = Invoke-WebRequest -Uri "http://localhost:5000/api/courses" -UseBasicParsing
    Write-Host "GET /api/courses -> $($courses.StatusCode)"
}

function Install-Locust {
    Write-Step "Installing Locust requirements"
    Test-CommandAvailable "python"
    Invoke-Tool "python" @("-m", "pip", "install", "-r", "load-tests/requirements.txt")
}

function Start-Locust {
    Write-Step "Starting Locust in a new PowerShell window"
    Test-CommandAvailable "python"
    $command = "python -m locust -f load-tests/locustfile.py --host=http://localhost:5000"
    Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $command)
    Write-Info "Open Locust UI: http://localhost:8089"
}

function Show-TestingMenu {
    while ($true) {
        Write-Host ""
        Write-Host "Interactive testing helper" -ForegroundColor Green
        Write-Host "1. Start API port-forward"
        Write-Host "2. Check API endpoints"
        Write-Host "3. Install Locust requirements"
        Write-Host "4. Start Locust UI"
        Write-Host "5. Show manual commands"
        Write-Host "6. Back"

        $choice = Read-Default "Choose action" "1"

        switch ($choice) {
            "1" { Assert-Prerequisites -RequireDocker $false; Start-PortForward }
            "2" { Test-ApiEndpoints }
            "3" { Install-Locust }
            "4" { Start-Locust }
            "5" { Show-TestCommands }
            "6" { return }
            default { Write-Host "Unknown option: $choice" -ForegroundColor Yellow }
        }
    }
}

function Cleanup-Lab {
    $answer = Read-Default "Delete Lab 4 Kubernetes resources?" "n"
    if ($answer.ToLowerInvariant() -notin @("y", "yes")) {
        return
    }

    Write-Step "Cleaning Kubernetes resources"
    & kubectl delete -f k8s/05-hpa.yaml --ignore-not-found=true
    & kubectl delete -f k8s/03-api.yaml --ignore-not-found=true
    & kubectl delete -f k8s/04-migrate-and-seed-job.yaml --ignore-not-found=true
    & kubectl delete -f k8s/02-postgres.yaml --ignore-not-found=true
    & kubectl delete -f k8s/01-config.yaml --ignore-not-found=true
    & kubectl delete secret langbang-api-secret --ignore-not-found=true
}

function Deploy-FullLab {
    Assert-Prerequisites -RequireDocker $true
    Build-Image
    Apply-Config
    $databaseMode = New-Secret
    Deploy-PostgresIfNeeded $databaseMode
    Run-DatabaseSetup
    Deploy-Api
    Scale-Api
    Show-TestCommands
}

function Show-Menu {
    Write-Host ""
    Write-Host "LangBang Lab 4 interactive setup" -ForegroundColor Green
    Write-Host "1. Full deploy or redeploy"
    Write-Host "2. Scale API replicas"
    Write-Host "3. Interactive testing helper"
    Write-Host "4. Cleanup Kubernetes resources"
    Write-Host "5. Exit"
}

Set-KubernetesNoProxy

:MenuLoop while ($true) {
    Show-Menu
    $choice = Read-Default "Choose action" "1"

    switch ($choice) {
        "1" { Deploy-FullLab }
        "2" { Assert-Prerequisites -RequireDocker $false; Scale-Api }
        "3" { Show-TestingMenu }
        "4" { Assert-Prerequisites -RequireDocker $false; Cleanup-Lab }
        "5" { break MenuLoop }
        default { Write-Host "Unknown option: $choice" -ForegroundColor Yellow }
    }
}
