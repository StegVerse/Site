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

## Merged evidence

Site PR #1148 merged at `7a7d66045074cb066d1e948b24afede183e1413b`, establishing exact stored-content-byte verification in the normal Save draft to My KV completion path.

Site PR #1152 merged the ERL-assisted drafting implementation at `38be9d952ef4cbf30b9fa15cdedee1f3b5dc1242`.

The current StegSocials canonical coordination is reconciled separately under `SS-EVIDENCE-COMPARISON-001` / COSV `40000100100000`.

## 2026-09-09 authentic current-iPhone observation

The owner opened the live Site `My KV -> ERL` directory on the current iPhone. The page visibly reported:

```text
Directory loaded from your KnowledgeVault.
No files available to display
This directory is currently empty.
```

This observation proves the current Site reached a valid resident directory projection, but it does not prove the Google Drive ERL vault was inspected. The current resident KV is device-local browser storage, while the existing Google Drive vault remains a separate, not-yet-materialized cloud KV identity under the KV multi-instance workstream.

The observed text exposed a UI ambiguity: `assets/my-kv-directory.js` used the generic phrase `your KnowledgeVault` for any valid DEVICE_KV projection, including an empty current resident device-local KV. That wording could be misread as evidence that a separate cloud KV had been queried.

Repair branch:

```text
ss-erl-empty-resident-kv-clarity-20260909
```

The branch:

- changes directory success text to identify the `current resident DEVICE_KV projection`;
- changes the ERL empty state to `No ERL files in the current resident KV`;
- explicitly states that separate Google Drive/iCloud/other cloud KV content is not included unless connected/materialized into the active set;
- points the non-provider fallback to `Import owner-controlled files` from iPhone Files;
- preserves the existing portable-source rule that selected bytes are staged locally and appear only after canonical KV admission/readback;
- adds a focused regression test and wires it into the My KV directory workflow;
- changes no cloud-KV relationship, provider credential, provider operation, or COSV bit.

README impact determination: this repair clarifies existing resident-source identity and recovery text without adding a new repository capability. Existing README already describes MyKV ERL browsing and the standard preparation path; no README text change is required for this bounded clarification.

## Remaining work

1. Validate and merge the current empty-ERL resident-source clarity repair.
2. Observe the corrected page on the current iPhone.
3. Use the existing owner-controlled portable import path if needed to stage an ERL artifact from iPhone Files into the resident admission flow without changing cloud-KV state.
4. After canonical KV admission/readback, execute the complete ERL -> Prepare -> Save draft to My KV -> exact saved-draft readback path on the current iPhone.
5. Expand content retrieval/proof to authentically materialized external KV providers before claiming arbitrary-provider ERL drafting.
6. Keep automated/scheduled publication in the separately governed premium release path.

## Manual work

None until this repair is merged/deployed. Do not retry Google Drive KV #2 adoption as part of this StegSocials task.

## State

`ERL_ASSISTED_STANDARD_DRAFTING_MERGED / CURRENT_IPHONE_RESIDENT_ERL_DIRECTORY_EMPTY_OBSERVED / CLOUD_KV_NOT_INSPECTED_BY_THIS_READ / EMPTY_STATE_CLARITY_REPAIR_IN_PROGRESS / DEVICE_ERL_ADMISSION_AND_DRAFT_FLOW_PENDING`
