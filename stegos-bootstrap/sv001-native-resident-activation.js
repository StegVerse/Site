(function (root) {
  "use strict";

  var SCHEMA = "stegos.mobile.resident-rendezvous-binding/v1";
  var AUTHORITY_EFFECT = "NONE_BINDING_ONLY";
  var ACTIVATION_BASE = "stegverse://resident-rendezvous/activate";
  var DB_NAME = "stegos-node-v1";
  var DB_VERSION = 2;
  var META = "meta";
  var RECEIPTS = "receipts";
  var REGISTRATION_KEY = "registration";
  var NODE_RE = /^SV-NODE-[0-9a-f]{24}$/;
  var SHA256_RE = /^[0-9a-f]{64}$/;

  function bytesToHex(bytes) {
    return Array.from(bytes, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function canonical(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    return "{" + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ":" + canonical(value[key]);
    }).join(",") + "}";
  }

  function sha256(value) {
    var text = typeof value === "string" ? value : canonical(value);
    return root.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (digest) {
      return bytesToHex(new Uint8Array(digest));
    });
  }

  function sourceOrigin() {
    var origin = String((root.location && root.location.origin) || "");
    if (origin !== "https://stegverse.org" && origin !== "https://www.stegverse.org") {
      throw new Error("NATIVE_RESIDENT_ACTIVATION_ORIGIN_NOT_ADMITTED");
    }
    return origin;
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!root.indexedDB || !root.crypto || !root.crypto.subtle) {
        reject(new Error("NODE_CONTINUITY_RUNTIME_UNAVAILABLE"));
        return;
      }
      var request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        request.transaction.abort();
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("REGISTERED_NODE_DATABASE_UNAVAILABLE")); };
    });
  }

  function readCanonicalRegistration() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        if (!db.objectStoreNames.contains(META) || !db.objectStoreNames.contains(RECEIPTS)) {
          db.close();
          reject(new Error("CANONICAL_NODE_STORES_UNAVAILABLE"));
          return;
        }
        var tx = db.transaction([META, RECEIPTS], "readonly");
        var registrationRequest = tx.objectStore(META).get(REGISTRATION_KEY);
        var receiptRequest = tx.objectStore(RECEIPTS).get(1);
        var registrationRow = null;
        var genesis = null;
        registrationRequest.onsuccess = function () { registrationRow = registrationRequest.result || null; };
        receiptRequest.onsuccess = function () { genesis = receiptRequest.result || null; };
        registrationRequest.onerror = function () { reject(registrationRequest.error || new Error("NODE_REGISTRATION_READ_FAILED")); };
        receiptRequest.onerror = function () { reject(receiptRequest.error || new Error("NODE_RECEIPT_1_READ_FAILED")); };
        tx.oncomplete = function () {
          db.close();
          resolve({ registration: registrationRow ? registrationRow.value : null, genesis: genesis });
        };
        tx.onerror = function () {
          var error = tx.error || new Error("CANONICAL_NODE_READ_FAILED");
          db.close();
          reject(error);
        };
      });
    }).then(function (state) {
      var registration = state.registration;
      var genesis = state.genesis;
      if (!registration || registration.state !== "REGISTERED" || !genesis) {
        throw new Error("REGISTERED_NODE_REQUIRED");
      }
      if (genesis.schema !== "stegos.node_handoff_receipt.v1" || genesis.receipt_number !== 1 || genesis.transition !== "NODE_REGISTERED" || genesis.continuity_parent !== "GENESIS") {
        throw new Error("CANONICAL_NODE_RECEIPT_1_REQUIRED");
      }
      if (genesis.authority_effect !== "NONE" || genesis.credential_authority !== "TV/TVC") {
        throw new Error("NODE_RECEIPT_1_AUTHORITY_BOUNDARY_INVALID");
      }
      var nodeRef = String(registration.node_id || "");
      var digest = String(registration.receipt_sha256 || "");
      if (!NODE_RE.test(nodeRef)) throw new Error("CANONICAL_NODE_REF_REQUIRED");
      if (!SHA256_RE.test(digest)) throw new Error("CANONICAL_NODE_RECEIPT_1_SHA256_REQUIRED");
      if (String(genesis.node_id || "") !== nodeRef || String(genesis.receipt_sha256 || "") !== digest) {
        throw new Error("NODE_REGISTRATION_RECEIPT_1_MISMATCH");
      }
      var body = Object.assign({}, genesis);
      delete body.receipt_sha256;
      return sha256(body).then(function (actual) {
        if (actual !== digest) throw new Error("NODE_RECEIPT_1_DIGEST_MISMATCH");
        return { registration: registration, genesis: genesis };
      });
    });
  }

  function canonicalBinding(state) {
    return {
      schema: SCHEMA,
      node_ref: state.registration.node_id,
      node_receipt_1_sha256: "sha256:" + state.registration.receipt_sha256,
      source_origin: sourceOrigin(),
      authority_effect: AUTHORITY_EFFECT
    };
  }

  function encode(binding) {
    var params = new URLSearchParams();
    params.set("schema", binding.schema);
    params.set("node_ref", binding.node_ref);
    params.set("node_receipt_1_sha256", binding.node_receipt_1_sha256);
    params.set("source_origin", binding.source_origin);
    params.set("authority_effect", binding.authority_effect);
    return ACTIVATION_BASE + "?" + params.toString();
  }

  function buildActivationProjection() {
    return readCanonicalRegistration().then(function (state) {
      var binding = canonicalBinding(state);
      return {
        schema: "stegos.native-resident-activation-projection/v1",
        state: "READY_FOR_USER_MEDIATED_APP_OPEN",
        activation_url: encode(binding),
        node_ref: binding.node_ref,
        node_receipt_1_sha256: binding.node_receipt_1_sha256,
        receipt_1_digest_revalidated: true,
        projection_grants_authority: false,
        app_open_proves_listener_ready: false,
        app_open_proves_custody: false,
        app_open_proves_runtime_continuity: false,
        hosted_transport_role: "FALLBACK_ONLY",
        authority_effect: "NONE_PROJECTION_ONLY"
      };
    });
  }

  function openStegOSFromUserGesture() {
    return buildActivationProjection().then(function (projection) {
      // iOS custom-scheme navigation is intentionally exposed only to a caller
      // that is already handling a user gesture. This function does not claim
      // the app opened, the listener remained available after switching apps,
      // or any InTr/custody transition occurred.
      root.location.href = projection.activation_url;
      return projection;
    });
  }

  root.StegOSNativeResidentActivation = {
    contract_version: "1.1.0",
    buildActivationProjection: buildActivationProjection,
    openStegOSFromUserGesture: openStegOSFromUserGesture,
    projection_grants_authority: false,
    hosted_transport_role: "FALLBACK_ONLY",
    authority_effect: "NONE_PROJECTION_ONLY"
  };
}(typeof globalThis !== "undefined" ? globalThis : window));
