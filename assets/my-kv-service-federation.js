(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseMyKVServiceFederation=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  var BINDING_SCHEMA="stegverse.kv.service-binding/v1";
  var ACCOUNT_ADD_SCHEMA="stegverse.site.my-kv.account-onboarding-request/v1";
  var SERVICE_PROJECTION_SCHEMA="stegverse.kv.service-projection/v1";
  var SERVICE_CLASSES=["MAIL","CALENDAR","NOTES","FILES","CONTACTS","TASKS","DOCUMENTS","SOCIAL","MESSAGING","RESEARCH","BUSINESS","DEVELOPMENT","FINANCE","OTHER_REGISTERED_SERVICE"];
  var RELATIONSHIPS=["NOT_CONNECTED","CONNECTED","SYNCED","AI_INTERACTION"];
  var CUSTODY_POSTURES=["REFERENCE_ONLY","SYNCED_TO_KV","KV_PRIMARY_OR_SOVEREIGN"];

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function requireValue(ok,message){if(!ok) throw new Error("FAIL_CLOSED: "+message);}
  function upper(v){return String(v||"").trim().toUpperCase();}
  function rejectSensitive(value,path){
    path=path||"value";
    if(Array.isArray(value)){value.forEach(function(v,i){rejectSensitive(v,path+"["+i+"]");});return;}
    if(!value||typeof value!=="object") return;
    Object.keys(value).forEach(function(key){
      var lower=String(key).toLowerCase();
      var forbidden=["password","passcode","secret","token","access_token","refresh_token","private_key","client_secret","authorization_code","magic_link","session_cookie","raw_credential","credential_material"];
      if(forbidden.some(function(part){return lower===part||lower.indexOf(part)>=0;})) throw new Error("FAIL_CLOSED: sensitive federation field prohibited at "+path+"."+key);
      rejectSensitive(value[key],path+"."+key);
    });
  }
  function bindingKey(binding){
    return [binding.service_class,binding.provider,binding.provider_account_ref,binding.kv_instance_ref,binding.relationship_state].join("|");
  }
  function validateBinding(binding){
    requireValue(binding&&binding.schema===BINDING_SCHEMA,"service binding schema invalid");
    binding=clone(binding);
    binding.service_class=upper(binding.service_class);
    binding.relationship_state=upper(binding.relationship_state);
    binding.custody_posture=upper(binding.custody_posture||"REFERENCE_ONLY");
    requireValue(SERVICE_CLASSES.indexOf(binding.service_class)>=0,"unsupported service class");
    requireValue(typeof binding.provider==="string"&&binding.provider.trim(),"provider required");
    requireValue(typeof binding.provider_account_ref==="string"&&binding.provider_account_ref.trim(),"provider account ref required");
    requireValue(typeof binding.kv_instance_ref==="string"&&binding.kv_instance_ref.indexOf("kvi_")===0,"KV instance ref invalid");
    requireValue(RELATIONSHIPS.indexOf(binding.relationship_state)>=0,"relationship state invalid");
    requireValue(CUSTODY_POSTURES.indexOf(binding.custody_posture)>=0,"custody posture invalid");
    requireValue(binding.provider_authority_effect==="NONE_STATUS_ONLY","provider authority effect invalid");
    requireValue(binding.credential_material_present===false,"credential material must remain absent");
    requireValue(binding.provider_mutation_authorized===false,"provider mutation authority must remain false in projection");
    requireValue(binding.activation_effect===false,"binding projection must not claim activation");
    rejectSensitive(binding,"binding");
    binding.binding_key=bindingKey(binding);
    return binding;
  }
  function validateBindings(bindings){
    requireValue(Array.isArray(bindings),"bindings must be an array");
    var seen={};
    return bindings.map(function(binding){
      var valid=validateBinding(binding);
      requireValue(!seen[valid.binding_key],"duplicate service/account binding");
      seen[valid.binding_key]=true;
      return valid;
    });
  }
  function buildUnifiedProjection(bindings,serviceClass,selectedKeys){
    var valid=validateBindings(bindings),service=upper(serviceClass);
    requireValue(SERVICE_CLASSES.indexOf(service)>=0,"unsupported service class");
    var selectedSet=null;
    if(selectedKeys!==undefined&&selectedKeys!==null){
      requireValue(Array.isArray(selectedKeys),"selected binding keys must be an array");
      selectedSet={};selectedKeys.forEach(function(k){selectedSet[String(k)]=true;});
    }
    var rows=valid.filter(function(binding){return binding.service_class===service&&(!selectedSet||selectedSet[binding.binding_key]);});
    return {schema:SERVICE_PROJECTION_SCHEMA,service_class:service,selection:selectedSet?"SELECTED":"ALL",bindings:rows,binding_count:rows.length,provenance_preserved:true,custody_merged:false,provider_mutation_authorized:false,credential_material_present:false,authority_effect:"NONE_STATUS_ONLY",activation_effect:false};
  }
  function requestAccountOnboarding(input,bridge){
    requireValue(input&&typeof input==="object","account onboarding input required");
    requireValue(typeof input.provider==="string"&&input.provider.trim(),"provider required");
    requireValue(typeof input.account_hint==="string"&&input.account_hint.trim(),"account hint required");
    requireValue(typeof input.kv_instance_ref==="string"&&input.kv_instance_ref.indexOf("kvi_")===0,"KV instance ref invalid");
    requireValue(bridge&&typeof bridge.requestAccountOnboarding==="function","governed account-onboarding bridge unavailable");
    var requestedServices=Array.isArray(input.requested_service_classes)?input.requested_service_classes.map(upper):[];
    requestedServices.forEach(function(service){requireValue(SERVICE_CLASSES.indexOf(service)>=0,"unsupported requested service class");});
    var request={
      schema:ACCOUNT_ADD_SCHEMA,
      provider:input.provider.trim(),
      account_hint:input.account_hint.trim(),
      kv_instance_ref:input.kv_instance_ref,
      requested_service_classes:requestedServices,
      authorization_mode:"PROVIDER_NATIVE_OR_SKAP_SEALED",
      credential_destination:"SKAP_VAULT",
      credential_material_present:false,
      provider_capability_discovery_required:true,
      relationship_default:"NOT_CONNECTED",
      sync_default:false,
      ai_interaction_default:false,
      destructive_mutation_default:false,
      sharing_default:false,
      publication_default:false,
      governance_state:"PENDING_INTERLOCK_INTR",
      provider_operation_authorized:false,
      authority_effect:"NONE_REQUEST_ONLY",
      activation_effect:false
    };
    return Promise.resolve(bridge.requestAccountOnboarding(clone(request))).then(function(result){
      rejectSensitive(result,"account_onboarding_result");
      requireValue(result&&typeof result.request_id==="string"&&result.request_id,"account onboarding request id missing");
      requireValue(result.governance_state==="PENDING_INTERLOCK_INTR","account onboarding must remain pending governance");
      requireValue(result.credential_material_present===false,"account onboarding result leaked credential material");
      requireValue(result.provider_operation_authorized===false,"account onboarding result must not claim provider authority");
      return clone(result);
    });
  }

  return Object.freeze({
    bindingSchema:BINDING_SCHEMA,
    accountOnboardingSchema:ACCOUNT_ADD_SCHEMA,
    serviceProjectionSchema:SERVICE_PROJECTION_SCHEMA,
    serviceClasses:SERVICE_CLASSES.slice(),
    relationships:RELATIONSHIPS.slice(),
    custodyPostures:CUSTODY_POSTURES.slice(),
    validateBinding:validateBinding,
    validateBindings:validateBindings,
    buildUnifiedProjection:buildUnifiedProjection,
    requestAccountOnboarding:requestAccountOnboarding
  });
}));
