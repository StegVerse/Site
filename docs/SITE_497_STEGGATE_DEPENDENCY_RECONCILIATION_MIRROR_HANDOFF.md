# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `fix/site-497-remove-render-20260909`

## Merged provider-independent evidence

- PR #1155 merged external recovery-bundle retention, off-GitHub restore, and off-GitHub validation for archive SHA-256 `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f` with 3400 verified entries.
- PR #1158 merged provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` materialization and exact per-file validation.
- PR #1162 merged the fail-closed authentic publication-observation evidence seam.

## Render rejection / remediation

PRs #1163 and #1166 selected and materialized a dedicated Render recovery origin. That direction is rejected by explicit user requirement: **NO RENDER**.

Canonical current state therefore treats the previously created Render service only as historical rejected evidence. It is not a dependency, not a selected origin, not eligible for equivalence proof, not eligible for DNS binding, and must not be used by this lane.

`data/publication-origin-selection-2026-09-09.json` now requires:

```text
selection_state = NO_HOSTED_ORIGIN_SELECTED
selected_origin = null
RENDER_ALLOWED = false
```

The historical service/deploy identifiers are retained only inside `historical_rejected_materialization` so the mistake remains auditable without remaining operationally selected.

`data/off-github-publication-evidence-template.json` is reset to provider-neutral/unobserved state. `scripts/check_off_github_publication_evidence.py` now fails closed if any hosted origin is selected for this lane and specifically requires Render to remain prohibited. The focused workflow also asserts `PUBLICATION_ORIGIN_SELECTED=false` and `RENDER_ALLOWED=false`.

## README maintenance

Root `README.md` was reviewed. Its provider-independent recovery boundary remains the correct target. No README wording is required to make Render part of the architecture; Render is explicitly excluded from this continuation.

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
hosted publication origin selected = false
Render allowed for Site #497 recovery/publication = false
Render materialization = HISTORICAL_REJECTED_DO_NOT_USE
independent public reachability = PENDING
exact public-content equivalence proof = PENDING
canonical-domain DNS/TLS recovery proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the no-Render remediation.
2. Continue toward a genuinely provider-neutral/resident publication path without selecting Render.
3. Capture independent exact-content equivalence only against the eventual admissible non-Render path.
4. Execute controlled `stegverse.org` DNS/TLS recovery only after that path is proven.
5. Materialize and authentically observe the resident/provider-neutral public rendezvous.
6. At release readiness, tag/release and create the separate downstream propagation-verification task.

## Manual work

The connected Render tool does not expose service deletion or suspension. The historical service `stegverse-site-recovery-origin` (`srv-daght9ek1f9s73d1346g`) therefore cannot be deleted from this chat. Delete it in the Render dashboard at `https://dashboard.render.com/web/srv-daght9ek1f9s73d1346g`; no DNS changes are required.
