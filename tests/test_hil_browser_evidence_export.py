from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOT = ROOT / "stegos-bootstrap"

REQUEST_ID = "RESIDENT-EXEC-HIL-SOVEREIGN-RECEIVER-002"
REQUEST_SHA256 = "6bf940fb920f672111ba1040fd0bf9bf7016d6bf032bbcfd164a1a2347ee7038"


def test_receiver_binds_exact_resident_request_without_promoting_consumption():
    src = (BOOT / "hil-browser-receiver.js").read_text(encoding="utf-8")
    assert REQUEST_ID in src
    assert REQUEST_SHA256 in src
    assert "resident_request_id: REQUEST_ID" in src
    assert "resident_request_sha256: REQUEST_SHA256" in src
    assert "browser_context_id" in src
    assert 'request_consumption_claimed: false' in src
    assert 'authority_effect: "NONE_COMPONENT_EVIDENCE_ONLY"' in src


def test_activation_page_exposes_context_and_exact_json_export():
    page = (BOOT / "hil-activate.html").read_text(encoding="utf-8")
    assert REQUEST_ID in page
    assert REQUEST_SHA256 in page
    assert "stegos-hil-browser-context-v1" in page
    assert "stegos-hil-last-success-v1" in page
    assert "Copy evidence JSON" in page
    assert "Download evidence JSON" in page
    assert "navigator.clipboard.writeText" in page
    assert "new Blob" in page
    assert 'link.download = "hil-browser-evidence-" + contextId + ".json"' in page
    assert "storage/service-worker state is isolated from other browser contexts" in page


def test_page_does_not_accept_caller_claim_or_fence():
    page = (BOOT / "hil-activate.html").read_text(encoding="utf-8")
    body = page.split("body: JSON.stringify({", 1)[1].split("})", 1)[0]
    assert "claim_id" not in body
    assert "fencing_token" not in body
    assert "resident_request_id: REQUEST_ID" in body
    assert "resident_request_sha256: REQUEST_SHA256" in body
