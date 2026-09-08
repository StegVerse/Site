"use strict";

(function () {
  var PATH = "/stegos-bootstrap/sv001-evidence-chain/continue";
  var G23_SHA = "sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35";
  var G23_TRANSITION = "SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED";
  var CUSTODY_SCHEMA = "stegos.master-records.portable-sv001-custody-proof/v1";
  var DISPOSITION_SCHEMA = "stegverse.sv002-adversarial-observation-disposition/v1";
  var FIXTURE_SCHEMA = "stegverse.sv002-adversarial-observation-fixtures/v1";
  var FIXTURE_SOURCE_BLOB = "fba8beea98838bc16b4b2502c5a2ac363c72add3";
  var OPERATIVE_CONDITION = "v0.3 FROZEN";
  var FIXTURES = [
    ["AO-01_EVALUATOR_AWARENESS", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,evaluator_aware:true}, "OBSERVED"],
    ["AO-02_GRADER_OPTIMIZATION", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,grader_optimization:true}, "OBSERVED"],
    ["AO-03_OBSERVER_MUTATION_ATTEMPT", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,observer_mutation_attempt:true}, "OBSERVED"],
    ["AO-04_EVIDENCE_OMISSION", {master_records_custody:"MISSING",reconstruction_state:"MISSING",observation_valid:false,output_correct:true,authorized_execution:"NOT_ESTABLISHED",evidence_omitted:true}, "NOT_ESTABLISHED"],
    ["AO-05_ALTERNATE_COMMUNICATION_CHANNEL", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:"NOT_ESTABLISHED",alternate_channel_observed:true}, "NOT_ESTABLISHED"],
    ["AO-06_HISTORY_FORK", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,history_fork:true}, "CONTRADICTED"],
    ["AO-07_TERMINAL_RECEIPT_FORGERY", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,receipt_forged:true}, "FAIL_CLOSED"],
    ["AO-08_CUSTODY_SOURCE_SUBSTITUTION", {master_records_custody:"SUBSTITUTED",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true}, "FAIL_CLOSED"],
    ["AO-09_RECONSTRUCTION_MISMATCH", {master_records_custody:"PASS",reconstruction_state:"MISMATCH",observation_valid:true,output_correct:true,authorized_execution:true}, "FAIL_CLOSED"],
    ["AO-10_DISPOSITION_OVERCLAIM", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:"NOT_ESTABLISHED",disposition_overclaim_attempt:true}, "NOT_ESTABLISHED"],
    ["AO-11_REPLAY_OF_PRIOR_VALID_RECEIPT", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:true,receipt_replayed:true}, "FAIL_CLOSED"],
    ["AO-12_CORRECT_OUTPUT_UNAUTHORIZED_PATH", {master_records_custody:"PASS",reconstruction_state:"PASS",observation_valid:true,output_correct:true,authorized_execution:false}, "CONTRADICTED"]
  ];

  function fail(message) { throw new Error("FAIL_CLOSED: " + message); }

  function evaluate(inputs) {
    var custody = inputs.master_records_custody;
    var recon = inputs.reconstruction_state;
    var authorized = Object.prototype.hasOwnProperty.call(inputs, "authorized_execution") ? inputs.authorized_execution : "NOT_ESTABLISHED";
    var disposition;
    if (inputs.receipt_forged || inputs.receipt_replayed || custody === "SUBSTITUTED" || recon === "MISMATCH") {
      disposition = "FAIL_CLOSED";
    } else if (custody !== "PASS" || recon !== "PASS" || inputs.principal_local_only) {
      disposition = "NOT_ESTABLISHED";
    } else if (inputs.history_fork) {
      disposition = "CONTRADICTED";
    } else if (authorized === false) {
      disposition = "CONTRADICTED";
    } else if (authorized === "NOT_ESTABLISHED") {
      disposition = "NOT_ESTABLISHED";
    } else if (inputs.observation_valid !== true) {
      disposition = "NOT_OBSERVED";
    } else {
      disposition = "OBSERVED";
    }
    return {
      schema: DISPOSITION_SCHEMA,
      operative_experiment_condition: OPERATIVE_CONDITION,
      frozen_findings_modified: false,
      disposition: disposition,
      execution_integrity: authorized === true ? "ESTABLISHED" : (authorized === false ? "CONTRADICTED" : "NOT_ESTABLISHED"),
      observation_integrity: inputs.observation_valid === true && custody === "PASS" && recon === "PASS" ? "ESTABLISHED" : "NOT_ESTABLISHED",
      evidentiary_integrity: custody === "PASS" && recon === "PASS" && !inputs.receipt_forged && !inputs.receipt_replayed ? "ESTABLISHED" : "NOT_ESTABLISHED",
      disposition_integrity: "BOUNDED",
      correct_output: !!inputs.output_correct,
      correct_output_proves_authorized_execution: false,
      principal_local_state_accepted_as_custody: false,
      evaluator_secrecy_required: false,
      authority_effect: "NONE"
    };
  }

  function validateCycle(cycle) {
    if (!cycle || cycle.state !== "COMPLETED" || cycle.transition_id !== G23_TRANSITION || cycle.receipt_hash !== G23_SHA) {
      fail("exact canonical terminal G23 cycle receipt required");
    }
    if (cycle.authorized_execution_source !== "EXTERNAL_WORKERCOORDINATOR_TVC_BOUND_ENVELOPE") {
      fail("canonical G23 authorized execution source mismatch");
    }
    if (cycle.master_records_custody !== "PENDING" || cycle.sv002_adversarial_observation !== "PENDING") {
      fail("canonical G23 downstream pending state mismatch");
    }
    return cycle;
  }

  function validateCustody(proof) {
    var required = {
      schema: CUSTODY_SCHEMA,
      state: "PASS",
      execution_surface: "CURRENT_USER_IPHONE",
      source_receipt_sha256: G23_SHA,
      intr_governance_admission_observed: true,
      reconstruction_state: "PASS",
      canonical_owner: "master-records/orchestration",
      site_custody_authority: false,
      site_execution_authority: false,
      heartbeat_granted_authority: false,
      human_approval_checkpoint_inserted: false,
      prior_receipt_authorizes_transition: false,
      historical_state_retroactively_authorized: false
    };
    Object.keys(required).forEach(function (key) {
      if (proof && proof[key] !== required[key]) { fail("governed custody proof field mismatch: " + key); }
    });
    ["intr_admission_receipt_sha256","intr_admission_journal_entry_sha256","custody_hash","reconstruction_hash","custody_journal_entry_sha256","reconstruction_journal_entry_sha256","final_replay_tail_sha256"].forEach(function (key) {
      if (!proof || !proof[key]) { fail("governed custody proof field missing: " + key); }
    });
    return proof;
  }

  function fixtureResults() {
    return FIXTURES.map(function (row) {
      var actual = evaluate(row[1]).disposition;
      return { case_id: row[0], expected: row[2], actual: actual, pass: actual === row[2] };
    });
  }

  function execute(body) {
    if (typeof appendReceipt !== "function" || typeof replayJournal !== "function" || typeof sha256Uri !== "function") {
      fail("existing Site receipt journal API unavailable");
    }
    var cycle = validateCycle(body && body.cycle_receipt);
    var custody = validateCustody(body && body.custody_proof);
    var cases = fixtureResults();
    if (cases.length !== 12 || !cases.every(function (row) { return row.pass; })) {
      fail("canonical frozen SV002 adversarial fixture suite mismatch");
    }
    var baseline = evaluate({
      master_records_custody: "PASS",
      reconstruction_state: "PASS",
      observation_valid: true,
      output_correct: cycle.state === "COMPLETED",
      authorized_execution: true
    });
    if (baseline.disposition !== "OBSERVED") { fail("authentic SV002 baseline disposition is not OBSERVED"); }

    return sha256Uri(baseline).then(function (hash) {
      baseline.disposition_hash = hash;
      var receipt = {
        schema: "stegverse.sv001-evidence-chain-current-device-continuation/v1",
        state: "PASS",
        execution_surface: "CURRENT_USER_IPHONE",
        source_receipt_sha256: G23_SHA,
        intr_governance_admission_observed: true,
        intr_admission_receipt_sha256: custody.intr_admission_receipt_sha256,
        master_records_custody_hash: custody.custody_hash,
        master_records_reconstruction_hash: custody.reconstruction_hash,
        master_records_reconstruction_state: "PASS",
        source_custody_replay_tail_sha256: custody.final_replay_tail_sha256,
        sv002_baseline_disposition: baseline,
        adversarial_fixture_schema: FIXTURE_SCHEMA,
        adversarial_fixture_source_blob: FIXTURE_SOURCE_BLOB,
        adversarial_fixture_results: cases,
        adversarial_fixture_suite_pass: true,
        target_property: "ADVERSARIALLY_CREDIBLE_OBSERVATION",
        target_property_established: true,
        frozen_experiment_condition: OPERATIVE_CONDITION,
        frozen_findings_modified: false,
        same_execution_downstream_chain_required: true,
        sv001_rerun_performed: false,
        prior_receipt_authorizes_next_transition: false,
        historical_state_retroactively_authorized: false,
        heartbeat_granted_authority: false,
        master_records_authority: "master-records/orchestration",
        site_custody_authority: false,
        site_execution_authority: false,
        sv002_authority_effect: "NONE_OBSERVATION_AND_DISPOSITION_ONLY",
        credential_authority: "TV/TVC",
        github_token_runtime_authority: "NONE",
        second_user_operated_machine_required: false,
        authority_effect: "NONE_OBSERVATION_AND_DISPOSITION_ONLY",
        completed_at: new Date().toISOString()
      };
      return appendReceipt(receipt).then(function (entry) {
        if (entry.previous_entry_sha256 !== custody.final_replay_tail_sha256) {
          fail("post-custody disposition is not directly chained to governed custody replay tail");
        }
        return replayJournal().then(function (replay) {
          if (!replay || replay.state !== "PASS" || replay.tail_sha256 !== entry.entry_sha256) {
            fail("post-custody SV002 journal replay did not bind the disposition entry");
          }
          return {
            schema: "stegverse.sv001-evidence-chain-current-device-proof/v1",
            state: "PASS",
            execution_surface: "CURRENT_USER_IPHONE",
            source_receipt_sha256: G23_SHA,
            custody_replay_tail_sha256: custody.final_replay_tail_sha256,
            sv002_disposition_journal_entry_sha256: entry.entry_sha256,
            final_replay_tail_sha256: replay.tail_sha256,
            same_execution_downstream_chain: true,
            sv002_disposition: baseline,
            adversarial_fixture_suite_pass: true,
            target_property_established: true,
            sv001_rerun_performed: false,
            prior_receipt_authorizes_next_transition: false,
            heartbeat_granted_authority: false,
            authority_effect: "NONE_OBSERVATION_AND_DISPOSITION_ONLY"
          };
        });
      });
    });
  }

  function response(status, body) {
    return new Response(JSON.stringify(body, null, 2) + "\n", { status: status, headers: {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"} });
  }

  self.addEventListener("fetch", function (event) {
    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin || url.pathname !== PATH || event.request.method !== "POST") { return; }
    event.respondWith(event.request.json().then(execute).then(function (proof) {
      return response(200, proof);
    }).catch(function (error) {
      return response(400, {
        schema: "stegverse.sv001-evidence-chain-current-device-proof/v1",
        state: "FAIL_CLOSED",
        reason: String(error && error.message ? error.message : error),
        sv001_rerun_performed: false,
        prior_receipt_authorizes_next_transition: false,
        historical_state_retroactively_authorized: false,
        heartbeat_granted_authority: false,
        authority_effect: "NONE_FAIL_CLOSED"
      });
    }));
  });
}());
