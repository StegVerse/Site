#!/usr/bin/env python3
"""
Self-Healing Continuity Scanner
- Enumerates existing self-healing measures (workflows/scripts/api/diag/configs)
- Compares against a canonical checklist
- Emits artifacts:
  * self_healing_out/SELF_HEALING_MANIFEST.json
  * self_healing_out/SELF_HEALING_MANIFEST.md
  * self_healing_out/REMEDIATIONS.md (append-only journal of missing/added items)
  * self_healing_out/index.json (tiny machine index)
- Optionally writes a machine-readable gaps file: self_healing_out/GAPS.json
"""

import os, sys, hashlib, json, re, datetime, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / "self_healing_out"
OUTDIR.mkdir(parents=True, exist_ok=True)

def sh(cmd):
    return subprocess.check_output(cmd, cwd=str(ROOT), text=True).strip()

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def read_text(path: Path, limit=None) -> str:
    try:
        t = path.read_text(encoding="utf-8", errors="ignore")
        if limit and len(t) > limit:
            return t[:limit] + "\n... [truncated] ..."
        return t
    except Exception as e:
        return f"[error reading {path}: {e}]"

def files(glob_pat: str):
    return sorted([p for p in ROOT.glob(glob_pat) if p.is_file()])

def recent_commits(n=30):
    try:
        return sh(["git","log",f"--pretty=format:%ad %h %s","--date=iso",f"-{n}"]).splitlines()
    except Exception:
        return []

# --- Canonical checklist (what “should” exist) ---
CANON = {
    "common": {
        "scripts": [
            "scripts/make_rebuild_bundle.sh",
            "scripts/collect_self_healing.py"
        ],
        "workflows": [
            ".github/workflows/rebuild-kit.yml",
            ".github/workflows/self-healing-scan.yml",
        ]
    },
    # Additional expectations for the SCW API repo (detected by presence of api/app/main.py)
    "scw_api": {
        "files": [
            "api/app/main.py",
            "api/requirements.txt",
            "public/diag.html"
        ],
        "workflows_any_one_of": [
            ".github/workflows/scw-api-config-and-deploy.yml",  # secrets mode
            ".github/workflows/scw-api-health-and-report.yml"   # zero-secret mode
        ]
    }
}

def detect_repo_kind() -> str:
    if (ROOT / "api" / "app" / "main.py").exists():
        return "scw_api"
    return "generic"

def detect_measures():
    measures = []
    # Workflows
    for wf in files(".github/workflows/*.yml") + files(".github/workflows/*.yaml"):
        text = read_text(wf)
        kinds = []
        if re.search(r"Rebuild Kit", text, re.I) or "make_rebuild_bundle.sh" in text:
            kinds.append("rebuild_kit")
        if re.search(r"Configure & Deploy|Render.*deploy|resume", text, re.I):
            kinds.append("deploy_automation")
        if re.search(r"Health & Report|Wait for health|HEALTH_URL", text, re.I):
            kinds.append("health_check")
        if re.search(r"Self-Healing Scan|Repo Timeline|inventory", text, re.I):
            kinds.append("timeline_inventory")
        if re.search(r"Snapshot Release", text, re.I):
            kinds.append("snapshot_release")
        measures.append({"type":"workflow","path":str(wf),"kinds":kinds or ["other"],"sha256":sha256(wf)})

    # Scripts
    for s in files("scripts/*.sh") + files("scripts/*.py"):
        measures.append({"type":"script","path":str(s),"sha256":sha256(s)})

    # API + diag (if present)
    api_main = ROOT / "api" / "app" / "main.py"
    if api_main.exists():
        t = read_text(api_main)
        measures.append({
            "type":"api","path":str(api_main),"sha256":sha256(api_main),
            "has_health": "/v1/ops/health" in t,
            "has_deploy_report": "/v1/ops/deploy/report" in t,
            "has_env_presence": "/v1/ops/env/required" in t,
        })
    diag = ROOT / "public" / "diag.html"
    if diag.exists():
        measures.append({"type":"ui","path":str(diag),"sha256":sha256(diag)})

    # Config snapshots
    for c in ["render.yaml","api/requirements.txt","package.json","pnpm-lock.yaml","yarn.lock","package-lock.json"]:
        p = ROOT / c
        if p.exists():
            measures.append({"type":"config","path":str(p),"sha256":sha256(p)})

    return measures

def compute_gaps(repo_kind: str, measures):
    present_paths = {m["path"] for m in measures}
    gaps = {"missing": [], "warnings": []}

    # Common expectations
    for path in CANON["common"]["scripts"]:
        if path not in present_paths:
            gaps["missing"].append({"category":"script","path":path})
    for path in CANON["common"]["workflows"]:
        if path not in present_paths:
            gaps["missing"].append({"category":"workflow","path":path})

    # SCW API extras
    if repo_kind == "scw_api":
        for path in CANON["scw_api"]["files"]:
            if path not in present_paths:
                gaps["missing"].append({"category":"file","path":path})
        # at least one deploy workflow variant
        if not any(p in present_paths for p in CANON["scw_api"]["workflows_any_one_of"]):
            gaps["missing"].append({"category":"workflow","path":"(one of) "+", ".join(CANON["scw_api"]["workflows_any_one_of"])})

    # Feature warnings (API missing endpoints)
    api = next((m for m in measures if m.get("type")=="api"), None)
    if api:
        if not api.get("has_health"): gaps["warnings"].append("api missing /v1/ops/health")
        if not api.get("has_deploy_report"): gaps["warnings"].append("api missing /v1/ops/deploy/report")
        if not api.get("has_env_presence"): gaps["warnings"].append("api missing /v1/ops/env/required")

    return gaps

def write_manifest(repo, branch, commit, prev, measures, gaps):
    payload = {
        "repo": repo,
        "branch": branch,
        "commit": commit,
        "prev": prev,
        "generated_at": datetime.datetime.utcnow().isoformat()+"Z",
        "measures": measures,
        "gaps": gaps,
        "recent_commits": recent_commits(30),
    }
    (OUTDIR / "SELF_HEALING_MANIFEST.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    # MD summary
    lines = []
    lines.append(f"# Self-Healing Manifest — {repo} ({branch})")
    lines.append(f"- Generated: **{payload['generated_at']}**")
    lines.append(f"- Commit: `{commit}`  Prev: `{prev}`")
    lines.append("\n## Detected Measures")
    for m in measures:
        extra = ""
        if m["type"]=="workflow" and m.get("kinds"): extra = f" • kinds: {', '.join(m['kinds'])}"
        if m["type"]=="api":
            flags = []
            if m.get("has_health"): flags.append("health")
            if m.get("has_deploy_report"): flags.append("deploy_report")
            if m.get("has_env_presence"): flags.append("env_presence")
            if flags: extra += f" • features: {', '.join(flags)}"
        lines.append(f"- **{m['type']}** `{m['path']}` (sha256 `{m['sha256'][:12]}…`){extra}")
    lines.append("\n## Gaps Detected")
    if not gaps["missing"] and not gaps["warnings"]:
        lines.append("- ✅ No gaps detected.")
    else:
        for g in gaps["missing"]:
            lines.append(f"- ❌ MISSING {g['category']}: `{g['path']}`")
        for w in gaps["warnings"]:
            lines.append(f"- ⚠️ {w}")
    lines.append("\n## Recent Commits")
    for c in payload["recent_commits"]:
        lines.append(f"- {c}")

    (OUTDIR / "SELF_HEALING_MANIFEST.md").write_text("\n".join(lines), encoding="utf-8")

    # tiny index
    (OUTDIR / "index.json").write_text(json.dumps({
        "repo": repo, "commit": commit, "generated_at": payload["generated_at"],
        "measures_count": len(measures), "missing_count": len(gaps["missing"])
    }), encoding="utf-8")

    # gaps JSON for fixer step
    (OUTDIR / "GAPS.json").write_text(json.dumps(gaps, indent=2), encoding="utf-8")

def append_remediation_journal(repo, commit, gaps, actions_taken):
    """Append-only journal of gaps + actions (if any)."""
    j = OUTDIR / "REMEDIATIONS.md"
    ts = datetime.datetime.utcnow().isoformat()+"Z"
    lines = []
    lines.append(f"## {ts} — {repo}@{commit[:7]}")
    if not gaps["missing"] and not gaps["warnings"]:
        lines.append("- No gaps detected.")
    else:
        if gaps["missing"]:
            lines.append("- Missing detected:")
            for m in gaps["missing"]:
                lines.append(f"  - {m['category']}: `{m['path']}`")
        if gaps["warnings"]:
            lines.append("- Warnings:")
            for w in gaps["warnings"]:
                lines.append(f"  - {w}")
    if actions_taken:
        lines.append("- Actions taken:")
        for a in actions_taken:
            lines.append(f"  - {a}")
    lines.append("")  # spacer
    with j.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines))

def main():
    try:
        commit = sh(["git","rev-parse","HEAD"])
        prev = sh(["git","rev-parse","HEAD~1"])
    except Exception:
        commit, prev = "HEAD", "HEAD~1"
    branch = os.getenv("GITHUB_REF_NAME") or sh(["git","rev-parse","--abbrev-ref","HEAD"])
    repo = os.getenv("GITHUB_REPOSITORY") or ROOT.name

    measures = detect_measures()
    kind = detect_repo_kind()
    gaps = compute_gaps(kind, measures)

    # Write manifest + gaps
    write_manifest(repo, branch, commit, prev, measures, gaps)
    # No actions here—fixes happen in apply_canonical_fixes.py
    append_remediation_journal(repo, commit, gaps, actions_taken=[])

    print(str(OUTDIR / "SELF_HEALING_MANIFEST.json"))
    print(str(OUTDIR / "SELF_HEALING_MANIFEST.md"))
    print(str(OUTDIR / "GAPS.json"))
    print(str(OUTDIR / "REMEDIATIONS.md"))

if __name__ == "__main__":
    main()
