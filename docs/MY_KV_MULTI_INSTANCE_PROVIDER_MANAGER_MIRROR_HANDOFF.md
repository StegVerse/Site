# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `document-mykv-service-federation-20260910`
Updated: 2026-09-10
Goal Task ID: `KV-CONNECTION-REVALIDATION-WORKER-001`
COSV ID: `50000000102000`
State: `SOURCE_CONTRACT_MERGED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_OWNER_OBSERVED_EXACT_READBACK / PERSISTENCE_NOT_GRANTED_DURABILITY_CLASSIFIED / GOOGLE_DRIVE_EXISTING_KV_EXACT_EVIDENCE_RECOVERED / GOOGLE_DRIVE_KV2_PREPARED_PROFILE_MERGED_DEPLOYED / AUTHENTIC_OWNER_REQUEST_EMITTED / RESIDENT_INGRESS_OBSERVED / GOOGLE_DRIVE_KV2_NOT_MATERIALIZED / CLOUD_PROVIDER_EXECUTION_PENDING / MYKV_SERVICE_FEDERATION_SOURCE_IMPLEMENTED / SKAP_FIRST_ACCOUNT_ONBOARDING_SOURCE_IMPLEMENTED / VALIDATION_IN_PROGRESS`
Authority effect: `NONE`
Activation effect: `false`

## Canonical bindings

- Canonical COSV handoff: `StegVerse-Labs/.github/KV_CONNECTION_REVALIDATION_COSV_MIRROR_HANDOFF.md`
- Upstream capability handoff: `StegVerse-Labs/continuity-vault-kit/KV_MULTI_INSTANCE_COSV_BINDING_MIRROR_HANDOFF.md`
- Service federation contract: `docs/MY_KV_SERVICE_FEDERATION_CONTRACT.md`
- Federation implementation handoff: `docs/MY_KV_SERVICE_FEDERATION_IMPLEMENTATION_MIRROR_HANDOFF.md`
- Active PR: `StegVerse-Labs/Site#1196`

## Existing resident/runtime basis

Current owner-observed iPhone resident KV remains:

```text
State: INSTALLED
Instance: KV #1 · kvi_0d5d4cfd531db51bbcf7fdfc0311f5dc
Set: personal
Storage: device-local-browser-indexeddb
Relationship: NOT_CONNECTED
Persistence: requested; granted=false
Durability: BEST_EFFORT_BROWSER_ORIGIN
Exact readback: true
```

Existing Google Drive cloud identity remains:

```text
instance_id: kvi_a31335d2cc3745fa987b635432cfed2c
current ordinal: KV #1
requested peer ordinal: KV #2
relationship: NOT_CONNECTED
adoption.receipt.json: sha256:64a3af27be0bd6ae36b05b35e52894581413fff048cea237d370d0ec6248b552
my-kv-set-projection.json: sha256:187ab43f0bb09d88da154af26d57e1bfe7199fd90affd2dd81af5532f0e34cf4
```

The owner-visible retry after Site #1124 showed:

```text
request_id=SITE-CLOUD-KV-4347408852127319cbda574f02e03edb
governance=PENDING_INTERLOCK_INTR
resident_ingress_observed=true
requested=KV #2
instance_materialized=false
provider_operation_authorized=false
```

This proves bounded request emission and resident ingress only. It does not prove Google Drive provider execution, KV #2 materialization, relationship mutation, synchronization, or AI-corpus exposure.

## Agreed MyKV service federation architecture

MyKV is the preferred provider-neutral interaction shell over independently owned external services. The federation key is:

```text
service_class × provider × account × kv_instance × relationship
```

Initial service classes include Mail, Calendar, Notes, Files, Contacts, Tasks, Documents, Social, Messaging, Research, Business, Development, Finance, and later registered services.

A service may expose zero, one, or many account bindings. Multiple accounts from the same provider and multiple providers for one service are valid simultaneously. Unified views such as `All Inboxes`, `All Calendars`, `All Notes`, and `All Files` are projections only; provider/account provenance and exact mutation routing remain intact.

Relationship state applies independently per service/account binding:

```text
NOT_CONNECTED
CONNECTED
SYNCED
AI_INTERACTION
```

No higher state is inferred from a lower state. Authorization of one provider account does not automatically authorize sync, AI interaction, destructive mutation, sharing, or publication.

## SKAP-first account onboarding

The preferred owner UX is one account-add operation:

```text
MyKV -> Add account
-> owner supplies the provider-required credential OR completes provider-native authorization
-> credential/capability is sealed/resolved through SKAP under TV/TVC authority
-> provider capabilities are discovered
-> MyKV materializes non-secret candidate service/account bindings
-> Interlock/InTr governs requested service/relationship activation
-> admitted projections appear in MyKV
```

The UX must support passwords where a provider still accepts them, and provider-native OAuth, MFA, passkeys, device approval, magic links, or equivalent authorization challenges without requiring repetitive per-service configuration.

Credential material, refresh tokens, session tokens, private keys, reusable API secrets, and one-time authentication links are prohibited from ordinary KV federation projections.

## Implemented source in PR #1196

`assets/my-kv-service-federation.js` now implements:

- `stegverse.kv.service-binding/v1` validation;
- `stegverse.site.my-kv.account-onboarding-request/v1` construction;
- `stegverse.kv.service-projection/v1` unified projections;
- multi-account and multi-provider bindings;
- provenance-preserving unified projections with `custody_merged=false`;
- independent relationship state per binding;
- custody posture validation for `REFERENCE_ONLY`, `SYNCED_TO_KV`, and `KV_PRIMARY_OR_SOVEREIGN`;
- SKAP-first onboarding requests with `credential_destination=SKAP_VAULT`;
- provider capability discovery requirement;
- `relationship_default=NOT_CONNECTED`;
- default false values for sync, AI interaction, destructive mutation, sharing, publication, and provider-operation authority;
- `PENDING_INTERLOCK_INTR` governance state;
- fail-closed rejection of credential-like fields in ordinary federation projections/results.

`tests/my-kv-service-federation.test.cjs` covers binding validation, multiple accounts/providers, independent per-binding relationships, secret rejection, duplicate rejection, SKAP-first onboarding semantics, and fail-closed behavior without a governed onboarding bridge.

`.github/workflows/my-kv-instance-manager.yml` now runs the federation suite and static fail-closed checks. Initial federation validation run `34524573983` failed because the generic sensitive-field scanner incorrectly rejected the explicit `credential_material_present=false` sentinel. Source was repaired in commit `04e3490e8d8fc8bad3869376bd761d35596a208a` to allow that sentinel only when it is exactly false. Follow-up validation run `34524646420` is the current validation target.

## Authority boundary

The new Site source does not itself connect Gmail, Microsoft 365, iCloud, Google Drive, OneDrive, or any other provider. It does not receive provider credentials, execute provider operations, mint Interlock/InTr admission, or activate relationships.

Credential/provider authorization remains behind TV/TVC + SKAP. Governed provider/service activation remains behind Interlock/InTr. Source presence, CI success, merge, or public deployment is not provider runtime evidence.

Magic-link authentication remains ephemeral: MyKV may display/review the mail object, but a usable one-time link must be handed transiently to the originating StegBrowser session when same-browser binding is required and must not become durable ordinary KV content.

## Runtime completion predicates

Authentic service-federation completion still requires:

1. current-iPhone MyKV loads the federation implementation;
2. owner initiates one `Add account` flow;
3. provider-native authorization completes under TV/TVC + SKAP without ordinary KV secret persistence;
4. provider capability discovery returns an observed service set;
5. only admitted non-secret service/account bindings are materialized;
6. at least two mail account bindings are selectable in one MyKV Mail surface;
7. unified Mail view preserves provider/account provenance;
8. at least one provider-affecting operation routes to the exact originating account/provider;
9. relationship state is independently selectable and enforced per binding;
10. no raw credential, refresh token, session token, magic-link token, or equivalent capability is retained in ordinary KV content;
11. runtime result/evidence receipts enter the canonical custody/reconstruction path.

## Remaining work

- Finish and verify PR #1196 validation.
- Update root `README.md` before merge to list the federation source and its non-authorizing/runtime-unproven status.
- Merge only after required checks are green and README maintenance is complete.
- Preserve the existing Google Drive KV #2 request as pending until authentic downstream InTr/provider evidence exists; do not re-emit it.
- Bind Gmail and Microsoft 365 Mail as the first cross-provider runtime proof using existing TV/TVC provider-authority paths, not duplicate credential stacks.
- Extend the same binding/provenance model to Calendar, Notes, Files, Contacts, Tasks, Documents, Social, and later registered service classes.

## Manual work

None required for the current source/validation work. Do not re-emit the Google Drive adoption request, clear Safari/stegverse.org data, reinstall the resident KV, rebuild the Node, authorize Google Drive, or create another cloud peer while the existing request remains pending downstream reconciliation.
