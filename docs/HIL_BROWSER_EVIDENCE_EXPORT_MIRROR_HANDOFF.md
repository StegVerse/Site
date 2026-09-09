# HIL Browser Evidence Export Mirror Handoff

Updated: 2026-09-08
Repository: `StegVerse-Labs/Site`
Issue: `#1128`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
COSV: `50000000105000`

## Physical observation that triggered this continuation

A standalone iPhone browser context produced authentic component state `BROWSER_HIL_LOCAL_READY_OBSERVED` at fence G25. ChatGPT's in-app browser simultaneously retained a distinct WebKit storage/service-worker context and continued to fail closed on its own previously checked-out package state. These contexts must not be conflated.

A later standalone-Safari observation on the same public activation page showed `FAIL_CLOSED: HIL execution result binding mismatch`. Repository inspection established that the HTML had already advanced to exact request `RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002`, while the controlling service worker could still execute an older imported HIL receiver. The failure therefore remained fail-closed and did not invalidate the earlier G25 component observation.

Site PR `#1132` rolled the existing service-worker wrapper forward with `skipWaiting()` and `clients.claim()` while preserving IndexedDB, cache identity, and portable WorkerCoordinator state. Site PR `#1133` additionally forced the HIL activation page to register/update the same worker with `updateViaCache: "none"`, wait for a replacement controller when updated worker bytes were materialized, and send the HIL POST with `cache: "no-store"`.

A subsequent physical standalone-Safari run after that deployment still returned the generic binding mismatch. The screenshot proved that page code was current enough to use request `...-002`, but did not expose which returned binding field differed. The remaining repair therefore pins the page and receiver to explicit protocol `HIL_BROWSER_EVIDENCE_V16`, moves the service-worker-local execution route to `/stegos-bootstrap/portable-workercoordinator/hil-browser-v16`, registers `service-worker.js?hil_receiver_protocol=v16`, and requires the receiver to echo the protocol in all successful and fail-closed JSON responses. A stale pre-v16 controller cannot satisfy the new route or protocol contract. The page now reports the exact mismatched field if any binding disagreement remains.

## Exact resident request binding

The browser receiver requires and returns:

```text
hil_browser_protocol = HIL_BROWSER_EVIDENCE_V16
resident_request_id = RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002
resident_request_sha256 = 6bf940fb920f672111ba1040fd0bf9bf7016d6bf032bbcfd164a1a2347ee7038
```

The SHA is the canonical stable-json SHA256 used by `scripts/consume_hil_resident_execution_request.py` for the exact `.github` request object.

This binding does not by itself claim canonical request consumption. Browser component evidence continues to carry `request_consumption_claimed=false` until accepted by the canonical `.github` resident-consumption path.

## Browser context partition

`hil-activate.html` creates and persists a random `ctx_<32hex>` browser-context identifier in local storage and sends it into the service-worker execution request. The receiver echoes it into binding, execution, and activation-result evidence.

Safari and in-app WebKit contexts can therefore be distinguished explicitly instead of incorrectly sharing WorkerCoordinator state assumptions.

## Exact evidence portability

The activation page persists the last successful v16 activation result in the same browser context and exposes:

- `Copy evidence JSON`
- `Download evidence JSON`

The downloaded file is named `hil-browser-evidence-<context-id>.json` and contains the exact activation-result JSON returned by the same-device service worker.

## State-preservation invariant

The v16 repair is code/protocol convergence only. It deliberately does not delete IndexedDB, caches, the browser-context ID, or portable WorkerCoordinator state. The authentic retained G25 checkout may be reused only if its existing receipt/state binding still validates. No second claim/fence may be minted merely to repair browser code skew.

## Authority boundary

```text
WorkerCoordinator claim/fence authority = unchanged
InTr transition authority = unchanged
TV/TVC credential authority = unchanged
GitHub token runtime authority = NONE
request_consumption_claimed = false
source/CI/deployment/export authority effect = NONE
```

No second WorkerCoordinator, service-worker scope, claim/fence, user-operated machine, or credential path is introduced. Controller refresh and protocol pinning are code-version convergence only; they do not clear portable state or authorize a replacement checkout.

## Next continuation

After merge and public propagation, re-run the same standalone-Safari HIL context. A successful result must show `BROWSER_HIL_LOCAL_READY_OBSERVED`, `HIL_BROWSER_EVIDENCE_V16`, the exact request ID/SHA, and the same browser-context ID before the evidence buttons become enabled. Export the exact JSON and feed that exact component-produced artifact into the canonical `.github` HIL browser-evidence intake validator. Only a validated canonical consumption receipt may satisfy `PRED-RESIDENT-REQUEST-CONSUMED-HIL-SOVEREIGN-RECEIVER-002`.
