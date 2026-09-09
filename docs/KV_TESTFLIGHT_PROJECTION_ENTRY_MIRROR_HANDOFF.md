# KV TestFlight Projection Entry Mirror Handoff

Updated: 2026-09-09

Goal Task ID: `KV-BOUND-EPHEMERAL-BROWSER-PROJECTION-001`
Canonical issue: `StegVerse-Labs/.github#1299`
COSV: `50000010100000`
Canonical KV producer: `StegVerse-Labs/continuity-vault-kit@47c363611210b7501cbb50abce768cfe0911057f`
Canonical StegOS consumer: `StegVerse-Labs/StegOS@19e2ea02a16bd703767aafcd47e71f5ec5efe3cf`
Implementation PR: `StegVerse-Labs/Site#1178`
Status: `ACTIVE / SITE PURPOSE-BOUND DEVICE-KV ENTRY ADAPTER EXACT-HEAD VALIDATED / READY FOR MERGE`

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
.github/workflows/kv-testflight-projection-entry.yml
data/session-work-claims.d/site-kv-testflight-projection-entry-001-20260909.json
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
8. derives same-lineage entry/capability receipts and projection commitments using the same canonical JSON/SHA-256 rules as the merged continuity-vault-kit producer.

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

## Pre-work claim repair

The first PR validation attempt correctly failed closed because the Site branch did not yet resolve to exactly one active pre-work claim. The branch now carries:

```text
data/session-work-claims.d/site-kv-testflight-projection-entry-001-20260909.json
state=CLAIMED_FOR_IMPLEMENTATION
branch=feat/kv-testflight-projection-entry-001
```

After that repair, the claim/orchestration step passed. The claim includes the exact source/test/workflow/handoff scope and does not claim root InTr service-worker ownership.

## Exact-head validation

At PR head `37eaf5b3efc66747866833515ca1ba117b31da54` before this documentation-only update, all required gates passed:

```text
KV TestFlight Projection Entry: PASS — run 34411765841
  - Node regression contract PASS
  - no credential/runtime authority introduced PASS

Site Handoff Orchestrator: PASS — run 34411765898
Ecosystem Heartbeat Orchestration: PASS — run 34411765825
Site Bootstrap Validate - No Non-TV/TVC Credential Authority: PASS — run 34411765820
```

The focused workflow executes `node --test tests/kv-testflight-projection-entry.test.cjs` and separately verifies TV/TVC credential authority, no GitHub runtime authority, no browser identity authority, and no local/session browser storage in the projection surface.

Because this handoff commit advances the PR head without changing runtime source, exact-head repository workflows must still be re-observed before merge; no gate is waived.

## Authority boundary

This Site adapter does not mint InTr admission. It consumes the actual receipt produced by the existing root-scoped Device-KV InTr runtime. It does not make Site the KV owner, credential authority, signing authority, WorkerCoordinator, Master Records authority, or TestFlight/runtime truth source.

`HB` remains carrier/observability only. `TV/TVC` remains credential authority. Interlock/InTr remains admission authority. KV remains continuity boundary. Browser capability observation grants no authority.

## Runtime truth

Source presence and CI cannot establish that the current iPhone has executed this adapter. Authentic completion of this slice requires a real current-iPhone invocation that returns the purpose-bound `INGRESS_ADMITTED` receipt, verified KV installation result, compatible capability observation, and resulting exact projection JSON.

No such physical invocation is claimed yet.

## Next

1. Re-observe exact-head Site workflows after this handoff update and merge PR #1178 only when green.
2. Terminalize the Site pre-work claim with the actual merge commit in a claim-registry-only follow-up.
3. Verify the merged projection route is publicly served by the existing Site deployment path.
4. Invoke `kv-testflight-projection.html` on the current iPhone.
5. Save the resulting exact projection JSON to Files.
6. Supply it to the merged StegOS TestFlight bootstrap page.
7. Continue TV/TVC provisioning/signing, native Build Upload, TestFlight install, retained runtime evidence, and the frozen global measurement pass.
