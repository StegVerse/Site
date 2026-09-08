from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTO = ROOT / "stegos-bootstrap" / "master-records-auto-recovery.js"
BOOTSTRAP = ROOT / "stegos-bootstrap" / "stegos-bootstrap.js"
RUNTIME = ROOT / "stegos-bootstrap" / "service-worker-v13-runtime.js"


class Sv001GovernedEvidenceAutoRetentionTests(unittest.TestCase):
    def test_auto_recovery_requires_export_after_governed_pass(self) -> None:
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn("executeMasterRecordsSv001Custody(cycleReceipt)", text)
        self.assertIn("root.StegOSWebBootstrap.exportEvidence()", text)
        self.assertIn("validateGovernedEvidenceBundle(bundle, result)", text)
        self.assertLess(text.index("executeMasterRecordsSv001Custody(cycleReceipt)"), text.index("root.StegOSWebBootstrap.exportEvidence()"))

    def test_retention_requires_exact_current_intr_and_master_records_chain(self) -> None:
        text = AUTO.read_text(encoding="utf-8")
        for marker in (
            'var INTR_SCHEMA = "stegverse.master-records.sv001-custody-intr-admission/v1"',
            'var CUSTODY_SCHEMA = "stegverse.master-records.stegverse001-bounded-autonomy-custody/v1"',
            'var RECONSTRUCTION_SCHEMA = "stegverse.master-records.stegverse001-bounded-autonomy-reconstruction/v1"',
            'a.governance_decision !== "ALLOW"',
            'a.current_governance_decision_observed !== true',
            'a.prior_receipt_authorizes_transition !== false',
            'admission.entry_sha256 !== result.intr_admission_journal_entry_sha256',
            'custody.entry_sha256 !== result.custody_journal_entry_sha256',
            'reconstruction.entry_sha256 !== result.reconstruction_journal_entry_sha256',
            'bundle.journal_replay.tail_sha256 !== result.final_replay_tail_sha256',
        ):
            self.assertIn(marker, text)

    def test_transition_success_is_not_visible_when_evidence_retention_fails(self) -> None:
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn("TRANSITION_OCCURRED_RECEIPT_RETENTION_FAILED", text)
        self.assertIn('terminal_success_visible: false', text)
        self.assertIn('custody_executed: true', text)
        self.assertIn('retry_action: "RETAIN_EXISTING_GOVERNED_RECEIPTS_WITHOUT_REEXECUTING_CUSTODY"', text)

    def test_retention_never_grants_authority(self) -> None:
        text = AUTO.read_text(encoding="utf-8")
        self.assertIn('evidence_retention_grants_authority: false', text)
        self.assertIn('authority_effect: "NONE_EVIDENCE_RETENTION_ONLY"', text)
        self.assertIn('human_approval_required: false', text)
        self.assertIn('prior_receipt_authorizes_transition: false', text)

    def test_existing_export_surface_contains_full_receipt_rows_and_replay(self) -> None:
        bootstrap = BOOTSTRAP.read_text(encoding="utf-8")
        self.assertIn('schema: "stegos.web_bootstrap_evidence_bundle.v1"', bootstrap)
        self.assertIn('journal_replay: replay', bootstrap)
        self.assertIn('receipts: rows', bootstrap)

    def test_runtime_persists_admission_before_custody_and_reconstruction(self) -> None:
        runtime = RUNTIME.read_text(encoding="utf-8")
        admission = runtime.index("return appendReceipt(admission);")
        custody = runtime.index("return appendReceipt(result.custody);")
        reconstruction = runtime.index("return appendReceipt(result.reconstruction);")
        self.assertLess(admission, custody)
        self.assertLess(custody, reconstruction)
        self.assertIn("retroactive authorization forbidden", runtime)


if __name__ == "__main__":
    unittest.main()
