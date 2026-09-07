// cfp/bracket.js
// Current-season bracket status driven only by data/cfp-data.json.

async function loadCFPData() {
  try {
    const res = await fetch("../data/cfp-data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load current-season CFP data:", err);
    return null;
  }
}

function buildRow(team) {
  const tr = document.createElement("tr");
  const cells = [
    `#${team.seed ?? "—"}`,
    team.team || "Unknown",
    team.record || "—",
    team.conference || "—",
    team.status || "—",
    team.lock_reason || "Current-season CFP observation",
  ];
  cells.forEach((value) => {
    const td = document.createElement("td");
    td.textContent = value;
    tr.appendChild(td);
  });
  return tr;
}

async function initBracket() {
  const tbody = document.getElementById("cfp-table-body");
  const releaseNote = document.getElementById("cfp-release-note");
  if (!tbody) return;

  const data = await loadCFPData();
  if (!data || data.schema_version !== "2.0.0") {
    tbody.innerHTML = '<tr><td colspan="6">Unable to load the current CFP data contract.</td></tr>';
    if (releaseNote) releaseNote.textContent = "Current-season CFP state unavailable.";
    return;
  }

  const rankings = Array.isArray(data.rankings) ? data.rankings : [];
  if (data.phase === "PRE_CFP_RANKINGS" || rankings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No current CFP committee rankings/seeds are published or observed yet. Supporting polls are not substituted.</td></tr>';
    if (releaseNote) {
      releaseNote.textContent = `Season ${data.season} • ${data.phase}. No bracket is inferred before current CFP committee data exists.`;
    }
    return;
  }

  if (releaseNote) {
    releaseNote.textContent = `Season ${data.season} • ${data.phase} • projection generated ${data.last_updated || "unknown"}.`;
  }
  tbody.innerHTML = "";
  rankings
    .slice()
    .sort((a, b) => (a.seed || 999) - (b.seed || 999))
    .forEach((team) => tbody.appendChild(buildRow(team)));
}

document.addEventListener("DOMContentLoaded", initBracket);
