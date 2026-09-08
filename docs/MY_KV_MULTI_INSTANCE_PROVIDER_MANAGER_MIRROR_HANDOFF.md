# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-provider-manager`
State: SOURCE_CONTRACT_IMPLEMENTED / SITE_UI_BINDING_PENDING / DEVICE_KV_TRANSPORT_PENDING / RUNTIME_ACTIVATION_PENDING
Updated: 2026-09-08
Authority effect: NONE
Activation effect: false

## Canonical task binding

This handoff does **not** create a new StegVerse task.

```text
GOAL TASK ID: KV-CONNECTION-REVALIDATION-WORKER-001
COSV ID: 50000000102000
CANONICAL COSV HANDOFF: StegVerse-Labs/.github/KV_CONNECTION_REVALIDATION_COSV_MIRROR_HANDOFF.md
UPSTREAM CAPABILITY HANDOFF: StegVerse-Labs/continuity-vault-kit/KV_MULTI_INSTANCE_COSV_BINDING_MIRROR_HANDOFF.md
```

The Site slice consumes the bounded projection defined by merged `continuity-vault-kit` PRs #196-#201. Site does not own KV instance state, provider state, relationship state, credentials, provider sessions, or governance admission.

## Source contract

`assets/my-kv-instance-manager.js` validates `stegverse.kv.my-kv-set-projection/v1` and provides request-only surfaces for:

```text
Provider: CONNECT / VERIFY / READ / WRITE / SYNC / DISCONNECT
Relationship: NOT_CONNECTED / CONNECTED / SYNCED / AI_INTERACTION
```

The manager rejects:

- private-content projection;
- credential-material projection;
- raw secrets/tokens/private keys;
- SKAP credential references in the public Site projection;
- Interlock or InTr receipt references in the public Site projection;
- provider or relationship mutation authority;
- duplicate KV instance IDs or ordinals;
- cross-set instance substitution;
- invalid relationship tiers or provider operations.

Provider and relationship actions are emitted only as `PENDING_INTERLOCK_INTR` requests. Pending relationship requests must explicitly claim `data_moved=false`, `replication_started=false`, and `ai_corpus_exposed=false`.

## Existing boundary preservation

This slice does not broaden or replace:

- `assets/my-kv-directory.js` read-only direct-source/directory-health contracts;
- `window.StegVerseKVConnectionHealthBridge`;
- direct-source SKAP mediation;
- the existing DEVICE_KV query/return classes;
- continuity-vault-kit provider-operation or relationship-state authority.

A separate resident bridge must later transport the bounded KV-set projection and governed requests.

## README impact preflight determination

No repository README mutation is required in this source-only slice because no public page, runtime route, service worker, provider execution path, or user-visible Site behavior is changed yet. The new asset is not loaded by a public page and grants no new capability until the later Site UI/DEVICE_KV binding change. That later behavior-changing change must update README in the same change set.

## Completion predicates for this slice

1. bounded KV #1/#2/#n set projection is validated fail-closed;
2. private content and credential/receipt references cannot enter Site projection state;
3. provider operations can only be requested, never directly executed;
4. relationship transitions can only be requested, never directly materialized;
5. request schemas bind `kv_set_id`, `instance_id`/participants, operation/tier, and fail-closed authority fields;
6. tests prove pending requests claim no provider/relationship runtime effects;
7. no existing direct-source/connection-health authority boundary is weakened.

## Next machine work

- add DEVICE_KV bounded `MY_KV_INSTANCE_SET_PROJECTION` transport;
- add governed provider/relationship request transport classes;
- wire MyKV user interface to render KV instances/providers and call only these request surfaces;
- validate/merge Site changes;
- then proceed to authentic owner/provider authorization and real KV #2 materialization.

## Manual work

None for this source contract. User-controlled provider authorization/install is expected only after the Site + DEVICE_KV request/return path is ready.
