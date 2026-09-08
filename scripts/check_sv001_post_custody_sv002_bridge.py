#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "stegos-bootstrap/service-worker.js"
EXTENSION = ROOT / "stegos-bootstrap/sv001-evidence-chain-continuation.js"
AUTO = ROOT / "stegos-bootstrap/master-records-auto-recovery.js"
README = ROOT / "README.md"
HANDOFF = ROOT / "docs/MR_SV001_CURRENT_IPHONE_CUSTODY_MIRROR_HANDOFF.md"
PREFLIGHT = ROOT / "data/preflight/sv001-post-custody-sv002-bridge-20260908.json"
CLAIM = ROOT / "data/session-work-claims.d/site-sv001-post-custody-sv002-bridge-20260908.json"

CANONICAL_G23 = "81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35"
FIXTURE_BLOB = "fba8beea98838bc16b4b2502c5a2ac363c72add3"


def require(ok: bool, message: str) -> None:
    if not ok:
        raise SystemExit("FAIL_CLOSED: " + message)


def main() -> int:
    wrapper = WRAPPER.read_text(encoding="utf-8")
    ext = EXTENSION.read_text(encoding="utf-8")
    auto = AUTO.read_text(encoding="utf-8")
    readme = README.read_text(encoding="utf-8")
    handoff = HANDOFF.read_text(encoding="utf-8")
    preflight = PREFLIGHT.read_text(encoding="utf-8")
    claim = CLAIM.read_text(encoding="utf-8")

    require('importScripts("./service-worker-v13-runtime.js", "./sv001-evidence-chain-continuation.js")' in wrapper,
            "v15 wrapper must reuse exact v13 runtime and import bounded continuation extension")
    require('CACHE_NAME = "stegos-web-bootstrap-v15"' in wrapper, "v15 propagation generation missing")
    require('CACHE_NAME = "stegos-web-bootstrap-v14"' not in wrapper, "stale v14 generation remains in active wrapper")

    for marker in (
        '/stegos-bootstrap/sv001-evidence-chain/continue',
        CANONICAL_G23,
        'EXTERNAL_WORKERCOORDINATOR_TVC_BOUND_ENVELOPE',
        'stegos.master-records.portable-sv001-custody-proof/v1',
        'intr_governance_admission_observed:true',
        'reconstruction_state:"PASS"',
        'canonical_owner:"master-records/orchestration"',
        'site_custody_authority:false',
        'site_execution_authority:false',
        'prior_receipt_authorizes_transition:false',
        'historical_state_retroactively_authorized:false',
        'entry.previous_entry_sha256 !== custody.final_replay_tail_sha256',
        'replay.tail_sha256 !== entry.entry_sha256',
        'existingContinuation()',
        FIXTURE_BLOB,
        'OPERATIVE_CONDITION = "v0.3 FROZEN"',
        'target_property_established:true',
        'authority_effect:"NONE_OBSERVATION_AND_DISPOSITION_ONLY"',
    ):
        require(marker in ext, f"continuation marker missing: {marker}")

    for case in range(1, 13):
        require(f"AO-{case:02d}_" in ext, f"frozen adversarial case AO-{case:02d} missing")
    require(ext.count('"AO-') == 12, "frozen adversarial case cardinality must remain exactly 12")
    require("WorkerCoordinator" not in ext, "continuation extension must not implement WorkerCoordinator")
    require("setInterval(" not in ext and "setTimeout(" not in ext, "continuation extension must not create a scheduler/timer")
    require("MasterRecords:SV001Custody" not in ext, "post-custody extension must not perform custody governance itself")

    custody_call = auto.index("executeMasterRecordsSv001Custody(cycleReceipt)")
    sv002_call = auto.index("continueToSv002(cycleReceipt, result)")
    require(custody_call < sv002_call, "SV002 continuation must occur only after governed custody execution")
    for marker in (
        'SV002_CONTINUATION_URL = "./sv001-evidence-chain/continue"',
        'PASS — MASTER RECORDS CUSTODY / SV002 DISPOSITION',
        'PASS — MASTER RECORDS CUSTODY / SV002 CONTINUATION FAIL_CLOSED',
        'custody_state_preserved: true',
        'sv001_rerun_performed: false',
        'prior_receipt_authorizes_next_transition: false',
        'postCustodySv002DispositionAutomatic: true',
    ):
        require(marker in auto, f"automatic continuation marker missing: {marker}")

    for text, description in (
        ("stegos-web-bootstrap-v15", "README v15 generation"),
        ("post-custody", "README post-custody semantics"),
        ("SV002", "README SV002 continuation"),
        ("same local journal", "README same-journal retention"),
        ("no filesystem export", "README no-filesystem-export boundary"),
    ):
        require(text.lower() in readme.lower(), f"{description} missing")

    for text in (
        "CURRENT_DEVICE_POST_CUSTODY_CONTINUATION_SEAM_MISSING",
        "stegos-web-bootstrap-v15",
        "sv001-evidence-chain-continuation.js",
        "SV002",
        "no filesystem export",
    ):
        require(text.lower() in handoff.lower() or text in preflight or text in claim,
                f"handoff/preflight/claim reconciliation marker missing: {text}")

    require('"satisfied_before_functional_merge": true' in preflight,
            "README completeness predicate not terminally satisfied")
    require('"readme_updated_in_change_set": true' in claim,
            "active claim does not record README completeness")

    print("SV001_POST_CUSTODY_SV002_BRIDGE_PASS")
    print("AUTHORITY_EFFECT=NONE_OBSERVATION_AND_DISPOSITION_ONLY")
    print("SV001_RERUN_PERFORMED=false")
    print("NEW_RUNTIME_CREATED=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
