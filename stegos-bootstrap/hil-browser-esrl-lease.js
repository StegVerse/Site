"use strict";

(function (root) {
  var ROUTE_PATH = "/stegos-bootstrap/portable-workercoordinator/hil-esrl-v1";
  var PROTOCOL = "HIL_BROWSER_ESRL_V1";
  var SOURCE_PROTOCOL = "HIL_BROWSER_EVIDENCE_V16";
  var PACKAGE_URL = new URL("./workercoordinator-portable-hil.json", root.location.href).toString();
  var TASK_ID = "SHWP-HIL-SOVEREIGN-RECEIVER-001";
  var REQUEST_ID = "RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002";
  var REQUEST_SHA256 = "6bf940fb920f672111ba1040fd0bf9bf7016d6bf032bbcfd164a1a2347ee7038";

  function fail(reason) { throw new Error("FAIL_CLOSED: " + reason); }
  function jsonResponse(status, value) {
    return new Response(JSON.stringify(value, null, 2) + "\n", {
      status: status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }

  function requireBrowserEvidence(value) {
    if (!value || value.schema !== "stegos.hil_browser_receiver_activation_result/v1") { fail("exact browser activation result required"); }
    if (value.state !== "BROWSER_HIL_LOCAL_READY_OBSERVED") { fail("browser local-ready observation required"); }
    if (value.hil_browser_protocol !== SOURCE_PROTOCOL) { fail("source browser protocol mismatch"); }
    if (value.task_id !== TASK_ID || value.resident_request_id !== REQUEST_ID || value.resident_request_sha256 !== REQUEST_SHA256) { fail("resident request binding mismatch"); }
    if (!/^ctx_[a-f0-9]{32}$/.test(String(value.browser_context_id || ""))) { fail("browser context binding required"); }
    if (!value.node_id) { fail("node identity required"); }
    if (!value.claim_id || !Number.isInteger(value.fencing_token) || value.fencing_token <= 24) { fail("existing G25-or-later checkout binding required"); }
    if (value.journal_replay_state !== "PASS") { fail("browser journal replay must pass"); }
    if (!/^sha256:[a-f0-9]{64}$/.test(String(value.canonical_checkout_receipt_sha256 || ""))) { fail("canonical checkout receipt hash required"); }
    if (!/^sha256:[a-f0-9]{64}$/.test(String(value.execution_entry_sha256 || ""))) { fail("execution entry hash required"); }
    if (value.request_consumption_claimed !== false || value.authority_effect !== "NONE_COMPONENT_EVIDENCE_ONLY") { fail("source authority boundary drift"); }
    return value;
  }

  function loadPackage() {
    return caches.match(PACKAGE_URL).then(function (response) {
      if (!response) { fail("HIL portable WorkerCoordinator package unavailable"); }
      return response.json();
    });
  }

  function validatePackage(pkg) {
    if (!pkg || pkg.schema !== "stegverse.workercoordinator-portable-checkout-package/v1") { fail("portable package schema mismatch"); }
    if (!pkg.task || pkg.task.task_id !== TASK_ID || pkg.task.state !== "HANDOFF_READY") { fail("portable task mismatch"); }
    if (pkg.execution_surface !== "CURRENT_USER_IPHONE") { fail("portable execution surface mismatch"); }
    if (pkg.credential_authority !== "TV/TVC" || pkg.github_token_runtime_authority !== "NONE") { fail("portable credential boundary drift"); }
    return pkg;
  }

  function validateRetainedState(state, evidence) {
    if (!state || !root.StegVersePortableWorkerCoordinator || state.schema !== root.StegVersePortableWorkerCoordinator.stateSchema) { fail("retained WorkerCoordinator state required"); }
    if (state.checkout_count !== 1 || state.last_task_id !== TASK_ID || !state.last_checkout_receipt) { fail("exact retained HIL checkout required"); }
    var receipt = state.last_checkout_receipt;
    if (receipt.claim_id !== evidence.claim_id || receipt.fencing_token !== evidence.fencing_token) { fail("claim/fence mismatch"); }
    if (receipt.receipt_sha256 !== evidence.canonical_checkout_receipt_sha256) { fail("checkout receipt hash mismatch"); }
    if (state.last_claim_id !== evidence.claim_id || state.checkout_tail_sha256 !== receipt.receipt_sha256 || state.generation !== evidence.fencing_token) { fail("retained state lineage mismatch"); }
    if (receipt.execution_surface !== "CURRENT_USER_IPHONE" || receipt.credential_authority !== "TV/TVC" || receipt.github_token_runtime_authority !== "NONE") { fail("retained checkout boundary drift"); }
    return receipt;
  }

  function openLease(body) {
    if (!body || body.hil_esrl_protocol !== PROTOCOL) { return Promise.reject(new Error("FAIL_CLOSED: exact ESRL protocol required")); }
    var evidence = requireBrowserEvidence(body.browser_evidence);
    if (body.browser_context_id !== evidence.browser_context_id || body.node_id !== evidence.node_id) { return Promise.reject(new Error("FAIL_CLOSED: caller/browser identity mismatch")); }
    if (!root.StegOSEcosystemChatServiceWorkerBridge || typeof root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: portable state bridge unavailable"));
    }
    if (!root.StegVersePortableWorkerCoordinator || typeof root.StegVersePortableWorkerCoordinator.sha256Hex !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: canonical hashing surface unavailable"));
    }

    var checkout;
    return loadPackage().then(validatePackage).then(function (pkg) {
      var store = root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage(pkg);
      return store.read().then(function (state) { checkout = validateRetainedState(state, evidence); return pkg; });
    }).then(function (pkg) {
      var binding = {
        schema: "stegverse.hil-browser-esrl-binding/v1",
        task_id: TASK_ID,
        resident_request_id: REQUEST_ID,
        resident_request_sha256: REQUEST_SHA256,
        node_id: evidence.node_id,
        browser_context_id: evidence.browser_context_id,
        claim_id: evidence.claim_id,
        fencing_token: evidence.fencing_token,
        canonical_checkout_receipt_sha256: evidence.canonical_checkout_receipt_sha256,
        execution_entry_sha256: evidence.execution_entry_sha256,
        portable_authority_epoch: checkout.portable_authority_epoch,
        predecessor_registry_git_blob_sha: checkout.predecessor_registry_git_blob_sha
      };
      return root.StegVersePortableWorkerCoordinator.sha256Hex(binding).then(function (digest) {
        var leaseId = "HIL-BROWSER-ESRL-" + digest.slice(0, 24);
        return {
          schema: "stegverse.hil-browser-esrl-lease-open/v1",
          state: "LEASE_OPEN",
          lease_state: "LEASE_OPEN",
          lease_id: leaseId,
          hil_esrl_protocol: PROTOCOL,
          source_browser_protocol: SOURCE_PROTOCOL,
          task_id: TASK_ID,
          resident_request_id: REQUEST_ID,
          resident_request_sha256: REQUEST_SHA256,
          node_id: evidence.node_id,
          browser_context_id: evidence.browser_context_id,
          claim_id: evidence.claim_id,
          fencing_token: evidence.fencing_token,
          canonical_checkout_receipt_sha256: evidence.canonical_checkout_receipt_sha256,
          source_execution_entry_sha256: evidence.execution_entry_sha256,
          binding_sha256: "sha256:" + digest,
          state_machine: ["REQUESTED", "ADMITTED", "PROVISIONING", "LOCAL_READY", "LEASE_OPEN"],
          runtime_class: "EVENT_EPHEMERAL",
          lease_profile: "INTAKE",
          runtime_materialized: true,
          local_identity_verified: true,
          local_ready_source_observed: true,
          journal_replay_state: evidence.journal_replay_state,
          public_https_rendezvous_observed: false,
          public_observation_is_downstream_optional: true,
          same_device_execution_required: true,
          execution_surface: "CURRENT_USER_IPHONE",
          requires_other_machine: false,
          second_claim_minted: false,
          request_consumption_claimed: false,
          custody_observed: false,
          post_restart_exact_byte_proof_observed: false,
          tvc_lifecycle_receipt_observed: false,
          broader_hil_lifecycle_complete: false,
          credential_authority: "TV/TVC",
          github_token_runtime_authority: "NONE",
          heartbeat_granted_authority: false,
          authority_effect: "NONE_RUNTIME_OBSERVATION_ONLY",
          observed_at: new Date().toISOString()
        };
      });
    });
  }

  function handle(request) {
    return request.json().then(openLease).then(function (value) { return jsonResponse(200, value); }).catch(function (error) {
      return jsonResponse(400, {
        schema: "stegverse.hil-browser-esrl-lease-open/v1",
        state: "FAIL_CLOSED",
        hil_esrl_protocol: PROTOCOL,
        task_id: TASK_ID,
        resident_request_id: REQUEST_ID,
        reason: String(error && error.message ? error.message : error),
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        authority_effect: "NONE"
      });
    });
  }

  root.addEventListener("fetch", function (event) {
    var url = new URL(event.request.url);
    if (url.origin === root.location.origin && url.pathname === ROUTE_PATH && event.request.method === "POST") {
      event.respondWith(handle(event.request));
    }
  });

  root.StegOSHILBrowserESRL = { protocolVersion: PROTOCOL, routePath: ROUTE_PATH, openLease: openLease, handle: handle };
}(self));
