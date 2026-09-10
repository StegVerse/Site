(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsBoundedGroupDeviceKVCASReceiver=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var DB_NAME="stegverse-device-local-intr-v1";
  var DB_VERSION=1;
  var STORE="kv_files";
  var REQUEST_SCHEMA="stegverse.site.stegsocials-bounded-group-kv-conditional-write/v1";
  var RESULT_SCHEMA="stegverse.device-kv.stegsocials-bounded-group-cas-result/v1";
  var STATE_SCHEMA="stegsocials.bounded-post-group-use-state.v1";
  var PATH_ROOT="03_Records/StegSocials/PostGroupState/";

  function fail(message){throw new Error("FAIL_CLOSED: "+message);}
  function requireValue(ok,message){if(!ok)fail(message);}
  function canon(value){
    if(value===null||typeof value!=="object") return JSON.stringify(value);
    if(Array.isArray(value)) return "["+value.map(canon).join(",")+"]";
    return "{"+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+":"+canon(value[k]);}).join(",")+"}";
  }
  function bytesToHex(bytes){return Array.prototype.map.call(new Uint8Array(bytes),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function sha256Text(text){
    requireValue(root.crypto&&root.crypto.subtle,"WebCrypto unavailable");
    return root.crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)).then(function(d){return "sha256:"+bytesToHex(d);});
  }
  function stateBytes(state){return new TextEncoder().encode(canon(state)+"\n");}
  function stateEtag(state){return sha256Text(canon(state)+"\n");}
  function validateRequest(request){
    requireValue(request&&request.schema===REQUEST_SCHEMA,"request schema invalid");
    requireValue(request.operation==="COMPARE_AND_SWAP","operation invalid");
    requireValue(typeof request.canonical_path==="string"&&request.canonical_path.indexOf(PATH_ROOT)===0,"canonical path invalid");
    requireValue(/^sha256:[0-9a-f]{64}$/.test(String(request.expected_previous_etag||"")),"expected etag invalid");
    requireValue(/^sha256:[0-9a-f]{64}$/.test(String(request.next_state_etag||"")),"next etag invalid");
    requireValue(request.next_state&&request.next_state.schema_version===STATE_SCHEMA,"next state invalid");
    requireValue(request.credential_material_present===false,"credential material prohibited");
    requireValue(request.provider_operation_authorized===false,"provider authority prohibited");
    requireValue(request.authority_effect==="NONE_STATE_TRANSITION_REQUEST_ONLY","authority boundary invalid");
    requireValue(request.publication_proof&&request.publication_proof.session_state_destroyed===true,"terminal destruction proof missing");
    requireValue(request.publication_proof.credential_material_present===false,"publication proof credential material prohibited");
    return request;
  }
  function openDb(){return new Promise(function(resolve,reject){
    requireValue(root.indexedDB,"IndexedDB unavailable");
    var req=root.indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=function(){var db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"key"});};
    req.onsuccess=function(){resolve(req.result);};
    req.onerror=function(){reject(req.error||new Error("device_kv_open_failed"));};
  });}
  function rowKey(path){return path;}
  function rowFromState(path,state,etag){
    var bytes=stateBytes(state);
    var base64;
    if(typeof Buffer!=="undefined") base64=Buffer.from(bytes).toString("base64");
    else {var s="";bytes.forEach(function(b){s+=String.fromCharCode(b);});base64=btoa(s);}
    return {key:rowKey(path),directory_id:"STEGSOCIALS_POST_GROUP_STATE",canonical_path:path.slice(0,path.lastIndexOf("/")),name:path.slice(path.lastIndexOf("/")+1),media_type:"application/json",size_bytes:bytes.length,sha256:etag,content_base64:base64,credential_material_present:false,provider_operation_authorized:false,authority_effect:"NONE"};
  }
  function parseRowState(row){
    if(!row||!row.content_base64) return null;
    var text;
    if(typeof Buffer!=="undefined") text=Buffer.from(row.content_base64,"base64").toString("utf8");
    else {var raw=atob(row.content_base64);var arr=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);text=new TextDecoder().decode(arr);}
    return JSON.parse(text);
  }
  function commit(request){
    validateRequest(request);
    return stateEtag(request.next_state).then(function(calculatedNext){
      requireValue(calculatedNext===request.next_state_etag,"next state etag mismatch");
      return openDb().then(function(db){return new Promise(function(resolve,reject){
        var tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE),get=store.get(rowKey(request.canonical_path));
        var previousEtag=null;
        get.onerror=function(){try{tx.abort();}catch(_){}reject(get.error||new Error("state_read_failed"));};
        get.onsuccess=function(){
          var current=get.result||null;
          previousEtag=current&&current.sha256||null;
          if(previousEtag!==request.expected_previous_etag){try{tx.abort();}catch(_){}reject(new Error("FAIL_CLOSED: stale expected etag"));return;}
          store.put(rowFromState(request.canonical_path,request.next_state,request.next_state_etag));
        };
        tx.oncomplete=function(){db.close();resolve({previous_etag:previousEtag});};
        tx.onerror=function(){db.close();reject(tx.error||new Error("state_commit_failed"));};
        tx.onabort=function(){db.close();};
      });});
    }).then(function(committed){
      return openDb().then(function(db){return new Promise(function(resolve,reject){
        var tx=db.transaction(STORE,"readonly"),get=tx.objectStore(STORE).get(rowKey(request.canonical_path));
        get.onsuccess=function(){resolve(get.result||null);};get.onerror=function(){reject(get.error||new Error("readback_failed"));};tx.oncomplete=function(){db.close();};
      });}).then(function(row){
        requireValue(row&&row.sha256===request.next_state_etag,"persisted etag mismatch");
        var parsed=parseRowState(row);
        return stateEtag(parsed).then(function(readbackEtag){
          requireValue(readbackEtag===request.next_state_etag,"exact readback hash mismatch");
          return {schema:RESULT_SCHEMA,state:"GROUP_USE_STATE_COMMITTED",canonical_path:request.canonical_path,group_id:request.group_id,consumed_use_index:request.consumed_use_index,previous_etag:committed.previous_etag,persisted_etag:request.next_state_etag,exact_readback_verified:true,publication_receipt_ref:request.publication_proof.publication_receipt_ref,session_state_destroyed:true,credential_material_present:false,provider_operation_authorized:false,authority_effect:"NONE_EVIDENCE_ONLY"};
        });
      });
    });
  }

  return Object.freeze({db_name:DB_NAME,store:STORE,validateRequest:validateRequest,stateEtag:stateEtag,commit:commit});
}));