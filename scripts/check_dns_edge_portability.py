#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "dns-edge-portability.json"
CNAME = ROOT / "CNAME"

FORBIDDEN_REQUIRED_PROVIDER_MARKERS = (
    "cloudflare",
    "github",
    "render",
    "vercel",
    "netlify",
    "trycloudflare",
)


def die(message: str) -> None:
    raise SystemExit(f"DNS_EDGE_PORTABILITY_FAIL: {message}")


def main() -> None:
    body = json.loads(MANIFEST.read_text(encoding="utf-8"))
    cname = CNAME.read_text(encoding="utf-8").strip()

    if body.get("schema") != "stegverse.site.dns_edge_portability.v1":
        die("unexpected schema")
    if body.get("goal_id") != "SITE-497-THIRD-PARTY-DEPENDENCY-ERADICATION":
        die("wrong goal binding")
    if body.get("cosv_id") != "50000000102000":
        die("wrong COSV binding")
    if body.get("canonical_public_domain") != "stegverse.org":
        die("canonical public domain mismatch")
    binding = body.get("repository_domain_binding", {})
    if binding.get("source") != "CNAME" or binding.get("expected_value") != cname:
        die("repository CNAME does not match portability manifest")

    zone = body.get("zone_model", {})
    if zone.get("format") != "PROVIDER_NEUTRAL_RRSET_INTENT_V1":
        die("zone model is not provider-neutral")
    if zone.get("canonical_state_owner") != "STEGVERSE":
        die("zone model canonical state owner mismatch")
    if zone.get("external_provider_state_is_canonical") is not False:
        die("external provider state is marked canonical")

    for group in ("required_records", "compatibility_aliases"):
        entries = zone.get(group, [])
        if not isinstance(entries, list) or not entries:
            die(f"{group} missing")
        for entry in entries:
            if entry.get("required_provider") is not None:
                die(f"provider requirement present in {group}: {entry.get('name')}")
            target = entry.get("provider_specific_target")
            if target is not None:
                die(f"provider-specific target present in {group}: {entry.get('name')}")
            joined = json.dumps(entry).lower()
            for marker in FORBIDDEN_REQUIRED_PROVIDER_MARKERS:
                if f'"required_provider": "{marker}' in joined:
                    die(f"required provider marker present: {marker}")

    recovery = body.get("recovery_contract", {})
    if recovery.get("credential_material_in_repository") is not False:
        die("repository credential material is permitted")
    if recovery.get("automatic_provider_mutation") is not False:
        die("automatic provider mutation is enabled")
    if recovery.get("automatic_cutover") is not False:
        die("automatic cutover is enabled")
    steps = recovery.get("steps", [])
    for required in (
        "verify canonical domain identity and CNAME repository binding",
        "verify TLS issuance/recovery for stegverse.org",
        "record provider, nameserver, record, TLS, and public-observation evidence",
        "only then retire the previous provider path",
    ):
        if required not in steps:
            die(f"recovery step missing: {required}")

    failure = body.get("failure_semantics", {})
    for key in (
        "dns_provider_outage_must_not_destroy_canonical_state",
        "edge_provider_outage_must_not_destroy_canonical_state",
        "provider_credentials_must_not_be_required_for_source_reconstruction",
    ):
        if failure.get(key) is not True:
            die(f"required failure semantic missing: {key}")
    for key in (
        "migration_is_proven_by_manifest_alone",
        "tls_recovery_is_proven_by_manifest_alone",
        "public_outage_equivalence_is_proven_by_manifest_alone",
    ):
        if failure.get(key) is not False:
            die(f"manifest overclaims proof: {key}")

    observation = body.get("current_observation", {})
    if observation.get("provider_neutral_cutover_observed") is not False:
        die("provider-neutral cutover is prematurely claimed")
    if observation.get("tls_recovery_observed") is not False:
        die("TLS recovery is prematurely claimed")
    if observation.get("single_vendor_outage_equivalence_observed") is not False:
        die("single-vendor outage equivalence is prematurely claimed")
    if observation.get("exact_registrar_inventory") != "PENDING_AUTHENTIC_OBSERVATION":
        die("registrar inventory must remain pending until authentically observed")
    if observation.get("exact_authoritative_nameserver_inventory") != "PENDING_AUTHENTIC_OBSERVATION":
        die("authoritative nameserver inventory must remain pending until authentically observed")

    if body.get("authority_effect") != "NONE" or body.get("activation_effect") != "NONE":
        die("portability manifest asserts authority or activation")

    print("DNS_EDGE_PORTABILITY=PASS")
    print("CANONICAL_PUBLIC_DOMAIN=stegverse.org")
    print("DNS_EDGE_PROVIDER_REQUIRED=false")
    print("DNS_EDGE_CANONICAL_STATE_OWNER=STEGVERSE")
    print("DNS_EDGE_MIGRATION_PROVEN=false")
    print("DNS_EDGE_TLS_RECOVERY_PROVEN=false")


if __name__ == "__main__":
    main()
