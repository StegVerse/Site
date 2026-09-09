# HIL Browser Evidence Export Mirror Handoff

Updated: 2026-09-08
Repository: `StegVerse-Labs/Site`
Issue: `#1128`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
COSV: `50000000105000`

## Physical observation that triggered this continuation

A standalone iPhone browser context produced authentic component state `BROWSER_HIL_LOCAL_READY_OBSERVED` at fence G25. ChatGPT's in-app browser simultaneously retained a distinct WebKit storage/service-worker context and continued to fail closed on its own previously checked-out package state. These contexts must not be conflated.

A later standalone-Safari observation on the same public activation page showed `FAIL_CLOSED: HIL execution result binding mismatch`. Repository inspection established that the HTML had already advanced to exact request `RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002`, while the controlling service worker could still execute an older imported HIL receiver. The failure therefore remained fail-closed and did not invalidate the earlier G25 component observation.

Site PR `#1132` rolled the existing service-worker wrapper forward with `skipWaiting()` and `clients.claim()` while preserving IndexedDB, cache identity, and portable WorkerCoordinator state. The subsequent continuation additionally forces the HIL activation page to register/update the same worker with `updateViaCache: "none"`, waits for a replacement controller when an updated worker is materialized, and sends the HIL POST with `cache: "no-store"`. This closes the imported-script/browser-controller skew that can survive a wrapper deployment.

## Exact resident request binding

The browser receiver now requires and returns:

```text
resident_request_id = RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002
resident_request_sha256 = 6bf940fb920f672111ba1040fd0bf9bf7016d6bf032bbcfd164a1a2347ee7038
```

The SHA is the canonical stable-json SHA256 used by `scripts/consume_hil_resident_execution_request.py` for the exact `.github` request object.

This binding does not by itself claim canonical request consumption. Browser component evidence continues to carry `request_consumption_claimed=false` until accepted by the canonical `.github` resident-consumption path.

## Browser context partition

`hil-activate.html` creates and persists a random `ctx_<32hex>` browser-context identifier in local storage and sends it into the service-worker execution request. The receiver echoes it into binding, execution, and activation-result evidence.

Safari and in-app WebKit contexts can therefore be distinguished explicitly instead of incorrectly sharing WorkerCoordinator state assumptions.

## Exact evidence portability

The activation page persists the last successful activation result in the same browser context and exposes:

- `Copy evidence JSON`
- `Download evidence JSON`

The downloaded file is named `hil-browser-evidence-<context-id>.json` and contains the exact activation-result JSON returned by the same-device service worker.

## Authority boundary

```text
WorkerCoordinator claim/fence authority = unchanged
InTr transition authority = unchanged
TV/TVC credential authority = unchanged
GitHub token runtime authority = NONE
request_consumption_claimed = false
source/CI/deployment/export authority effect = NONE
```

No second WorkerCoordinator, service worker, claim/fence, user-operated machine, or credential path is introduced. Controller refresh is code-version convergence only; it does not clear portable state or authorize a replacement checkout.

## Next continuation

After merge and public propagation, re-run or restore the successful standalone-browser HIL context, export the exact JSON, and feed that exact component-produced artifact into the canonical `.github` HIL browser-evidence intake validator. Only a validated canonical consumption receipt may satisfy `PRED-RESIDENT-REQUEST-CONSUMED-HIL-SOVEREIGN-RECEIVER-002`.
