// js/cfp-data.js

/**
 * Load the canonical current-season CFP contract.
 * Historical 2025 data must never be promoted into the current projection.
 */
export async function loadCfpData() {
  const url = '/data/cfp-data.json';

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to load current CFP data (${res.status})`);
    }

    const data = await res.json();
    if (!data || data.schema_version !== '2.0.0' || !Array.isArray(data.rankings)) {
      throw new Error('Current CFP data does not satisfy schema 2.0.0');
    }

    return data;
  } catch (err) {
    console.error('Error loading current CFP data:', err);
    throw err;
  }
}

function rankingId(team) {
  return String(team?.id || team?.slug || team?.team || team?.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

/**
 * Find a team only within observed current-season CFP committee rankings.
 */
export function getTeamById(data, id) {
  if (!data || !Array.isArray(data.rankings)) return null;
  const safeId = String(id || '').trim().toLowerCase();
  return data.rankings.find((team) => rankingId(team) === safeId) || null;
}

/**
 * Return observed current-season CFP committee teams in rank/seed order.
 * PRE_CFP_RANKINGS therefore returns an empty list by design.
 */
export function listTeamsByRank(data) {
  if (!data || !Array.isArray(data.rankings)) return [];
  return [...data.rankings].sort((a, b) => {
    const aRank = a.rank ?? a.currentRank ?? a.seed ?? 999;
    const bRank = b.rank ?? b.currentRank ?? b.seed ?? 999;
    return aRank - bRank;
  });
}

export function getTeamDisplayId(team) {
  return rankingId(team);
}
