#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATERIALIZER = ROOT / "scripts" / "materialize_site_recovery_bundle.py"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def die(message: str) -> None:
    raise SystemExit(f"SITE_RECOVERY_BUNDLE_FAIL: {message}")


def main() -> None:
    if not MATERIALIZER.exists():
        die("materializer missing")

    tmp = Path(tempfile.mkdtemp(prefix="site-recovery-bundle-", dir=ROOT))
    try:
        rel_output = tmp.relative_to(ROOT)
        subprocess.run(
            ["python3", str(MATERIALIZER), "--output", rel_output.as_posix()],
            cwd=ROOT,
            check=True,
        )
        manifest_path = tmp / "manifest.json"
        sums_path = tmp / "SHA256SUMS"
        if not manifest_path.exists() or not sums_path.exists():
            die("manifest or SHA256SUMS missing")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest.get("schema") != "stegverse.site.recovery_bundle_manifest.v1":
            die("wrong manifest schema")
        if manifest.get("format") != "STEGVERSE_SITE_RECOVERY_BUNDLE_V1":
            die("wrong bundle format")
        if manifest.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
            die("wrong goal binding")
        if manifest.get("cosv_id") != "50000000102000":
            die("wrong COSV binding")
        if manifest.get("canonical_public_domain") != "stegverse.org":
            die("wrong public domain")
        if manifest.get("digest_algorithm") != "SHA-256":
            die("wrong digest algorithm")
        for key in ("requires_github_api", "requires_github_actions", "requires_provider_credentials"):
            if manifest.get(key) is not False:
                die(f"{key} must be false")
        for key in ("off_github_restore_observed", "off_github_publication_observed"):
            if manifest.get(key) is not False:
                die(f"{key} cannot be claimed by repository-local materialization")
        entries = manifest.get("entries", [])
        if not entries or manifest.get("entry_count") != len(entries):
            die("entry count mismatch")
        seen = set()
        for entry in entries:
            rel = entry.get("path")
            digest = entry.get("sha256")
            if not rel or rel in seen:
                die("missing or duplicate entry path")
            seen.add(rel)
            file_path = tmp / "source" / rel
            if not file_path.exists():
                die(f"missing bundled file {rel}")
            if sha256(file_path) != digest:
                die(f"hash mismatch for {rel}")
        required = {
            "README.md",
            "CNAME",
            "data/dns-edge-portability.json",
            "data/source-publication-recovery.json",
            "docs/SITE_497_STEGGATE_DEPENDENCY_RECONCILIATION_MIRROR_HANDOFF.md",
        }
        if not required.issubset(seen):
            die("required recovery content missing")
        sum_lines = [x for x in sums_path.read_text(encoding="utf-8").splitlines() if x]
        if len(sum_lines) != len(entries):
            die("SHA256SUMS count mismatch")
        print("SITE_RECOVERY_BUNDLE_PASS")
        print(f"SITE_RECOVERY_BUNDLE_ENTRIES={len(entries)}")
        print(f"SITE_RECOVERY_BUNDLE_MANIFEST_SHA256={sha256(manifest_path)}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
