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

    if selection.get("schema") != "stegverse.site.publication_origin_selection.v1":
        die("unexpected origin-selection schema")
    if selection.get("selection_basis") != "PROVIDER_NEUTRAL_NO_HOSTED_ORIGIN_SELECTED":
        die("publication origin is not provider-neutral/unselected")
    if selection.get("selection_state") != "NO_HOSTED_ORIGIN_SELECTED":
        die("hosted publication origin is selected")
    if selection.get("selected_origin") is not None:
        die("a hosted publication origin is selected")
    if "RENDER" not in selection.get("prohibited_providers_for_this_lane", []):
        die("Render is not explicitly prohibited for this lane")

    rejected = selection.get("historical_rejected_materialization", {})
    if rejected.get("provider") != "RENDER" or rejected.get("disposition") != "REJECTED_DO_NOT_USE":
        die("rejected Render materialization provenance missing")
    if rejected.get("canonical_dependency") is not False or rejected.get("eligible_for_equivalence_proof") is not False or rejected.get("eligible_for_dns_binding") is not False:
        die("rejected Render materialization remains eligible for use")

    origin = evidence.get("publication_origin", {})
    if origin.get("provider_identity") is not None or origin.get("origin_url") is not None:
        die("publication evidence selects a provider")
    if origin.get("github_hosted") is not False or origin.get("provider_is_canonical_state_owner") is not False:
        die("publication origin violates provider-independence boundary")
    if origin.get("runtime_authority") != "NONE" or origin.get("activation_effect") != "NONE":
        die("publication provider is granted runtime authority or activation effect")

    obs = evidence.get("observation", {})
    for key in ("provider_live_state_observed", "publication_observed", "tls_observed", "public_content_equivalence_observed", "canonical_domain_observed"):
        if obs.get(key) is not False:
            die(f"evidence prematurely claims observation: {key}")

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
    for key in ("observed_at", "observation_surface", "receipt_ref"):
        if provenance.get(key) is not None:
            die(f"provider-neutral template contains provider observation provenance: {key}")

    if evidence.get("authority_effect") != "NONE" or evidence.get("activation_effect") != "NONE":
        die("publication evidence asserts authority or activation")

    print("OFF_GITHUB_PUBLICATION_EVIDENCE_CONTRACT=PASS")
    print("PUBLICATION_ORIGIN_SELECTED=false")
    print("RENDER_ALLOWED=false")
    print("INDEPENDENT_PUBLICATION_OBSERVED=false")
    print("TLS_OBSERVED=false")
    print("PUBLIC_CONTENT_EQUIVALENCE_OBSERVED=false")


if __name__ == "__main__":
    main()
