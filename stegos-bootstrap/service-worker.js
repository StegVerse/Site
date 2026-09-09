"use strict";

// v16 preserves the released v13 runtime and the existing portable HIL checkout
// state while forcing one explicit browser-evidence protocol across the activation
// page and imported HIL receiver. The versioned registration URL is a code-version
// convergence mechanism only; it does not reset IndexedDB, portable WorkerCoordinator
// state, claim/fence lineage, or authority semantics.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v16";

[
  "./sv001-native-resident-activation.js",
  "./native-resident-activate.html"
].forEach(function (asset) {
  if (Array.isArray(SHELL) && SHELL.indexOf(asset) < 0) { SHELL.push(asset); }
});

// Installed Safari clients may retain a controller that imported an older HIL
// receiver even when the HTML itself has advanced. Activate the v16 wrapper
// immediately and claim same-origin clients. State is preserved; only worker code
// identity changes.
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
