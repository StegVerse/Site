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

- PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`, authenticating external recovery-bundle retention, off-GitHub restore, and off-GitHub validation for archive SHA-256 `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f` with 3400 verified entries.
- PR #1158 merged at `78c2cc8f3a83069939112c1457a4c4b5b1148dff`, adding provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` materialization and exact per-file validation.
- PR #1160 merged at `66ead1a2c0c93cc7fd2fc26331220cf99a59c827`, recording no existing explicitly selected admissible non-GitHub full-Site origin.
- PR #1162 merged at `25c86a2ea7818841f0ad56b0cbf17c55a7de0c3d`, installing the fail-closed authentic publication-observation evidence seam after all exact-head gates passed.
- PR #1163 merged at `25130aca1fd2393475c615d4c3fc01a29d2724c6` after Site 497 Publication Observation Contract, No Required Third-Party Runtime, Ecosystem Heartbeat, Site Handoff Orchestrator, and Site Bootstrap all passed on exact head `7171ef62d76c3654797a961376e4192dde731d5c`. It explicitly selected a new dedicated Render recovery origin with auto-deploy disabled and no canonical-state/runtime/activation role.

## Authentic Render origin materialization

The selected origin has now been physically created in the connected Render workspace without DNS mutation:

```text
provider = RENDER
service = stegverse-site-recovery-origin
service_id = srv-daght9ek1f9s73d1346g
origin_url = https://stegverse-site-recovery-origin.onrender.com
auto_deploy = false
initial_deploy_id = dep-daght9uk1f9s73d1358g
source_commit = 25130aca1fd2393475c615d4c3fc01a29d2724c6
provider deploy status = live
```

Provider-backed build/runtime evidence records:

- exact source commit checkout `25130aca1fd2393475c615d4c3fc01a29d2724c6`;
- exact recorded build command executed;
- `SITE_STATIC_PUBLICATION_ARTIFACT=PASS entries=1407`;
- build completed successfully;
- exact recorded HTTP server start command executed against `build/site-publication-artifact/public`;
- provider-side `HEAD /` returned 200;
- provider-side `GET /` returned 200;
- Render reported the service live at its primary onrender.com URL.

This proves selected-origin materialization and provider-observed live state. It does not yet prove independent public reachability, full exact-path/SHA-256 equivalence from an independent observer, canonical `stegverse.org` binding, or canonical-domain TLS recovery.

`data/publication-origin-selection-2026-09-09.json`, `data/off-github-publication-evidence-template.json`, `data/publication-equivalence-contract.json`, `scripts/check_site_publication_artifact.py`, and `scripts/check_off_github_publication_evidence.py` now preserve that distinction explicitly.

## README maintenance

Root `README.md` was reviewed after materialization. Its provider-independent recovery boundary remains factually accurate: the dedicated Render origin is a bounded recovery/publication proof carrier and does not become canonical Site state or a required runtime dependency. No existing README statement falsely claims that no recovery origin exists, so no broad README rewrite is required in this increment.

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
selected origin materialized = true
provider live state = OBSERVED
provider artifact entries = 1407
independent public reachability = PENDING
exact public-content equivalence proof = PENDING
canonical-domain DNS/TLS recovery proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the Render materialization evidence continuation.
2. Run an independent remote exact-path/SHA-256 comparison against `https://stegverse-site-recovery-origin.onrender.com` and populate the publication evidence packet only from that authentic observation.
3. Execute the controlled `stegverse.org` DNS/TLS recovery drill only after origin equivalence is proven.
4. Materialize and authentically observe a resident/provider-neutral public rendezvous.
5. At release readiness, tag/release and create a separate downstream propagation-verification task for StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki.

## Manual work

None. No registrar, nameserver, canonical-domain DNS, or TLS mutation has been performed.
