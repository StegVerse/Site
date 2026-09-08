# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-my-kv-ui-binding`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_RESIDENT_TRANSPORT_MERGED / PREPUBLICATION_UI_IMPLEMENTED / PUBLIC_NAV_README_BINDING_PENDING / AUTHENTIC_SET_PROJECTION_PENDING / PROVIDER_ACTIVATION_PENDING
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

## Merged source + resident transport

Site consumes the bounded projection defined by the continuity-vault-kit KV #1/#2/#n workstream. `assets/my-kv-instance-manager.js` validates `stegverse.kv.my-kv-set-projection/v1` and provides request-only provider and relationship surfaces. `assets/my-kv-instance-device-kv-bridge.js` plus `assets/my-kv-n-device-kv-receiver.js` were merged through Site PR #1109 at `1c5396d186b2a8674f265733d91c542d472d20fd`.

The resident receiver returns `MY_KV_INSTANCE_SET_PROJECTION` only from an already-admitted `_System/my-kv-set-projection.json`. Missing projection state fails closed. Provider and relationship requests remain `PENDING_INTERLOCK_INTR`; provider execution, relationship mutation, data movement, replication, AI-corpus exposure, credential authority, and activation authority remain false.

## Prepublication UI candidate — implemented on current branch

`my-kv-instances.html` is an intentionally unlinked candidate page. It loads:

- `assets/stegverse-node-continuity.js`
- `assets/generated/site-browser-intr-connectors.js`
- `assets/hb-intr-carrier.js`
- `assets/my-kv-instance-manager.js`
- `assets/my-kv-instance-device-kv-bridge.js`
- `assets/my-kv-instance-ui.js`

The page:

1. renders only an authentic admitted KV-set projection;
2. explicitly states that missing projection state does not create or imply KV #2;
3. renders KV #1/#2/#n instance/provider/relationship status from the validated projection only;
4. emits provider operations only through `requestProviderOperation` as `PENDING_INTERLOCK_INTR`;
5. emits relationship tier requests only through `requestRelationshipTransition` as `PENDING_INTERLOCK_INTR`;
6. explicitly preserves `provider_operation_authorized=false`, `data_moved=false`, `replication_started=false`, and `ai_corpus_exposed=false` semantics.

`tests/my-kv-instance-ui.test.cjs` and `.github/workflows/my-kv-instance-manager.yml` validate the candidate and reject true-valued provider execution, relationship mutation, data movement, replication, or AI-corpus effect markers.

## Publication boundary

The candidate is not linked from the existing `my-kv.html` onboarding flow or ordinary Site navigation in this slice. Therefore this branch does not claim public navigation activation. README/navigation integration is still required in one later public-activation change before this candidate is treated as an ordinary public MyKV capability surface.

## Existing boundary preservation

Site does not own KV instance state, provider state, relationship state, credentials, provider sessions, or governance admission. The current work does not widen `intr-service-worker.js`, existing MyKV directory/installation/profile semantics, or continuity-vault-kit provider/relationship authority.

## Next machine work

- validate and merge the prepublication UI candidate;
- in a separately claimed public-activation change, link the validated candidate from My KV navigation and update repository README without destructive replacement;
- establish authentic admitted `_System/my-kv-set-projection.json` from the canonical continuity-vault-kit projection path;
- verify the current device can read that projection end-to-end;
- only then request user-controlled provider authorization/materialization for real KV #2.

## Manual work

No user action is required yet. Do **not** create, connect, or authorize KV #2 from a provider UI yet. Provider authorization becomes appropriate only after authentic KV-set projection admission and public MyKV integration are complete. At that point manual instructions must name the exact provider, exact account/folder selection, exact requested scope, expected receipt/state, and what evidence to return.
