# ERL / StegSocials Post Preparation Handoff

Status: `SOURCE_CONTRACT_DEFINED / SITE_IMPLEMENTATION_PENDING / PREMIUM_AUTOMATED_POSTING_SEPARATELY_SCOPED`
Task: `KV-CONNECTION-REVALIDATION-WORKER-001`
COSV ID: `50000000102000`
Parent handoff: `docs/MY_KV_MULTI_INSTANCE_PROVIDER_MANAGER_MIRROR_HANDOFF.md`

## Current architectural decision

The KV ERL lane is a source surface for StegSocials post preparation. Any eligible KV instance may expose ERL artifacts to StegSocials through a provider-neutral contract. The standard feature is post preparation and manual publication. Automated external posting is premium and separately enabled.

## Standard path

`KV -> ERL -> StegSocials -> platform draft directory -> user review/edit -> manual publish`

Standard capability includes ERL source selection, provenance linkage, platform-shaped draft generation, character/media validation, platform-specific draft directories, user edit/approve/reject/archive controls, and copy/share/manual-publication completion.

## Premium path

`STANDARD + connector credential/runtime admission -> schedule/automatic publish -> confirmation -> URL/receipt -> retry/campaign handling`

Premium automation must remain opt-in and must not be inferred from draft preparation.

## Current source

- `docs/ERL_STEGSOCIALS_POST_PREPARATION_CONTRACT.md`
- `data/session-work-claims.d/site-erl-stegsocials-post-prep-20260908.json`

## Remaining implementation

- Add ERL selector to StegSocials preparation UI/data path.
- Add common `stegverse.stegsocials.post-preparation/v1` bundle materialization.
- Add provider-neutral platform draft directories.
- Add LinkedIn/Facebook/Instagram/X/Other validators and shaping.
- Preserve ERL refs/hashes into draft/published evidence.
- Add manual copy/share completion path.
- Add entitlement gate before automated connector execution.
- Add premium publication result/receipt handling only after authentic platform responses.
- Keep repository README accurate.

No runtime activation, external social connector execution, or premium automated posting is claimed by this handoff.
