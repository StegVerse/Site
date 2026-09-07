#!/usr/bin/env python3
"""Build the current-season CFP/NCAAF public data projection.

The live file is fail-closed: historical CFP rankings are never carried forward
merely because a fetch failed or a timestamp changed. Before current-season CFP
committee rankings are actually observed, ``rankings`` remains empty and the
tracker exposes ``PRE_CFP_RANKINGS`` while current games and separately labelled
polls may still be shown.

Current scoreboard/AP data comes from the public, credential-free henrygd/ncaa-api
projection of NCAA data. That source is supporting NCAAF data only and is never
promoted to CFP committee authority.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "cfp-data.json"

NCAA_API_BASE = os.getenv("NCAA_API_BASE", "https://ncaa-api.henrygd.me").rstrip("/")
NCAA_SCOREBOARD_URL = os.getenv("CFP_SCOREBOARD_URL", f"{NCAA_API_BASE}/scoreboard/football/fbs")
NCAA_AP_URL = os.getenv("CFP_POLLS_URL", f"{NCAA_API_BASE}/rankings/football/fbs/associated-press")
CFP_OFFICIAL_URL = "https://collegefootballplayoff.com/rankings.aspx"
NCAA_ORIGIN_URL = "https://www.ncaa.com/scoreboard/football/fbs"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def fetch_json(url: str) -> dict[str, Any]:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "StegVerse-CFP-Live-Tracker/2026 (+https://stegverse.org)",
        },
    )
    with urlopen(request, timeout=25) as response:  # nosec B310 - HTTPS public-data endpoints only
        value = json.loads(response.read().decode("utf-8"))
    if not isinstance(value, dict):
        raise ValueError("expected a JSON object")
    return value


def team_name(team: dict[str, Any]) -> str:
    names = team.get("names") or {}
    if isinstance(names, dict):
        return str(names.get("full") or names.get("short") or names.get("seo") or "TBD")
    return "TBD"


def numeric_score(value: Any) -> int | None:
    text = str(value or "").strip()
    return int(text) if text.isdigit() else None


def kickoff_from_epoch(value: Any) -> str | None:
    try:
        epoch = float(value)
    except (TypeError, ValueError):
        return None
    if epoch > 10_000_000_000:
        epoch /= 1000.0
    try:
        return datetime.fromtimestamp(epoch, tz=timezone.utc).isoformat().replace("+00:00", "Z")
    except (OverflowError, OSError, ValueError):
        return None


def conference_name(team: dict[str, Any]) -> str:
    conferences = team.get("conferences") or []
    if conferences and isinstance(conferences[0], dict):
        return str(conferences[0].get("conferenceName") or conferences[0].get("conferenceSeo") or "")
    return ""


def parse_ncaa_games(payload: dict[str, Any]) -> list[dict[str, Any]]:
    games: list[dict[str, Any]] = []
    for wrapper in payload.get("games") or []:
        if not isinstance(wrapper, dict):
            continue
        game = wrapper.get("game") if isinstance(wrapper.get("game"), dict) else wrapper
        if not isinstance(game, dict):
            continue
        home = game.get("home") or {}
        away = game.get("away") or {}
        if not isinstance(home, dict) or not isinstance(away, dict):
            continue
        state = str(game.get("gameState") or "").lower()
        final_message = str(game.get("finalMessage") or "").strip()
        if state == "final":
            status = final_message or "Final"
        elif state == "live":
            period = str(game.get("currentPeriod") or "").strip()
            clock = str(game.get("contestClock") or "").strip()
            status = " ".join(part for part in (period, clock) if part) or "Live"
        else:
            status = str(game.get("startTime") or "Scheduled")
        kickoff = kickoff_from_epoch(game.get("startTimeEpoch"))
        games.append(
            {
                "id": str(game.get("gameID") or game.get("id") or ""),
                "home": team_name(home),
                "away": team_name(away),
                "home_score": numeric_score(home.get("score")),
                "away_score": numeric_score(away.get("score")),
                "home_record": "",
                "away_record": "",
                "status": status,
                "kickoff": kickoff,
                "conference": conference_name(home) or conference_name(away),
                "note": str(game.get("title") or game.get("network") or ""),
            }
        )
    return games


def parse_rank(value: Any) -> int | None:
    match = re.search(r"\d+", str(value or ""))
    return int(match.group(0)) if match else None


def strip_first_place_votes(value: Any) -> str:
    text = str(value or "").strip()
    return re.sub(r"\s+\(\d+\)\s*$", "", text).strip()


def parse_ncaa_ap_poll(payload: dict[str, Any]) -> list[dict[str, Any]]:
    teams: list[dict[str, Any]] = []
    for row in payload.get("data") or []:
        if not isinstance(row, dict):
            continue
        rank = parse_rank(row.get("RANK"))
        team = strip_first_place_votes(row.get("SCHOOL (1ST VOTES)"))
        if rank is None or not team:
            continue
        teams.append({"rank": rank, "team": team, "record": "", "conference": ""})
    if not teams:
        return []
    return [
        {
            "name": str(payload.get("title") or "Associated Press Top 25"),
            "source_id": "2",
            "updated": payload.get("updated"),
            "teams": teams,
        }
    ]


def source_state(source_id: str, label: str, url: str, status: str, error: str | None = None, origin: str | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"id": source_id, "label": label, "url": url, "status": status, "error": error}
    if origin:
        result["origin"] = origin
    return result


def main() -> int:
    fetched_at = now_iso()
    current_year = datetime.now(timezone.utc).year
    source_errors: dict[str, str] = {}
    scoreboard: dict[str, Any] = {}
    ap_payload: dict[str, Any] = {}

    try:
        scoreboard = fetch_json(NCAA_SCOREBOARD_URL)
    except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        source_errors["scoreboard"] = f"{type(exc).__name__}: {exc}"

    try:
        ap_payload = fetch_json(NCAA_AP_URL)
    except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        source_errors["polls"] = f"{type(exc).__name__}: {exc}"

    games = parse_ncaa_games(scoreboard)
    polls = parse_ncaa_ap_poll(ap_payload)

    # No supporting poll may become a CFP committee ranking. A future current-season
    # CFP parser must populate this only from an observed CFP-authority source.
    rankings: list[dict[str, Any]] = []
    phase = "PRE_CFP_RANKINGS"
    rankings_state = "NOT_YET_PUBLISHED_OR_NOT_OBSERVED"

    data: dict[str, Any] = {
        "schema_version": "2.0.0",
        "season": current_year,
        "phase": phase,
        "last_updated": fetched_at,
        "freshness": {
            "generated_at": fetched_at,
            "current_season_only": True,
            "historical_rankings_carried_forward": False,
            "rankings_state": rankings_state,
            "source_errors": source_errors,
            "supporting_source_observed": bool(games or polls),
        },
        "sources": [
            source_state("1", "College Football Playoff", CFP_OFFICIAL_URL, "NOT_YET_OBSERVED_FOR_CURRENT_SEASON"),
            source_state(
                "2",
                "NCAA-derived AP Top 25 JSON (henrygd/ncaa-api)",
                NCAA_AP_URL,
                "AVAILABLE" if polls else ("UNAVAILABLE" if "polls" in source_errors else "NO_CURRENT_DATA_OBSERVED"),
                source_errors.get("polls"),
                "https://www.ncaa.com/rankings/football/fbs/associated-press",
            ),
            source_state(
                "3",
                "NCAA-derived FBS scoreboard JSON (henrygd/ncaa-api)",
                NCAA_SCOREBOARD_URL,
                "AVAILABLE" if games else ("UNAVAILABLE" if "scoreboard" in source_errors else "NO_CURRENT_EVENTS_OBSERVED"),
                source_errors.get("scoreboard"),
                NCAA_ORIGIN_URL,
            ),
        ],
        "cfp_source_id": "1",
        "conf_source_id": None,
        "rankings": rankings,
        "polls": polls,
        "conferences": [],
        "games": games,
        "availability": {
            "cfp_rankings": rankings_state,
            "games": "AVAILABLE" if games else ("SOURCE_UNAVAILABLE" if "scoreboard" in source_errors else "NO_CURRENT_EVENTS_OBSERVED"),
            "polls": "AVAILABLE" if polls else ("SOURCE_UNAVAILABLE" if "polls" in source_errors else "NO_CURRENT_POLLS_OBSERVED"),
            "conference_standings": "NOT_YET_CANONICALLY_INGESTED",
        },
        "historical_reference": {
            "season": 2025,
            "path": "/sports/ncaaf/2025/",
            "included_in_current_rankings": False,
        },
        "authority": {
            "sports_officiating": False,
            "wagering": False,
            "ticketing": False,
            "governance": False,
            "publication": False,
        },
    }

    OUTPUT_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"CFP_INGESTION=PASS season={current_year} phase={phase} games={len(games)} polls={len(polls)} rankings=0")
    if source_errors:
        print("CFP_SOURCE_WARNINGS=" + json.dumps(source_errors, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
