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

## Merged implementation evidence

- Site PR #1148 merged at `7a7d66045074cb066d1e948b24afede183e1413b`, establishing exact saved-draft content-byte verification.
- Site PR #1152 merged the ERL-assisted drafting implementation at `38be9d952ef4cbf30b9fa15cdedee1f3b5dc1242`.
- Site PR #1167 merged the current-iPhone resident-DEVICE_KV source-identity / empty-ERL clarification at `bb3ccf4280f1843fb7e85e726d5c7dba0f9a4c11`. Its final head passed My KV Directory Landing, StegSocials Post Preparation, StegSocials ERL Assisted Drafting, Site Handoff Orchestrator, Site Bootstrap Validate, and Ecosystem Heartbeat Orchestration.
- Site PR #1170 merged the post-merge claim/handoff reconciliation at `4cba19048241244058d5e0e1921090219042a15f`; its required StegSocials/Handoff/Bootstrap/Heartbeat gates passed.

The current StegSocials canonical coordination remains `SS-EVIDENCE-COMPARISON-001` / COSV `40000100100000`.

## Authentic current-iPhone observation already retained

The owner opened live Site `My KV -> ERL` and saw:

```text
Directory loaded from your KnowledgeVault.
No files available to display
This directory is currently empty.
```

That observation established a valid resident directory projection and exposed ambiguous wording. It did not establish a Google Drive or other cloud-KV read. PR #1167 repaired that ambiguity: the deployed source now identifies the current resident `DEVICE_KV` projection, uses a dedicated ERL empty state, and says separate cloud KV content is not included unless connected/materialized into the active set.

The current resident ERL directory was empty at the time of the observation. The existing owner-controlled `Import owner-controlled files` path remains the intended bounded recovery path from iPhone Files if an ERL artifact must be staged into the resident admission flow.

## Current machine state

```text
ERL_ASSISTED_STANDARD_DRAFTING_MERGED=true
EMPTY_RESIDENT_ERL_STATE_CLARITY_REPAIR_MERGED=true
POSTMERGE_RECONCILIATION_MERGED=true
CURRENT_IPHONE_EMPTY_RESIDENT_ERL_DIRECTORY_OBSERVED=true
CLOUD_KV_INSPECTED_BY_THAT_DEVICE_READ=false
CURRENT_IPHONE_CORRECTED_PAGE_REOBSERVATION_PENDING=true
CURRENT_IPHONE_ERL_ADMISSION_PENDING=true
CURRENT_IPHONE_PREPARE_SAVE_EXACT_READBACK_PENDING=true
```

## Remaining work

1. Re-open `My KV -> ERL` on the current iPhone and verify the corrected resident-DEVICE_KV wording / dedicated empty state is live.
2. If the resident ERL directory is still empty, tap `Import owner-controlled files`, select the intended ERL artifact from iPhone Files, and allow the existing staging -> canonical KV admission/readback flow to proceed. Do not expect the artifact to appear until admission/readback succeeds.
3. Once the ERL artifact is readable from the resident KV, execute `Prepare post -> Draft from ERL -> Save draft to My KV` and retain the exact saved-draft readback result.
4. Keep automated/scheduled social-provider publication in the separate premium task.

## Manual work

Current iPhone evidence is now the next unresolved Site step. No Google Drive KV #2 adoption retry is part of this task.

## State

`ERL_ASSISTED_STANDARD_DRAFTING_MERGED / EMPTY_RESIDENT_ERL_STATE_CLARITY_REPAIR_MERGED / POSTMERGE_RECONCILIATION_MERGED / CURRENT_IPHONE_CORRECTED_PAGE_REOBSERVATION_PENDING / DEVICE_ERL_ADMISSION_AND_DRAFT_FLOW_PENDING`
