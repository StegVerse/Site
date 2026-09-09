#!/usr/bin/env python3
"""Generate deterministic single-section removal fixtures for ITC minimality testing.

This script never modifies the canonical source artifact. It writes derived fixtures
and a manifest that records exactly what was removed and the SHA-256 digest of each
resulting JSON document.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
from typing import Any

DEFAULT_TARGETS = [
    "alternatives_considered",
    "confidence",
    "uncertainties",
    "unresolved_dependencies",
    "provenance",
    "constraints",
]


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def sha256_hex(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        default="data/conectrr-itc/ITC-REAL-001.canonical.json",
        help="Canonical source ITC JSON",
    )
    parser.add_argument(
        "--output-dir",
        default="data/interoperability/minimality/ITC-REAL-001",
        help="Directory for derived fixtures and manifest",
    )
    args = parser.parse_args()

    source_path = Path(args.source)
    output_dir = Path(args.output_dir)
    source = json.loads(source_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)

    source_payload = canonical_bytes(source)
    manifest: dict[str, Any] = {
        "manifest_version": "0.1.0",
        "source_path": str(source_path),
        "source_sha256": sha256_hex(source_payload),
        "method": "SINGLE_TOP_LEVEL_SECTION_REMOVAL",
        "fixtures": [],
    }

    for target in DEFAULT_TARGETS:
        if target not in source:
            raise KeyError(f"Required target not present in source: {target}")
        derived = copy.deepcopy(source)
        del derived[target]
        payload = canonical_bytes(derived)
        fixture_name = f"remove-{target}.json"
        fixture_path = output_dir / fixture_name
        fixture_path.write_bytes(payload)
        manifest["fixtures"].append(
            {
                "fixture_id": f"ITC-REAL-001-REMOVE-{target.upper()}",
                "path": str(fixture_path),
                "removed_path": target,
                "sha256": sha256_hex(payload),
                "classification": "UNDETERMINED",
                "observed_failures": [],
            }
        )

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_bytes(canonical_bytes(manifest))
    print(f"generated {len(manifest['fixtures'])} fixtures")
    print(f"manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
