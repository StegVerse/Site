# StegSocials Bounded Group KV CAS Mirror Handoff

Updated: 2026-09-10

## Goal

- Goal Task ID: `SS-KV-SKAP-SOCIAL-RELEASE-001`
- Canonical handoff: `StegVerse-Labs/StegSocials/docs/STEGSOCIALS_NATIVE_STEGBROWSER_TRANSPORT_MIRROR_HANDOFF.md`
- COSV: `60000000102000`
- Site role: Personal-KV conditional-write projection only; no publication, credential, or governance authority.

## Purpose

Project the bounded-post-group durable compare-and-swap requirement into Site/MyKV without turning Site into an authority plane. Each successful group publication must advance durable Personal-KV use state exactly once. A stale or replayed writer must fail closed instead of overwriting newer state.

## Source implemented in this branch

```text
assets/stegsocials-bounded-group-kv-conditional-write.js
tests/stegsocials-bounded-group-kv-conditional-write.test.cjs
.github/workflows/stegsocials-post-preparation.yml
```

The adapter validates bounded-group state, derives canonical SHA-256 state etags, requires an expected previous etag, requires a proven publication receipt and exact final-content hash, requires terminal StegBrowser session destruction evidence, refuses credential-like state, binds one new consumed-use index, and emits a provider-neutral compare-and-swap request.

`executeConditionalWrite()` accepts only a transaction adapter that reports a committed state transition with exact previous-etag match, exact persisted-etag match, exact readback verification, and no credential material. Site does not fabricate that transaction result.

## Authority boundary

```text
Site/MyKV projection: request + validation + evidence checking only
InTr: transition/admission authority
TV/TVC + SKAP: credential authority
StegBrowser: bounded ephemeral execution surface
Personal-KV resident/provider adapter: durable conditional-write execution
Master Records: receipt custody/reconstruction
```

No source, CI result, local object, Site page, or GitHub merge establishes authentic Personal-KV mutation or live social publication.

## Deterministic validation target

The test must prove:

- valid current-state etag creates a compare-and-swap request;
- exactly one new use index is required;
- mismatched/stale expected etag is refused;
- publication proof is mandatory before state commit;
- terminal StegBrowser destruction proof is mandatory;
- replay/non-advancing state is refused;
- credential-like fields are refused;
- an uncommitted or non-readback transaction result is refused.

## Remaining runtime work

1. Bind the provider-neutral transaction callback to the actual resident DEVICE_KV/Personal-KV write path.
2. Enforce the expected-etag comparison and write within one native/provider exclusive transaction, not as separate unlocked read/write operations.
3. Return exact persisted-state readback hash/etag from that same operation.
4. Bind the result to the authentic publication receipt and bounded-group use index.
5. Run the live multi-post group through InTr -> TV/TVC/SKAP -> StegBrowser -> provider -> Personal-KV and retain terminal session-destruction plus KV state-transition evidence.
6. Reconstruct the publication and bounded-group state transition in Master Records.

## Manual work

None.
