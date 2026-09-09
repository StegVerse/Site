#!/usr/bin/env python3
"""Validate minimality evaluator responses without overstating evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ALLOWED_CLASSIFICATIONS = {
    "REQUIRED",
    "CONDITIONALLY_REQUIRED",
    "REDUNDANT",
    "OPTIONAL",
    "UNDETERMINED",
}


def fail(message: str) -> None:
    raise ValueError(message)


def validate(record: dict[str, Any]) -> None:
    required = {
        "evaluation_id",
        "fixture_id",
        "fixture_sha256",
        "evaluator_reference",
        "execution_class",
        "canonical_record_hidden_during_evaluation",
        "removed_element_hidden_during_evaluation",
        "answers",
        "inherited_limitations",
        "new_failures",
        "assumptions_used",
        "classification",
        "rationale",
        "independently_reproduced",
    }
    missing = sorted(required - record.keys())
    if missing:
        fail(f"missing required keys: {', '.join(missing)}")

    digest = record["fixture_sha256"]
    if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
        fail("fixture_sha256 must be a lowercase 64-character SHA-256 digest")

    classification = record["classification"]
    if classification not in ALLOWED_CLASSIFICATIONS:
        fail(f"invalid classification: {classification}")

    if classification == "CONDITIONALLY_REQUIRED" and not record.get("condition"):
        fail("CONDITIONALLY_REQUIRED requires an explicit condition")

    execution_class = record["execution_class"]
    reproduced = record["independently_reproduced"]
    if execution_class == "INTERNAL_EXECUTION" and reproduced:
        fail("internal execution cannot claim independent reproduction")
    if reproduced and execution_class != "INDEPENDENT_REPRODUCTION":
        fail("independently_reproduced=true requires INDEPENDENT_REPRODUCTION")

    answers = record["answers"]
    required_answers = {
        "intent_identifiable",
        "recommendation_identifiable",
        "reasoning_explainable",
        "criteria_and_constraints_identifiable",
        "uncertainty_identifiable",
        "boundary_separation_preserved",
        "downstream_evaluation_independent",
        "provenance_attributable",
        "new_ambiguity_introduced",
        "ungrounded_assumption_required",
    }
    missing_answers = sorted(required_answers - answers.keys())
    if missing_answers:
        fail(f"missing required answers: {', '.join(missing_answers)}")

    material_no = any(
        answers[key] == "NO"
        for key in (
            "intent_identifiable",
            "recommendation_identifiable",
            "reasoning_explainable",
            "boundary_separation_preserved",
            "downstream_evaluation_independent",
        )
    )
    new_failure = bool(record["new_failures"]) or answers["new_ambiguity_introduced"]
    assumption_failure = answers["ungrounded_assumption_required"] or bool(record["assumptions_used"])

    if classification in {"REDUNDANT", "OPTIONAL"} and (material_no or new_failure or assumption_failure):
        fail(
            f"{classification} is incompatible with a new material failure, ambiguity, or ungrounded assumption"
        )

    if classification == "REQUIRED" and not (material_no or new_failure or assumption_failure):
        fail("REQUIRED requires evidence of a new material failure or invalid assumption")

    if not record["canonical_record_hidden_during_evaluation"]:
        fail("canonical record must be hidden during the blinded evaluation")
    if not record["removed_element_hidden_during_evaluation"]:
        fail("removed element must be hidden during the blinded evaluation")

    if not isinstance(record["rationale"], str) or not record["rationale"].strip():
        fail("rationale must be non-empty")


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: validate_minimality_evaluator_response.py <response.json> [...]", file=sys.stderr)
        return 2

    failed = False
    for raw_path in sys.argv[1:]:
        path = Path(raw_path)
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(record, dict):
                fail("top-level JSON value must be an object")
            validate(record)
            print(f"PASS {path}")
        except (OSError, json.JSONDecodeError, ValueError) as exc:
            failed = True
            print(f"FAIL {path}: {exc}", file=sys.stderr)

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
