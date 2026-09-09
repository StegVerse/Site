"use strict";

// v16 preserves the released v13 runtime, HIL_BROWSER_EVIDENCE_V16 protocol,
// and the existing portable HIL checkout state. The current wrapper also repairs
// one Safari convergence defect: an already-controlled ESRL navigation can be
// satisfied by a stale cache entry whose page still requires a manual lease-button
// tap. This repair does not reset IndexedDB, portable WorkerCoordinator state,
// claim/fence lineage, or TV/TVC boundaries.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v16";
var ESRL_PAGE_PATH = "/stegos-bootstrap/hil-esrl-activate.html";

[
  "./sv001-native-resident-activation.js",
  "./native-resident-activate.html",
  "./hil-esrl-activate.html"
].forEach(function (asset) {
  if (Array.isArray(SHELL) && SHELL.indexOf(asset) < 0) { SHELL.push(asset); }
});

// Installed Safari clients may retain ESRL HTML from before automatic same-context
// continuation even after source has advanced. Re-installing this wrapper refreshes
// the exact ESRL page inside the existing v16 cache via the predecessor install
// handler. On activation, claim existing clients and re-navigate only an already-open
// ESRL page so it receives the refreshed auto-resume source without requiring the
// stale page's button to be the mechanism that installs the current worker.
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    self.clients.claim().then(function () {
      return self.clients.matchAll({ type: "window", includeUncontrolled: true });
    }).then(function (clients) {
      return Promise.all(clients.map(function (client) {
        var url;
        try { url = new URL(client.url); } catch (_) { return null; }
        if (url.origin !== self.location.origin || url.pathname !== ESRL_PAGE_PATH || typeof client.navigate !== "function") { return null; }
        return client.navigate(client.url);
      }));
    })
  );
});
