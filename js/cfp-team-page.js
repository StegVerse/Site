// js/cfp-team-page.js

import { loadCfpData, getTeamById, listTeamsByRank, getTeamDisplayId } from './cfp-data.js';

function getTeamIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('team') || '';
}

function root() {
  return document.getElementById('team-root');
}

function renderCurrentUnavailable(data, message) {
  const target = root();
  if (!target) return;

  const season = data?.season || new Date().getUTCFullYear();
  const phase = data?.phase || 'CURRENT_STATE_UNAVAILABLE';
  const historicalPath = data?.historical_reference?.path || '/sports/ncaaf/2025/';

  target.innerHTML = `
    <header class="cfp-header cfp-header-sub">
      <div class="cfp-brand">
        <a href="/cfp/cfp.html" class="cfp-logo-link">STEGVERSE • CFP</a>
      </div>
      <nav class="cfp-nav">
        <a href="/cfp/cfp.html">Current-Season Tracker</a>
        <a href="/cfp/bracket.html">Bracket Status</a>
        <a href="${historicalPath}">2025 Archive</a>
        <a href="/providers.html">Rankings Providers</a>
      </nav>
    </header>

    <main class="cfp-main cfp-main-team">
      <section class="cfp-card cfp-card-error">
        <p class="cfp-pill">CFP ${season} • ${phase}</p>
        <h1>Current team roadmap unavailable</h1>
        <p>${message}</p>
        <p>
          Team rankings, seeds, movement, and playoff-path projections are intentionally withheld until
          current-season CFP committee rankings are observed in the canonical <code>data/cfp-data.json</code> contract.
          Supporting polls and historical 2025 rankings are not substituted.
        </p>
        <p class="cfp-nav-link"><a href="/cfp/cfp.html">Return to the current-season tracker</a></p>
        <p class="cfp-nav-link"><a href="${historicalPath}">Open the explicitly historical 2025 archive</a></p>
      </section>
    </main>
  `;
}

function renderTeamPage(data, team) {
  const target = root();
  if (!target) return;

  const teamsByRank = listTeamsByRank(data);
  const rank = team.rank ?? team.currentRank ?? team.seed ?? '—';
  const name = team.team || team.name || 'Unknown team';
  const record = team.record || '—';
  const conference = team.conference || '—';
  const status = team.status || 'Observed current-season CFP ranking';
  const evidence = team.lock_reason || team.evidence_note || 'Current-season CFP committee observation';

  target.innerHTML = `
    <header class="cfp-header cfp-header-sub">
      <div class="cfp-brand">
        <a href="/cfp/cfp.html" class="cfp-logo-link">STEGVERSE • CFP</a>
      </div>
      <nav class="cfp-nav">
        <a href="/cfp/cfp.html">Current-Season Tracker</a>
        <a href="/cfp/bracket.html">Bracket Status</a>
        <a href="/providers.html">Rankings Providers</a>
      </nav>
    </header>

    <main class="cfp-main cfp-main-team">
      <section class="cfp-section cfp-team-hero">
        <p class="cfp-pill">CFP ${data.season} • ${data.phase}</p>
        <h1>#${rank} — ${name}</h1>
        <dl class="cfp-team-meta">
          <div><dt>Conference</dt><dd>${conference}</dd></div>
          <div><dt>Record</dt><dd>${record}</dd></div>
          <div><dt>CFP rank/seed</dt><dd>${rank}</dd></div>
          <div><dt>Status</dt><dd>${status}</dd></div>
        </dl>
        <p class="cfp-body"><strong>Evidence:</strong> ${evidence}</p>
        <p class="cfp-faded">
          This page renders only fields present in the current canonical CFP ranking record. It does not infer
          movement, playoff paths, résumé claims, or schedule implications that are absent from current evidence.
        </p>
      </section>

      <section class="cfp-section cfp-other-teams">
        <h2>Other observed CFP teams</h2>
        <div class="cfp-tag-list">
          ${teamsByRank.map((item) => {
            const itemRank = item.rank ?? item.currentRank ?? item.seed ?? '—';
            const itemName = item.team || item.name || 'Unknown';
            const itemId = getTeamDisplayId(item);
            const active = itemId === getTeamDisplayId(team);
            return `<a class="cfp-tag ${active ? 'cfp-tag-active' : ''}" href="/team.html?team=${encodeURIComponent(itemId)}">#${itemRank} ${itemName}</a>`;
          }).join('')}
        </div>
      </section>
    </main>
  `;
}

async function initTeamPage() {
  let data;
  try {
    data = await loadCfpData();
  } catch (err) {
    renderCurrentUnavailable(null, 'The current CFP data contract could not be loaded. No historical fallback was used.');
    return;
  }

  const teams = listTeamsByRank(data);
  if (data.phase === 'PRE_CFP_RANKINGS' || teams.length === 0) {
    renderCurrentUnavailable(
      data,
      'No current-season CFP committee rankings are published or observed yet, so no current team roadmap can be presented.'
    );
    return;
  }

  const teamId = getTeamIdFromUrl();
  if (!teamId) {
    renderCurrentUnavailable(data, 'No current CFP team was selected. Choose a team from the current bracket/rankings surface.');
    return;
  }

  const team = getTeamById(data, teamId);
  if (!team) {
    renderCurrentUnavailable(data, `No current-season CFP ranking record matches "${teamId}".`);
    return;
  }

  renderTeamPage(data, team);
}

document.addEventListener('DOMContentLoaded', () => {
  initTeamPage().catch((err) => {
    console.error('Unexpected error rendering current CFP team page:', err);
    renderCurrentUnavailable(null, 'Unexpected current-team rendering failure. No historical fallback was used.');
  });
});
