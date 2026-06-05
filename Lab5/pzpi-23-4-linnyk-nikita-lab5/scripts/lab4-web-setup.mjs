import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, rm, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const publicRoot = join(__dirname, "lab4-web");
const port = Number(process.env.LAB4_SETUP_PORT || 8090);
const imageName = "langbang-server:lab";
const noProxy = "localhost,127.0.0.1,::1,kubernetes.docker.internal";

const jobs = new Map();

function json(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function append(job, line) {
  job.logs.push(line);
  if (job.logs.length > 1500) job.logs.shift();
}

function runProcess(job, command, args, options = {}) {
  append(job, `> ${command} ${args.join(" ")}`);

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        NO_PROXY: noProxy,
        no_proxy: noProxy,
      },
      shell: false,
      windowsHide: true,
      ...options,
    });

    let output = "";
    child.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
      append(job, text.trimEnd());
    });

    child.stderr.on("data", (data) => {
      const text = data.toString();
      output += text;
      append(job, text.trimEnd());
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise(output);
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

function startDetached(job, command, args) {
  append(job, `> start ${command} ${args.join(" ")}`);
  // Use cmd /c start to open a new visible console window on Windows
  const child = spawn("cmd.exe", ["/c", "start", command, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      NO_PROXY: noProxy,
      no_proxy: noProxy,
    },
    shell: false,
    stdio: "ignore",
  });
  child.unref();
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

async function applySecret(job, config) {
  const databaseMode = config.databaseMode || "local";
  const postgresDb = config.postgresDb || "langbang";
  const postgresUser = config.postgresUser || "langbang";
  const postgresPassword = config.postgresPassword || "langbang";
  const databaseUrl =
    databaseMode === "neon"
      ? config.databaseUrl
      : `postgresql://${postgresUser}:${postgresPassword}@postgres:5432/${postgresDb}?schema=public`;

  if (!databaseUrl) throw new Error("DATABASE_URL is required.");

  const values = {
    DATABASE_URL: databaseUrl,
    JWT_ACCESS_SECRET: config.jwtAccessSecret || "lab-access-secret-change-me",
    JWT_REFRESH_SECRET: config.jwtRefreshSecret || "lab-refresh-secret-change-me",
    CLOUDINARY_CLOUD_NAME: config.cloudinaryCloudName || "demo",
    CLOUDINARY_API_KEY: config.cloudinaryApiKey || "demo",
    CLOUDINARY_API_SECRET: config.cloudinaryApiSecret || "demo",
  };

  if (databaseMode !== "neon") {
    values.POSTGRES_DB = postgresDb;
    values.POSTGRES_USER = postgresUser;
    values.POSTGRES_PASSWORD = postgresPassword;
  }

  if (config.extraEnv && typeof config.extraEnv === "object") {
    for (const [key, value] of Object.entries(config.extraEnv)) {
      const k = key.trim();
      if (k) values[k] = String(value ?? "");
    }
  }

  const body = Object.entries(values)
    .map(([key, value]) => `  ${key}: ${yamlString(value)}`)
    .join("\n");

  const file = join(tmpdir(), `langbang-secret-${randomUUID()}.yaml`);
  const yaml = `apiVersion: v1
kind: Secret
metadata:
  name: langbang-api-secret
type: Opaque
stringData:
${body}
`;

  await writeFile(file, yaml, "utf8");
  try {
    await runProcess(job, "kubectl", ["apply", "-f", file]);
  } finally {
    await rm(file, { force: true });
  }
}

async function checkPrerequisites(job, { requireDocker = true } = {}) {
  append(job, `NO_PROXY=${noProxy}`);
  if (requireDocker) {
    await runProcess(job, "docker", ["info", "--format", "{{.ServerVersion}}"]);
  }
  await runProcess(job, "kubectl", ["config", "current-context"]);
}

async function fullDeploy(job, config) {
  await checkPrerequisites(job, { requireDocker: !config.skipBuild });

  if (!config.skipBuild) {
    await runProcess(job, "docker", ["build", "-t", imageName, "./server"]);
  } else {
    append(job, "Skipping Docker build.");
  }

  await runProcess(job, "kubectl", ["apply", "-f", "k8s/01-config.yaml"]);
  await applySecret(job, config);

  if (config.databaseMode !== "neon") {
    await runProcess(job, "kubectl", ["apply", "-f", "k8s/02-postgres.yaml"]);
    await runProcess(job, "kubectl", [
      "wait",
      "--for=condition=available",
      "deployment/postgres",
      "--timeout=120s",
    ]);
  } else {
    append(job, "Skipping local PostgreSQL because Neon mode was selected.");
  }

  await runProcess(job, "kubectl", ["delete", "job", "langbang-db-setup", "--ignore-not-found=true"]);
  await runProcess(job, "kubectl", ["apply", "-f", "k8s/04-migrate-and-seed-job.yaml"]);

  try {
    await runProcess(job, "kubectl", [
      "wait",
      "--for=condition=complete",
      "job/langbang-db-setup",
      "--timeout=180s",
    ]);
  } catch (error) {
    append(job, "Database setup failed. Last job logs:");
    await runProcess(job, "kubectl", ["logs", "job/langbang-db-setup", "--tail=200"]).catch(() => {});
    throw error;
  }

  await runProcess(job, "kubectl", ["apply", "-f", "k8s/03-api.yaml"]);
  await runProcess(job, "kubectl", [
    "wait",
    "--for=condition=available",
    "deployment/langbang-api",
    "--timeout=120s",
  ]);

  const replicas = String(config.replicas || "1");
  await scaleApi(job, replicas);
}

async function scaleApi(job, replicas) {
  await checkPrerequisites(job, { requireDocker: false });
  await runProcess(job, "kubectl", ["scale", "deployment/langbang-api", `--replicas=${replicas}`]);
  await runProcess(job, "kubectl", ["rollout", "status", "deployment/langbang-api", "--timeout=120s"]);
  await runProcess(job, "kubectl", ["get", "pods", "-l", "app=langbang-api"]);
}

async function cleanup(job) {
  await checkPrerequisites(job, { requireDocker: false });
  await runProcess(job, "kubectl", ["delete", "-f", "k8s/05-hpa.yaml", "--ignore-not-found=true"]).catch(() => {});
  await runProcess(job, "kubectl", ["delete", "-f", "k8s/03-api.yaml", "--ignore-not-found=true"]).catch(() => {});
  await runProcess(job, "kubectl", ["delete", "-f", "k8s/04-migrate-and-seed-job.yaml", "--ignore-not-found=true"]).catch(() => {});
  await runProcess(job, "kubectl", ["delete", "-f", "k8s/02-postgres.yaml", "--ignore-not-found=true"]).catch(() => {});
  await runProcess(job, "kubectl", ["delete", "-f", "k8s/01-config.yaml", "--ignore-not-found=true"]).catch(() => {});
  await runProcess(job, "kubectl", ["delete", "secret", "langbang-api-secret", "--ignore-not-found=true"]).catch(() => {});
}

async function checkApi(job) {
  const health = await fetch("http://localhost:5000/health");
  append(job, `GET /health -> ${health.status}`);
  if (!health.ok) append(job, await health.text());

  const courses = await fetch("http://localhost:5000/api/courses");
  append(job, `GET /api/courses -> ${courses.status}`);
  if (!courses.ok) append(job, await courses.text());
}

async function importApiData(job, payload) {
  append(job, "Authenticating as admin...");
  const loginRes = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@langbang.com", password: "admin123" }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${text}`);
  }
  const { accessToken } = await loginRes.json();
  append(job, "Authenticated. Sending import request...");

  const importRes = await fetch("http://localhost:5000/api/admin/import", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!importRes.ok) {
    const text = await importRes.text();
    throw new Error(`Import failed (${importRes.status}): ${text}`);
  }
  await importRes.json();

  const counts = [];
  if (Array.isArray(payload.languages) && payload.languages.length)
    counts.push(`${payload.languages.length} language(s)`);
  if (Array.isArray(payload.achievements) && payload.achievements.length)
    counts.push(`${payload.achievements.length} achievement(s)`);
  if (Array.isArray(payload.courses) && payload.courses.length)
    counts.push(`${payload.courses.length} course(s)`);
  append(job, `Import successful: ${counts.length ? counts.join(", ") : "no records"}.`);
}

function createJob(name, runner) {
  const id = randomUUID();
  const job = {
    id,
    name,
    status: "running",
    logs: [],
    createdAt: new Date().toISOString(),
    finishedAt: null,
  };
  jobs.set(id, job);

  Promise.resolve()
    .then(() => runner(job))
    .then(() => {
      job.status = "completed";
      job.finishedAt = new Date().toISOString();
      append(job, "Done.");
    })
    .catch((error) => {
      job.status = "failed";
      job.finishedAt = new Date().toISOString();
      append(job, `ERROR: ${error.message}`);
    });

  return job;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/jobs") {
    json(res, 200, [...jobs.values()].map(({ id, name, status, createdAt, finishedAt }) => ({
      id,
      name,
      status,
      createdAt,
      finishedAt,
    })));
    return;
  }

  const jobMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (req.method === "GET" && jobMatch) {
    const job = jobs.get(jobMatch[1]);
    if (!job) return json(res, 404, { error: "Job not found" });
    json(res, 200, job);
    return;
  }

  if (req.method === "POST" && pathname === "/api/deploy") {
    const body = await readJson(req);
    const job = createJob("Full deploy", (currentJob) => fullDeploy(currentJob, body));
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/scale") {
    const body = await readJson(req);
    const job = createJob(`Scale API to ${body.replicas || 1}`, (currentJob) =>
      scaleApi(currentJob, String(body.replicas || 1)),
    );
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/cleanup") {
    const job = createJob("Cleanup Kubernetes resources", cleanup);
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/check") {
    const job = createJob("Check API endpoints", checkApi);
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/port-forward") {
    const job = createJob("Start API port-forward", (currentJob) => {
      startDetached(currentJob, "powershell", [
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `$env:NO_PROXY='${noProxy}'; kubectl port-forward svc/langbang-api 5000:80`,
      ]);
    });
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/install-locust") {
    const job = createJob("Install Locust requirements", (currentJob) =>
      runProcess(currentJob, "python", ["-m", "pip", "install", "-r", "load-tests/requirements.txt"]),
    );
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/import-data") {
    const body = await readJson(req);
    const job = createJob("Import JSON data", (currentJob) => importApiData(currentJob, body));
    json(res, 202, { jobId: job.id });
    return;
  }

  if (req.method === "POST" && pathname === "/api/start-locust") {
    const job = createJob("Start Locust UI", (currentJob) => {
      startDetached(currentJob, "powershell", [
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "python -m locust -f load-tests/locustfile.py --host=http://localhost:5000",
      ]);
      append(currentJob, "Open http://localhost:8089");
    });
    json(res, 202, { jobId: job.id });
    return;
  }

  json(res, 404, { error: "Unknown API endpoint" });
}

async function serveStatic(res, pathname) {
  const file = pathname === "/" ? "index.html" : pathname.slice(1);
  const fullPath = resolve(publicRoot, file);
  if (!fullPath.startsWith(publicRoot)) {
    json(res, 403, { error: "Forbidden" });
    return;
  }

  try {
    const body = await readFile(fullPath);
    const contentType =
      fullPath.endsWith(".css")
        ? "text/css; charset=utf-8"
        : fullPath.endsWith(".js")
          ? "text/javascript; charset=utf-8"
          : "text/html; charset=utf-8";
    res.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
    res.end(body);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
    } else {
      await serveStatic(res, url.pathname);
    }
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`LangBang Lab 4 web setup: http://localhost:${port}`);
});
