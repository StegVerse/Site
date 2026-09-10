# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `document-mykv-service-federation-20260910`
State: SOURCE_CONTRACT_MERGED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_OWNER_OBSERVED_EXACT_READBACK / PERSISTENCE_NOT_GRANTED_DURABILITY_CLASSIFIED / GOOGLE_DRIVE_EXISTING_KV_EXACT_EVIDENCE_RECOVERED / GOOGLE_DRIVE_KV2_PREPARED_PROFILE_MERGED_DEPLOYED / LEGACY_NODE_INTR_OUTBOX_STORE_MISSING_OBSERVED / EVENT_EPHEMERAL_COMPATIBILITY_REPAIR_MERGED_DEPLOYED / AUTHENTIC_OWNER_REQUEST_EMITTED / RESIDENT_INGRESS_OBSERVED / GOOGLE_DRIVE_KV2_NOT_MATERIALIZED / CLOUD_PROVIDER_EXECUTION_PENDING / MYKV_SERVICE_FEDERATION_DESIGN_DOCUMENTED
Updated: 2026-09-10
Authority effect: NONE
Activation effect: false

## Canonical task binding

```text
GOAL TASK ID: KV-CONNECTION-REVALIDATION-WORKER-001
COSV ID: 50000000102000
CANONICAL COSV HANDOFF: StegVerse-Labs/.github/KV_CONNECTION_REVALIDATION_COSV_MIRROR_HANDOFF.md
UPSTREAM CAPABILITY HANDOFF: StegVerse-Labs/continuity-vault-kit/KV_MULTI_INSTANCE_COSV_BINDING_MIRROR_HANDOFF.md
```

## Resident/runtime basis

The current iPhone resident KV remains:

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

No private Drive locator is exposed on the public page. No provider execution, identity rewrite, private-content rewrite, relationship mutation, data movement, replication, or AI-corpus exposure is claimed.

## Merged transport and compatibility basis

Site PR #1122 merged the prepared resident Google Drive KV #2 adoption transport at `b5c3939878bafc7f3aeb40a52458c7a4528c6628` after required validation and Pages deployment.

The first authentic owner attempt then failed before resident ingress because the current registered `stegos-node-v1` IndexedDB predates the `intr_outbox` object store.

Site PR #1124 repaired only that exact legacy-Node condition. It merged at `297301230b0e17ffc6d6050d708847ab75b8ce7e`; all six required gates passed and the exact merge Pages deployment completed successfully.

Normal path remains:

```text
registered Node -> persisted intr_outbox -> generated InTr -> HB-derived carrier -> resident adoption receiver
```

Exact legacy compatibility path remains:

```text
registered Node identity -> generated InTr materialization request -> HB-derived carrier -> STEGOS_NODE_EVENT_EPHEMERAL -> resident adoption receiver
```

The fallback does not claim a durable outbox write, and unrelated queue errors remain fail-closed.

## Authentic owner retry — resident ingress observed

After #1124 deployment, the owner retried the same prepared action once on the current iPhone. The owner-visible result showed:

```text
Resident adoption request emitted.
request_id=SITE-CLOUD-KV-4347408852127319cbda574f02e03edb
governance=PENDING_INTERLOCK_INTR
resident_ingress_observed=true
requested=KV #2
instance_materialized=false
provider_operation_authorized=false
```

The same owner-visible surface also continued to show:

```text
resident KV #1: kvi_0d5d4cfd531db51bbcf7fdfc0311f5dc
resident exact_readback=true
resident durability=BEST_EFFORT_BROWSER_ORIGIN
existing cloud identity: kvi_a31335d2cc3745fa987b635432cfed2c
current cloud ordinal=KV #1
requested peer ordinal=KV #2
relationship=NOT_CONNECTED
private-content rewrite=false
existing-identity rewrite=false
```

This is authentic evidence of request emission and resident ingress. It is not evidence of Google Drive provider execution or KV #2 materialization.

The owner-visible result did **not** display `resident_transport_origin`, `provider_execution_attempted`, `relationship_mutation_attempted`, or `resident_materialization_observed`. Those values must not be inferred from the deployed compatibility code alone.

Canonical Site evidence file:

```text
data/runtime-evidence/google-drive-kv2-owner-retry.20260908.json
```

## Current documentation branch

Branch `document-mykv-service-federation-20260910` records the agreed provider-neutral multi-account service federation architecture. It does not claim provider execution, relationship mutation, synchronization, AI-corpus admission, or runtime activation.

## Agreed MyKV service federation direction — 2026-09-10

The multi-instance/provider model is explicitly extended from storage topology into provider-neutral, multi-account service federation.

Canonical design contract:

```text
docs/MY_KV_SERVICE_FEDERATION_CONTRACT.md
```

The governing federation tuple is:

```text
service_class × provider × account × kv_instance × relationship
```

MyKV is intended to become the preferred user-facing interaction layer for Mail, Calendar, Notes, Files, Contacts, Tasks, Documents, Social, Messaging, Research, Business, Development, Finance, and later registered services. Each service class may expose multiple accounts from one or many providers simultaneously.

Unified views such as `All Inboxes`, `All Calendars`, `All Notes`, or `All Files` are projections only. They do not merge provider custody or erase source identity. Every projected object remains attributable to its source provider/account and carries enough routing state to send mutations back to the exact source binding unless the user explicitly chooses another destination.

The existing relationship progression applies independently per service/account binding:

```text
NOT_CONNECTED
CONNECTED
SYNCED
AI_INTERACTION
```

A Microsoft 365 mail binding may therefore be `AI_INTERACTION` while the same account's OneDrive binding remains only `CONNECTED`. No higher relationship is inferred from a lower one.

Provider credentials, refresh tokens, session tokens, and one-time authentication links remain outside ordinary KV records. MyKV is the interaction/control plane, while credential authority and provider execution remain behind the applicable TV/TVC + Interlock/InTr path. KV may retain admitted provider references, normalized objects, content/evidence commitments, synchronization state, and reconstructable result receipts according to the selected custody posture.

Mail is the first concrete service expected to prove this generalized model. Gmail and Microsoft 365/Outlook accounts should appear together under one MyKV Mail surface with selectable per-account and combined views. Calendar, Notes, Files, and other services inherit the same binding/provenance model rather than receiving one-off architectures.

Magic-link email authentication is explicitly treated as an ephemeral capability flow: MyKV may present/review the message, but the raw usable one-time link is handed transiently to the originating StegBrowser session when same-browser authentication is required and is not promoted into durable KV content.

This design decision does not claim that multi-account service federation is implemented or activated. It establishes the required architecture for subsequent source work and testing.

## README impact determination

This change documents a design contract and updates the canonical task handoff. It does not alter current Site runtime behavior, public UI behavior, provider execution, credential authority, data movement, synchronization, or AI-corpus admission. The existing README already describes Site as a projection/non-authority surface; no runtime claim is added by this documentation-only change. A README functional-scope update becomes required when MyKV service-federation UI or provider behavior is implemented.

## Remaining sequence

1. Validate and merge the owner-retry evidence reconciliation.
2. Propagate the same bounded request evidence to the canonical COSV handoff without strengthening it.
3. Bind request `SITE-CLOUD-KV-4347408852127319cbda574f02e03edb` to authentic downstream Interlock/InTr governance/provider execution.
4. Observe explicit provider execution / downstream result evidence.
5. Materialize the existing Google Drive vault as KV #2 only after that authentic downstream evidence exists.
6. Continue provider authorization through SKAP Vault and relationship progression/recovery testing.
7. Implement the provider-neutral service/account binding schema from `MY_KV_SERVICE_FEDERATION_CONTRACT.md`.
8. Implement selectable single-account, multi-account, and unified service projections without erasing provenance.
9. Bind Gmail and Microsoft 365 Mail as the first cross-provider service-federation proof using existing provider-authority paths rather than creating duplicate credential stacks.
10. Extend the same service federation contract to Calendar, Notes, Files, Contacts, Tasks, Documents, Social, and later registered service classes.
11. Produce authentic current-iPhone evidence for at least two mail accounts visible through one MyKV Mail UI, with exact source-account mutation routing and relationship-state enforcement.
12. Preserve fail-closed behavior for ambiguous account/provider/destination/authority state and verify no raw provider credential or one-time authentication capability is retained in ordinary KV content.

## Manual work

None required during design documentation. Do not emit the Google Drive adoption request again, clear Safari/stegverse.org data, reinstall the resident KV, rebuild the Node, authorize Google Drive, or create another cloud peer until the current request is reconciled downstream.
