"use strict";

// cache lineage retained for validator/reconstruction continuity:
// stegos-node-shell-v8-source-package-bootstrap-v1 -> stegos-node-shell-v9-bootstrap-intr-delivery-v1 -> stegos-node-shell-v10-org-allocator-fresh-v1
var CACHE_NAME = "stegos-node-shell-v10-org-allocator-fresh-v1";
var SHELL = [
  "./",
  "./index.html",
  "./stegos-node.js",
  "./hil-intr-sync.js",
  "./hil-intr-sync-target.json",
  "./kv-readiness-snapshot.json",
  "./portable-source-bootstrap-v1.html",
  "./private-source-portable-package-v1.schema.json",
  "./source-package-bootstrap-v1.html",
  "./source-package-v1.schema.json",
  "./bootstrap-bundle-materialization-v1.html",
  "./bootstrap-bundle-intr-delivery-v1.html",
  "./bootstrap-bundle-v1.schema.json",
  "./manifest.webmanifest"
];
var NETWORK_ONLY_PATHS = {
  "/stegos-node/org-allocator-bootstrap.html": true,
  "/stegos-node/org-allocator-portable.js": true,
  "/stegos-node/org-allocator-current-iphone-package.json": true
};

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin === self.location.origin && NETWORK_ONLY_PATHS[url.pathname]) {
    event.respondWith(fetch(event.request, {cache: "no-store"}));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (cached) {
    if (cached) return cached;
    return fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      throw new Error("offline resource unavailable");
    });
  }));
});
