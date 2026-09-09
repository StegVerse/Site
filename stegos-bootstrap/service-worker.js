"use strict";

// v16 carries the released v13 runtime plus the HIL same-device portable
// WorkerCoordinator projection. The cache generation bump forces installed
// current-iPhone clients to refresh onto the HIL-aware service worker.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v16";
