# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `kv-n-device-kv-projection-admission`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_RESIDENT_TRANSPORT_MERGED / PREPUBLICATION_UI_MERGED / CANONICAL_PROVIDER_SHAPE_MERGED / PHYSICAL_KV1_ADOPTED / DEVICE_KV_PROJECTION_ADMISSION_SOURCE_IN_PROGRESS / PUBLIC_NAV_README_BINDING_PENDING / KV2_PROVIDER_ACTIVATION_PENDING
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

## Merged Site baseline

- PR #1109 merged bounded MyKV resident DEVICE_KV transport at `1c5396d186b2a8674f265733d91c542d472d20fd`.
- PR #1110 merged the intentionally unlinked MyKV #1/#2/#n candidate UI at `5977b53c8ac43099b4d2cecf27cdc4c78e4c4882`.
- PR #1113 merged canonical plural provider projection alignment at `774ce092ab00a3eaee337eb4a0a7f168cbecc6a0`; Site now consumes `instance.providers.items` and `instance.providers.pending_requests`, preserves provider/credential mutation false sentinels, and rejects singular `instance.provider` projections.

The existing MyKV resident reader returns `MY_KV_INSTANCE_SET_PROJECTION` only from resident `_System/my-kv-set-projection.json`. Provider and relationship requests remain `PENDING_INTERLOCK_INTR`. Provider execution, relationship mutation, data movement, replication, AI-corpus exposure, credential authority, and activation authority remain false.

## Upstream KV #1 adoption source — merged

`StegVerse-Labs/continuity-vault-kit` PR #203 merged at `4f2f47120ab162273abba6eae3e2155a46db2c16`. Its adoption tool requires the existing schema-1.1 installation receipt, binds apply mode to its exact SHA-256, refuses overwrite of existing instance/adoption/projection records, creates canonical `stegverse.kv.instance/v1` metadata, defaults relationship state to `NOT_CONNECTED`, emits the bounded `stegverse.kv.my-kv-set-projection/v1`, and preserves private content/original receipt bytes.

## Authentic physical Google Drive KV #1 — materialized and verified

The owner-controlled Google Drive KnowledgeVault was inspected before mutation. The original installation receipt remained 3,179 exact bytes and was bound at:

```text
sha256:f00378cd1f68e08a39c837f2a80e7e105e822a321c0eea17a91318b4b6e5ea19
```

Pre-write checks found no `_System/Instances`, no `instance.json`, no `adoption.receipt.json`, and no `_System/my-kv-set-projection.json`. The bounded adoption bundle was then written in completion-safe order and raw-read back from Drive. Exact post-write hashes are:

```text
_System/Instances/instance.json
sha256:8bf5ba7d911a52506a582f064315c9831a84c0c5fbb6ec7a031c325a79af090a

_System/my-kv-set-projection.json
sha256:187ab43f0bb09d88da154af26d57e1bfe7199fd90affd2dd81af5532f0e34cf4

_System/Instances/adoption.receipt.json
sha256:64a3af27be0bd6ae36b05b35e52894581413fff048cea237d370d0ec6248b552
```

The original installation receipt was raw-read again after the writes and remained the same 3,179-byte hash. Physical KV #1 now exists as a single-member `personal` KV set, relationship `NOT_CONNECTED`, no observed provider rows, no provider/relationship mutation authority, and no activation effect. Public source does not retain the private provider folder locator or physical instance identifier.

## Current slice — resident DEVICE_KV projection admission

The physical projection existing in Google Drive is not itself proof that the current browser's resident DEVICE_KV contains that projection. This branch adds a separate, narrow admission path:

- `assets/my-kv-set-projection-admission-bridge.js`
- `assets/my-kv-set-projection-admission-receiver.js`
- `tests/my-kv-set-projection-admission.test.cjs`
- owner-mediated projection selection on `my-kv-instances.html`

The bridge requires an owner-selected raw JSON file, validates it with the canonical Site MyKV validator, hashes the exact raw bytes, and transports only a `MY_KV_INSTANCE_SET_PROJECTION_ADMISSION` / `COMMIT_CANDIDATE` request through the registered Node + generated InTr + HB-derived carrier.

The dedicated admission receiver accepts only `MY_KV_SET_PROJECTION_REPLACE` targeting exactly `_System/my-kv-set-projection.json`. It verifies raw payload SHA-256 and size, parses and revalidates the canonical bounded projection, rejects private/credential/governance-receipt fields, stores the exact raw base64 in the existing DEVICE_KV `kv_files` store, reads the row back, and returns success only when key/hash/size/content all match exactly. It does not widen root `intr-service-worker.js` or modify Personal Profile/Form Profile semantics.

The admission record is a replaceable status projection rather than execution authority so future authentic KV #2/#n projection refreshes can be admitted without treating old status as immutable authority. Every replacement remains owner-mediated, validated, Node/InTr-bound, path-restricted, and exact-readback verified.

## Remaining sequence

1. validate and merge the DEVICE_KV projection-admission source slice;
2. on the current iPhone, open the MyKV instances surface and select the canonical `KnowledgeVault/_System/my-kv-set-projection.json`;
3. require `PROJECTION_ADMITTED` plus `exact_readback_verified=true` and then `MY_KV_INSTANCE_SET_PROJECTION` readback showing exactly one KV #1 instance;
4. bind the validated MyKV candidate into ordinary public My KV navigation and update repository README in the same publication change;
5. only after the exact current-device readback proof, materialize/authorize real KV #2 through an owner-selected provider flow;
6. prove provider CONNECT/VERIFY/READ/WRITE/SYNC/DISCONNECT and relationship `NOT_CONNECTED -> CONNECTED -> SYNCED -> AI_INTERACTION` using authentic admitted evidence, with downgrade/reconnect/recovery proofs.

## Manual work

No manual action until this admission branch passes hosted validation and merges. Do not create KV #2 yet and do not manually edit any of the three physical KV #1 adoption artifacts. After merge, the only expected manual action is selecting the already-existing canonical `my-kv-set-projection.json` from the current iPhone Files/Google Drive picker on the MyKV instances surface; no credential entry is part of that step.
