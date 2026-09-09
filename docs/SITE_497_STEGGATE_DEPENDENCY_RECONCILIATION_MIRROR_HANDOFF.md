# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-publication-equivalence-20260909`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` after No Required Third-Party Runtime `34317666399`, Site Bootstrap `34317666471`, Ecosystem Heartbeat `34317666466`, and Site Handoff Orchestrator `34317666389` passed. It added explicit `HISTORICAL_SUPERSEDED` bindings for legacy Render and Cloudflare-tunnel requirement observations.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` after No Required Third-Party Runtime `34317857608`, Site Bootstrap `34317857529`, Ecosystem Heartbeat `34317857462`, and Site Handoff Orchestrator `34317857517` passed. It added deterministic provider-neutral DNS/edge recovery intent plus fail-closed validation while preserving physical DNS/TLS migration as unproven.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0` after No Required Third-Party Runtime `34318036288`, Site Bootstrap `34318036299`, Ecosystem Heartbeat `34318036320`, and Site Handoff Orchestrator `34318036323` passed. It added deterministic source/publication recovery semantics and explicitly retained off-GitHub restore/publication as unobserved.
- Site PR #1154 merged at `1d813a92ed55648530dc070d17c3f981535b1aac` after focused recovery/bundle validation, persistent-card/recovery validation, Bootstrap, Ecosystem Heartbeat, and handoff orchestration passed. It integrated the root README recovery boundary, deterministic bundle/hash materialization, v16 persistent-card reconciliation, and removal of automatic hosted fallback from the Master Records proof rendezvous.
- Site PR #1155 merged at `7a32080b6ce6cc072d1d18d041220244aceec948` after focused recovery, Site Bootstrap, Ecosystem Heartbeat, and handoff orchestration passed on exact head `bdb0ecef9b4fe87c6c502e17799552865cc50459`. It canonically records external recovery-bundle retention, off-GitHub restore, and off-GitHub validation.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` bound to `CNAME` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Source / publication recovery

`data/source-publication-recovery.json` and `scripts/check_source_publication_recovery.py` establish the `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` contract. The contract requires an identified source snapshot, static publication files, domain binding, DNS/edge portability data, repository-local validators, dependency census, current handoff/task state, and a cryptographic path/hash manifest. GitHub source hosting, Actions, Pages, and replacement providers are not canonical StegVerse state.

## Recovery-bundle materialization

PR #1154 added `scripts/materialize_site_recovery_bundle.py`, `scripts/check_site_recovery_bundle_manifest.py`, `data/site-recovery-bundle-materialization.json`, and root `README.md` provider-independence documentation. Recovery bundle materialization and hash verification were authentically observed in CI and remain fail-closed validated.

## Master Records hosted-fallback contamination repaired by PR #1154

`stegos-bootstrap/master-records-auto-recovery.js` consumes gateway schema `1.3.0`, validates `SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS`, probes only sovereign loopback advertisements, verifies optional third-party fallbacks are explicit-opt-in/non-required, and does not automatically select any hosted fallback. If local rendezvous is unavailable, authentic custody/reconstruction PASS remains intact and evidence relay remains `PENDING_RETRY`.

## Off-GitHub retention / restore / validation evidence

PR #1155 advanced recovery proof beyond repository/CI materialization. The exact recovery archive for source commit `00fcf4149d4deb81066e2829618885cafadc2325` was retained outside GitHub in connected Google Drive, downloaded back, and verified byte-for-byte. The external object locator is intentionally not published.

Observed archive facts:

- archive SHA-256 = `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`;
- archive size = `6957389` bytes;
- `SHA256SUMS` entries verified = `3400`;
- round-trip external download = observed;
- restored source validation without GitHub API/Actions = PASS;
- provider cutover, DNS portability, source recovery, recovery-bundle, Ecosystem Chat, Master Records, and exact StegOS projection validators = PASS from the restored external copy.

These observations prove external retention, off-GitHub restore, and off-GitHub validation/rematerialization. They do not prove off-GitHub publication, DNS/TLS migration/recovery, public-content equivalence, or a resident/provider-neutral public rendezvous.

## Provider-neutral publication equivalence continuation

The current continuation does not automatically select a hosting provider because `data/source-publication-recovery.json` explicitly requires `automatic_provider_selection=false`, and repository search found no currently selected admissible non-GitHub publication origin.

The continuation adds:

- `data/publication-equivalence-contract.json` defining `STEGVERSE_SITE_STATIC_PUBLICATION_V1`, explicit provider-selection semantics, static-publication scope, and exact-content equivalence requirements;
- `scripts/materialize_site_publication_artifact.py` to deterministically materialize the static Site artifact and emit per-file SHA-256 metadata plus `SHA256SUMS` without selecting or contacting a provider;
- `scripts/check_site_publication_artifact.py` to rematerialize and verify every artifact file, hash, byte count, required public entry surface, and fail-closed unobserved publication/equivalence state;
- focused workflow wiring so the provider-neutral static artifact is rebuilt and validated on every relevant change.

Root `README.md` was reviewed for this continuation. No root wording change is required: its existing provider-independent recovery section already states that the verified static publication artifact is the next stage and distinguishes artifact materialization from actual publication/public equivalence. The root README is therefore intentionally left on its known-good complete blob rather than risking another broad replacement.

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
external retention = OBSERVED
off-GitHub restore proof = OBSERVED
off-GitHub validation proof = OBSERVED
provider-neutral static publication artifact = IMPLEMENTED_PENDING_VALIDATION
non-GitHub publication origin selected = false
off-GitHub publication proof = PENDING
exact public-content equivalence proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the provider-neutral publication-artifact continuation.
2. Explicitly select or reuse an admissible non-GitHub publication origin; do not automatically choose a provider.
3. Publish the verified static artifact through that selected origin and capture exact per-file content-equivalence evidence.
4. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. Propagate verified provider-independence invariants to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki only when release conditions are met.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until an admissible publication origin is explicitly selected and the controlled recovery/equivalence drill is prepared.
