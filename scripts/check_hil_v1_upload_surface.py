#!/usr/bin/env python3
"""Fail-closed verification for the canonical HIL v1.x upload surface.

The upload contract is source-verifiable before a public receiver is activated.
Receiver discovery may therefore be either an exact configured same-origin HTTPS
receiver or the explicit fail-closed unconfigured state; source validation never
promotes the latter into runtime readiness.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "humans-as-interoperability-layer.html"
SCRIPT = ROOT / "assets" / "hil-direct-upload-v1.js"
GENERATED = ROOT / "assets" / "generated" / "site-browser-intr-connectors.js"
MANIFEST = ROOT / "data" / "hil-experiment.json"
RECEIVER_CONFIG = ROOT / "data" / "hil-receiver-config.json"
PRIMARY = ROOT / "data" / "HIL_Canonical_Paper_v1_1.pdf"
RESULT_PAGE = ROOT / "hil-accepted.html"
RESULT_SCRIPT = ROOT / "assets" / "hil-post-submit-continuity.js"
RECEIPT_PAGE = ROOT / "hil-receipt.html"

PRIMARY_HASH = "a7b1c62e336b4e244ecf7fdcd10af195401f6c44328de32615b073d2a5c3c462"
PROMPT_HASH = "cdff8d2266bb3eefbb6e5d28d9adc548e6c8dfc039debd72fe404f1d0249912c"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"HIL v1 upload verification failed: {message}")


def read(path: Path) -> str:
    require(path.is_file(), f"missing {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def main() -> None:
    page = read(PAGE)
    script = read(SCRIPT)
    generated = read(GENERATED)
    result_page = read(RESULT_PAGE)
    result_script = read(RESULT_SCRIPT)
    receipt_page = read(RECEIPT_PAGE)
    manifest = json.loads(read(MANIFEST))
    receiver = json.loads(read(RECEIVER_CONFIG))

    require(manifest.get("schema_version") == "HIL-EXPERIMENT-v1.1", "manifest is not canonical v1.1")
    require(manifest["primary_document"]["version"] == "v1.1", "Primary version is not v1.1")
    require(manifest["primary_document"]["sha256"] == PRIMARY_HASH, "manifest Primary hash mismatch")
    require(manifest["protocol"]["prompt_sha256"] == PROMPT_HASH, "manifest prompt hash mismatch")
    require(manifest["submission"]["provenance_manifest_required"] is True, "provenance must remain required")
    require(manifest["submission"]["provenance_schema_version"] == "HIL-RESPONSE-PROVENANCE-v1.1", "provenance schema mismatch")
    require(all(value is False for value in manifest["authority"].values()), "manifest authority must remain false")

    require(PRIMARY.is_file(), "canonical v1.1 Primary PDF missing")
    primary_bytes = PRIMARY.read_bytes()
    require(primary_bytes.startswith(b"%PDF-"), "canonical v1.1 Primary lacks PDF signature")
    require(hashlib.sha256(primary_bytes).hexdigest() == PRIMARY_HASH, "canonical v1.1 Primary bytes do not match manifest")

    for marker in (
        PRIMARY_HASH,
        PROMPT_HASH,
        'id="response-file"',
        "Submit Response Packet",
        "next Site page begins with the exact submission-result packet",
        "aria-live=\"polite\"",
    ):
        require(marker in page, f"page missing marker: {marker}")

    for marker in (
        "const INGRESS = '/api/hil/submissions'",
        "HIL-RESPONSE-PROVENANCE-v1.1",
        "HIL-RECEIVER-RECEIPT-v2",
        "stegverse.universal-intr-transport/v1",
        "stegverse.universal-intr-materialization-request/v1",
        "stageTransportPacket(file, bytes, digest, provenance, transportIntent)",
        "local_pretransport_staged: true",
        "intr_materialization_request: staged.materializationRequest",
        "request_grants_execution_authority:false",
        "claim_or_fence_minted:false",
        '"downstream_owner_ref":"StegVerse-Labs/.github#246"',
        "DEVICE_SYSTEM",
        "STEGOS_ECOSYSTEM",
        "HIL:Ingress",
        "intr_transport_intent",
        "event_triggered:true",
        "always_on_receiver_required:false",
        "second_user_device_required:false",
        "DURABLE_QUEUE_OR_EVENT_EPHEMERAL_MATERIALIZATION",
        "exact_packet_transport_retry_allowed:true",
        "blind_consequence_retry_allowed:false",
        "HIL_CUSTODY_TVC_INTERLOCK_ADMISSION",
        "INTR_TRANSPORT_PENDING",
        "new FormData()",
        "crypto.subtle.digest('SHA-256'",
        "response_pdf",
        "provenance_manifest",
        "participant_consent_authority_acknowledged",
        "EXACT_BYTES_PERSISTED",
        "RECORDED",
        "hil-accepted.html?submission_id=",
    ):
        require(marker in script + generated, f"client/generated connector missing marker: {marker}")

    require("/api/hil/upload" not in script, "legacy /api/hil/upload route remains in canonical client")
    require("governed_receiver_not_ready" not in script, "Submit still pre-gates transport on receiver readiness")
    require("const READINESS" not in script, "Submit still declares a readiness preflight dependency")

    for marker in (
        "intr_transport_intent",
        "intr_materialization_request",
        "SATISFIED_BY_DIRECT_RECEIVER_RECEIPT",
        "INTR_TRANSPORT_PENDING",
        "addEventListener('online'",
        "visibilitychange",
        "automatic retry",
        "always-on application receiver",
    ):
        require(marker in receipt_page, f"receipt continuation missing marker: {marker}")
    require("governed_receiver_not_ready" not in receipt_page, "receipt retry still blocks on receiver readiness")

    receiver_base = receiver.get("receiver_base_url")
    receiver_state = receiver.get("configuration_state")
    configured_same_origin = (
        receiver_base == "https://stegverse.org"
        and receiver_state == "CONFORMING_HTTPS_RECEIVER_CONFIGURED"
    )
    fail_closed_unconfigured = (
        receiver_base is None
        and receiver_state == "AWAITING_CONFORMING_HTTPS_RECEIVER"
    )
    require(configured_same_origin or fail_closed_unconfigured, "receiver discovery state invalid")
    require(receiver.get("participant_visible_provider") is False, "provider branding must remain hidden")
    require(receiver.get("readiness_path") == "/api/hil/readiness", "receiver readiness path mismatch")
    require(receiver.get("submission_path") == "/api/hil/submissions", "receiver submission path mismatch")
    require(receiver.get("transport_requirements", {}).get("embedded_credentials_allowed") is False, "embedded credentials must remain prohibited")
    require(all(value is False for value in receiver["authority"].values()), "receiver discovery config must not grant authority")

    require(result_page.find('id="submission-result-packet"') < result_page.find('id="next-lifecycle-stage"'), "result packet is not prepended")
    for marker in (
        "HIL-SUBMISSION-RESULT-PACKET-v1",
        "/api/hil/submissions/${encodeURIComponent(submissionId)}",
        "/api/hil/submissions/${encodeURIComponent(submissionId)}/content",
        "retrieved_packet_hash_mismatch",
        "publication_authorized: false",
        "master_record_append_authorized: false",
        "execution_authorized: false",
    ):
        require(marker in result_script, f"result projection missing marker: {marker}")

    require("GITHUB_TOKEN" not in script and "GITHUB_TOKEN" not in result_script, "GitHub token runtime authority introduced")
    require("Authorization" not in script and "Authorization" not in result_script, "browser credential header introduced")

    print("HIL_V1_UPLOAD_SURFACE=PASS")
    print("HIL_CANONICAL_VERSION=v1.1")
    print(f"HIL_PRIMARY_SHA256={PRIMARY_HASH}")
    print(f"HIL_PROMPT_SHA256={PROMPT_HASH}")
    print("HIL_RECEIVER_ROUTE=/api/hil/submissions")
    print("HIL_POST_SUBMIT_RESULT=HIL-SUBMISSION-RESULT-PACKET-v1")
    print("HIL_PRETRANSPORT_STAGING=EXACT_PACKET_PROVENANCE_INTENT_MATERIALIZATION_REQUEST")
    print("HIL_PENDING_TRANSPORT=EXACT_PACKET_HASH_BOUND_NONCUSTODIAL")
    print("HIL_TRANSPORT_PROTOCOL=InTr")
    print("HIL_INTERLOCK_PER_HOP=true")
    print("HIL_ALWAYS_ON_APPLICATION_RECEIVER_REQUIRED=false")
    print("HIL_SECOND_USER_DEVICE_REQUIRED=false")
    print("HIL_GITHUB_TOKEN_RUNTIME_AUTHORITY=NONE")
    print("HIL_AUTHORITY=NONE")
    print(f"HIL_RECEIVER_DISCOVERY_STATE={receiver_state}")
    print(f"HIL_PUBLIC_RECEIVER_READY_PROVEN={'true' if configured_same_origin else 'false'}")


if __name__ == "__main__":
    main()
