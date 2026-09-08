# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-device-kv-transport`
State: SOURCE_CONTRACT_IMPLEMENTED / DEVICE_KV_RESIDENT_TRANSPORT_IMPLEMENTED / SITE_UI_BINDING_PENDING / AUTHENTIC_SET_PROJECTION_PENDING / PROVIDER_ACTIVATION_PENDING
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

The manager rejects private-content projection, credential-material projection, raw secrets/tokens/private keys, public SKAP credential references, Interlock/InTr receipt references, provider/relationship mutation authority, duplicate KV identities/ordinals, cross-set substitution, and invalid operations/tiers.

Provider and relationship actions are emitted only as `PENDING_INTERLOCK_INTR` requests. Pending relationship requests explicitly preserve `data_moved=false`, `replication_started=false`, and `ai_corpus_exposed=false`.

## DEVICE_KV resident transport — implemented

`assets/my-kv-instance-device-kv-bridge.js` binds the manager contract to the registered StegVerse Node, generated InTr materialization request, HB-derived carrier binding, and a dedicated resident MyKV #n service-worker receiver.

The bridge transports:

```text
MY_KV_INSTANCE_SET_PROJECTION
MY_KV_PROVIDER_OPERATION_REQUEST
MY_KV_RELATIONSHIP_TRANSITION_REQUEST
```

It exposes `getKVSetProjection`, `requestProviderOperation`, and `requestRelationshipTransition` and remains fail-closed. The browser queues the exact materialization in the registered Node outbox, derives a hash-bound `STEGVERSE_MY_KV_N_LOCAL_TRIGGER`, and sends that trigger to the dedicated resident receiver.

`assets/my-kv-n-device-kv-receiver.js` is intentionally narrow. It consumes only valid registered-Node outbox triggers whose materialization destination remains `KV / KnowledgeVault:Interlock` with downstream owner `StegVerse-Labs/continuity-vault-kit#79`.

The receiver:

- returns `MY_KV_INSTANCE_SET_PROJECTION` only from an already-admitted `_System/my-kv-set-projection.json` row in the resident DEVICE_KV store;
- fails closed with `my_kv_set_projection_not_admitted` when no authentic projection is present;
- accepts provider operations only as pending governance records and preserves `provider_execution_attempted=false` and `provider_operation_authorized=false`;
- accepts relationship transitions only as pending governance records and preserves `relationship_mutation_attempted=false`, `data_moved=false`, `replication_started=false`, and `ai_corpus_exposed=false`;
- writes its result receipt write-once in `stegverse-my-kv-n-device-kv-v1`;
- grants no credential, provider, relationship, transition, execution, or activation authority.

This avoids widening the global `/intr-service-worker.js` registry or changing HIL, SV001, MyKV directory, installation, or personal-profile receiver semantics.

## Validation

`tests/my-kv-instance-device-kv-bridge.test.cjs` validates the client-side request boundaries.

`.github/workflows/my-kv-instance-manager.yml` now also:

- syntax-checks `assets/my-kv-n-device-kv-receiver.js`;
- verifies the three MyKV #n classes and resident trigger binding;
- requires the already-admitted set-projection source path;
- requires all provider/relationship runtime-effect fields to remain false;
- rejects explicit true-valued provider execution, relationship mutation, data movement, replication, AI-corpus exposure, or provider/relationship authorization markers in the receiver.

## Existing boundary preservation

This slice does not broaden or replace `assets/my-kv-directory.js`, `window.StegVerseKVConnectionHealthBridge`, direct-source SKAP mediation, the existing general DEVICE_KV query/return classes, `intr-service-worker.js`, or continuity-vault-kit provider/relationship authority.

## README impact preflight determination

No public page behavior changes yet because the new bridge is not loaded by MyKV UI. README mutation becomes required in the same change set that exposes the MyKV #n manager/receiver in user-visible Site behavior.

## Completion predicates reached

1. bounded KV #1/#2/#n set projection validation is fail-closed;
2. private content and credential/receipt references cannot enter Site projection state;
3. provider operations remain request-only;
4. relationship transitions remain request-only;
5. request schemas bind KV set/instance participants and preserve no-authority fields;
6. DEVICE_KV transport binds exact requests to the registered Node, generated InTr materialization, and HB-derived carrier;
7. a dedicated resident receiver consumes hash-bound Node outbox triggers;
8. the resident receiver can return only an already-admitted KV-set projection;
9. provider/relationship receiver acknowledgements remain governance-pending and claim zero runtime effects;
10. validation rejects provider execution, relationship mutation, data movement, replication, AI-corpus exposure, or credential authority in this Site receiver lane.

## Next machine work

- wire MyKV UI to load `assets/my-kv-instance-manager.js` and `assets/my-kv-instance-device-kv-bridge.js`;
- render KV #1/#2/#n status from authentic `MY_KV_INSTANCE_SET_PROJECTION` only;
- expose provider-operation and relationship-transition request controls without direct mutation authority;
- update README in that user-visible behavior change;
- validate and merge Site PR #1109;
- then establish an authentic admitted `_System/my-kv-set-projection.json` from the canonical continuity-vault-kit projection path;
- only after that, invoke user-controlled provider authorization to materialize real KV #2 and verify an end-to-end provider request/receipt.

## Manual work

None at this exact point. Do **not** create or authorize KV #2 yet. Manual provider authorization becomes appropriate only after the Site UI is wired and the authentic set projection is admitted. At that point the handoff must name the exact provider, account/folder choice, authorization scope, expected receipt, and return-to-chat evidence before asking the user to act.
