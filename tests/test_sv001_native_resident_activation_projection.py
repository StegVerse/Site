from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "stegos-bootstrap" / "sv001-native-resident-activation.js"
PAGE = ROOT / "stegos-bootstrap" / "native-resident-activate.html"
WRAPPER = ROOT / "stegos-bootstrap" / "service-worker.js"
RUNTIME = ROOT / "stegos-bootstrap" / "service-worker-v13-runtime.js"


def test_projection_revalidates_canonical_receipt_one_from_existing_node_store():
    text = SOURCE.read_text(encoding="utf-8")
    assert 'DB_NAME = "stegos-node-v1"' in text
    assert 'RECEIPTS = "receipts"' in text
    assert 'receiptRequest = tx.objectStore(RECEIPTS).get(1)' in text
    assert 'genesis.schema !== "stegos.node_handoff_receipt.v1"' in text
    assert 'genesis.receipt_number !== 1' in text
    assert 'genesis.transition !== "NODE_REGISTERED"' in text
    assert 'genesis.continuity_parent !== "GENESIS"' in text
    assert 'genesis.authority_effect !== "NONE"' in text
    assert 'genesis.credential_authority !== "TV/TVC"' in text
    assert 'NODE_RECEIPT_1_DIGEST_MISMATCH' in text
    assert 'receipt_1_digest_revalidated: true' in text


def test_projection_uses_canonical_node_and_never_hardware_identity():
    text = SOURCE.read_text(encoding="utf-8")
    assert '/^SV-NODE-[0-9a-f]{24}$/' in text
    assert 'node_receipt_1_sha256: "sha256:" + state.registration.receipt_sha256' in text
    assert 'stegverse://resident-rendezvous/activate' in text
    assert 'NONE_BINDING_ONLY' in text
    assert 'hardwareIdentifier' not in text
    assert 'device_binding_sha256' not in text


def test_projection_is_non_authorizing_and_hosted_is_fallback_only():
    text = SOURCE.read_text(encoding="utf-8")
    assert 'projection_grants_authority: false' in text
    assert 'app_open_proves_listener_ready: false' in text
    assert 'app_open_proves_custody: false' in text
    assert 'app_open_proves_runtime_continuity: false' in text
    assert 'hosted_transport_role: "FALLBACK_ONLY"' in text
    assert 'authority_effect: "NONE_PROJECTION_ONLY"' in text
    assert 'onrender.com' not in text


def test_user_gesture_surface_does_not_claim_native_runtime_success():
    page = PAGE.read_text(encoding="utf-8")
    assert 'Open StegOS Local Resident' in page
    assert 'APP_OPEN_REQUESTED_NOT_PROVEN' in page
    assert 'api.openStegOSFromUserGesture()' in page
    assert 'does not prove listener readiness' in page
    assert 'Hosted transport remains fallback-only' in page


def test_surface_distinguishes_observed_browser_handoff_from_unobserved_native_open():
    page = PAGE.read_text(encoding="utf-8")
    assert 'visibilitychange' in page
    assert 'pagehide' in page
    assert 'APP_HANDOFF_OBSERVED_LISTENER_NOT_PROVEN' in page
    assert 'APP_HANDOFF_NOT_OBSERVED' in page
    assert 'Safari remained foreground after the stegverse:// handoff request.' in page
    assert 'No listener or runtime state is inferred.' in page
    assert 'foregroundLeft' in page


def test_existing_v15_wrapper_propagates_projection_without_mutating_v13_runtime():
    wrapper = WRAPPER.read_text(encoding="utf-8")
    runtime = RUNTIME.read_text(encoding="utf-8")
    assert 'importScripts("./service-worker-v13-runtime.js")' in wrapper
    assert 'CACHE_NAME = "stegos-web-bootstrap-v15"' in wrapper
    assert '"./sv001-native-resident-activation.js"' in wrapper
    assert '"./native-resident-activate.html"' in wrapper
    assert 'stegos-web-bootstrap-v13' in runtime
    assert 'sv001-native-resident-activation.js' not in runtime
    assert 'native-resident-activate.html' not in runtime
