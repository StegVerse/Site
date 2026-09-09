#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "stegos-bootstrap" / "index.html"
HELPER = ROOT / "stegos-bootstrap" / "persistent-card-ux.js"
RECOVERY = ROOT / "stegos-bootstrap" / "master-records-sv001-recovery.js"
AUTO_RECOVERY = ROOT / "stegos-bootstrap" / "master-records-auto-recovery.js"
PACKAGE = ROOT / "stegos-bootstrap" / "master-records-sv001-custody-package.json"
HANDOFF = ROOT / "docs" / "STEGOS_PERSISTENT_CARD_UX_MIRROR_HANDOFF.md"
PROPAGATION = ROOT / "docs" / "STEGOS_V15_CONFIGURED_RENDEZVOUS_PROPAGATION.md"
HELP = ROOT / "stegos-bootstrap" / "help"
SERVICE_WORKER = ROOT / "stegos-bootstrap" / "service-worker.js"
SERVICE_WORKER_PREDECESSOR = ROOT / "stegos-bootstrap" / "service-worker-v13-runtime.js"
README = ROOT / "README.md"

required_help = {
    "authority-boundary.html",
    "interaction-coordinator.html",
    "runtime-capability.html",
    "node.html",
    "ecosystem-chat.html",
    "canonical-inference-evidence.html",
    "admitted-inference.html",
    "sv001-bounded-autonomy.html",
    "master-records-sv001.html",
    "continuity.html",
    "offline-shell.html",
}

index = INDEX.read_text(encoding="utf-8")
helper = HELPER.read_text(encoding="utf-8")
recovery = RECOVERY.read_text(encoding="utf-8")
auto_recovery = AUTO_RECOVERY.read_text(encoding="utf-8")
package = PACKAGE.read_text(encoding="utf-8")
handoff = HANDOFF.read_text(encoding="utf-8")
propagation = PROPAGATION.read_text(encoding="utf-8")
service_worker = SERVICE_WORKER.read_text(encoding="utf-8")
predecessor = SERVICE_WORKER_PREDECESSOR.read_text(encoding="utf-8")
readme = README.read_text(encoding="utf-8")
readme_normalized = " ".join(readme.lower().split())

required_shell_assets = {
    "./persistent-card-ux.js",
    "./master-records-sv001-recovery.js",
    "./master-records-auto-recovery.js",
} | {"./help/" + name for name in required_help}

target = "81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35"

checks = {
    "helper loaded": 'src="./persistent-card-ux.js"' in index,
    "canonical recovery loaded": 'src="./master-records-sv001-recovery.js"' in index,
    "automatic recovery carrier loaded": 'src="./master-records-auto-recovery.js"' in index,
    "SV001 history-first state": "CHECKING_DEVICE_HISTORY" in index,
    "Master Records same-device proof state": "CHECKING_SAME_DEVICE_PROOF" in index,
    "SV001 rerun guard": "SV001 is already terminal on this device. Rerun is prohibited." in index,
    "same-device snapshot schema": "stegos.same-device-card-snapshot/v1" in helper,
    "green completed border": "#2fbf71" in helper and "card-complete" in helper,
    "red incomplete border": "#d94b4b" in helper and "card-incomplete" in helper,
    "copy text control": 'button.textContent = "Copy Text"' in helper,
    "card help links": "Purpose / remediation / troubleshooting" in helper,
    "terminal SV001 discovery": "scanTerminalSv001" in helper,
    "same-device proof discovery": "findStoredSv001Proof" in helper,
    "authority effect none": 'authority_effect: "NONE"' in helper,
    "handoff present": "SITE-STEGOS-PERSISTENT-CARD-UX-1000" in handoff,
    "help pages complete": required_help.issubset({p.name for p in HELP.glob("*.html")}),
    "offline shell wrapper generation v15": 'CACHE_NAME = "stegos-web-bootstrap-v15";' in service_worker,
    "v15 wrapper imports exact v13 predecessor": 'importScripts("./service-worker-v13-runtime.js")' in service_worker,
    "v13 predecessor retained": 'var CACHE_NAME = "stegos-web-bootstrap-v13";' in predecessor,
    "persistent helper explicitly cached": '"./persistent-card-ux.js"' in predecessor,
    "canonical recovery explicitly cached": '"./master-records-sv001-recovery.js"' in predecessor,
    "automatic recovery explicitly cached": '"./master-records-auto-recovery.js"' in predecessor,
    "all help routes explicitly cached": all(('"./help/' + name + '"') in predecessor for name in required_help),
    "canonical G23 recovery target": target in package and target in auto_recovery,
    "canonical G23 claim fence": "SHWP-SHWP-STEGVERSE001-BOUNDED-AUTONOMY-RUNTIME-001-G23" in package and '"target_fencing_token": 23' in package,
    "unique hash verified recovery": "RECOVERED_HASH_VERIFIED" in recovery and "unique_match_count: 1" in recovery,
    "automatic continuation uses existing governed executor": "StegOSWebBootstrap.executeMasterRecordsSv001Custody" in auto_recovery,
    "exact retained proof auto-continues": "EXACT_RETAINED_SAME_DEVICE_PROOF" in auto_recovery and "continueToGovernedCustody(retainedCycle" in auto_recovery,
    "recovered G23 auto-continues": "CANONICAL_RETAINED_JOURNAL_RECOVERY" in auto_recovery and "continueToGovernedCustody(recoveredCycle" in auto_recovery,
    "recovery remains non-authorizing": "successful_recovery_authorizes_transition: false" in auto_recovery and "prior_receipt_authorizes_transition: false" in auto_recovery,
    "fresh governance remains required": "current_root_intr_governance_required: true" in auto_recovery,
    "machine governance failure stays fail closed": "EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED" in auto_recovery,
    "no new scheduler": 'newSchedulerCreated: false' in auto_recovery and 'retry_surface: "EXISTING_PAGE_RESUME_LIFECYCLE_ONLY"' in auto_recovery,
    "manual fallback remains fail closed": "Manual exact-proof import remains a fail-closed fallback. SV001 must not be rerun." in auto_recovery,
    "root InTr custody gate preserved": "contemporaneous InTr admission required before Master Records custody" in predecessor,
    "historical retroactive authorization prohibited": "retroactive authorization forbidden" in predecessor,
    "v15 configured rendezvous propagation documented": "stegos-web-bootstrap-v15" in propagation and "configured" in propagation.lower() and "resident-rendezvous" in propagation,
    "v15 propagation remains non-authorizing": "fresh root-InTr admission remains required before custody" in propagation and "SV001 rerun remains prohibited" in propagation,
    "README preserves non-authority boundary": "recovery does not grant custody authority" in readme_normalized and "source/ci/merge" in readme_normalized,
}

failed = [name for name, passed in checks.items() if not passed]
for name, passed in checks.items():
    print(("PASS" if passed else "FAIL") + " - " + name)

for asset in sorted(required_shell_assets):
    if ('"' + asset + '"') not in predecessor:
        failed.append("explicit shell asset missing: " + asset)

if failed:
    raise SystemExit("FAIL: " + ", ".join(sorted(set(failed))))

print("PASS - StegOS persistent same-device card UX, canonical G23 recovery, automatic current-governance continuation, and v15 configured-rendezvous propagation contract")
