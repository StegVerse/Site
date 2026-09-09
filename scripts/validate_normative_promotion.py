#!/usr/bin/env python3
"""Validate evidence-to-normative promotion proposals.

Usage:
    python scripts/validate_normative_promotion.py <proposal.json> [...]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ACCEPTED = "ACCEPTED_NORMATIVE"
REQUIRED_FOR_ACCEPTANCE = {
    "proposal_id",
    "source_finding_id",
    "affected_protocol",
    "affected_version",
    "problem_statement",
    "reproducible_test",
    "problem_reproduced",
    "proposed_normative_rule",
    "compatibility_impact",
    "boundary_impact",
    "boundary_preserved",
    "conformance_test",
    "conformance_test_passed",
    "disposition",
}

FORBIDDEN_COLLAPSES = {
    "recommendation=consent",
    "evidence=authority",
    "confidence=admissibility",
    "approval=commitment",
    "commitment=execution",
    "execution=legitimacy",
    "discovery=governance",
    "reconstruction=authorization",
}


def normalized(value: str) -> str:
    return "".join(value.lower().split())


def validate(record: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    state = record.get("promotion_state")

    collapses = {
        normalized(str(item)) for item in record.get("boundary_equivalences", [])
    }
    detected = sorted(collapses & FORBIDDEN_COLLAPSES)
    if detected:
        errors.append(
            "boundary collapse detected: " + ", ".join(detected)
        )

    if state == ACCEPTED:
        missing = sorted(
            key for key in REQUIRED_FOR_ACCEPTANCE
            if key not in record or record[key] in (None, "", [], {})
        )
        if missing:
            errors.append(
                "ACCEPTED_NORMATIVE missing required evidence: "
                + ", ".join(missing)
            )

        if record.get("problem_reproduced") is not True:
            errors.append("ACCEPTED_NORMATIVE requires problem_reproduced=true")
        if record.get("boundary_preserved") is not True:
            errors.append("ACCEPTED_NORMATIVE requires boundary_preserved=true")
        if record.get("conformance_test_passed") is not True:
            errors.append("ACCEPTED_NORMATIVE requires conformance_test_passed=true")

    return errors


def main(paths: list[str]) -> int:
    if not paths:
        print("usage: validate_normative_promotion.py <proposal.json> [...]", file=sys.stderr)
        return 2

    failed = False
    for raw_path in paths:
        path = Path(raw_path)
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"FAIL {path}: {exc}")
            failed = True
            continue

        errors = validate(record)
        if errors:
            failed = True
            for error in errors:
                print(f"FAIL {path}: {error}")
        else:
            print(f"PASS {path}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
