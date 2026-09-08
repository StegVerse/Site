# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-provider-shape-alignment`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_RESIDENT_TRANSPORT_MERGED / PREPUBLICATION_UI_MERGED / CANONICAL_PROVIDER_SHAPE_ALIGNMENT_IN_PROGRESS / PUBLIC_NAV_README_BINDING_PENDING / AUTHENTIC_SET_PROJECTION_PENDING / PROVIDER_ACTIVATION_PENDING
Updated: 2026-09-08
Authority effect: NONE
Activation effect: false

## Canonical task binding

```text
GOAL TASK ID: KV-CONNECTION-REVALIDATION-WORKER-001
COSV ID: 50000000102000
CANONICAL COSV HANDOFF: StegVerse-Labs/.github/KV_CONNECTION_REVALIDATION_COSV_MIRROR_HANDOFF.md
UPSTREAM CAPABILITY HANDOFF: StegVerse-Labs/continuity-vault-kit/KV_MULTI_INSTANCE_COSV_BINDING_MIRROR_HANDOFF.md
```

## Merged baseline

Site PR #1109 merged the bounded resident DEVICE_KV transport at `1c5396d186b2a8674f265733d91c542d472d20fd`. Site PR #1110 merged the intentionally unlinked MyKV #1/#2/#n prepublication UI candidate at `5977b53c8ac43099b4d2cecf27cdc4c78e4c4882`.

The resident receiver returns `MY_KV_INSTANCE_SET_PROJECTION` only from an already-admitted `_System/my-kv-set-projection.json`. Missing projection state fails closed. Provider and relationship requests remain `PENDING_INTERLOCK_INTR`; provider execution, relationship mutation, data movement, replication, AI-corpus exposure, credential authority, and activation authority remain false.

## Canonical provider-shape alignment — current slice

The continuity-vault-kit canonical projection emits provider status under:

```text
instance.providers.items
instance.providers.pending_requests
instance.providers.provider_mutation_authorized=false
instance.providers.credential_material_included=false
```

The merged Site UI candidate previously read a synthetic singular `instance.provider`, which would have hidden authentic provider rows after real projection admission. The current branch corrects that mismatch.

`assets/my-kv-instance-manager.js` now requires the canonical plural provider object, requires `provider_mutation_authorized=false` and `credential_material_included=false`, validates provider item rows and pending requests, and rejects singular `instance.provider` input. `assets/my-kv-instance-ui.js` summarizes all canonical provider rows and pending requests. `my-kv-instances.html` renders storage, provider rows, pending provider requests, relationship tier, and relationship governance state without inferring provider connection or execution.

## Upstream physical-KV prerequisite

The connected Google Drive KnowledgeVault contains the canonical `_System/installation.receipt.json` but no `_System/Instances` layout, establishing that the physical KV predates the multi-instance identity model. `StegVerse-Labs/continuity-vault-kit` PR #203 is the current non-destructive KV #1 adoption source slice. It is designed to bind apply mode to the exact existing installation-receipt SHA-256, refuse overwrites, preserve private content and the original installation receipt, create only canonical KV #1 identity/adoption/projection records, and default relationship state to `NOT_CONNECTED` with no provider or relationship authority.

## Publication and authority boundary

This provider-shape branch does not activate public navigation or modify README semantics. It does not admit the physical KV #1 projection, create KV #2, authenticate a provider, execute provider operations, move/replicate data, or expose an AI corpus. Site remains a bounded projection/request surface only.

## Next machine work

1. validate and merge the Site provider-shape alignment;
2. validate and merge continuity-vault-kit PR #203;
3. run the owner-controlled non-destructive adoption plan against the existing Google Drive KnowledgeVault and bind the exact installation-receipt SHA-256;
4. materialize the authentic KV #1 identity/adoption receipt/set projection only after exact binding;
5. admit that exact `_System/my-kv-set-projection.json` into resident DEVICE_KV and verify exact MyKV readback;
6. integrate public MyKV navigation + README without weakening the authority boundary;
7. only then request owner-controlled materialization/authorization for real KV #2.

## Manual work

None yet. Do not manually create `_System/Instances`, `instance.json`, `adoption.receipt.json`, or `my-kv-set-projection.json`, and do not authorize KV #2. The next manual action begins only after the two source PRs are green/merged and must bind the exact current installation receipt before any physical KV mutation.
