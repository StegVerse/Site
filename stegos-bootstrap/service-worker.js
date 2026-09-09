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

// Extend only the wrapper-time shell projection. The canonical v13 runtime
// file remains exact/unchanged. These activation assets project an already-
// registered canonical Node Receipt #1 into the StegOS Mobile custom scheme;
// they grant no execution, admission, custody, credential, or routing authority.
[
  "./sv001-native-resident-activation.js",
  "./native-resident-activate.html"
].forEach(function (asset) {
  if (Array.isArray(SHELL) && SHELL.indexOf(asset) < 0) { SHELL.push(asset); }
});

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
