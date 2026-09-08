"use strict";

(function (root) {
  var PATH = "./sv001-evidence-chain/continue";
  var inflight = null;

  function cycleReceipt() {
    var node = document.getElementById("mr-sv001-receipt");
    if (!node || !String(node.value || "").trim()) { throw new Error("exact canonical G23 receipt is not present in current-device UI state"); }
    var value = JSON.parse(node.value);
    if (!value || value.transition_id !== "SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED" ||
        value.receipt_hash !== "sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35") {
      throw new Error("current-device G23 source does not match canonical terminal receipt");
    }
    return value;
  }

  function publish(result) {
    var state = document.getElementById("mr-sv001-state");
    var output = document.getElementById("mr-sv001-output");
    if (result && result.state === "PASS") {
      if (state) { state.textContent = "PASS — MASTER RECORDS CUSTODY / SV002 DISPOSITION"; }
    } else if (state && /^PASS/.test(state.textContent || "")) {
      state.textContent = "PASS — MASTER RECORDS CUSTODY / SV002 CONTINUATION FAIL_CLOSED";
    }
    if (output) {
      var prior = String(output.textContent || "").trim();
      var rendered = JSON.stringify({
        schema: "stegverse.site.sv001-post-custody-continuation-display/v1",
        custody_state_preserved: true,
        sv002_continuation: result,
        prior_custody_output: prior ? JSON.parse(prior) : null,
        human_approval_required: false,
        second_user_operated_machine_required: false,
        heartbeat_granted_authority: false,
        authority_effect: "NONE_OBSERVATION_AND_DISPOSITION_ONLY"
      }, null, 2);
      output.textContent = rendered;
      output.dispatchEvent(new Event("input", { bubbles: true }));
    }
    document.dispatchEvent(new CustomEvent("stegverse:sv001-evidence-chain-continuation-complete", { detail: result }));
    return result;
  }

  function execute(custodyProof) {
    if (inflight) { return inflight; }
    inflight = Promise.resolve().then(function () {
      if (!custodyProof || custodyProof.state !== "PASS" || custodyProof.reconstruction_state !== "PASS") {
        throw new Error("authentic governed Master Records custody/reconstruction PASS required");
      }
      var endpoint = new URL(PATH, window.location.href).toString();
      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ cycle_receipt: cycleReceipt(), custody_proof: custodyProof })
      });
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok || !body || body.state !== "PASS") {
          throw new Error(body && body.reason ? body.reason : "current-device SV002 continuation failed closed");
        }
        return publish(body);
      });
    }).catch(function (error) {
      return publish({
        schema: "stegverse.sv001-evidence-chain-current-device-proof/v1",
        state: "FAIL_CLOSED",
        reason: String(error && error.message ? error.message : error),
        custody_state_preserved: true,
        sv001_rerun_performed: false,
        prior_receipt_authorizes_next_transition: false,
        historical_state_retroactively_authorized: false,
        heartbeat_granted_authority: false,
        authority_effect: "NONE_FAIL_CLOSED"
      });
    }).finally(function () { inflight = null; });
    return inflight;
  }

  document.addEventListener("stegverse:sv001-master-records-custody-complete", function (event) {
    execute(event && event.detail ? event.detail : null);
  });

  root.StegOSSv001EvidenceChainContinuation = {
    execute: execute,
    authorityEffect: "NONE_OBSERVATION_AND_DISPOSITION_ONLY",
    heartbeatGrantsExecutionAuthority: false,
    createsScheduler: false,
    requiresHumanApproval: false
  };
}(window));
