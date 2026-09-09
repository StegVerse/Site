(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsKVExactReadback=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var DB_NAME="stegverse-device-local-intr-v1";
  var DB_VERSION=1;
  var STORE="kv_files";
  var DRAFT_ROOT="02_Research/StegSocials/Drafts/";
  var DIRECTORY_ID="stegsocials-drafts";
  var MAX_BYTES=1024*1024;

  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function normalizeExpected(expected){
    requireValue(expected&&typeof expected==="object","exact readback expectation required");
    requireValue(typeof expected.canonical_path==="string"&&expected.canonical_path.indexOf(DRAFT_ROOT)===0,"readback path must remain inside StegSocials Drafts");
    requireValue(/^02_Research\/StegSocials\/Drafts\/(LinkedIn|Facebook|Instagram|X|Other)$/.test(expected.canonical_path),"readback platform directory invalid");
    requireValue(/^[A-Za-z0-9._-]+\.json$/.test(String(expected.name||"")),"readback filename invalid");
    requireValue(/^sha256:[a-f0-9]{64}$/.test(String(expected.sha256||"")),"readback expected SHA-256 invalid");
    requireValue(Number.isInteger(expected.size_bytes)&&expected.size_bytes>0&&expected.size_bytes<=MAX_BYTES,"readback expected size invalid");
    return {directory_id:DIRECTORY_ID,canonical_path:expected.canonical_path,name:expected.name,sha256:expected.sha256,size_bytes:expected.size_bytes,key:expected.canonical_path+"/"+expected.name};
  }
  function base64ToBytes(value){
    requireValue(typeof value==="string"&&value.length>0,"stored content bytes missing");
    var raw;
    if(typeof atob==="function") raw=atob(value);
    else if(typeof Buffer!=="undefined") raw=Buffer.from(value,"base64").toString("binary");
    else throw new Error("FAIL_CLOSED: base64 decoder unavailable");
    var out=new Uint8Array(raw.length);
    for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
    return out;
  }
  function hex(buffer){return Array.prototype.map.call(new Uint8Array(buffer),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function digest(bytes){
    requireValue(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function","WebCrypto SHA-256 unavailable");
    return root.crypto.subtle.digest("SHA-256",bytes).then(function(value){return "sha256:"+hex(value);});
  }
  function verifyStoredRow(row,expected){
    var exp=normalizeExpected(expected);
    requireValue(row&&typeof row==="object","stored KV row unavailable");
    requireValue(row.key===exp.key,"stored KV key mismatch");
    requireValue(row.directory_id===exp.directory_id,"stored KV directory id mismatch");
    requireValue(row.canonical_path===exp.canonical_path,"stored KV canonical path mismatch");
    requireValue(row.name===exp.name,"stored KV filename mismatch");
    requireValue(row.credential_material_present===false,"stored KV credential boundary invalid");
    requireValue(row.provider_operation_authorized===false,"stored KV provider-operation boundary invalid");
    requireValue(row.authority_effect==="NONE","stored KV authority boundary invalid");
    var bytes=base64ToBytes(row.content_base64);
    requireValue(bytes.length===exp.size_bytes,"stored exact-content size mismatch");
    return digest(bytes).then(function(actual){
      requireValue(actual===exp.sha256,"stored exact-content SHA-256 mismatch");
      requireValue(row.sha256===actual,"stored metadata/content SHA-256 mismatch");
      requireValue(row.size_bytes===bytes.length,"stored metadata/content size mismatch");
      return {
        schema:"stegverse.site.stegsocials-kv-exact-content-readback/v1",
        state:"EXACT_CONTENT_BYTES_READBACK_VERIFIED",
        canonical_path:exp.canonical_path+"/"+exp.name,
        sha256:actual,
        size_bytes:bytes.length,
        exact_content_bytes_readback_verified:true,
        device_local_kv_store_observed:true,
        cloud_provider_readback_observed:false,
        provider_call_performed:false,
        credential_material_present:false,
        provider_operation_authorized:false,
        authority_effect:"NONE_OBSERVATION_ONLY"
      };
    });
  }
  function openDb(){
    requireValue(root.indexedDB&&typeof root.indexedDB.open==="function","device-local KV IndexedDB unavailable");
    return new Promise(function(resolve,reject){
      var request=root.indexedDB.open(DB_NAME,DB_VERSION);
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error||new Error("device-local KV IndexedDB open failed"));};
    });
  }
  function readExact(expected){
    var exp=normalizeExpected(expected);
    return openDb().then(function(db){
      return new Promise(function(resolve,reject){
        requireValue(db.objectStoreNames.contains(STORE),"device-local KV file store unavailable");
        var tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(exp.key),row=null;
        req.onsuccess=function(){row=req.result||null;};
        req.onerror=function(){reject(req.error||new Error("device-local KV exact readback failed"));};
        tx.oncomplete=function(){db.close();verifyStoredRow(row,exp).then(resolve,reject);};
        tx.onerror=function(){db.close();reject(tx.error||new Error("device-local KV exact readback transaction failed"));};
        tx.onabort=function(){db.close();reject(tx.error||new Error("device-local KV exact readback transaction aborted"));};
      });
    });
  }

  return Object.freeze({
    bridge_kind:"DEVICE_LOCAL_KV_STEGSOCIALS_EXACT_CONTENT_READBACK",
    access:"READ_ONLY",
    authority_effect:"NONE",
    normalizeExpected:normalizeExpected,
    verifyStoredRow:verifyStoredRow,
    readExact:readExact
  });
}));
