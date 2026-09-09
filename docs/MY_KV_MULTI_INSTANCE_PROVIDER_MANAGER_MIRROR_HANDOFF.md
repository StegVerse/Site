# My KV Multi-Instance / Provider Manager Mirror Handoff

Repository: `StegVerse-Labs/Site`
Branch: `device-local-kv-install`
State: SOURCE_CONTRACT_MERGED / DEVICE_KV_TRANSPORT_MERGED / PHYSICAL_GOOGLE_DRIVE_KV_VERIFIED / DEVICE_LOCAL_KV_INSTALL_SOURCE_IMPLEMENTED / DEVICE_LOCAL_RUNTIME_INSTALL_PENDING / CLOUD_PEER_EXPANSION_NEXT / PUBLIC_NAV_README_BINDING_PENDING
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

## Architecture correction

The device-local resident KnowledgeVault and DEVICE_KV transport/cache are now distinct concepts.

`stegverse-device-local-intr-v1` remains the transport/materialization database used by InTr/DEVICE_KV. It is not the owner's canonical local KnowledgeVault root.

The first-class resident KnowledgeVault uses a separate browser-origin IndexedDB database:

```text
stegverse-device-local-kv-v1
  files
  meta
```

This prevents cloud projection/cache rows from being mistaken for the installed local vault and removes the normal requirement to repeatedly select cloud files just to reconstruct device state.

## Device-local installation source

`assets/device-local-kv-installer.js` installs the resident KV with one owner action. It first ensures the StegVerse Node exists, then requests persistent browser storage when supported, and creates three exact resident records in the dedicated device-local KV database:

```text
_System/Instances/instance.json
_System/installation.receipt.json
_System/my-kv-set-projection.json
```

The installer:

- creates a unique `kvi_...` instance ID;
- binds the resident KV to the current registered Node;
- uses storage medium `device-local-browser-indexeddb`;
- records locator `indexeddb:stegverse-device-local-kv-v1/files`;
- initializes `KV #1` in set `personal`;
- defaults relationship state to `NOT_CONNECTED`;
- includes no provider rows, credentials, private content, provider mutation authority, relationship mutation authority, execution authority, or activation authority;
- writes the three canonical JSON rows and then exact-reads all three back, verifying SHA-256 and byte length before reporting installation success;
- returns an existing verified installation rather than overwriting it.

`device-kv-install.html` is the one-tap owner surface. It does not require a cloud file picker or provider credentials.

Validation:

```text
tests/device-local-kv-installer.test.cjs
.github/workflows/device-local-kv-install.yml
```

## Existing Google Drive KV

The previously adopted Google Drive KnowledgeVault remains authentic evidence and is not rewritten or silently renumbered by this slice. Its installation receipt and adopted instance/projection records remain preserved.

Because the owner has selected device-local-first architecture, the existing Google Drive instance must be treated as an independently rooted cloud KV when it is attached to the new resident set. Any ordinal reassignment needed to avoid an identity collision must be an explicit migration/adoption event with its own receipt; it must not be inferred from the browser.

## Cloud-hosted expansion — next slice

After the current iPhone has a verified resident KV, add cloud-hosted instances as peers rather than as browser bootstrap sources.

Required sequence:

1. resident KV exact installation/readback on current iPhone;
2. add provider-neutral cloud-instance creation/adoption requests from the resident MyKV surface;
3. materialize new cloud roots as `KV #2/#3/#n`, or explicitly migrate/adopt the existing Google Drive root into the next free ordinal without changing its private contents;
4. keep each new cloud instance `NOT_CONNECTED` until a separate governed relationship transition is admitted;
5. prove provider CONNECT/VERIFY/READ/WRITE/SYNC/DISCONNECT with authentic provider-result evidence and SKAP-held credential references;
6. prove `NOT_CONNECTED -> CONNECTED -> SYNCED -> AI_INTERACTION` and downgrade/reconnect/recovery flows without collapsing provenance or authority.

## Publication boundary

This source slice creates a public install route but does not yet replace ordinary My KV navigation or README guidance. Public navigation/README should be updated in the same change that follows successful current-device installation proof.

## Manual work

None until this branch validates and merges. After deployment, the only expected owner action is opening `https://stegverse.org/device-kv-install.html` on the current iPhone and tapping **Install resident KV**. No cloud file selection and no credential entry are part of device-local installation.
