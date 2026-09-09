# StegOS v15 Configured Rendezvous Propagation

State: `SOURCE_VALIDATED_DEPLOYMENT_PROPAGATION_ONLY`

`stegos-web-bootstrap-v15` is a propagation successor only. It imports the exact released `service-worker-v13-runtime.js` runtime and changes only the cache generation so an already-installed current-device client refreshes `master-records-auto-recovery.js` after the resident-rendezvous routing correction.

The refreshed carrier resolves `data/ecosystem-chat-gateway.json`, requires the configured non-authorizing gateway boundary, derives an HTTPS gateway origin, and uses that existing gateway for resident discovery and governed Site custody-proof evidence submission.

Authority invariants remain unchanged:

```text
Site execution authority = false
gateway execution authority = false
Master Records authority remains external to Site/gateway
resident discovery grants authority = false
transported custody proof authority effect = NONE_EVIDENCE_ONLY
HB32 authority effect = NONE_CARRIER_ONLY
fresh root-InTr admission remains required before custody
SV001 rerun remains prohibited
```

The v15 cache refresh does not prove current-device consumption, fresh root-InTr `ALLOW`, Master Records custody/reconstruction `PASS`, mailbox `RETAINED`, continuation materialization, or SV002 disposition. Source, CI, cache generation, publication, and deployment remain non-authorizing evidence only.
