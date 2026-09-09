#!/usr/bin/env python3
"""Validate the exact current StegOS device-local admitted-inference projection on Site."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "stegos_ipod_bootstrap_projection.report.json"
UPSTREAM_REPO = "StegVerse-Labs/StegOS"
UPSTREAM_COMMIT = "145fe88376f28eab26cdcd60df45a7e74ed0b9c1"
EXPECTED = {
    "stegos-bootstrap/index.html": "f2e9aa2a994acb9b259388b7b876be5ec5487c92",
    "stegos-bootstrap/stegos-bootstrap.js": "15343c398c168f3d5f8fe6933aaf3073e89dd5c0",
    "stegos-bootstrap/admitted-inference.js": "493cf77a64479efe816cb2d89e38e4255bca121b",
    "stegos-bootstrap/device-local-autostart.js": "3927e2aa650f3267c53af73f3ef8bea2379805b9",
    "stegos-bootstrap/service-worker.js": "0bf8c8df1ae678bc73170978f6c6fdae7b9341f1",
    "stegos-bootstrap/external-resident-task.js": "87dbfdf156224df80ab5f24ae263ed13cb7577c9",
    "stegos-bootstrap/stegverse-reference-model.js": "bd8e7553b61425386f6cf65db4766b952c148ed4",
    "stegos-bootstrap/tvc-sovereign-local-model-route.js": "3ca841310b904c2e09390512043f30f301976b1d",
    "stegos-bootstrap/manifest.webmanifest": "a223ec9454f46d0e9b91d4862f11de701792144a",
}

ALLOWED_SUCCESSORS = {
    "stegos-bootstrap/index.html": {"f2e9aa2a994acb9b259388b7b876be5ec5487c92", "b2c6f72c6947d09be0d7128e4a7df5d237a3b2d5", "926ccfd6c640bcfdb49298b05026b08325db0990", "630d2d826871f5b03b9976677793cf43a7952fa6", "677504a3e035e591f22bd91b35e58b7301d06074", "342fa60fff456d478ba641c9cb1f3ee92272c81c"},
    "stegos-bootstrap/stegos-bootstrap.js": {"15343c398c168f3d5f8fe6933aaf3073e89dd5c0", "d1ae2940d16f757b4bb5964f36dab75fc48bf9c5", "c094719cc4e8708af15bc0d374252a62b064cfc8", "ba3d4a4a0c749e12bea7c3ab305abf366b49698f"},
    "stegos-bootstrap/admitted-inference.js": {"493cf77a64479efe816cb2d89e38e4255bca121b", "5619540b9a953b58f2a859b5776241809aad1932"},
    "stegos-bootstrap/service-worker.js": {"0bf8c8df1ae678bc73170978f6c6fdae7b9341f1", "7c5d62d5fba1fcde13b3a47c3b9b561d03b77087", "99d652dc961855b0b89d093a3f5ad2e027352849", "048ae96f211e28314fa91c6a34cbc29ec13a2a26", "9fdb5a580002c3a881f1523938ab1c0bcb127546", "28fca6db751b183397247319fa4b5ebef76cebb8", "8b0b8d270de2c0420373994c99a5ef8a49aa4744", "b48c79a6faf6735e262a5f2f791ff576d4379504", "017164f2a71c28300ee59abb8071b0da973d206c", "0e3cc9a63dc833f829f9b3cb2f2ae07d8feb59e1", "34900418f5b8c7225936a89ef541b82bc496a969", "b887fd056e58f05038e16d4663e719b6013d419b", "a4150117bd900750eb6f2d6812703b5e7edac859", "ea2a3c212d21f5a014ce7c5a7a2bde362e3b2671", "45a20a1e7cb7aa404c75f5ab8663881c5945a815", "a27fb3d98f32924452da9b19921b9824d3d2a7c3"},
}

CANONICAL_RECOVERY_BLOBS = {
    "stegos-bootstrap/master-records-sv001-recovery.js": "5ca977c4214c3eec13bd2ac1109405e7f1571723",
    "stegos-bootstrap/master-records-sv001-custody-package.json": "70e02082d63d046101fa0a21d82e12261c891e79",
}
V13_RUNTIME_PREDECESSOR = {
    "stegos-bootstrap/service-worker-v13-runtime.js": "b48c79a6faf6735e262a5f2f791ff576d4379504"
}


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def read(relative: str) -> str:
    path = ROOT / relative
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main() -> int:
    failures: list[str] = []
    observed: dict[str, str] = {}
    for relative, expected_sha in EXPECTED.items():
        path = ROOT / relative
        if not path.exists():
            failures.append(f"missing projected file: {relative}")
            continue
        sha = git_blob_sha(path.read_bytes())
        observed[relative] = sha
        allowed = ALLOWED_SUCCESSORS.get(relative, {expected_sha})
        if sha not in allowed:
            failures.append(f"blob mismatch {relative}: {sha} not in {sorted(allowed)}")

    observed_recovery: dict[str, str] = {}
    for relative, expected_sha in CANONICAL_RECOVERY_BLOBS.items():
        path = ROOT / relative
        if not path.exists():
            failures.append(f"missing canonical Master Records recovery projection: {relative}")
            continue
        sha = git_blob_sha(path.read_bytes())
        observed_recovery[relative] = sha
        if sha != expected_sha:
            failures.append(f"canonical recovery blob mismatch {relative}: {sha} != {expected_sha}")

    observed_predecessor: dict[str, str] = {}
    for relative, expected_sha in V13_RUNTIME_PREDECESSOR.items():
        path = ROOT / relative
        if not path.exists():
            failures.append(f"missing exact v13 runtime predecessor: {relative}")
            continue
        sha = git_blob_sha(path.read_bytes())
        observed_predecessor[relative] = sha
        if sha != expected_sha:
            failures.append(f"v13 runtime predecessor blob mismatch {relative}: {sha} != {expected_sha}")

    bootstrap = read("stegos-bootstrap/stegos-bootstrap.js")
    inference = read("stegos-bootstrap/admitted-inference.js")
    autostart = read("stegos-bootstrap/device-local-autostart.js")
    html = read("stegos-bootstrap/index.html")
    service_worker = read("stegos-bootstrap/service-worker.js")
    service_worker_predecessor = read("stegos-bootstrap/service-worker-v13-runtime.js")
    model = read("stegos-bootstrap/stegverse-reference-model.js")
    route = read("stegos-bootstrap/tvc-sovereign-local-model-route.js")
    resident_task = read("stegos-bootstrap/external-resident-task.js")
    recovery = read("stegos-bootstrap/master-records-sv001-recovery.js")
    auto_recovery = read("stegos-bootstrap/master-records-auto-recovery.js")
    native_activation = read("stegos-bootstrap/sv001-native-resident-activation.js")
    native_activation_page = read("stegos-bootstrap/native-resident-activate.html")
    hil_receiver = read("stegos-bootstrap/hil-browser-receiver.js")
    hil_activation_page = read("stegos-bootstrap/hil-activate.html")
    combined = "\n".join((bootstrap, inference, autostart, html, service_worker, service_worker_predecessor, model, route, resident_task, recovery, auto_recovery, native_activation, native_activation_page, hil_receiver, hil_activation_page))

    required_markers = {
        "activation_authority_plane": 'var AUTHORITY_PLANE = "STEGVERSE"',
        "credential_authority": 'var CREDENTIAL_AUTHORITY = "TV/TVC"',
        "canonical_model_owner": 'LOCAL_MODEL_SOURCE = "StegVerse-002/micro-node-runtime"',
        "canonical_model_id": 'LOCAL_MODEL_ID = "stegverse-reference-lm-v1"',
        "canonical_tvc_owner": 'TVC_SOURCE = "StegVerse-Labs/TVC"',
        "canonical_tvc_task": 'TVC_TASK = "TVC-SOVEREIGN-LOCAL-MODEL-ROUTE-002"',
        "device_endpoint": 'https://stegverse.org/stegos-bootstrap/local-model',
        "local_transport": 'SERVICE_WORKER_LOCAL_INTERCEPT',
        "automatic_admission": "bootstrapDeviceLocalInferenceEvidence()",
        "bounded_autostart": "MAX_ATTEMPTS = 120",
        "credential_free_fetch": 'credentials: "omit"',
        "measured_usage": "FAIL_CLOSED: model usage proof missing",
        "copy_evidence_button": 'id="copy-evidence"',
        "copy_evidence_clipboard": "navigator.clipboard.writeText",
        "device_task_scope": 'TASK_SCOPE = "DEVICE_LOCAL_INFERENCE_ONLY"',
        "device_continuity_key": 'DEVICE_ROOT_KEY = "device-continuity-root"',
        "device_continuity_schema": 'schema: "stegos.web_device_continuity_root.v1"',
        "device_continuity_id": 'device_continuity_id: "stegdevice-"',
        "node_binding_receipt": 'schema: "stegos.web_device_node_binding_receipt.v1"',
        "separate_unsynced_chains": "different_unsynced_device_continuity_roots_are_separate_chains: true",
        "no_implicit_cross_root": "implicit_cross_root_continuation_allowed: false",
        "governed_transfer_required": "governed_transfer_required_for_cross_root_continuation: true",
        "no_browser_hardware_attestation": 'hardware_attestation: "UNAVAILABLE_TO_BROWSER"',
        "evidence_root_export": "bundle.device_continuity_id = continuity.device_continuity_id",
        "evidence_node_export": "bundle.node_instance_id = bundle.node && bundle.node.node_id",
        "cross_context_create_if_absent": "function addMetaIfAbsent(db, key, value)",
        "indexeddb_atomic_add": 'objectStore(META_STORE).add({ key: key, value: value })',
        "lost_race_constraint": 'req.error.name === "ConstraintError"',
        "winning_context_gate": "then(function (wonCreate)",
        "lost_race_reuses_winner": "device continuity root race lost without persisted winner",
        "resident_task_profile": "STEGVERSE001_BOUNDED_CONTINUITY_AUDIT_V1",
        "resident_task_transition": "SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED",
        "resident_task_endpoint": 'RESIDENT_TASK_PATH = "/stegos-bootstrap/resident-task"',
        "resident_external_claim_not_promoted": "external_claim_promoted_to_browser_authority: false",
        "resident_global_worker_authority_false": "global_workercoordinator_authority: false",
        "mr_historical_retroactive_authorization_false": "historical_state_retroactively_authorized: false",
        "mr_historical_admission_required": "historical Master Records custody lacks retained contemporaneous InTr admission; retroactive authorization forbidden",
        "mr_canonical_recovery_target": "81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35",
        "mr_canonical_recovery_unique": "canonical cycle receipt is not uniquely recoverable from retained journal",
        "mr_auto_progression_ready": "EXACT_G23_READY_REQUESTING_CURRENT_MACHINE_GOVERNANCE",
        "mr_auto_progression_executor": "StegOSWebBootstrap.executeMasterRecordsSv001Custody",
        "mr_auto_progression_fail_closed": "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED",
        "mr_auto_progression_no_authority_reuse": "successful_recovery_authorizes_transition: false",
        "mr_rendezvous_mode": "SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS",
        "mr_rendezvous_static_hosted_disabled": 'config.enabled !== false',
        "mr_rendezvous_local_only_selection": "FIRST_VALID_SOVEREIGN_LOCAL_ONLY",
        "mr_rendezvous_optional_fallback_explicit": "selection_requires_explicit_runtime_opt_in",
        "mr_rendezvous_no_automatic_hosted_fallback": "hosted fallback not automatically selected",
        "mr_rendezvous_loopback_127": 'url.hostname === "127.0.0.1"',
        "mr_rendezvous_loopback_localhost": 'url.hostname === "localhost"',
        "mr_rendezvous_primary_probe": "probeSovereignResident(config, 0)",
        "mr_v16_shell": 'CACHE_NAME = "stegos-web-bootstrap-v16";',
        "mr_v16_exact_predecessor": 'importScripts("./service-worker-v13-runtime.js")',
        "native_activation_receipt_one": 'receiptRequest = tx.objectStore(RECEIPTS).get(1)',
        "native_activation_receipt_one_revalidated": "receipt_1_digest_revalidated: true",
        "native_activation_canonical_node": 'var NODE_RE = /^SV-NODE-[0-9a-f]{24}$/',
        "native_activation_scheme": 'var ACTIVATION_BASE = "stegverse://resident-rendezvous/activate"',
        "native_activation_no_authority": 'projection_grants_authority: false',
        "native_activation_no_listener_proof": 'app_open_proves_listener_ready: false',
        "native_activation_hosted_fallback_only": 'hosted_transport_role: "FALLBACK_ONLY"',
        "native_activation_page_user_gesture": "openStegOSFromUserGesture",
        "native_activation_cached_js": '"./sv001-native-resident-activation.js"',
        "native_activation_cached_page": '"./native-resident-activate.html"',
        "hil_request_bound_receiver_refresh": "RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002",
        "hil_v16_protocol": "HIL_BROWSER_EVIDENCE_V16",
        "hil_v16_route": "/stegos-bootstrap/portable-workercoordinator/hil-browser-v16",
        "hil_stale_worker_skip_waiting": "self.skipWaiting()",
        "hil_stale_worker_clients_claim": "self.clients.claim()",
    }
    for label, marker in required_markers.items():
        if marker not in combined:
            failures.append(f"missing authority/activation marker {label}: {marker}")

    for retired in (
        "SOVEREIGN_LOCAL_PRIMARY_WITH_HOSTED_FALLBACK",
        "FIRST_VALID_SOVEREIGN_LOCAL_THEN_HOSTED_FALLBACK",
        "hostedFallbackOrigin",
    ):
        if retired in auto_recovery:
            failures.append(f"retired Master Records rendezvous marker remains active: {retired}")

    local_branch = ""
    if 'url.pathname === LOCAL_PATH' in service_worker_predecessor:
        local_branch = service_worker_predecessor.split('url.pathname === LOCAL_PATH', 1)[1].split('if (event.request.method !== "GET")', 1)[0]
    if "event.respondWith(handleLocalModel" not in local_branch:
        failures.append("service worker predecessor does not own local model branch")
    if "fetch(event.request)" in local_branch:
        failures.append("device-local model branch may escape to network")

    prohibited = [
        "CLOUDFLARE_API_TOKEN", "RENDER_API_KEY", "VERCEL_TOKEN", "GITHUB_TOKEN", "GH_TOKEN",
        "APP_STORE_CONNECT", "APPLE_ID_PASSWORD", "Authorization: Bearer",
    ]
    for marker in prohibited:
        if marker in combined:
            failures.append(f"prohibited credential/runtime marker projected: {marker}")

    report = {
        "schema_version": "1.17.0",
        "status": "FAIL" if failures else "PASS",
        "source_repository": UPSTREAM_REPO,
        "source_commit": UPSTREAM_COMMIT,
        "expected_git_blobs": EXPECTED,
        "observed_git_blobs": observed,
        "canonical_master_records_recovery_expected_blobs": CANONICAL_RECOVERY_BLOBS,
        "canonical_master_records_recovery_observed_blobs": observed_recovery,
        "v13_runtime_predecessor_expected_blobs": V13_RUNTIME_PREDECESSOR,
        "v13_runtime_predecessor_observed_blobs": observed_predecessor,
        "exact_projection": not failures and all(observed.get(path) in ALLOWED_SUCCESSORS.get(path, {expected}) for path, expected in EXPECTED.items()),
        "canonical_master_records_recovery_exact_projection": not failures and observed_recovery == CANONICAL_RECOVERY_BLOBS,
        "v13_runtime_predecessor_exact_projection": not failures and observed_predecessor == V13_RUNTIME_PREDECESSOR,
        "allowed_exact_successor_blobs": {k: sorted(v) for k, v in ALLOWED_SUCCESSORS.items()},
        "credential_authority": "TV/TVC",
        "credential_requirement": "NONE",
        "non_tv_tvc_secret_or_token_used": False,
        "second_non_stegverse_machine_required": False,
        "network_egress_required_for_device_model": False,
        "render_production_authority": False,
        "render_transport_role": "OPTIONAL_EXPLICIT_OPT_IN_ONLY",
        "resident_rendezvous_primary_transport": "SOVEREIGN_LOCAL_DISCOVERY_ONLY",
        "resident_rendezvous_automatic_hosted_fallback": False,
        "native_resident_activation_projection": True,
        "native_resident_activation_requires_user_mediated_app_open": True,
        "native_resident_activation_proves_listener_ready": False,
        "native_resident_activation_proves_custody": False,
        "github_token_runtime_authority": False,
        "hosted_ci_activation_authority": False,
        "site_authority_effect": "TRANSPORT_MATERIALIZATION_ONLY",
        "device_continuity_identity_distinct_from_node_identity": True,
        "different_unsynced_roots_are_separate_chains": True,
        "implicit_cross_root_continuation_allowed": False,
        "governed_transfer_required_for_cross_root_continuation": True,
        "hardware_attestation_claimed_by_browser": False,
        "cross_context_device_root_creation_atomic": True,
        "duplicate_root_receipt_on_lost_race_allowed": False,
        "resident_task_source_commit": "835372a69af23dc73b6f75591ced6281c43ffa8d",
        "resident_task_execution_surface": "CURRENT_USER_IPHONE",
        "resident_task_global_workercoordinator_authority": False,
        "resident_task_external_claim_promoted_to_browser_authority": False,
        "sv001_master_records_governance_successor_exact": True,
        "sv001_historical_state_retroactively_authorized": False,
        "sv001_canonical_g23_recovery_source_projected_exactly": not failures and observed_recovery == CANONICAL_RECOVERY_BLOBS,
        "sv001_canonical_g23_recovery_is_custody": False,
        "sv001_auto_continuation_uses_current_governance": True,
        "sv001_auto_continuation_creates_scheduler": False,
        "hb32_grants_execution_authority": False,
        "hil_browser_protocol": "HIL_BROWSER_EVIDENCE_V16",
        "control_revision": "CURRENT_IPHONE_GOVERNED_MR_CUSTODY_V16_HIL_PROTOCOL_PIN_PLUS_SOVEREIGN_LOCAL_ONLY_RENDEZVOUS_USING_EXISTING_HB32_INTR_RUNTIME",
        "failures": failures,
    }
    REPORT.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"STEGOS_IPOD_BOOTSTRAP_PROJECTION_{report['status']}")
    for failure in failures:
        print(failure)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
