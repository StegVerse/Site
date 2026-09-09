# StegVerse.me Opaque Node Resolver Mirror Handoff

Repository: `StegVerse-Labs/Site`
Issue: `#680`
Goal: `SITE-STEGVERSE-ME-OPAQUE-RESOLVER-680`
Branch: `feature/stegverse-me-opaque-resolver-680-r1`
State: RELEASED
Authority effect: NONE
Activation effect: false

## Purpose

Bind a `stegverse.me/n/<opaque-node>/` route to already-established local StegVerse
device-node continuity before a personal projection may render. The route is a locator, never
identity or access authority.

## Existing sources reused

- IndexedDB `stegos-web-bootstrap-v1`
- metadata keys `node` and `device-continuity-root`
- ordered `receipts` journal
- `stegos.web_node.v1`
- `stegos.web_device_continuity_root.v1`
- `stegos.web_device_node_binding_receipt.v1`

No alternate node identity, server identity registry, KV registry, credential store, or
activation registry may be created.

## Owned files

- `data/stegverse-me-opaque-resolver-contract.json`
- `stegos-node/stegverse-me-opaque-resolver.js`
- `stegos-node/stegverse-me-resolver.html`
- `tests/stegverse-me-opaque-resolver.test.cjs`
- `scripts/check_stegverse_me_opaque_resolver.py`
- `.github/workflows/stegverse-me-opaque-resolver.yml`
- `docs/STEGVERSE_ME_OPAQUE_NODE_RESOLVER_MIRROR_HANDOFF.md`
- `data/session-work-claims.d/site-stegverse-me-opaque-resolver-680.json`

## Fail-closed contract

1. Opaque route derivation uses SHA-256 over a domain-separated canonical tuple containing the
   established node ID and device-continuity ID.
2. Raw node, device, KV, email, or other PII values never appear in the route.
3. Resolver admission requires valid local node/device records, replay-valid journal continuity,
   an observed binding receipt, and exact route equality.
4. Missing, invalid, partitioned, or mismatched local evidence returns `REVIEW` or
   `FAIL_CLOSED`; it never returns admitted.
5. Route possession alone grants no access.
6. The resolver reads only local continuity and does not perform private-KV readback.
7. No DNS, TLS, provider, credential, authority, activation, receipt, or recovery mutation occurs.

## Completion boundary

Source implementation, deterministic negative tests, exact-head hosted validation, merge, and
claim release are machine-executable here. Production origin selection, DNS/TLS, authentic
Interlock admission, and private-KV readback remain separate observed activation gates.


## Local validation evidence — 2026-08-30

Branch head validated after exact-route hardening:
- `python3 scripts/check_stegverse_me_opaque_resolver.py` -> `STEGVERSE_ME_OPAQUE_RESOLVER_PASS`
- `node tests/stegverse-me-opaque-resolver.test.cjs` -> `STEGVERSE_ME_OPAQUE_RESOLVER_TEST_PASS`
- canonical `/n/<opaque-node>/` -> local continuity verified only with replay-valid local evidence
- canonical `/n/<opaque-node>/services.html` -> local continuity verified only with replay-valid local evidence
- arbitrary descendant under `/n/<opaque-node>/` -> `FAIL_CLOSED / OPAQUE_NODE_ROUTE_NOT_ALLOWED`
- route possession without local continuity -> `FAIL_CLOSED`
- private KV readback -> false
- authentic Interlock admission -> false
- authority effect -> NONE
- activation effect -> false

Container network could not resolve github.com, so repository-wide local sandbox materialization was not available through direct git clone. This is an execution-environment transport limitation, not a source validation result. Exact-head hosted repository-wide validation remains required and must not be treated as runtime activation.


## Merge evidence

- Source PR: #721
- Source merge: `f8eb999f82d37ee3203968fc02bddba14453bb47`
- Exact-head source SHA: `59362d5c1ae608db31798fa1c8b39436a3b2d046`
- StegVerse.me Opaque Node Resolver Validation: PASS
- Site Bootstrap Validate - No Non-TV/TVC Credential Authority: PASS
- Site Handoff Orchestrator: PASS
- Ecosystem Heartbeat Orchestration: PASS
- StegOS Node Public Observation: PASS
- Source merge does not establish production origin, DNS/TLS, authentic Interlock admission, private-KV readback, or activation.


## Claim release reconciliation — 2026-08-30

- Claim release PR: #723
- Claim release merge: `aee413233d7154b8d60c37d6f4acfaa866a33e8d`
- Claim registry state: `RELEASED`
- Claim role: `RELEASED_INTEGRATION`
- Source implementation remains merged at `f8eb999f82d37ee3203968fc02bddba14453bb47`.
- This handoff transition records claim release only. Production origin, DNS/TLS, authentic Interlock admission, private-KV readback, and runtime activation remain unobserved and are not claimed.
