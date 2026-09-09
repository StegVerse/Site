# Site KV-Bound Ephemeral Browser Projection Mirror Handoff

Updated: 2026-09-09

Related goal: `KV-BOUND-EPHEMERAL-BROWSER-PROJECTION-001`
Canonical issue: `StegVerse-Labs/.github#1299`
COSV: `50000010100000`
Canonical KV architecture: `StegVerse-Labs/continuity-vault-kit/docs/KV_PRIVACY_STATE_TRANSITION_CONTINUITY.md`
StegOS focused handoff: `StegVerse-Labs/StegOS/docs/KV_BOUND_STEGBROWSER_EPHEMERAL_PROJECTION_MIRROR_HANDOFF.md`

## Site role

Site is a distribution/rendezvous surface, not the user-continuity root, KV privacy boundary, browser identity authority, device identity authority, or runtime authority.

A minimal public bootstrap may exist to initiate discovery/confirmation, but substantive private presentation state should not be permanently materialized into Site or browser-local storage.

## Required flow

```text
public minimal rendezvous
-> confirm existing KV/device interoperability relationship
-> satisfy KV entry state-transition dependency
-> observe current browser/container capability
-> materialize private ephemeral presentation packet
-> governed action
-> consequence-state commitment
-> dispose session/presentation state
```

Browser/container identity, user-agent details, device characteristics, carrier/network observations, provider relationships, and other correlatable user-associated metadata remain behind KV whenever technically possible. Site-facing evidence should carry only minimum purpose-scoped opaque references, commitments, and routing material.

## Multi-browser/container requirement

The same Site entry link may be opened from Safari, Chrome, Opera, Google-app browser surfaces, ChatGPT internal browser/webviews, or other iOS browser containers. Site must not infer sovereign identity or continuity from the browser/container, IndexedDB namespace, service worker, cookies, or stale historical bootstrap state.

Browser/container capability may affect which ephemeral code/UI packet is materialized after KV entry, but it does not define user, KV, or device continuity.

## Current signer/WASM projection implication

The validated current-iPhone signer/WASM may require static pre-install distribution, but Site must not convert that static source into a permanently active private browser environment. Static code is non-authorizing source availability. Private presentation activation remains dependent on the KV entry transition and current capability observation.

Any future Site projection of signer/glue/WASM/action modules must therefore distinguish:

- minimal public/static bootstrap assets needed to reach the private entry path;
- post-KV ephemeral private presentation/action assets;
- opaque transition commitments returned to durable KV/StegOS/StegBrowser state.

## Historical browser-local KV state

Existing owner-observed `device-local-browser-indexeddb` KV materialization remains historical evidence. It must not be silently reclassified as the target continuity architecture. Migration must preserve its provenance while removing browser-local persistence as the durable continuity/privacy root.

## Authority

Publication or Site availability grants no execution, governance, credential, KV-entry, device, browser, HB, custody, or completion authority.
