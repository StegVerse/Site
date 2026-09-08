(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVInstanceUI=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function text(value){return value==null?"":String(value);}
  function summarizeInstance(instance){
    requireValue(instance&&typeof instance==="object","instance required");
    var provider=instance.provider||null,relationship=instance.relationship||{};
    return {
      instance_id:text(instance.instance_id),
      instance_number:Number(instance.instance_number),
      label:"KV #"+String(instance.instance_number),
      provider_id:provider&&provider.provider_id?text(provider.provider_id):null,
      provider_state:provider&&provider.state?text(provider.state):"NOT_OBSERVED",
      relationship_tier:text(relationship.tier||"NOT_CONNECTED"),
      private_content_included:instance.private_content_included===true,
      credential_material_included:instance.credential_material_included===true,
      authority_effect:text(instance.authority_effect),
      activation_effect:instance.activation_effect===true
    };
  }
  function summarizeProjection(projection,manager){
    requireValue(manager&&typeof manager.validateSetProjection==="function","MyKV manager unavailable");
    var valid=manager.validateSetProjection(projection);
    return {kv_set_id:valid.kv_set_id,instance_count:valid.instance_count,instances:valid.instances.map(summarizeInstance),authority_effect:valid.authority_effect,activation_effect:valid.activation_effect};
  }
  function load(manager,bridge){
    requireValue(manager&&typeof manager.loadKVSet==="function","MyKV manager unavailable");
    requireValue(bridge&&typeof bridge.getKVSetProjection==="function","resident MyKV transport unavailable");
    return manager.loadKVSet(bridge).then(function(result){
      requireValue(result&&result.state==="KV_SET_LISTED"&&result.projection,"KV set projection unavailable");
      return summarizeProjection(result.projection,manager);
    });
  }
  function requestProvider(manager,bridge,projection,instanceId,providerId,operation){
    requireValue(manager&&typeof manager.requestProviderOperation==="function","provider request manager unavailable");
    requireValue(bridge&&typeof bridge.requestProviderOperation==="function","provider request transport unavailable");
    return manager.requestProviderOperation(projection,instanceId,providerId,operation,bridge).then(function(result){
      requireValue(result.governance_state==="PENDING_INTERLOCK_INTR","provider request escaped pending governance");
      requireValue(result.credential_material_present===false&&result.provider_operation_authorized===false,"provider request claimed authority");
      return result;
    });
  }
  function requestRelationship(manager,bridge,projection,participants,targetTier){
    requireValue(manager&&typeof manager.requestRelationshipTransition==="function","relationship request manager unavailable");
    requireValue(bridge&&typeof bridge.requestRelationshipTransition==="function","relationship request transport unavailable");
    return manager.requestRelationshipTransition(projection,participants,targetTier,bridge).then(function(result){
      requireValue(result.governance_state==="PENDING_INTERLOCK_INTR","relationship request escaped pending governance");
      requireValue(result.data_moved===false&&result.replication_started===false&&result.ai_corpus_exposed===false,"relationship request claimed runtime effects");
      return result;
    });
  }
  return Object.freeze({summarizeInstance:summarizeInstance,summarizeProjection:summarizeProjection,load:load,requestProvider:requestProvider,requestRelationship:requestRelationship,authority_effect:"NONE",activation_effect:false});
}));
