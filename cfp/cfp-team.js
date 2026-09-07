// cfp/cfp-team.js
// Current-season CFP team status. Historical/prototype files are not fallback sources.

const CFP_DATA_URL = window.CFP_DATA_URL || "/data/cfp-data.json";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

async function loadCurrentData() {
  const response = await fetch(`${CFP_DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function renderUnavailable(data, requested, reason) {
  setText("team-title", "Current CFP team status unavailable");
  setText(
    "team-meta",
    `Season ${data?.season || "?"} • ${data?.phase || "UNKNOWN"}. ${reason}`
  );
  setText(
    "team-snapshot",
    requested
      ? `No current CFP committee ranking is available for “${requested}”.`
      : "No team identifier was supplied and no current CFP ranking can be inferred."
  );
  setText(
    "team-notes",
    "Supporting polls, historical snapshots, and prototype projections are intentionally not used as current CFP evidence."
  );
}

function findTeam(rankings, requested) {
  if (!requested) return null;
  const normalizedRequested = normalize(requested);
  return rankings.find((team) => normalize(team.team) === normalizedRequested) ||
    rankings.find((team) => String(team.seed) === String(requested));
}

function renderTeam(team, data) {
  setText("team-title", `${team.team} — Current CFP Status`);
  setText(
    "team-meta",
    `Season ${data.season} • ${data.phase} • CFP committee rank/seed #${team.seed ?? "—"}`
  );
  setText(
    "team-snapshot",
    `Record: ${team.record || "—"} • Conference: ${team.conference || "—"} • Status: ${team.status || "—"}`
  );

  const scenarioNotes = Array.isArray(team.spot_scenarios)
    ? team.spot_scenarios.map((scenario) => `${scenario.team || team.team}: ${scenario.path || ""}`).filter(Boolean)
    : [];
  const notes = [team.lock_reason, ...scenarioNotes].filter(Boolean);
  setText(
    "team-notes",
    notes.length ? notes.join(" | ") : "No evidence-bounded CFP scenario notes are available for this team."
  );
}

async function initTeamPage() {
  const requested = getQueryParam("team");
  try {
    const data = await loadCurrentData();
    if (!data || data.schema_version !== "2.0.0") {
      renderUnavailable(data, requested, "The current CFP data contract is unavailable.");
      return;
    }
    const rankings = Array.isArray(data.rankings) ? data.rankings : [];
    if (data.phase === "PRE_CFP_RANKINGS" || rankings.length === 0) {
      renderUnavailable(data, requested, "Current-season CFP committee rankings have not been published or observed yet.");
      return;
    }
    const team = findTeam(rankings, requested);
    if (!team) {
      renderUnavailable(data, requested, "The requested team is not in the observed current CFP ranking set.");
      return;
    }
    renderTeam(team, data);
  } catch (error) {
    console.error(error);
    renderUnavailable(null, requested, "Current-season CFP data could not be loaded; stale data was not substituted.");
  }
}

document.addEventListener("DOMContentLoaded", initTeamPage);
