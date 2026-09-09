#!/usr/bin/env python3
"""Validate Site third-party dependency inventory and provider-coupling coverage."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "data" / "third-party-dependency-inventory.json"
CUTOVER = ROOT / "data" / "third-party-runtime-cutover-current.json"

CLASSIFICATIONS = {
    "REQUIRED_CURRENTLY", "OPTIONAL_FALLBACK", "HISTORICAL_ONLY",
    "NEGATIVE_ASSERTION_ONLY", "REPLACEABLE_BUILD_INPUT",
    "UNAVOIDABLE_EXTERNAL_INTEROP", "UNKNOWN_PENDING_INVENTORY",
}
EVENTS = [
    "DISCOVERED", "CLASSIFIED", "REPLACEMENT_DESIGNED",
    "SOVEREIGN_COPY_OR_RUNTIME_READY", "DUAL_RUN_VERIFIED",
    "PROVIDER_FAILURE_PROVEN", "CUTOVER_COMPLETE", "CREDENTIALS_REVOKED",
    "ORPHAN_RESOURCE_RETIRED", "REGRESSION_GUARDED",
]
PATTERNS = {
    "vercel": [r"\bvercel\b", r"\.vercel\.app\b"],
    "render": [r"\brender\b", r"\.onrender\.com\b"],
    "cloudflare": [r"\bcloudflare\b", r"\.trycloudflare\.com\b"],
    "github": [r"\bgithub\b", r"\.github\.io\b", r"raw\.githubusercontent\.com"],
    "python-packages": [r"\bpip(?:3)?\s+install\b", r"pypi\.org"],
    "npm-packages": [r"\bnpm\s+(?:ci|install)\b", r"registry\.npmjs\.org"],
    "container-registry": [r"\bghcr\.io/", r"\bdocker\.io/", r"\bquay\.io/"],
}
SKIP = {".git", "node_modules", "__pycache__", ".venv", "venv"}
TEXT = {".md", ".txt", ".json", ".jsonl", ".yml", ".yaml", ".py", ".js", ".ts",
        ".tsx", ".html", ".css", ".sh", ".toml", ".ini", ".cfg", ".xml", ".tex"}
SELF = "scripts/check_third_party_dependency_invariant.py"
ACTIVE_PREFIXES = (
    ".github/workflows/",
    "api/",
    "assets/",
    "scripts/",
    "src/",
)
ACTIVE_ROOT_FILES = {
    "CNAME", "Dockerfile", "Procfile", "requirements.txt", "pyproject.toml",
    "package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
}
ACTIVE_DATA_NAME_RE = re.compile(
    r"(?:config|gateway|activation|deployment|runtime|route|profile|endpoint|provider).*\.json$",
    re.I,
)


def read_inventory():
    return json.loads(INVENTORY.read_text(encoding="utf-8"))


def read_cutover():
    return json.loads(CUTOVER.read_text(encoding="utf-8"))


def provider_key(node):
    joined = " ".join([
        str(node.get("id", "")), str(node.get("provider", "")),
        *[str(x) for x in node.get("classes", [])],
    ]).lower()
    for key, needles in {
        "vercel": ["vercel"], "render": ["render"], "cloudflare": ["cloudflare"],
        "github": ["github"], "python-packages": ["pypi", "python package"],
        "npm-packages": ["npm", "javascript package"],
        "container-registry": ["container registry", "base_image"],
    }.items():
        if any(n in joined for n in needles):
            return key
    return None


def allowed_paths(inv):
    result = {k: set() for k in PATTERNS}
    for node in inv.get("providers", []):
        key = provider_key(node)
        if key in result:
            for path in node.get("evidence_paths", []):
                result[key].add(str(path).replace("\\", "/").lstrip("./"))
    return result


def path_is_allowed(path, entries):
    if path == SELF:
        return True
    for entry in entries:
        if entry.endswith("/") and path.startswith(entry):
            return True
        if path == entry:
            return True
    return False


def validate_inventory(inv):
    errors = []
    if inv.get("schema") != "stegverse.site.third_party_dependency_inventory.v1":
        errors.append("unexpected inventory schema")
    if inv.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        errors.append("inventory goal_id is not Site #497")
    if set(inv.get("allowed_classifications", [])) != CLASSIFICATIONS:
        errors.append("classification set differs from canonical policy")
    if inv.get("event_sequence") != EVENTS:
        errors.append("event sequence differs from canonical policy")

    seen = set()
    for i, node in enumerate(inv.get("providers", [])):
        p = f"providers[{i}]"
        ident = node.get("id")
        if not ident or ident in seen:
            errors.append(f"{p}: missing or duplicate id")
        seen.add(ident)
        cls = node.get("classification")
        if cls not in CLASSIFICATIONS:
            errors.append(f"{p}: invalid classification {cls}")
        if node.get("current_event") not in EVENTS or node.get("next_event") not in EVENTS:
            errors.append(f"{p}: invalid event state")
        if node.get("authority_effect") is True:
            errors.append(f"{p}: third-party authority_effect cannot be true")
        if cls == "HISTORICAL_ONLY" and node.get("current_required_use") is not False:
            errors.append(f"{p}: historical node must not be currently required")
        if cls == "REQUIRED_CURRENTLY":
            if node.get("current_required_use") is not True:
                errors.append(f"{p}: required node must set current_required_use=true")
            if not node.get("blockers"):
                errors.append(f"{p}: required node needs replacement blockers")
        if not node.get("evidence_paths"):
            errors.append(f"{p}: evidence_paths must not be empty")
    return errors


def validate_current_cutover(cutover):
    errors = []
    if cutover.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        errors.append("cutover goal_id is not Site #497")
    if cutover.get("cosv_id") != "50000000102000":
        errors.append("cutover COSV is not 50000000102000")
    if cutover.get("canonical_runtime") != "RESIDENT_STEGVERSE":
        errors.append("current canonical runtime is not RESIDENT_STEGVERSE")
    if cutover.get("production_continuity_third_party_dependency") is not False:
        errors.append("current cutover still requires a third-party production runtime")
    if cutover.get("activation_third_party_dependency") is not False:
        errors.append("current cutover still requires a third-party activation runtime")
    if cutover.get("automatic_third_party_runtime_selection") is not False:
        errors.append("automatic third-party runtime selection is still enabled")

    states = cutover.get("provider_states", {})
    for provider in ("render", "vercel", "netlify"):
        if states.get(provider, {}).get("required") is not False:
            errors.append(f"current cutover still marks {provider} required")
    quick = states.get("cloudflare_quick_tunnel", {})
    if quick.get("required") is not False:
        errors.append("current cutover still marks Cloudflare quick tunnel required")
    if quick.get("canonical_runtime_carrier") is not False:
        errors.append("current cutover still marks Cloudflare quick tunnel canonical")
    if quick.get("stegcore_primary_hosted_carrier_retirement_merge") != "084477a684193ad1b45d4403aa57844c5135638e":
        errors.append("current cutover missing primary hosted-carrier retirement merge")
    if quick.get("stegcore_fallback_hosted_carrier_retirement_merge") != "07632a7dcbd12d16440322f33269a51413fa3049":
        errors.append("current cutover missing fallback hosted-carrier retirement merge")
    gh = states.get("github_actions_runtime", {})
    if gh.get("required") is not False or gh.get("runtime_authority") != "NONE":
        errors.append("GitHub Actions still required or authoritative in current cutover")
    return errors


def effective_runtime_state(inv, cutover):
    historical_claims = {}
    for node in inv.get("providers", []):
        if node.get("id") in {"render-ecosystem-chat-gateway", "cloudflare-tunnel-steggate"}:
            historical_claims[node["id"]] = {
                "classification": node.get("classification"),
                "current_required_use": node.get("current_required_use"),
            }
    states = cutover.get("provider_states", {})
    return {
        "historical_inventory_claims": historical_claims,
        "current_cutover": {
            "render_required": states.get("render", {}).get("required"),
            "cloudflare_quick_tunnel_required": states.get("cloudflare_quick_tunnel", {}).get("required"),
            "cloudflare_quick_tunnel_canonical": states.get("cloudflare_quick_tunnel", {}).get("canonical_runtime_carrier"),
            "github_actions_runtime_required": states.get("github_actions_runtime", {}).get("required"),
            "github_actions_runtime_authority": states.get("github_actions_runtime", {}).get("runtime_authority"),
        },
        "effective_source": "data/third-party-runtime-cutover-current.json",
        "historical_inventory_rewrites_current_state": False,
    }


def is_active_surface(rel: str) -> bool:
    if rel in ACTIVE_ROOT_FILES:
        return True
    if rel.startswith(ACTIVE_PREFIXES):
        return True
    if rel.startswith("data/") and ACTIVE_DATA_NAME_RE.search(Path(rel).name):
        return True
    return False


def scan(inv, scope="active"):
    allow = allowed_paths(inv)
    compiled = {k: [re.compile(x, re.I) for x in v] for k, v in PATTERNS.items()}
    findings = {k: [] for k in PATTERNS}
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(x in SKIP for x in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower() not in TEXT and path.name not in {
            "Dockerfile", "CNAME", "Procfile", "requirements.txt",
            "package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
        }:
            continue
        rel = str(path.relative_to(ROOT)).replace("\\", "/")
        if scope == "active" and not is_active_surface(rel):
            continue
        try:
            body = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for key, regexes in compiled.items():
            if path_is_allowed(rel, allow[key]):
                continue
            lines = [n for n, line in enumerate(body.splitlines(), 1)
                     if any(rx.search(line) for rx in regexes)]
            if lines:
                findings[key].append({"path": rel, "lines": lines[:10]})
    return findings


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict-scan", action="store_true")
    ap.add_argument("--scope", choices=["active", "all"], default="active")
    ap.add_argument("--report", default="")
    args = ap.parse_args()

    inv = read_inventory()
    cutover = read_cutover()
    errors = validate_inventory(inv) + validate_current_cutover(cutover)
    findings = scan(inv, scope=args.scope)
    pending = sum(len(v) for v in findings.values())
    result = "FAIL" if errors or (args.strict_scan and pending) else (
        "PASS_WITH_INVENTORY_PENDING" if pending else "PASS"
    )
    report = {
        "schema": "stegverse.site.third_party_dependency_invariant_report.v1",
        "goal_id": inv.get("goal_id"),
        "cosv_id": cutover.get("cosv_id"),
        "structure_pass": not errors,
        "strict_scan_requested": args.strict_scan,
        "scan_scope": args.scope,
        "effective_runtime_state": effective_runtime_state(inv, cutover),
        "unclassified_reference_file_count": pending,
        "unclassified_references": findings,
        "errors": errors,
        "result": result,
    }
    if args.report:
        out = ROOT / args.report
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))
    return 1 if result == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
