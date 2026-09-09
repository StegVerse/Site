# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-publication-origin-selection-20260909`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152`.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188`, adding explicit historical-supersession bindings for legacy Render and Cloudflare-tunnel requirement observations.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611`, adding deterministic provider-neutral DNS/edge recovery intent while preserving physical DNS/TLS proof as pending.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0`, adding deterministic source/publication recovery semantics.
- Site PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac`, integrating root README recovery semantics, deterministic recovery-bundle/hash materialization, current v16 persistent-card validation, and removal of automatic hosted fallback from the Master Records proof rendezvous.
- Site PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`, canonically recording external recovery-bundle retention, off-GitHub restore, and off-GitHub validation.
- Site PR #1158 merged at `78c2cc8f3a83069939112c1457a4c4b5b1148dff` after No Required Third-Party Runtime `34330161281`, Site Bootstrap `34330161417`, Ecosystem Heartbeat `34330161335`, and Site Handoff Orchestrator `34330161323` passed. It added deterministic provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` materialization and exact per-file hash/byte validation without selecting a publication provider.

## Reconciled runtime state

Canonical runtime remains `RESIDENT_STEGVERSE`. Cloudflare quick tunnel and GitHub Actions runtime are not required, and automatic third-party runtime selection is false. Legacy Render and Cloudflare-tunnel observations remain provenance only and are `HISTORICAL_SUPERSEDED`.

## Recovery evidence

The exact recovery archive for source commit `00fcf4149d4deb81066e2829618885cafadc2325` was retained outside GitHub in connected Google Drive, downloaded back, and verified byte-for-byte. The external object locator is intentionally not published.

Observed archive facts:

- archive SHA-256 = `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`;
- archive size = `6957389` bytes;
- `SHA256SUMS` entries verified = `3400`;
- restored source validation without GitHub API/Actions = PASS.

These observations prove external retention, off-GitHub restore, and off-GitHub validation/rematerialization. They do not prove off-GitHub publication, DNS/TLS migration/recovery, public-content equivalence, or resident/provider-neutral public rendezvous.

## Provider-neutral publication artifact

Merged PR #1158 added:

- `data/publication-equivalence-contract.json` defining `STEGVERSE_SITE_STATIC_PUBLICATION_V1` and `automatic_provider_selection=false`;
- `scripts/materialize_site_publication_artifact.py` to deterministically materialize the static Site tree and emit SHA-256 metadata plus `SHA256SUMS`;
- `scripts/check_site_publication_artifact.py` to verify every artifact path, digest, byte count, required public entry surface, and fail-closed unobserved provider/publication/equivalence state;
- focused workflow validation of the artifact on relevant changes.

Root `README.md` was reviewed during #1158 and intentionally left on its known-good complete blob because its existing provider-independent recovery section already describes static publication materialization as the next stage and distinguishes it from authentic publication.

## Publication-origin discovery

The current continuation performed read-only discovery across repository state and already-connected deployment inventories. No existing resource qualifies as an already explicitly selected admissible non-GitHub origin for the complete Site:

- Vercel contains an existing project named `site`, but canonical Site state says Vercel is not the production/publication dependency; resource existence is not explicit selection.
- Render contains an existing Site-backed static service named `stegverse-va-claim-guide`, but it is scoped to the VA claim guide rather than the complete Site and must not be implicitly repurposed.

`data/publication-origin-discovery-2026-09-09.json` records this result as `NO_EXISTING_EXPLICITLY_SELECTED_ADMISSIBLE_NON_GITHUB_SITE_ORIGIN` with `selected_origin=null`, no deployment mutation, and no DNS/TLS mutation.

## Current truth

```text
canonical runtime = RESIDENT_STEGVERSE
Cloudflare quick tunnel required = false
GitHub Actions runtime required = false
DNS/edge portability contract = MERGED_SOURCE_VALIDATED
DNS/edge physical migration proof = PENDING
source/publication recovery contract = MERGED_SOURCE_VALIDATED
external retention = OBSERVED
off-GitHub restore proof = OBSERVED
off-GitHub validation proof = OBSERVED
provider-neutral static publication artifact = MERGED_SOURCE_VALIDATED
existing explicitly selected admissible non-GitHub full-Site origin = NONE FOUND
non-GitHub publication origin selected = false
off-GitHub publication proof = PENDING
exact public-content equivalence proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the publication-origin discovery/selection-state continuation.
2. Explicitly select an admissible non-GitHub full-Site publication origin; do not automatically choose or repurpose a provider resource.
3. Publish `STEGVERSE_SITE_STATIC_PUBLICATION_V1` through that selected origin and capture exact per-file content-equivalence evidence.
4. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. Propagate verified provider-independence invariants to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki only when release conditions are met.

## Manual work

Publication-origin selection is now the only decision blocking the next deployment proof. No provider or DNS mutation has been performed automatically.
