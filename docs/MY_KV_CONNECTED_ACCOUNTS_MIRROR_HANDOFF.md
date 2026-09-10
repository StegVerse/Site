# My KV Connected Accounts Mirror Handoff

Goal Task ID: `SS-SKAP-AUTHENTIC-ACCOUNT-METADATA-POPULATION-001`
Parent Goal Task ID: `SS-SKAP-ACCOUNT-INVENTORY-PROJECTION-001`
Repository: `StegVerse-Labs/Site`
Status: `KV_SKAP_CONFORMANCE_ADAPTER_IMPLEMENTED / LIVE_DISPATCH_PENDING`

## Scope

Expose Connected Accounts as a first-class selectable My KV item and bind its eventual population path to the exact non-secret KnowledgeVault -> SKAP Vault protocol. The UI must never request, render, or persist raw provider account identifiers, provider credentials, tokens, keys, or secret payloads.

## Merged UI

Site PR #1192 merged the `Connected Accounts` card, `my-kv-connected-accounts.html`, bounded account-observation client, per-account owner selection, static validation, and focused tests.

## KV -> SKAP protocol now available

Upstream protocol and receiver are now canonical:

- continuity-vault-kit PR #207 merged the exact `stegverse.kv-skap.account-metadata-transfer/v1` packet, canonical `kv.interlock.request.v1` `COMMIT_CANDIDATE`, and `stegverse.intr.boundary-transfer/v1` envelope;
- continuity-vault-kit PR #208 merged a deterministic shared conformance vector;
- TVC PR #374 merged the SKAP receiver requiring exact InTr `ADMITTED` bindings and emitting `stegverse.skap.account-metadata-receipt/v1`;
- StegOS PR #321 merged the narrow `kv-skap-account-metadata` profile for operation `SKAP_ACCOUNT_METADATA_ADMIT`, without widening `kv-skap` or `kv-skap-custody`.

## Current Site integration branch

Branch: `task/my-kv-skap-account-transfer-20260910`

Added:

- `assets/my-kv-skap-account-transfer.js` — browser-side deterministic packet/request/envelope builder, exact profile guard, materialization builder, and structured SKAP receipt validator;
- `tests/fixtures/kv_skap_account_metadata_conformance_v1.json` — the same wire vector used by CVK and TVC;
- expanded `tests/my-kv-connected-accounts.test.cjs` — requires exact CVK packet/request/envelope regeneration, rejects use of the older `kv-skap` profile, and validates exact structured SKAP receipts;
- scoped Site pre-work claim for this task.

The conformance adapter explicitly fails closed unless generated InTr exposes `kv-skap-account-metadata`. A boolean-only success result is not treated by the adapter as SKAP receipt proof.

## Current runtime gap

The root current-device `intr-service-worker.js` still advertises only its existing KV/HIL/Master Records profiles and its materialization dispatcher does not yet admit destination `SKAP_VAULT / SKAP:Vault` for `SKAP_ACCOUNT_METADATA_ADMIT`. Site's checked-in generated browser connector also predates the newly merged profile.

Therefore source-level wire conformance is testable now, but authentic current-iPhone KV -> SKAP execution is not yet claimed.

## Next

1. Run Site branch validation and repair any conformance failure.
2. Propagate the merged StegOS `kv-skap-account-metadata` profile into Site's generated browser connector.
3. Extend the existing root Universal InTr service worker/dispatcher with the exact SKAP account-metadata destination/operation; do not create a second service worker or InTr runtime.
4. Replace the remaining generic population bridge behavior with structured packet/materialization/receipt flow.
5. Execute one authentic owner-selected account, persist its SKAP receipt, re-run TVC inventory projection, then feed that projection into ERL reconciliation.

## Manual work

None.
