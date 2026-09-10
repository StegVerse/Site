# My KV Connected Accounts Mirror Handoff

Goal Task ID: `SS-SKAP-AUTHENTIC-ACCOUNT-METADATA-POPULATION-001`
Parent Goal Task ID: `SS-SKAP-ACCOUNT-INVENTORY-PROJECTION-001`
Repository: `StegVerse-Labs/Site`
Status: `IMPLEMENTED / EXACT-HEAD REVALIDATION REQUIRED AFTER HANDOFF UPDATE`

## Scope

Expose Connected Accounts as a first-class selectable item on the My KV landing UI. Selecting it opens a dedicated owner-controlled account-selection surface where eligible provider-account observations may be reviewed and individually selected for bounded non-secret SKAP/KV metadata admission.

The UI must never request, display, or persist passwords, access tokens, refresh tokens, private keys, credential payloads, or raw provider account identifiers. Provider observations remain observations until admitted through the existing governed SKAP/InTr path.

## Implemented UI contract

- `assets/my-kv-directory.js` registers `Connected Accounts` as a first-class My KV item at the bounded metadata path `_Vault/SKAP/Accounts`.
- The item routes to `my-kv-connected-accounts.html`, not raw `_Vault/SKAP/Receipts` browsing.
- The dedicated page exposes `Find connected accounts`, individual account checkboxes, and `Add selected to My KV`.
- `assets/my-kv-connected-accounts.js` accepts only bounded provider/account references and rejects secret-bearing or raw-provider-ID fields before rendering or submission.
- Unselected accounts are untouched.
- Submission requests only `SKAP_NONSECRET_ACCOUNT_METADATA` and explicitly carries `synthetic_input_allowed=false`, `raw_provider_identifiers_present=false`, and `credential_material_present=false`.
- Missing observation/population bridges fail closed and do not fabricate accounts or persistence.
- `tests/my-kv-connected-accounts.test.cjs` covers routing, normalization, bounded discovery, raw provider-ID refusal, and token refusal.
- `scripts/check_my_kv_directory.py` requires the selector/page/bridge/test and the bounded-population markers.

## Pre-work claim repair

The first Site validation attempt failed because branch `task/my-kv-connected-accounts-20260910` did not resolve to exactly one active pre-work claim. No UI contract failure was identified by that run. The branch now carries:

`data/session-work-claims.d/site-skap-authentic-account-metadata-population-001-20260910.json`

with task `SS-SKAP-AUTHENTIC-ACCOUNT-METADATA-POPULATION-001`, role `IMPLEMENTATION`, state `CLAIMED_FOR_IMPLEMENTATION`, exact branch/handoff/path scope, and no overlapping ownership of the KV/InTr runtime.

After the claim repair, the previously failing Site bootstrap validation, handoff reconciliation, and heartbeat-contract checks completed successfully at head `3460fdc3c2c56a150a8db783465bc1bf2fc1b27a`; the complete check set contained no failure conclusion. Because this handoff update advances the PR head, exact-head checks must be observed again before merge.

## Completion boundary

Static UI implementation, CI, preview build, or merge do not prove live provider-account population. Authentic task completion still requires:

1. runtime `StegVerseKVAccountObservationBridge` backed by bounded authenticated provider observations;
2. `populateSelectedAccountMetadata` bound to the existing SKAP/InTr metadata transition;
3. one owner-selected real account producing a retained non-secret SKAP/InTr receipt;
4. parent TVC projection enumerating that authentic populated account; and
5. ERL reconciliation consuming the resulting projection.

## Manual work

None.
