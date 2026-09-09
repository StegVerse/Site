# HIL Public Activation Projection Mirror Handoff

Updated: 2026-09-08
Repository: `StegVerse-Labs/Site`
Issue: `#1117`
Parent task: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
Parent COSV: `50000000105000`
Canonical Site HIL handoff: `docs/HIL_SITE_MIRROR_HANDOFF.md`

## Incident

A physical iPhone opened `https://stegverse.org/stegos-bootstrap/hil-activate.html` and received a GitHub Pages `404 File not found` response. The merged StegOS same-device HIL activation source had not been projected into Site.

## Repair

This lane projects the HIL activation surface into the actual `stegverse.org` GitHub Pages source tree:

- `stegos-bootstrap/hil-activate.html`
- `stegos-bootstrap/workercoordinator-portable-hil.json`
- `stegos-bootstrap/hil-portable-state-bridge.js`
- `stegos-bootstrap/hil-portable-native-bridge.js`

The existing Site service worker remains the only service worker. `stegos-bootstrap/service-worker.js` continues to load the released v13 runtime, then loads the package-aware HIL state bridge and HIL activation bridge. The established `stegos-web-bootstrap-v15` cache contract is preserved; the changed service-worker source bytes trigger browser update/install, and the HIL bridge install listener adds the exact HIL package to the existing cache.

The HIL package remains bound to the canonical `.github` WorkerCoordinator package and StegOS native receiver source. The browser does not accept caller-supplied HIL claim/fence values and does not create a second WorkerCoordinator.

The current-iPhone projection validator admits the exact HIL-aware v15 service-worker successor blob `34900418f5b8c7225936a89ef541b82bc496a969` while retaining all prior exact successor blobs. The branch is bounded by the active pre-work claim `SITE-HIL-PUBLIC-ACTIVATION-PROJECTION-1117-20260908` in `data/session-work-claims.d/site-hil-public-activation-projection-1117.json`.

## Runtime boundary

Publication of this Site path, Site CI, GitHub Pages deployment, browser page load, or a portable checkout does not satisfy `PRED-RESIDENT-REQUEST-CONSUMED-HIL-SOVEREIGN-RECEIVER-002`.

Physical iPhone execution must still produce native HIL materialization/intake evidence, and canonical `.github` must still bind qualifying evidence into resident request consumption before that predicate is satisfied.

## Completion target

1. Site source validation passes on the exact PR head.
2. PR merges without stale-base conflict.
3. GitHub Pages/public deployment makes `https://stegverse.org/stegos-bootstrap/hil-activate.html` return the HIL activation page instead of 404.
4. Only after public availability is observed should the user be asked to open the page and tap `Activate HIL on this iPhone`.
