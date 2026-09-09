# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-resident-runtime-cloud-adoption`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_TRANSPORT_MERGED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_OWNER_OBSERVED_EXACT_READBACK / PERSISTENCE_NOT_GRANTED_DURABILITY_CLASSIFIED / PHYSICAL_GOOGLE_DRIVE_KV_EXACT_EVIDENCE_RECOVERED / GOOGLE_DRIVE_KV2_ADOPTION_INPUT_PREPARED / CLOUD_PROVIDER_EXECUTION_PENDING / PUBLIC_NAV_README_BINDING_PENDING
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

## Resident KV — installed and owner-observed

Site PR #1115 merged at `571821a609a6ec17b1a8b4a307a9de9d84a35028`; its Pages deployment completed successfully.

The owner then executed the deployed installer on the current iPhone. The deployed Site reported:

```text
State: INSTALLED
Instance: KV #1 · kvi_0d5d4cfd531db51bbcf7fdfc0311f5dc
Set: personal
Storage: device-local-browser-indexeddb
Relationship: NOT_CONNECTED
Persistence: requested; granted=false
Exact readback: true
```

Repository evidence:

```text
data/runtime-evidence/device-local-kv-install.owner-observation.20260908.json
```

This is authentic owner-observed runtime evidence from the deployed Site surface. It is not represented as independent machine observation.

The resident KnowledgeVault remains distinct from DEVICE_KV transport/cache:

```text
resident KV database: stegverse-device-local-kv-v1
DEVICE_KV transport/cache: stegverse-device-local-intr-v1
```

## Durability correction

`assets/device-local-kv-installer.js` now classifies durability directly from the installation receipt:

```text
persistent_storage_granted=true
  -> PERSISTENT_BROWSER_STORAGE_GRANTED

persistent_storage_granted=false
  -> BEST_EFFORT_BROWSER_ORIGIN
     cloud_recovery_recommended=true
```

The current iPhone observed `persistent_storage_granted=false`, so exact readback is proven but survival under browser-origin eviction is not overclaimed. Cloud peer recovery/replication is the intended durability path after authentic provider connection.

## Cloud peer source — merged

Site PR #1116 merged at `470642c3b1767f7a857b1e633602c041a7b55cb2` after the Cloud KV Peer Manager, Device Local KV Install, My KV Multi-Instance Provider Manager, Site Handoff Orchestrator, Ecosystem Heartbeat Orchestration, and Site Bootstrap validations passed.

Supported cloud media:

```text
icloud-drive
google-drive
onedrive
dropbox
```

Cloud operations remain bounded requests only:

```text
CREATE_CLOUD_KV_PEER
ADOPT_EXISTING_CLOUD_KV_PEER
```

Every request requires resident KV exact readback, requested ordinal >= 2, initial `NOT_CONNECTED`, `PENDING_INTERLOCK_INTR`, no credential material, no provider/relationship mutation authority, and no claimed materialization, movement, replication, AI corpus exposure, execution, or activation.

## Existing Google Drive KV — exact evidence recovered

The physical Google Drive vault contains the adopted multi-instance records created earlier. Raw bytes were fetched from the connected Drive and hashed exactly.

Existing cloud instance:

```text
instance_id: kvi_a31335d2cc3745fa987b635432cfed2c
current ordinal: 1
set: personal
relationship: NOT_CONNECTED
```

Exact evidence:

```text
original installation receipt:
sha256:f00378cd1f68e08a39c837f2a80e7e105e822a321c0eea17a91318b4b6e5ea19

instance.json (1106 bytes):
sha256:8bf5ba7d911a52506a582f064315c9831a84c0c5fbb6ec7a031c325a79af090a

adoption.receipt.json (1023 bytes):
sha256:64a3af27be0bd6ae36b05b35e52894581413fff048cea237d370d0ec6248b552

my-kv-set-projection.json (1631 bytes):
sha256:187ab43f0bb09d88da154af26d57e1bfe7199fd90affd2dd81af5532f0e34cf4
```

Repository evidence:

```text
data/runtime-evidence/google-drive-kv1-adoption-evidence.20260908.json
```

The prepared runtime adoption input requests that this historical cloud `KV #1` become the next free peer ordinal, `KV #2`, while preserving private content and provenance. No cloud identity rewrite, provider operation, relationship mutation, or materialization is claimed by preparing this input.

## Remaining sequence

1. Validate and merge this resident-runtime/cloud-evidence reconciliation.
2. Reconcile the owner-observed resident installation and exact Google Drive evidence into the canonical COSV handoff.
3. Emit the prepared Google Drive `ADOPT_EXISTING_CLOUD_KV_PEER` request from the resident iPhone runtime so it receives a real request ID and current resident binding.
4. Pass that request through authentic Interlock/InTr admission; do not substitute repository/CI evidence for execution.
5. Materialize Google Drive as `KV #2` only after authentic governed/provider execution evidence exists.
6. Add a new iCloud or other cloud-hosted KV as `KV #3/#n`.
7. Resolve provider credentials through SKAP Vault only.
8. Prove provider `CONNECT`, `VERIFY`, `READ`, `WRITE`, `SYNC`, and `DISCONNECT` outcomes.
9. Prove `NOT_CONNECTED -> CONNECTED -> SYNCED -> AI_INTERACTION` and downgrade/reconnect/recovery flows.
10. Publish ordinary My KV navigation/README when the live resident/cloud workflow is established.

## Manual work

None required right now. Do not reinstall the resident KV, clear Safari/stegverse.org website data, or authorize a cloud provider yet. The next user action should only be needed after the prepared Google Drive adoption request is exposed on the deployed resident surface and can be emitted without re-entering evidence manually.
