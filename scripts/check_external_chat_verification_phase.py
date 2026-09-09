#!/usr/bin/env python3
from __future__ import annotations

import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPLICATION = ROOT / "scripts" / "check_ecosystem_chat_application.py"
WORKFLOW = ROOT / ".github" / "workflows" / "site-task-runner.yml"
LIVE_CHECK = "scripts/check_external_chat_live_routes.py"


def fail(message: str) -> int:
    print(f"EXTERNAL CHAT VERIFICATION PHASE: FAIL - {message}")
    return 1


def declares_post_deployment(application: str) -> bool:
    """Confirm the application result declares POST_DEPLOYMENT independent of formatting."""
    try:
        tree = ast.parse(application)
    except SyntaxError:
        return False
    for node in ast.walk(tree):
        if not isinstance(node, ast.Dict):
            continue
        pairs = {}
        for key, value in zip(node.keys, node.values):
            if isinstance(key, ast.Constant) and isinstance(key.value, str):
                if isinstance(value, ast.Constant):
                    pairs[key.value] = value.value
        if pairs.get("live_route_verification_phase") == "POST_DEPLOYMENT":
            return True
    return False


def main() -> int:
    for path in (APPLICATION, WORKFLOW):
        if not path.exists():
            return fail(f"missing {path.relative_to(ROOT)}")

    application = APPLICATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    command_section = application.split("COMMANDS:", 1)[-1].split("def execute", 1)[0]
    if LIVE_CHECK in command_section:
        return fail("live-route check must not run in pre-deployment application COMMANDS")
    if not declares_post_deployment(application):
        return fail("application result must declare POST_DEPLOYMENT live verification")

    # Public-route observation remains a valid post-deployment phase, but it is no
    # longer owned by the GitHub-hosted Site Task Runner. Resident StegVerse workers
    # may perform that observation and retain evidence independently.
    required_fallback_markers = [
        "OPTIONAL_VALIDATION_FALLBACK_ONLY",
        "PRODUCTION_CONTINUITY_DEPENDENCY=false",
        "SITE_TASK_RUNNER_MUTATION_AUTHORITY=NONE",
        "permissions: {}",
        "workflow_dispatch:",
    ]
    for marker in required_fallback_markers:
        if marker not in workflow:
            return fail(f"validation fallback missing marker: {marker}")

    forbidden_hosted_observation_markers = [
        "Verify External Chat public surfaces",
        "STEGVERSE_PAGES_DEPLOYMENT_URL:",
        "STEGVERSE_PAGES_DEPLOYMENT_RESULT:",
        "python scripts/check_external_chat_live_routes.py",
        "Upload External Chat live verification receipt",
        "site/reports/external-chat-live-verification.json",
        "actions/configure-pages@",
        "actions/upload-pages-artifact@",
        "actions/deploy-pages@",
        "actions/upload-artifact@",
        "onrender.com",
        "vercel.app",
        "netlify.app",
    ]
    for marker in forbidden_hosted_observation_markers:
        if marker in workflow:
            return fail(f"GitHub-hosted validation fallback still owns live/public observation: {marker}")

    print("EXTERNAL CHAT VERIFICATION PHASE: PASS (local checks pre-publication; post-deployment observation remains resident-owned; GitHub Task Runner is validation fallback only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
