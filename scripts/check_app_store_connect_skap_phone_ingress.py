#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
CONFIG=ROOT/'assets/stegos-apple/app-store-connect-skap-ingress-config.json'
ROUTE=ROOT/'assets/stegos-apple/app-store-connect-skap-intr-route.json'
INGRESS=ROOT/'assets/stegos-apple/app-store-connect-skap-ingress.js'
SUBMIT=ROOT/'assets/stegos-apple/app-store-connect-skap-submission.js'
UI=ROOT/'assets/stegos-apple/app-store-connect-skap-ingress-ui.js'
PAGE=ROOT/'stegos-apple-credential.html'
HANDOFF=ROOT/'docs/APP_STORE_CONNECT_SKAP_IPHONE_INGRESS_MIRROR_HANDOFF.md'


def require(ok,msg):
    if not ok: raise AssertionError(msg)


def main():
    cfg=json.loads(CONFIG.read_text())
    route=json.loads(ROUTE.read_text())
    ingress=INGRESS.read_text(); submit=SUBMIT.read_text(); ui=UI.read_text(); page=PAGE.read_text(); handoff=HANDOFF.read_text()
    require(cfg['schema']=='stegverse.site.app_store_connect_skap_ingress_config/v1','config schema')
    require(cfg['status']=='NOT_PROVISIONED' and cfg['submission_status']=='NOT_PROVISIONED','config must fail closed before runtime projection')
    require(cfg['provider']=='apple_app_store_connect' and cfg['endpoint_origin']=='https://api.appstoreconnect.apple.com','provider binding')
    require(cfg['credential_authority']=='TV/TVC' and cfg['credential_custody_target']=='SKAP' and cfg['transport_protocol']=='InTr','credential path binding')
    for key in ('device_durable_secret_custody','kv_secret_resolution_authority','github_environment_secret_access','private_key_present','authority_transfer','ready_for_owner_ingress','provider_operation_authorized','provider_operation_started'):
        require(cfg[key] is False,f'config {key} must be false')
    require(route['status']=='NOT_PROVISIONED' and route['credential_plaintext_carried'] is False and route['blind_retry_allowed'] is False,'route fail closed')
    for marker in ('P-256','HKDF','AES-GCM','CURRENT_USER_IPHONE','TV/TVC','SKAP','InTr','apple_app_store_connect','api.appstoreconnect.apple.com','skap://APIs/apple/app-store-connect/team-key','tvc://skap/browser-ingress/apple/app-store-connect/'):
        require(marker in ingress,'missing ingress invariant '+marker)
    for forbidden in ('localStorage','sessionStorage','indexedDB','document.cookie','console.log','secrets.ASC_PRIVATE_KEY_P8'):
        require(forbidden not in ingress+submit+ui,'forbidden persistence/secret path '+forbidden)
    for marker in ('private_key_p8','issuer_id','key_id','-----begin private key-----'):
        require(marker in submit.lower(),'submission validator must reject '+marker)
    for marker in ('VERIFY_EXTERNALLY','blind retry forbidden','credentials:\'omit\'','redirect:\'error\'','referrerPolicy:\'no-referrer\''):
        require(marker in submit,'missing submission invariant '+marker)
    require('type="file"' in page and 'accept=".p8' in page,'page p8 file picker missing')
    require('Seal into SKAP' in page and 'button id="ascSealButton"' in page and 'disabled' in page,'page fail-closed action missing')
    require('file.text()' in ui and 'clearInputs()' in ui,'local p8 read/clear missing')
    require('TVC exact Apple credential class: COMPLETE_VALIDATED_MERGED' in handoff,'handoff upstream state missing')
    print('APP_STORE_CONNECT_SKAP_PHONE_INGRESS_SOURCE_PASS')
    print('real_credential_ingress=false')
    return 0

if __name__=='__main__': raise SystemExit(main())
