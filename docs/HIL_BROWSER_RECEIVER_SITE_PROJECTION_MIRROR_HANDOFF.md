# HIL Browser Receiver Site Projection Mirror Handoff

Updated: 2026-09-08
Repository: `StegVerse-Labs/Site`
Issue: `#1125` (successor to `#1121`)
Parent goal: `SHWP-HIL-SOVEREIGN-RECEIVER-001`
COSV: `50000000105000`
Upstream StegOS merge: `a2b77ffb8fb55f0d26343589103893a9e202436b`

## Purpose

Project the same-device HIL browser receiver to `stegverse.org` without signed-app/TestFlight dependency and preserve downstream continuation when the physical iPhone already holds the single canonical HIL WorkerCoordinator checkout.

## Exact projected sources

```text
stegos-bootstrap/hil-browser-receiver.js
  upstream blob: de0c25bf66f59561ee357d121b47c81415d7e202

stegos-bootstrap/hil-activate.html
  upstream blob: 3d8d0db5faa29d89bcf6b149ec402d7cd1a0ed81

stegos-bootstrap/hil-portable-state-bridge.js
  Site blob: 6069623dcb3d0c8965924940af4915a45452685a

stegos-bootstrap/service-worker.js
  retained admitted blob: b887fd056e58f05038e16d4663e719b6013d419b
```

## Retained-checkout continuation

The physical iPhone produced `task package already checked out; terminal/downstream continuation must not mint another claim`. The successor browser receiver now reads the existing portable WorkerCoordinator state first. When exactly one retained checkout belongs to this HIL task, it validates and reuses `last_checkout_receipt` rather than calling checkout again.

The retained receipt is bound to the same authority epoch, predecessor registry, task fragment, handoff, state vector, task/worker, claim/fence, checkout tail, and canonical self-hash. More than one checkout or any mismatch fails closed. A fresh checkout occurs only when checkout count is zero.

## Current-iPhone path

```text
https://stegverse.org/stegos-bootstrap/hil-activate.html
-> existing Site StegOS service worker
-> HIL portable state bridge
-> HIL browser receiver
-> retained canonical HIL checkout reused when present
-> same-device execution receipt
-> BROWSER_HIL_LOCAL_READY_OBSERVED
-> later canonical .github evidence binding
```

No signed IPA, TestFlight install, second machine, second WorkerCoordinator, caller-supplied claim/fence, NON-TV/TVC credential, GitHub runtime authority, or heartbeat-granted authority is required.

## Evidence boundary

A physical current-iPhone execution may emit `stegos.hil_browser_receiver_execution_receipt/v1` with `browser_receiver_execution_observed: true`, `continuation_reused_existing_checkout: true`, and `second_claim_minted: false`. It remains component evidence only:

```text
request_consumption_claimed: false
interlock_transition_authority: false
authority_effect: NONE_COMPONENT_EVIDENCE_ONLY
```

Source merge, CI, deployment, page load, or checkout reuse alone do not satisfy `PRED-RESIDENT-REQUEST-CONSUMED-HIL-SOVEREIGN-RECEIVER-002`.
