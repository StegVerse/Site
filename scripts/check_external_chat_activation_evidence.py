#!/usr/bin/env python3
"""Validate the External Chat activation-evidence ownership contract.

The repository-local builder remains available as a deterministic evidence-shaping
utility, but the GitHub-hosted Site Task Runner must not execute it, upload its output,
or act as the live/public observation owner. Authentic activation evidence belongs to
the resident StegVerse execution lane and is reconciled separately.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "scripts" / "build_external_chat_activation_evidence.py"
WORKFLOW = ROOT / ".github" / "workflows" / "site-task-runner.yml"
HANDOFF = ROOT / "docs" / "EXTERNAL_CHAT_MIRROR_HANDOFF.md"

REQUIRED_BUILDER_MARKERS = (
    "external_chat_activation_evidence",
    "OBSERVED_NON_MUTATING_PUBLIC_PATHS",
    "LIVE_EVIDENCE_NOT_AVAILABLE",
    "site-task-diagnostic.json",
    "external-chat-live-verification.json",
    "evidence_sha256",
    '"evidence_is_deployment_authority": False',
    '"evidence_is_repository_mutation_authority": False',
    '"evidence_is_publication_authority": False',
    '"evidence_is_certification": False',
    '"evidence_creates_standing": False',
    '"mutation_remains_separately_authorized": True',
)


def fail(message: str) -> int:
    print(f"EXTERNAL CHAT ACTIVATION EVIDENCE CONTRACT: FAIL - {message}")
    return 1


def main() -> int:
    for path in (BUILDER, WORKFLOW, HANDOFF):
        if not path.exists():
            return fail(f"missing {path.relative_to(ROOT)}")

    builder = BUILDER.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")
    handoff = HANDOFF.read_text(encoding="utf-8")

    for marker in REQUIRED_BUILDER_MARKERS:
        if marker not in builder:
            return fail(f"builder missing marker: {marker}")

    required_fallback_markers = (
        "OPTIONAL_VALIDATION_FALLBACK_ONLY",
        "PRODUCTION_CONTINUITY_DEPENDENCY=false",
        "SITE_TASK_RUNNER_RUNTIME_AUTHORITY=NONE",
        "SITE_TASK_RUNNER_MUTATION_AUTHORITY=NONE",
        "permissions: {}",
    )
    for marker in required_fallback_markers:
        if marker not in workflow:
            return fail(f"validation fallback missing marker: {marker}")

    forbidden_hosted_evidence_markers = (
        "Build External Chat activation evidence",
        "python scripts/build_external_chat_activation_evidence.py",
        "Upload External Chat activation evidence",
        "external-chat-activation-evidence-${{ github.run_id }}-${{ github.run_attempt }}",
        "site/reports/external-chat-activation-evidence.json",
        "Verify External Chat public surfaces",
        "actions/" + "upload-artifact@",
    )
    for marker in forbidden_hosted_evidence_markers:
        if marker in workflow:
            return fail(f"GitHub-hosted validation fallback still owns activation evidence: {marker}")

    for marker in (
        "external-chat-activation-evidence.json",
        "activation evidence",
        "mutation remains separately authorized",
    ):
        if marker not in handoff:
            return fail(f"handoff missing marker: {marker}")

    print("EXTERNAL CHAT ACTIVATION EVIDENCE CONTRACT: PASS")
    print("EXTERNAL_CHAT_ACTIVATION_EVIDENCE_OWNER=RESIDENT_STEGVERSE_EXECUTION")
    print("GITHUB_HOSTED_ACTIVATION_EVIDENCE_ROLE=NONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
