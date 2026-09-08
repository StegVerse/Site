(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVInstanceUI=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function text(value){return value==null?"":String(value);}
  function summarizeProviders(instance){
    var providers=instance.providers;
    requireValue(providers&&typeof providers==="object"&&!Array.isArray(providers),"canonical plural provider projection missing");
    requireValue(providers.items&&typeof providers.items==="object"&&!Array.isArray(providers.items),"canonical provider items invalid");
    requireValue(Array.isArray(providers.pending_requests),"canonical provider pending requests invalid");
    requireValue(providers.provider_mutation_authorized===false,"provider mutation authority must remain false");
    requireValue(providers.credential_material_included===false,"provider credential material must remain excluded");
    var items=Object.keys(providers.items).sort().map(function(providerId){
      var row=providers.items[providerId];
      requireValue(row&&typeof row==="object"&&!Array.isArray(row),"provider status row invalid");
      return {
        provider_id:text(providerId),
        connection_state:text(row.connection_state||"NOT_OBSERVED"),
        verified:row.verified===true,
        last_request_id:row.last_request_id==null?null:text(row.last_request_id),
        last_operation:row.last_operation==null?null:text(row.last_operation),
        last_result_ref:row.last_result_ref==null?null:text(row.last_result_ref)
      };
    });
    var pending=providers.pending_requests.map(function(row){
      requireValue(row&&typeof row==="object"&&!Array.isArray(row),"provider pending request row invalid");
      return {request_id:text(row.request_id),provider_id:row.provider_id==null?null:text(row.provider_id),operation:row.operation==null?null:text(row.operation)};
    });
    return {items:items,pending_requests:pending,provider_mutation_authorized:false,credential_material_included:false};
  }
  function summarizeInstance(instance){
    requireValue(instance&&typeof instance==="object","instance required");
    var relationship=instance.relationship||{},providers=summarizeProviders(instance);
    return {
      instance_id:text(instance.instance_id),
      instance_number:Number(instance.instance_number),
      label:"KV #"+String(instance.instance_number),
      storage_medium:instance.storage&&instance.storage.medium?text(instance.storage.medium):"NOT_OBSERVED",
      storage_locator:instance.storage&&instance.storage.locator?text(instance.storage.locator):null,
      providers:providers.items,
      pending_provider_requests:providers.pending_requests,
      provider_count:providers.items.length,
      relationship_tier:text(relationship.tier||"NOT_CONNECTED"),
      relationship_governance_state:text(relationship.governance_state||"NOT_CONNECTED"),
      pending_relationship_request_ids:Array.isArray(relationship.pending_request_ids)?relationship.pending_request_ids.map(text):[],
      private_content_included:instance.private_content_included===true,
      credential_material_included:instance.credential_material_included===true,
      provider_mutation_authorized:false,
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
  return Object.freeze({summarizeProviders:summarizeProviders,summarizeInstance:summarizeInstance,summarizeProjection:summarizeProjection,load:load,requestProvider:requestProvider,requestRelationship:requestRelationship,authority_effect:"NONE",activation_effect:false});
}));
