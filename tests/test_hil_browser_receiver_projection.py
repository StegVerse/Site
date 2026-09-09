from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
BOOT = ROOT / "stegos-bootstrap"


def git_blob_sha(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def test_exact_hil_browser_receiver_and_page_projection():
    receiver = BOOT / "hil-browser-receiver.js"
    page = BOOT / "hil-activate.html"
    assert git_blob_sha(receiver) == "35ea230bcb33594125244fe2f9164a98f79983e6"
    assert git_blob_sha(page) == "3d8d0db5faa29d89bcf6b149ec402d7cd1a0ed81"
    html = page.read_text(encoding="utf-8")
    assert "/stegos-bootstrap/portable-workercoordinator/hil-browser" in html
    assert "No signed app, TestFlight install, second machine" in html
    assert "stegverse://hil/activate" not in html
    assert "BROWSER_HIL_LOCAL_READY_OBSERVED" in html


def test_existing_service_worker_and_portable_state_lineage_are_reused():
    worker = BOOT / "service-worker.js"
    state_bridge = (BOOT / "hil-portable-state-bridge.js").read_text(encoding="utf-8")
    assert git_blob_sha(worker) == "b887fd056e58f05038e16d4663e719b6013d419b"
    assert 'importScripts("./hil-browser-receiver.js")' in state_bridge
    assert "PORTABLE_WC_STATE_KEY" in state_bridge
    assert "portableStateStoreForPackage" in state_bridge
    assert "new Worker" not in state_bridge
    assert "new SharedWorker" not in state_bridge


def test_browser_receiver_preserves_authority_and_evidence_boundaries():
    source = (BOOT / "hil-browser-receiver.js").read_text(encoding="utf-8")
    assert "StegVersePortableWorkerCoordinator.checkout" in source
    assert "StegOSEcosystemChatServiceWorkerBridge.portableStateStoreForPackage" in source
    assert 'state: "BROWSER_HIL_LOCAL_READY_OBSERVED"' in source
    assert 'browser_receiver_execution_observed: true' in source
    assert 'installed_native_app_required: false' in source
    assert 'request_consumption_claimed: false' in source
    assert 'interlock_transition_authority: false' in source
    assert 'authority_effect: "NONE_COMPONENT_EVIDENCE_ONLY"' in source
    assert 'credential_authority: "TV/TVC"' in source
    assert 'github_token_runtime_authority: "NONE"' in source
    assert 'heartbeat_granted_authority: false' in source
    assert "navigator.serviceWorker.register" not in source
