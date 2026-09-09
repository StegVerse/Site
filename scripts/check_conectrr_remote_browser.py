#!/usr/bin/env python3
"""Execute default-clean and explicit-opt-in Conectrr paths in a real headless browser."""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "conectrr-remote-browser-verification.json"
BASE_URL = os.environ.get(
    "STEGVERSE_PAGES_BASE_URL", "https://stegverse-labs.github.io/Site"
).rstrip("/")
DEFAULT_URL = f"{BASE_URL}/ecosystem-chat.html"
OPT_IN_URL = f"{DEFAULT_URL}?conectrr-fixture=1"
SOURCE_ID = "event:conectrr:handoff:001"
DECISION_ID = "event:stegverse:evaluation:001"


def write_report(payload: dict) -> None:
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    payload: dict = {
        "schema": "stegverse.conectrr.remote-browser-verification.v2",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "default_url": DEFAULT_URL,
        "opt_in_url": OPT_IN_URL,
        "passed": False,
        "default_path_clean": False,
        "markers": {},
        "records": {},
        "correlation": {},
        "authority_effect": "none",
        "claims_not_created": [
            "live_external_interoperability",
            "custody",
            "certification",
            "authorization_to_operate",
            "admissibility",
            "execution_authority",
        ],
    }
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(DEFAULT_URL, wait_until="networkidle", timeout=60_000)
            default_events = page.evaluate(
                """() => window.StegVerseCanonicalEventStream?.getEvents?.()
                  .filter(e => e.event_id === 'event:conectrr:handoff:001' ||
                               e.event_id === 'event:stegverse:evaluation:001') || []"""
            )
            default_markers = page.evaluate(
                """() => ({
                  opt_in: document.documentElement.dataset.conectrrFixtureOptIn || null,
                  interop: document.documentElement.dataset.conectrrInterop || null,
                  browser_test: document.documentElement.dataset.conectrrBrowserTest || null,
                  export_replay: document.documentElement.dataset.conectrrExportReplay || null
                })"""
            )
            default_path_clean = len(default_events) == 0 and default_markers.get("interop") in {None, "disabled"}

            page.goto(OPT_IN_URL, wait_until="networkidle", timeout=60_000)
            page.wait_for_function(
                """() => document.documentElement.dataset.conectrrInterop === 'loaded' &&
                document.documentElement.dataset.conectrrBrowserTest === 'pass' &&
                document.documentElement.dataset.conectrrExportReplay === 'pass'""",
                timeout=45_000,
            )
            markers = page.evaluate(
                """() => ({
                  opt_in: document.documentElement.dataset.conectrrFixtureOptIn,
                  interop: document.documentElement.dataset.conectrrInterop,
                  browser_test: document.documentElement.dataset.conectrrBrowserTest,
                  export_replay: document.documentElement.dataset.conectrrExportReplay
                })"""
            )
            source = page.locator(f'[data-event-id="{SOURCE_ID}"]')
            decision = page.locator(f'[data-event-id="{DECISION_ID}"]')
            source_count = source.count()
            decision_count = decision.count()

            page.evaluate(
                """(id) => window.StegVerseCanonicalEventStream.selectEvent(id, 'governed')""",
                SOURCE_ID,
            )
            source_to_decision = page.locator(
                f'[data-event-id="{DECISION_ID}"].correlated-active'
            ).count() > 0

            page.evaluate(
                """(id) => window.StegVerseCanonicalEventStream.selectEvent(id, 'governed')""",
                DECISION_ID,
            )
            decision_to_source = page.locator(
                f'[data-event-id="{SOURCE_ID}"].correlated-active'
            ).count() > 0

            events = page.evaluate(
                """() => window.StegVerseCanonicalEventStream.getEvents()
                  .filter(e => e.event_id === 'event:conectrr:handoff:001' ||
                               e.event_id === 'event:stegverse:evaluation:001')"""
            )
            browser.close()

        passed = (
            default_path_clean
            and markers == {
                "opt_in": "true",
                "interop": "loaded",
                "browser_test": "pass",
                "export_replay": "pass",
            }
            and source_count >= 1
            and decision_count >= 1
            and source_to_decision
            and decision_to_source
            and len(events) == 2
            and events[1].get("parent_event_id") == SOURCE_ID
            and SOURCE_ID in events[1].get("evidence_refs", [])
        )
        payload.update(
            {
                "passed": passed,
                "default_path_clean": default_path_clean,
                "default_markers": default_markers,
                "default_fixture_event_count": len(default_events),
                "markers": markers,
                "records": {
                    "source_render_count": source_count,
                    "decision_render_count": decision_count,
                    "canonical_event_count": len(events),
                },
                "correlation": {
                    "source_to_decision": source_to_decision,
                    "decision_to_source": decision_to_source,
                    "parent_reference_resolved": len(events) == 2
                    and events[1].get("parent_event_id") == SOURCE_ID,
                    "evidence_reference_resolved": len(events) == 2
                    and SOURCE_ID in events[1].get("evidence_refs", []),
                },
            }
        )
    except (PlaywrightTimeoutError, Exception) as error:
        payload["error"] = repr(error)

    write_report(payload)
    print("CONECTRR_REMOTE_BROWSER_CHECK=PASS" if payload["passed"] else "CONECTRR_REMOTE_BROWSER_CHECK=FAIL")
    print(f"default_url={DEFAULT_URL}")
    print(f"opt_in_url={OPT_IN_URL}")
    print(f"default_path_clean={str(payload.get('default_path_clean', False)).lower()}")
    print("authority_effect=none")
    return 0 if payload["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
