"use strict";

// v15 is a propagation successor only. Runtime/governance behavior remains the
// exact released v13 implementation below; this cache generation exists solely
// to force installed current-device clients to refresh the corrected configured
// resident-rendezvous route in master-records-auto-recovery.js.
importScripts("./service-worker-v13-runtime.js");

CACHE_NAME = "stegos-web-bootstrap-v15";
