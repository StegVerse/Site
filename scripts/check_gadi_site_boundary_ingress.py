#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "data" / "gadi-site-boundary-ingress-contract.json"
WORKER = ROOT / "src" / "worker.js"
HANDOFF = ROOT / "docs" / "GADI_SITE_MIRROR_HANDOFF.md"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    contract = json.loads(CONTRACT.read_text())
    worker = WORKER.read_text()
    handoff = HANDOFF.read_text()

    require(contract["schema_version"] == "stegverse.gadi-site-boundary-ingress/v1", "schema drift")
    require(contract["goal_task_id"] == "GADI-001", "goal drift")
    require(contract["task_id"] == "GADI-001", "task drift")
    require(contract["cosv_id"] == "10100000100000", "COSV drift")

    source = contract["stegos_boundary_source"]
    require(source["repository"] == "StegVerse-Labs/StegOS", "StegOS owner drift")
    require(source["pull_request"] == 227, "StegOS PR drift")
    require(source["merge_commit"] == "d0a9703725c6169f23ab55d4bce8a0b035a3a450", "StegOS merge drift")

    binding = contract["site_binding"]
    require(binding["existing_readiness_path"] == "/api/hil/readiness", "readiness path drift")
    require(binding["existing_probe_path"] == "/api/hil/probes", "probe path drift")
    require(all(binding[key] is False for key in (
        "creates_parallel_receiver",
        "creates_parallel_evaluator",
        "creates_parallel_intr_authority",
        "creates_parallel_credential_authority",
        "creates_parallel_runtime",
    )), "parallel authority/runtime introduced")

    require("url.pathname === '/api/hil/readiness'" in worker, "existing HIL readiness surface missing")
    require("url.pathname === '/api/hil/probes'" in worker, "existing HIL probe surface missing")

    required = set(contract["required_external_ai_observation_fields"])
    require(required == {
        "interaction_id",
        "requested_target",
        "requested_action",
        "authenticated",
        "authority_established",
        "expected_scope_match",
        "consequential",
        "observed_semantic_integrity",
    }, "boundary observation field set drift")

    require(contract["accepted_semantic_integrity_states"] == [
        "PASS", "DRIFT", "MATERIAL_DRIFT", "UNOBSERVABLE"
    ], "semantic integrity vocabulary drift")

    require(contract["boundary_path"] == [
        "EXTERNAL_AI",
        "STEGOS_BOUNDARY_OBSERVATION",
        "GADI_ASSESSMENT",
        "INTR_ADMISSION",
        "PROTECTED_GOVERNED_ENVIRONMENT",
    ], "boundary order drift")

    authority = contract["authority"]
    require(authority["site_authority_effect"] == "NONE_INGRESS_PROJECTION_ONLY", "Site authority widened")
    require(authority["consequential_defensive_effect_requires_intr_admission"] is True, "InTr requirement removed")
    require(authority["capability_authority"] == "TV/TVC", "capability authority drift")

    claims = contract["product_claim_boundary"]
    require(claims["organization_controlled_boundary_layer"] is True, "organization boundary claim missing")
    require(claims["absolute_safety_guarantee"] is False, "absolute safety guarantee introduced")
    require(claims["network_placement_proven_by_source"] is False, "source promoted to network placement")
    require(claims["external_ai_ingress_proven_by_source"] is False, "source promoted to ingress proof")
    require(claims["gadi_activation_proven_by_source"] is False, "source promoted to activation proof")

    require("STATUS: `NOT_RETIRED" in handoff, "nonterminal canonical status missing")
    require("ARCHIVE_READY: `false`" in handoff, "archive boundary missing")

    print("GADI Site boundary ingress contract: PASS")


if __name__ == "__main__":
    main()
