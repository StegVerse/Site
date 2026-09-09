#!/usr/bin/env python3
"""Validate the first externally supplied Conectrr ITC without overstating assurance."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "data/conectrr-itc/ITC-REAL-001.canonical.json"

REQUIRED = {
    "itc_version",
    "itc_record_metadata",
    "intent",
    "criteria",
    "constraints",
    "recommendation",
    "match_reasoning",
    "evidence_references",
    "alternatives_considered",
    "confidence",
    "uncertainties",
    "unresolved_dependencies",
    "provenance",
}
FORBIDDEN_KEY_PARTS = (
    "consent_granted",
    "authority_granted",
    "admissibility_decision",
    "commitment_created",
    "execution_authorized",
    "governance_decision",
)


def walk_keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)


def main() -> int:
    packet = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    itc = packet["itc"]
    errors: list[str] = []
    warnings: list[str] = []

    missing = REQUIRED - set(itc)
    if missing:
        errors.append(f"missing top-level ITC sections: {sorted(missing)}")

    for key in walk_keys(itc):
        lowered = key.lower()
        if any(part in lowered for part in FORBIDDEN_KEY_PARTS):
            errors.append(f"later-stage authority state appears in key: {key}")

    weights = itc.get("criteria", {}).get("dimension_weights", {})
    if weights and abs(sum(weights.values()) - 1.0) > 1e-9:
        errors.append("dimension weights do not sum to 1.0")

    constraints = itc.get("constraints", {})
    if all(value in (None, {}, []) for value in constraints.values()):
        warnings.append("constraint reconstruction not established: all constraint values are empty")

    result_ref = itc.get("recommendation", {}).get("result_reference", "")
    if not result_ref or result_ref.endswith("/") or " " in result_ref:
        warnings.append("recommendation result_reference is malformed, truncated, or content-bearing")

    evidence = itc.get("evidence_references", [])
    if not evidence or all(item.get("evidence_type") == "internal" for item in evidence):
        warnings.append("evidence is not independently resolvable")

    ranking = itc.get("match_reasoning", {}).get("ranking_context", "")
    alternatives = itc.get("alternatives_considered", [])
    if "Evaluated 111 candidates" in ranking and not alternatives:
        warnings.append("alternatives existed but were not preserved")

    metadata_spec = itc.get("itc_record_metadata", {}).get("specification_version")
    provenance_spec = itc.get("provenance", {}).get("itc_specification_version")
    if metadata_spec != provenance_spec:
        warnings.append("specification version fields conflict")

    text = json.dumps(itc, ensure_ascii=False)
    if "Ã" in text or "â€”" in text:
        warnings.append("source contains Unicode mojibake")

    disclosures = packet.get("source_disclosures", {})
    if disclosures.get("immutability") != "SIMULATED_MVP":
        errors.append("immutability posture must remain explicitly bounded")
    if disclosures.get("cryptographic_signing") is not False:
        errors.append("cryptographic signing must not be inferred")
    if packet.get("independently_reproduced") is not False:
        errors.append("independent reproduction must remain false")

    if errors:
        print("CONECTRR_REAL_ITC_BOUNDARY=FAIL")
        for error in errors:
            print(f"ERROR: {error}")
        for warning in warnings:
            print(f"WARNING: {warning}")
        return 1

    print("CONECTRR_REAL_ITC_BOUNDARY=DEFER")
    print("schema_shape=PASS")
    print("overreach_check=PASS_PRELIMINARY")
    print("reconstructability=PARTIAL")
    print("immutability=NOT_ESTABLISHED")
    print("minimality=NOT_TESTED")
    for warning in warnings:
        print(f"WARNING: {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
