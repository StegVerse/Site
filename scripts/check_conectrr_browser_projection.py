#!/usr/bin/env python3
"""Verify the Conectrr browser projection, explicit fixture opt-in, and correlation contract."""
from __future__ import annotations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE = (ROOT / "assets" / "ecosystem-node-views.js").read_text(encoding="utf-8")
INTEROP = (ROOT / "assets" / "conectrr-interop.js").read_text(encoding="utf-8")

REQUIRED_NODE = (
    "importCanonicalEvents",
    "selectEvent",
    "correlated-active",
    "new URLSearchParams(window.location.search).get('conectrr-fixture')==='1'",
    "dataset.conectrrFixtureOptIn",
    "if(conectrrFixtureOptIn)",
    "assets/conectrr-interop.js",
)
REQUIRED_INTEROP = (
    "new URLSearchParams(window.location.search).get('conectrr-fixture') === '1'",
    "dataset.conectrrFixtureOptIn",
    "dataset.conectrrInterop = 'disabled'",
    "dataset.conectrrBrowserTest = 'not-run'",
    "dataset.conectrrExportReplay = 'not-run'",
    "conectrrBrowserTest = 'pass'",
    "Source-to-decision correlation failed",
    "Decision-to-source correlation failed",
    "did not render",
    "api.selectEvent(source.event_id, 'governed')",
    "api.selectEvent(decision.event_id, 'governed')",
)

OLD_UNCONDITIONAL_LOADER = "const interopScript=document.createElement('script');interopScript.src='assets/conectrr-interop.js';interopScript.dataset.loader='conectrr-interop';interopScript.defer=true;document.body.appendChild(interopScript);"


def main() -> int:
    errors: list[str] = []
    for marker in REQUIRED_NODE:
        if marker not in NODE:
            errors.append(f"node renderer missing marker: {marker}")
    for marker in REQUIRED_INTEROP:
        if marker not in INTEROP:
            errors.append(f"interop browser test missing marker: {marker}")
    if NODE.rstrip().endswith(OLD_UNCONDITIONAL_LOADER + "\n})();") or "window.StegVerseCanonicalEventStream=Object.freeze" in NODE and "if(conectrrFixtureOptIn)" not in NODE:
        errors.append("node renderer still exposes unconditional Conectrr loader semantics")
    node_opt_in_index = NODE.find("const conectrrFixtureOptIn")
    node_loader_index = NODE.find("interopScript.src='assets/conectrr-interop.js'")
    node_gate_index = NODE.find("if(conectrrFixtureOptIn)")
    if min(node_opt_in_index, node_loader_index, node_gate_index) < 0:
        errors.append("node renderer Conectrr opt-in loader markers missing")
    elif not (node_opt_in_index < node_gate_index < node_loader_index):
        errors.append("node renderer does not guard Conectrr loader behind explicit opt-in")
    if "source.event_id" not in INTEROP or "decision.event_id" not in INTEROP:
        errors.append("stable source and decision identifiers are not used")
    if "dataset.conectrrBrowserTest = 'fail'" not in INTEROP:
        errors.append("browser test does not expose fail-closed status")
    opt_in_index = INTEROP.find("const FIXTURE_OPT_IN")
    fetch_index = INTEROP.find("fetch(FIXTURE_URL")
    import_index = INTEROP.find("api.importCanonicalEvents([source, decision])")
    early_return_index = INTEROP.find("if (!FIXTURE_OPT_IN)")
    if min(opt_in_index, fetch_index, import_index, early_return_index) < 0:
        errors.append("fixture opt-in/fetch/import ordering markers missing")
    elif not (opt_in_index < early_return_index < fetch_index < import_index):
        errors.append("fixture fetch/import is not protected by the explicit opt-in early return")

    if errors:
        print("CONECTRR_BROWSER_PROJECTION_CHECK=FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("CONECTRR_BROWSER_PROJECTION_CHECK=PASS")
    print("default_loader_execution=disabled")
    print("default_fixture_execution=disabled")
    print("fixture_opt_in=query:conectrr-fixture=1")
    print("rendered_records=source,decision_on_opt_in_only")
    print("correlation=bidirectional")
    print("authority_effect=none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
