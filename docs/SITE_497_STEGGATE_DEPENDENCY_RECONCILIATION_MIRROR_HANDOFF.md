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

- PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac`, integrating deterministic recovery-bundle/hash materialization, README recovery semantics, current persistent-card validation, and sovereign-only Master Records rendezvous fallback behavior.
- PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`, authenticating external recovery-bundle retention, off-GitHub restore, and off-GitHub validation for archive SHA-256 `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f` with 3400 verified entries.
- PR #1158 merged at `78c2cc8f3a83069939112c1457a4c4b5b1148dff`, adding deterministic provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` materialization and exact per-file hash/byte validation.
- PR #1160 merged at `66ead1a2c0c93cc7fd2fc26331220cf99a59c827`, recording that no existing full-Site non-GitHub origin was already explicitly selected; the Vercel `site` project and Render `stegverse-va-claim-guide` were not admissible for implicit repurposing.
- PR #1162 merged at `25c86a2ea7818841f0ad56b0cbf17c55a7de0c3d` after Site 497 Publication Observation Contract, No Required Third-Party Runtime, Ecosystem Heartbeat, Site Handoff Orchestrator, and Site Bootstrap all passed on exact head `036d5bbbb32391dc3d159c039dc2abbe6d5c77ce`. It installed the fail-closed authentic publication-observation evidence seam.

## Explicit publication-origin selection

Connected-resource inspection confirmed:

- Vercel project `site` exists but is unlinked and is not repurposed.
- Render static site `stegverse-va-claim-guide` is Site-backed but scoped to the VA claim guide and is not repurposed.
- A new dedicated Render service can be isolated from those resources and can serve only the output of `scripts/materialize_site_publication_artifact.py`.

The current continuation therefore explicitly selects a new dedicated Render recovery origin in `data/publication-origin-selection-2026-09-09.json`:

```text
provider = RENDER
resource_strategy = NEW_DEDICATED_SERVICE
desired_name = stegverse-site-recovery-origin
auto_deploy = false
artifact = STEGVERSE_SITE_STATIC_PUBLICATION_V1
provider canonical-state role = false
runtime authority = NONE
activation effect = NONE
selection state = SELECTED_NOT_MATERIALIZED
```

The build command is `python3 scripts/materialize_site_publication_artifact.py --output build/site-publication-artifact`; the selected service will expose only `build/site-publication-artifact/public`. No DNS, nameserver, TLS, or publication mutation has yet occurred.

`data/off-github-publication-evidence-template.json`, `data/publication-equivalence-contract.json`, `scripts/check_off_github_publication_evidence.py`, and the focused workflow now bind to the explicit Render selection while preserving publication, public-content equivalence, and TLS observations as false until authentic runtime evidence exists.

## README maintenance

Root `README.md` was reviewed. Its provider-independent recovery text remains accurate because provider selection does not itself establish publication or equivalence. No wording change is required until the dedicated origin is materially created or publication facts change.

## Current truth

```text
canonical runtime = RESIDENT_STEGVERSE
GitHub Actions runtime required = false
Cloudflare quick tunnel required = false
external retention = OBSERVED
off-GitHub restore = OBSERVED
off-GitHub validation = OBSERVED
provider-neutral static publication artifact = MERGED_SOURCE_VALIDATED
publication observation evidence contract = MERGED_SOURCE_VALIDATED
non-GitHub publication origin selected = true
selected provider = RENDER
selected origin materialized = false
off-GitHub publication proof = PENDING
exact public-content equivalence proof = PENDING
DNS/TLS recovery proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the explicit Render recovery-origin selection.
2. Materialize the selected dedicated Render service with auto-deploy disabled and no DNS change.
3. Publish `STEGVERSE_SITE_STATIC_PUBLICATION_V1` through that origin and capture exact path/SHA-256 equivalence evidence.
4. Execute the controlled DNS/TLS recovery drill only after origin equivalence is proven.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. At release readiness, tag/release and create a separate downstream propagation-verification task for StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki.

## Manual work

None for selection validation. The selected Render service has not yet been created.
