# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-publication-equivalence-contract-20260909`
Current pull request: `PENDING`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` after explicit historical supersession of legacy Render and Cloudflare-tunnel requirements.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` with deterministic provider-neutral DNS/edge recovery intent while preserving physical DNS/TLS migration as unproven.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0` with deterministic source/publication recovery semantics.
- Site PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac` with root README recovery-boundary integration, deterministic recovery-bundle materialization/hash verification, persistent-card v16 reconciliation, and removal of automatic hosted fallback from the Master Records proof rendezvous.
- Site PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948`. Its exact head `bdb0ecef9b4fe87c6c502e17799552865cc50459` passed No Required Third-Party Runtime, Site Bootstrap, Ecosystem Heartbeat, and Site Handoff Orchestrator. #1155 authenticated external retention, off-GitHub restore, and off-GitHub validation from the Drive-retained recovery archive while preserving publication/DNS/TLS/public-equivalence claims as false.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` bound to `CNAME` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Source / publication recovery

`data/source-publication-recovery.json` and `scripts/check_source_publication_recovery.py` establish `STEGVERSE_SITE_RECOVERY_BUNDLE_V1`. The contract requires an identified source snapshot, static publication files, domain binding, DNS/edge portability data, repository-local validators, dependency census, current handoff/task state, and a cryptographic path/hash manifest. It does not treat GitHub source hosting, Actions, Pages, or a replacement publication provider as canonical StegVerse state.

## Off-GitHub retention / restore / validation evidence

The exact recovery archive for source commit `00fcf4149d4deb81066e2829618885cafadc2325` was retained outside GitHub in connected Google Drive, downloaded back, and verified byte-for-byte. The external object locator is intentionally not published.

Observed archive facts:

- archive SHA-256 = `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`;
- archive size = `6957389` bytes;
- `SHA256SUMS` entries verified = `3400`;
- round-trip external download = observed;
- restored source validation without GitHub API/Actions = PASS;
- repository-local provider cutover, DNS portability, source recovery, recovery-bundle, Ecosystem Chat, Master Records, and exact StegOS projection validators = PASS from the restored external copy.

These observations prove external retention, off-GitHub restore, and off-GitHub validation/rematerialization. They do not prove off-GitHub publication, DNS/TLS migration/recovery, public-content equivalence, or a resident/provider-neutral public rendezvous.

## Publication-equivalence continuation

The current continuation adds a fail-closed evidence seam before any publication predicate may advance:

- `data/off-github-publication-evidence-template.json` binds publication proof to the exact externally restored recovery archive and leaves provider identity, origin URL, TLS observations, manifest hashes, path counts, and provenance unset until authentic observation exists;
- `scripts/check_off_github_publication_evidence.py` requires a non-GitHub origin, exact path + SHA-256 comparison semantics, the canonical `stegverse.org` TLS hostname, no publication-provider state authority, and no premature observation claims;
- `data/source-publication-recovery.json` now explicitly binds the evidence template/validator and forbids inferring publication or equivalence from source/CI validation;
- `.github/workflows/site-497-publication-equivalence-contract.yml` validates the contract without provider credentials and explicitly records that it performs no publication, DNS, or TLS mutation.

This source-only contract does not prove publication. Its purpose is to make the later authentic public observation deterministic and fail closed.

## README maintenance

Root `README.md` was reviewed for this continuation. The merged #1154/#1155 provider-independent recovery text already accurately separates observed off-GitHub restore/validation from still-pending publication, DNS/TLS, and resident-rendezvous proof. No README wording change is required for this source-only evidence-contract increment; a README update is required when authentic publication/equivalence evidence changes those facts.

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
recovery bundle SHA-256 verification = OBSERVED_IN_CI
Master Records proof rendezvous automatic hosted fallback = false
external retention = OBSERVED
off-GitHub restore proof = OBSERVED
off-GitHub validation proof = OBSERVED
off-GitHub publication evidence contract = IMPLEMENTED_SOURCE_PENDING_VALIDATION
off-GitHub publication proof = PENDING
public-content equivalence proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the publication-equivalence contract continuation.
2. Publish the verified static artifact through a non-GitHub origin and capture exact path + SHA-256 public-content equivalence evidence using the installed contract.
3. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
4. Materialize and authentically observe a resident/provider-neutral public rendezvous.
5. When release conditions are reached, tag/release and create a separate verification task for propagation to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until the controlled recovery drill is explicitly prepared and authenticated.
