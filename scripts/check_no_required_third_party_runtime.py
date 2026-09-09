#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
THIRD_PARTY_HOST_SUFFIXES = ("onrender.com", "vercel.app", "netlify.app")
FORBIDDEN_ROOT_CONFIGS = ("render.yaml", "vercel.json", "netlify.toml")


def die(message: str) -> None:
    raise SystemExit(f"NO_REQUIRED_THIRD_PARTY_RUNTIME_FAIL: {message}")


def host(value: object) -> str:
    if not isinstance(value, str) or not value:
        return ""
    return (urlparse(value).hostname or "").lower()


def is_third_party_host(value: object) -> bool:
    h = host(value)
    return any(h == suffix or h.endswith(f".{suffix}") for suffix in THIRD_PARTY_HOST_SUFFIXES)


def main() -> None:
    for name in FORBIDDEN_ROOT_CONFIGS:
        if (ROOT / name).exists():
            die(f"active root deployment config is prohibited: {name}")

    gateway = json.loads((ROOT / "data/ecosystem-chat-gateway.json").read_text(encoding="utf-8"))
    if gateway.get("enabled") is not False:
        die("Ecosystem Chat static gateway must be disabled")
    if gateway.get("endpoint") is not None or gateway.get("health_endpoint") is not None:
        die("Ecosystem Chat static endpoint/health_endpoint must be null")
    if gateway.get("fallback") != "LOCAL_CLASSIFICATION":
        die("Ecosystem Chat must fail closed to LOCAL_CLASSIFICATION")

    discovery = gateway.get("discovery", {})
    expected = [
        "http://127.0.0.1:8000/api/stegverse-node",
        "http://localhost:8000/api/stegverse-node",
    ]
    if discovery.get("advertisement_endpoints") != expected:
        die("automatic Ecosystem Chat discovery must contain only sovereign loopback candidates")
    if discovery.get("selection_policy") != "FIRST_VALID_SOVEREIGN_LOCAL_ONLY":
        die("automatic Ecosystem Chat selection is not sovereign-only")

    for item in gateway.get("optional_third_party_fallbacks", []):
        if item.get("enabled_by_default") is not False:
            die(f"third-party fallback enabled by default: {item.get('id')}")
        if item.get("selection_requires_explicit_runtime_opt_in") is not True:
            die(f"third-party fallback lacks explicit opt-in: {item.get('id')}")
        if item.get("production_continuity_dependency") is not False:
            die(f"third-party fallback claims production continuity: {item.get('id')}")
        if item.get("activation_dependency") is not False:
            die(f"third-party fallback claims activation dependency: {item.get('id')}")
        if item.get("authority_effect") != "NONE":
            die(f"third-party fallback authority effect is not NONE: {item.get('id')}")

    hil = json.loads((ROOT / "data/hil-gateway-config.json").read_text(encoding="utf-8"))
    if hil.get("automatic_third_party_selection") is not False:
        die("HIL automatic third-party selection must be false")
    for candidate in hil.get("gateway_candidates", []):
        if is_third_party_host(candidate.get("base_url")):
            if candidate.get("enabled") is not False:
                die(f"third-party HIL candidate enabled: {candidate.get('id')}")
            if candidate.get("selection_requires_explicit_runtime_opt_in") is not True:
                die(f"third-party HIL candidate lacks explicit opt-in: {candidate.get('id')}")
            if candidate.get("production_continuity_dependency") is not False:
                die(f"third-party HIL candidate claims production continuity: {candidate.get('id')}")
            if candidate.get("activation_dependency") is not False:
                die(f"third-party HIL candidate claims activation dependency: {candidate.get('id')}")

    discovery_source = (ROOT / "assets/ecosystem-chat-node-discovery.js").read_text(encoding="utf-8")
    for suffix in THIRD_PARTY_HOST_SUFFIXES:
        if suffix in discovery_source:
            die(f"automatic Ecosystem Chat discovery contains provider host: {suffix}")
    if "automatic_third_party_selection: false" not in discovery_source:
        die("automatic third-party selection false marker missing")

    bootstrap = (ROOT / ".github/workflows/validate.yml").read_text(encoding="utf-8")
    for prohibited in (
        "pip install jsonschema",
        "python3 -m pip install jsonschema",
        "from jsonschema import Draft202012Validator",
    ):
        if prohibited in bootstrap:
            die(f"Site bootstrap still requires public Python package infrastructure: {prohibited}")
    if "SITE_BOOTSTRAP_SCHEMA_VALIDATOR=REPOSITORY_LOCAL" not in bootstrap:
        die("Site bootstrap does not assert repository-local schema validation")

    task_runner = (ROOT / ".github/workflows/site-task-runner.yml").read_text(encoding="utf-8")
    forbidden_runner = (
        "workflow_" + "run:",
        "permissions:\n  contents: write",
        "secrets.",
        "actions/" + "checkout@",
        "actions/" + "setup-python@",
        "actions/" + "upload-artifact@",
        "pip " + "install",
        "python -m pip",
        "git " + "push",
        "onrender.com",
        "vercel.app",
        "netlify.app",
        "build_external_chat_activation_evidence.py",
    )
    for prohibited in forbidden_runner:
        if prohibited in task_runner:
            die(f"GitHub-hosted Site task runner still owns orchestration/dependency behavior: {prohibited}")
    for required in (
        "permissions: {}",
        "OPTIONAL_VALIDATION_FALLBACK_ONLY",
        "PRODUCTION_CONTINUITY_DEPENDENCY=false",
        "SITE_TASK_RUNNER_MUTATION_AUTHORITY=NONE",
    ):
        if required not in task_runner:
            die(f"GitHub-hosted Site task runner missing fallback-only marker: {required}")

    print("NO_REQUIRED_THIRD_PARTY_RUNTIME_PASS")
    print("THIRD_PARTY_ROLE=OPTIONAL_EXPLICIT_FALLBACK_OR_INTEROP_ONLY")
    print("PRODUCTION_CONTINUITY_THIRD_PARTY_DEPENDENCY=false")
    print("ACTIVATION_THIRD_PARTY_DEPENDENCY=false")
    print("SITE_BOOTSTRAP_PUBLIC_PYPI_REQUIRED=false")
    print("SITE_GITHUB_ACTIONS_ORCHESTRATION_ROLE=RETIRED")


if __name__ == "__main__":
    main()
