#!/usr/bin/env python3
"""Fail-closed source validator for same-device SV001 Master Records governance."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL_G23 = "sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit("FAIL: " + message)


def main() -> int:
    root_intr = (ROOT / "intr-service-worker.js").read_text(encoding="utf-8")
    browser = (ROOT / "stegos-bootstrap/stegos-bootstrap.js").read_text(encoding="utf-8")
    bootstrap_wrapper = (ROOT / "stegos-bootstrap/service-worker.js").read_text(encoding="utf-8")
    bootstrap_sw = (ROOT / "stegos-bootstrap/service-worker-v13-runtime.js").read_text(encoding="utf-8")
    auto_recovery = (ROOT / "stegos-bootstrap/master-records-auto-recovery.js").read_text(encoding="utf-8")
    gateway_config = json.loads((ROOT / "data/ecosystem-chat-gateway.json").read_text(encoding="utf-8"))
    propagation = (ROOT / "docs/STEGOS_V15_CONFIGURED_RENDEZVOUS_PROPAGATION.md").read_text(encoding="utf-8")
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    readme_normalized = readme.replace("-\n", "-").replace("\n", " ")
    handoff = (ROOT / "docs/MR_SV001_CURRENT_IPHONE_CUSTODY_MIRROR_HANDOFF.md").read_text(encoding="utf-8")
    claim = (ROOT / "data/session-work-claims.d/site-sv001-mr-intr-governance-20260905.json").read_text(encoding="utf-8")
    preflight = (ROOT / "data/preflight/sv001-mr-intr-governance-20260905.json").read_text(encoding="utf-8")
    continuation_claim = (ROOT / "data/session-work-claims.d/site-sv001-auto-governed-custody-hb-runtime-1096.json").read_text(encoding="utf-8")
    continuation_preflight = (ROOT / "data/preflight/sv001-auto-governed-custody-hb-runtime-1096.json").read_text(encoding="utf-8")

    for marker in [
        '"MasterRecords:SV001Custody"',
        'MR_SV001_OWNER="master-records/orchestration#73"',
        'MR_SV001_TRANSITION="SV001_MASTER_RECORDS_CUSTODY_AND_RECONSTRUCTION"',
        'authority_class==="MACHINE_GOVERNED"',
        'human_approval_required===false',
        'current_governance_required===true',
        'prior_receipt_authorizes_transition===false',
        'STEGVERSE_INTR_LOCAL_TRIGGER',
        'current_governance_decision_observed:true',
        'site_custody_authority:false',
        'site_execution_authority:false',
    ]:
        require(marker in root_intr, f"root InTr marker missing: {marker}")
    require(CANONICAL_G23 in root_intr, "root InTr not bound to canonical G23")
    require('profiles:["KV:KnowledgeVaultInterlock","HIL:Ingress","MasterRecords:SV001Custody"]' in root_intr,
            "root InTr profile must preserve KV/HIL and add bounded MR custody")

    for marker in [
        'REGISTERED_NODE_DB = "stegos-node-v1"',
        'REGISTERED_NODE_OUTBOX = "intr_outbox"',
        'MR_SV001_TRANSITION = "SV001_MASTER_RECORDS_CUSTODY_AND_RECONSTRUCTION"',
        'authority_class: "MACHINE_GOVERNED"',
        'human_approval_required: false',
        'current_governance_required: true',
        'prior_receipt_authorizes_transition: false',
        'navigator.serviceWorker.register("/intr-service-worker.js", { scope: "/" })',
        'STEGVERSE_INTR_LOCAL_TRIGGER',
        'intr_admission_receipt: intrAdmission',
        'deriveHeartbeatReference()',
        'progression_dependency: "OSCILLATOR_ONLY"',
    ]:
        require(marker in browser, f"browser carrier marker missing: {marker}")
    require(CANONICAL_G23 in browser, "browser carrier not bound to canonical G23")
    require(browser.index("admitMasterRecordsSv001Custody(cycleReceipt)") < browser.index('new URL("./master-records/sv001"'),
            "browser must obtain root InTr admission before nested custody POST")

    require('importScripts("./service-worker-v13-runtime.js")' in bootstrap_wrapper,
            "current service worker wrapper must import exact v13 runtime predecessor")
    require('CACHE_NAME = "stegos-web-bootstrap-v16"' in bootstrap_wrapper,
            "v16 wrapper must advance cache generation so installed clients refresh current browser-evidence and configured-rendezvous source")
    require('importScripts("./hil-portable-state-bridge.js")' in bootstrap_wrapper and
            'importScripts("./hil-portable-native-bridge.js")' in bootstrap_wrapper,
            "v16 wrapper must preserve portable HIL bridge imports while advancing code generation")

    for marker in [
        'var CACHE_NAME = "stegos-web-bootstrap-v13"',
        'MR_SV001_INTR_SCHEMA = "stegverse.master-records.sv001-custody-intr-admission/v1"',
        'validateMasterRecordsSv001IntrAdmission',
        'current_governance_decision_observed !== true',
        'human_approval_checkpoint_inserted !== false',
        'prior_receipt_authorizes_transition !== false',
        'intr_governance_admission_observed: !!admissionEntry',
        'appendReceipt(admission)',
        'self.StegVerseMasterRecordsPortableSv001.process(source)',
        'historical Master Records custody lacks retained contemporaneous InTr admission; retroactive authorization forbidden',
        'existing.admission_entry || existing.custody_entry || existing.reconstruction_entry',
        'partial Master Records governance/custody state requires explicit recovery; prior admission may not authorize a later mutation',
        'validateMasterRecordsSv001IntrAdmission(admissionEntry.receipt, sourceHash)',
        'historical_state_retroactively_authorized: false',
        'consumeTvcLease: consumePortableTvcLease',
    ]:
        require(marker in bootstrap_sw, f"bootstrap predecessor marker missing: {marker}")
    require(CANONICAL_G23 in bootstrap_sw, "bootstrap predecessor not bound to canonical G23")
    require(bootstrap_sw.index("appendReceipt(admission)") < bootstrap_sw.index("self.StegVerseMasterRecordsPortableSv001.process(source)", bootstrap_sw.index("appendReceipt(admission)")),
            "new custody path must retain InTr admission before canonical Master Records mutation")

    historical_start = bootstrap_sw.index("if (existing.custody_entry && existing.reconstruction_entry)")
    historical_validate = bootstrap_sw.index("validateMasterRecordsSv001IntrAdmission(admissionEntry.receipt, sourceHash)", historical_start)
    historical_process = bootstrap_sw.index("self.StegVerseMasterRecordsPortableSv001.process(source)", historical_validate)
    require(historical_validate < historical_process,
            "existing custody replay must validate retained contemporaneous InTr admission before canonical reconstruction")
    require("if (!existing.admission_entry)" in bootstrap_sw[historical_start:historical_validate],
            "existing custody replay must fail closed when retained InTr admission is absent")

    for marker in [
        "StegOSWebBootstrap.executeMasterRecordsSv001Custody",
        "continueToGovernedCustody(retainedCycle",
        "continueToGovernedCustody(recoveredCycle",
        "EXACT_G23_READY_REQUESTING_CURRENT_MACHINE_GOVERNANCE",
        "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED",
        "current_root_intr_governance_required: true",
        "prior_receipt_authorizes_transition: false",
        "successful_recovery_authorizes_transition: false",
        'retry_surface: "EXISTING_PAGE_RESUME_LIFECYCLE_ONLY"',
        "newSchedulerCreated: false",
        "heartbeatGrantsExecutionAuthority: false",
        'config.schema_version !== "1.3.0"',
        'config.mode !== "SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS"',
        'discovery.selection_policy !== "FIRST_VALID_SOVEREIGN_LOCAL_ONLY"',
        'fallback.selection_requires_explicit_runtime_opt_in !== true',
        'hosted fallback not automatically selected',
    ]:
        require(marker in auto_recovery, f"automatic governed continuation marker missing: {marker}")
    require(CANONICAL_G23 in auto_recovery, "automatic continuation not bound to canonical G23")
    require("USER_ONLY" not in auto_recovery and "HUMAN_ONLY" not in auto_recovery,
            "automatic machine-owned continuation reintroduced a human authority gate")
    require("hostedFallbackOrigin" not in auto_recovery,
            "Master Records proof relay must not retain automatic hosted fallback selection")

    for marker in [
        'GATEWAY_CONFIG_URL = "../data/ecosystem-chat-gateway.json"',
        'SITE_CUSTODY_PROOF_SCHEMA = "stegos.master-records.portable-sv001-custody-proof/v1"',
        'EVIDENCE_SCHEMA = "stegverse.resident-rendezvous.site-custody-evidence/v1"',
        'EVIDENCE_STORE_SCHEMA = "stegverse.resident-rendezvous.site-custody-evidence-store/v1"',
        'boundary.site_execution_authority !== false',
        'boundary.gateway_execution_authority !== false',
        'boundary.master_records_authority !== false',
        'boundary.node_discovery_grants_authority !== false',
        'boundary.third_party_fallback_grants_authority !== false',
        'proof.intr_governance_admission_observed !== true',
        'proof.reconstruction_state !== "PASS"',
        'proof.site_custody_authority !== false',
        'proof.site_execution_authority !== false',
        'proof.heartbeat_granted_authority !== false',
        'proof.prior_receipt_authorizes_transition !== false',
        'proof.historical_state_retroactively_authorized !== false',
        'gatewayBase + "/api/resident-rendezvous/v1/discovery"',
        'gatewayBase + "/api/resident-rendezvous/v1/evidence/site-governed-custody"',
        'gateway_execution_authority: "NONE"',
        'evidence_grants_authority: false',
        'authority_effect: "NONE_EVIDENCE_ONLY"',
        'resident_evidence_transport_state:',
        'transport && transport.state === "RETAINED"',
        '{ state: "PENDING_RETRY" }',
    ]:
        require(marker in auto_recovery, f"custody-proof rendezvous marker missing: {marker}")

    boundary = gateway_config.get("authority_boundary") or {}
    discovery = gateway_config.get("discovery") or {}
    optional = gateway_config.get("optional_third_party_fallbacks") or []
    require(gateway_config.get("schema_version") == "1.3.0",
            "canonical Site gateway config must use current 1.3.0 schema")
    require(gateway_config.get("mode") == "SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS",
            "canonical Site gateway config must use sovereign-local discovery mode")
    require(gateway_config.get("enabled") is False and gateway_config.get("endpoint") is None and gateway_config.get("health_endpoint") is None,
            "static hosted Site gateway must remain disabled")
    require(discovery.get("enabled") is True and discovery.get("selection_policy") == "FIRST_VALID_SOVEREIGN_LOCAL_ONLY",
            "canonical Site gateway must discover sovereign local residents only")
    require(all(item.get("enabled_by_default") is False and
                item.get("selection_requires_explicit_runtime_opt_in") is True and
                item.get("production_continuity_dependency") is False and
                item.get("activation_dependency") is False and
                item.get("authority_effect") == "NONE" for item in optional),
            "optional third-party gateway fallbacks must remain explicit opt-in and non-required")
    require(boundary.get("site_execution_authority") is False and
            boundary.get("gateway_execution_authority") is False and
            boundary.get("master_records_authority") is False and
            boundary.get("node_discovery_grants_authority") is False and
            boundary.get("third_party_fallback_grants_authority") is False,
            "canonical Site gateway config must preserve non-authorizing rendezvous boundary")
    require('fetch("/api/resident-rendezvous/' not in auto_recovery,
            "SV001 proof relay must not assume GitHub Pages same-origin API routing")

    governance_call = auto_recovery.index("root.StegOSWebBootstrap.executeMasterRecordsSv001Custody(cycleReceipt)")
    proof_submit = auto_recovery.index("submitGovernedCustodyProof(result)", governance_call)
    require(governance_call < proof_submit,
            "Site must obtain authentic governed custody PASS before relaying its proof")
    require('return publishGovernedPass(cycleReceipt, source, result, { state: "PENDING_RETRY" });' in auto_recovery,
            "rendezvous transport failure must not rewrite authentic custody PASS as failure")

    require("machine-owned transition" in readme_normalized and "write-once admission" in readme_normalized,
            "README does not describe material governance/failure behavior")
    require("not grandfathered" in readme_normalized and "Admission-only state" in readme_normalized,
            "README does not document no-retroactive-authorization and partial-admission failure semantics")
    require("stegos-web-bootstrap-v15" in propagation and "configured" in propagation.lower() and "resident-rendezvous" in propagation,
            "dedicated propagation contract must preserve the v15 configured-rendezvous predecessor evidence")
    require("fresh root-InTr admission remains required before custody" in propagation and "SV001 rerun remains prohibited" in propagation,
            "retained v15 propagation contract must preserve governance and terminal-source boundaries")
    require("automatic machine-governed continuation" in readme_normalized.lower(),
            "README must describe automatic continuation after exact G23 source availability")
    require("current governance" in handoff.lower() or "contemporaneous" in handoff.lower(), "handoff lacks contemporaneous governance")
    require("stegos-bootstrap/stegos-bootstrap.js" in claim, "browser carrier omitted from canonical governance claim")
    require("stegos-bootstrap/stegos-bootstrap.js" in preflight, "browser carrier omitted from canonical governance preflight mutation scope")
    require('"historical_state_retroactively_authorized": false' in preflight,
            "preflight does not preserve no-retroactive-authorization invariant")
    require('"new_scheduler_created": false' in continuation_preflight,
            "continuation preflight does not preserve no-new-scheduler invariant")
    require('"authority_inferred": false' in continuation_preflight and '"authority_reused": false' in continuation_preflight,
            "continuation preflight must prohibit authority inference/reuse")
    require("HB32" in continuation_preflight and "OSCILLATOR_ONLY" in continuation_preflight,
            "continuation preflight must resolve existing HB32 oscillator runtime solution")
    require("site-sv001-auto-governed-custody-hb-runtime-1096" in continuation_claim,
            "automatic governed continuation claim missing")

    for text, name in [(root_intr, "root InTr"), (browser, "browser carrier"), (bootstrap_sw, "bootstrap predecessor")]:
        require("USER_ONLY" not in text and "HUMAN_ONLY" not in text, f"{name} reintroduced a human authority gate")

    print("MR_SV001_INTR_GOVERNANCE_PASS")
    print("MR_SV001_CUSTODY_PROOF_RENDEZVOUS_SOURCE_PASS")
    print("MR_SV001_CUSTODY_PROOF_SOVEREIGN_LOCAL_DISCOVERY_PASS")
    print("MR_SV001_CUSTODY_PROOF_HOSTED_AUTO_FALLBACK=false")
    print("MR_SV001_CUSTODY_PROOF_V16_WRAPPER_PASS")
    print("MR_SV001_CUSTODY_PROOF_V15_PROPAGATION_EVIDENCE_RETAINED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
