# Site #497 StegGate Dependency Reconciliation Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Goal: `KV-CONNECTION-REVALIDATION-WORKER-001`
Site lane: `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION`
COSV: `50000000102000`
Upstream handoff: `StegVerse-Labs/StegCore/docs/STEGGATE_HOSTED_CARRIER_RETIREMENT_MIRROR_HANDOFF.md`
Current continuation branch: `task/site-497-source-publication-recovery-20260909`

## Merged cleanup evidence

- Site PR #1146 merged at `f21ae88ba871c68fdcc00d371a7f87ecf8246152` after focused third-party runtime, Bootstrap, Ecosystem Heartbeat, and handoff-orchestrator validation passed.
- Site PR #1149 merged at `448eb1b646703243e986a65cf86a969c992b1188` after No Required Third-Party Runtime `34317666399`, Site Bootstrap `34317666471`, Ecosystem Heartbeat `34317666466`, and Site Handoff Orchestrator `34317666389` passed. It added explicit `HISTORICAL_SUPERSEDED` bindings for legacy Render and Cloudflare-tunnel requirement observations.
- Site PR #1151 merged at `a076a392c7776abf693b824f22b216d6d7c8e611` after No Required Third-Party Runtime `34317857608`, Site Bootstrap `34317857529`, Ecosystem Heartbeat `34317857462`, and Site Handoff Orchestrator `34317857517` passed. It added deterministic provider-neutral DNS/edge recovery intent plus fail-closed validation while preserving physical DNS/TLS migration as unproven.

## Reconciled runtime state

StegCore PR #193 and PR #194 retired both historical GitHub-hosted StegGate runtime/carrier surfaces. Site records the current cutover state in `data/third-party-runtime-cutover-current.json`: resident StegVerse runtime is canonical; Cloudflare quick tunnel and GitHub Actions runtime are not required; automatic third-party runtime selection is false.

Legacy Render and Cloudflare-tunnel observations remain provenance and are explicitly `HISTORICAL_SUPERSEDED` through `data/third-party-dependency-inventory-supersession.json`.

## DNS / edge portability

`data/dns-edge-portability.json` and `scripts/check_dns_edge_portability.py` establish deterministic provider-neutral recovery intent for `stegverse.org` bound to `CNAME` without claiming physical registrar migration, nameserver migration, TLS recovery, or outage equivalence.

## Source / publication recovery continuation

The current branch adds `data/source-publication-recovery.json` and `scripts/check_source_publication_recovery.py`.

The contract requires a complete `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` containing an identified source snapshot, static publication files, domain binding, DNS/edge portability data, repository-local validators, dependency census, current handoff/task state, and a cryptographic path/hash manifest. The bundle must be reconstructable without GitHub API, validatable without GitHub Actions, and contain no GitHub token, non-TV/TVC secret, or provider credentials.

Publication recovery is provider-neutral and requires explicit origin selection, local validation, static artifact materialization, DNS/edge binding, TLS verification, public-content equivalence, evidence capture, and only then retirement of the prior origin.

The source contract explicitly does not claim that an off-GitHub restore or publication has already been observed.

## Current truth

```text
canonical runtime = RESIDENT_STEGVERSE
Cloudflare quick tunnel required = false
GitHub Actions runtime required = false
legacy Render requirement observation = HISTORICAL_SUPERSEDED
legacy Cloudflare tunnel requirement observation = HISTORICAL_SUPERSEDED
DNS/edge portability contract = MERGED_SOURCE_VALIDATED
DNS/edge physical migration proof = PENDING
source/publication recovery contract = IMPLEMENTED_SOURCE_PENDING_VALIDATION
off-GitHub restore proof = PENDING
off-GitHub publication proof = PENDING
```

## Remaining work

1. Validate and merge the source/publication recovery branch.
2. Integrate `docs/SITE_497_README_PROVIDER_INDEPENDENCE_INSERT.md` into repository `README.md` without truncating unrelated README content.
3. Materialize a complete recovery bundle and retain its hash manifest outside GitHub; prove restore/validation without GitHub API/Actions and publish through a non-GitHub origin.
4. Capture authentic registrar/nameserver state and perform a controlled DNS/edge recovery drill with TLS/public-content equivalence evidence.
5. Materialize and authentically observe a resident/provider-neutral public rendezvous.
6. Propagate verified provider-independence invariants to StegVerse-Labs/Sit, GCAT-BCAT-Engine/Publisher, admissibility-wiki, and stegguardian-wiki only when release conditions are met.

## Manual work

None currently. Do not change registrar, nameservers, DNS records, publication origin, or Cloudflare tunnel configuration until the corresponding controlled recovery drill is explicitly prepared and authenticated.
