# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-offgithub-retention-20260909`
Current pull request: `#1155`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` after No Required Third-Party Runtime `34317666399`, Site Bootstrap `34317666471`, Ecosystem Heartbeat `34317666466`, and Site Handoff Orchestrator `34317666389` passed. It added explicit `HISTORICAL_SUPERSEDED` bindings for legacy Render and Cloudflare-tunnel requirement observations.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` after No Required Third-Party Runtime `34317857608`, Site Bootstrap `34317857529`, Ecosystem Heartbeat `34317857462`, and Site Handoff Orchestrator `34317857517` passed. It added deterministic provider-neutral DNS/edge recovery intent plus fail-closed validation while preserving physical DNS/TLS migration as unproven.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0` after No Required Third-Party Runtime `34318036288`, Site Bootstrap `34318036299`, Ecosystem Heartbeat `34318036320`, and Site Handoff Orchestrator `34318036323` passed. It added deterministic source/publication recovery semantics and explicitly retained off-GitHub restore/publication as unobserved.
- Site PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac` after focused recovery/bundle validation, persistent-card/recovery validation, Bootstrap, Ecosystem Heartbeat, and handoff orchestration passed. It integrated the root README recovery boundary, deterministic bundle/hash materialization, v16 persistent-card reconciliation, and removal of automatic hosted fallback from the Master Records proof rendezvous.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` bound to `CNAME` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Source / publication recovery

`data/source-publication-recovery.json` and `scripts/check_source_publication_recovery.py` establish the merged `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` contract. The contract requires an identified source snapshot, static publication files, domain binding, DNS/edge portability data, repository-local validators, dependency census, current handoff/task state, and a cryptographic path/hash manifest. It does not treat GitHub source hosting, Actions, Pages, or any replacement provider as canonical StegVerse state.

## Recovery-bundle materialization

PR #1154 added `scripts/materialize_site_recovery_bundle.py`, `scripts/check_site_recovery_bundle_manifest.py`, `data/site-recovery-bundle-materialization.json`, and direct root `README.md` maintenance describing the provider-independent runtime/recovery boundary and canonical public surface `https://stegverse.org/`.

Recovery bundle materialization and hash verification were authentically observed in No Required Third-Party Runtime run `34326685598` at head `bccbe2971f024c277ada01067b8a4c770bcd7abd`, then revalidated before #1154 merged.

## Master Records hosted-fallback contamination repaired by PR #1154

`stegos-bootstrap/master-records-auto-recovery.js` now consumes gateway schema `1.3.0`, validates `SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS`, probes only sovereign loopback advertisements, verifies optional third-party fallbacks are explicit-opt-in/non-required, and does not automatically select any hosted fallback. If local rendezvous is unavailable, authentic custody/reconstruction PASS remains intact and evidence relay remains `PENDING_RETRY`.

`scripts/check_mr_sv001_intr_governance.py` validates the current v16 wrapper while preserving retained v15 configured-rendezvous provenance, and `scripts/check_stegos_ipod_bootstrap_projection.py` rejects the retired hosted-fallback markers.

## Off-GitHub retention / restore / validation evidence

PR #1155 advances recovery proof beyond repository/CI materialization. The exact recovery archive for source commit `00fcf4149d4deb81066e2829618885cafadc2325` was retained outside GitHub in connected Google Drive, downloaded back, and verified byte-for-byte. The external object locator is intentionally not published.

Observed archive facts:

- archive SHA-256 = `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`;
- archive size = `6957389` bytes;
- `SHA256SUMS` entries verified = `3400`;
- round-trip external download = observed;
- restored source validation without GitHub API/Actions = PASS;
- repository-local provider cutover, DNS portability, source recovery, recovery-bundle, Ecosystem Chat, Master Records, and exact StegOS projection validators = PASS from the restored external copy;
- root `README.md` now documents the observed external round trip while preserving publication/DNS/TLS/resident-rendezvous proof as pending.

These observations prove external retention, off-GitHub restore, and off-GitHub validation/rematerialization. They do not prove off-GitHub publication, DNS/TLS migration/recovery, public-content equivalence, or a resident/provider-neutral public rendezvous.

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
Master Records proof rendezvous current config = SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS
external retention = OBSERVED
off-GitHub restore proof = OBSERVED
off-GitHub validation proof = OBSERVED
off-GitHub publication proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge PR #1155 with the external-retention evidence bindings.
2. Publish the verified static artifact through a non-GitHub origin and capture exact public-content equivalence evidence.
3. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
4. Materialize and authentically observe a resident/provider-neutral public rendezvous.
5. Propagate verified provider-independence invariants to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki only when release conditions are met.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until the corresponding controlled recovery drill is explicitly prepared and authenticated.
