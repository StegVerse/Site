# StegSocials KV Exact Content Readback Mirror Handoff

Updated: 2026-09-09

## Goal Task ID

`SS-EVIDENCE-COMPARISON-001`

## COSV

`40000100100000`

## Purpose

Advance the merged standard ERL-backed StegSocials preparation path from device-local KV admission plus filename/SHA-256/size metadata readback to exact stored-content-byte verification on the current device-local KV store.

## Current source path

```text
ERL-backed preparation bundle
-> Save draft to My KV
-> merged DEVICE_KV/InTr portable admission
-> device-local `stegverse-device-local-intr-v1` / `kv_files`
-> bounded read-only exact-content readback
-> base64 decode
-> exact byte count verification
-> SHA-256 over recovered bytes
-> metadata/content hash and size equality
-> `EXACT_CONTENT_BYTES_READBACK_VERIFIED`
```

## Source implemented in this branch

```text
assets/stegsocials-kv-exact-content-readback.js
tests/stegsocials-kv-exact-content-readback.test.cjs
.github/workflows/stegsocials-kv-exact-content-readback.yml
data/session-work-claims.d/site-stegsocials-kv-draft-admission-terminal-20260909.json
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

A PASS from this primitive may establish:

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

The current source therefore does **not** prove that iCloud, Google Drive, OneDrive, Dropbox, or another external KV provider returned the exact bytes. It proves only the exact bytes retained in the current same-origin device-local KV store used by the merged DEVICE_KV/InTr materialization path.

## Prior merged evidence

Site PR #1140 merged at:

```text
130754f767ae7e8760b2f4fc7a6721591b731c0a
```

Its final head passed:

```text
StegSocials Post Preparation
Site Bootstrap Validate
Site Handoff Orchestrator
Ecosystem Heartbeat Orchestration
```

That merge established standard `Save draft to My KV` source with canonical-path enforcement and filename/SHA-256/size readback while explicitly leaving exact content-byte readback false.

## Remaining work

1. Pass focused exact-content readback CI and repository orchestration on this branch.
2. Merge only after required checks pass.
3. Integrate `StegVerseStegSocialsKVExactReadback.readExact(...)` into the normal `Save draft to My KV` completion flow so a successful user-facing save does not stop at metadata readback.
4. Execute the integrated path on the current registered iPhone and retain the resulting authentic admission plus exact-content-readback observation.
5. Extend the same exact-byte requirement to authentically materialized external KV providers before claiming provider-backed or arbitrary-KV exact readback.
6. Keep automated/scheduled social publication in the separate premium `SS-KV-SKAP-SOCIAL-RELEASE-001` path.

## Manual work

None is required for source implementation or deterministic validation. A current-iPhone interaction will be required only when the integrated runtime path is ready for authentic physical observation.

## State

`DEVICE_LOCAL_EXACT_CONTENT_READBACK_SOURCE_IMPLEMENTED / CI_PENDING / USER_FLOW_INTEGRATION_PENDING / AUTHENTIC_CURRENT_IPHONE_OBSERVATION_PENDING / PROVIDER_BACKED_READBACK_PENDING`
