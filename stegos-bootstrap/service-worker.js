"use strict";

// v17 preserves the released v13 runtime, HIL_BROWSER_EVIDENCE_V16 protocol,
// and the existing portable HIL checkout state while repairing one Safari
// convergence defect: an already-controlled ESRL navigation could be satisfied by
// a stale cache entry whose page still required a manual lease-button tap. The
// cache-generation change does not reset IndexedDB, portable WorkerCoordinator
// state, claim/fence lineage, or TV/TVC boundaries.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v17";
var ESRL_PAGE_PATH = "/stegos-bootstrap/hil-esrl-activate.html";

[
  "./sv001-native-resident-activation.js",
  "./native-resident-activate.html",
  "./hil-esrl-activate.html"
].forEach(function (asset) {
  if (Array.isArray(SHELL) && SHELL.indexOf(asset) < 0) { SHELL.push(asset); }
});

// Installed Safari clients may retain a controller/cache generation whose ESRL
// HTML predates automatic same-context continuation. Advance the cache generation,
// claim existing clients, then re-navigate only an already-open ESRL page after the
// old cache generations have been removed. The new cache already contains the
// current ESRL page, so the re-navigation reaches auto-resume without requiring the
// stale page's button to be the mechanism that installs the current worker.
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
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
