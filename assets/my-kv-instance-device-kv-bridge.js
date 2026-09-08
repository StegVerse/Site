(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVInstanceBridge=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var SET_CLASS="MY_KV_INSTANCE_SET_PROJECTION";
  var PROVIDER_CLASS="MY_KV_PROVIDER_OPERATION_REQUEST";
  var RELATIONSHIP_CLASS="MY_KV_RELATIONSHIP_TRANSITION_REQUEST";
  var SET_SCHEMA="stegverse.kv.my-kv-set-projection/v1";
  var PROVIDER_SCHEMA="stegverse.site.my-kv.provider-operation-request/v1";
  var RELATIONSHIP_SCHEMA="stegverse.site.my-kv.relationship-transition-request/v1";
  var RESULT_REQUEST_SCHEMA="stegverse.device-kv.query-result-request/v1";
  var RESULT_SCHEMA="stegverse.device-kv.query-result-delivery/v1";

  function requireValue(ok,message){if(!ok) throw new Error("FAIL_CLOSED: "+message);}
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
  function buildEnvelope(nodeId,recordClass,request){
    return {
      schema_version:"kv.interlock.request.v1",
      operation:"REQUEST",
      request_id:randomId("SITE-MY-KV-N"),
      requester:{module:"Site",component:"MyKVInstanceManager"},
      purpose:recordClass===SET_CLASS
        ?"Read an already-admitted bounded KV instance-set projection."
        :recordClass===PROVIDER_CLASS
          ?"Transport a governed provider-operation request without executing provider authority."
          :"Transport a governed KV relationship-transition request without materializing relationship effects.",
      record_class:recordClass,
      requested_scope:recordClass===SET_CLASS?["kv_set_projection"]:["governance_request_status"],
      minimum_necessary_justification:"Transport only the bounded MyKV status/request object required by the selected operation.",
      authority_ref:"stegos-node://"+nodeId,
      disclosure_mode:"BOUNDED_CONTEXT",
      selector:recordClass===SET_CLASS?{kv_set_id:request.kv_set_id||"personal"}:null,
      my_kv_request:recordClass===SET_CLASS?null:clone(request),
      credential_material_present:false,
      provider_operation_authorized:false,
      relationship_mutation_authorized:false,
      authority_effect:"NONE_REQUEST_ONLY",
      activation_effect:false
    };
  }
  function validateInput(recordClass,request){
    requireValue(request&&typeof request==="object","MyKV transport request required");
    if(recordClass===SET_CLASS){
      requireValue(request.schema==="stegverse.site.my-kv.kv-set-status-request/v1","KV set status request schema invalid");
      requireValue(request.access==="READ_ONLY"&&request.authority_effect==="NONE","KV set read authority invalid");
      return;
    }
    if(recordClass===PROVIDER_CLASS){
      requireValue(request.schema===PROVIDER_SCHEMA,"provider request schema invalid");
      requireValue(request.governance_state==="PENDING_INTERLOCK_INTR","provider request must remain pending governance");
      requireValue(request.credential_material_present===false&&request.provider_operation_authorized===false,"provider authority boundary invalid");
      requireValue(request.authority_effect==="NONE_REQUEST_ONLY"&&request.activation_effect===false,"provider activation boundary invalid");
      return;
    }
    requireValue(request.schema===RELATIONSHIP_SCHEMA,"relationship request schema invalid");
    requireValue(request.governance_state==="PENDING_INTERLOCK_INTR","relationship request must remain pending governance");
    requireValue(request.data_moved===false&&request.replication_started===false&&request.ai_corpus_exposed===false,"relationship request claimed runtime effects");
    requireValue(request.relationship_mutation_authorized===false&&request.authority_effect==="NONE_REQUEST_ONLY"&&request.activation_effect===false,"relationship authority boundary invalid");
  }
  function validateDelivery(delivery,built,nodeId,query,recordClass){
    requireValue(delivery&&delivery.schema===RESULT_SCHEMA&&delivery.state==="RESULT_AVAILABLE","DEVICE_KV result schema/state invalid");
    requireValue(delivery.materialization_id===built.materialization_id&&delivery.request_hash===built.request_hash,"DEVICE_KV result request binding mismatch");
    requireValue(delivery.node_id===nodeId,"DEVICE_KV result Node mismatch");
    requireValue(delivery.credential_material_present===false&&delivery.provider_operation_authorized===false&&delivery.result_lookup_grants_authority===false,"DEVICE_KV delivery authority invalid");
    var response=delivery.response;
    requireValue(response&&response.record_class===recordClass,"DEVICE_KV MyKV response class mismatch");
    requireValue(response.query_request_id===query.request_id,"DEVICE_KV MyKV response query mismatch");
    requireValue(response.credential_material_present===false&&response.provider_operation_authorized===false&&response.request_grants_authority===false&&response.response_grants_authority===false,"DEVICE_KV MyKV response authority invalid");
    requireValue(response.authority_effect==="NONE","DEVICE_KV MyKV response authority effect invalid");
    return response.projection||response.result;
  }
  function perform(recordClass,request){
    validateInput(recordClass,request);
    var intr=root.StegVerseGeneratedInTr,hb=root.StegVerseHBInTrCarrier,node=root.StegVerseNodeContinuity,sync=root.StegVerseDeviceKVInTrSync;
    requireValue(intr&&typeof intr.buildIntent==="function"&&typeof intr.buildMaterializationRequest==="function","generated InTr transport unavailable");
    requireValue(hb&&typeof hb.buildBinding==="function","HB-derived carrier unavailable");
    requireValue(node&&typeof node.status==="function"&&typeof node.queueIntrMaterializationRequest==="function","registered StegVerse Node unavailable");
    requireValue(sync&&typeof sync.synchronizeMaterialization==="function"&&typeof sync.loadTarget==="function"&&typeof sync.getDeliveryReceipt==="function","DEVICE_KV transport unavailable");
    return node.status().then(function(state){
      requireValue(state&&state.registered===true&&state.registration&&state.registration.node_id,"Register this device before using MyKV transport");
      var nodeId=state.registration.node_id,query=buildEnvelope(nodeId,recordClass,request);
      var bytes=new TextEncoder().encode(canonical(query));
      return intr.buildIntent("device-kv",bytes,"REQUEST",query.request_id).then(function(intent){
        return hb.buildBinding(intent.packet_id,intent.payload_hash).then(function(binding){
          return intr.buildMaterializationRequest("device-kv",intent,"inline://materialization_request.kv_request",binding,{kv_request:query}).then(function(materialization){
            return node.queueIntrMaterializationRequest(materialization).then(function(){
              return sync.synchronizeMaterialization(materialization.materialization_id).then(function(){
                return Promise.all([sync.getDeliveryReceipt(materialization.materialization_id),sync.loadTarget(recordClass)]);
              }).then(function(values){
                var receipt=values[0],target=values[1];
                requireValue(receipt&&((receipt.network_delivery_observed===true)||(receipt.local_ingress_observed===true)),"DEVICE_KV MyKV ingress delivery not observed");
                requireValue(target&&target.state==="CONFORMING_SOVEREIGN_INTR_INGRESS"&&target.runtime_ingress_observed===true,"DEVICE_KV MyKV result target unavailable");
                requireValue(typeof target.result_url==="string"&&target.result_url,"DEVICE_KV MyKV result URL unavailable");
                var lookup={schema:RESULT_REQUEST_SCHEMA,materialization_id:materialization.materialization_id,request_hash:materialization.request_hash,node_id:nodeId,authority_effect:"NONE_RESULT_LOOKUP_ONLY"};
                var text=canonical(lookup);
                return root.fetch(target.result_url,{method:"POST",mode:"cors",cache:"no-store",credentials:"omit",headers:{"Content-Type":"application/json","X-StegVerse-Transport":"InTr","X-StegVerse-Transport-Origin":"STEGOS_NODE_OUTBOX"},body:text}).then(function(response){
                  return response.json().then(function(body){
                    requireValue(response.status===200,"DEVICE_KV MyKV result unavailable");
                    return validateDelivery(body,materialization,nodeId,query,recordClass);
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  var api={
    bridge_kind:"DEVICE_KV_MY_KV_N_TRANSPORT",
    getKVSetProjection:function(request){
      return perform(SET_CLASS,request).then(function(projection){
        requireValue(projection&&projection.schema===SET_SCHEMA,"KV set projection schema invalid");
        requireValue(projection.private_content_included===false&&projection.credential_material_included===false,"KV set projection content boundary invalid");
        requireValue(projection.authority_effect==="NONE_STATUS_ONLY"&&projection.activation_effect===false,"KV set projection authority boundary invalid");
        return clone(projection);
      });
    },
    requestProviderOperation:function(request){
      return perform(PROVIDER_CLASS,request).then(function(result){
        requireValue(result&&result.request_id&&result.governance_state==="PENDING_INTERLOCK_INTR","provider request transport did not preserve pending state");
        requireValue(result.credential_material_present===false&&result.provider_operation_authorized===false,"provider request result authority invalid");
        return clone(result);
      });
    },
    requestRelationshipTransition:function(request){
      return perform(RELATIONSHIP_CLASS,request).then(function(result){
        requireValue(result&&result.request_id&&result.governance_state==="PENDING_INTERLOCK_INTR","relationship request transport did not preserve pending state");
        requireValue(result.data_moved===false&&result.replication_started===false&&result.ai_corpus_exposed===false,"relationship request result claimed runtime effects");
        return clone(result);
      });
    },
    _test:Object.freeze({buildEnvelope:buildEnvelope,validateInput:validateInput,classes:{set:SET_CLASS,provider:PROVIDER_CLASS,relationship:RELATIONSHIP_CLASS}}),
    authority_effect:"NONE",
    activation_effect:false
  };
  return Object.freeze(api);
}));
