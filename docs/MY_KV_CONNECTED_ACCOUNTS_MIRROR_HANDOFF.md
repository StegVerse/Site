# My KV Connected Accounts Mirror Handoff

Goal Task ID: `SS-SKAP-AUTHENTIC-ACCOUNT-METADATA-POPULATION-001`
Parent Goal Task ID: `SS-SKAP-ACCOUNT-INVENTORY-PROJECTION-001`
Repository: `StegVerse-Labs/Site`
Status: `IMPLEMENTATION_IN_PROGRESS`

## Scope

Expose Connected Accounts as a first-class selectable item on the My KV landing UI. Selecting it opens a dedicated owner-controlled account-selection surface where eligible provider-account observations may be reviewed and individually selected for bounded non-secret SKAP/KV metadata admission.

The UI must never request, display, or persist passwords, access tokens, refresh tokens, private keys, credential payloads, or raw provider account identifiers. Provider observations remain observations until admitted through the existing governed SKAP/InTr path.

## UI contract

- My KV landing includes a `Connected Accounts` card.
- The card routes to `my-kv-connected-accounts.html`, not to raw `_Vault/SKAP/Receipts` browsing.
- The account page requests bounded provider observations from an injected runtime bridge.
- Each account is individually selectable; unselected accounts are untouched.
- Submission requests non-secret SKAP account metadata population only.
- Missing runtime bridges fail closed and do not fabricate accounts or persistence.

## Completion boundary

Static UI implementation and validation do not prove live provider-account population. Authentic completion still requires the runtime bridge to return real provider observations and the selected metadata to produce a retained SKAP/InTr receipt that is later enumerated by the parent projection.

## Manual work

None.
