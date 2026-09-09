#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
projection = json.loads((ROOT / "data/erl-kv-provider-proof-projection.json").read_text(encoding="utf-8"))
assert projection["schema"] == "stegverse.erl-kv-provider-proof-projection/v1"
assert projection["task_id"] == "SS-ERL-KV-PROPAGATION-VERIFICATION-001"
assert projection["consumer"]["repository"] == "StegVerse-Labs/Site"
assert projection["consumer"]["applicability"] == "UPDATE_REQUIRED"
assert projection["consumer"]["role"] == "MYKV_ERL_AND_STEGSOCIALS_PREPARATION_PROJECTION"
assert projection["upstream"]["erl_integration_commit"] == "722a11cf2ada6205a31e3678d489254fb736e8f7"
assert projection["upstream"]["master_records_custody_commit"] == "3e1bc4f2f98bde1932261c2ce96ca42fa9952a19"
assert projection["upstream"]["provider_operation_receipt_sha256"] == "bb74904fcd8169829c78bdc1c0d64905b33243c2c22852565c13e614abcd1fa8"
assert all(projection["proof"].values())
assert not any(projection["nonclaims"].values())
assert projection["authority_effect"] == "NONE_REFERENCE_ONLY"
for rel in ("README.md", "docs/ERL_KV_PROVIDER_PROOF_SITE_PROJECTION_MIRROR_HANDOFF.md"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    assert "SS-ERL-KV-PROPAGATION-VERIFICATION-001" in text
    assert "bb74904fcd8169829c78bdc1c0d64905b33243c2c22852565c13e614abcd1fa8" in text
print("ERL KV PROVIDER PROOF SITE PROJECTION: PASS")
