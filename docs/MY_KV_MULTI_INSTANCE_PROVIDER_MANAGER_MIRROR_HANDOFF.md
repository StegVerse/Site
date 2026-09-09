# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-google-drive-adoption-resident-transport`
State: SOURCE_CONTRACT_MERGED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_OWNER_OBSERVED_EXACT_READBACK / PERSISTENCE_NOT_GRANTED_DURABILITY_CLASSIFIED / GOOGLE_DRIVE_EXISTING_KV_EXACT_EVIDENCE_RECOVERED / GOOGLE_DRIVE_KV2_PREPARED_PROFILE_IMPLEMENTED / GOOGLE_DRIVE_KV2_RESIDENT_ADOPTION_TRANSPORT_IMPLEMENTED / HOSTED_VALIDATION_PENDING / AUTHENTIC_OWNER_REQUEST_EMISSION_PENDING / CLOUD_PROVIDER_EXECUTION_PENDING / PUBLIC_NAV_README_BINDING_PENDING
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

## Merged resident/runtime basis

Site PR #1115 merged the first-class resident browser KnowledgeVault and its deployed installer. The current iPhone subsequently reported:

```text
State: INSTALLED
Instance: KV #1 · kvi_0d5d4cfd531db51bbcf7fdfc0311f5dc
Set: personal
Storage: device-local-browser-indexeddb
Relationship: NOT_CONNECTED
Persistence: requested; granted=false
Exact readback: true
```

PR #1120 merged at `aaa8a8d253534bd53afbec075b376d73401ad18c` after all required Site gates passed. It permanently records the owner-observed resident runtime evidence, classifies `granted=false` durability as `BEST_EFFORT_BROWSER_ORIGIN`, and records the exact existing Google Drive adoption evidence. The organization-level COSV reconciliation then merged through `StegVerse-Labs/.github` PR #1202 at `374170455b82278845a3f7f972615b4d3d670977` without altering the fail-closed COSV vector.

## Existing Google Drive cloud KV

The historical Google Drive KnowledgeVault remains intact and authentic:

```text
existing cloud instance_id:
kvi_a31335d2cc3745fa987b635432cfed2c

current ordinal: 1
requested peer ordinal: 2
relationship: NOT_CONNECTED

adoption.receipt.json:
sha256:64a3af27be0bd6ae36b05b35e52894581413fff048cea237d370d0ec6248b552

my-kv-set-projection.json:
sha256:187ab43f0bb09d88da154af26d57e1bfe7199fd90affd2dd81af5532f0e34cf4
```

No private Drive folder locator is required by the new public request surface.

## Current slice — prepared resident adoption transport

`data/kv/google-drive-existing-peer-adoption-profile.json` contains the non-secret prepared evidence required to construct the existing-peer request. It deliberately omits the physical Google Drive folder locator.

`cloud-kv-peers.html` now exposes a dedicated one-action flow:

```text
Emit governed Google Drive KV #2 adoption request
```

The owner no longer needs to select Google Drive files or type the recovered instance ID/hashes.

The page first verifies the installed resident KV, loads the bounded prepared profile, calls `StegVerseCloudKVPeers.adoptRequest(...)` so the request receives a fresh `SITE-CLOUD-KV-*` request ID and the authentic current resident instance binding, then sends that request through `StegVerseCloudKVAdoptionTransport.submit(...)`.

## Dedicated resident transport

New files:

```text
assets/cloud-kv-adoption-device-kv-bridge.js
assets/cloud-kv-adoption-device-kv-receiver.js
```

The bridge uses the existing registered Node, generated InTr intent/materialization request, and HB-derived carrier path. It uses a dedicated record class:

```text
MY_KV_CLOUD_PEER_ADOPTION_REQUEST
```

The dedicated service-worker receiver accepts only that bounded record class and validates the exact cloud adoption request contract. It writes only its local result/receipt store; it does not mutate the cloud vault or resident KV identity.

A successful resident acknowledgement means only:

```text
resident_ingress_observed=true
resident_materialization_observed=true
governance_state=PENDING_INTERLOCK_INTR
instance_materialized=false
provider_execution_attempted=false
provider_operation_authorized=false
relationship_mutation_attempted=false
relationship_mutation_authorized=false
data_moved=false
replication_started=false
ai_corpus_exposed=false
credential_material_present=false
authority_effect=NONE_RESULT_DELIVERY_ONLY
```

The original cloud request ID is preserved separately from the transport request ID so the request can be reconciled into later authentic governance/provider execution evidence.

## Validation

`tests/cloud-kv-adoption-resident-transport.test.cjs` validates the prepared profile, bridge request boundaries, receiver fail-closed markers, public-page one-action path, and absence of the private Drive locator from the prepared public surface.

`.github/workflows/cloud-kv-peer-manager.yml` now validates both the original cloud-peer request contract and the new resident adoption transport.

## Remaining sequence

1. Run exact-head hosted validation for this slice and repair any failures.
2. Merge and confirm Pages deployment.
3. Current iPhone: open the deployed Cloud KV Peers page and tap the one prepared Google Drive KV #2 adoption-request button once.
4. Capture the authentic generated `SITE-CLOUD-KV-*` request ID plus `resident_ingress_observed=true` result.
5. Reconcile that authentic owner/runtime request evidence into Site and COSV without changing the vector beyond observed predicates.
6. Bind the still-pending request to authentic Interlock/InTr governance/provider execution.
7. Materialize the Google Drive vault as KV #2 only after provider/governance result evidence exists and provenance/private contents remain preserved.
8. Add a new iCloud or other cloud-hosted KV as KV #3/#n.
9. Resolve provider credentials through SKAP Vault only and prove CONNECT/VERIFY/READ/WRITE/SYNC/DISCONNECT.
10. Prove relationship progression/downgrade/recovery and use cloud recovery/replication to mitigate `BEST_EFFORT_BROWSER_ORIGIN` durability.
11. Publish ordinary My KV navigation/README when the live resident/cloud workflow is established.

## Manual work

None required until this branch validates, merges, and deploys. Do not reinstall the resident KV, clear Safari/stegverse.org website data, select Google Drive files, re-enter adoption hashes, or authorize a cloud provider yet.
