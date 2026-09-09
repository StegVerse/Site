#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CUTOVER = ROOT / "data" / "third-party-runtime-cutover-current.json"
RECON = ROOT / "data" / "third-party-dependency-reconciliation-2026-09-09.json"
INVENTORY = ROOT / "data" / "third-party-dependency-inventory.json"
SUPERSESSION = ROOT / "data" / "third-party-dependency-inventory-supersession.json"


def die(message: str) -> None:
    raise SystemExit(f"THIRD_PARTY_DEPENDENCY_RECONCILIATION_FAIL: {message}")


def provider_by_id(inventory: dict, provider_id: str) -> dict:
    for node in inventory.get("providers", []):
        if node.get("id") == provider_id:
            return node
    die(f"legacy inventory provider missing: {provider_id}")
    raise AssertionError


def main() -> None:
    current = json.loads(CUTOVER.read_text(encoding="utf-8"))
    recon = json.loads(RECON.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    supersession = json.loads(SUPERSESSION.read_text(encoding="utf-8"))

    if recon.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        die("wrong goal binding")
    if recon.get("cosv_id") != "50000000102000":
        die("wrong COSV binding")
    if supersession.get("goal_id") != recon.get("goal_id") or supersession.get("cosv_id") != recon.get("cosv_id"):
        die("supersession metadata goal/COSV mismatch")
    if supersession.get("legacy_inventory") != "data/third-party-dependency-inventory.json":
        die("supersession metadata does not bind legacy inventory")
    if supersession.get("current_runtime_source") != "data/third-party-runtime-cutover-current.json":
        die("supersession metadata does not bind current runtime source")
    if supersession.get("reconciliation_source") != "data/third-party-dependency-reconciliation-2026-09-09.json":
        die("supersession metadata does not bind reconciliation source")
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

    entries = supersession.get("entries", {})
    render_old = provider_by_id(inventory, "render-ecosystem-chat-gateway")
    render_meta = entries.get("render-ecosystem-chat-gateway", {})
    if render_meta.get("legacy_observation_classification") != render_old.get("classification"):
        die("Render legacy classification supersession mismatch")
    if render_meta.get("legacy_observation_current_required_use") != render_old.get("current_required_use"):
        die("Render legacy required-use supersession mismatch")
    if render_meta.get("temporal_class") != "HISTORICAL_SUPERSEDED":
        die("Render legacy observation is not visibly superseded")
    if render_meta.get("current_required_use") is not False:
        die("Render supersession still marks current runtime required")
    if render_meta.get("superseded_by") != "data/third-party-runtime-cutover-current.json#provider_states.render":
        die("Render supersession target mismatch")
    if render_meta.get("provenance_retained") is not True:
        die("Render provenance retention not asserted")
    if current_states.get("render", {}).get("required") is not False:
        die("current cutover still marks Render required")

    tunnel_old = provider_by_id(inventory, "cloudflare-tunnel-steggate")
    tunnel_meta = entries.get("cloudflare-tunnel-steggate", {})
    if tunnel_meta.get("legacy_observation_classification") != tunnel_old.get("classification"):
        die("Cloudflare tunnel legacy classification supersession mismatch")
    if tunnel_meta.get("legacy_observation_current_required_use") != tunnel_old.get("current_required_use"):
        die("Cloudflare tunnel legacy required-use supersession mismatch")
    if tunnel_meta.get("temporal_class") != "HISTORICAL_SUPERSEDED":
        die("Cloudflare tunnel legacy observation is not visibly superseded")
    if tunnel_meta.get("current_required_use") is not False or tunnel_meta.get("canonical_runtime_carrier") is not False:
        die("Cloudflare tunnel supersession still marks current/canonical runtime")
    if tunnel_meta.get("superseded_by") != "data/third-party-runtime-cutover-current.json#provider_states.cloudflare_quick_tunnel":
        die("Cloudflare tunnel supersession target mismatch")
    if tunnel_meta.get("source_retirement_merges") != [
        "084477a684193ad1b45d4403aa57844c5135638e",
        "07632a7dcbd12d16440322f33269a51413fa3049",
    ]:
        die("Cloudflare tunnel supersession retirement merge binding mismatch")
    if tunnel_meta.get("provenance_retained") is not True:
        die("Cloudflare tunnel provenance retention not asserted")

    print("THIRD_PARTY_DEPENDENCY_RECONCILIATION_PASS")
    print("LEGACY_INVENTORY_SUPERSESSION=PASS")
    print("RENDER_LEGACY_OBSERVATION=HISTORICAL_SUPERSEDED")
    print("CLOUDFLARE_TUNNEL_LEGACY_OBSERVATION=HISTORICAL_SUPERSEDED")
    print("STEGGATE_CANONICAL_RUNTIME=RESIDENT_STEGVERSE")
    print("STEGGATE_CLOUDFLARE_QUICK_TUNNEL_REQUIRED=false")
    print("SITE_GITHUB_ACTIONS_RUNTIME_REQUIRED=false")


if __name__ == "__main__":
    main()
