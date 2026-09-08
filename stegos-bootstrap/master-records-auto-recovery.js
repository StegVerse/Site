"use strict";

(function (root) {
  var DB_NAME = "stegos-web-bootstrap-v1";
  var DB_VERSION = 1;
  var RECEIPT_STORE = "receipts";
  var PACKAGE_URL = "./master-records-sv001-custody-package.json";
  var CANONICAL_G23_SHA = "sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35";
  var CANONICAL_G23_TRANSITION = "SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED";
  var SITE_CUSTODY_PROOF_SCHEMA = "stegos.master-records.portable-sv001-custody-proof/v1";
  var EVIDENCE_SCHEMA = "stegverse.resident-rendezvous.site-custody-evidence/v1";
  var EVIDENCE_STORE_SCHEMA = "stegverse.resident-rendezvous.site-custody-evidence-store/v1";
  var MAX_HYDRATION_ATTEMPTS = 80;
  var HYDRATION_RETRY_MS = 100;
  var runPromise = null;

  function fail(message) { throw new Error("FAIL_CLOSED: " + message); }
  function byId(id) { return document.getElementById(id); }

  function canonical(value) {
    if (value === null || typeof value !== "object") { return JSON.stringify(value); }
    if (Array.isArray(value)) { return "[" + value.map(canonical).join(",") + "]"; }
    return "{" + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ":" + canonical(value[key]);
    }).join(",") + "}";
  }

  function sha256Uri(value) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(value))).then(function (digest) {
      return "sha256:" + Array.from(new Uint8Array(digest), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("automatic Master Records recovery IndexedDB open failed")); };
      request.onblocked = function () { reject(new Error("automatic Master Records recovery IndexedDB open blocked")); };
    });
  }

  function getReceipts(db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(RECEIPT_STORE, "readonly");
      var request = tx.objectStore(RECEIPT_STORE).getAll();
      request.onsuccess = function () {
        var rows = request.result || [];
        rows.sort(function (a, b) { return a.sequence - b.sequence; });
        resolve(rows);
      };
      request.onerror = function () { reject(request.error || new Error("automatic Master Records recovery journal read failed")); };
    });
  }

  function readJournal() {
    return openDb().then(function (db) {
      return getReceipts(db).then(function (rows) { db.close(); return rows; }).catch(function (error) { db.close(); throw error; });
    });
  }

  function loadPackage() {
    return fetch(PACKAGE_URL, { cache: "no-store", credentials: "same-origin" }).then(function (response) {
      if (!response.ok) { fail("canonical Master Records recovery package unavailable"); }
      return response.json();
    }).then(function (pkg) {
      var recovery = pkg && pkg.canonical_journal_recovery;
      if (!pkg || pkg.schema !== "stegverse.master-records.portable-sv001-custody-package/v1" || pkg.canonical_owner !== "master-records/orchestration") {
        fail("canonical Master Records package identity mismatch");
      }
      if (pkg.execution_surface !== "CURRENT_USER_IPHONE" || pkg.execution_authority !== false || pkg.lease_issuance_authority !== false || pkg.credential_authority !== false) {
        fail("Master Records package authority boundary mismatch");
      }
      if (!recovery || recovery.target_source_receipt_sha256 !== CANONICAL_G23_SHA ||
          recovery.target_claim_id !== "SHWP-SHWP-STEGVERSE001-BOUNDED-AUTONOMY-RUNTIME-001-G23" || recovery.target_fencing_token !== 23 ||
          recovery.execution_surface !== "CURRENT_USER_IPHONE" || recovery.exact_unique_hash_match_required !== true || recovery.journal_integrity_required !== true ||
          recovery.same_execution_reconstruction_required !== true || recovery.tvc_single_cycle_consumption_required !== true ||
          recovery.source_or_ci_is_authentic_recovery !== false || recovery.authority_effect !== "NONE_RECOVERY_ONLY") {
        fail("canonical Master Records recovery policy mismatch");
      }
      return pkg;
    });
  }

  function dispatchPersistenceSignals() {
    ["mr-sv001-receipt", "mr-sv001-output"].forEach(function (id) {
      var node = byId(id);
      if (node) { node.dispatchEvent(new Event("input", { bubbles: true })); }
    });
  }

  function validateCanonicalCycleReceipt(cycleReceipt) {
    if (!cycleReceipt || typeof cycleReceipt !== "object") { fail("exact canonical G23 source receipt required"); }
    if (cycleReceipt.transition_id !== CANONICAL_G23_TRANSITION) { fail("canonical G23 transition identity mismatch"); }
    if (cycleReceipt.receipt_hash !== CANONICAL_G23_SHA) { fail("canonical G23 source hash mismatch"); }
    return cycleReceipt;
  }

  function validateCustodyProof(proof) {
    if (!proof || proof.schema !== SITE_CUSTODY_PROOF_SCHEMA || proof.state !== "PASS" ||
        proof.execution_surface !== "CURRENT_USER_IPHONE" || proof.source_receipt_sha256 !== CANONICAL_G23_SHA ||
        proof.intr_governance_admission_observed !== true || proof.reconstruction_state !== "PASS" ||
        proof.canonical_owner !== "master-records/orchestration" || proof.site_custody_authority !== false ||
        proof.site_execution_authority !== false || proof.heartbeat_granted_authority !== false ||
        proof.prior_receipt_authorizes_transition !== false || proof.historical_state_retroactively_authorized !== false) {
      fail("governed Site custody proof invalid for rendezvous transport");
    }
    return proof;
  }

  function discoverResident() {
    return fetch("/api/resident-rendezvous/v1/discovery", {
      method: "GET", credentials: "omit", cache: "no-store", redirect: "error",
      headers: { "Accept": "application/json" }
    }).then(function (response) {
      if (!response.ok) { throw new Error("resident rendezvous discovery unavailable"); }
      return response.json();
    }).then(function (value) {
      if (!value || value.schema !== "stegverse.resident-rendezvous.discovery/v1" || value.state !== "AVAILABLE" ||
          value.gateway_execution_authority !== "NONE" || value.discovery_grants_authority !== false ||
          value.authority_effect !== "NONE_DISCOVERY_ONLY" || !/^SV-NODE-[0-9a-f]{24}$/.test(String(value.target_node_ref || ""))) {
        throw new Error("resident rendezvous discovery response invalid");
      }
      return value.target_node_ref;
    });
  }

  function submitGovernedCustodyProof(proof) {
    validateCustodyProof(proof);
    return Promise.all([discoverResident(), sha256Uri(proof)]).then(function (parts) {
      var envelope = {
        schema: EVIDENCE_SCHEMA,
        target_node_ref: parts[0],
        proof: proof,
        proof_sha256: parts[1],
        submitted_at: new Date().toISOString(),
        gateway_execution_authority: "NONE",
        evidence_grants_authority: false,
        authority_effect: "NONE_EVIDENCE_ONLY"
      };
      return fetch("/api/resident-rendezvous/v1/evidence/site-governed-custody", {
        method: "POST", credentials: "omit", cache: "no-store", redirect: "error",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(envelope)
      });
    }).then(function (response) {
      if (!response.ok) { throw new Error("resident custody evidence rendezvous rejected"); }
      return response.json();
    }).then(function (value) {
      if (!value || value.schema !== EVIDENCE_STORE_SCHEMA || value.state !== "RETAINED" ||
          value.gateway_execution_authority !== "NONE" || value.evidence_grants_authority !== false ||
          value.authority_effect !== "NONE_EVIDENCE_ONLY") {
        throw new Error("resident custody evidence store response invalid");
      }
      return value;
    });
  }

  function cycleReceiptFromStoredProof(proof) {
    var cycle = proof && proof.subordinate_execution_proof && proof.subordinate_execution_proof.cycle_receipt;
    return cycle ? validateCanonicalCycleReceipt(cycle) : null;
  }

  function publishSourceReady(cycleReceipt, source, recovery) {
    var input = byId("mr-sv001-receipt");
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    var sv001State = byId("sv001-state");
    var sv001Button = byId("run-sv001");
    if (sv001State) { sv001State.textContent = "COMPLETED — TERMINAL"; }
    if (sv001Button) { sv001Button.disabled = true; sv001Button.textContent = "SV001 Cycle Completed"; }
    if (input) { input.value = JSON.stringify(cycleReceipt, null, 2); }
    if (state && !/^PASS/.test(state.textContent || "")) { state.textContent = "EXACT_G23_READY_REQUESTING_CURRENT_MACHINE_GOVERNANCE"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v1",
        state: "EXACT_G23_READY_REQUESTING_CURRENT_MACHINE_GOVERNANCE",
        source: source,
        source_receipt_sha256: cycleReceipt.receipt_hash,
        recovery_state: recovery ? recovery.state : "EXACT_RETAINED_PROOF_REUSED",
        unique_match_count: recovery ? recovery.unique_match_count : null,
        journal_integrity_verified: recovery ? recovery.journal_integrity_verified : null,
        same_execution_reconstruction_verified: recovery ? recovery.same_execution_reconstruction_verified : null,
        tvc_single_cycle_consumption_verified: recovery ? recovery.tvc_single_cycle_consumption_verified : null,
        custody_executed: false,
        current_root_intr_governance_required: true,
        prior_receipt_authorizes_transition: false,
        successful_recovery_authorizes_transition: false,
        human_approval_required: false,
        human_interaction_queue_blocks_transition: false,
        heartbeat_authority_effect: "NONE_CARRIER_ONLY",
        authority_effect: "NONE_SOURCE_READY_ONLY"
      }, null, 2);
    }
    dispatchPersistenceSignals();
    document.dispatchEvent(new CustomEvent("stegverse:sv001-master-records-recovery-ready", { detail: { source: source, cycle_receipt: cycleReceipt, recovery: recovery || null } }));
    return cycleReceipt;
  }

  function publishGovernedPass(cycleReceipt, source, result, transport) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state) { state.textContent = "PASS — MASTER RECORDS CUSTODY / RECONSTRUCTION"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v1",
        state: "PASS",
        source: source,
        source_receipt_sha256: cycleReceipt.receipt_hash,
        current_root_intr_governance_consumed: true,
        custody_executed: true,
        reconstruction_state: result.reconstruction_state,
        master_records_result: result,
        resident_evidence_transport_state: transport && transport.state ? transport.state : "PENDING_RETRY",
        resident_evidence_transport_authority_effect: "NONE_EVIDENCE_ONLY",
        prior_receipt_authorizes_transition: false,
        successful_recovery_authorizes_transition: false,
        human_approval_required: false,
        heartbeat_authority_effect: "NONE_CARRIER_ONLY",
        site_custody_authority: false,
        authority_effect: "NONE_CARRIER_ONLY"
      }, null, 2);
    }
    dispatchPersistenceSignals();
    document.dispatchEvent(new CustomEvent("stegverse:sv001-master-records-custody-complete", { detail: result }));
    if (transport && transport.state === "RETAINED") {
      document.dispatchEvent(new CustomEvent("stegverse:sv001-master-records-custody-proof-relayed", { detail: transport }));
    }
    return result;
  }

  function publishGovernanceFailClosed(error, cycleReceipt, source) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state && !/^PASS/.test(state.textContent || "")) { state.textContent = "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v1",
        state: "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED",
        source: source,
        source_receipt_sha256: cycleReceipt && cycleReceipt.receipt_hash ? cycleReceipt.receipt_hash : null,
        reason: String(error && error.message ? error.message : error),
        custody_executed: false,
        current_root_intr_governance_required: true,
        prior_receipt_authorizes_transition: false,
        successful_recovery_authorizes_transition: false,
        historical_state_retroactively_authorized: false,
        sv001_rerun_allowed: false,
        human_approval_required: false,
        retry_surface: "EXISTING_PAGE_RESUME_LIFECYCLE_ONLY",
        new_scheduler_created: false,
        authority_effect: "NONE_FAIL_CLOSED"
      }, null, 2);
    }
    dispatchPersistenceSignals();
    return null;
  }

  function continueToGovernedCustody(cycleReceipt, source) {
    validateCanonicalCycleReceipt(cycleReceipt);
    if (!root.StegOSWebBootstrap || typeof root.StegOSWebBootstrap.executeMasterRecordsSv001Custody !== "function") {
      return Promise.resolve(publishGovernanceFailClosed(new Error("existing StegOS governed Master Records custody executor unavailable"), cycleReceipt, source));
    }
    return root.StegOSWebBootstrap.executeMasterRecordsSv001Custody(cycleReceipt).then(function (result) {
      if (!result || result.state !== "PASS" || result.reconstruction_state !== "PASS") {
        fail("Master Records custody/reconstruction did not return PASS");
      }
      return submitGovernedCustodyProof(result).then(function (transport) {
        return publishGovernedPass(cycleReceipt, source, result, transport);
      }).catch(function () {
        return publishGovernedPass(cycleReceipt, source, result, { state: "PENDING_RETRY" });
      });
    }).catch(function (error) {
      return publishGovernanceFailClosed(error, cycleReceipt, source);
    });
  }

  function publishRecoveryFailClosed(error) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state && !/^PASS/.test(state.textContent || "")) { state.textContent = "AWAITING_EXACT_COMPLETED_PROOF"; }
    if (output && !(output.textContent || "").trim()) {
      output.textContent = "Automatic canonical G23 recovery did not complete: " + String(error && error.message ? error.message : error) +
        "\nManual exact-proof import remains a fail-closed fallback. SV001 must not be rerun.";
    }
    dispatchPersistenceSignals();
    return null;
  }

  function findExactRetainedProof() {
    if (!root.StegOSPersistentCardUX || typeof root.StegOSPersistentCardUX.findStoredSv001Proof !== "function") { return Promise.resolve(null); }
    return root.StegOSPersistentCardUX.findStoredSv001Proof().then(function (proof) {
      return proof && cycleReceiptFromStoredProof(proof) ? proof : null;
    }).catch(function () { return null; });
  }

  function hydrationReady(attempt) {
    var state = byId("sv001-state");
    if (state && /^COMPLETED/.test(state.textContent || "")) { return Promise.resolve(true); }
    if (attempt >= MAX_HYDRATION_ATTEMPTS) { return Promise.resolve(false); }
    return new Promise(function (resolve) { root.setTimeout(resolve, HYDRATION_RETRY_MS); }).then(function () { return hydrationReady(attempt + 1); });
  }

  function recoverNow() {
    if (runPromise) { return runPromise; }
    runPromise = hydrationReady(0).then(function (terminal) {
      if (!terminal) { return null; }
      return findExactRetainedProof().then(function (proof) {
        if (proof) {
          var retainedCycle = cycleReceiptFromStoredProof(proof);
          publishSourceReady(retainedCycle, "EXACT_RETAINED_SAME_DEVICE_PROOF", null);
          return continueToGovernedCustody(retainedCycle, "EXACT_RETAINED_SAME_DEVICE_PROOF");
        }
        if (!root.StegVerseMasterRecordsSv001CanonicalJournalRecovery || typeof root.StegVerseMasterRecordsSv001CanonicalJournalRecovery.recover !== "function") {
          fail("exact canonical Master Records recovery module unavailable");
        }
        return Promise.all([readJournal(), loadPackage()]).then(function (parts) {
          return root.StegVerseMasterRecordsSv001CanonicalJournalRecovery.recover(parts[0], parts[1].canonical_journal_recovery.target_source_receipt_sha256);
        }).then(function (recovery) {
          if (!recovery || recovery.state !== "RECOVERED_HASH_VERIFIED" || recovery.unique_match_count !== 1 || recovery.authority_effect !== "NONE_RECOVERY_ONLY") {
            fail("canonical retained-journal recovery did not produce one verified source object");
          }
          var recoveredCycle = validateCanonicalCycleReceipt(recovery.source_receipt);
          publishSourceReady(recoveredCycle, "CANONICAL_RETAINED_JOURNAL_RECOVERY", recovery);
          return continueToGovernedCustody(recoveredCycle, "CANONICAL_RETAINED_JOURNAL_RECOVERY");
        });
      });
    }).catch(publishRecoveryFailClosed).finally(function () { runPromise = null; });
    return runPromise;
  }

  root.StegOSMasterRecordsAutoRecovery = {
    run: recoverNow,
    authorityEffect: "NONE_CARRIER_ONLY",
    custodyExecutedByRecovery: false,
    custodyExecutedOnlyAfterCurrentGovernance: true,
    heartbeatGrantsExecutionAuthority: false,
    newSchedulerCreated: false
  };

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { recoverNow(); }); }
  else { recoverNow(); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { recoverNow(); } });
  root.addEventListener("pageshow", function () { recoverNow(); });
}(window));
