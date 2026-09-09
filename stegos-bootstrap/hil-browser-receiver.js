"use strict";

(function (root) {
  var ROUTE_PATH = "/stegos-bootstrap/portable-workercoordinator/hil-browser";
  var PACKAGE_URL = new URL("./workercoordinator-portable-hil.json", root.location.href).toString();
  var TASK_ID = "SHWP-HIL-SOVEREIGN-RECEIVER-001";
  var WORKER_ID = "hil-sovereign-receiver-worker";
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
      fail("caller-supplied claim/fence prohibited");
    }
  }

  function loadPackage() {
    return caches.match(PACKAGE_URL).then(function (response) {
      if (!response) { fail("HIL portable WorkerCoordinator package not installed in service-worker cache"); }
      return response.json();
    });
  }

  function validatePackage(pkg) {
    if (!pkg || pkg.schema !== "stegverse.workercoordinator-portable-checkout-package/v1") { fail("HIL package schema mismatch"); }
    if (!pkg.task || pkg.task.task_id !== TASK_ID || pkg.task.state !== "HANDOFF_READY") { fail("HIL task package mismatch"); }
    if (!pkg.worker || pkg.worker.worker_id !== WORKER_ID || pkg.worker.status !== "AVAILABLE") { fail("HIL worker mismatch"); }
    if (pkg.execution_surface !== "CURRENT_USER_IPHONE") { fail("HIL execution surface mismatch"); }
    if (pkg.credential_authority !== "TV/TVC" || pkg.github_token_runtime_authority !== "NONE") { fail("HIL credential boundary drift"); }
    if (pkg.heartbeat_grants_execution_authority !== false || pkg.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("HIL authority widening"); }
    if (pkg.minimum_fencing_token_exclusive !== 24) { fail("HIL fence floor mismatch"); }
    return pkg;
  }

  function validateCheckout(receipt) {
    if (!receipt || receipt.schema !== "stegverse.workercoordinator-portable-checkout-receipt/v1") { fail("canonical checkout receipt required"); }
    if (receipt.task_id !== TASK_ID || receipt.worker_id !== WORKER_ID) { fail("checkout task/worker mismatch"); }
    if (!receipt.claim_id || !Number.isInteger(receipt.fencing_token) || receipt.fencing_token <= 24) { fail("fresh HIL claim/fence above G24 required"); }
    if (receipt.execution_surface !== "CURRENT_USER_IPHONE") { fail("checkout execution surface mismatch"); }
    if (receipt.credential_authority !== "TV/TVC" || receipt.github_token_runtime_authority !== "NONE" || receipt.heartbeat_granted_authority !== false) { fail("checkout authority drift"); }
    if (receipt.global_workercoordinator_authority !== true || receipt.stegos_device_task_authority !== false) { fail("checkout authority ownership mismatch"); }
    if (receipt.external_non_stegverse_machine_required !== false || receipt.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("checkout machine/parallel issuance drift"); }
    if (receipt.authority_effect !== "CANONICAL_WORKERCOORDINATOR_CLAIM_FENCE") { fail("checkout authority effect mismatch"); }
    return receipt;
  }

  function execute(body) {
    validateInput(body);
    if (!root.StegVersePortableWorkerCoordinator || typeof root.StegVersePortableWorkerCoordinator.checkout !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: canonical portable WorkerCoordinator unavailable"));
    }
    if (!root.StegOSEcosystemChatServiceWorkerBridge || typeof root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: canonical portable WorkerCoordinator state store unavailable"));
    }

    var checkoutReceipt;
    var bindingEntry;
    return loadPackage().then(validatePackage).then(function (pkg) {
      return root.StegVersePortableWorkerCoordinator.checkout(pkg, root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage(pkg));
    }).then(function (checkout) {
      checkoutReceipt = validateCheckout(checkout && checkout.receipt);
      return root.StegVersePortableWorkerCoordinator.sha256Hex(checkoutReceipt).then(function (digest) {
        if ("sha256:" + digest !== checkoutReceipt.receipt_sha256) { fail("checkout receipt self-hash mismatch"); }
        return appendReceipt({
          schema: "stegos.hil_browser_receiver_checkout_binding/v1",
          state: "CHECKOUT_BOUND_BROWSER_RECEIVER",
          task_id: TASK_ID,
          worker_id: WORKER_ID,
          node_id: body.node_id,
          claim_id: checkoutReceipt.claim_id,
          fencing_token: checkoutReceipt.fencing_token,
          canonical_checkout_receipt_sha256: checkoutReceipt.receipt_sha256,
          execution_surface: "CURRENT_USER_IPHONE",
          credential_authority: "TV/TVC",
          github_token_runtime_authority: "NONE",
          heartbeat_granted_authority: false,
          global_workercoordinator_authority_owned_by_browser_receiver: false,
          browser_receiver_minted_claim_fence: false,
          installed_native_app_required: false,
          external_non_stegverse_machine_required: false,
          request_consumption_claimed: false,
          authority_effect: "NONE_BINDING_ONLY",
          created_at: new Date().toISOString()
        });
      });
    }).then(function (entry) {
      bindingEntry = entry;
      return replayJournal();
    }).then(function (report) {
      if (!report || report.state !== "PASS") { fail("post-checkout journal replay failed"); }
      return appendReceipt({
        schema: "stegos.hil_browser_receiver_execution_receipt/v1",
        state: "BROWSER_HIL_LOCAL_READY_OBSERVED",
        task_id: TASK_ID,
        worker_id: WORKER_ID,
        node_id: body.node_id,
        claim_id: checkoutReceipt.claim_id,
        fencing_token: checkoutReceipt.fencing_token,
        canonical_checkout_receipt_sha256: checkoutReceipt.receipt_sha256,
        checkout_binding_entry_sha256: bindingEntry.entry_sha256,
        transition: EXPECTED_TRANSITION,
        transport: "SERVICE_WORKER_LOCAL_INTERCEPT",
        execution_surface: "CURRENT_USER_IPHONE",
        same_device: true,
        browser_receiver_execution_observed: true,
        native_receiver_execution_observed: false,
        installed_native_app_required: false,
        external_non_stegverse_machine_required: false,
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        heartbeat_granted_authority: false,
        interlock_transition_authority: false,
        request_consumption_claimed: false,
        authority_effect: "NONE_COMPONENT_EVIDENCE_ONLY",
        observed_at: new Date().toISOString()
      });
    }).then(function (executionEntry) {
      return replayJournal().then(function (report) {
        if (!report || report.state !== "PASS") { fail("post-execution journal replay failed"); }
        return {
          schema: "stegos.hil_browser_receiver_activation_result/v1",
          state: "BROWSER_HIL_LOCAL_READY_OBSERVED",
          task_id: TASK_ID,
          node_id: body.node_id,
          claim_id: checkoutReceipt.claim_id,
          fencing_token: checkoutReceipt.fencing_token,
          transition: EXPECTED_TRANSITION,
          execution_entry_sha256: executionEntry.entry_sha256,
          journal_replay_state: report.state,
          journal_replay_tail_sha256: report.tail_sha256,
          browser_receiver_execution_observed: true,
          installed_native_app_required: false,
          request_consumption_claimed: false,
          authority_effect: "NONE_COMPONENT_EVIDENCE_ONLY"
        };
      });
    });
  }

  function handle(request) {
    return request.json().then(execute).then(function (result) {
      return jsonResponse(200, result);
    }).catch(function (error) {
      return jsonResponse(400, {
        state: "FAIL_CLOSED",
        reason: String(error && error.message ? error.message : error),
        task_id: TASK_ID,
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        heartbeat_granted_authority: false,
        request_consumption_claimed: false,
        authority_effect: "NONE"
      });
    });
  }

  root.addEventListener("install", function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.add(PACKAGE_URL); }));
  });

  root.addEventListener("fetch", function (event) {
    var url = new URL(event.request.url);
    if (url.origin === root.location.origin && url.pathname === ROUTE_PATH && event.request.method === "POST") {
      event.respondWith(handle(event.request));
    }
  });

  root.StegOSHILBrowserReceiver = { routePath: ROUTE_PATH, execute: execute, handle: handle };
}(self));
