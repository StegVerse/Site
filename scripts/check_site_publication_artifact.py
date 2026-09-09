#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build" / "site-publication-artifact"
CONTRACT = ROOT / "data" / "publication-equivalence-contract.json"


def die(message: str) -> None:
    raise SystemExit("SITE_PUBLICATION_ARTIFACT_FAIL: " + message)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "materialize_site_publication_artifact.py"), "--output", "build/site-publication-artifact"],
        cwd=ROOT,
        check=True,
    )
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    manifest = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("schema") != "stegverse.site.static_publication_artifact.v1":
        die("unexpected manifest schema")
    if manifest.get("format") != "STEGVERSE_SITE_STATIC_PUBLICATION_V1":
        die("unexpected artifact format")
    if manifest.get("canonical_public_domain") != "stegverse.org":
        die("canonical public domain mismatch")
    entries = manifest.get("entries") or []
    if manifest.get("entry_count") != len(entries) or not entries:
        die("entry count mismatch or empty artifact")
    seen = set()
    expected_lines = []
    for entry in entries:
        rel = entry.get("path")
        if not isinstance(rel, str) or not rel or rel in seen:
            die("invalid or duplicate path")
        seen.add(rel)
        target = OUT / "public" / rel
        if not target.is_file():
            die(f"artifact file missing: {rel}")
        digest = sha256(target)
        if digest != entry.get("sha256"):
            die(f"artifact digest mismatch: {rel}")
        if target.stat().st_size != entry.get("bytes"):
            die(f"artifact byte count mismatch: {rel}")
        expected_lines.append(f"{digest}  public/{rel}\n")
    if (OUT / "SHA256SUMS").read_text(encoding="utf-8") != "".join(expected_lines):
        die("SHA256SUMS differs from manifest")
    if manifest.get("provider_selected") is not False:
        die("artifact incorrectly claims provider selection")
    if manifest.get("publication_observed") is not False:
        die("artifact incorrectly claims publication")
    if manifest.get("public_content_equivalence_observed") is not False:
        die("artifact incorrectly claims public equivalence")
    obs = contract.get("current_observation", {})
    for key in ("non_github_origin_selected", "non_github_publication_observed", "exact_public_content_equivalence_observed", "tls_equivalence_observed"):
        if obs.get(key) is not False:
            die(f"contract prematurely claims observation: {key}")
    print(f"SITE_PUBLICATION_ARTIFACT=PASS entries={len(entries)}")
    print("NON_GITHUB_ORIGIN_SELECTED=false")
    print("NON_GITHUB_PUBLICATION_OBSERVED=false")
    print("EXACT_PUBLIC_CONTENT_EQUIVALENCE_OBSERVED=false")


if __name__ == "__main__":
    main()
