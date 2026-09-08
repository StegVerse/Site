# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-device-kv-transport`
State: SOURCE_CONTRACT_IMPLEMENTED / DEVICE_KV_CLIENT_TRANSPORT_IMPLEMENTED / RESIDENT_RECEIVER_BINDING_PENDING / SITE_UI_BINDING_PENDING / RUNTIME_ACTIVATION_PENDING
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

## DEVICE_KV client transport — implemented

`assets/my-kv-instance-device-kv-bridge.js` binds the manager contract to the existing registered-Node / generated-InTr / HB-derived-carrier / DEVICE_KV synchronization stack using:

```text
MY_KV_INSTANCE_SET_PROJECTION
MY_KV_PROVIDER_OPERATION_REQUEST
MY_KV_RELATIONSHIP_TRANSITION_REQUEST
```

It exposes `getKVSetProjection`, `requestProviderOperation`, and `requestRelationshipTransition` and remains fail-closed. The set projection may only be returned from an already-admitted source; the browser does not synthesize KV #2, provider identity/state, or relationship state. Provider requests retain `credential_material_present=false`, `provider_operation_authorized=false`, `authority_effect=NONE_REQUEST_ONLY`, and `activation_effect=false`. Relationship requests retain no movement/replication/AI-corpus effects and no mutation authority.

`tests/my-kv-instance-device-kv-bridge.test.cjs` plus the MyKV workflow validate these source boundaries.

## Resident receiver boundary — pending

The current `intr-service-worker.js` local query registry advertises only the previously implemented MyKV directory/connection/installation classes plus personal-profile classes. It does not yet advertise or materialize the three new multi-instance classes.

Therefore this branch must not claim end-to-end DEVICE_KV runtime availability. Until resident receiver binding is added, the current local receiver must fail closed rather than fabricate KV/provider/relationship state.

## Existing boundary preservation

This slice does not broaden or replace `assets/my-kv-directory.js`, `window.StegVerseKVConnectionHealthBridge`, direct-source SKAP mediation, the existing DEVICE_KV query/return classes, or continuity-vault-kit provider/relationship authority.

## README impact preflight determination

No public page behavior changes in this client-only transport slice because the new bridge is not yet loaded by MyKV UI and the resident receiver does not yet materialize the new record classes. The later behavior-changing UI/receiver binding change must update README in the same change set.

## Completion predicates reached

1. bounded KV #1/#2/#n set projection validation is fail-closed;
2. private content and credential/receipt references cannot enter Site projection state;
3. provider operations remain request-only;
4. relationship transitions remain request-only;
5. request schemas bind KV set/instance participants and preserve no-authority fields;
6. DEVICE_KV client transport binds requests to the registered Node, generated InTr, and HB-derived carrier stack;
7. tests prove pending requests claim no provider/relationship runtime effects.

## Next machine work

- extend the resident DEVICE_KV receiver to recognize and validate the three new record classes without inventing source state;
- persist/read only an authentic already-admitted `stegverse.kv.my-kv-set-projection/v1` source for `MY_KV_INSTANCE_SET_PROJECTION`;
- return provider/relationship request acknowledgements that preserve `PENDING_INTERLOCK_INTR` until an authentic governance/provider executor acts;
- add receiver-side exact-request/result tests;
- wire MyKV UI to render KV instances/providers and call only these request surfaces;
- update README when the behavior becomes user-visible;
- validate/merge Site changes;
- then proceed to authentic owner/provider authorization and real KV #2 materialization.

## Manual work

None yet. User-controlled provider authorization/install is expected only after the Site + DEVICE_KV request/return path is ready and authentic provider execution is intentionally invoked.
