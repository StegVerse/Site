#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "data" / "publication-equivalence-contract.json"
PUBLIC_SUFFIXES = {
    ".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".webmanifest",
    ".xml", ".txt", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico",
    ".pdf", ".wasm", ".woff", ".woff2", ".ttf", ".map", ".csv"
}
TOP_LEVEL_SPECIAL = {"CNAME", "robots.txt", "sitemap.xml"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def allowed(path: Path, contract: dict) -> bool:
    rel = path.relative_to(ROOT)
    if any(part in set(contract["materialization"]["exclude_directory_prefixes"]) for part in rel.parts[:-1]):
        return False
    if path.name in set(contract["materialization"]["exclude_file_names"]):
        return False
    if len(rel.parts) == 1:
        return path.name in TOP_LEVEL_SPECIAL or path.suffix.lower() in PUBLIC_SUFFIXES
    return rel.parts[0] in set(contract["materialization"]["include_directories"]) and path.suffix.lower() in PUBLIC_SUFFIXES


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="build/site-publication-artifact")
    args = parser.parse_args()

    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    if contract.get("schema") != "stegverse.site.publication_equivalence.v1":
        raise SystemExit("PUBLICATION_ARTIFACT_FAIL: unexpected contract schema")
    if contract.get("artifact_format") != "STEGVERSE_SITE_STATIC_PUBLICATION_V1":
        raise SystemExit("PUBLICATION_ARTIFACT_FAIL: unexpected artifact format")
    if contract.get("provider_selection", {}).get("automatic_provider_selection") is not False:
        raise SystemExit("PUBLICATION_ARTIFACT_FAIL: automatic provider selection enabled")

    output = ROOT / args.output
    if output.exists():
        shutil.rmtree(output)
    source_out = output / "public"
    source_out.mkdir(parents=True)

    entries = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or output in path.parents or not allowed(path, contract):
            continue
        rel = path.relative_to(ROOT)
        target = source_out / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        entries.append({
            "path": rel.as_posix(),
            "sha256": sha256(target),
            "bytes": target.stat().st_size,
        })

    required = {"index.html", "CNAME", "ecosystem-chat.html", "stegverse-002.html"}
    found = {item["path"] for item in entries}
    missing = sorted(required - found)
    if missing:
        raise SystemExit("PUBLICATION_ARTIFACT_FAIL: required public files missing: " + ", ".join(missing))

    manifest = {
        "schema": "stegverse.site.static_publication_artifact.v1",
        "format": "STEGVERSE_SITE_STATIC_PUBLICATION_V1",
        "canonical_public_domain": contract["canonical_public_domain"],
        "entry_count": len(entries),
        "entries": entries,
        "provider_selected": False,
        "publication_observed": False,
        "public_content_equivalence_observed": False,
    }
    manifest_path = output / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (output / "SHA256SUMS").write_text(
        "".join(f'{entry["sha256"]}  public/{entry["path"]}\n' for entry in entries),
        encoding="utf-8",
    )
    print(f"SITE_STATIC_PUBLICATION_ARTIFACT=PASS entries={len(entries)}")
    print(f"SITE_STATIC_PUBLICATION_MANIFEST={manifest_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
