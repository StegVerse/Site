#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "source-publication-recovery.json"
DNS = ROOT / "data" / "dns-edge-portability.json"


def die(message: str) -> None:
    raise SystemExit(f"SOURCE_PUBLICATION_RECOVERY_FAIL: {message}")


def main() -> None:
    body = json.loads(MANIFEST.read_text(encoding="utf-8"))
    dns = json.loads(DNS.read_text(encoding="utf-8"))

    if body.get("schema") != "stegverse.site.source_publication_recovery.v1":
        die("unexpected schema")
    if body.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        die("wrong goal binding")
    if body.get("cosv_id") != "50000000102000":
        die("wrong COSV binding")
    if body.get("current_public_domain") != dns.get("canonical_public_domain"):
        die("public-domain binding differs from DNS portability contract")

    state = body.get("canonical_state", {})
    if state.get("owner") != "STEGVERSE":
        die("canonical source state owner mismatch")
    for key in ("github_is_canonical_state_owner", "publication_provider_is_canonical_state_owner"):
        if state.get(key) is not False:
            die(f"provider is still marked canonical: {key}")
    if state.get("runtime_authority_from_source_host") != "NONE":
        die("source host still has runtime authority")
    if state.get("activation_effect_from_source_host") != "NONE":
        die("source host still has activation effect")

    bundle = body.get("recovery_bundle_contract", {})
    if bundle.get("format") != "STEGVERSE_SITE_RECOVERY_BUNDLE_V1":
        die("unexpected recovery bundle format")
    for key in (
        "must_be_reconstructable_without_github_api",
        "must_be_validatable_without_github_actions",
        "must_not_require_github_token",
        "must_not_require_non_tv_tvc_secret",
        "must_not_embed_provider_credentials",
    ):
        if bundle.get(key) is not True:
            die(f"recovery bundle invariant missing: {key}")
    required_components = bundle.get("required_components", [])
    for component in (
        "complete repository source snapshot at an identified commit",
        "provider-neutral DNS/edge portability manifest",
        "repository-local deterministic validators",
        "cryptographic manifest of bundled paths and hashes",
    ):
        if component not in required_components:
            die(f"recovery bundle component missing: {component}")

    publication = body.get("publication_recovery_contract", {})
    if publication.get("required_provider") is not None or publication.get("required_platform") is not None:
        die("publication recovery requires a provider/platform")
    if publication.get("publication_origin_selection") != "EXPLICIT_ADMISSIBLE_ORIGIN_SELECTION":
        die("publication origin selection is not explicit")
    if publication.get("automatic_provider_selection") is not False:
        die("automatic publication provider selection enabled")
    if publication.get("automatic_external_mutation") is not False:
        die("automatic external mutation enabled")

    failure = body.get("failure_semantics", {})
    for key in (
        "github_outage_must_not_destroy_reconstructable_source",
        "github_actions_outage_must_not_block_local_validation",
        "github_pages_outage_must_not_destroy_publication_artifact",
        "replacement_provider_outage_must_not_destroy_canonical_state",
    ):
        if failure.get(key) is not True:
            die(f"failure semantic missing: {key}")
    for key in (
        "recovery_independence_is_proven_by_manifest_alone",
        "off_github_publication_is_proven_by_manifest_alone",
    ):
        if failure.get(key) is not False:
            die(f"manifest overclaims proof: {key}")

    observation = body.get("current_observation", {})
    for key in (
        "complete_recovery_bundle_materialized",
        "recovery_bundle_hash_manifest_observed",
        "off_github_source_restore_observed",
        "off_github_validation_observed",
        "off_github_publication_observed",
        "public_content_equivalence_observed",
    ):
        if observation.get(key) is not False:
            die(f"premature recovery/publication observation: {key}")

    if body.get("authority_effect") != "NONE" or body.get("activation_effect") != "NONE":
        die("recovery contract asserts authority or activation")

    print("SOURCE_PUBLICATION_RECOVERY=PASS")
    print("GITHUB_CANONICAL_STATE_OWNER=false")
    print("GITHUB_API_REQUIRED_FOR_RECONSTRUCTION=false")
    print("GITHUB_ACTIONS_REQUIRED_FOR_VALIDATION=false")
    print("PUBLICATION_PROVIDER_REQUIRED=false")
    print("OFF_GITHUB_RECOVERY_PROVEN=false")
    print("OFF_GITHUB_PUBLICATION_PROVEN=false")


if __name__ == "__main__":
    main()
