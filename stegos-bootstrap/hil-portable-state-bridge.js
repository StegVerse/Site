"use strict";

(function (root) {
  function readPortableState() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(META_STORE, "readonly");
        var req = tx.objectStore(META_STORE).get(PORTABLE_WC_STATE_KEY);
        req.onsuccess = function () {
          var value = req.result ? req.result.value : null;
          db.close();
          resolve(value);
        };
        req.onerror = function () {
          var error = req.error || new Error("portable WorkerCoordinator state read failed");
          db.close();
          reject(error);
        };
      });
    });
  }

  function portableStateStoreForPackage(pkg) {
    return {
      read: readPortableState,
      atomicCompareAndSwap: function (expected, nextState) {
        return openDb().then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx = db.transaction(META_STORE, "readwrite");
            var store = tx.objectStore(META_STORE);
            var req = store.get(PORTABLE_WC_STATE_KEY);
            var matched = false;
            req.onerror = function () { reject(req.error || new Error("portable WorkerCoordinator state CAS read failed")); };
            req.onsuccess = function () {
              var current = req.result ? req.result.value : null;
              if (current === null) {
                if (!root.StegVersePortableWorkerCoordinator || typeof root.StegVersePortableWorkerCoordinator.initialState !== "function") { return; }
                matched = canonicalize(expected) === canonicalize(root.StegVersePortableWorkerCoordinator.initialState(pkg));
              } else {
                matched = canonicalize(current) === canonicalize(expected);
              }
              if (matched) { store.put({ key: PORTABLE_WC_STATE_KEY, value: nextState }); }
            };
            tx.oncomplete = function () { db.close(); resolve(matched); };
            tx.onerror = function () {
              var error = tx.error || new Error("portable WorkerCoordinator state CAS failed");
              db.close();
              reject(error);
            };
            tx.onabort = function () {
              var error = tx.error || new Error("portable WorkerCoordinator state CAS aborted");
              db.close();
              reject(error);
            };
          });
        });
      }
    };
  }

  root.StegOSEcosystemChatServiceWorkerBridge = root.StegOSEcosystemChatServiceWorkerBridge || {};
  root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage = portableStateStoreForPackage;
}(self));

// Load both same-lineage HIL browser continuations through the already-loaded HIL
// bridge surface. The accepted v16 receiver remains unchanged; ESRL is a separate
// post-local-ready evidence route and reuses the same portable WorkerCoordinator state.
importScripts("./hil-browser-receiver.js");
importScripts("./hil-browser-esrl-lease.js");
