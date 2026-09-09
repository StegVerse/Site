# HIL Browser Receiver Site Projection Mirror Handoff

Updated: 2026-09-08
Repository: `StegVerse-Labs/Site`
Issue: `#1121`
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
COSV: `50000000105000`
Upstream StegOS merge: `5c1e95d2d9c86ac00ab5c42be8b744a5fe83172a`

## Purpose

Project the merged StegOS same-device HIL browser receiver to `stegverse.org` so the current-iPhone activation path no longer depends on a signed native StegOS app or TestFlight distribution.

## Exact projected sources

```text
stegos-bootstrap/hil-browser-receiver.js
  upstream blob: 35ea230bcb33594125244fe2f9164a98f79983e6

stegos-bootstrap/hil-activate.html
  upstream blob: 3d8d0db5faa29d89bcf6b149ec402d7cd1a0ed81

stegos-bootstrap/hil-portable-state-bridge.js
  Site successor blob after receiver import: 6069623dcb3d0c8965924940af4915a45452685a

stegos-bootstrap/service-worker.js
  retained previously admitted blob: b887fd056e58f05038e16d4663e719b6013d419b
```

The existing Site service worker remains the sole service worker. It already loads `hil-portable-state-bridge.js`; that bridge now imports `hil-browser-receiver.js`. The existing `workercoordinator-portable-authority:state` lineage is reused without a second WorkerCoordinator.

## Current-iPhone path

```text
https://stegverse.org/stegos-bootstrap/hil-activate.html
-> existing Site StegOS service worker
-> HIL portable state bridge
-> HIL browser receiver
-> canonical portable WorkerCoordinator checkout
-> same-device execution receipt
-> BROWSER_HIL_LOCAL_READY_OBSERVED
-> later canonical .github evidence binding
```

No signed IPA, TestFlight install, second machine, caller-supplied claim/fence, NON-TV/TVC credential, GitHub runtime authority, or heartbeat-granted authority is required.

## Evidence boundary

A physical current-iPhone execution may emit `stegos.hil_browser_receiver_execution_receipt/v1` with `browser_receiver_execution_observed: true`. That receipt remains component evidence only:

```text
request_consumption_claimed: false
interlock_transition_authority: false
authority_effect: NONE_COMPONENT_EVIDENCE_ONLY
```

Source merge, CI, public deployment, page load, or portable checkout alone do not satisfy `PRED-RESIDENT-REQUEST-CONSUMED-HIL-SOVEREIGN-RECEIVER-002`.

## Completion target

1. Exact-head Site validation passes.
2. PR merges without stale-base conflict.
3. Public HTTPS page is directly observed serving the browser-receiver successor instead of the prior native-app handoff.
4. User executes the public activation action on the physical current iPhone.
5. Canonical `.github` separately binds qualifying physical evidence into resident request consumption.
