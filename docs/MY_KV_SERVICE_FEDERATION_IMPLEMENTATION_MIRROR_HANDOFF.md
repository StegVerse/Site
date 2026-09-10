# MyKV Service Federation Implementation Mirror Handoff

Updated: 2026-09-10
Repository: `StegVerse-Labs/Site`
Goal Task ID: `KV-CONNECTION-REVALIDATION-WORKER-001`
COSV: `50000000102000`
Parent handoff: `docs/MY_KV_MULTI_INSTANCE_PROVIDER_MANAGER_MIRROR_HANDOFF.md`
Design contract: `docs/MY_KV_SERVICE_FEDERATION_CONTRACT.md`
PR: `#1196`
State: `SOURCE_IMPLEMENTED / VALIDATION_PENDING / PROVIDER_RUNTIME_NOT_ACTIVATED`

## Implemented source

`assets/my-kv-service-federation.js` now implements the provider-neutral binding and onboarding core described by the design contract.

Implemented source surfaces:

- `stegverse.kv.service-binding/v1` validation;
- `stegverse.site.my-kv.account-onboarding-request/v1` construction;
- `stegverse.kv.service-projection/v1` unified projections;
- multiple accounts from the same or different providers;
- independent relationship state per service/account binding;
- `REFERENCE_ONLY`, `SYNCED_TO_KV`, and `KV_PRIMARY_OR_SOVEREIGN` custody posture validation;
- exact `service_class × provider × account × kv_instance × relationship` binding keys;
- selectable service projections that preserve provenance and explicitly state `custody_merged=false`;
- SKAP-first onboarding request semantics with provider-native authorization fallback;
- required provider capability discovery after authorization;
- fail-closed default relationship state `NOT_CONNECTED`;
- explicit defaults of no sync, no AI interaction, no destructive mutation, no sharing, and no publication;
- credential-like field rejection in ordinary federation projections/results;
- `PENDING_INTERLOCK_INTR` account onboarding requests with `provider_operation_authorized=false`.

## Tests

`tests/my-kv-service-federation.test.cjs` covers:

- service binding validation;
- multi-account/multi-provider projection;
- independent relationship state by binding;
- sensitive-field rejection;
- duplicate binding rejection;
- SKAP-first onboarding request semantics;
- fail-closed behavior when no governed onboarding bridge exists.

`.github/workflows/my-kv-instance-manager.yml` now runs the federation test and checks the new fail-closed source markers.

## Authority boundary

This source does not connect Gmail, Microsoft 365, iCloud, OneDrive, Google Drive, or any other provider. It does not receive or store credentials, does not call SKAP directly, does not mint Interlock/InTr admission, and does not mutate provider state.

The onboarding source constructs only a governed request whose credential destination is `SKAP_VAULT`, whose provider authorization state is false, and whose governance state is `PENDING_INTERLOCK_INTR`.

Provider credential custody remains TV/TVC + SKAP. Provider operation admission remains Interlock/InTr. Provider-specific adapters remain separately owned.

## Runtime completion predicates

Authentic completion still requires, at minimum:

1. one current-iPhone MyKV instance loads the federation source;
2. owner chooses `Add account`;
3. one provider-native authorization flow completes under TV/TVC + SKAP without ordinary KV credential persistence;
4. provider capability discovery returns an observed service set;
5. MyKV materializes only admitted non-secret service/account bindings;
6. at least two mail accounts from distinct bindings appear in one MyKV Mail projection;
7. a provider-affecting action routes to the exact originating account and provider;
8. unified view does not erase provenance or merge custody;
9. relationship state remains independently selectable per binding;
10. no raw credential, refresh token, session token, magic-link token, or equivalent capability appears in ordinary KV content;
11. runtime receipts are retained through the canonical evidence/custody path.

## README impact

This source adds a real federation/onboarding implementation surface but does not yet expose a public runtime UI or provider execution path. The root README should be updated before merge to list the new source and explicitly state its non-authorizing, runtime-unproven status. Until that update lands, this handoff is the current implementation scope record.
