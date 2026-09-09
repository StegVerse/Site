(() => {
  'use strict';

  const FORMAT='stegverse.skap.browser_ingress/p256-ecdh-hkdf-sha256-aes256gcm/v1';
  const ENDPOINT='https://api.appstoreconnect.apple.com';
  const CONFIG_URL='./assets/stegos-apple/app-store-connect-skap-ingress-config.json';
  const PURPOSE='apple.app_store_connect.identifiers';
  const encoder=new TextEncoder();

  function stable(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;}
  function b64url(buffer){let v='';for(const b of new Uint8Array(buffer))v+=String.fromCharCode(b);return btoa(v).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');}
  function hex(buffer){return [...new Uint8Array(buffer)].map(v=>v.toString(16).padStart(2,'0')).join('');}
  async function sha256(value){return `sha256:${hex(await crypto.subtle.digest('SHA-256',encoder.encode(stable(value))))}`;}
  function wipe(view){if(view?.fill)view.fill(0);}

  async function loadConfig(){
    if(!window.isSecureContext||!crypto?.subtle)throw new Error('secure WebCrypto context required');
    const r=await fetch(CONFIG_URL,{cache:'no-store',redirect:'error',credentials:'same-origin'});if(!r.ok)throw new Error(`SKAP ingress config unavailable (${r.status})`);
    const c=await r.json();
    if(c?.schema!=='stegverse.site.app_store_connect_skap_ingress_config/v1')throw new Error('SKAP ingress config schema invalid');
    if(c?.status!=='PROVISIONED'||c?.ready_for_owner_ingress!==true)throw new Error('App Store Connect SKAP ingress is not provisioned');
    if(c?.provider!=='apple_app_store_connect'||c?.endpoint_origin!==ENDPOINT)throw new Error('provider/endpoint binding invalid');
    if(c?.credential_authority!=='TV/TVC'||c?.credential_custody_target!=='SKAP'||c?.transport_protocol!=='InTr')throw new Error('TV/TVC + SKAP + InTr binding invalid');
    if(c?.physical_execution_surface!=='CURRENT_USER_IPHONE'||c?.second_machine_required!==false)throw new Error('current-iPhone execution boundary invalid');
    if(c?.device_durable_secret_custody!==false||c?.kv_secret_resolution_authority!==false||c?.github_environment_secret_access!==false||c?.private_key_present!==false||c?.authority_transfer!==false)throw new Error('credential boundary invalid');
    if(!c?.runtime_instance_id||!c?.recipient_key_id||!c?.lease_expires_at)throw new Error('recipient runtime binding incomplete');
    if(!String(c.recipient_key_id).startsWith('tvc://skap/browser-ingress/apple/app-store-connect/'))throw new Error('recipient key id invalid');
    if(c?.recipient_public_jwk?.kty!=='EC'||c?.recipient_public_jwk?.crv!=='P-256'||'d' in c.recipient_public_jwk)throw new Error('recipient public JWK invalid');
    if(c.recipient_public_jwk_sha256!==await sha256(c.recipient_public_jwk))throw new Error('recipient public JWK hash mismatch');
    if(!String(c.activation_receipt_hash||'').startsWith('sha256:')||!String(c.liveness_receipt_hash||'').startsWith('sha256:'))throw new Error('recipient activation/liveness evidence missing');
    if(!Number.isFinite(Date.parse(c.lease_expires_at))||Date.parse(c.lease_expires_at)<=Date.now())throw new Error('recipient key lease expired');
    return c;
  }

  async function ownerAuthorization(){
    const b=window.StegIDDeviceWalletBootstrap;if(!b?.issueCurrentPhonePrepareCapability)throw new Error('StegID owner authorization unavailable');
    const p=await b.issueCurrentPhonePrepareCapability(),i=p?.identity_receipt,d=p?.device_admission_receipt;
    if(i?.decision!=='IDENTITY_CONTINUITY_VALID'||d?.decision!=='DEVICE_ADMITTED')throw new Error('owner/device authorization not admitted');
    return {method:'WEBAUTHN',rp_id:location.hostname==='www.stegverse.org'?'stegverse.org':location.hostname,assertion_digest:d.human_continuity_proof_sha256,device_admission_digest:d.receipt_sha256,identity_continuity_digest:i.receipt_sha256,user_verification:'REQUIRED',verified:true};
  }

  async function deriveAesKey(privateKey,publicKey,salt,aad){const bits=await crypto.subtle.deriveBits({name:'ECDH',public:publicKey},privateKey,256),shared=new Uint8Array(bits);try{const base=await crypto.subtle.importKey('raw',shared,'HKDF',false,['deriveKey']),aadDigest=new Uint8Array(await crypto.subtle.digest('SHA-256',aad)),prefix=encoder.encode('stegverse-skap-browser-ingress-v1\u0000'),info=new Uint8Array(prefix.length+aadDigest.length);info.set(prefix);info.set(aadDigest,prefix.length);try{return await crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt,info},base,{name:'AES-GCM',length:256},false,['encrypt']);}finally{wipe(aadDigest);wipe(info);}}finally{wipe(shared);}}

  async function sealCredentialBytes(bytes,config,owner){
    if(!(bytes instanceof Uint8Array)||!bytes.length)throw new Error('credential bytes required');
    const objectId=`skap://APIs/apple/app-store-connect/team-key/${config.credential_version}`;
    const context={credential_version:config.credential_version,endpoint_ref:ENDPOINT,object_id:objectId,purpose:PURPOSE,recipient_key_id:config.recipient_key_id,wrapping_policy_ref:config.wrapping_policy_ref};
    const aad=encoder.encode(stable(context)),recipient=await crypto.subtle.importKey('jwk',config.recipient_public_jwk,{name:'ECDH',namedCurve:'P-256'},false,[]),ephemeral=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']),pub=await crypto.subtle.exportKey('jwk',ephemeral.publicKey);delete pub.d;delete pub.key_ops;delete pub.ext;
    const salt=crypto.getRandomValues(new Uint8Array(32)),nonce=crypto.getRandomValues(new Uint8Array(12));
    try{const key=await deriveAesKey(ephemeral.privateKey,recipient,salt,aad),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:aad,tagLength:128},key,bytes),sealed={format:FORMAT,...context,ephemeral_public_jwk:pub,kdf_salt_b64:b64url(salt),nonce_b64:b64url(nonce),aad_hash:`sha256:${hex(await crypto.subtle.digest('SHA-256',aad))}`,ciphertext_b64:b64url(cipher),plaintext_persisted:false,device_private_key_persisted:false,skap_private_key_exported:false,authority_transfer:false},body={schema:'stegverse.tvc.app_store_connect_iphone_skap_ingress/v1',ingress_id:`app-store-connect-iphone-${crypto.randomUUID()}`,owner_authorization:owner,physical_execution_surface:'CURRENT_USER_IPHONE',transport:'STEGVERSE_BROWSER_CAPSULE',provider:'apple_app_store_connect',endpoint_origin:ENDPOINT,purpose:PURPOSE,credential_ref:objectId,credential_version:config.credential_version,recipient_runtime_instance_id:config.runtime_instance_id,recipient_lease_expires_at:config.lease_expires_at,sealed_material:sealed,plaintext_present:false,device_secret_custody_authority:false,kv_secret_resolution_authority:false,github_environment_secret_access:false,credential_authority:'TV/TVC'};return {...body,ingress_digest:await sha256(body)};}finally{wipe(bytes);wipe(salt);wipe(nonce);wipe(aad);}
  }

  async function sealAppStoreConnectCredential({issuerId,keyId,privateKeyP8}){
    const config=await loadConfig(),owner=await ownerAuthorization();
    if(!issuerId||!keyId||!privateKeyP8.includes('-----BEGIN PRIVATE KEY-----')||!privateKeyP8.includes('-----END PRIVATE KEY-----'))throw new Error('App Store Connect credential bundle invalid');
    const bytes=encoder.encode(stable({issuer_id:issuerId,key_id:keyId,private_key_p8:privateKeyP8}));issuerId='';keyId='';privateKeyP8='';return sealCredentialBytes(bytes,config,owner);
  }

  window.StegOSAppStoreConnectSkapIngress=Object.freeze({loadConfig,ownerAuthorization,sealCredentialBytes,sealAppStoreConnectCredential});
})();
