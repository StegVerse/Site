"use strict";

(function (root) {
  var DB_NAME = "stegos-web-bootstrap-v1";
  var DB_VERSION = 1;
  var RECEIPT_STORE = "receipts";
  var PACKAGE_URL = "./master-records-sv001-custody-package.json";
  var CANONICAL_G23_SHA = "sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35";
  var CANONICAL_G23_TRANSITION = "SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED";
  var INTR_SCHEMA = "stegverse.master-records.sv001-custody-intr-admission/v1";
  var CUSTODY_SCHEMA = "stegverse.master-records.stegverse001-bounded-autonomy-custody/v1";
  var RECONSTRUCTION_SCHEMA = "stegverse.master-records.stegverse001-bounded-autonomy-reconstruction/v1";
  var MAX_HYDRATION_ATTEMPTS = 80;
  var HYDRATION_RETRY_MS = 100;
  var runPromise = null;

  function fail(message) { throw new Error("FAIL_CLOSED: " + message); }
  function byId(id) { return document.getElementById(id); }

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

  function cycleReceiptFromStoredProof(proof) {
    var cycle = proof && proof.subordinate_execution_proof && proof.subordinate_execution_proof.cycle_receipt;
    return cycle ? validateCanonicalCycleReceipt(cycle) : null;
  }

  function receiptRow(bundle, schema) {
    var matches = (bundle.receipts || []).filter(function (row) {
      return row && row.receipt && row.receipt.schema === schema && row.receipt.source_receipt_sha256 === CANONICAL_G23_SHA;
    });
    if (matches.length !== 1) { fail("governed evidence bundle requires exactly one " + schema + " receipt for canonical G23"); }
    return matches[0];
  }

  function validateGovernedEvidenceBundle(bundle, result) {
    if (!bundle || bundle.schema !== "stegos.web_bootstrap_evidence_bundle.v1") { fail("governed evidence bundle schema mismatch"); }
    if (!bundle.journal_replay || bundle.journal_replay.state !== "PASS") { fail("governed evidence bundle journal replay did not PASS"); }
    if (!Array.isArray(bundle.receipts)) { fail("governed evidence bundle receipt rows unavailable"); }
    if (!result || result.state !== "PASS" || result.reconstruction_state !== "PASS" || result.source_receipt_sha256 !== CANONICAL_G23_SHA) {
      fail("Master Records result not bound to canonical G23 PASS");
    }

    var admission = receiptRow(bundle, INTR_SCHEMA);
    var custody = receiptRow(bundle, CUSTODY_SCHEMA);
    var reconstruction = receiptRow(bundle, RECONSTRUCTION_SCHEMA);
    var a = admission.receipt;
    if (a.state !== "INGRESS_ADMITTED" || a.governance_decision !== "ALLOW" ||
        a.transition_id !== "SV001_MASTER_RECORDS_CUSTODY_AND_RECONSTRUCTION" ||
        a.current_governance_decision_observed !== true || a.human_approval_checkpoint_inserted !== false ||
        a.prior_receipt_authorizes_transition !== false || a.site_custody_authority !== false ||
        a.credential_authority !== "TV/TVC" || a.authority_effect !== "NONE_INGRESS_ONLY") {
      fail("retained contemporaneous root-InTr admission is invalid");
    }
    if (admission.entry_sha256 !== result.intr_admission_journal_entry_sha256 || a.receipt_sha256 !== result.intr_admission_receipt_sha256) {
      fail("retained root-InTr admission journal binding mismatch");
    }
    if (custody.entry_sha256 !== result.custody_journal_entry_sha256) { fail("retained custody journal binding mismatch"); }
    if (reconstruction.entry_sha256 !== result.reconstruction_journal_entry_sha256) { fail("retained reconstruction journal binding mismatch"); }
    if (bundle.journal_replay.tail_sha256 !== result.final_replay_tail_sha256) { fail("retained journal tail does not match custody proof"); }
    if (reconstruction.receipt.state !== "PASS") { fail("retained reconstruction receipt did not PASS"); }

    return {
      schema: "stegverse.site.sv001-governed-evidence-retention/v1",
      state: "PASS",
      source_receipt_sha256: CANONICAL_G23_SHA,
      intr_admission_entry: admission,
      custody_entry: custody,
      reconstruction_entry: reconstruction,
      journal_replay: bundle.journal_replay,
      node_id: bundle.node && bundle.node.node_id ? bundle.node.node_id : null,
      credential_authority: "TV/TVC",
      prior_receipt_authorizes_transition: false,
      evidence_retention_grants_authority: false,
      authority_effect: "NONE_EVIDENCE_RETENTION_ONLY"
    };
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

  function publishGovernedPass(cycleReceipt, source, result, governedEvidence) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state) { state.textContent = "PASS — MASTER RECORDS CUSTODY / RECONSTRUCTION / EVIDENCE RETAINED"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v2",
        state: "PASS",
        source: source,
        source_receipt_sha256: cycleReceipt.receipt_hash,
        current_root_intr_governance_consumed: true,
        custody_executed: true,
        reconstruction_state: result.reconstruction_state,
        master_records_result: result,
        governed_evidence_retention: governedEvidence,
        governed_evidence_retained: true,
        prior_receipt_authorizes_transition: false,
        successful_recovery_authorizes_transition: false,
        human_approval_required: false,
        heartbeat_authority_effect: "NONE_CARRIER_ONLY",
        site_custody_authority: false,
        evidence_retention_grants_authority: false,
        authority_effect: "NONE_EVIDENCE_RETENTION_ONLY"
      }, null, 2);
    }
    dispatchPersistenceSignals();
    document.dispatchEvent(new CustomEvent("stegverse:sv001-master-records-custody-complete", { detail: { master_records_result: result, governed_evidence_retention: governedEvidence } }));
    return result;
  }

  function publishRetentionFailClosed(error, cycleReceipt, source, result) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state) { state.textContent = "TRANSITION_OCCURRED_RECEIPT_RETENTION_FAILED"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v2",
        state: "TRANSITION_OCCURRED_RECEIPT_RETENTION_FAILED",
        source: source,
        source_receipt_sha256: cycleReceipt.receipt_hash,
        reason: String(error && error.message ? error.message : error),
        custody_executed: true,
        reconstruction_state: result && result.reconstruction_state ? result.reconstruction_state : null,
        master_records_result: result || null,
        governed_evidence_retained: false,
        terminal_success_visible: false,
        retry_action: "RETAIN_EXISTING_GOVERNED_RECEIPTS_WITHOUT_REEXECUTING_CUSTODY",
        prior_receipt_authorizes_transition: false,
        human_approval_required: false,
        site_custody_authority: false,
        evidence_retention_grants_authority: false,
        authority_effect: "NONE_RETENTION_FAILURE_ONLY"
      }, null, 2);
    }
    dispatchPersistenceSignals();
    document.dispatchEvent(new CustomEvent("stegverse:sv001-master-records-evidence-retention-failed", { detail: { error: String(error && error.message ? error.message : error), master_records_result: result || null } }));
    return result || null;
  }

  function publishGovernanceFailClosed(error, cycleReceipt, source) {
    var state = byId("mr-sv001-state");
    var output = byId("mr-sv001-output");
    if (state && !/^PASS/.test(state.textContent || "")) { state.textContent = "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED"; }
    if (output) {
      output.textContent = JSON.stringify({
        schema: "stegverse.site.sv001-master-records-auto-progression/v2",
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
      if (!root.StegOSWebBootstrap || typeof root.StegOSWebBootstrap.exportEvidence !== "function") {
        return publishRetentionFailClosed(new Error("canonical StegOS evidence export surface unavailable after governed custody"), cycleReceipt, source, result);
      }
      return root.StegOSWebBootstrap.exportEvidence().then(function (bundle) {
        var governedEvidence = validateGovernedEvidenceBundle(bundle, result);
        return publishGovernedPass(cycleReceipt, source, result, governedEvidence);
      }).catch(function (retentionError) {
        return publishRetentionFailClosed(retentionError, cycleReceipt, source, result);
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
    validateGovernedEvidenceBundle: validateGovernedEvidenceBundle,
    authorityEffect: "NONE_CARRIER_ONLY",
    custodyExecutedByRecovery: false,
    custodyExecutedOnlyAfterCurrentGovernance: true,
    evidenceRetentionGrantsAuthority: false,
    heartbeatGrantsExecutionAuthority: false,
    newSchedulerCreated: false
  };

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { recoverNow(); }); }
  else { recoverNow(); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { recoverNow(); } });
  root.addEventListener("pageshow", function () { recoverNow(); });
}(window));
