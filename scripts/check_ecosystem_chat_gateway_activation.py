#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "ecosystem-chat-gateway.json"
CLIENT = ROOT / "assets" / "ecosystem-chat-transition-identity.js"
DISCOVERY = ROOT / "assets" / "ecosystem-chat-node-discovery.js"
HEALTH = ROOT / "assets" / "ecosystem-chat-gateway-health.js"
LOADER = ROOT / "assets" / "ecosystem-chat-hps.js"


def fail(message: str) -> int:
    print(f"ECOSYSTEM CHAT GATEWAY ACTIVATION: FAIL - {message}")
    return 1


def valid_advertisement_endpoint(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    if not parsed.path.endswith("/api/stegverse-node"):
        return False
    if parsed.scheme == "https":
        return bool(parsed.netloc)
    return parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"}


def main() -> int:
    for path in [CONFIG, CLIENT, DISCOVERY, HEALTH, LOADER]:
        if not path.exists():
            return fail(f"missing {path.relative_to(ROOT)}")
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    client = CLIENT.read_text(encoding="utf-8")
    discovery_source = DISCOVERY.read_text(encoding="utf-8")
    health = HEALTH.read_text(encoding="utf-8")
    loader = LOADER.read_text(encoding="utf-8")

    if config.get("schema_version") != "1.3.0":
        return fail("schema_version mismatch")
    if config.get("mode") != "SOVEREIGN_LOCAL_DISCOVERY_WITH_OPTIONAL_THIRD_PARTY_FALLBACKS":
        return fail("gateway mode must keep sovereign/local discovery primary")
    if config.get("enabled") is not False:
        return fail("static gateway must remain disabled until sovereign discovery succeeds")
    if config.get("endpoint") is not None or config.get("health_endpoint") is not None:
        return fail("static gateway endpoint and health endpoint must be null")
    if config.get("endpoint_role") != "SOVEREIGN_DISCOVERY_ONLY":
        return fail("static endpoint role must be sovereign discovery only")
    if config.get("fallback") != "LOCAL_CLASSIFICATION":
        return fail("fallback must remain LOCAL_CLASSIFICATION")

    discovery = config.get("discovery", {})
    if discovery.get("enabled") is not True:
        return fail("node discovery must be enabled")
    if discovery.get("required_node_id") != "ecosystem-chat-portable-node":
        return fail("portable-node identity binding mismatch")
    if discovery.get("selection_policy") != "FIRST_VALID_SOVEREIGN_LOCAL_ONLY":
        return fail("automatic discovery may select sovereign/local nodes only")
    advertisement_endpoints = discovery.get("advertisement_endpoints")
    required_loopback = [
        "http://127.0.0.1:8000/api/stegverse-node",
        "http://localhost:8000/api/stegverse-node",
    ]
    if advertisement_endpoints != required_loopback:
        return fail("automatic advertisement candidates must be exactly the two sovereign loopback endpoints")
    for value in advertisement_endpoints:
        if not valid_advertisement_endpoint(value):
            return fail(f"invalid node advertisement endpoint: {value}")
    if discovery.get("fallback") != "LOCAL_CLASSIFICATION_FAIL_CLOSED":
        return fail("discovery fallback must fail closed to local classification")

    fallbacks = config.get("optional_third_party_fallbacks")
    if not isinstance(fallbacks, list):
        return fail("optional_third_party_fallbacks missing")
    for item in fallbacks:
        if item.get("enabled_by_default") is not False:
            return fail("third-party fallback cannot be enabled by default")
        if item.get("selection_requires_explicit_runtime_opt_in") is not True:
            return fail("third-party fallback requires explicit runtime opt-in")
        if item.get("production_continuity_dependency") is not False:
            return fail("third-party fallback cannot be a production continuity dependency")
        if item.get("activation_dependency") is not False:
            return fail("third-party fallback cannot be an activation dependency")
        if item.get("authority_effect") != "NONE":
            return fail("third-party fallback authority effect must be NONE")

    boundary = config.get("authority_boundary", {})
    for key in [
        "site_execution_authority",
        "gateway_execution_authority",
        "gateway_receipt_is_final",
        "master_records_authority",
        "node_discovery_grants_authority",
        "node_advertisement_is_publication_authority",
        "third_party_fallback_grants_authority",
    ]:
        if boundary.get(key) is not False:
            return fail(f"authority boundary must be false: {key}")

    for marker in [
        "transition_identity",
        "identity mismatch",
        "gateway_receipt_id",
        "final_receipt_id",
        "lifecycle_state",
        "master_record_status",
        "master_record_ref",
        "reconstruction_status",
        "sqlite_persisted",
        "storage_durable_across_restarts",
        "custody_submission",
        "provider_status",
        "provider_receipt_id",
        "estimated_cost_usd",
        "provider_output_is_authority",
        "DETERMINISTIC_FALLBACK",
        "EPHEMERAL_HOST_STORAGE",
        "LOCAL_CLASSIFICATION",
        "AbortController",
    ]:
        if marker not in client:
            return fail(f"client missing marker: {marker}")

    for marker in [
        "stegverse.node.endpoint-advertisement.v1",
        "advertisement.node_id !== discovery.required_node_id",
        "advertisement_sha256",
        "crypto.subtle.digest",
        "validGovernedEndpoint",
        "127.0.0.1",
        "localhost",
        "advertisementOrigin",
        "VERIFIED_LOOPBACK_NODE_ADVERTISEMENT",
        "HEALTH_BOUND_NODE_ADVERTISEMENT",
        "LOCAL_CLASSIFICATION_FAIL_CLOSED",
        "authority_granted !== false",
        "publication_authority !== false",
        "execution_authority !== false",
        "automatic_third_party_selection: false",
        "enabled: true",
        "enabled: false",
        "endpoint: null",
        "health_endpoint: null",
        "nativeFetch",
    ]:
        if marker not in discovery_source:
            return fail(f"node discovery binding missing marker: {marker}")
    if "onrender.com" in discovery_source or "vercel.app" in discovery_source or "netlify.app" in discovery_source:
        return fail("automatic node discovery contains third-party host identity")

    for marker in [
        "Governed gateway",
        "LOCAL FALLBACK",
        "UNAVAILABLE",
        "repository mutation",
        "custody overclaim",
        "sqlite_transition_store",
        "storage_durable_across_restarts",
        "Master-Records submission",
        "governed_provider_enabled",
        "provider_output_is_authority",
        "provider_failure_falls_back",
        "provider credentials are not exposed",
    ]:
        if marker not in health:
            return fail(f"health indicator missing marker: {marker}")

    discovery_loader = "assets/ecosystem-chat-node-discovery.js"
    transition_loader = "assets/ecosystem-chat-transition-identity.js"
    if discovery_loader not in loader or transition_loader not in loader:
        return fail("discovery or transition client is not loaded by Ecosystem Chat")
    if loader.index(discovery_loader) > loader.index(transition_loader):
        return fail("node discovery must load before transition client")
    if "assets/ecosystem-chat-gateway-health.js" not in loader:
        return fail("health indicator is not loaded by Ecosystem Chat")

    print("ECOSYSTEM CHAT GATEWAY ACTIVATION: PASS")
    print("THIRD_PARTY_AUTOMATIC_SELECTION=false")
    print("PRODUCTION_CONTINUITY_THIRD_PARTY_DEPENDENCY=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
