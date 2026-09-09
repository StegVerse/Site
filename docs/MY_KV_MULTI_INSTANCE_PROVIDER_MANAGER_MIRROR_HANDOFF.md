# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `device-local-kv-cloud-peers`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_TRANSPORT_MERGED / PHYSICAL_GOOGLE_DRIVE_KV_VERIFIED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_PENDING / CLOUD_PEER_REQUEST_SOURCE_IMPLEMENTED / CLOUD_PROVIDER_EXECUTION_PENDING / PUBLIC_NAV_README_BINDING_PENDING
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

## Resident KV architecture — merged and deployed

Site PR #1115 merged at `571821a609a6ec17b1a8b4a307a9de9d84a35028`. Pages deployment run `34294750852` completed successfully.

The resident KnowledgeVault is distinct from DEVICE_KV transport/cache:

```text
canonical resident KV: stegverse-device-local-kv-v1
DEVICE_KV transport/cache: stegverse-device-local-intr-v1
```

`device-kv-install.html` performs one-tap resident installation. `assets/device-local-kv-installer.js` ensures a registered StegVerse Node, requests persistent browser storage when available without overclaiming it, creates a unique first-class `KV #1` identity in set `personal`, defaults relationship state to `NOT_CONNECTED`, writes canonical instance/installation/projection records, and requires exact SHA-256 + byte-length readback before reporting installed.

No cloud file selection or cloud credential is part of resident installation.

## Current slice — cloud KV peers

Cloud-hosted KVs are now modeled as peers that require the resident KV to be installed and exact-readback verified first.

`assets/cloud-kv-peer-manager.js` supports two distinct request classes:

```text
stegverse.site.cloud-kv-peer-create-request/v1
  operation=CREATE_CLOUD_KV_PEER

stegverse.site.cloud-kv-peer-adoption-request/v1
  operation=ADOPT_EXISTING_CLOUD_KV_PEER
```

Supported storage media:

```text
icloud-drive
google-drive
onedrive
dropbox
```

Every request:

- requires resident `KV #1` exact-readback proof;
- requests an ordinal >= 2;
- starts at relationship tier `NOT_CONNECTED`;
- remains `PENDING_INTERLOCK_INTR`;
- routes credentials only by declared destination `SKAP_VAULT` and carries no credential material;
- keeps `provider_operation_authorized=false`;
- keeps `instance_materialized=false`;
- keeps relationship mutation false;
- claims no data movement, replication, AI-corpus exposure, execution authority, or activation.

`cloud-kv-peers.html` exposes bounded create/adopt request forms only after the local KV status check. It does not authenticate a provider or create cloud storage directly.

Validation:

```text
tests/cloud-kv-peer-manager.test.cjs
.github/workflows/cloud-kv-peer-manager.yml
```

## Existing Google Drive KV collision / adoption rule

The previously adopted Google Drive vault remains intact with its authentic existing instance identity and physical evidence. Because it was historically adopted as KV #1 before the device-local-first architecture correction, attaching it to the resident set creates an ordinal collision.

This branch does not silently rewrite it. `ADOPT_EXISTING_CLOUD_KV_PEER` requires:

- existing instance ID;
- existing/current ordinal;
- requested new ordinal;
- installation/adoption receipt SHA-256;
- current set projection SHA-256;
- `private_content_rewrite_authorized=false`;
- `existing_identity_rewrite_authorized=false`;
- `provenance_preservation_required=true`;
- explicit `ordinal_reassignment_requested` when the ordinal differs.

Physical reassignment/materialization must occur later through authentic Interlock/InTr admission and provider-result evidence. Until then this remains request state only.

## Remaining sequence

1. validate and merge this cloud-peer request source;
2. current iPhone: install resident KV from `https://stegverse.org/device-kv-install.html` and require exact readback;
3. reconcile that authentic runtime installation into COSV;
4. publish ordinary My KV navigation + README around the device-local-first flow;
5. submit/authenticate an explicit Google Drive existing-peer adoption into the next free ordinal, preserving provenance;
6. add a new iCloud or other cloud-hosted KV as another peer;
7. resolve provider credentials through SKAP only;
8. prove authentic provider `CONNECT`, `VERIFY`, `READ`, `WRITE`, `SYNC`, and `DISCONNECT` results;
9. prove relationship `NOT_CONNECTED -> CONNECTED -> SYNCED -> AI_INTERACTION` plus downgrade/reconnect/recovery with authentic receipts.

## Manual work

The device-local install route is deployed. Current owner action is limited to one tap on the current iPhone: open `https://stegverse.org/device-kv-install.html` and tap **Install resident KV**. Do not select Google Drive files and do not enter cloud credentials during this step. Cloud provider authorization remains deferred until the resident KV returns exact-readback success.
