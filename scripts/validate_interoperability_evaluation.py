#!/usr/bin/env python3
"""Validate machine-readable interoperability evaluation records.

Uses jsonschema when installed and always performs additional evidence-class
consistency checks so claims cannot exceed the recorded execution evidence.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


STATUS_RANK = {
    "NOT_TESTED": 0,
    "NOT_ESTABLISHED": 0,
    "FAIL": 0,
    "PARTIAL_FAIL": 1,
    "PARTIAL_PASS": 2,
    "PASS_PRELIMINARY": 3,
    "PASS": 4,
}


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"missing file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"invalid JSON in {path}: {exc}") from exc


def validate_schema(instance: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    try:
        import jsonschema  # type: ignore
    except ImportError:
        return ["jsonschema package unavailable; structural schema validation skipped"]

    validator = jsonschema.Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(instance), key=lambda error: list(error.path))
    return [f"schema error at {'.'.join(map(str, error.path)) or '<root>'}: {error.message}" for error in errors]


def validate_claim_bounds(record: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    evidence = record.get("evidence_class", {})
    results = record.get("results", {})

    independent_status = results.get("independent_reproduction", {}).get("status")
    production_status = results.get("production_observation", {}).get("status")

    if not evidence.get("independently_reproduced", False) and independent_status in {"PASS", "PASS_PRELIMINARY"}:
        errors.append("independent reproduction cannot pass when independently_reproduced=false")

    if not evidence.get("production_observed", False) and production_status in {"PASS", "PASS_PRELIMINARY"}:
        errors.append("production observation cannot pass when production_observed=false")

    disposition = record.get("disposition")
    core = [
        results.get("structural_conformance", {}).get("status", "NOT_TESTED"),
        results.get("boundary_validity", {}).get("status", "NOT_TESTED"),
        results.get("explainability", {}).get("status", "NOT_TESTED"),
        results.get("reconstructability", {}).get("status", "NOT_TESTED"),
    ]
    if disposition == "PASS" and any(STATUS_RANK.get(status, 0) < STATUS_RANK["PASS"] for status in core):
        errors.append("overall PASS requires full PASS for structural, boundary, explainability, and reconstructability results")

    if disposition == "PASS_WITH_LIMITATIONS" and any(status in {"FAIL", "PARTIAL_FAIL"} for status in core):
        errors.append("PASS_WITH_LIMITATIONS cannot conceal a core FAIL or PARTIAL_FAIL")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "record",
        nargs="?",
        default="data/interoperability/evaluations/ITC-REAL-001.evaluation.json",
        type=Path,
    )
    parser.add_argument(
        "--schema",
        default=Path("data/interoperability/evaluation-record.schema.json"),
        type=Path,
    )
    args = parser.parse_args()

    record = load_json(args.record)
    schema = load_json(args.schema)

    messages = validate_schema(record, schema)
    warnings = [message for message in messages if message.startswith("jsonschema package unavailable")]
    errors = [message for message in messages if message not in warnings]
    errors.extend(validate_claim_bounds(record))

    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        return 1

    print(f"PASS: {args.record}")
    print(f"disposition={record['disposition']}")
    print(f"execution_class={record['evidence_class']['execution_class']}")
    print(f"independently_reproduced={str(record['evidence_class']['independently_reproduced']).lower()}")
    print(f"production_observed={str(record['evidence_class']['production_observed']).lower()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
