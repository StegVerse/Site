# HIL Browser ESRL LEASE_OPEN Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Issue: `#1156`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
Canonical continuation: `StegVerse-Labs/.github/docs/HIL_RESIDENT_SESSION_MANIFOLD_ACTIVATION_MIRROR_HANDOFF.md`
Current parent COSV: `50000000103000`

## Purpose

Carry the already-accepted current-iPhone G25 HIL browser state into the next independent ESRL `LEASE_OPEN` observation without minting another claim/fence or resetting the retained standalone-Safari context.

Accepted upstream physical state remains:

```text
HIL_BROWSER_EVIDENCE_V16
-> BROWSER_HIL_LOCAL_READY_OBSERVED
-> current-iPhone standalone Safari
-> exact retained browser context/node
-> retained canonical HIL checkout G25
-> journal replay PASS
-> canonical .github request-consumption receipt SATISFIED
```

The ESRL successor remains:

```text
same stored local-ready result
+ exact retained checkout lineage
+ same browser context/node
+ exact request id/hash
+ journal replay PASS
-> REQUESTED
-> ADMITTED
-> PROVISIONING
-> LOCAL_READY
-> LEASE_OPEN
-> stegverse.hil-browser-esrl-lease-open/v1
```

Route: `/stegos-bootstrap/portable-workercoordinator/hil-esrl-v1`  
Protocol: `HIL_BROWSER_ESRL_V1`

## Completed source repairs

### Checkout-hash / digest compatibility

The first authentic physical ESRL attempt retained browser context `ctx_d151139d2db1eeecb6512f5844058246`, node `stegnode-web-f24e3bfb7f5343cb37323187a88e51f3`, and fence `G25`, but failed closed with `canonical checkout receipt hash required`.

Investigation established that the already-accepted G25 activation-result envelope omitted `canonical_checkout_receipt_sha256` and carried its authentic `execution_entry_sha256` as raw 64-hex. Site PR `#1165`, merged at `7a72c94b3e4fc246424975d97729c4f2220fbef0`, repaired that compatibility boundary by deriving a missing checkout hash only from the exact retained portable WorkerCoordinator state after task/claim/fence/checkout-count/tail validation, preserving the raw execution digest, and including the checkout hash directly in future activation results. No replacement G25 checkout or claim/fence was created.

### Automatic same-context continuation

Site PR `#1169`, merged at `9751d100250c5a3905a363e08c9d9bed47d54ff7`, made `hil-esrl-activate.html` automatically invoke the ESRL route on page load when the exact retained G25 source state is present and there is no valid same-context retained ESRL result. It persists only an exact `LEASE_OPEN` result under `stegos-hil-esrl-last-success-v1`, removes stale/mismatched retained ESRL evidence, and retains manual retry/copy/download only as fallbacks.

### Stale standalone-Safari navigation convergence

A later authentic current-iPhone observation showed that standalone Safari could still display the older **Open ESRL lease** page with `No ESRL evidence yet.` until the button was tapped, even though repository source already contained the automatic-resume page. This identified a distinct service-worker/page convergence defect rather than loss of G25 state.

The source cause was the inherited cache-first navigation path: an already-controlled Safari client could continue receiving the older cached ESRL HTML. The stale page's button could therefore become an accidental trigger for obtaining the current worker/page generation.

Site PR `#1173` repaired that defect and is **MERGED** at `61865d7649fc39669caa39008568764f8b7c45b4`.

The repair:

- retains `CACHE_NAME = "stegos-web-bootstrap-v16"` and the admitted `HIL_BROWSER_EVIDENCE_V16` contract;
- explicitly adds `./hil-esrl-activate.html` to the existing wrapper shell so the predecessor install path refreshes the current ESRL bytes;
- preserves `skipWaiting()` and `clients.claim()`;
- after activation, enumerates same-origin window clients and re-navigates only an already-open `/stegos-bootstrap/hil-esrl-activate.html` client;
- allows the refreshed page's already-merged auto-resume logic to execute without the stale button serving as the convergence mechanism;
- does not delete IndexedDB, localStorage, portable WorkerCoordinator state, retained evidence, or G25 claim/fence lineage.

Exact-head PR validation passed before merge:

- `Validate StegOS Persistent Card UX` run `34364465283` — SUCCESS;
- `No Required Third-Party Runtime` run `34364465495` — SUCCESS;
- `Site Handoff Orchestrator` run `34364465573` — SUCCESS;
- `Ecosystem Heartbeat Orchestration` run `34364465326` — SUCCESS;
- `Site Bootstrap Validate - No Non-TV/TVC Credential Authority` run `34364465667` — SUCCESS.

Post-merge push validation on merge SHA also includes `Validate StegOS Persistent Card UX` run `34364653678` — SUCCESS and `No Required Third-Party Runtime` run `34364653358` — SUCCESS.

The initial PR validation failures were repaired rather than bypassed: the merged auto-resume claim was terminalized from stale `CLAIMED` to `RELEASED`, eliminating the dependency-surface collision, and the exact new service-worker Git blob `a27fb3d98f32924452da9b19921b9824d3d2a7c3` was added to the projection validator's explicit successor allowlist.

## Current evidence boundary

Repository source merge and CI are now complete for the stale-navigation remediation. Public current-iPhone propagation of the new page/worker bytes is still a separate physical observation. The current execution environment could not independently resolve `stegverse.org`, so that tool limitation is not used as evidence either for or against public propagation.

The stale-navigation claim therefore remains active until current public bytes are physically observed in the retained standalone-Safari context. Do not clear Safari/site data and do not create a replacement G25 claim/fence.

Expected public behavior after convergence:

```text
current ESRL page loads
-> button label is Retry ESRL lease (fallback only)
-> retained exact G25 source is restored
-> ESRL attempt begins automatically
-> if successful: exact LEASE_OPEN JSON appears
-> Copy evidence JSON / Download evidence JSON become enabled
```

Copy/download remains user-mediated because iOS Safari can block unsolicited file export. The lease itself must not depend on that export gesture.

## Fail-closed binding

The ESRL route still requires the exact source schema/state/protocol, canonical task/request identity and request hash, browser context and node, G25 claim/fence, journal replay `PASS`, authentic source execution digest, exactly one retained checkout, checkout-tail parity, valid checkout receipt hash, `CURRENT_USER_IPHONE`, `TV/TVC`, and GitHub runtime authority `NONE`.

A missing or mismatched source field fails closed. A historical source that omitted the checkout hash may recover it only from the exact retained checkout after the full lineage checks. No caller chooses the deterministic lease ID.

## Explicit non-claims

Source, CI, merge, service-worker installation, page load, automatic retry, cache convergence, or repository validation do not establish authentic ESRL runtime success.

The source output keeps independent downstream predicates false until separately observed:

```text
public_https_rendezvous_observed=false
second_claim_minted=false
request_consumption_claimed=false
custody_observed=false
post_restart_exact_byte_proof_observed=false
tvc_lifecycle_receipt_observed=false
broader_hil_lifecycle_complete=false
```

The parent blocker `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED` is discharged only after the exact physical component-produced `stegverse.hil-browser-esrl-lease-open/v1` JSON is exported and accepted by the canonical `.github` intake, followed by canonical worker/task/COSV reconciliation.

## Source surfaces

- `stegos-bootstrap/hil-browser-receiver.js`
- `stegos-bootstrap/hil-browser-esrl-lease.js`
- `stegos-bootstrap/hil-esrl-activate.html`
- `stegos-bootstrap/service-worker.js`
- `tests/test_hil_browser_esrl_lease.py`
- `scripts/check_stegos_ipod_bootstrap_projection.py`
- `data/session-work-claims.d/site-hil-browser-esrl-lease-1156.json`
- `data/session-work-claims.d/site-hil-esrl-checkout-hash-repair-1156.json`
- `data/session-work-claims.d/site-hil-esrl-auto-resume-1156.json`
- `data/session-work-claims.d/site-hil-esrl-stale-navigation-1156.json`

## README maintenance

`README.md` was re-reviewed after PR `#1173`. Its statements that the current propagation generation remains `stegos-web-bootstrap-v16`, that the wrapper imports the released v13 runtime plus HIL portable bridges, and that the HIL activation surface uses `HIL_BROWSER_EVIDENCE_V16` remain accurate. No README prose change is required for this repair.

## Remaining parent blockers

Exactly three parent evidence obligations remain until authentic runtime artifacts discharge them:

1. `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED`
2. `POST_RESTART_EXACT_BYTE_PROOF_NOT_YET_PRESERVED`
3. `TVC_HIL_LIFECYCLE_HANDOFF_NOT_YET_PROVEN`

Parent COSV remains `50000000103000`; source repair and merge alone do not change it.
