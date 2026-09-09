from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
BOOT = ROOT / "stegos-bootstrap"


def test_hil_public_activation_surface_is_projected():
    html = (BOOT / "hil-activate.html").read_text(encoding="utf-8")
    assert "SHWP-HIL-SOVEREIGN-RECEIVER-001" in html
    assert "/stegos-bootstrap/portable-workercoordinator/hil" in html
    assert "stegverse://hil/activate?envelope=" in html
    assert 'claim_id' not in html
    assert 'fencing_token' not in html


def test_hil_portable_package_preserves_canonical_boundaries():
    pkg = json.loads((BOOT / "workercoordinator-portable-hil.json").read_text(encoding="utf-8"))
    assert pkg["task"]["task_id"] == "SHWP-HIL-SOVEREIGN-RECEIVER-001"
    assert pkg["execution_surface"] == "CURRENT_USER_IPHONE"
    assert pkg["credential_authority"] == "TV/TVC"
    assert pkg["github_token_runtime_authority"] == "NONE"
    assert pkg["heartbeat_grants_execution_authority"] is False
    assert pkg["parallel_workercoordinator_claim_issuance_allowed"] is False
    assert pkg["minimum_fencing_token_exclusive"] == 24
    assert pkg["native_consumer"]["source_merge"] == "efc9d5e1e8140759a5f971484ae593cf545b9203"
    assert pkg["runtime_execution_observed"] is False
    assert pkg["activation_effect"] is False


def test_service_worker_loads_hil_on_existing_v15_contract():
    worker = (BOOT / "service-worker.js").read_text(encoding="utf-8")
    assert 'importScripts("./service-worker-v13-runtime.js")' in worker
    assert 'importScripts("./hil-portable-state-bridge.js")' in worker
    assert 'importScripts("./hil-portable-native-bridge.js")' in worker
    assert 'CACHE_NAME = "stegos-web-bootstrap-v15"' in worker


def test_hil_bridge_reuses_existing_portable_state_key_without_second_worker():
    state_bridge = (BOOT / "hil-portable-state-bridge.js").read_text(encoding="utf-8")
    hil_bridge = (BOOT / "hil-portable-native-bridge.js").read_text(encoding="utf-8")
    assert "PORTABLE_WC_STATE_KEY" in state_bridge
    assert "portableStateStoreForPackage" in state_bridge
    assert "new Worker" not in state_bridge
    assert "new SharedWorker" not in state_bridge
    assert "navigator.serviceWorker.register" not in hil_bridge
    assert "StegVersePortableWorkerCoordinator.checkout" in hil_bridge
    assert "request_consumption_claimed: false" in hil_bridge
    assert "native_receiver_execution_observed: false" in hil_bridge
