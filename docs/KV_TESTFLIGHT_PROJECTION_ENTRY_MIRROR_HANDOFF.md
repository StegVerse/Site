# KV TestFlight Projection Entry Mirror Handoff

Updated: 2026-09-10

Goal Task ID: `KV-BOUND-EPHEMERAL-BROWSER-PROJECTION-001`
Canonical issue: `StegVerse-Labs/.github#1299`
COSV: `50000010100000`
Canonical KV producer: `StegVerse-Labs/continuity-vault-kit@47c363611210b7501cbb50abce768cfe0911057f`
Canonical StegOS consumer: `StegVerse-Labs/StegOS@19e2ea02a16bd703767aafcd47e71f5ec5efe3cf`
Original implementation PR: `StegVerse-Labs/Site#1178` merged at `3da593a61a536a625fcea4a26df8d1f491f00b44`
Status: `ACTIVE / AUTHENTIC SAFARI INVOCATION REACHED DEVICE-KV / RESIDENT INSTALLATION RECEIPT RECOVERY PATCH IN VALIDATION`

## Purpose

Bridge the already-running current-iPhone Device -> KV Universal InTr admission path into the merged KV-bound TestFlight projection contract without adding a second InTr service worker, scheduler, KV authority, credential path, browser identity root, or public private-state store.

## Existing runtime reused

This slice reuses the existing Site primitives:

```text
assets/stegverse-node-continuity.js
assets/generated/site-browser-intr-connectors.js
assets/hb-intr-carrier.js
stegos-node/device-kv-intr-sync.js
intr-service-worker.js
assets/my-kv-portable-installation-bridge.js
```

The root-scoped `intr-service-worker.js` already admits `MY_KV_INSTALLATION_STATUS` requests through the current-device Device -> KV InTr path and produces `stegverse.device-kv-intr-materialization-ingress/v1` with `state=INGRESS_ADMITTED`, exact request validation, write-once persistence, exact Node/Interlock/outbox binding, TV/TVC credential authority, and no execution/claim authority.

No new record class or root service worker is introduced. The adapter uses the already-supported installation-status record class but gives the request the exact purpose `CURRENT_IPHONE_TESTFLIGHT_SIGNING`, so the purpose is inside the exact request hash admitted by InTr.

## Current-iPhone observation — 2026-09-10

The published route was opened on the current iPhone.

Two distinct browser observations were captured:

1. ChatGPT in-app browser storage produced `Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.` This is a browser-partition-local IndexedDB/schema condition and is not being promoted as Safari runtime truth.
2. Safari reached the governed projection path and failed closed with `FAIL_CLOSED: resident KV installation not verified`.

The Safari result is the current authoritative first failure for this slice. It proves the published page can be invoked on the current iPhone far enough to execute the purpose-bound projection adapter, but the device-local KV store does not currently contain a canonical `_System/installation.receipt.json` row that satisfies `KV_INSTALLATION_VERIFIED`.

Existing project evidence shows this receipt-admission path has previously succeeded through My KV. The canonical portable installation bridge already validates the owner-selected receipt and materializes it through the same generated Device -> KV InTr connector, Node outbox, HB-derived carrier, and Device-KV sync. Therefore the repair reuses that bridge rather than creating a second authority or storage path.

## Recovery patch

Branch: `fix/kv-testflight-resident-recovery-001`

`kv-testflight-projection.html` now loads `assets/my-kv-portable-installation-bridge.js` and exposes `Admit Existing KV Installation Receipt` only when the projection fails specifically because resident KV installation is not verified.

Recovery behavior:

```text
purpose-bound TestFlight projection request
-> resident KV verification fails closed
-> owner selects canonical _System/installation.receipt.json
-> existing StegVerseKVInstallationBridge validates receipt
-> same Device→KV InTr materialization path admits exact receipt
-> device_local_kv_materialization_observed must be true
-> projection page retries the original purpose-bound request
-> projection JSON becomes downloadable only after full projection success
```

The recovery control does not use localStorage/sessionStorage/cookies for projection state, does not mint InTr authority, and does not bypass `KV_INSTALLATION_VERIFIED`. The Save Projection JSON control remains unavailable until `PROJECTION_CONTEXT_READY`.

Focused regression coverage is in `tests/kv-testflight-projection-recovery.test.cjs` and asserts canonical bridge reuse, predicate-specific recovery visibility, Device-KV reuse/TV-TVC authority boundaries, and fail-closed download gating.

## Authority boundary

This Site adapter does not mint InTr admission. It consumes the actual receipt produced by the existing root-scoped Device-KV InTr runtime. It does not make Site the KV owner, credential authority, signing authority, WorkerCoordinator, Master Records authority, or TestFlight/runtime truth source.

`HB` remains carrier/observability only. `TV/TVC` remains credential authority. Interlock/InTr remains admission authority. KV remains continuity boundary. Browser capability observation grants no authority.

## Runtime truth

Authentic current-iPhone invocation is now observed through the Safari `KV_INSTALLATION_NOT_VERIFIED` boundary. Full completion still requires an authentic current-iPhone run returning the purpose-bound `INGRESS_ADMITTED` receipt, `KV_INSTALLATION_VERIFIED`, compatible browser-capability observation, and exact emitted `stegverse-kv-testflight-projection.json`.

No projection JSON, TestFlight signing/upload/install, retained StegOS runtime, or global convergence measurement completion is claimed yet.

## Next

1. Validate and merge the resident-installation recovery patch.
2. Re-open the published projection route in Safari after deployment.
3. If resident KV is still not verified, use the newly exposed recovery control and select the canonical `_System/installation.receipt.json`.
4. Require observed Device-KV admission and automatic retry of the purpose-bound TestFlight projection.
5. Save the exact resulting `stegverse-kv-testflight-projection.json` only after `PROJECTION_CONTEXT_READY`.
6. Supply it to the merged StegOS TestFlight bootstrap page.
7. Continue TV/TVC provisioning/signing, native Build Upload, TestFlight install, retained runtime evidence, and the frozen global measurement pass.
