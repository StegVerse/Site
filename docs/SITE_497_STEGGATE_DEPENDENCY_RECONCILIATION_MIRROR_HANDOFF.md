# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-readme-recovery-bundle-20260909`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` after No Required Third-Party Runtime `34317666399`, Site Bootstrap `34317666471`, Ecosystem Heartbeat `34317666466`, and Site Handoff Orchestrator `34317666389` passed. It added explicit `HISTORICAL_SUPERSEDED` bindings for legacy Render and Cloudflare-tunnel requirement observations.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` after No Required Third-Party Runtime `34317857608`, Site Bootstrap `34317857529`, Ecosystem Heartbeat `34317857462`, and Site Handoff Orchestrator `34317857517` passed. It added deterministic provider-neutral DNS/edge recovery intent plus fail-closed validation while preserving physical DNS/TLS migration as unproven.
- Site PR #1153 merged at `a3fd62d54896b735c0bdc517fbebcc3cf85fcdc0` after No Required Third-Party Runtime `34318036288`, Site Bootstrap `34318036299`, Ecosystem Heartbeat `34318036320`, and Site Handoff Orchestrator `34318036323` passed. It added deterministic source/publication recovery semantics and explicitly retained off-GitHub restore/publication as unobserved.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` bound to `CNAME` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Source / publication recovery

`data/source-publication-recovery.json` and `scripts/check_source_publication_recovery.py` establish the merged `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` contract. The contract requires an identified source snapshot, static publication files, domain binding, DNS/edge portability data, repository-local validators, dependency census, current handoff/task state, and a cryptographic path/hash manifest. It does not treat GitHub source hosting, Actions, Pages, or any replacement provider as canonical StegVerse state.

## Recovery-bundle materialization continuation

The current branch adds:

- `scripts/materialize_site_recovery_bundle.py`, which operates on a local checkout without network access or provider credentials, copies the deterministic repository snapshot into `build/site-recovery-bundle/source`, hashes every bundled file with SHA-256, and emits `manifest.json` plus `SHA256SUMS`;
- `scripts/check_site_recovery_bundle_manifest.py`, which rematerializes the bundle, verifies every SHA-256 digest, validates required recovery content and fail-closed proof semantics, and refuses to treat repository/CI materialization as off-GitHub restore or publication proof;
- `data/site-recovery-bundle-materialization.json`, which records the exact generated paths and current observation boundary;
- direct root `README.md` maintenance describing the provider-independent runtime/recovery boundary.

CI materialization from an exact PR checkout will prove that a complete repository-source recovery bundle and path/hash manifest can be generated without GitHub API calls or provider credentials. It will not by itself prove off-GitHub retention, restore, validation, publication, DNS/TLS recovery, or resident public-rendezvous observation.

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
recovery bundle materializer = IMPLEMENTED_SOURCE_PENDING_VALIDATION
recovery bundle SHA-256 manifest verification = IMPLEMENTED_SOURCE_PENDING_VALIDATION
off-GitHub restore proof = PENDING
off-GitHub publication proof = PENDING
resident/provider-neutral public rendezvous proof = PENDING
```

## Remaining work

1. Validate and merge the README/recovery-bundle materialization branch.
2. Retain a generated recovery bundle and its SHA-256 manifest outside GitHub; restore and validate it without GitHub API/Actions.
3. Publish the verified static artifact through a non-GitHub origin and capture exact public-content equivalence evidence.
4. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. Propagate verified provider-independence invariants to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki only when release conditions are met.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until the corresponding controlled recovery drill is explicitly prepared and authenticated.
