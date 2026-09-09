#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "data" / "off-github-publication-evidence-template.json"
SOURCE = ROOT / "data" / "source-publication-recovery.json"


def die(message: str) -> None:
    raise SystemExit(f"OFF_GITHUB_PUBLICATION_EVIDENCE_FAIL: {message}")


def main() -> None:
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    source = json.loads(SOURCE.read_text(encoding="utf-8"))

    if evidence.get("schema") != "stegverse.site.off_github_publication_evidence.v1":
        die("unexpected evidence schema")
    if evidence.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        die("wrong goal binding")
    if evidence.get("cosv_id") != "50000000102000":
        die("wrong COSV binding")

    recovery = evidence.get("source_recovery_bundle", {})
    observation = source.get("current_observation", {})
    if recovery.get("source_commit") != observation.get("external_recovery_source_commit"):
        die("source commit differs from externally restored recovery bundle")
    if recovery.get("archive_sha256") != observation.get("external_recovery_archive_sha256"):
        die("archive digest differs from externally restored recovery bundle")
    if recovery.get("manifest_entry_count") != observation.get("external_recovery_manifest_entries"):
        die("manifest entry count differs from externally restored recovery bundle")

    origin = evidence.get("publication_origin", {})
    if origin.get("github_hosted") is not False:
        die("publication origin template permits GitHub hosting")
    if origin.get("provider_is_canonical_state_owner") is not False:
        die("publication provider is marked canonical state owner")
    if origin.get("runtime_authority") != "NONE" or origin.get("activation_effect") != "NONE":
        die("publication provider is granted runtime authority or activation effect")

    obs = evidence.get("observation", {})
    # This tracked file is an unobserved template. Authentic evidence must be recorded
    # separately before any publication/equivalence predicate can become true.
    for key in (
        "publication_observed",
        "tls_observed",
        "public_content_equivalence_observed",
        "canonical_domain_observed",
    ):
        if obs.get(key) is not False:
            die(f"template prematurely claims observation: {key}")

    eq = evidence.get("equivalence", {})
    if eq.get("comparison_method") != "EXACT_PATH_AND_SHA256":
        die("publication equivalence method is not exact path + SHA-256")
    for key in ("mismatched_paths", "missing_paths", "unexpected_paths"):
        if eq.get(key) != []:
            die(f"template contains unverified path result: {key}")
    for key in (
        "expected_manifest_sha256",
        "observed_manifest_sha256",
        "expected_path_count",
        "observed_path_count",
    ):
        if eq.get(key) is not None:
            die(f"template contains unobserved equivalence value: {key}")

    tls = evidence.get("tls", {})
    if tls.get("hostname") != source.get("current_public_domain"):
        die("TLS hostname differs from canonical public domain")
    if tls.get("certificate_observed") is not False:
        die("template prematurely claims TLS certificate observation")
    for key in ("certificate_fingerprint_sha256", "not_before", "not_after"):
        if tls.get(key) is not None:
            die(f"template contains unobserved TLS value: {key}")

    provenance = evidence.get("provenance", {})
    for key in ("observed_at", "observation_surface", "receipt_ref"):
        if provenance.get(key) is not None:
            die(f"template contains unobserved provenance: {key}")

    if evidence.get("authority_effect") != "NONE" or evidence.get("activation_effect") != "NONE":
        die("publication evidence template asserts authority or activation")

    print("OFF_GITHUB_PUBLICATION_EVIDENCE_CONTRACT=PASS")
    print("PUBLICATION_OBSERVED=false")
    print("TLS_OBSERVED=false")
    print("PUBLIC_CONTENT_EQUIVALENCE_OBSERVED=false")
    print("PUBLICATION_EQUIVALENCE_METHOD=EXACT_PATH_AND_SHA256")


if __name__ == "__main__":
    main()
