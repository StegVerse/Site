from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "check_hil_intr_node_sync",
    ROOT / "scripts/check_hil_intr_node_sync.py",
)
assert SPEC and SPEC.loader
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class HILInTrNodeSyncTests(unittest.TestCase):
    def test_repository_source_contract_passes(self) -> None:
        markers = mod.validate(ROOT)
        self.assertIn("STEGOS_NODE_HIL_INTR_SYNC_SOURCE_PASS", markers)
        self.assertIn("STEGOS_NODE_HIL_INTR_SYNC_TARGET_FAIL_CLOSED_PASS", markers)
        self.assertIn("STEGOS_NODE_HIL_INTR_SYNC_NO_EXECUTION_AUTHORITY_PASS", markers)

    def test_default_target_cannot_claim_unobserved_runtime(self) -> None:
        with self.assertRaisesRegex(mod.HILInTrNodeSyncError, "target_ingress_url_mismatch"):
            mod.validate_target_projection({
                "schema": "stegos.site.hil_intr_sync_target.v1",
                "state": "AWAITING_SOVEREIGN_INTR_INGRESS",
                "transport_origin": "STEGOS_NODE_OUTBOX",
                "ingress_url": "https://example.invalid/intr/materialization",
                "runtime_ingress_observed": False,
                "credential_authority": "TV/TVC",
                "credential_requirement": "NONE",
                "github_token_runtime_authority": "NONE",
                "execution_authority": "NONE",
                "authority_effect": "NONE_DISCOVERY_ONLY",
            })

    def test_default_target_cannot_claim_runtime_observed(self) -> None:
        with self.assertRaisesRegex(mod.HILInTrNodeSyncError, "target_runtime_ingress_observed_mismatch"):
            mod.validate_target_projection({
                "schema": "stegos.site.hil_intr_sync_target.v1",
                "state": "AWAITING_SOVEREIGN_INTR_INGRESS",
                "transport_origin": "STEGOS_NODE_OUTBOX",
                "ingress_url": None,
                "runtime_ingress_observed": True,
                "credential_authority": "TV/TVC",
                "credential_requirement": "NONE",
                "github_token_runtime_authority": "NONE",
                "execution_authority": "NONE",
                "authority_effect": "NONE_DISCOVERY_ONLY",
            })

    def test_device_local_hil_profile_precedes_static_fallback(self) -> None:
        sync = (ROOT / "stegos-node/hil-intr-sync.js").read_text(encoding="utf-8")
        worker = (ROOT / "intr-service-worker.js").read_text(encoding="utf-8")
        self.assertIn('navigator.serviceWorker.register("/intr-service-worker.js", { scope: "/" })', sync)
        self.assertIn('fetch("/intr/profile"', sync)
        self.assertIn('profile.profiles.indexOf("HIL:Ingress")', sync)
        self.assertIn('return loadDeviceLocalTarget().catch(loadRemoteTarget);', sync)
        self.assertIn('profiles:["KV:KnowledgeVaultInterlock","HIL:Ingress","MasterRecords:SV001Custody"]', worker)
        self.assertIn('HIL_INGRESS_SCHEMA="stegverse.hil-intr-materialization-ingress/v1"', worker)
        self.assertIn('HIL_OWNER="StegVerse-Labs/.github#246"', worker)

    def test_same_device_hil_ingress_is_not_network_sync(self) -> None:
        sync = (ROOT / "stegos-node/hil-intr-sync.js").read_text(encoding="utf-8")
        worker = (ROOT / "intr-service-worker.js").read_text(encoding="utf-8")
        self.assertIn('local_ingress_observed: localIngress === true', sync)
        self.assertIn('network_delivery_observed: localIngress !== true', sync)
        self.assertIn('recordLocalIngress', sync)
        self.assertIn('stegos.node_hil_local_intr_admission.v1', sync)
        self.assertIn('local_ingress_observed:true,network_delivery_observed:false', worker)
        self.assertIn('runtime_execution_attempted:false', worker)
        self.assertIn('receiver_readiness_claimed:false', worker)
        self.assertIn('hil_custody_claimed:false', worker)

    def test_outbox_status_distinguishes_local_external_and_awaiting(self) -> None:
        sync = (ROOT / "stegos-node/hil-intr-sync.js").read_text(encoding="utf-8")
        self.assertIn('result.local_admitted += 1', sync)
        self.assertIn('result.external_delivered += 1', sync)
        self.assertIn('result.awaiting_ingress = Math.max(0, result.total - result.local_admitted - result.external_delivered)', sync)
        self.assertIn('" admitted locally · "', sync)
        self.assertIn('" delivered externally · "', sync)
        self.assertIn('" awaiting ingress · downstream consumption not claimed"', sync)
        self.assertNotIn('" ingress admitted" + (result.device_local ? " locally" : "")', sync)


if __name__ == "__main__":
    unittest.main()
