const deployForm = document.querySelector("#deployForm");
const databaseMode = document.querySelector("#databaseMode");
const localDbFields = document.querySelector("#localDbFields");
const neonField = document.querySelector("#neonField");
const logEl = document.querySelector("#log");
const statusEl = document.querySelector("#status");
const envRows = document.querySelector("#envRows");

document.querySelector("#addEnvBtn").addEventListener("click", () => {
  const row = document.createElement("div");
  row.className = "envRow";
  row.innerHTML = `
    <input class="envKey" placeholder="KEY" spellcheck="false" />
    <input class="envVal" placeholder="value" spellcheck="false" />
    <button type="button" class="remove" title="Remove">×</button>
  `;
  row.querySelector(".remove").addEventListener("click", () => row.remove());
  envRows.appendChild(row);
  row.querySelector(".envKey").focus();
});

function collectExtraEnv() {
  const extra = {};
  document.querySelectorAll(".envRow").forEach((row) => {
    const key = row.querySelector(".envKey").value.trim();
    const val = row.querySelector(".envVal").value;
    if (key) extra[key] = val;
  });
  return extra;
}

let pollTimer = null;

function setStatus(text, state = "") {
  statusEl.textContent = text;
  statusEl.dataset.state = state;
}

function setLog(lines) {
  logEl.textContent = lines.join("\n");
  logEl.scrollTop = logEl.scrollHeight;
}

function updateDbFields() {
  const neon = databaseMode.value === "neon";
  localDbFields.classList.toggle("hidden", neon);
  neonField.classList.toggle("hidden", !neon);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function watchJob(jobId) {
  clearInterval(pollTimer);
  setStatus("Running", "running");

  pollTimer = setInterval(async () => {
    try {
      const job = await requestJson(`/api/jobs/${jobId}`);
      setLog(job.logs || []);
      setStatus(job.status, job.status);

      if (job.status !== "running") {
        clearInterval(pollTimer);
      }
    } catch (error) {
      clearInterval(pollTimer);
      setStatus("Failed", "failed");
      setLog([error.message]);
    }
  }, 1000);
}

function formPayload(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

deployForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formPayload(deployForm);
  payload.skipBuild = deployForm.elements.skipBuild.checked;
  payload.extraEnv = collectExtraEnv();
  const result = await requestJson("/api/deploy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  watchJob(result.jobId);
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    const action = button.dataset.action;
    let body = {};

    if (action === "scale") {
      body.replicas = document.querySelector("#replicas").value || "1";
    }

    if (action === "cleanup" && !confirm("Delete Lab 4 Kubernetes resources?")) {
      return;
    }

    const result = await requestJson(`/api/${action}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    watchJob(result.jobId);
  });
});

document.querySelector("#importBtn").addEventListener("click", async () => {
  const raw = document.querySelector("#importJson").value.trim();
  if (!raw) {
    setLog(["Paste JSON data before importing."]);
    return;
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    setLog(["Invalid JSON — check the format and try again."]);
    return;
  }
  const result = await requestJson("/api/import-data", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  watchJob(result.jobId);
});

databaseMode.addEventListener("change", updateDbFields);
updateDbFields();
setLog(["Ready. Start with Full deploy or use Operations for an existing deployment."]);
