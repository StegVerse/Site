# HIL Browser ESRL LEASE_OPEN Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Issue: `#1156`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
Canonical continuation: `StegVerse-Labs/.github/docs/HIL_RESIDENT_SESSION_MANIFOLD_ACTIVATION_MIRROR_HANDOFF.md`
Current parent COSV: `50000000103000`

## Purpose

Project and repair a current-iPhone browser successor for the already-implemented same-device HIL ESRL local lease transition. The successor is intentionally separate from the accepted G25 browser request-consumption path.

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

## Physical observation and repair

After Site PR `#1159` merged, the same standalone-Safari G25 context reached the public ESRL page with the exact retained browser context, node, and G25 fence. Pressing **Open ESRL lease** failed closed with:

```text
FAIL_CLOSED: canonical checkout receipt hash required
```

This is authentic physical evidence of a source-envelope compatibility defect, not evidence of checkout loss. Inspection established two exact shape mismatches between the already-accepted G25 activation-result envelope and the initial ESRL successor:

1. `hil-browser-receiver.js` wrote `canonical_checkout_receipt_sha256` into the retained checkout-binding and execution receipts, but omitted it from the final `stegos.hil_browser_receiver_activation_result/v1` object stored by `hil-activate.html`.
2. the authentic G25 `execution_entry_sha256` is a raw 64-hex digest, while the initial ESRL successor incorrectly required a `sha256:` URI for that field. The canonical `.github` ESRL intake intentionally compares the raw execution-entry digest exactly to the accepted G25 request-consumption receipt.

The repair preserves the physical G25 state instead of asking the user to reset or replace it:

- historical same-context G25 activation results may omit `canonical_checkout_receipt_sha256`;
- the ESRL route derives that missing value only from the retained portable WorkerCoordinator state's exact `last_checkout_receipt.receipt_sha256` after task, claim, fence, checkout-count, state-tail, execution-surface, and credential-boundary validation;
- if the source result already contains a checkout hash, any mismatch still fails closed;
- the retained checkout hash itself must remain a canonical `sha256:` URI;
- raw 64-hex `execution_entry_sha256` is accepted and carried unchanged into `source_execution_entry_sha256` for exact `.github` intake parity;
- future `HIL_BROWSER_EVIDENCE_V16` activation results now include `canonical_checkout_receipt_sha256` directly.

No second checkout, second claim/fence, browser-state reset, synthetic receipt hash, or transformed execution digest is introduced.

## Source surfaces

- `stegos-bootstrap/hil-browser-receiver.js`
- `stegos-bootstrap/hil-browser-esrl-lease.js`
- `stegos-bootstrap/hil-esrl-activate.html`
- `stegos-bootstrap/service-worker.js`
- `tests/test_hil_browser_esrl_lease.py`
- `data/session-work-claims.d/site-hil-browser-esrl-lease-1156.json`
- `data/session-work-claims.d/site-hil-esrl-checkout-hash-repair-1156.json`
- `data/session-work-claims.d/site-hil-esrl-auto-resume-1156.json`
- `data/session-work-claims.d/site-hil-esrl-stale-navigation-1156.json`

The existing `HIL_BROWSER_EVIDENCE_V16` receiver is not repurposed. The ESRL route remains:

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
- exact execution-entry SHA256 in the authentic G25 raw-digest form;
- exactly one retained HIL checkout in the portable WorkerCoordinator state;
- exact retained claim/fence and checkout-tail parity;
- valid retained canonical checkout receipt SHA256;
- exact equality with a source-provided checkout hash when one is present;
- `CURRENT_USER_IPHONE`, `TV/TVC`, and GitHub runtime authority `NONE` boundaries.

The lease ID is deterministically derived from the exact bound inputs. No caller chooses it.

## Automatic same-context continuation

To eliminate avoidable manual interaction, `hil-esrl-activate.html` now automatically attempts the ESRL route on page load whenever the exact retained G25 source result is present and there is not already a valid retained ESRL result for that same context/node/claim/fence. A single in-flight guard prevents duplicate concurrent attempts.

A successful exact `LEASE_OPEN` result is persisted under `stegos-hil-esrl-last-success-v1` and restored on later page loads only after the same source-binding checks pass. A stale or mismatched retained ESRL result is deleted instead of reused. The **Retry ESRL lease** button remains as a manual fallback, but opening/reloading the page is sufficient to initiate the repaired lease attempt.

Automatic continuation does not auto-download evidence because iOS Safari may block unsolicited downloads. Exact JSON copy/download remains available after successful lease observation.

## Stale standalone-Safari page convergence repair

A later physical observation on the same retained G25 context showed a distinct propagation/convergence defect: the page still rendered the older **Open ESRL lease** control and `No ESRL evidence yet.` state, while current repository source already contained the automatic-resume page. On that stale page, the current service worker and evidence did not appear until the button was tapped.

The source-level cause is the generic cache-first navigation behavior inherited from `service-worker-v13-runtime.js`: an already-controlled Safari client may continue receiving the previously cached ESRL HTML even after the repository page advances. Because the older ESRL page is itself the code that registers/updates the current worker only when its button path executes, this can make the manual click act as an accidental code-convergence trigger.

The repair stays inside the existing v16 wrapper rather than advancing the HIL protocol or creating a replacement runtime:

- `CACHE_NAME` remains `stegos-web-bootstrap-v16`, preserving all existing validators and the admitted `HIL_BROWSER_EVIDENCE_V16` protocol contract;
- `./hil-esrl-activate.html` is now explicitly added to the wrapper shell so the predecessor install handler refreshes the exact current ESRL bytes when the wrapper updates;
- the wrapper continues `skipWaiting()` and `clients.claim()`;
- after activation, it enumerates same-origin window clients and re-navigates only an already-open `/stegos-bootstrap/hil-esrl-activate.html` client;
- that one-time activation re-navigation causes the refreshed cached page to load, where the already-merged auto-resume logic runs immediately;
- IndexedDB, localStorage, portable WorkerCoordinator state, G25 claim/fence lineage, and retained evidence are not reset or deleted.

This repair removes the lease button as the mechanism required to obtain current page/worker code. The button remains a retry fallback after convergence.

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

`hil-esrl-activate.html` reads only the existing same-context `stegos-hil-last-success-v1` result and refuses to continue without it. It exposes copy/download of the exact returned `stegverse.hil-browser-esrl-lease-open/v1` JSON and persistently restores only an exact same-context successful result.

Source, CI, merge, service-worker installation, page load, automatic retry, cache convergence, or deployment do **not** satisfy the parent blocker `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED`.

The blocker may be discharged only after:

1. this continuation and convergence behavior is merged and publicly propagated;
2. the same standalone-Safari context executes the ESRL route without clearing site data;
3. the exact component-produced JSON is exported;
4. the canonical `.github` fail-closed ESRL intake accepts that artifact;
5. canonical worker/task/COSV state is reconciled from the accepted evidence.

## README maintenance

`README.md` was re-reviewed against the stale-navigation repair. It already states that the current service-worker propagation generation is `stegos-web-bootstrap-v16`, that the v16 wrapper imports the released v13 runtime plus the HIL portable bridges, and that the HIL activation surface uses `HIL_BROWSER_EVIDENCE_V16`. Those statements remain accurate because this repair intentionally keeps v16 and changes only which ESRL page is pre-cached/re-navigated during wrapper convergence. No README prose change is required for accuracy at this stage.

## Remaining parent blockers

Until authentic ESRL evidence is accepted, the parent remains at exactly three blockers:

1. `AUTHENTIC_ESRL_HIL_LEASE_OPEN_NOT_YET_OBSERVED`
2. `POST_RESTART_EXACT_BYTE_PROOF_NOT_YET_PRESERVED`
3. `TVC_HIL_LIFECYCLE_HANDOFF_NOT_YET_PROVEN`

No parent COSV change is made by source repair, automatic page continuation, or cache convergence alone.
