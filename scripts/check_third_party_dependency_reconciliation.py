#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CUTOVER = ROOT / "data" / "third-party-runtime-cutover-current.json"
RECON = ROOT / "data" / "third-party-dependency-reconciliation-2026-09-09.json"


def die(message: str) -> None:
    raise SystemExit(f"THIRD_PARTY_DEPENDENCY_RECONCILIATION_FAIL: {message}")


def main() -> None:
    current = json.loads(CUTOVER.read_text(encoding="utf-8"))
    recon = json.loads(RECON.read_text(encoding="utf-8"))

    if recon.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        die("wrong goal binding")
    if recon.get("cosv_id") != "50000000102000":
        die("wrong COSV binding")
    if current.get("canonical_runtime") != "RESIDENT_STEGVERSE":
        die("cutover does not declare resident canonical runtime")
    if recon.get("canonical_runtime") != current.get("canonical_runtime"):
        die("reconciliation/cutover canonical runtime mismatch")
    for key in (
        "production_continuity_third_party_dependency",
        "activation_third_party_dependency",
        "automatic_third_party_runtime_selection",
    ):
        if current.get(key) is not False or recon.get(key) is not False:
            die(f"{key} must be false in both records")

    current_states = current.get("provider_states", {})
    recon_states = recon.get("reconciled_provider_states", {})
    quick_current = current_states.get("cloudflare_quick_tunnel", {})
    quick_recon = recon_states.get("cloudflare_quick_tunnel", {})
    if quick_current.get("required") is not False:
        die("cutover still marks Cloudflare quick tunnel required")
    if quick_current.get("canonical_runtime_carrier") is not False:
        die("cutover still marks Cloudflare quick tunnel canonical")
    if quick_recon.get("current_required_use") is not False:
        die("reconciliation still marks Cloudflare quick tunnel required")
    if quick_recon.get("canonical_runtime_carrier") is not False:
        die("reconciliation still marks Cloudflare quick tunnel canonical")
    if quick_recon.get("automatic_selection") is not False:
        die("reconciliation permits automatic Cloudflare quick tunnel selection")

    gh_current = current_states.get("github_actions_runtime", {})
    gh_recon = recon_states.get("github_actions_runtime", {})
    if gh_current.get("required") is not False or gh_recon.get("current_required_use") is not False:
        die("GitHub Actions is still required as runtime")
    if gh_current.get("runtime_authority") != "NONE" or gh_recon.get("runtime_authority") != "NONE":
        die("GitHub Actions runtime authority is not NONE")

    source_merges = recon.get("source_merges", {})
    if source_merges.get("primary_hosted_carrier_retirement") != quick_current.get("stegcore_primary_hosted_carrier_retirement_merge"):
        die("primary hosted carrier retirement merge mismatch")
    if source_merges.get("fallback_hosted_carrier_retirement") != quick_current.get("stegcore_fallback_hosted_carrier_retirement_merge"):
        die("fallback hosted carrier retirement merge mismatch")

    print("THIRD_PARTY_DEPENDENCY_RECONCILIATION_PASS")
    print("STEGGATE_CANONICAL_RUNTIME=RESIDENT_STEGVERSE")
    print("STEGGATE_CLOUDFLARE_QUICK_TUNNEL_REQUIRED=false")
    print("SITE_GITHUB_ACTIONS_RUNTIME_REQUIRED=false")


if __name__ == "__main__":
    main()
