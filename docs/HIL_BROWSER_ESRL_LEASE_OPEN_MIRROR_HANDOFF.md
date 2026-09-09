# HIL Browser ESRL LEASE_OPEN Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Issue: `#1156`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
Canonical continuation: `StegVerse-Labs/.github/docs/HIL_RESIDENT_SESSION_MANIFOLD_ACTIVATION_MIRROR_HANDOFF.md`
Current parent COSV: `50000000103000`

## Purpose

Project a current-iPhone browser successor for the already-implemented same-device HIL ESRL local lease transition. The successor is intentionally separate from the accepted G25 browser request-consumption path.

Accepted upstream physical state remains:

```text
HIL_BROWSER_EVIDENCE_V16
-> BROWSER_HIL_LOCAL_READY_OBSERVED
-> exact current-iPhone browser context
-> retained canonical HIL checkout G25
-> journal replay PASS
-> canonical .github request-consumption receipt SATISFIED
```

This work adds the next independent evidence surface:

```text
same stored local-ready result
+ exact retained checkout lineage
+ same browser context/node
+ exact request id/hash
+ journal replay PASS
-> browser ESRL state machine
-> REQUESTED
-> ADMITTED
-> PROVISIONING
-> LOCAL_READY
-> LEASE_OPEN
-> stegverse.hil-browser-esrl-lease-open/v1
```

## Source surfaces

- `stegos-bootstrap/hil-browser-esrl-lease.js`
- `stegos-bootstrap/hil-esrl-activate.html`
- `stegos-bootstrap/service-worker.js`
- `tests/test_hil_browser_esrl_lease.py`
- `data/session-work-claims.d/site-hil-browser-esrl-lease-1156.json`

The existing `HIL_BROWSER_EVIDENCE_V16` receiver is not repurposed. The new service-worker route is:

`/stegos-bootstrap/portable-workercoordinator/hil-esrl-v1`

Protocol:

`HIL_BROWSER_ESRL_V1`

## Fail-closed binding

The ESRL route requires all of the following from the same physical browser context:

- source schema `stegos.hil_browser_receiver_activation_result/v1`;
- source state `BROWSER_HIL_LOCAL_READY_OBSERVED`;
- exact `HIL_BROWSER_EVIDENCE_V16` source protocol;
- exact canonical task/request ID and request SHA256;
- browser-context and node identity;
- existing claim/fence above G24;
- journal replay `PASS`;
- canonical checkout receipt SHA256 and execution-entry SHA256;
- exactly one retained HIL checkout in the portable WorkerCoordinator state;
- exact retained claim/fence and checkout hash parity;
- `CURRENT_USER_IPHONE`, `TV/TVC`, and GitHub runtime authority `NONE` boundaries.

The lease ID is deterministically derived from the exact bound inputs. No caller chooses it.

## Explicit non-claims

The source output keeps these independent states false:

```text
public_https_rendezvous_observed=false
second_claim_minted=false
request_consumption_claimed=false
custody_observed=false
post_restart_exact_byte_proof_observed=false
tvc_lifecycle_receipt_observed=false
broader_hil_lifecycle_complete=false
```

Public HTTPS observation remains downstream optional for routine local lease opening.

## Evidence/export boundary

`hil-esrl-activate.html` reads only the existing same-context `stegos-hil-last-success-v1` result and refuses to continue without it. It exposes copy/download of the exact returned `stegverse.hil-browser-esrl-lease-open/v1` JSON.

Source, CI, merge, service-worker installation, page load, or deployment do **not** satisfy the parent blocker `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED`.

The blocker may be discharged only after:

1. this source is merged and publicly propagated;
2. the same standalone-Safari context executes the ESRL route;
3. the exact component-produced JSON is exported;
4. the canonical `.github` fail-closed ESRL intake accepts that artifact;
5. canonical worker/task/COSV state is reconciled from the accepted evidence.

## README maintenance

`README.md` was reviewed against this change. Its current v16 same-device operational-card description remains accurate because the accepted v16 request-consumption protocol and cache generation are unchanged, and the new ESRL surface is a separate post-local-ready evidence continuation rather than a replacement of that documented path. No README prose change is required on this branch unless validation identifies an inaccurate statement.

## Remaining parent blockers

Until authentic ESRL evidence is accepted, the parent remains at exactly three blockers:

1. `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED`
2. `POST_RESTART_EXACT_BYTE_PROOF_NOT_YET_PRESERVED`
3. `TVC_HIL_LIFECYCLE_HANDOFF_NOT_YET_PROVEN`

No parent COSV change is made by source implementation alone.
