(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsKVDraftWriter=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var BUNDLE_SCHEMA="stegverse.stegsocials.post-preparation/v1";
  var INLINE_SCHEMA="stegverse.kv.portable-direct-source-inline-payload/v1";
  var DRAFT_ROOT="02_Research/StegSocials/Drafts/";
  var DIRECTORY_ID="stegsocials-drafts";
  var MAX_BYTES=1024*1024;
  var SECRET_PARTS=["password","secret","token","private_key","oauth","cookie","api_key","credential","refresh_token","access_token"];
  var SAFE_ASSERTION_KEYS={credential_material_present:true};

  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function canon(value){
    var intr=root.StegVerseGeneratedInTr;
    if(intr&&typeof intr.canonical==="function") return intr.canonical(value);
    if(value===null||typeof value!=="object") return JSON.stringify(value);
    if(Array.isArray(value)) return "["+value.map(canon).join(",")+"]";
    return "{"+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+":"+canon(value[key]);}).join(",")+"}";
  }
  function containsForbiddenKey(value,path){
    path=path||"$";
    if(Array.isArray(value)){
      for(var i=0;i<value.length;i++){var found=containsForbiddenKey(value[i],path+"["+i+"]");if(found)return found;}
      return null;
    }
    if(!value||typeof value!=="object")return null;
    var keys=Object.keys(value);
    for(var j=0;j<keys.length;j++){
      var key=keys[j],lower=String(key).toLowerCase();
      if(!SAFE_ASSERTION_KEYS[lower]&&SECRET_PARTS.some(function(part){return lower.indexOf(part)!==-1;}))return path+"."+key;
      var nested=containsForbiddenKey(value[key],path+"."+key);if(nested)return nested;
    }
    return null;
  }
  function splitDraftPath(path){
    path=String(path||"");
    requireValue(path.indexOf(DRAFT_ROOT)===0,"StegSocials draft path must remain inside the canonical Drafts lane");
    requireValue(path.indexOf("..")===-1&&path.indexOf("\\")===-1,"StegSocials draft path traversal prohibited");
    var slash=path.lastIndexOf("/");
    requireValue(slash>DRAFT_ROOT.length&&slash<path.length-1,"StegSocials draft path must include platform directory and filename");
    var directory=path.slice(0,slash),name=path.slice(slash+1);
    requireValue(/^[A-Za-z0-9._-]+\.json$/.test(name),"StegSocials draft filename invalid");
    requireValue(/^02_Research\/StegSocials\/Drafts\/(LinkedIn|Facebook|Instagram|X|Other)$/.test(directory),"StegSocials platform draft directory invalid");
    return {canonical_path:directory,name:name};
  }
  function validateBundle(bundle){
    requireValue(bundle&&typeof bundle==="object","StegSocials preparation bundle required");
    requireValue(bundle.schema===BUNDLE_SCHEMA,"StegSocials preparation bundle schema invalid");
    requireValue(bundle.task_id==="SS-EVIDENCE-COMPARISON-001","StegSocials preparation task binding invalid");
    requireValue(bundle.kv_context&&typeof bundle.kv_context.draft_path==="string","StegSocials KV draft path missing");
    requireValue(Array.isArray(bundle.kv_context.erl_refs)&&bundle.kv_context.erl_refs.length>0,"StegSocials ERL provenance required");
    bundle.kv_context.erl_refs.forEach(function(ref){
      requireValue(ref&&ref.authority==="ERL"&&String(ref.ref||"").indexOf("02_Research/ERL/")===0,"StegSocials ERL authority/path invalid");
    });
    requireValue(bundle.execution&&bundle.execution.provider_call_performed===false,"StegSocials preparation bundle may not contain provider execution");
    requireValue(bundle.execution.credential_material_present===false,"StegSocials preparation bundle may not contain credential material");
    requireValue(bundle.execution.publication_authority_effect==="NONE_PREPARATION_ONLY","StegSocials preparation authority boundary invalid");
    var forbidden=containsForbiddenKey(bundle);requireValue(!forbidden,"credential/secret-like field prohibited at "+forbidden);
    splitDraftPath(bundle.kv_context.draft_path);
    return clone(bundle);
  }
  function bytesToBase64(bytes){
    var out="",chunk=0x8000;
    for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(out);
  }
  function hex(buffer){return Array.prototype.map.call(new Uint8Array(buffer),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function sha256Bytes(bytes){
    requireValue(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function","WebCrypto SHA-256 unavailable");
    return root.crypto.subtle.digest("SHA-256",bytes).then(function(digest){return "sha256:"+hex(digest);});
  }
  function buildPortablePayload(bundle){
    var valid=validateBundle(bundle),parts=splitDraftPath(valid.kv_context.draft_path);
    var text=canon(valid),bytes=new TextEncoder().encode(text);
    requireValue(bytes.length>0&&bytes.length<=MAX_BYTES,"StegSocials draft exceeds bounded 1 MiB KV admission limit");
    return sha256Bytes(bytes).then(function(hash){
      return {
        bundle:valid,
        bytes:bytes,
        sha256:hash,
        directory_id:DIRECTORY_ID,
        canonical_path:parts.canonical_path,
        name:parts.name,
        payload:{
          schema:INLINE_SCHEMA,
          directory_id:DIRECTORY_ID,
          canonical_path:parts.canonical_path,
          source_class:"OWNER_CONTROLLED_GENERATED_DRAFT",
          credential_requirement:"NONE",
          total_bytes:bytes.length,
          files:[{
            name:parts.name,
            media_type:"application/vnd.stegverse.stegsocials-post-preparation+json",
            size_bytes:bytes.length,
            sha256:hash,
            content_base64:bytesToBase64(bytes)
          }],
          authority_effect:"NONE"
        }
      };
    });
  }
  function randomId(){
    requireValue(root.crypto&&typeof root.crypto.getRandomValues==="function","secure random source unavailable");
    var bytes=new Uint8Array(16);root.crypto.getRandomValues(bytes);
    return "SITE-STEGSOCIALS-DRAFT-"+Array.prototype.map.call(bytes,function(x){return x.toString(16).padStart(2,"0");}).join("");
  }
  function saveDraft(bundle){
    var intr=root.StegVerseGeneratedInTr,hb=root.StegVerseHBInTrCarrier,node=root.StegVerseNodeContinuity,sync=root.StegVerseDeviceKVInTrSync,directory=root.StegVerseKVDirectoryBridge;
    requireValue(intr&&typeof intr.buildIntent==="function"&&typeof intr.buildMaterializationRequest==="function","canonical DEVICE_KV InTr connector unavailable");
    requireValue(hb&&typeof hb.buildBinding==="function","HB-derived InTr carrier unavailable");
    requireValue(node&&typeof node.status==="function"&&typeof node.queueIntrMaterializationRequest==="function","registered Node continuity unavailable");
    requireValue(sync&&typeof sync.synchronizeMaterialization==="function","DEVICE_KV sync unavailable");
    requireValue(directory&&typeof directory.listDirectory==="function","canonical KV directory readback bridge unavailable");

    return Promise.all([buildPortablePayload(bundle),node.status()]).then(function(values){
      var prepared=values[0],state=values[1];
      requireValue(state&&state.registered===true&&state.registration&&state.registration.node_id,"Register this device before saving a StegSocials draft");
      var operationId=randomId();
      return intr.buildIntent("device-kv",prepared.bytes,"COMMIT_CANDIDATE",operationId).then(function(intent){
        return hb.buildBinding(intent.packet_id,intent.payload_hash).then(function(binding){
          return intr.buildMaterializationRequest(
            "device-kv",intent,"inline://materialization_request.portable_payload",
            binding,{portable_payload:prepared.payload}
          );
        });
      }).then(function(materialization){
        return node.queueIntrMaterializationRequest(materialization).then(function(){
          return sync.synchronizeMaterialization(materialization.materialization_id);
        }).then(function(){
          return directory.listDirectory({
            schema:"stegverse.site.my-kv.directory-list-request/v1",
            directory_id:prepared.directory_id,
            canonical_path:prepared.canonical_path,
            access:"READ_ONLY",
            authority_effect:"NONE"
          });
        }).then(function(readback){
          requireValue(readback&&readback.canonical_path===prepared.canonical_path&&Array.isArray(readback.entries),"KV draft directory readback invalid");
          var matches=readback.entries.filter(function(entry){return entry&&entry.name===prepared.name;});
          requireValue(matches.length===1,"KV draft readback did not resolve exactly one admitted file");
          var entry=matches[0];
          requireValue(entry.sha256===prepared.sha256,"KV draft admitted hash readback mismatch");
          requireValue(entry.size_bytes===prepared.bytes.length,"KV draft admitted size readback mismatch");
          return {
            schema:"stegverse.site.stegsocials-kv-draft-admission-result/v1",
            state:"KV_DRAFT_ADMITTED_HASH_READBACK",
            bundle_id:prepared.bundle.bundle_id,
            canonical_path:prepared.bundle.kv_context.draft_path,
            sha256:prepared.sha256,
            size_bytes:prepared.bytes.length,
            admitted_entry:{name:entry.name,sha256:entry.sha256,size_bytes:entry.size_bytes,modified_at:entry.modified_at||null},
            materialization_id:materialization.materialization_id,
            request_hash:materialization.request_hash,
            canonical_kv_admission_observed:true,
            admitted_hash_readback_verified:true,
            exact_content_bytes_readback_verified:false,
            provider_call_performed:false,
            credential_material_present:false,
            provider_operation_authorized:false,
            authority_effect:"NONE_OBSERVATION_ONLY"
          };
        });
      });
    });
  }

  return Object.freeze({
    bridge_kind:"DEVICE_KV_STEGSOCIALS_DRAFT_ADMISSION",
    authority_effect:"NONE",
    validateBundle:validateBundle,
    splitDraftPath:splitDraftPath,
    buildPortablePayload:buildPortablePayload,
    saveDraft:saveDraft
  });
}));