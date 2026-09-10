#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

required = [
    ROOT / "docs" / "MY_KV_DIRECTORY_LANDING_MIRROR_HANDOFF.md",
    ROOT / "docs" / "MY_KV_CONNECTED_ACCOUNTS_MIRROR_HANDOFF.md",
    ROOT / "my-kv.html",
    ROOT / "my-kv-directory.html",
    ROOT / "my-kv-connected-accounts.html",
    ROOT / "assets" / "my-kv-directory.js",
    ROOT / "assets" / "my-kv-connected-accounts.js",
    ROOT / "assets" / "my-kv-portable-direct-source-bridge.js",
    ROOT / "assets" / "my-kv-device-kv-query-bridge.js",
    ROOT / "tests" / "my-kv-directory.test.cjs",
    ROOT / "tests" / "my-kv-connected-accounts.test.cjs",
]

for path in required:
    if not path.exists():
        raise SystemExit(f"missing required My KV directory file: {path.relative_to(ROOT)}")

landing = (ROOT / "my-kv.html").read_text(encoding="utf-8")
browser = (ROOT / "my-kv-directory.html").read_text(encoding="utf-8")
accounts_page = (ROOT / "my-kv-connected-accounts.html").read_text(encoding="utf-8")
js = (ROOT / "assets" / "my-kv-directory.js").read_text(encoding="utf-8")
accounts_js = (ROOT / "assets" / "my-kv-connected-accounts.js").read_text(encoding="utf-8")
portable = (ROOT / "assets" / "my-kv-portable-direct-source-bridge.js").read_text(encoding="utf-8")
query_bridge = (ROOT / "assets" / "my-kv-device-kv-query-bridge.js").read_text(encoding="utf-8")

for text in [
    "Your continuity directories",
    "Connected Accounts",
    "Pictures & Media",
    "Music",
    "Email",
    "Finance",
    "Assets",
    "Liabilities",
]:
    if text not in landing and text not in js:
        raise SystemExit(f"missing My KV directory label/contract: {text}")

for canonical in [
    "_Vault/SKAP/Accounts",
    "03_Records/Finance",
    "03_Records/Assets",
    "03_Records/Liabilities",
    "03_Records/Email",
    "04_Media/Music",
    "04_Media/Pictures",
]:
    if canonical not in js:
        raise SystemExit(f"missing canonical directory mapping: {canonical}")

if "my-kv-connected-accounts.html" not in js:
    raise SystemExit("Connected Accounts must route to its dedicated selection surface")
for marker in ["Find connected accounts", "Add selected to My KV", "You choose each account", "StegVerseKVAccountObservationBridge"]:
    if marker not in accounts_page:
        raise SystemExit(f"Connected Accounts UI contract missing: {marker}")
for marker in ["synthetic_input_allowed:false", "raw_provider_identifiers_present:false", "credential_material_present:false", "FAIL_CLOSED"]:
    if marker not in accounts_js:
        raise SystemExit(f"Connected Accounts bounded-population contract missing: {marker}")

if "StegVerseKVDirectoryBridge" not in browser:
    raise SystemExit("directory browser must use canonical KV directory bridge")
if "StegVerseKVDirectSourceBridge" not in browser:
    raise SystemExit("directory browser must expose direct-source SKAP bridge")
if "StegVerseKVConnectionHealthBridge" not in landing:
    raise SystemExit("My KV landing must consume canonical connection-health bridge")
if "SKAP_VAULT" not in js or "direct_source_required" not in js:
    raise SystemExit("direct-source SKAP contract missing")

if "BRIDGE_UNAVAILABLE" not in js or "FAIL_CLOSED" not in js:
    raise SystemExit("directory source must preserve fail-closed behavior")
if "PORTABLE_OWNER_CONTROLLED_FILE_STAGING" not in portable:
    raise SystemExit("portable owner-controlled direct-source bridge missing")
for marker in ["QUEUED_FOR_KV_ADMISSION", "queueIntrMaterializationRequest", "credential_requirement:\"NONE\"", "canonical_kv_persistence_observed:false", "stegverse.kv.portable-direct-source-inline-payload/v1", "portable_payload:inlinePayload", "content_base64"]:
    if marker not in portable:
        raise SystemExit(f"portable direct-source staging contract missing: {marker}")
generated = (ROOT / "assets" / "generated" / "site-browser-intr-connectors.js").read_text(encoding="utf-8")
for marker in ["DEVICE_SYSTEM", "KnowledgeVault:Interlock", "continuity-vault-kit#79", "materialization_extension_fields", "kv_request"]:
    if marker not in generated:
        raise SystemExit(f"canonical generated DEVICE_KV contract missing: {marker}")
if "assets/my-kv-portable-direct-source-bridge.js" not in browser:
    raise SystemExit("directory page must load portable direct-source fallback")
if "assets/my-kv-device-kv-query-bridge.js" not in browser:
    raise SystemExit("directory page must load canonical DEVICE_KV query-return bridge")
for marker in [
    "StegVerseKVDirectoryBridge",
    "StegVerseKVConnectionHealthBridge",
    "StegVerseKVInstallationStatusBridge",
    "StegVerseKVQueryBridgeModuleState",
    "DEVICE_KV_QUERY_RETURN",
    "response_transported_on_hb_derived_carrier",
    "MY_KV_INSTALLATION_STATUS",
    "stegverse.kv.installation-status-projection/v1",
    "getInstallationStatus:function()",
]:
    if marker not in query_bridge:
        raise SystemExit(f"canonical DEVICE_KV query bridge asset incomplete: {marker}")
if "assets/my-kv-device-kv-query-bridge.js?v=" not in browser:
    raise SystemExit("directory page must version the canonical DEVICE_KV query bridge asset")
if "ensureQueryBridge()" not in browser or "ensureHealthBridge()" not in landing:
    raise SystemExit("My KV pages must verify/recover canonical DEVICE_KV query bridge initialization")
if "ensureInstallationStatusBridge()" not in landing or "readLiveInstallationStatus()" not in landing:
    raise SystemExit("My KV Step 2 must verify/recover live DEVICE_KV installation-status bridge")
if landing.find("readLiveInstallationStatus()", landing.find('document.getElementById("kv-install").addEventListener')) > landing.find("installBridge.installAndVerify()", landing.find('document.getElementById("kv-install").addEventListener')):
    raise SystemExit("My KV Step 2 must attempt live DEVICE_KV status before portable receipt fallback")
if "assets/generated/site-browser-intr-connectors.js" not in browser:
    raise SystemExit("directory page must load canonical generated InTr connector")
if "KnowledgeVault:DirectSourceIngress" in portable or "continuity-vault-kit#108" in portable:
    raise SystemExit("portable direct-source packet must target canonical resident DEVICE_KV ingress")
if "inline://materialization_request.portable_payload" not in portable:
    raise SystemExit("portable direct-source packet must carry resident-consumable inline payload")
for marker in ["REVALIDATION_REQUIRED", "credential_material_present", "provider_operation_authorized", "connection-health-request"]:
    if marker not in js:
        raise SystemExit(f"connection-health contract missing: {marker}")

for forbidden in ["type=\"password\"", "access_token", "refresh_token", "private_key"]:
    if forbidden == "type=\"password\"" and forbidden in landing + browser + accounts_page:
        raise SystemExit("secret-bearing input field prohibited")

print("My KV directory static checks: PASS")
