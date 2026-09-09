# ERL / StegSocials Post Preparation Contract

Task: `KV-CONNECTION-REVALIDATION-WORKER-001`
COSV ID: `50000000102000`
Status: `SOURCE_CONTRACT_DEFINED / RUNTIME_ACTIVATION_NOT_CLAIMED`

## Purpose

Define the provider-neutral contract by which any eligible KV instance can expose its ERL lane to StegSocials for post preparation while preserving KV ownership, ERL provenance, user control, and a clear product boundary between standard preparation features and premium automated publication.

## Core model

```text
KV instance
  -> ERL lane
  -> StegSocials preparation workspace
  -> platform-specific draft directories
  -> user review / edit / approve
  -> manual publication (standard)
  -> governed automated publication (premium, separately enabled)
```

ERL remains the evidence/research lane. StegSocials consumes ERL references and source material to prepare social content; it does not become the evidence authority and must not silently copy or rewrite canonical ERL provenance.

## Standard capability: post preparation

Every eligible KV instance SHOULD be able to:

1. Discover ERL artifacts available to that KV instance.
2. Select one or more ERL artifacts as source material for a post.
3. Create a StegSocials preparation bundle containing:
   - source ERL artifact references;
   - source hashes / provenance references when available;
   - intended platform(s);
   - target account/page identity selected by the user;
   - draft copy;
   - optional title / hook / hashtags;
   - media references;
   - disclosure / citation text where applicable;
   - character-count / platform-shape validation;
   - preparation timestamp and draft lineage.
4. Materialize platform-specific drafts into posting directories such as:

```text
StegSocials/
  Drafts/
    LinkedIn/
    Facebook/
    Instagram/
    X/
    Other/
  Evidence/
  Published/
  Failed/
```

5. Allow the user to edit, approve, reject, duplicate, or archive the prepared draft.
6. Preserve the ERL source reference after edits so downstream publication evidence can reconstruct what research artifact informed the post.

The standard feature is complete when the draft is ready for a user to copy, share, or manually publish. No automated account action is required for standard capability.

## Premium capability: automated publication

Automated posting is a separate premium feature and MUST NOT be implied merely because StegSocials can prepare a draft.

Premium automated publication MAY add:

- authenticated platform connectors;
- scheduled publication;
- multi-platform posting;
- account/page routing;
- retry / failure handling;
- publication confirmation;
- post URL capture;
- publication receipts;
- edit / delete workflows where supported;
- campaign queues;
- recurring post preparation and publication;
- governed rules for time, audience, privacy, account identity, and publication scope.

Premium automation must remain opt-in and independently enabled. A user who does not enable premium automation retains the complete post-preparation workflow.

## Directory integration contract

A prepared post bundle SHOULD use a provider-neutral shape similar to:

```json
{
  "schema": "stegverse.stegsocials.post-preparation/v1",
  "draft_id": "...",
  "kv_instance_id": "...",
  "erl_refs": ["..."],
  "platform": "linkedin",
  "target_identity_ref": "...",
  "status": "DRAFT_READY",
  "content": {
    "text": "...",
    "title": null,
    "hashtags": [],
    "media_refs": []
  },
  "provenance": {
    "source_hashes": [],
    "prepared_at": "..."
  },
  "publication": {
    "mode": "MANUAL",
    "premium_automation_enabled": false,
    "published_url": null,
    "receipt_ref": null
  }
}
```

Platform-specific preparation adapters may enrich this shape, but they must not erase the common lineage fields.

## KV boundary

- The ERL lane can be globally discoverable or locally curated according to the ERL availability contract.
- Private KV content is not automatically exposed to StegSocials merely because ERL integration exists.
- Users may explicitly attach private KV material to a draft, but that is a separate user-selected action.
- StegSocials drafts remain user-controlled artifacts.
- Automated publication credentials belong in the governed credential surface (for example SKAP / TV-TVC as applicable), not ordinary KV plaintext, Site source, or public evidence bundles.

## Product boundary

```text
STANDARD
ERL discovery -> source selection -> draft generation -> platform shaping -> evidence linkage -> user review -> manual publication

PREMIUM
STANDARD + authenticated connector execution -> scheduling -> automatic publication -> confirmation / receipts -> managed retries / campaigns
```

The product UI should communicate this boundary clearly. Preparing a post is ordinary StegSocials functionality. Acting on an external social account without the user manually publishing is premium automation.

## Relationship to current KV work

This contract is compatible with KV #1 / #2 / #n and provider-neutral storage. It does not depend on a particular provider. A device-local KV, Google Drive KV, iCloud KV, or another eligible provider can expose the same ERL -> StegSocials preparation contract once that KV instance is authentically materialized and readable.

Current source state does not prove arbitrary-provider execution, global ERL mounting, external social connector execution, or automated publication. Those remain separate implementation/runtime predicates.

## Implementation sequence

1. Add a provider-neutral ERL selector to My KV / StegSocials preparation surfaces.
2. Materialize the common draft bundle shape and platform-specific directories.
3. Add platform validators and character/media shaping.
4. Preserve ERL lineage into draft and published evidence bundles.
5. Expose manual-copy/manual-share as the default completion path.
6. Add premium connector execution only behind explicit entitlement and credential/runtime checks.
7. Capture publication receipts and URLs only when authentic connector/platform results are observed.

## README maintenance requirement

Any repository that implements this contract must keep its README current with the distinction between standard post preparation and premium automated posting.
