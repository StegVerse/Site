"use strict";

(function (root) {
  var PROTOCOL_VERSION = "HIL_BROWSER_EVIDENCE_V16";
  var ROUTE_PATH = "/stegos-bootstrap/portable-workercoordinator/hil-browser-v16";
  var PACKAGE_URL = new URL("./workercoordinator-portable-hil.json", root.location.href).toString();
  var TASK_ID = "SHWP-HIL-SOVEREIGN-RECEIVER-001";
  var WORKER_ID = "hil-sovereign-receiver-worker";
  var REQUEST_ID = "RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002";
  var REQUEST_SHA256 = "6bf940fb920f672111ba1040fd0bf9bf7016d6bf032bbcfd164a1a2347ee7038";
  var EXPECTED_TRANSITION = "HIL_RECEIVER_LOCAL_READY_PUBLIC_RENDEZVOUS_REQUIRED";

  function fail(reason) { throw new Error("FAIL_CLOSED: " + reason); }

  function validateInput(body) {
    if (!body || body.hil_browser_protocol !== PROTOCOL_VERSION) { fail("exact HIL browser protocol required"); }
    if (body.task_id !== TASK_ID) { fail("exact HIL task_id required"); }
    if (body.resident_request_id !== REQUEST_ID || body.resident_request_sha256 !== REQUEST_SHA256) { fail("exact HIL resident request binding required"); }
    if (!body.node_id) { fail("established StegOS node id required"); }
    if (!/^ctx_[a-f0-9]{32}$/.test(String(body.browser_context_id || ""))) { fail("browser context id required"); }
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

  function validateCheckout(receipt, pkg) {
    if (!receipt || receipt.schema !== "stegverse.workercoordinator-portable-checkout-receipt/v1") { fail("canonical checkout receipt required"); }
    if (receipt.task_id !== TASK_ID || receipt.worker_id !== WORKER_ID) { fail("checkout task/worker mismatch"); }
    if (!receipt.claim_id || !Number.isInteger(receipt.fencing_token) || receipt.fencing_token <= 24) { fail("fresh HIL claim/fence above G24 required"); }
    if (receipt.execution_surface !== "CURRENT_USER_IPHONE") { fail("checkout execution surface mismatch"); }
    if (receipt.credential_authority !== "TV/TVC" || receipt.github_token_runtime_authority !== "NONE" || receipt.heartbeat_granted_authority !== false) { fail("checkout authority drift"); }
    if (receipt.global_workercoordinator_authority !== true || receipt.stegos_device_task_authority !== false) { fail("checkout authority ownership mismatch"); }
    if (receipt.external_non_stegverse_machine_required !== false || receipt.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("checkout machine/parallel issuance drift"); }
    if (receipt.authority_effect !== "CANONICAL_WORKERCOORDINATOR_CLAIM_FENCE") { fail("checkout authority effect mismatch"); }
    if (pkg) {
      if (receipt.portable_authority_epoch !== pkg.portable_authority_epoch) { fail("checkout portable authority epoch mismatch"); }
      if (receipt.predecessor_registry_git_blob_sha !== pkg.predecessor_registry_git_blob_sha) { fail("checkout predecessor registry mismatch"); }
      if (!pkg.source_binding || receipt.task_fragment_git_blob_sha !== pkg.source_binding.task_fragment_git_blob_sha || receipt.handoff_git_blob_sha !== pkg.source_binding.handoff_git_blob_sha || receipt.state_vector_git_blob_sha !== pkg.source_binding.state_vector_git_blob_sha) {
        fail("checkout source lineage mismatch");
      }
    }
    return receipt;
  }

  function verifyCheckoutSelfHash(receipt) {
    var body = {};
    Object.keys(receipt).forEach(function (key) { if (key !== "receipt_sha256") { body[key] = receipt[key]; } });
    return root.StegVersePortableWorkerCoordinator.sha256Hex(body).then(function (digest) {
      if ("sha256:" + digest !== receipt.receipt_sha256) { fail("checkout receipt self-hash mismatch"); }
      return receipt;
    });
  }

  function resolveCheckout(pkg) {
    var store = root.StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage(pkg);
    return store.read().then(function (existing) {
      if (!existing) {
        return root.StegVersePortableWorkerCoordinator.checkout(pkg, store).then(function (checkout) {
          return verifyCheckoutSelfHash(validateCheckout(checkout && checkout.receipt, pkg)).then(function (receipt) {
            return { receipt: receipt, continuation_reused_existing_checkout: false };
          });
        });
      }
      if (existing.schema !== root.StegVersePortableWorkerCoordinator.stateSchema || existing.portable_authority_epoch !== pkg.portable_authority_epoch) { fail("retained portable state lineage mismatch"); }
      if (existing.predecessor_registry_git_blob_sha !== pkg.predecessor_registry_git_blob_sha) { fail("retained predecessor registry mismatch"); }
      if (existing.parallel_workercoordinator_claim_issuance_allowed !== false) { fail("retained parallel issuance state invalid"); }
      var count = Number.isInteger(existing.checkout_count) ? existing.checkout_count : Math.max(0, Number(existing.generation || 0) - pkg.predecessor_generation_floor);
      if (count === 0) {
        return root.StegVersePortableWorkerCoordinator.checkout(pkg, store).then(function (checkout) {
          return verifyCheckoutSelfHash(validateCheckout(checkout && checkout.receipt, pkg)).then(function (receipt) {
            return { receipt: receipt, continuation_reused_existing_checkout: false };
          });
        });
      }
      if (count !== 1) { fail("retained HIL state has invalid checkout count"); }
      if (existing.last_task_id !== TASK_ID || !existing.last_checkout_receipt) { fail("retained checkout is not this HIL task"); }
      var retained = validateCheckout(existing.last_checkout_receipt, pkg);
      if (existing.last_claim_id !== retained.claim_id || existing.checkout_tail_sha256 !== retained.receipt_sha256 || existing.generation !== retained.fencing_token) {
        fail("retained HIL checkout state/receipt binding mismatch");
      }
      return verifyCheckoutSelfHash(retained).then(function (receipt) {
        return { receipt: receipt, continuation_reused_existing_checkout: true };
      });
    });
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
    var continuationReused = false;
    var bindingEntry;
    return loadPackage().then(validatePackage).then(function (pkg) {
      return resolveCheckout(pkg);
    }).then(function (resolved) {
      checkoutReceipt = resolved.receipt;
      continuationReused = resolved.continuation_reused_existing_checkout === true;
      return appendReceipt({
        schema: "stegos.hil_browser_receiver_checkout_binding/v1",
        state: continuationReused ? "RETAINED_CHECKOUT_BOUND_BROWSER_RECEIVER" : "CHECKOUT_BOUND_BROWSER_RECEIVER",
        hil_browser_protocol: PROTOCOL_VERSION,
        resident_request_id: REQUEST_ID,
        resident_request_sha256: REQUEST_SHA256,
        task_id: TASK_ID,
        worker_id: WORKER_ID,
        node_id: body.node_id,
        browser_context_id: body.browser_context_id,
        claim_id: checkoutReceipt.claim_id,
        fencing_token: checkoutReceipt.fencing_token,
        canonical_checkout_receipt_sha256: checkoutReceipt.receipt_sha256,
        continuation_reused_existing_checkout: continuationReused,
        second_claim_minted: false,
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
    }).then(function (entry) {
      bindingEntry = entry;
      return replayJournal();
    }).then(function (report) {
      if (!report || report.state !== "PASS") { fail("post-checkout journal replay failed"); }
      return appendReceipt({
        schema: "stegos.hil_browser_receiver_execution_receipt/v1",
        state: "BROWSER_HIL_LOCAL_READY_OBSERVED",
        hil_browser_protocol: PROTOCOL_VERSION,
        resident_request_id: REQUEST_ID,
        resident_request_sha256: REQUEST_SHA256,
        task_id: TASK_ID,
        worker_id: WORKER_ID,
        node_id: body.node_id,
        browser_context_id: body.browser_context_id,
        claim_id: checkoutReceipt.claim_id,
        fencing_token: checkoutReceipt.fencing_token,
        canonical_checkout_receipt_sha256: checkoutReceipt.receipt_sha256,
        checkout_binding_entry_sha256: bindingEntry.entry_sha256,
        continuation_reused_existing_checkout: continuationReused,
        second_claim_minted: false,
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
          hil_browser_protocol: PROTOCOL_VERSION,
          resident_request_id: REQUEST_ID,
          resident_request_sha256: REQUEST_SHA256,
          task_id: TASK_ID,
          node_id: body.node_id,
          browser_context_id: body.browser_context_id,
          claim_id: checkoutReceipt.claim_id,
          fencing_token: checkoutReceipt.fencing_token,
          canonical_checkout_receipt_sha256: checkoutReceipt.receipt_sha256,
          continuation_reused_existing_checkout: continuationReused,
          second_claim_minted: false,
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
        hil_browser_protocol: PROTOCOL_VERSION,
        resident_request_id: REQUEST_ID,
        resident_request_sha256: REQUEST_SHA256,
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

  root.StegOSHILBrowserReceiver = { protocolVersion: PROTOCOL_VERSION, routePath: ROUTE_PATH, execute: execute, handle: handle };
}(self));
