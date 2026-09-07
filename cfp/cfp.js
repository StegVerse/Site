// StegVerse CFP / NCAAF current-season public projection.

const CFP_DATA_URL = window.CFP_DATA_URL || "/data/cfp-data.json";
const CFP_TICKETS_URL = window.CFP_TICKETS_URL || "/data/cfp-tickets.json";

let ticketsConfig = null;
let sourcesIndex = {};

const elRankings = document.getElementById("cfp-rankings");
const elGames = document.getElementById("cfp-games");
const elLastUpdated = document.getElementById("cfp-last-updated");
const elStatus = document.getElementById("cfp-status");
const elRefreshBtn = document.getElementById("cfp-refresh-btn");
const elSpotDetails = document.getElementById("cfp-spot-details");
const elPolls = document.getElementById("cfp-polls");
const elConfSelect = document.getElementById("cfp-conf-select");
const elConfStandings = document.getElementById("cfp-conf-standings");
const elSources = document.getElementById("cfp-sources");
const elTop12SourceMarker = document.getElementById("cfp-top12-source-marker");
const elConfSourceMarker = document.getElementById("cfp-conf-source-marker");

function setStatus(text, error = false) {
  if (!elStatus) return;
  elStatus.textContent = text;
  elStatus.style.color = error ? "#ff8080" : "#b0ffa8";
}

function formatDateTime(iso) {
  if (!iso) return "unknown";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? String(iso) : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sourceMarker(id) {
  if (!id || !sourcesIndex[id]) return "";
  return `<sup><a href="#cfp-source-${escapeHtml(id)}" style="color:#ffcc66;">[${escapeHtml(id)}]</a></sup>`;
}

function statusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "locked") return '<span class="cfp-badge cfp-badge-locked">Locked</span>';
  if (normalized === "in_play") return '<span class="cfp-badge cfp-badge-inplay">In Play</span>';
  if (normalized === "eliminated") return '<span class="cfp-badge cfp-badge-elim">Eliminated</span>';
  return "";
}

function rankingEmptyMessage(data) {
  if (data.phase === "PRE_CFP_RANKINGS") {
    return `No current ${escapeHtml(data.season)} CFP committee rankings have been published or observed yet. AP/other polls below remain separate and are not CFP rankings.`;
  }
  const state = data.availability?.cfp_rankings || data.freshness?.rankings_state;
  if (state && state !== "PUBLISHED_CURRENT_SEASON") {
    return `Current CFP rankings unavailable: ${escapeHtml(state)}.`;
  }
  return "No current CFP rankings available.";
}

function renderRankings(rankings, sourceId, data) {
  if (!Array.isArray(rankings) || !rankings.length) {
    elRankings.innerHTML = `<p>${rankingEmptyMessage(data)}</p>`;
    if (elTop12SourceMarker) elTop12SourceMarker.innerHTML = sourceMarker(sourceId);
    return;
  }

  const rows = rankings.map((r) => `
    <tr>
      <td class="cfp-seed">#${escapeHtml(r.seed)}</td>
      <td>${escapeHtml(r.team)}</td>
      <td>${escapeHtml(r.record)}</td>
      <td>${escapeHtml(r.conference)}</td>
      <td>${statusBadge(r.status)}<div style="font-size:0.7rem;opacity:0.7;">${escapeHtml(r.lock_reason || "")}</div></td>
    </tr>`).join("");

  elRankings.innerHTML = `
    <table class="cfp-rankings-table">
      <thead><tr><th>Rank</th><th>Team</th><th>Record</th><th>Conf</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  if (elTop12SourceMarker) elTop12SourceMarker.innerHTML = sourceMarker(sourceId);
}

function renderSpotDetails(rankings, data) {
  if (data.phase === "PRE_CFP_RANKINGS") {
    elSpotDetails.innerHTML = "<p>Playoff spot scenarios are withheld until current-season CFP committee rankings are observed.</p>";
    return;
  }
  const items = (rankings || []).filter((r) => r.status !== "locked");
  if (!items.length) {
    elSpotDetails.innerHTML = "<p>No current spot-scenario data available.</p>";
    return;
  }
  elSpotDetails.innerHTML = items.map((r) => {
    const scenarios = (r.spot_scenarios || []).map((s) => `<li><strong>${escapeHtml(s.team)}:</strong> ${escapeHtml(s.path)}</li>`).join("");
    return `<div class="cfp-spot-card">
      <div class="cfp-spot-card-header"><div class="cfp-spot-card-title">Rank #${escapeHtml(r.seed)}</div><div>${statusBadge(r.status)}</div></div>
      <div><strong>Current:</strong> ${escapeHtml(r.team)}</div><ul>${scenarios}</ul>
    </div>`;
  }).join("");
}

function getTicketProfile(game) {
  if (!ticketsConfig) return null;
  const base = ticketsConfig.defaults || {};
  const confOverride = (game.conference && ticketsConfig.conferences?.[game.conference]) || {};
  const teamOverride = ticketsConfig.teams?.[game.home] || ticketsConfig.teams?.[game.away] || {};
  return {
    providers: teamOverride.providers || confOverride.providers || base.providers || [],
    patterns: {...(base.patterns || {}), ...(confOverride.patterns || {}), ...(teamOverride.patterns || {})},
  };
}

function buildTicketButtons(game) {
  const profile = getTicketProfile(game);
  if (!profile?.providers?.length) return "";
  const labels = ticketsConfig.labels || {};
  const query = encodeURIComponent(`${game.away} at ${game.home} tickets`);
  const links = profile.providers.map((key) => {
    const pattern = profile.patterns[key];
    if (!pattern) return null;
    const url = pattern.replace("{QUERY}", query);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels[key] || key)}</a>`;
  }).filter(Boolean).join(" • ");
  return links ? `<div style="margin-top:0.4rem;font-size:0.8rem;"><span>Tickets: </span>${links}<span style="margin-left:0.25rem;opacity:0.6;">(partners)</span></div>` : "";
}

function renderGames(games, availability) {
  if (!Array.isArray(games) || !games.length) {
    const state = availability?.games || "NO_CURRENT_EVENTS_OBSERVED";
    elGames.innerHTML = `<p>No current games to display (${escapeHtml(state)}).</p>`;
    return;
  }
  elGames.innerHTML = `<ul class="cfp-games-list">${games.map((g) => `
    <li class="cfp-game">
      <div class="cfp-game-header"><span>${escapeHtml(g.away)} @ ${escapeHtml(g.home)}</span><span>${g.away_score ?? "-"} – ${g.home_score ?? "-"}</span></div>
      <div class="cfp-game-meta">
        ${g.status ? `Status: ${escapeHtml(g.status)}` : ""}
        ${g.kickoff ? ` | Kickoff: ${escapeHtml(formatDateTime(g.kickoff))}` : ""}
        ${g.note ? ` | ${escapeHtml(g.note)}` : ""}
        ${buildTicketButtons(g)}
      </div>
    </li>`).join("")}</ul>`;
}

function renderPolls(polls, availability) {
  if (!Array.isArray(polls) || !polls.length) {
    elPolls.innerHTML = `<p>No current polls available (${escapeHtml(availability?.polls || "NO_CURRENT_POLLS_OBSERVED")}).</p>`;
    return;
  }
  elPolls.innerHTML = polls.map((poll) => {
    const rows = (poll.teams || []).map((team) => `<tr><td>${escapeHtml(team.rank)}</td><td>${escapeHtml(team.team)}</td><td>${escapeHtml(team.record)}</td><td>${escapeHtml(team.conference)}</td></tr>`).join("");
    return `<div class="cfp-poll-card"><div class="cfp-poll-header"><div class="cfp-poll-title">${escapeHtml(poll.name)} ${sourceMarker(poll.source_id)}</div></div>
      <table class="cfp-poll-table"><thead><tr><th>Rank</th><th>Team</th><th>Record</th><th>Conf</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join("");
}

function renderConferenceStandings(conf) {
  if (!conf) return;
  const rows = (conf.teams || []).map((team) => `<tr><td>${escapeHtml(team.team)}</td><td>${escapeHtml(team.overall)}</td><td>${escapeHtml(team.conference_record)}</td><td>${escapeHtml(team.pf)}</td><td>${escapeHtml(team.pa)}</td></tr>`).join("");
  elConfStandings.innerHTML = `<table class="cfp-conf-table"><thead><tr><th>Team</th><th>Overall</th><th>Conf</th><th>PF</th><th>PA</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderConferences(conferences, sourceId, availability) {
  if (!Array.isArray(conferences) || !conferences.length) {
    elConfSelect.innerHTML = "<option>No current data</option>";
    elConfStandings.innerHTML = `<p>Conference standings unavailable (${escapeHtml(availability?.conference_standings || "NOT_AVAILABLE")}).</p>`;
    return;
  }
  if (elConfSourceMarker) elConfSourceMarker.innerHTML = sourceMarker(sourceId);
  elConfSelect.innerHTML = conferences.map((conf) => `<option value="${escapeHtml(conf.id)}">${escapeHtml(conf.name)}</option>`).join("");
  renderConferenceStandings(conferences[0]);
  elConfSelect.onchange = () => renderConferenceStandings(conferences.find((conf) => conf.id === elConfSelect.value));
}

function renderSources(sources) {
  if (!Array.isArray(sources) || !sources.length) {
    elSources.innerHTML = "<p>No sources declared.</p>";
    return;
  }
  elSources.innerHTML = `<ul class="cfp-sources-list">${sources.map((source) => `<li id="cfp-source-${escapeHtml(source.id)}">[${escapeHtml(source.id)}] <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a> — ${escapeHtml(source.status || "UNKNOWN")}</li>`).join("")}</ul>`;
}

async function loadCfpData() {
  setStatus("Refreshing…");
  try {
    const [dataRes, ticketRes] = await Promise.all([
      fetch(`${CFP_DATA_URL}?t=${Date.now()}`),
      fetch(`${CFP_TICKETS_URL}?t=${Date.now()}`).catch(() => null),
    ]);
    if (!dataRes.ok) throw new Error(`CFP data HTTP ${dataRes.status}`);
    const data = await dataRes.json();
    ticketsConfig = ticketRes && ticketRes.ok ? await ticketRes.json() : null;

    sourcesIndex = {};
    (data.sources || []).forEach((source) => { sourcesIndex[source.id] = source; });

    renderSources(data.sources || []);
    renderRankings(data.rankings || [], data.cfp_source_id, data);
    renderSpotDetails(data.rankings || [], data);
    renderGames(data.games || [], data.availability || {});
    renderPolls(data.polls || [], data.availability || {});
    renderConferences(data.conferences || [], data.conf_source_id, data.availability || {});

    elLastUpdated.textContent = `Season ${data.season || "?"} • ${data.phase || "UNKNOWN"} • Projection generated: ${formatDateTime(data.last_updated)}`;
    const sourceErrors = Object.keys(data.freshness?.source_errors || {});
    setStatus(sourceErrors.length ? `Updated with ${sourceErrors.length} source warning(s).` : "Updated.", false);
  } catch (error) {
    console.error(error);
    setStatus("Current-season data load failed; stale rankings are not substituted.", true);
  }
}

if (elRefreshBtn) elRefreshBtn.onclick = loadCfpData;
loadCfpData();
