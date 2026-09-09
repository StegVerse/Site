"use strict";

(function (root) {
  var ROUTE_PATH = "/stegos-bootstrap/portable-workercoordinator/hil";
  var PACKAGE_URL = new URL("./workercoordinator-portable-hil.json", root.location.href).toString();
  var TASK_ID = "SHWP-HIL-SOVEREIGN-RECEIVER-001";
  var WORKER_ID = "hil-sovereign-receiver-worker";
  var PACKAGE_SOURCE_BLOB = "bf6dfe5a54326dce8110d04bb88ecc3dfcbcc00d";
  var NATIVE_SOURCE_MERGE = "efc9d5e1e8140759a5f971484ae593cf545b9203";
  var EXPECTED_TRANSITION = "HIL_RECEIVER_LOCAL_READY_PUBLIC_RENDEZVOUS_REQUIRED";

  function fail(reason) { throw new Error("FAIL_CLOSED: " + reason); }

  function validateInput(body) {
    if (!body || body.task_id !== TASK_ID) { fail("exact HIL task_id required"); }
    if (!body.node_id) { fail("established StegOS node id required"); }
    if (body.execution_surface !== "CURRENT_USER_IPHONE") { fail("CURRENT_USER_IPHONE execution surface required"); }
    if (body.credential_authority !== "TV/TVC") { fail("TV/TVC credential authority required"); }
    if (body.github_token_runtime_authority !== "NONE") { fail("GitHub runtime authority prohibited"); }
    if (body.heartbeat_granted_authority !== false) { fail("HB cannot grant authority"); }
    if (Object.prototype.hasOwnProperty.call(body, "claim_id") || Object.prototype.hasOwnProperty.call(body, "fencing_token")) {
      fail("caller-supplied HIL claim/fence prohibited; canonical portable checkout must mint them");
    }
    return body;
  }

  function loadPackage() {
    return caches.match(PACKAGE_URL).then(function (response) {
      if (!response) { fail("exact HIL portable WorkerCoordinator package not installed in service-worker cache"); }
      return response.json();
    });
  }

  function validatePackage(pkg) {
    if (!pkg || pkg.schema !== "stegverse.workercoordinator-portable-checkout-package/v1") { fail("HIL package schema mismatch"); }
    if (!pkg.task || pkg.task.task_id !== TASK_ID || pkg.task.state !== "HANDOFF_READY" || pkg.task.claim_id || pkg.task.worker_id) { fail("HIL package task is not clean HANDOFF_READY"); }
    if (!pkg.worker || pkg.worker.worker_id !== WORKER_ID || pkg.worker.status !== "AVAILABLE") { fail("HIL package worker mismatch"); }
    if (pkg.execution_surface !== "CURRENT_USER_IPHONE") { fail("HIL package execution surface mismatch"); }
    if (pkg.canonical_authority_owner !== "StegVerse-Labs/.github WorkerCoordinator") { fail("HIL canonical WorkerCoordinator owner mismatch"); }
    if (pkg.credential_authority !== "TV/TVC" || pkg.github_token_runtime_authority !== "NONE") { fail("HIL package credential boundary drift"); }
    if (pkg.heartbeat_grants_execution_authority !== false || pkg.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("HIL package authority widening"); }
    if (pkg.minimum_fencing_token_exclusive !== 24 || pkg.predecessor_generation_floor !== 24) { fail("HIL portable fence floor mismatch"); }
    if (!pkg.native_consumer || pkg.native_consumer.source_merge !== NATIVE_SOURCE_MERGE || pkg.native_consumer.claim_fence_minted_by_native_component !== false) { fail("HIL native consumer binding mismatch"); }
    return pkg;
  }

  function validateCheckout(checkout) {
    var receipt = checkout && checkout.receipt;
    if (!receipt || receipt.schema !== "stegverse.workercoordinator-portable-checkout-receipt/v1") { fail("canonical HIL checkout receipt required"); }
    if (receipt.task_id !== TASK_ID || receipt.worker_id !== WORKER_ID) { fail("HIL checkout task/worker mismatch"); }
    if (!receipt.claim_id || !Number.isInteger(receipt.fencing_token) || receipt.fencing_token <= 24) { fail("fresh HIL claim/fence above G24 required"); }
    if (!/^sha256:[a-f0-9]{64}$/.test(receipt.receipt_sha256 || "")) { fail("canonical HIL checkout receipt hash required"); }
    if (receipt.canonical_authority_owner !== "StegVerse-Labs/.github WorkerCoordinator" || receipt.authority_domain !== "INDEPENDENT_TASK_CONTROL") { fail("HIL checkout canonical authority mismatch"); }
    if (receipt.execution_surface !== "CURRENT_USER_IPHONE" || receipt.global_workercoordinator_authority !== true || receipt.stegos_device_task_authority !== false) { fail("HIL checkout execution/authority surface mismatch"); }
    if (receipt.credential_authority !== "TV/TVC" || receipt.github_token_runtime_authority !== "NONE" || receipt.heartbeat_granted_authority !== false) { fail("HIL checkout credential/HB authority drift"); }
    if (receipt.external_non_stegverse_machine_required !== false || receipt.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("HIL checkout second-machine/parallel issuance drift"); }
    if (receipt.authority_effect !== "CANONICAL_WORKERCOORDINATOR_CLAIM_FENCE") { fail("HIL checkout authority effect mismatch"); }
    return receipt;
  }

  function execute(body) {
    validateInput(body);
    if (!root.StegVersePortableWorkerCoordinator || typeof root.StegVersePortableWorkerCoordinator.checkout !== "function") { return Promise.reject(new Error("FAIL_CLOSED: canonical portable WorkerCoordinator module unavailable")); }
    if (!root.StegOSEcosystemChatServiceWorkerBridge || typeof root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage !== "function") { return Promise.reject(new Error("FAIL_CLOSED: canonical portable WorkerCoordinator state-store bridge unavailable")); }

    var checkoutResult;
    var checkoutEntry;
    return loadPackage().then(validatePackage).then(function (pkg) {
      return root.StegVersePortableWorkerCoordinator.checkout(pkg, root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage(pkg));
    }).then(function (checkout) {
      checkoutResult = checkout;
      return root.StegVersePortableWorkerCoordinator.sha256Hex(checkout.receipt).then(function (digest) {
        if ("sha256:" + digest !== checkout.receipt.receipt_sha256) { fail("HIL checkout receipt self-hash mismatch"); }
        validateCheckout(checkout);
        return appendReceipt({
          schema: "stegos.hil_portable_workercoordinator_checkout_binding/v1",
          task_id: TASK_ID,
          node_id: body.node_id,
          canonical_checkout_receipt: checkout.receipt,
          package_source_git_blob_sha1: PACKAGE_SOURCE_BLOB,
          native_source_merge: NATIVE_SOURCE_MERGE,
          global_workercoordinator_authority_owned_by_browser: false,
          native_component_minted_claim_fence: false,
          credential_authority: "TV/TVC",
          github_token_runtime_authority: "NONE",
          heartbeat_granted_authority: false,
          request_consumption_claimed: false,
          authority_effect: "NONE_BINDING_ONLY",
          bound_at: new Date().toISOString()
        });
      });
    }).then(function (entry) {
      checkoutEntry = entry;
      return replayJournal();
    }).then(function (report) {
      if (!report || report.state !== "PASS") { fail("post-HIL-checkout device journal replay did not pass"); }
      var receipt = validateCheckout(checkoutResult);
      var envelope = {
        schema: "stegverse.hil.native-activation-envelope/v1",
        state: "CHECKOUT_BOUND_NATIVE_ACTIVATION_READY",
        task_id: TASK_ID,
        worker_id: WORKER_ID,
        node_id: body.node_id,
        execution_surface: "CURRENT_USER_IPHONE",
        portable_authority_epoch: receipt.portable_authority_epoch,
        canonical_workercoordinator_checkout_receipt: receipt,
        canonical_workercoordinator_checkout_journal_entry_sha256: checkoutEntry.entry_sha256,
        package_source_git_blob_sha1: PACKAGE_SOURCE_BLOB,
        native_source_merge: NATIVE_SOURCE_MERGE,
        expected_native_transition: EXPECTED_TRANSITION,
        journal_replay_state: report.state,
        journal_replay_tail_sha256: report.tail_sha256,
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        heartbeat_granted_authority: false,
        global_workercoordinator_authority_owned_by_native_app: false,
        native_component_minted_claim_fence: false,
        external_non_stegverse_machine_required: false,
        request_consumption_claimed: false,
        native_receiver_execution_observed: false,
        authority_effect: "NONE_BINDING_ONLY"
      };
      return root.StegVersePortableWorkerCoordinator.sha256Hex(envelope).then(function (digest) {
        envelope.envelope_sha256 = "sha256:" + digest;
        return envelope;
      });
    });
  }

  function handle(request) {
    return request.json().then(execute).then(function (result) { return jsonResponse(200, result); }).catch(function (error) {
      return jsonResponse(400, {
        state: "FAIL_CLOSED",
        reason: String(error && error.message ? error.message : error),
        task_id: TASK_ID,
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        heartbeat_granted_authority: false,
        authority_effect: "NONE"
      });
    });
  }

  root.addEventListener("install", function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.add(PACKAGE_URL); }));
  });

  root.addEventListener("fetch", function (event) {
    var url = new URL(event.request.url);
    if (url.origin === root.location.origin && url.pathname === ROUTE_PATH && event.request.method === "POST") { event.respondWith(handle(event.request)); }
  });

  root.StegOSHILPortableNativeBridge = { routePath: ROUTE_PATH, packageUrl: PACKAGE_URL, execute: execute, handle: handle };
}(self));
