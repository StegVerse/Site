(() => {
  'use strict';

  const CONFIG_URL='./assets/stegos-apple/app-store-connect-skap-ingress-config.json';
  const ROUTE_URL='./assets/stegos-apple/app-store-connect-skap-intr-route.json';
  const PACKET_SCHEMA='stegverse.tvc.app_store_connect_iphone_skap_ingress/v1';

  function statusNode(){return document.getElementById('appStoreConnectIngressStatus');}
  function setStatus(message){const node=statusNode();if(node)node.textContent=message;}
  async function fetchJson(url,label){const r=await fetch(url,{cache:'no-store',redirect:'error',credentials:'same-origin'});if(!r.ok)throw new Error(`${label} unavailable (${r.status})`);return r.json();}
  function requireHash(v,label){if(!String(v||'').startsWith('sha256:'))throw new Error(`${label} missing`);}

  function validateConfig(c){
    if(c?.schema!=='stegverse.site.app_store_connect_skap_ingress_config/v1'||c?.status!=='PROVISIONED'||c?.submission_status!=='PROVISIONED'||c?.ready_for_owner_ingress!==true)throw new Error('App Store Connect SKAP ingress not provisioned');
    if(c?.provider!=='apple_app_store_connect'||c?.credential_authority!=='TV/TVC'||c?.credential_custody_target!=='SKAP'||c?.transport_protocol!=='InTr')throw new Error('recipient binding invalid');
    if(!c?.runtime_instance_id||!c?.recipient_key_id||!c?.lease_expires_at||Date.parse(c.lease_expires_at)<=Date.now())throw new Error('recipient lease invalid');
    if(c?.provider_operation_authorized!==false||c?.provider_operation_started!==false||c?.submission_blind_retry_allowed!==false)throw new Error('submission boundary invalid');
    requireHash(c.activation_receipt_hash,'activation receipt');requireHash(c.liveness_receipt_hash,'liveness receipt');
    return c;
  }

  function validateRoute(route,c){
    if(route?.schema!=='stegverse.tvc.skap_browser_intr_route/v1'||route?.status!=='ROUTE_LIVE')throw new Error('App Store Connect SKAP route not live');
    if(route?.provider!=='apple_app_store_connect'||route?.transport_protocol!=='InTr'||route?.credential_authority!=='TV/TVC'||route?.credential_custody_target!=='SKAP')throw new Error('route binding invalid');
    for(const field of ['runtime_instance_id','recipient_key_id','activation_receipt_hash','liveness_receipt_hash','lease_expires_at'])if(route?.[field]!==c?.[field])throw new Error(`route/recipient mismatch:${field}`);
    if(route?.public_route_authority!==false||route?.provider_operation_authorized!==false||route?.credential_plaintext_carried!==false||route?.github_token_runtime_authority!==false||route?.github_actions_resident_authority!==false||route?.blind_retry_allowed!==false)throw new Error('route boundary invalid');
    const endpoint=new URL(route.public_ingress_url);if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw new Error('route endpoint invalid');
    requireHash(route.route_receipt_hash,'route receipt');return endpoint;
  }

  async function loadSubmissionConfig(){const [cRaw,route]=await Promise.all([fetchJson(CONFIG_URL,'recipient config'),fetchJson(ROUTE_URL,'InTr route')]);const config=validateConfig(cRaw),endpoint=validateRoute(route,config);return {config,route,endpoint};}

  function validatePacket(packet){
    if(packet?.schema!==PACKET_SCHEMA)throw new Error('sealed packet schema invalid');
    if(packet?.provider!=='apple_app_store_connect'||packet?.endpoint_origin!=='https://api.appstoreconnect.apple.com')throw new Error('sealed packet provider binding invalid');
    if(packet?.plaintext_present!==false||packet?.device_secret_custody_authority!==false||packet?.kv_secret_resolution_authority!==false||packet?.github_environment_secret_access!==false)throw new Error('sealed packet boundary invalid');
    const sealed=packet.sealed_material||{};if(sealed?.format!=='stegverse.skap.browser_ingress/p256-ecdh-hkdf-sha256-aes256gcm/v1'||sealed?.plaintext_persisted!==false||sealed?.device_private_key_persisted!==false||sealed?.skap_private_key_exported!==false||sealed?.authority_transfer!==false)throw new Error('sealed material boundary invalid');
    const serialized=JSON.stringify(packet).toLowerCase();
    for(const forbidden of ['private_key_p8','issuer_id','key_id','-----begin private key-----','"authorization"','"token"'])if(serialized.includes(forbidden))throw new Error(`plaintext credential field forbidden:${forbidden}`);
    return packet;
  }

  function validateCurrentRecipient(packet,c){if(packet.recipient_runtime_instance_id!==c.runtime_instance_id||packet.recipient_lease_expires_at!==c.lease_expires_at||packet.sealed_material?.recipient_key_id!==c.recipient_key_id||packet.credential_version!==c.credential_version)throw new Error('sealed packet recipient projection stale');}

  async function submitCiphertext(packet){
    validatePacket(packet);const {config,endpoint}=await loadSubmissionConfig();validateCurrentRecipient(packet,config);
    let response;try{response=await fetch(endpoint.href,{method:'POST',redirect:'error',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(packet)});}catch(error){const e=new Error(`VERIFY_EXTERNALLY: ciphertext submission outcome ambiguous (${String(error?.message||error)}); blind retry forbidden`);e.code='VERIFY_EXTERNALLY';throw e;}
    if(!response.ok)throw new Error(`SKAP transport rejected ciphertext (${response.status}); create a NEW owner-authorized packet before retry`);
    const body=await response.json();if(!['ADMITTED','ADMITTED_TO_SKAP_VAULT','STAGED_FOR_TVC'].includes(body?.decision))throw new Error('TVC/SKAP receiver did not return an admitted/staged decision');
    if(body?.credential_plaintext_returned===true||body?.provider_operation_authorized===true)throw new Error('receiver response violated custody-only boundary');
    return body;
  }

  window.addEventListener('stegverse:app-store-connect-skap-ingress-sealed',async(event)=>{let packet=event?.detail;if(!packet)return;try{setStatus('Apple credential sealed locally. Revalidating the TVC/SKAP route…');const receipt=await submitCiphertext(packet);setStatus(receipt.decision==='ADMITTED_TO_SKAP_VAULT'?'Encrypted Apple credential admitted to SKAP custody.':'Encrypted Apple credential staged/admitted by the governed ingress path.');window.dispatchEvent(new CustomEvent('stegverse:app-store-connect-skap-ingress-result',{detail:receipt}));}catch(error){const decision=error?.code==='VERIFY_EXTERNALLY'?'VERIFY_EXTERNALLY':'DENIED';setStatus(`${decision}: ${String(error?.message||error)}`);window.dispatchEvent(new CustomEvent('stegverse:app-store-connect-skap-ingress-failed',{detail:{decision,blind_retry_allowed:false}}));}finally{packet=null;}});

  window.StegOSAppStoreConnectSkapSubmission=Object.freeze({loadSubmissionConfig,validateConfig,validateRoute,validatePacket,validateCurrentRecipient,submitCiphertext});
})();
