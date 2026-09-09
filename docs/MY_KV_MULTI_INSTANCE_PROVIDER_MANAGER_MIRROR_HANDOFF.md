# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-google-drive-adoption-legacy-node-fallback`
State: SOURCE_CONTRACT_MERGED / DEVICE_LOCAL_KV_INSTALL_MERGED_DEPLOYED / DEVICE_LOCAL_RUNTIME_INSTALL_OWNER_OBSERVED_EXACT_READBACK / PERSISTENCE_NOT_GRANTED_DURABILITY_CLASSIFIED / GOOGLE_DRIVE_EXISTING_KV_EXACT_EVIDENCE_RECOVERED / GOOGLE_DRIVE_KV2_PREPARED_PROFILE_MERGED_DEPLOYED / AUTHENTIC_OWNER_REQUEST_ATTEMPT_OBSERVED / LEGACY_NODE_INTR_OUTBOX_STORE_MISSING / EVENT_EPHEMERAL_FALLBACK_IMPLEMENTED / HOSTED_VALIDATION_PENDING / AUTHENTIC_OWNER_REQUEST_EMISSION_PENDING / CLOUD_PROVIDER_EXECUTION_PENDING
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

Site PR #1115 merged the resident browser KnowledgeVault installer. The current iPhone later reported authentic owner-observed runtime state:

```text
State: INSTALLED
Instance: KV #1 · kvi_0d5d4cfd531db51bbcf7fdfc0311f5dc
Set: personal
Storage: device-local-browser-indexeddb
Relationship: NOT_CONNECTED
Persistence: requested; granted=false
Exact readback: true
```

PR #1120 merged at `aaa8a8d253534bd53afbec075b376d73401ad18c`, permanently recording that runtime observation, `BEST_EFFORT_BROWSER_ORIGIN` durability, and exact existing Google Drive evidence. Organization COSV reconciliation merged through `.github` PR #1202 at `374170455b82278845a3f7f972615b4d3d670977` without changing the fail-closed task vector.

## Existing Google Drive cloud KV

```text
existing cloud instance_id: kvi_a31335d2cc3745fa987b635432cfed2c
current ordinal: 1
requested peer ordinal: 2
relationship: NOT_CONNECTED
adoption.receipt.json: sha256:64a3af27be0bd6ae36b05b35e52894581413fff048cea237d370d0ec6248b552
my-kv-set-projection.json: sha256:187ab43f0bb09d88da154af26d57e1bfe7199fd90affd2dd81af5532f0e34cf4
```

The public prepared profile omits the private Google Drive locator. No provider execution, identity rewrite, private-content rewrite, relationship mutation, data movement, replication, or AI-corpus exposure is claimed.

## Prepared resident adoption transport

Site PR #1122 merged at `b5c3939878bafc7f3aeb40a52458c7a4528c6628` after all six required validation gates passed and Pages deployment succeeded.

It added:

```text
data/kv/google-drive-existing-peer-adoption-profile.json
assets/cloud-kv-adoption-device-kv-bridge.js
assets/cloud-kv-adoption-device-kv-receiver.js
tests/cloud-kv-adoption-resident-transport.test.cjs
```

The Cloud KV Peers page exposes one prepared action:

```text
Emit governed Google Drive KV #2 adoption request
```

The intended successful result remains bounded:

```text
governance_state=PENDING_INTERLOCK_INTR
resident_ingress_observed=true
resident_materialization_observed=true
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

## Authentic owner attempt — runtime defect observed

On the deployed current-iPhone surface, the owner tapped the prepared Google Drive KV #2 adoption action. The request failed before resident adoption ingress with the browser error:

```text
Request failed closed: Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.
```

This is not a governance denial and does not mutate the cloud vault. It identifies a legacy current-device Node storage shape: the registered `stegos-node-v1` database predates the `intr_outbox` object store expected by `queueIntrMaterializationRequest(...)`.

The runtime observation narrows the transport blocker to local Node outbox persistence compatibility. The cloud adoption request itself has still not reached resident ingress and no `SITE-CLOUD-KV-*` request may be treated as emitted from this failed attempt.

## Current remediation — event-ephemeral compatibility path

Branch `kv-google-drive-adoption-legacy-node-fallback` adds a narrowly scoped fallback only when the Node queue fails specifically because the required IndexedDB object store is absent.

The normal path remains:

```text
registered Node -> persisted intr_outbox -> generated InTr -> HB-derived carrier -> resident adoption receiver
```

The compatibility path is:

```text
registered Node identity -> generated InTr materialization request -> HB-derived carrier -> STEGOS_NODE_EVENT_EPHEMERAL -> resident adoption receiver
```

The fallback uses explicit schema:

```text
stegos.node_intr_event_ephemeral_trigger.v1
transport_origin=STEGOS_NODE_EVENT_EPHEMERAL
durable_outbox_persisted=false
legacy_node_outbox_store_missing=true
request_grants_execution_authority=false
claim_or_fence_minted=false
authority_effect=NONE_TRIGGER_ONLY
```

It does not silently claim a durable queue write. Any queue failure other than the exact missing-object-store condition still fails closed.

The resident receipt binds `resident_transport_origin` to either `STEGOS_NODE_OUTBOX` or `STEGOS_NODE_EVENT_EPHEMERAL`; all provider/relationship/materialization effects remain false.

## Validation target

`tests/cloud-kv-adoption-resident-transport.test.cjs` now additionally verifies:

- the missing-object-store classifier accepts the observed Safari `NotFoundError` form;
- unrelated queue failures remain fail-closed;
- the event-ephemeral trigger is hash-bound to the exact materialization request and registered Node/Interlock identity;
- durable outbox persistence is explicitly false on fallback;
- no execution, mutation, movement, replication, AI-corpus, credential, authority, or activation effect is introduced.

## Remaining sequence

1. Run exact-head hosted validation for the compatibility fix and repair any failures.
2. Merge and confirm Pages deployment.
3. Retry the same prepared Google Drive KV #2 adoption button once on the current iPhone.
4. Capture the authentic generated `SITE-CLOUD-KV-*` request ID, `resident_ingress_observed=true`, and `resident_transport_origin`.
5. Reconcile that authentic request evidence into Site and canonical COSV without over-claiming provider execution.
6. Bind the still-pending request to authentic Interlock/InTr governance/provider execution.
7. Materialize Google Drive as KV #2 only after authentic provider/governance evidence exists.
8. Then continue provider authorization through SKAP Vault and relationship progression/recovery testing.

## Manual work

None until this remediation validates, merges, and deploys. Do not clear Safari/stegverse.org website data, reinstall the resident KV, rebuild the Node, re-enter hashes, or authorize Google Drive.
