import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTO = ROOT / "stegos-node" / "org-allocator-bootstrap-auto.html"
SW = ROOT / "stegos-node" / "service-worker.js"


class IPhoneOrgAllocatorAutoExecutionTests(unittest.TestCase):
    def test_auto_entry_uses_exact_current_source_binding(self):
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn('EXPECTED_TASK="TASK-2026-0010"', text)
        self.assertIn('EXPECTED_TASK_BLOB="248bed8cf5428c3ba759ee0d34db5fec8949a835"', text)
        self.assertIn('task_0010_git_blob_sha!==EXPECTED_TASK_BLOB', text)
        self.assertIn('ORG_ALLOCATOR_RELEASE="g6-auto-20260909-1"', text)

    def test_auto_execution_previews_with_canonical_allocator_before_real_cas(self):
        text = AUTO.read_text(encoding="utf-8")
        preview = text.index("previewStore(existing)")
        preview_allocate = text.index("StegVersePortableOrgClaimAllocator.allocate(pkg,preview.store", preview)
        blocker_check = text.index("blocked_missing_dependency_declaration.length!==0", preview_allocate)
        queue_check = text.index("receipt.queued.length!==1", blocker_check)
        selected_check = text.index("receipt.selected!==EXPECTED_TASK", queue_check)
        generation_check = text.index("receipt.claim_registry_generation!==beforeGeneration+1", selected_check)
        real_allocate = text.index("StegVersePortableOrgClaimAllocator.allocate(pkg,allocStore()", generation_check)
        self.assertLess(preview_allocate, blocker_check)
        self.assertLess(blocker_check, queue_check)
        self.assertLess(queue_check, selected_check)
        self.assertLess(selected_check, generation_check)
        self.assertLess(generation_check, real_allocate)

    def test_auto_execution_requires_retained_state_and_never_resets_it(self):
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn('if(!existing)throw Error("retained allocator state required for auto-execution")', text)
        self.assertNotIn("deleteDatabase", text)
        self.assertNotIn("indexedDB.deleteDatabase", text)
        self.assertNotIn("initialState(pkg)", text)

    def test_auto_execution_is_not_bound_to_manual_run_control(self):
        text = AUTO.read_text(encoding="utf-8")
        self.assertNotIn('id="run"', text)
        self.assertNotIn('run.addEventListener("click",execute)', text)
        self.assertIn("Promise.all([loadPackage(),loadContinuity()]).then(verifyAndAutoExecute).then(retainEvidence).catch(failClosed);", text)
        self.assertIn('execution_trigger:"VERIFIED_AUTO_EXECUTION"', text)

    def test_fail_closed_surface_records_no_mutation_claim(self):
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn('stateEl.textContent="FAIL_CLOSED: "+e.message', text)
        self.assertIn('mutation_performed:false', text)
        self.assertIn('authority_effect:"NONE_EVIDENCE_ONLY"', text)

    def test_auto_entry_and_allocator_inputs_are_network_only(self):
        sw = SW.read_text(encoding="utf-8")
        self.assertIn('"/stegos-node/org-allocator-bootstrap-auto.html": true', sw)
        self.assertIn('"/stegos-node/org-allocator-portable.js": true', sw)
        self.assertIn('"/stegos-node/org-allocator-current-iphone-package.json": true', sw)
        self.assertIn('fetch(event.request, {cache: "no-store"})', sw)


if __name__ == "__main__":
    unittest.main()
