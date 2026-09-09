# StegSocials KV Exact Content Readback Mirror Handoff

Updated: 2026-09-09

## Goal Task ID

`SS-EVIDENCE-COMPARISON-001`

## COSV

`40000100100000`

## Purpose

Advance the merged standard ERL-backed StegSocials preparation path from device-local KV admission plus filename/SHA-256/size metadata readback to exact stored-content-byte verification on the current device-local KV store, and require that verification in the normal `Save draft to My KV` completion flow.

## Current source path

```text
ERL-backed preparation bundle
-> Save draft to My KV
-> merged DEVICE_KV/InTr portable admission
-> admitted filename/SHA-256/size readback
-> device-local `stegverse-device-local-intr-v1` / `kv_files`
-> bounded read-only exact-content readback
-> base64 decode
-> exact byte count verification
-> SHA-256 over recovered bytes
-> metadata/content hash and size equality
-> `EXACT_CONTENT_BYTES_READBACK_VERIFIED`
-> user-facing save completion
```

The user-facing save now fails closed unless the exact-content verifier returns `exact_content_bytes_readback_verified=true`.

## Source implemented in this branch

```text
assets/stegsocials-kv-exact-content-readback.js
stegsocials-prepare.html
tests/stegsocials-kv-exact-content-readback.test.cjs
.github/workflows/stegsocials-kv-exact-content-readback.yml
data/session-work-claims.d/site-stegsocials-kv-draft-admission-20260908.json
data/session-work-claims.d/site-stegsocials-kv-exact-content-readback-20260909.json
```

The readback primitive is deliberately narrow:

- only `02_Research/StegSocials/Drafts/{LinkedIn,Facebook,Instagram,X,Other}` is accepted;
- only JSON draft filenames are accepted;
- maximum verified object size is 1 MiB;
- the exact `kv_files` key must match path + filename;
- directory id must remain `stegsocials-drafts`;
- recovered content bytes must hash to the expected admitted SHA-256;
- recovered byte count must equal the expected admitted size;
- stored metadata hash/size must equal recovered content hash/size;
- credential/provider-operation fields must remain false;
- the readback is read-only and has no publication action.

## Important evidence boundary

A successful integrated save may establish:

```text
device_local_kv_store_observed=true
exact_content_bytes_readback_verified=true
```

It must also state:

```text
cloud_provider_readback_observed=false
provider_call_performed=false
credential_material_present=false
provider_operation_authorized=false
authority_effect=NONE_OBSERVATION_ONLY
```

The current source therefore does **not** prove that iCloud, Google Drive, OneDrive, Dropbox, or another external KV provider returned the exact bytes. It proves only exact bytes retained in the current same-origin device-local KV store used by the DEVICE_KV/InTr materialization path.

## Prior merged evidence

Site PR #1140 merged at:

```text
130754f767ae7e8760b2f4fc7a6721591b731c0a
```

Its final head passed StegSocials Post Preparation, Site Bootstrap Validate, Site Handoff Orchestrator, and Ecosystem Heartbeat Orchestration. That merge established standard `Save draft to My KV` source with canonical-path enforcement and filename/SHA-256/size readback while explicitly leaving exact content-byte readback false.

## Validation/remediation performed in this branch

1. The first focused exact-readback run exposed a test expectation mismatch; the test was repaired and the exact-content semantic/non-provider checks passed on the repaired implementation.
2. Repository orchestration then exposed an invalid predecessor-claim terminalization strategy: the predecessor was itself a registry fragment, while bounded tombstones may target only canonical-registry claims. The invalid tombstone was removed and the actual predecessor fragment was terminalized in place with PR #1140 / merge-commit evidence.
3. The normal `Save draft to My KV` page now loads `StegVerseStegSocialsKVExactReadback` and requires `readExact(...)` after DEVICE_KV admission before displaying save success.
4. Focused CI now explicitly verifies that the normal save path invokes exact readback and retains the non-provider boundary.

## Remaining work

1. Pass focused exact-content readback CI and repository orchestration on the current integrated branch head.
2. Merge only after required checks pass.
3. Execute the integrated path on the current registered iPhone and retain the resulting authentic admission plus exact-content-readback observation.
4. Extend the same exact-byte requirement to authentically materialized external KV providers before claiming provider-backed or arbitrary-KV exact readback.
5. Keep automated/scheduled social publication in the separate premium `SS-KV-SKAP-SOCIAL-RELEASE-001` path.

## Manual work

None is required while source/CI convergence is in progress. A current-iPhone interaction is required only after the merged integrated path is ready for authentic physical observation.

## State

`DEVICE_LOCAL_EXACT_CONTENT_READBACK_SOURCE_IMPLEMENTED / USER_FLOW_INTEGRATED / CLAIM_LIFECYCLE_REPAIRED / CI_REVALIDATION_IN_PROGRESS / AUTHENTIC_CURRENT_IPHONE_OBSERVATION_PENDING / PROVIDER_BACKED_READBACK_PENDING`
