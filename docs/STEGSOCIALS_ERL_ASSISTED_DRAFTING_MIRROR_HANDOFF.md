# StegSocials ERL Assisted Drafting Mirror Handoff

Updated: 2026-09-09

## Goal Task ID

`SS-EVIDENCE-COMPARISON-001`

## COSV

`40000100100000`

## Purpose

Make the standard StegSocials preparation path useful without requiring the user to manually author the first draft. A selected ERL artifact can be read from the current device-local KV, verified byte-for-byte against its stored SHA-256/size metadata, deterministically summarized into a platform-shaped editable draft, and then passed into the existing standard preparation + Save draft to My KV path.

## Standard flow

```text
My KV -> ERL artifact -> Prepare post -> Draft from ERL
-> exact local ERL byte/hash verification
-> deterministic source/relevance extraction
-> editable platform-shaped draft
-> canonical stegverse.stegsocials.post-preparation/v1 bundle
-> optional Save draft to My KV
-> exact saved-draft byte readback
-> manual copy/share/publication
```

## Premium boundary

Automated/scheduled social-provider publication remains outside this path and remains premium. This helper performs no social-provider call, no AI-provider call, no credential resolution, and no publication action.

## Implemented source

```text
assets/stegsocials-erl-draft-assistant.js
stegsocials-prepare.html
tests/stegsocials-erl-draft-assistant.test.cjs
.github/workflows/stegsocials-erl-assisted-drafting.yml
data/session-work-claims.d/site-stegsocials-erl-assisted-drafting-20260909.json
```

The assistant is bounded to root artifacts under `02_Research/ERL/` with `.md`, `.txt`, or `.json` extensions and a 1 MiB maximum. It verifies the exact local `kv_files` key, directory, filename, stored SHA-256, stored size, credential boundary, provider-operation boundary, and authority effect before parsing the artifact.

The local drafting algorithm extracts the ERL title, source URL, synopsis/observations/claims, and StegOS/GADI interpretation or implications when present. It shapes an editable draft for LinkedIn, Facebook, Instagram, X, or Other and carries standard StegVerse governance hashtags where supported by the source text.

## Evidence boundary

A successful local assistance result establishes only:

```text
deterministic_local_assistance=true
erl_authority_preserved=true
ai_provider_call_performed=false
provider_call_performed=false
credential_material_present=false
provider_operation_authorized=false
publication_authority_effect=NONE_PREPARATION_ONLY
```

It does not claim cloud-provider ERL readback, generative-AI authorship, social publication, or premium automation.

## Prior merged evidence

Site PR #1148 merged at `7a7d66045074cb066d1e948b24afede183e1413b`, establishing exact stored-content-byte verification in the normal Save draft to My KV completion path. The predecessor claim is terminalized in this branch before the successor assisted-drafting claim is registered.

## Remaining work

1. Pass focused ERL-assisted drafting validation plus Site orchestration/bootstrap/heartbeat gates.
2. Merge this implementation.
3. Observe the standard flow on a current device containing an admitted ERL artifact.
4. Expand content retrieval/proof to authentically materialized external KV providers before claiming arbitrary-provider ERL drafting.
5. Optionally add governed Ecosystem Chat refinement as a separate enhancement; do not make an external AI provider mandatory for basic preparation.
6. Keep automated/scheduled publication in the separately governed premium release path.

## Manual work

None for source implementation or deterministic validation.

## State

`ERL_ASSISTED_STANDARD_DRAFTING_SOURCE_IMPLEMENTED / CI_PENDING / MERGE_PENDING / DEVICE_OBSERVATION_PENDING / PROVIDER_BACKED_ERL_READBACK_PENDING`
