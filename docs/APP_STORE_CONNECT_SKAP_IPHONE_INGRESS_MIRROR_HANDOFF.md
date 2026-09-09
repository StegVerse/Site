# App Store Connect iPhone SKAP Ingress Mirror Handoff

## Task pointer

- Parent Goal Task ID: `STEG-BROWSER-EPHEMERAL-RUNTIME-BINDING-001`
- COSV ID: `40000100100000`
- TVC parent issue: `StegVerse-Labs/TVC#355`
- TVC credential handoff: `StegVerse-Labs/TVC/docs/APP_STORE_CONNECT_TV_TVC_SKAP_MIRROR_HANDOFF.md`
- Reused Site pattern: `docs/STEGFIN_PHONE_PROJECTION_MIRROR_HANDOFF.md`

## Goal

Provide a current-iPhone browser-local ingress surface for the already-created App Store Connect Team API credential so that issuer ID, key ID, and the downloaded `.p8` are sealed locally to the active TVC/SKAP recipient key and only ciphertext crosses the Site -> InTr -> TVC/SKAP path.

## Reused implementation pattern

This lane reuses the existing Site Coinbase browser->SKAP mechanics rather than inventing another credential transport:

```text
CURRENT_USER_IPHONE
-> owner WebAuthn / StegID continuity proof
-> browser-local credential bundle
-> P-256 ECDH + HKDF-SHA256 + AES-256-GCM sealing
-> ciphertext-only packet
-> governed InTr receiver
-> DEVICE -> KV receipt
-> KV -> SKAP_VAULT receipt
-> ADMITTED_TO_SKAP_VAULT
```

The provider-specific bindings change to App Store Connect only:

```text
provider: apple_app_store_connect
endpoint_origin: https://api.appstoreconnect.apple.com
credential_ref: skap://APIs/apple/app-store-connect/team-key
recipient key prefix: tvc://skap/browser-ingress/apple/app-store-connect/
credential bundle: issuer_id + key_id + private_key_p8
```

## Required invariants

- credential plaintext is accepted only in browser-local memory on the current iPhone;
- the `.p8` file is read locally through the browser File API and never uploaded in plaintext;
- no localStorage, sessionStorage, IndexedDB, cookie, URL, console, repository, issue, workflow, or chat persistence of credential plaintext;
- the plaintext bundle is zeroed/cleared immediately after sealing;
- Site never receives a SKAP private/root key;
- recipient config must be `PROVISIONED`, lease-valid, and bound to current TVC resident activation/liveness receipts before credential entry is enabled;
- submission remains ciphertext-only and blind retry remains prohibited after ambiguous native submission;
- GitHub Actions validates source only and receives no Apple credential material;
- no provider operation is implied by successful SKAP custody.

## Planned Site surfaces

```text
assets/stegos-apple/app-store-connect-skap-ingress-config.json
assets/stegos-apple/app-store-connect-skap-intr-route.json
assets/stegos-apple/app-store-connect-skap-ingress.js
assets/stegos-apple/app-store-connect-skap-submission.js
assets/stegos-apple/app-store-connect-skap-ingress-ui.js
stegos-apple-credential.html
scripts/check_app_store_connect_skap_phone_ingress.py
.github/workflows/app-store-connect-skap-phone-ingress-validation.yml
```

## Activation boundary

Source implementation must remain fail-closed while either public-only runtime projection is absent:

```text
recipient key status: NOT_PROVISIONED
submission route status: NOT_PROVISIONED
```

Only after TVC emits an active App Store Connect SKAP recipient projection and a current governed InTr route may the page enable local credential selection/sealing.

## Current state

```text
TVC exact Apple credential class: COMPLETE_VALIDATED_MERGED
TVC SKAP resolver: COMPLETE_VALIDATED_MERGED
TVC App Store Connect provider-operation boundary: COMPLETE_VALIDATED_MERGED
Site iPhone Apple ingress handoff: IMPLEMENTED_ON_BRANCH
Site iPhone Apple sealing/submission source: PENDING
real Apple credential SKAP custody: NOT_OBSERVED
manual work: NONE
```
