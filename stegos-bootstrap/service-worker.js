"use strict";

// Preserve the established v15 cache contract while loading the released v13
// runtime plus the HIL same-device portable WorkerCoordinator projection.
// HIL request-bound receiver refresh marker: RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002.
// The wrapper byte change forces an update check to materialize the current imported
// HIL receiver while retaining the same IndexedDB and portable WorkerCoordinator state.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v15";

// A stale controlling worker may otherwise keep serving the pre-request-binding HIL
// receiver after the page itself has updated. Activate the updated wrapper immediately
// and claim the same-origin clients; this changes code version only and does not mint
// claims, mutate portable WorkerCoordinator state, or widen transition authority.
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
