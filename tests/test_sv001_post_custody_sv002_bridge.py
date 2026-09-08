from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "stegos-bootstrap/sv001-evidence-chain-continuation.js"
AUTO = ROOT / "stegos-bootstrap/master-records-auto-recovery.js"
WRAPPER = ROOT / "stegos-bootstrap/service-worker.js"


def test_v15_reuses_v13_and_adds_only_bounded_extension():
    source = WRAPPER.read_text(encoding="utf-8")
    assert 'importScripts("./service-worker-v13-runtime.js", "./sv001-evidence-chain-continuation.js")' in source
    assert 'CACHE_NAME = "stegos-web-bootstrap-v15"' in source


def test_post_custody_extension_is_non_authorizing_and_directly_chained():
    source = EXTENSION.read_text(encoding="utf-8")
    assert "81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35" in source
    assert "entry.previous_entry_sha256 !== custody.final_replay_tail_sha256" in source
    assert "prior_receipt_authorizes_next_transition:false" in source
    assert "historical_state_retroactively_authorized:false" in source
    assert "heartbeat_granted_authority:false" in source
    assert "WorkerCoordinator" not in source
    assert "setInterval(" not in source
    assert "setTimeout(" not in source


def test_frozen_sv002_suite_cardinality_and_provenance_are_preserved():
    source = EXTENSION.read_text(encoding="utf-8")
    assert source.count('"AO-') == 12
    assert "fba8beea98838bc16b4b2502c5a2ac363c72add3" in source
    assert 'OPERATIVE_CONDITION = "v0.3 FROZEN"' in source
    assert 'target_property_established:true' in source


def test_sv002_runs_after_governed_custody_and_preserves_custody_on_failure():
    source = AUTO.read_text(encoding="utf-8")
    assert source.index("executeMasterRecordsSv001Custody(cycleReceipt)") < source.index("continueToSv002(cycleReceipt, result)")
    assert "PASS — MASTER RECORDS CUSTODY / SV002 CONTINUATION FAIL_CLOSED" in source
    assert "custody_state_preserved: true" in source
    assert "sv001_rerun_performed: false" in source
