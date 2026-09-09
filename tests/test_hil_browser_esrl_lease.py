from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOT = ROOT / "stegos-bootstrap"


def test_esrl_successor_is_separate_and_fail_closed():
    src = (BOOT / "hil-browser-esrl-lease.js").read_text(encoding="utf-8")
    assert 'var ROUTE_PATH = "/stegos-bootstrap/portable-workercoordinator/hil-esrl-v1"' in src
    assert 'var PROTOCOL = "HIL_BROWSER_ESRL_V1"' in src
    assert 'var SOURCE_PROTOCOL = "HIL_BROWSER_EVIDENCE_V16"' in src
    assert 'state: "LEASE_OPEN"' in src
    assert 'lease_state: "LEASE_OPEN"' in src
    assert '["REQUESTED", "ADMITTED", "PROVISIONING", "LOCAL_READY", "LEASE_OPEN"]' in src
    assert 'runtime_materialized: true' in src
    assert 'local_identity_verified: true' in src
    assert 'public_https_rendezvous_observed: false' in src
    assert 'public_observation_is_downstream_optional: true' in src
    assert 'second_claim_minted: false' in src
    assert 'post_restart_exact_byte_proof_observed: false' in src
    assert 'tvc_lifecycle_receipt_observed: false' in src
    assert 'broader_hil_lifecycle_complete: false' in src
    assert 'authority_effect: "NONE_RUNTIME_OBSERVATION_ONLY"' in src


def test_esrl_successor_requires_exact_g25_lineage_inputs():
    src = (BOOT / "hil-browser-esrl-lease.js").read_text(encoding="utf-8")
    assert 'value.state !== "BROWSER_HIL_LOCAL_READY_OBSERVED"' in src
    assert 'value.journal_replay_state !== "PASS"' in src
    assert 'value.fencing_token <= 24' in src
    assert 'receipt.claim_id !== evidence.claim_id' in src
    assert 'receipt.fencing_token !== evidence.fencing_token' in src
    assert 'receipt.receipt_sha256 !== evidence.canonical_checkout_receipt_sha256' in src
    assert 'state.checkout_count !== 1' in src
    assert 'state.last_task_id !== TASK_ID' in src
    assert 'body.browser_context_id !== evidence.browser_context_id' in src
    assert 'body.node_id !== evidence.node_id' in src


def test_esrl_page_reuses_same_browser_context_and_exports_exact_json():
    page = (BOOT / "hil-esrl-activate.html").read_text(encoding="utf-8")
    assert 'var SOURCE_KEY="stegos-hil-last-success-v1"' in page
    assert 'var PROTOCOL="HIL_BROWSER_ESRL_V1"' in page
    assert 'var ROUTE="/stegos-bootstrap/portable-workercoordinator/hil-esrl-v1"' in page
    assert 'same-context HIL local-ready evidence is not present' in page
    assert 'body:JSON.stringify({hil_esrl_protocol:PROTOCOL,browser_context_id:source.browser_context_id,node_id:source.node_id,browser_evidence:source})' in page
    assert 'Copy evidence JSON' in page
    assert 'Download evidence JSON' in page
    assert 'link.download="hil-esrl-lease-open-"+evidence.browser_context_id+".json"' in page


def test_service_worker_loads_esrl_successor_without_state_reset():
    worker = (BOOT / "service-worker.js").read_text(encoding="utf-8")
    assert 'importScripts("./hil-portable-state-bridge.js")' in worker
    assert 'importScripts("./hil-browser-esrl-lease.js")' in worker
    assert '"./hil-esrl-activate.html"' in worker
    assert 'CACHE_NAME = "stegos-web-bootstrap-v16"' in worker
    assert "indexedDB.deleteDatabase" not in worker
    assert "caches.delete" not in worker
