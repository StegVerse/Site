# StegSocials Bounded Group DEVICE_KV CAS

Goal Task ID: `SS-KV-SKAP-SOCIAL-RELEASE-001`

This Site integration projects the already validated bounded StegSocials post-group use-state contract into the existing same-device `DEVICE_KV` persistence boundary. It reuses IndexedDB database `stegverse-device-local-intr-v1` and object store `kv_files`; it does not create another KV runtime, InTr authority plane, credential store, or publication authority.

## Transaction contract

For one already-admitted bounded post-group use, the receiver accepts the current persisted state etag and proposed next state, verifies the supplied publication/destruction evidence envelope, compares the expected etag against the persisted row inside one IndexedDB `readwrite` transaction, and writes the next state only when the comparison still matches. A stale writer aborts before mutation.

After transaction completion, the receiver independently reopens the store, reads the persisted state, recomputes its canonical SHA-256 etag, and requires exact agreement with the requested next-state etag. Credential-like fields and provider-operation authority are refused.

## Source

```text
assets/stegsocials-bounded-group-device-kv-cas-receiver.js
tests/stegsocials-bounded-group-device-kv-cas-receiver.test.cjs
.github/workflows/stegsocials-post-preparation.yml
docs/STEGSOCIALS_BOUNDED_GROUP_DEVICE_KV_CAS_MIRROR_HANDOFF.md
```

## Authority separation

```text
InTr                      admission / transition authority
TV/TVC + SKAP             credential authority
StegBrowser                bounded ephemeral provider execution
DEVICE_KV CAS receiver     atomic local use-state persistence only
Personal-KV                participant-owned durable data plane
Master Records             custody / reconstruction
Site                       projection and carrier only
```

A successful deterministic test or CI workflow proves source-level transaction behavior only. It does not prove current-iPhone execution, authentic Personal-KV mutation, social-provider publication, SKAP credential activation, or Master Records reconstruction.

## Runtime completion

Runtime completion requires the existing Node/InTr materialization path to route an externally admitted bounded-group transition into this receiver on the retained current-iPhone `DEVICE_KV`, with exact pre-state, admission, post-state, independent readback, publication, terminal StegBrowser destruction, Personal-KV custody, and Master Records reconstruction evidence retained. At least two in-scope posts must consume one participant-approved bounded group without renewed approval, while stale, replayed, and widened attempts fail closed.
