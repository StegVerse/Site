#!/usr/bin/env python3
"""Fail-closed validation for the Site CFP/NCAAF current-season projection."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "cfp-data.json"
README = ROOT / "README.md"
CFP_README = ROOT / "cfp" / "README_CFP.md"
SOURCE_README = ROOT / "data" / "README-cfp-source.md"
ALLOWED_PHASES = {"PRE_CFP_RANKINGS", "CFP_RANKINGS", "SELECTION", "PLAYOFF"}


def fail(message: str) -> None:
    raise SystemExit(f"CFP_DATA_FRESHNESS=FAIL\n{message}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--require-live-source",
        action="store_true",
        help="require at least one current supporting poll/game source to be observed during this execution",
    )
    args = parser.parse_args()

    for path in (DATA, README, CFP_README, SOURCE_README):
        if not path.is_file():
            fail(f"missing required file: {path.relative_to(ROOT)}")

    data = json.loads(DATA.read_text(encoding="utf-8"))
    if data.get("schema_version") != "2.0.0":
        fail("schema_version must be 2.0.0")

    season = data.get("season")
    current_year = datetime.now(timezone.utc).year
    if not isinstance(season, int) or season != current_year:
        fail(f"season must equal current UTC year ({current_year}); observed {season!r}")

    phase = data.get("phase")
    if phase not in ALLOWED_PHASES:
        fail(f"unsupported phase: {phase!r}")

    freshness = data.get("freshness") or {}
    if freshness.get("current_season_only") is not True:
        fail("freshness.current_season_only must be true")
    if freshness.get("historical_rankings_carried_forward") is not False:
        fail("historical rankings must not be carried forward")

    rankings = data.get("rankings")
    if not isinstance(rankings, list):
        fail("rankings must be a list")
    if phase == "PRE_CFP_RANKINGS" and rankings:
        fail("PRE_CFP_RANKINGS must not contain inferred or historical CFP rankings")
    if phase in {"CFP_RANKINGS", "SELECTION", "PLAYOFF"} and not rankings:
        fail(f"{phase} requires observed current-season CFP rankings")

    historical = data.get("historical_reference") or {}
    if historical.get("included_in_current_rankings") is not False:
        fail("historical_reference must explicitly exclude historical rankings from current rankings")

    for source in data.get("sources") or []:
        url = str(source.get("url") or "")
        if "/2025/" in url or "2025/12" in url:
            fail(f"current source embeds a 2025 snapshot URL: {url}")

    if args.require_live_source:
        games = data.get("games") or []
        polls = data.get("polls") or []
        observed = freshness.get("supporting_source_observed") is True and bool(games or polls)
        if not observed:
            fail("live-source exercise observed neither current games nor a current supporting poll")

    required_readme_markers = {
        README: ["cfp/ncaaf current-season projection", "pre_cfp_rankings"],
        CFP_README: ["pre_cfp_rankings", "historical rankings"],
        SOURCE_README: ["schema_version", "historical rankings"],
    }
    for path, markers in required_readme_markers.items():
        text = path.read_text(encoding="utf-8").lower()
        missing = [marker for marker in markers if marker.lower() not in text]
        if missing:
            fail(f"{path.relative_to(ROOT)} missing README completeness markers: {missing}")

    print("CFP_DATA_FRESHNESS=PASS")
    print(f"season={season}")
    print(f"phase={phase}")
    print(f"rankings={len(rankings)}")
    if args.require_live_source:
        print(f"supporting_source_observed={str(freshness.get('supporting_source_observed') is True).lower()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
