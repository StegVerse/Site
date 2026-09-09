# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-publication-equivalence-20260909`
Current pull request: `PENDING`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` with explicit historical supersession of legacy Render and Cloudflare-tunnel requirements.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` with deterministic provider-neutral DNS/edge recovery intent while preserving physical DNS/TLS migration as unproven.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0` with deterministic source/publication recovery semantics.
- Site PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac` with root README recovery-boundary integration, deterministic recovery-bundle materialization/hash verification, persistent-card v16 reconciliation, and removal of automatic hosted fallback from the Master Records proof rendezvous.
- Site PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`; exact head `bdb0ecef9b4fe87c6c502e17799552865cc50459` passed focused recovery, Site Bootstrap, Ecosystem Heartbeat, and handoff orchestration. It authenticated external recovery-bundle retention, off-GitHub restore, and off-GitHub validation.
- Site PR #1158 merged at `78c2cc8f3a83069939112c1457a4c4b5b1148dff`. It installed the provider-neutral `STEGVERSE_SITE_STATIC_PUBLICATION_V1` contract plus deterministic static publication artifact materialization and exact per-file SHA-256 verification without selecting or contacting a publication provider.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Off-GitHub retention / restore / validation evidence

The exact recovery archive for source commit `00fcf4149d4deb81066e2829618885cafadc2325` was retained outside GitHub in connected Google Drive, downloaded back, and verified byte-for-byte.

Observed archive facts:

- archive SHA-256 = `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`;
- archive size = `6957389` bytes;
- `SHA256SUMS` entries verified = `3400`;
- restored source validation without GitHub API/Actions = PASS.

These observations prove external retention, off-GitHub restore, and off-GitHub validation/rematerialization. They do not prove off-GitHub publication, DNS/TLS migration/recovery, public-content equivalence, or a resident/provider-neutral public rendezvous.

## Provider-neutral publication artifact

PR #1158 added:

- `data/publication-equivalence-contract.json` defining `STEGVERSE_SITE_STATIC_PUBLICATION_V1`, explicit provider-selection semantics, static-publication scope, and exact-content equivalence requirements;
- `scripts/materialize_site_publication_artifact.py` to deterministically materialize the static Site artifact and emit per-file SHA-256 metadata plus `SHA256SUMS` without selecting or contacting a provider;
- `scripts/check_site_publication_artifact.py` to rematerialize and verify every artifact file, hash, byte count, required public entry surface, and fail-closed unobserved publication/equivalence state.

Artifact materialization is not publication and does not establish public equivalence.

## Authentic publication-observation evidence continuation

The current continuation adds the evidence packet required before any publication predicate may advance:

- `data/off-github-publication-evidence-template.json` binds any future observation to the exact externally restored recovery archive and the exact `STEGVERSE_SITE_STATIC_PUBLICATION_V1` artifact; provider identity, origin URL, artifact manifest, TLS observations, equivalence hashes/counts, and provenance remain unset until authentic observation exists;
- `scripts/check_off_github_publication_evidence.py` requires a non-GitHub origin, exact path + SHA-256 comparison semantics, canonical `stegverse.org` TLS hostname binding, no publication-provider canonical-state/runtime/activation effect, and no premature observation claims;
- `data/publication-equivalence-contract.json` now explicitly binds the observation evidence seam and forbids source/CI validation from standing in for authentic equivalence;
- `.github/workflows/site-497-publication-observation-contract.yml` validates the artifact and observation contract with no provider credentials and no external mutation;
- the active Site #497 pre-work claim was extended to these exact paths on the existing canonical continuation branch.

This source-only continuation does not select a publication origin and does not claim publication, TLS, DNS, or content equivalence.

## README maintenance

Root `README.md` was reviewed against this continuation. Its merged provider-independent recovery section remains accurate because authentic publication and public equivalence are still pending; no wording change is needed until those facts change. The known-good README blob is intentionally preserved rather than rewritten broadly.

## Current truth

```text
canonical runtime = RESIDENT_STEGVERSE
Cloudflare quick tunnel required = false
GitHub Actions runtime required = false
legacy Render requirement observation = HISTORICAL_SUPERSEDED
legacy Cloudflare tunnel requirement observation = HISTORICAL_SUPERSEDED
DNS/edge portability contract = MERGED_SOURCE_VALIDATED
DNS/edge physical migration proof = PENDING
source/publication recovery contract = MERGED_SOURCE_VALIDATED
recovery bundle materialization = OBSERVED_IN_CI
external retention = OBSERVED
off-GitHub restore proof = OBSERVED
off-GitHub validation proof = OBSERVED
provider-neutral static publication artifact = MERGED_SOURCE_VALIDATED
publication observation evidence contract = IMPLEMENTED_PENDING_VALIDATION
non-GitHub publication origin selected = false
off-GitHub publication proof = PENDING
exact public-content equivalence proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the authentic publication-observation evidence continuation.
2. Explicitly select or reuse an admissible non-GitHub publication origin; do not automatically choose a provider.
3. Publish the verified static artifact through that selected origin and capture exact path + SHA-256 content-equivalence evidence using the installed observation contract.
4. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. When release conditions are reached, tag/release and create a separate verification task for propagation to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until an admissible publication origin is explicitly selected and the controlled recovery/equivalence drill is prepared.
