import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "stegos-node" / "index.html"
AUTO = ROOT / "stegos-node" / "org-allocator-bootstrap-auto.html"
SW = ROOT / "stegos-node" / "service-worker.js"


class StegOSNodeAllocatorAutoCarrierTests(unittest.TestCase):
    def test_normal_node_starts_carrier_only_after_registered_state(self):
        text = INDEX.read_text(encoding="utf-8")
        self.assertIn('if (allocatorCarrierStarted || stateNode.textContent !== "REGISTERED") return;', text)
        self.assertIn('if (registered) {', text)
        self.assertIn('startVerifiedAllocatorCarrier();', text)
        self.assertLess(text.index('if (registered) {'), text.index('startVerifiedAllocatorCarrier();', text.index('if (registered) {')))

    def test_carrier_is_one_shot_same_origin_existing_auto_entry(self):
        text = INDEX.read_text(encoding="utf-8")
        self.assertIn('var allocatorCarrierStarted = false;', text)
        self.assertIn('allocatorCarrierStarted = true;', text)
        self.assertIn('document.createElement("iframe")', text)
        self.assertIn('carrier.src = "./org-allocator-bootstrap-auto.html?v=normal-node-carrier-20260909-1";', text)
        self.assertNotIn('https://', text[text.index('function startVerifiedAllocatorCarrier()'):text.index('function refreshRegistrationActions()')])

    def test_normal_node_does_not_duplicate_allocator_or_reset_state(self):
        text = INDEX.read_text(encoding="utf-8")
        carrier = text[text.index('function startVerifiedAllocatorCarrier()'):text.index('function refreshRegistrationActions()')]
        self.assertNotIn('StegVersePortableOrgClaimAllocator.allocate', carrier)
        self.assertNotIn('indexedDB.deleteDatabase', carrier)
        self.assertNotIn('deleteDatabase', carrier)
        self.assertNotIn('Run canonical allocation', text)

    def test_existing_verified_auto_entry_retains_canonical_predicates(self):
        auto = AUTO.read_text(encoding="utf-8")
        self.assertIn('EXPECTED_TASK="TASK-2026-0010"', auto)
        self.assertIn('EXPECTED_TASK_BLOB="248bed8cf5428c3ba759ee0d34db5fec8949a835"', auto)
        self.assertIn('blocked_missing_dependency_declaration.length!==0', auto)
        self.assertIn('receipt.queued.length!==1', auto)
        self.assertIn('receipt.selected!==EXPECTED_TASK', auto)
        self.assertIn('execution_trigger:"VERIFIED_AUTO_EXECUTION"', auto)

    def test_auto_entry_remains_network_only(self):
        sw = SW.read_text(encoding="utf-8")
        self.assertIn('"/stegos-node/org-allocator-bootstrap-auto.html": true', sw)
        self.assertIn('"/stegos-node/org-allocator-portable.js": true', sw)
        self.assertIn('"/stegos-node/org-allocator-current-iphone-package.json": true', sw)


if __name__ == "__main__":
    unittest.main()
