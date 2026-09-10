# StegSocials Bounded Group DEVICE_KV CAS Mirror Handoff

Updated: 2026-09-10

## Goal

- Goal Task ID: `SS-KV-SKAP-SOCIAL-RELEASE-001`
- Canonical handoff: `StegVerse-Labs/StegSocials/docs/STEGSOCIALS_NATIVE_STEGBROWSER_TRANSPORT_MIRROR_HANDOFF.md`
- Parent Site handoff: `docs/STEGSOCIALS_BOUNDED_GROUP_KV_CAS_MIRROR_HANDOFF.md`
- COSV: `60000000102000`
- Site role: resident DEVICE_KV state-mutation carrier only; no publication, credential, or governance authority.

## Purpose

Move the already validated provider-neutral bounded-group compare-and-swap contract into the existing resident DEVICE_KV storage boundary. Reuse the existing `stegverse-device-local-intr-v1` IndexedDB database and `kv_files` object store rather than creating another KV runtime.

## Implemented source

```text
assets/stegsocials-bounded-group-device-kv-cas-receiver.js
tests/stegsocials-bounded-group-device-kv-cas-receiver.test.cjs
.github/workflows/stegsocials-post-preparation.yml
```

The receiver:

- accepts only `COMPARE_AND_SWAP` requests shaped as `stegverse.site.stegsocials-bounded-group-kv-conditional-write/v1`;
- confines writes to `03_Records/StegSocials/PostGroupState/`;
- requires canonical SHA-256 expected and next-state etags;
- requires a bounded-group use-state payload;
- refuses credential material and provider-operation authority;
- requires terminal StegBrowser `session_state_destroyed=true` evidence;
- compares the existing row etag and writes the next state inside one IndexedDB `readwrite` transaction;
- fails closed on a stale etag before mutation;
- reopens the store after commit and independently verifies the persisted etag and exact canonical state hash.

This is the native same-device transaction primitive needed by the bounded-group authority model. It does not itself mint InTr admission, resolve SKAP material, contact a social provider, or create publication authority.

## Deterministic validation target

The dedicated test exercises the actual receiver API against a deterministic IndexedDB-compatible transaction harness and must prove:

1. the existing `stegverse-device-local-intr-v1 / kv_files` store identity is reused;
2. a current expected etag commits one use and exact readback verifies;
3. the same stale expected etag is refused after the first commit;
4. a wrong next-state etag is refused before mutation;
5. credential-bearing requests are refused;
6. provider-operation authority is refused;
7. missing terminal StegBrowser destruction proof is refused;
8. a second current-state transition can commit the next bounded use.

CI success proves source-level transaction behavior only. It is not authentic current-iPhone resident execution evidence.

## Remaining runtime work

1. Route the bounded-group CAS request through the existing Node/InTr materialization path into this receiver.
2. Observe the receiver executing against the current iPhone's retained DEVICE_KV instance rather than the deterministic CI harness.
3. Retain exact pre-state etag, admitted request identity, committed next-state etag, and independent readback evidence.
4. Bind the transition to an authentic StegBrowser publication receipt and terminal session-destruction receipt.
5. Exercise at least two in-scope posts under one participant-approved bounded group without renewed approval.
6. Exercise stale/replay/widening failure controls in the live path.
7. Persist resulting publication/state evidence to Personal-KV and reconstruct through Master Records.
8. Reconcile live evidence into the canonical task registry and downstream propagation surfaces.

## Authority boundary

```text
InTr: admission/transition authority
TV/TVC + SKAP: credential authority
StegBrowser: bounded ephemeral platform execution
DEVICE_KV receiver: atomic local state persistence only
Personal-KV: participant-owned durable data plane
Master Records: custody/reconstruction
Site: carrier/projection; no authority
```

## Manual work

None.

## Next executable action

Run the exact-head Site validation suite. Repair any deterministic failure without weakening stale-etag, publication-proof, terminal-destruction, or credential boundaries. Merge only after the focused StegSocials workflow and canonical Site orchestration/bootstrap gates pass, then bind this receiver to the existing resident Node/InTr trigger path.
