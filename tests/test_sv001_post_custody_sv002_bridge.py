import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "stegos-bootstrap/sv001-evidence-chain-continuation.js"
AUTO = ROOT / "stegos-bootstrap/master-records-auto-recovery.js"
WRAPPER = ROOT / "stegos-bootstrap/service-worker.js"


class Sv001PostCustodySv002BridgeTests(unittest.TestCase):
    def test_v15_reuses_v13_and_adds_only_bounded_extension(self):
        source = WRAPPER.read_text(encoding="utf-8")
        self.assertIn('importScripts("./service-worker-v13-runtime.js", "./sv001-evidence-chain-continuation.js")', source)
        self.assertIn('CACHE_NAME = "stegos-web-bootstrap-v15"', source)

    def test_post_custody_extension_is_non_authorizing_and_directly_chained(self):
        source = EXTENSION.read_text(encoding="utf-8")
        self.assertIn("81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35", source)
        self.assertIn("entry.previous_entry_sha256 !== custody.final_replay_tail_sha256", source)
        self.assertIn("prior_receipt_authorizes_next_transition:false", source)
        self.assertIn("historical_state_retroactively_authorized:false", source)
        self.assertIn("heartbeat_granted_authority:false", source)
        self.assertNotIn("WorkerCoordinator", source)
        self.assertNotIn("setInterval(", source)
        self.assertNotIn("setTimeout(", source)

    def test_frozen_sv002_suite_cardinality_and_provenance_are_preserved(self):
        source = EXTENSION.read_text(encoding="utf-8")
        self.assertEqual(source.count('"AO-'), 12)
        self.assertIn("fba8beea98838bc16b4b2502c5a2ac363c72add3", source)
        self.assertIn('OPERATIVE_CONDITION = "v0.3 FROZEN"', source)
        self.assertIn('target_property_established:true', source)

    def test_sv002_runs_after_governed_custody_and_preserves_custody_on_failure(self):
        source = AUTO.read_text(encoding="utf-8")
        self.assertLess(source.index("executeMasterRecordsSv001Custody(cycleReceipt)"), source.index("continueToSv002(cycleReceipt, result)"))
        self.assertIn("PASS — MASTER RECORDS CUSTODY / SV002 CONTINUATION FAIL_CLOSED", source)
        self.assertIn("custody_state_preserved: true", source)
        self.assertIn("sv001_rerun_performed: false", source)


if __name__ == "__main__":
    unittest.main()
