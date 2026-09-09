# ERL / StegSocials Post Preparation Site Handoff

Status: `SITE_PROJECTION_MERGED / DEVICE_LOCAL_KV_DRAFT_ADMISSION_SOURCE_IMPLEMENTED / HASH_SIZE_READBACK_IMPLEMENTED / EXACT_CONTENT_BYTE_READBACK_PENDING / PREMIUM_AUTOMATION_SEPARATE`
Canonical task: `SS-EVIDENCE-COMPARISON-001`
COSV ID: `40000100100000`
Canonical handoff: `StegVerse-Labs/StegSocials/docs/STEGSOCIALS_EVIDENCE_CONTEXT_MIRROR_HANDOFF.md`
Canonical StegSocials preparation merge: `3de2f75a0e9accceebd46485d3f3e4e9c09bc03a`
Canonical StegSocials reconciliation merge: `b7b5ebe959d937d8f213f3626587dce653ce3d5d`
Site preparation projection merge: `cc5bb28ddb7a74b24c89d75e331e51ea6f4cfab3`
Current Site branch: `stegsocials-kv-draft-admission-20260908`

## Current architecture

The KV ERL lane supplies provenance to the canonical StegSocials post-preparation contract. StegSocials owns the schema/evidence semantics. Site projects ERL discovery, platform shaping, manual completion, and now a bounded device-local KV draft-admission request using the existing portable DEVICE_KV/InTr materialization path.

## Merged preparation path

```text
MyKV directory
-> ERL domain (`02_Research/ERL`)
-> ERL file entry
-> Prepare post
-> `stegsocials-prepare.html`
-> canonical `stegverse.stegsocials.post-preparation/v1` bundle
-> copy/manual publication
```

Site PR #1136 merged this path at `cc5bb28ddb7a74b24c89d75e331e51ea6f4cfab3` after focused StegSocials preparation, Site Handoff Orchestrator, Site Bootstrap, and Ecosystem Heartbeat validation passed on its final integration head.

## Current draft-admission extension

The preparation page now has a `Save draft to My KV` action. It uses:

```text
prepared bundle
-> `assets/stegsocials-kv-draft-write-bridge.js`
-> canonical DEVICE_KV InTr intent (`COMMIT_CANDIDATE`)
-> existing portable inline-payload materialization
-> registered Node outbox
-> existing `StegVerseDeviceKVInTrSync`
-> device-local `/intr/materialization`
-> existing `persistPortable()` KV admission
-> canonical directory query/readback
-> exact filename + SHA-256 + size match
```

No new InTr service worker, scheduler, provider transport, or credential path is introduced.

The writer requires:

- canonical schema `stegverse.stegsocials.post-preparation/v1`;
- task binding `SS-EVIDENCE-COMPARISON-001`;
- at least one `authority=ERL` reference below `02_Research/ERL/`;
- destination below one of the canonical platform draft directories;
- `provider_call_performed=false`;
- `credential_material_present=false`;
- `publication_authority_effect=NONE_PREPARATION_ONLY`;
- no credential/secret-like keys.

The portable KV payload is bounded to 1 MiB and records `credential_requirement=NONE`, `source_class=OWNER_CONTROLLED_GENERATED_DRAFT`, and `authority_effect=NONE`.

## Evidence precision

Successful save currently means:

```text
canonical_kv_admission_observed=true
admitted_hash_readback_verified=true
exact_content_bytes_readback_verified=false
provider_call_performed=false
provider_operation_authorized=false
```

The existing device-local `persistPortable()` path validates the exact incoming bytes against their SHA-256 before write-once storage. The successor directory query independently reads back admitted file metadata and the writer requires exact name/hash/size equality.

This is stronger than target-path display and is authentic device-local KV admission plus admitted-hash/size readback when run successfully. It is deliberately not described as exact content-byte readback because the current generic directory query does not return stored file bytes. A dedicated bounded content-read primitive remains required for that stronger claim.

## Product split

```text
STANDARD
ERL discovery + evidence/provenance + draft preparation + optional MyKV draft admission + copy/manual publication

PREMIUM
STANDARD + explicit automated-posting entitlement + separate governed release/provider execution
```

Automated and scheduled publication remain under `SS-KV-SKAP-SOCIAL-RELEASE-001`. Neither preparation nor KV draft admission performs a social provider call.

## Current files

```text
docs/ERL_STEGSOCIALS_POST_PREPARATION_CONTRACT.md
docs/ERL_STEGSOCIALS_POST_PREPARATION_HANDOFF.md
assets/my-kv-directory.js
my-kv-directory.html
assets/stegsocials-post-preparation.js
assets/stegsocials-kv-draft-write-bridge.js
stegsocials-prepare.html
tests/stegsocials-post-preparation.test.cjs
tests/stegsocials-kv-draft-write-bridge.test.cjs
.github/workflows/stegsocials-post-preparation.yml
data/session-work-claims.d/site-stegsocials-kv-draft-admission-20260908.json
README.md
```

## Validation predicates

- canonical Drafts lane and platform directory are enforced;
- ERL provenance/path is enforced;
- credential-like material is refused;
- standard preparation remains non-publishing;
- portable draft payload is bounded and hash-addressed;
- a successful runtime save requires canonical KV admission followed by exact filename/hash/size directory readback;
- exact content-byte readback remains explicitly false;
- social provider execution remains false;
- README accurately describes the stronger admission state without overstating exact-byte readback.

## Remaining work

1. Pass focused and required Site validation for the current draft-admission branch and merge it.
2. Execute the `Save draft to My KV` path on an authentically registered/current device-local KV and retain the resulting materialization/hash-readback evidence.
3. Add a bounded generic KV file-content read primitive so exact stored bytes can be recovered and hashed independently after admission.
4. Prove ERL/Drafts discovery and draft admission/readback on additional authentically materialized KV provider instances before claiming arbitrary-KV runtime support.
5. Keep automated provider publication and publication receipts in the separate premium release workstream.

No external social provider call, automatic publication, credential resolution, or live publication proof is claimed by this handoff.
