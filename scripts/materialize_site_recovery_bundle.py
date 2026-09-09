#!/usr/bin/env python3
"""Materialize a deterministic, provider-neutral StegVerse Site recovery bundle.

This operates only on a local checkout. It requires no GitHub API, GitHub Actions,
provider credential, or network access. Runtime/publication recovery proof remains a
separate observation from successful bundle materialization.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMAT = "STEGVERSE_SITE_RECOVERY_BUNDLE_V1"
EXCLUDED_TOP = {".git", ".venv", "venv", "node_modules", "__pycache__"}
EXCLUDED_NAMES = {".DS_Store"}
REQUIRED_PATHS = {
    "CNAME",
    "README.md",
    "data/dns-edge-portability.json",
    "data/source-publication-recovery.json",
    "data/third-party-runtime-cutover-current.json",
    "data/third-party-dependency-inventory-supersession.json",
    "docs/SITE_497_STEGGATE_DEPENDENCY_RECONCILIATION_MIRROR_HANDOFF.md",
    "scripts/check_dns_edge_portability.py",
    "scripts/check_source_publication_recovery.py",
    "scripts/check_no_required_third_party_runtime.py",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def identified_commit() -> str:
    explicit = os.environ.get("STEGVERSE_SITE_SOURCE_COMMIT", "").strip()
    if explicit:
        return explicit
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return "UNAVAILABLE_LOCAL_SNAPSHOT"


def selected_files(output_root: Path) -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts and rel.parts[0] in EXCLUDED_TOP:
            continue
        if path.name in EXCLUDED_NAMES:
            continue
        try:
            path.relative_to(output_root)
            continue
        except ValueError:
            pass
        files.append(path)
    return sorted(files, key=lambda p: p.relative_to(ROOT).as_posix())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="build/site-recovery-bundle")
    args = ap.parse_args()

    output = (ROOT / args.output).resolve()
    if output == ROOT or ROOT not in output.parents:
        raise SystemExit("output must be a child of the Site repository")
    if output.exists():
        shutil.rmtree(output)
    snapshot = output / "source"
    snapshot.mkdir(parents=True)

    files = selected_files(output)
    rels = {p.relative_to(ROOT).as_posix() for p in files}
    missing = sorted(REQUIRED_PATHS - rels)
    if missing:
        raise SystemExit("missing required recovery paths: " + ", ".join(missing))

    entries = []
    for src in files:
        rel = src.relative_to(ROOT)
        dest = snapshot / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        entries.append({
            "path": rel.as_posix(),
            "sha256": sha256(dest),
            "bytes": dest.stat().st_size,
        })

    manifest = {
        "schema": "stegverse.site.recovery_bundle_manifest.v1",
        "format": FORMAT,
        "goal_id": "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION",
        "cosv_id": "50000000102000",
        "source_commit": identified_commit(),
        "canonical_public_domain": "stegverse.org",
        "digest_algorithm": "SHA-256",
        "entry_count": len(entries),
        "entries": entries,
        "requires_github_api": False,
        "requires_github_actions": False,
        "requires_provider_credentials": False,
        "off_github_restore_observed": False,
        "off_github_publication_observed": False,
        "authority_effect": "NONE",
        "activation_effect": "NONE",
    }
    manifest_path = output / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    sums = output / "SHA256SUMS"
    sums.write_text(
        "".join(f"{e['sha256']}  source/{e['path']}\n" for e in entries),
        encoding="utf-8",
    )
    print(f"SITE_RECOVERY_BUNDLE_MATERIALIZED={output}")
    print(f"SITE_RECOVERY_BUNDLE_ENTRIES={len(entries)}")
    print(f"SITE_RECOVERY_BUNDLE_MANIFEST_SHA256={sha256(manifest_path)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
