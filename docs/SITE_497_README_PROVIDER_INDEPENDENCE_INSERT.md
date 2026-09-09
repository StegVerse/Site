## Provider-independent runtime boundary

Site's current runtime cutover is recorded in `data/third-party-runtime-cutover-current.json` under `SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION` / COSV `50000000102000`.

Current runtime semantics:

```text
canonical runtime = RESIDENT_STEGVERSE
production continuity third-party dependency = false
activation third-party dependency = false
automatic third-party runtime selection = false
Cloudflare quick tunnel required = false
Cloudflare quick tunnel canonical runtime carrier = false
GitHub Actions runtime required = false
GitHub Actions runtime authority = NONE
```

Older provider observations in `data/third-party-dependency-inventory.json` are retained as provenance. Where a legacy observation predates a verified cutover, `data/third-party-dependency-inventory-supersession.json` marks it `HISTORICAL_SUPERSEDED` and binds it to the current cutover source. Historical Render and `trycloudflare.com` observations therefore do not establish current dependency, endpoint identity, liveness, or runtime authority.

Third-party providers remain usable only where explicitly selected as bounded fallback/interoperability surfaces. A provider-neutral resident public rendezvous is still awaiting authentic observation; source, CI, merge, or historical tunnel evidence must not be substituted for that runtime proof.

Relevant validation surfaces:

- `scripts/check_no_required_third_party_runtime.py`
- `scripts/check_third_party_dependency_invariant.py`
- `scripts/check_third_party_dependency_reconciliation.py`
- `.github/workflows/no-required-third-party-runtime.yml`
- `docs/SITE_497_STEGGATE_DEPENDENCY_RECONCILIATION_MIRROR_HANDOFF.md`

Integration target: repository root `README.md`, immediately after the top-level Boundary section and before capability-specific detail. This file is staging text only until that exact README integration is committed; it must not be cited as proof that README maintenance is already complete.
