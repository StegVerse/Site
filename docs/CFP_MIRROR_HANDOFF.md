# CFP Live Tracker Mirror Handoff

## Source of truth

This file is the bounded continuation record for the College Football Playoff / NCAAF current-season tracker lane in `StegVerse-Labs/Site`.

Repository-wide authority remains `docs/SITE_MIRROR_HANDOFF.md`. This handoff grants no execution, publication, activation, licensing, affiliation, wagering, ticketing, sports-officiating, or external-data authority.

## Goal

Restore the existing `/cfp/` surface into a current-season, self-describing college-football tracker that reliably renders current games and separately labeled supporting polls while refusing to present historical CFP rankings as current.

## Canonical ownership and preflight

Branch: `goal/cfp-live-2026-revival`

Pull request: `#1060`

Machine-readable claim: `data/session-work-claims.d/site-cfp-live-2026-revival-20260906.json`

Preflight record: `data/preflight/cfp-live-2026-revival-20260906.json`

The branch initially failed Site handoff orchestration because no exact active pre-work claim existed. The collision-safe claim above was installed before functional mutation. After that repair, the applicable repository preflight passed on the claimed branch:

- Site Handoff Orchestrator: PASS
- Ecosystem Heartbeat Orchestration: PASS, including exclusive pre-work claim and repository workload reconciliation
- Site Bootstrap Validate / no non-TV/TVC credential authority: PASS

Master Records remains owned by `master-records/orchestration`; CFP creates no new custody/reconstruction lane. HIL, coherent-transition threshold, heartbeat, SV001, InTr, TV/TVC, LLM-adapter, Master Records, and resident-runtime ownership surfaces are excluded from this claim.

## README completeness predicate

The preflight determined `README_UPDATE_REQUIRED` because this change materially changes ingestion behavior, current-vs-historical data semantics, freshness/failure behavior, and capability meaning.

Updated in the same functional change set:

- `README.md`
- `cfp/README_CFP.md`
- `data/README-cfp-source.md`

A no-README-change determination is not used.

## Implemented current-season contract

Canonical live projection: `data/cfp-data.json`, schema `2.0.0`.

Required semantics:

- `season` is the current UTC season year.
- `phase` explicitly distinguishes `PRE_CFP_RANKINGS`, `CFP_RANKINGS`, `SELECTION`, and `PLAYOFF`.
- `PRE_CFP_RANKINGS` requires an empty CFP `rankings` array.
- AP/NCAA-derived/supporting polls are never promoted into CFP committee rankings.
- Historical rankings are never carried forward to keep the table populated.
- `last_updated` is projection-generation time, not evidence that every upstream source changed then.
- degraded/source-error state is explicit.
- the retained 2025 lane is historical reference only and is excluded from current rankings.

The stale September-2026 file that contained the December-2025 final CFP ranking has been replaced by a fail-closed 2026 seed state.

## Canonical ingestion and evidence

Canonical ingestion script: `scripts/fetch_cfp_data.py`

Freshness validator: `scripts/check_cfp_data_freshness.py`

Scheduled/manual carrier: `.github/workflows/cfp_ingest.yml`

Current supporting-source route:

- College Football Playoff site remains the CFP authority reference.
- credential-free `henrygd/ncaa-api` provides NCAA-derived FBS scoreboard and AP poll JSON as supporting data.
- the JSON endpoint and NCAA origin are both identified in the data contract.
- supporting data grants no CFP committee authority.

The original ESPN site-API attempt was rejected by the GitHub runner with HTTP 403 for both scoreboard and polls. The canonical source was replaced rather than allowing the workflow to report a healthy live tracker with no data.

The strengthened live-source CI execution subsequently observed:

```text
CFP_INGESTION=PASS season=2026 phase=PRE_CFP_RANKINGS games=99 polls=1 rankings=0
CFP_DATA_FRESHNESS=PASS
supporting_source_observed=true
```

This proves that the CI execution consumed current-season supporting data. It does not by itself prove merged deployment or public Site behavior.

## UI changes

`cfp/cfp.html` and `cfp/cfp.js` now:

- identify the page as a current-season tracker rather than claiming an always-live CFP Top 12;
- state when current CFP committee rankings are not yet published/observed;
- suppress playoff scenarios before current CFP ranking evidence exists;
- keep supporting polls separately labeled;
- display source and degraded-state information;
- distinguish an empty current event set from source failure;
- never substitute stale rankings after a load/fetch failure.

`cfp/bracket.html`, `cfp/bracket.js`, `js/cfp-data.js`, and `js/cfp-team-page.js` now fail closed against the schema `2.0.0` current-season contract. Before current committee rankings exist, bracket/team surfaces do not substitute 2025 rankings, supporting polls, projected seeds, or historical movement as current CFP state.

## Duplicate implementation inventory

Historical/experimental CFP writers remain in the repository, including examples under `cfp/`, `scripts/`, `tools/`, and `ingest/`. Search still identifies legacy files such as:

- `cfp/cfp_ingest.py`
- `scripts/cfp_fetch.py`
- `scripts/cfp_ingest_standings_polls.py`
- `scripts/cfp_scrape.py`
- `scripts/ingest_sports.py`
- `scripts/update_cfp_data.mjs`
- `tools/cfp/update_cfp_data.py`
- `ingest/universal_ingest.py`
- `ingest/ingest_config.yml`

No second active CFP workflow was observed in the current `.github/workflows/` inventory; the earlier `cfp_ingest_standings_polls.yml` path is already removed/disabled from the active workflow surface. These legacy scripts therefore remain inert implementation debt rather than parallel execution authority. They must not be reactivated as competing writers; later cleanup may delete or redirect them under a separately admitted claim if desired.

## Current integration blocker — 2026-09-07

Exact validated feature head before this handoff update:

```text
447af85d169afddad973af07bee77a11107d82ec
```

Observed state:

```text
PR #1060: OPEN
mergeable: false
exact-head checks: no failure observed; applicable validation and Cloudflare build checks completed successfully
current main: be46e2ae367783741b0ee7786a82f2f3c15eaebe
compare status: diverged
feature ahead_by: 30
feature behind_by: 299
merge base: 43ce410ce7eb7b868b18c3c35cf8ec8325c497b8
```

This is a branch/base divergence blocker, not evidence that the CFP implementation failed validation. Do not force-merge, force-move the branch, or discard the 299 intervening main-branch commits merely to satisfy mergeability.

Recovery must preserve the current CFP change set while reconciling it onto current `main` through an admitted collision-safe integration path. After reconciliation, rerun the complete applicable checks at the new exact head before merge. If repository orchestration requires a successor branch/claim, create that claim and preflight before functional mutation; do not silently transfer ownership.

## Remaining machine-executable work

Destination `StegVerse-Labs/Site`:

1. Reconcile the CFP change set with current `main` without force-moving or bypassing repository ownership controls.
2. Re-run the complete applicable PR checks at the reconciled final head.
3. Confirm bracket/team surfaces remain schema-2.0-safe after reconciliation.
4. Merge only after current-head validation passes and the PR/successor remains collision-free and mergeable.
5. Execute the canonical main-branch ingestion after merge so `data/cfp-data.json` contains observed current supporting data rather than only the safe seed state.
6. Verify deployed/public `/cfp/` behavior separately before describing the tracker as live.
7. Official current-season CFP committee ranking ingestion remains intentionally unimplemented until an authoritative current-season source can be observed; until then `PRE_CFP_RANKINGS` is correct.
8. Optional conference-standings ingestion remains future work after a suitable current source and contract are selected.

Potential later integrations only after verified Site behavior:

- `GCAT-BCAT-Engine/Publisher` if this sports lane becomes a governed publication source;
- `StegVerse-Labs/admissibility-wiki` only if sports-data provenance/admissibility semantics become relevant;
- `StegVerse-002/stegguardian-wiki` only if guardian-policy semantics are introduced.

No downstream integration is activated by this handoff.

## Completion predicate

This goal is complete only when:

- current-season game/supporting-poll ingestion is machine-observed;
- stale 2025 data cannot masquerade as current 2026 data;
- official CFP ranking availability is represented accurately;
- the canonical workflow and validators pass at the final reconciled change head;
- the primary UI and dependent bracket/team surfaces degrade safely;
- repository validation passes;
- merged main-branch ingestion materializes current data;
- deployed/public behavior is observed;
- this handoff contains the final merge/public evidence.
