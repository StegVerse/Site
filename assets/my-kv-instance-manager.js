(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVInstanceManager=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  var SET_SCHEMA="stegverse.kv.my-kv-set-projection/v1";
  var INSTANCE_SCHEMA="stegverse.kv.my-kv-instance-projection/v1";
  var PROVIDER_REQUEST_SCHEMA="stegverse.site.my-kv.provider-operation-request/v1";
  var RELATIONSHIP_REQUEST_SCHEMA="stegverse.site.my-kv.relationship-transition-request/v1";
  var TIERS=["NOT_CONNECTED","CONNECTED","SYNCED","AI_INTERACTION"];
  var PROVIDER_OPS=["CONNECT","VERIFY","READ","WRITE","SYNC","DISCONNECT"];

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function requireValue(ok,message){if(!ok) throw new Error("FAIL_CLOSED: "+message);}
  function rejectSensitive(value,path){
    path=path||"projection";
    if(Array.isArray(value)){value.forEach(function(v,i){rejectSensitive(v,path+"["+i+"]");});return;}
    if(!value||typeof value!=="object") return;
    Object.keys(value).forEach(function(key){
      var lower=String(key).toLowerCase();
      var forbidden=["password","secret","token","private_key","access_token","refresh_token","credential_material","skap_credential_ref","interlock_receipt_ref","intr_receipt_ref"];
      if(forbidden.some(function(part){return lower===part||lower.indexOf(part)>=0;})) throw new Error("FAIL_CLOSED: sensitive MyKV projection field prohibited at "+path+"."+key);
      rejectSensitive(value[key],path+"."+key);
    });
  }
  function validateInstance(instance,setId){
    requireValue(instance&&instance.schema===INSTANCE_SCHEMA,"instance projection schema invalid");
    requireValue(typeof instance.instance_id==="string"&&instance.instance_id.indexOf("kvi_")===0,"instance id invalid");
    requireValue(Number.isInteger(instance.instance_number)&&instance.instance_number>=1,"instance number invalid");
    requireValue(instance.kv_set_id===setId,"instance set binding mismatch");
    requireValue(instance.private_content_included===false,"private content projection prohibited");
    requireValue(instance.credential_material_included===false,"credential material projection prohibited");
    requireValue(instance.authority_effect==="NONE_STATUS_ONLY"&&instance.activation_effect===false,"instance authority boundary invalid");
    requireValue(instance.management&&instance.management.provider_mutation_authorized===false&&instance.management.relationship_mutation_authorized===false,"mutation authority prohibited");
    requireValue(instance.relationship&&TIERS.indexOf(instance.relationship.tier)>=0,"relationship tier invalid");
    if(instance.provider){
      requireValue(instance.provider.credential_material_included!==true,"provider credential material prohibited");
    }
    rejectSensitive(instance,"instance");
    return clone(instance);
  }
  function validateSetProjection(projection){
    requireValue(projection&&projection.schema===SET_SCHEMA,"KV set projection schema invalid");
    requireValue(typeof projection.kv_set_id==="string"&&projection.kv_set_id,"KV set id missing");
    requireValue(Array.isArray(projection.instances)&&projection.instances.length>=1,"KV set instances missing");
    requireValue(projection.instance_count===projection.instances.length,"KV set count mismatch");
    requireValue(projection.private_content_included===false&&projection.credential_material_included===false,"KV set content boundary invalid");
    requireValue(projection.authority_effect==="NONE_STATUS_ONLY"&&projection.activation_effect===false,"KV set authority boundary invalid");
    var ids={},numbers={};
    var instances=projection.instances.map(function(instance){
      var valid=validateInstance(instance,projection.kv_set_id);
      requireValue(!ids[valid.instance_id],"duplicate instance id");ids[valid.instance_id]=true;
      requireValue(!numbers[valid.instance_number],"duplicate instance number");numbers[valid.instance_number]=true;
      return valid;
    }).sort(function(a,b){return a.instance_number-b.instance_number;});
    return {schema:SET_SCHEMA,kv_set_id:projection.kv_set_id,instances:instances,instance_count:instances.length,private_content_included:false,credential_material_included:false,authority_effect:"NONE_STATUS_ONLY",activation_effect:false};
  }
  function loadKVSet(bridge){
    if(!bridge||typeof bridge.getKVSetProjection!=="function") return Promise.resolve({state:"BRIDGE_UNAVAILABLE",projection:null});
    return Promise.resolve(bridge.getKVSetProjection({schema:"stegverse.site.my-kv.kv-set-status-request/v1",access:"READ_ONLY",authority_effect:"NONE"})).then(function(projection){
      return {state:"KV_SET_LISTED",projection:validateSetProjection(projection)};
    });
  }
  function instanceFromProjection(projection,instanceId){
    var valid=validateSetProjection(projection);
    var match=valid.instances.find(function(item){return item.instance_id===instanceId;});
    requireValue(!!match,"selected KV instance unavailable");
    return match;
  }
  function requestProviderOperation(projection,instanceId,providerId,operation,bridge){
    var instance=instanceFromProjection(projection,instanceId),op=String(operation||"").toUpperCase();
    requireValue(PROVIDER_OPS.indexOf(op)>=0,"provider operation invalid");
    requireValue(typeof providerId==="string"&&providerId,"provider id required");
    requireValue(bridge&&typeof bridge.requestProviderOperation==="function","governed provider-operation bridge unavailable");
    var request={schema:PROVIDER_REQUEST_SCHEMA,kv_set_id:projection.kv_set_id,instance_id:instance.instance_id,provider_id:providerId,operation:op,governance_state:"PENDING_INTERLOCK_INTR",credential_destination:"SKAP_VAULT",credential_material_present:false,provider_operation_authorized:false,authority_effect:"NONE_REQUEST_ONLY",activation_effect:false};
    return Promise.resolve(bridge.requestProviderOperation(clone(request))).then(function(result){
      rejectSensitive(result,"provider_request_result");
      requireValue(result&&result.request_id&&result.governance_state==="PENDING_INTERLOCK_INTR","provider request was not preserved as pending");
      requireValue(result.credential_material_present===false&&result.provider_operation_authorized===false,"provider request authority boundary invalid");
      return clone(result);
    });
  }
  function requestRelationshipTransition(projection,participantInstanceIds,targetTier,bridge){
    var valid=validateSetProjection(projection),target=String(targetTier||"").toUpperCase();
    requireValue(TIERS.indexOf(target)>=0,"relationship target tier invalid");
    requireValue(Array.isArray(participantInstanceIds)&&participantInstanceIds.length>=2,"at least two participating KVs required");
    var selected=participantInstanceIds.map(function(id){return instanceFromProjection(valid,id);});
    var current=selected[0].relationship.tier;
    requireValue(selected.every(function(item){return item.relationship.tier===current;}),"participant relationship tiers differ");
    requireValue(bridge&&typeof bridge.requestRelationshipTransition==="function","governed relationship bridge unavailable");
    var request={schema:RELATIONSHIP_REQUEST_SCHEMA,kv_set_id:valid.kv_set_id,participant_instance_ids:participantInstanceIds.slice().sort(),current_tier:current,target_tier:target,governance_state:"PENDING_INTERLOCK_INTR",data_moved:false,replication_started:false,ai_corpus_exposed:false,relationship_mutation_authorized:false,authority_effect:"NONE_REQUEST_ONLY",activation_effect:false};
    return Promise.resolve(bridge.requestRelationshipTransition(clone(request))).then(function(result){
      rejectSensitive(result,"relationship_request_result");
      requireValue(result&&result.request_id&&result.governance_state==="PENDING_INTERLOCK_INTR","relationship request was not preserved as pending");
      requireValue(result.data_moved===false&&result.replication_started===false&&result.ai_corpus_exposed===false,"pending relationship request claimed runtime effects");
      return clone(result);
    });
  }
  return Object.freeze({
    tiers:TIERS.slice(),providerOperations:PROVIDER_OPS.slice(),validateSetProjection:validateSetProjection,
    loadKVSet:loadKVSet,requestProviderOperation:requestProviderOperation,requestRelationshipTransition:requestRelationshipTransition
  });
}));
