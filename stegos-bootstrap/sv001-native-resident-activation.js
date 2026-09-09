(function (root) {
  "use strict";

  var SCHEMA = "stegos.mobile.resident-rendezvous-binding/v1";
  var AUTHORITY_EFFECT = "NONE_BINDING_ONLY";
  var ACTIVATION_BASE = "stegverse://resident-rendezvous/activate";
  var NODE_RE = /^SV-NODE-[0-9a-f]{24}$/;
  var SHA256_RE = /^[0-9a-f]{64}$/;

  function sourceOrigin() {
    var origin = String((root.location && root.location.origin) || "");
    if (origin !== "https://stegverse.org" && origin !== "https://www.stegverse.org") {
      throw new Error("NATIVE_RESIDENT_ACTIVATION_ORIGIN_NOT_ADMITTED");
    }
    return origin;
  }

  function requireContinuity() {
    if (!root.StegVerseNodeContinuity || typeof root.StegVerseNodeContinuity.status !== "function") {
      throw new Error("NODE_CONTINUITY_UNAVAILABLE");
    }
    return root.StegVerseNodeContinuity;
  }

  function canonicalBindingFromStatus(current) {
    if (!current || current.registered !== true || current.state !== "REGISTERED") {
      throw new Error("REGISTERED_NODE_REQUIRED");
    }
    var registration = current.registration;
    var receipts = Array.isArray(current.receipts) ? current.receipts : [];
    var genesis = receipts[0];
    if (!registration || !genesis || genesis.receipt_number !== 1 || genesis.transition !== "NODE_REGISTERED") {
      throw new Error("CANONICAL_NODE_RECEIPT_1_REQUIRED");
    }
    var nodeRef = String(registration.node_id || "");
    var digest = String(registration.receipt_sha256 || "");
    if (!NODE_RE.test(nodeRef)) throw new Error("CANONICAL_NODE_REF_REQUIRED");
    if (!SHA256_RE.test(digest)) throw new Error("CANONICAL_NODE_RECEIPT_1_SHA256_REQUIRED");
    if (String(genesis.node_id || "") !== nodeRef || String(genesis.receipt_sha256 || "") !== digest) {
      throw new Error("NODE_REGISTRATION_RECEIPT_1_MISMATCH");
    }
    return {
      schema: SCHEMA,
      node_ref: nodeRef,
      node_receipt_1_sha256: "sha256:" + digest,
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
    return Promise.resolve().then(function () {
      return requireContinuity().status();
    }).then(function (current) {
      var binding = canonicalBindingFromStatus(current);
      return {
        schema: "stegos.native-resident-activation-projection/v1",
        state: "READY_FOR_USER_MEDIATED_APP_OPEN",
        activation_url: encode(binding),
        node_ref: binding.node_ref,
        node_receipt_1_sha256: binding.node_receipt_1_sha256,
        projection_grants_authority: false,
        app_open_proves_listener_ready: false,
        app_open_proves_custody: false,
        hosted_transport_role: "FALLBACK_ONLY",
        authority_effect: "NONE_PROJECTION_ONLY"
      };
    });
  }

  function openStegOSFromUserGesture() {
    return buildActivationProjection().then(function (projection) {
      // iOS custom-scheme navigation is intentionally exposed only to a caller
      // that is already handling a user gesture. This function does not claim
      // that the app opened, that its listener survived an app switch, or that
      // any governance/custody transition occurred.
      root.location.href = projection.activation_url;
      return projection;
    });
  }

  root.StegOSNativeResidentActivation = {
    contract_version: "1.0.0",
    buildActivationProjection: buildActivationProjection,
    openStegOSFromUserGesture: openStegOSFromUserGesture,
    projection_grants_authority: false,
    hosted_transport_role: "FALLBACK_ONLY",
    authority_effect: "NONE_PROJECTION_ONLY"
  };
}(typeof globalThis !== "undefined" ? globalThis : window));
