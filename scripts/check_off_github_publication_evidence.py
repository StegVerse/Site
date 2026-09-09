#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "data" / "off-github-publication-evidence-template.json"
CONTRACT = ROOT / "data" / "publication-equivalence-contract.json"
SOURCE = ROOT / "data" / "source-publication-recovery.json"
DISCOVERY = ROOT / "data" / "publication-origin-discovery-2026-09-09.json"
SELECTION = ROOT / "data" / "publication-origin-selection-2026-09-09.json"


def die(message: str) -> None:
    raise SystemExit(f"OFF_GITHUB_PUBLICATION_EVIDENCE_FAIL: {message}")


def main() -> None:
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    discovery = json.loads(DISCOVERY.read_text(encoding="utf-8"))
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))

    if evidence.get("schema") != "stegverse.site.off_github_publication_evidence.v1":
        die("unexpected evidence schema")
    if evidence.get("goal_id") != contract.get("goal_id") or evidence.get("cosv_id") != contract.get("cosv_id"):
        die("publication evidence does not bind canonical goal/COSV")

    recovery = evidence.get("source_recovery_bundle", {})
    observation = source.get("current_observation", {})
    if recovery.get("source_commit") != observation.get("external_recovery_source_commit"):
        die("source commit differs from externally restored recovery bundle")
    if recovery.get("archive_sha256") != observation.get("external_recovery_archive_sha256"):
        die("archive digest differs from externally restored recovery bundle")
    if recovery.get("manifest_entry_count") != observation.get("external_recovery_manifest_entries"):
        die("manifest entry count differs from externally restored recovery bundle")

    artifact = evidence.get("publication_artifact", {})
    if artifact.get("format") != contract.get("artifact_format"):
        die("publication artifact format mismatch")
    for key in ("manifest_sha256", "path_count"):
        if artifact.get(key) is not None:
            die(f"evidence prematurely claims independently compared artifact value: {key}")

    discovery_policy = discovery.get("selection_policy", {})
    if discovery_policy.get("automatic_provider_selection") is not False or discovery_policy.get("explicit_selection_required") is not True:
        die("origin-discovery policy mismatch")
    if discovery_policy.get("selected_origin") is not None:
        die("historical discovery record was mutated into selection state")

    selected = selection.get("selected_origin", {})
    if selection.get("schema") != "stegverse.site.publication_origin_selection.v1":
        die("unexpected origin-selection schema")
    if selection.get("selection_basis") != "EXPLICIT_BOUNDED_RECOVERY_ORIGIN_SELECTION":
        die("origin selection is not explicit bounded recovery selection")
    if selection.get("selection_state") != "MATERIALIZED_LIVE_PROVIDER_OBSERVED":
        die("selected origin is not recorded as live provider-observed")
    if selected.get("provider") != "RENDER" or selected.get("resource_strategy") != "NEW_DEDICATED_SERVICE":
        die("unexpected selected publication origin")
    if selected.get("auto_deploy") is not False:
        die("selected origin enables automatic deployment")
    if selected.get("provider_is_canonical_state_owner") is not False or selected.get("runtime_authority") != "NONE" or selected.get("activation_effect") != "NONE":
        die("selected provider gains canonical state/runtime/activation effect")
    if selection.get("service_id") != "srv-daght9ek1f9s73d1346g":
        die("materialized Render service id mismatch")
    if selection.get("origin_url") != "https://stegverse-site-recovery-origin.onrender.com":
        die("materialized Render origin URL mismatch")
    if selection.get("initial_deploy_id") != "dep-daght9uk1f9s73d1358g" or selection.get("initial_deploy_status_observed") != "live":
        die("initial Render deploy evidence mismatch")
    if selection.get("provider_build_artifact_entries_observed") != 1407 or selection.get("provider_build_artifact_pass_observed") is not True:
        die("provider artifact-build evidence mismatch")
    if selection.get("provider_http_head_root_200_observed") is not True or selection.get("provider_http_get_root_200_observed") is not True or selection.get("provider_primary_url_live_observed") is not True:
        die("provider live-state evidence incomplete")

    origin = evidence.get("publication_origin", {})
    if origin.get("provider_identity") != selected.get("provider") or origin.get("origin_url") != selection.get("origin_url"):
        die("evidence origin differs from materialized selection")
    if origin.get("github_hosted") is not False or origin.get("provider_is_canonical_state_owner") is not False:
        die("publication origin violates provider-independence boundary")
    if origin.get("runtime_authority") != "NONE" or origin.get("activation_effect") != "NONE":
        die("publication provider is granted runtime authority or activation effect")

    obs = evidence.get("observation", {})
    if obs.get("provider_live_state_observed") is not True:
        die("provider live-state observation missing")
    for key in ("publication_observed", "tls_observed", "public_content_equivalence_observed", "canonical_domain_observed"):
        if obs.get(key) is not False:
            die(f"evidence prematurely claims independent/public observation: {key}")

    eq = evidence.get("equivalence", {})
    if eq.get("comparison_method") != "EXACT_PATH_AND_SHA256":
        die("equivalence method is not exact path + SHA-256")
    for key in ("mismatched_paths", "missing_paths", "unexpected_paths"):
        if eq.get(key) != []:
            die(f"evidence contains unverified path result: {key}")
    for key in ("expected_manifest_sha256", "observed_manifest_sha256", "expected_path_count", "observed_path_count"):
        if eq.get(key) is not None:
            die(f"evidence contains unobserved equivalence value: {key}")

    tls = evidence.get("tls", {})
    if tls.get("hostname") != contract.get("canonical_public_domain"):
        die("TLS hostname differs from canonical public domain")
    if tls.get("certificate_observed") is not False:
        die("evidence prematurely claims canonical-domain TLS observation")
    for key in ("certificate_fingerprint_sha256", "not_before", "not_after"):
        if tls.get(key) is not None:
            die(f"evidence contains unobserved TLS value: {key}")

    provenance = evidence.get("provenance", {})
    if provenance.get("observation_surface") != "RENDER_PROVIDER_DEPLOY_AND_RUNTIME_LOGS":
        die("provider observation provenance surface mismatch")
    if provenance.get("receipt_ref") != "render:service:srv-daght9ek1f9s73d1346g:deploy:dep-daght9uk1f9s73d1358g":
        die("provider observation receipt ref mismatch")
    if not provenance.get("observed_at"):
        die("provider observation timestamp missing")

    if evidence.get("authority_effect") != "NONE" or evidence.get("activation_effect") != "NONE":
        die("publication evidence asserts authority or activation")

    print("OFF_GITHUB_PUBLICATION_EVIDENCE_CONTRACT=PASS")
    print("PUBLICATION_ORIGIN_SELECTED=true")
    print("PUBLICATION_ORIGIN_PROVIDER=RENDER")
    print("PUBLICATION_ORIGIN_MATERIALIZED=true")
    print("PROVIDER_LIVE_STATE_OBSERVED=true")
    print("INDEPENDENT_PUBLICATION_OBSERVED=false")
    print("TLS_OBSERVED=false")
    print("PUBLIC_CONTENT_EQUIVALENCE_OBSERVED=false")


if __name__ == "__main__":
    main()
