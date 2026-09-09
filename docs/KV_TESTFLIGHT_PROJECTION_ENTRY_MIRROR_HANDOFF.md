# KV TestFlight Projection Entry Mirror Handoff

Updated: 2026-09-09

Goal Task ID: `KV-BOUND-EPHEMERAL-BROWSER-PROJECTION-001`
Canonical issue: `StegVerse-Labs/.github#1299`
COSV: `50000010100000`
Canonical KV producer: `StegVerse-Labs/continuity-vault-kit@47c363611210b7501cbb50abce768cfe0911057f`
Canonical StegOS consumer: `StegVerse-Labs/StegOS@19e2ea02a16bd703767aafcd47e71f5ec5efe3cf`
Status: `ACTIVE / SITE PURPOSE-BOUND DEVICE-KV ENTRY ADAPTER IMPLEMENTED / VALIDATION PENDING`

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
```

The root-scoped `intr-service-worker.js` already admits `MY_KV_INSTALLATION_STATUS` requests through the current-device Device -> KV InTr path and produces `stegverse.device-kv-intr-materialization-ingress/v1` with `state=INGRESS_ADMITTED`, exact request validation, write-once persistence, exact Node/Interlock/outbox binding, TV/TVC credential authority, and no execution/claim authority.

No new record class or root service worker is introduced. The adapter uses the already-supported installation-status record class but gives the request the exact purpose `CURRENT_IPHONE_TESTFLIGHT_SIGNING`, so the purpose is inside the exact request hash admitted by InTr.

## Added source

```text
assets/kv-testflight-projection-entry.js
assets/kv-testflight-projection-export.js
kv-testflight-projection.html
tests/kv-testflight-projection-entry.test.cjs
```

### Entry adapter

`assets/kv-testflight-projection-entry.js`:

1. requires a registered current-device StegVerse Node;
2. creates a purpose-bound `kv.interlock.request.v1` using `MY_KV_INSTALLATION_STATUS` and `_System/installation.receipt.json`;
3. uses the existing generated InTr connector, HB-derived carrier, Node outbox, and Device-KV sync;
4. requires the resulting authentic `INGRESS_ADMITTED` receipt and validates request/node/interlock/outbox/digest/authority boundaries;
5. obtains the exact response from the existing Device-KV result path and requires `KV_INSTALLATION_VERIFIED`, canonical installation receipt presence, full template parity, and a SHA-256 installation receipt commitment;
6. observes only capability APIs required by the signer path: secure context, WebAssembly, SubtleCrypto, File/Blob, fetch, TextEncoder/TextDecoder;
7. explicitly records that browser identity, user-agent, and device fingerprint were not collected and sets `browser_identity_authority=false`;
8. derives same-lineage entry/capability receipts and the projection commitments using the same canonical JSON/SHA-256 rules as the merged continuity-vault-kit producer.

The internal lineage key is derived from the verified KV installation receipt commitment and is never exported in the final projection context.

### Exact export adapter

`assets/kv-testflight-projection-export.js` strips internal evidence from the final payload and emits exactly these nine fields:

```text
schema
purpose
entry_state
kv_transition_commitment
admission_commitment
browser_capability_state
browser_capability_commitment
persistence_effect
authority_effect
```

It fails closed on field drift, invalid SHA-256 commitments, wrong purpose/state/effects, or any leaked `kv_lineage_id`.

### Current-iPhone page

`kv-testflight-projection.html` is a user-mediated materialization surface. It invokes the adapter, creates an in-memory Blob only after authentic admission + KV verification + capability observation pass, and exposes a download named `stegverse-kv-testflight-projection.json`. The object URL is revoked on replacement/pagehide. No localStorage/sessionStorage/IndexedDB/cookie/user-agent/fingerprint state is used by this page.

The saved JSON is intended for the already-merged StegOS minimal TestFlight page, which independently validates the exact projection context before IPA/WASM signer materialization.

## Authority boundary

This Site adapter does not mint InTr admission. It consumes the actual receipt produced by the existing root-scoped Device-KV InTr runtime. It does not make Site the KV owner, credential authority, signing authority, WorkerCoordinator, Master Records authority, or TestFlight/runtime truth source.

`HB` remains carrier/observability only. `TV/TVC` remains credential authority. Interlock/InTr remains admission authority. KV remains continuity boundary. Browser capability observation grants no authority.

## Runtime truth

Source presence and CI cannot establish that the current iPhone has executed this adapter. Authentic completion of this slice requires a real current-iPhone invocation that returns the purpose-bound `INGRESS_ADMITTED` receipt, verified KV installation result, compatible capability observation, and resulting exact projection JSON.

No such physical invocation is claimed yet.

## Next

1. Validate Site source/tests and merge the adapter.
2. Project the merged page/assets through the existing Site deployment path.
3. Invoke `kv-testflight-projection.html` on the current iPhone.
4. Save the resulting exact projection JSON to Files.
5. Supply it to the merged StegOS TestFlight bootstrap page.
6. Continue TV/TVC provisioning/signing, native Build Upload, TestFlight install, retained runtime evidence, and the frozen global measurement pass.
