(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVSetProjectionAdmissionBridge=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var ADMISSION_CLASS="MY_KV_INSTANCE_SET_PROJECTION_ADMISSION";
  var SET_SCHEMA="stegverse.kv.my-kv-set-projection/v1";
  var RESPONSE_SCHEMA="stegverse.device-kv.my-kv-set-projection-admission-response/v1";
  var RECEIPT_SCHEMA="stegverse.device-kv.my-kv-set-projection-admission-receipt/v1";
  var DEST="_System/my-kv-set-projection.json";
  var WORKER_URL="/assets/my-kv-set-projection-admission-receiver.js";
  var WORKER_SCOPE="/assets/my-kv-set-projection-admission-runtime/";

  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function randomId(prefix){
    var bytes=new Uint8Array(16);
    requireValue(root.crypto&&typeof root.crypto.getRandomValues==="function","crypto RNG unavailable");
    root.crypto.getRandomValues(bytes);
    return prefix+"-"+Array.prototype.map.call(bytes,function(x){return x.toString(16).padStart(2,"0");}).join("");
  }
  function canonical(v){
    var intr=root.StegVerseGeneratedInTr;
    requireValue(intr&&typeof intr.canonical==="function","canonical generated DEVICE_KV connector unavailable");
    return intr.canonical(v);
  }
  function bytesToBase64(bytes){
    var out="",chunk=0x8000;
    for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(out);
  }
  function shaUriBytes(bytes){
    requireValue(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function","crypto digest unavailable");
    return root.crypto.subtle.digest("SHA-256",bytes).then(function(d){return "sha256:"+Array.prototype.map.call(new Uint8Array(d),function(x){return x.toString(16).padStart(2,"0");}).join("");});
  }
  function shaUri(value){return shaUriBytes(new TextEncoder().encode(canonical(value)));}
  function rejectSensitive(value,path){
    path=path||"projection";
    if(Array.isArray(value)){value.forEach(function(v,i){rejectSensitive(v,path+"["+i+"]");});return;}
    if(!value||typeof value!=="object")return;
    Object.keys(value).forEach(function(key){
      var lower=String(key).toLowerCase();
      if(lower==="credential_material_included"||lower==="credential_material_present"){
        requireValue(value[key]===false,"credential sentinel must remain false at "+path+"."+key);return;
      }
      var forbidden=["password","secret","token","access_token","refresh_token","private_key","credential_material","skap_credential_ref","interlock_receipt_ref","intr_receipt_ref"];
      requireValue(!forbidden.some(function(part){return lower===part||lower.indexOf(part)>=0;}),"sensitive projection field prohibited at "+path+"."+key);
      rejectSensitive(value[key],path+"."+key);
    });
  }
  function validateProjection(projection,manager){
    manager=manager||root.StegVerseMyKVInstanceManager;
    requireValue(manager&&typeof manager.validateSetProjection==="function","canonical MyKV projection validator unavailable");
    var valid=manager.validateSetProjection(projection);
    requireValue(valid.schema===SET_SCHEMA&&valid.private_content_included===false&&valid.credential_material_included===false,"projection content boundary invalid");
    requireValue(valid.authority_effect==="NONE_STATUS_ONLY"&&valid.activation_effect===false,"projection authority boundary invalid");
    rejectSensitive(valid,"projection");
    return valid;
  }
  function buildEnvelope(nodeId,rawBytes,projection,manager){
    requireValue(rawBytes instanceof Uint8Array&&rawBytes.length>0,"raw projection bytes required");
    var valid=validateProjection(projection,manager);
    return shaUriBytes(rawBytes).then(function(payloadHash){
      return {
        query:{
          schema_version:"kv.interlock.request.v1",
          operation:"COMMIT_CANDIDATE",
          request_id:randomId("SITE-MY-KV-SET-ADMISSION"),
          requester:{module:"Site",component:"MyKVSetProjectionAdmission"},
          purpose:"Owner-mediated admission of an already-validated bounded MyKV set projection into this device-local KnowledgeVault.",
          record_class:ADMISSION_CLASS,
          requested_scope:["kv_set_projection_status_replace"],
          minimum_necessary_justification:"Persist only the bounded multi-instance status projection selected by the owner; no private KV content or credentials are permitted.",
          authority_ref:"stegos-node://"+nodeId,
          disclosure_mode:"BOUNDED_CONTEXT",
          kv_set_id:valid.kv_set_id,
          candidate_writeback:{
            candidate_type:"MY_KV_SET_PROJECTION_REPLACE",
            requested_destination:DEST,
            payload_ref:"data:application/json;base64,"+bytesToBase64(rawBytes),
            payload_sha256:payloadHash,
            payload_size_bytes:rawBytes.length
          },
          credential_material_present:false,
          provider_operation_authorized:false,
          relationship_mutation_authorized:false,
          request_grants_authority:false,
          authority_effect:"NONE_REQUEST_ONLY",
          activation_effect:false
        },
        validated_projection:valid,
        source_payload_sha256:payloadHash,
        source_size_bytes:rawBytes.length
      };
    });
  }
  function buildTrigger(entry){
    var body={schema:"stegos.node_intr_materialization_trigger.v1",transport_origin:"STEGOS_NODE_OUTBOX",node_id:entry.node_id,interlock_id:entry.interlock_id,outbox_entry_hash:entry.outbox_entry_hash,node_outbox_entry:entry,request_grants_execution_authority:false,claim_or_fence_minted:false,authority_effect:"NONE_TRIGGER_ONLY"};
    return shaUri(body).then(function(hash){return Object.assign({},body,{trigger_sha256:hash});});
  }
  function waitForActive(registration){
    if(registration.active)return Promise.resolve(registration.active);
    var worker=registration.installing||registration.waiting;
    requireValue(!!worker,"projection admission worker unavailable");
    return new Promise(function(resolve,reject){
      var timer=setTimeout(function(){reject(new Error("FAIL_CLOSED: projection admission worker activation timeout"));},5000);
      function check(){if(worker.state==="activated"){clearTimeout(timer);resolve(worker);}else if(worker.state==="redundant"){clearTimeout(timer);reject(new Error("FAIL_CLOSED: projection admission worker became redundant"));}}
      worker.addEventListener("statechange",check);check();
    });
  }
  function loadWorker(){
    requireValue(root.navigator&&root.navigator.serviceWorker&&root.isSecureContext!==false,"resident service worker unavailable");
    return root.navigator.serviceWorker.register(WORKER_URL,{scope:WORKER_SCOPE}).then(waitForActive);
  }
  function dispatch(worker,trigger){
    return new Promise(function(resolve,reject){
      requireValue(typeof MessageChannel!=="undefined","MessageChannel unavailable");
      var channel=new MessageChannel(),timer=setTimeout(function(){reject(new Error("FAIL_CLOSED: projection admission response timeout"));},5000);
      channel.port1.onmessage=function(event){clearTimeout(timer);var data=event.data||{};if(!data.ok){reject(new Error("FAIL_CLOSED: "+String(data.reason||"projection admission denied")));return;}resolve(data.receipt);};
      worker.postMessage({type:"STEGVERSE_MY_KV_SET_PROJECTION_ADMISSION_TRIGGER",trigger:trigger},[channel.port2]);
    });
  }
  function validateReceipt(receipt,materialization,nodeId,query,sourceHash,sourceSize){
    requireValue(receipt&&receipt.schema===RECEIPT_SCHEMA&&receipt.state==="RESULT_AVAILABLE","projection admission receipt invalid");
    requireValue(receipt.materialization_id===materialization.materialization_id&&receipt.request_hash===materialization.request_hash&&receipt.node_id===nodeId,"projection admission receipt binding mismatch");
    requireValue(receipt.record_class===ADMISSION_CLASS&&receipt.local_ingress_observed===true&&receipt.resident_materialization_observed===true,"projection admission resident evidence missing");
    requireValue(receipt.provider_execution_attempted===false&&receipt.relationship_mutation_attempted===false&&receipt.data_moved===false&&receipt.replication_started===false&&receipt.ai_corpus_exposed===false,"projection admission claimed prohibited effects");
    requireValue(receipt.credential_material_present===false&&receipt.provider_operation_authorized===false&&receipt.relationship_mutation_authorized===false,"projection admission authority boundary invalid");
    requireValue(receipt.credential_authority==="TV/TVC"&&receipt.github_token_runtime_authority==="NONE"&&receipt.authority_effect==="NONE_RESULT_DELIVERY_ONLY","projection admission credential/authority effect invalid");
    var response=receipt.response;
    requireValue(response&&response.schema===RESPONSE_SCHEMA&&response.state==="PROJECTION_ADMITTED","projection admission response invalid");
    requireValue(response.materialization_id===materialization.materialization_id&&response.request_hash===materialization.request_hash&&response.node_id===nodeId&&response.request_id===query.request_id,"projection admission response binding mismatch");
    requireValue(response.canonical_path===DEST&&response.projection_sha256===sourceHash&&response.size_bytes===sourceSize&&response.exact_readback_verified===true,"projection admission exact-readback proof invalid");
    requireValue(response.credential_material_present===false&&response.provider_operation_authorized===false&&response.relationship_mutation_authorized===false&&response.authority_effect==="NONE"&&response.activation_effect===false,"projection admission response authority invalid");
    return clone(response);
  }
  function perform(rawBytes,projection,manager){
    var intr=root.StegVerseGeneratedInTr,hb=root.StegVerseHBInTrCarrier,node=root.StegVerseNodeContinuity;
    requireValue(intr&&typeof intr.buildIntent==="function"&&typeof intr.buildMaterializationRequest==="function","generated InTr transport unavailable");
    requireValue(hb&&typeof hb.buildBinding==="function","HB-derived carrier unavailable");
    requireValue(node&&typeof node.status==="function"&&typeof node.queueIntrMaterializationRequest==="function","registered StegVerse Node unavailable");
    return node.status().then(function(state){
      requireValue(state&&state.registered===true&&state.registration&&state.registration.node_id,"Register this device before admitting a KV-set projection");
      var nodeId=state.registration.node_id;
      return buildEnvelope(nodeId,rawBytes,projection,manager).then(function(built){
        var query=built.query,bytes=new TextEncoder().encode(canonical(query));
        return intr.buildIntent("device-kv",bytes,"COMMIT_CANDIDATE",query.request_id).then(function(intent){
          return hb.buildBinding(intent.packet_id,intent.payload_hash).then(function(binding){
            return intr.buildMaterializationRequest("device-kv",intent,"inline://materialization_request.kv_request",binding,{kv_request:query}).then(function(materialization){
              return node.queueIntrMaterializationRequest(materialization).then(function(entry){
                return Promise.all([loadWorker(),buildTrigger(entry)]).then(function(values){return dispatch(values[0],values[1]);}).then(function(receipt){return validateReceipt(receipt,materialization,nodeId,query,built.source_payload_sha256,built.source_size_bytes);});
              });
            });
          });
        });
      });
    });
  }
  function admitFile(file){
    requireValue(file&&typeof file.arrayBuffer==="function","owner-selected projection file required");
    return file.arrayBuffer().then(function(buffer){
      var bytes=new Uint8Array(buffer),parsed;
      try{parsed=JSON.parse(new TextDecoder().decode(bytes));}catch(_){throw new Error("FAIL_CLOSED: selected projection JSON invalid");}
      return perform(bytes,parsed).then(function(response){return {persisted:true,state:"KV_SET_PROJECTION_ADMITTED",message:"KV-set projection admitted to resident DEVICE_KV with exact readback.",response:response};});
    });
  }

  return Object.freeze({
    bridge_kind:"DEVICE_KV_MY_KV_SET_PROJECTION_ADMISSION",
    admitFile:admitFile,
    admitBytes:function(bytes,projection,manager){return perform(bytes,projection,manager);},
    _test:Object.freeze({validateProjection:validateProjection,buildEnvelope:buildEnvelope,buildTrigger:buildTrigger,record_class:ADMISSION_CLASS,destination:DEST}),
    authority_effect:"NONE",
    activation_effect:false
  });
}));
