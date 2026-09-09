# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-publication-origin-selection-20260909`
Current pull request: `PENDING`

## Merged evidence

- PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152`.
- PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188`, superseding legacy Render and Cloudflare-tunnel requirement observations.
- PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611`, adding provider-neutral DNS/edge recovery intent while preserving physical DNS/TLS proof as pending.
- PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0`, adding deterministic source/publication recovery semantics.
- PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac`, integrating README recovery semantics, deterministic recovery-bundle/hash materialization, persistent-card v16 reconciliation, and removal of automatic hosted fallback from the Master Records proof rendezvous.
- PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`, authenticating external recovery-bundle retention, off-GitHub restore, and off-GitHub validation. The retained archive SHA-256 is `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`, size `6957389` bytes, with `3400` verified SHA256SUMS entries.
- PR #1158 merged at `78c2cc8f3a83069939112c1457a4c4b5b1148dff` after focused and repository-wide validation passed. It added deterministic provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` materialization and exact per-file hash/byte validation without selecting a provider.
- PR #1160 merged at `66ead1a2c0c93cc7fd2fc26331220cf99a59c827`, recording read-only publication-origin discovery. `selected_origin=null`; the existing Vercel `site` project is not an explicit admissible selection, and Render `stegverse-va-claim-guide` is scoped to the VA claim guide rather than the complete Site.

## Current provider-independent state

Canonical runtime remains `RESIDENT_STEGVERSE`. GitHub Actions runtime and Cloudflare quick tunnel are not required. Legacy Render and Cloudflare-tunnel requirement observations are historical superseded provenance. External retention, off-GitHub restore, and off-GitHub repository-local validation are observed. The static publication artifact contract/materializer/validator are merged. No admissible non-GitHub full-Site publication origin has yet been explicitly selected.

## Authentic publication-observation evidence continuation

The current continuation adds a fail-closed observation packet before publication, TLS, or public-content-equivalence state can advance:

- `data/off-github-publication-evidence-template.json` binds future proof to the exact externally restored recovery archive and `STEGVERSE_SITE_STATIC_PUBLICATION_V1`; artifact manifest, path count, provider identity, origin URL, TLS values, equivalence values, and provenance remain unset until authentic observation exists.
- `scripts/check_off_github_publication_evidence.py` binds the packet to `data/publication-equivalence-contract.json`, `data/source-publication-recovery.json`, and `data/publication-origin-discovery-2026-09-09.json`; requires `selected_origin=null` in the present discovery state; enforces a non-GitHub origin, `EXACT_PATH_AND_SHA256` equivalence semantics, canonical `stegverse.org` TLS hostname, and no premature observation claims.
- `data/publication-equivalence-contract.json` now installs the observation-evidence contract and explicitly states that source/CI validation cannot establish public equivalence.
- `.github/workflows/site-497-publication-observation-contract.yml` validates the provider-neutral artifact plus observation contract without persisted credentials and performs no provider, DNS, or TLS mutation.
- The existing Site #497 claim remains the sole active owner on `task/site-497-publication-origin-selection-20260909` and now claims these exact evidence surfaces.

This increment does not select a provider and does not prove off-GitHub publication, TLS recovery, DNS recovery, public-content equivalence, or resident public-rendezvous operation.

## README maintenance

Root `README.md` was reviewed. Its merged provider-independent recovery text remains accurate because authentic publication/equivalence facts have not changed. No root README wording change is required for this source-only observation-contract increment; README must be updated when a real non-GitHub publication/equivalence observation changes repository facts.

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
publication-origin discovery = MERGED
existing explicitly selected admissible non-GitHub full-Site origin = NONE FOUND
non-GitHub publication origin selected = false
publication observation evidence contract = IMPLEMENTED_PENDING_VALIDATION
off-GitHub publication proof = PENDING
exact public-content equivalence proof = PENDING
TLS recovery/equivalence proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the authentic publication-observation evidence contract.
2. Explicitly select an admissible non-GitHub full-Site publication origin; do not automatically choose or repurpose an existing provider resource.
3. Publish `STEGVERSE_SITE_STATIC_PUBLICATION_V1` through that selected origin and populate authentic exact-path/SHA-256 observation evidence.
4. Capture registrar/nameserver state and execute a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. At release readiness, tag/release and create a separate verification task for propagation to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki.

## Manual work

None for this source-only validation increment. Publication-origin selection remains a later explicit decision before any provider or DNS mutation.
