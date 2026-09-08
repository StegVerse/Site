"use strict";

/* Dedicated resident DEVICE_KV receiver for bounded MyKV #1/#2/#n transport.
 * It consumes registered-Node outbox triggers only. It does not execute provider
 * operations, mutate relationships, move/replicate data, or expose AI corpus data.
 */
var TRIGGER_SCHEMA="stegos.node_intr_materialization_trigger.v1";
var OUTBOX_SCHEMA="stegos.node_intr_outbox_entry.v1";
var MATERIALIZATION_SCHEMA="stegverse.universal-intr-materialization-request/v1";
var RESPONSE_SCHEMA="stegverse.device-kv.query-response/v1";
var SET_CLASS="MY_KV_INSTANCE_SET_PROJECTION";
var PROVIDER_CLASS="MY_KV_PROVIDER_OPERATION_REQUEST";
var RELATIONSHIP_CLASS="MY_KV_RELATIONSHIP_TRANSITION_REQUEST";
var SET_SCHEMA="stegverse.kv.my-kv-set-projection/v1";
var PROVIDER_SCHEMA="stegverse.site.my-kv.provider-operation-request/v1";
var RELATIONSHIP_SCHEMA="stegverse.site.my-kv.relationship-transition-request/v1";
var KV_DB="stegverse-device-local-intr-v1";
var KV_DB_VERSION=1;
var KV_FILES="kv_files";
var SET_PATH="_System/my-kv-set-projection.json";
var RESULT_DB="stegverse-my-kv-n-device-kv-v1";
var RESULT_STORE="results";
var DEVICE_KV_DEST='{"boundary":"KV","subsystem":"KnowledgeVault:Interlock"}';
var DEVICE_KV_OWNER="StegVerse-Labs/continuity-vault-kit#79";

function requireValue(ok,message){if(!ok) throw new Error(message);}
function canon(v){
  if(v===null||typeof v!=="object") return JSON.stringify(v);
  if(Array.isArray(v)) return "["+v.map(canon).join(",")+"]";
  return "{"+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+":"+canon(v[k]);}).join(",")+"}";
}
function bytesToHex(bytes){return Array.prototype.map.call(new Uint8Array(bytes),function(x){return x.toString(16).padStart(2,"0");}).join("");}
function shaUri(v){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(canon(v))).then(function(d){return "sha256:"+bytesToHex(d);});}
function openDb(name,version,upgrade){return new Promise(function(resolve,reject){
  var r=indexedDB.open(name,version);r.onupgradeneeded=function(){if(upgrade)upgrade(r.result);};r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error("indexeddb_open_failed"));};
});}
function getKvRow(key){return openDb(KV_DB,KV_DB_VERSION).then(function(db){return new Promise(function(resolve,reject){
  if(!db.objectStoreNames.contains(KV_FILES)){db.close();reject(new Error("canonical_kv_store_unavailable"));return;}
  var tx=db.transaction(KV_FILES,"readonly"),r=tx.objectStore(KV_FILES).get(key);r.onsuccess=function(){resolve(r.result||null);};r.onerror=function(){reject(r.error);};tx.oncomplete=function(){db.close();};
});});}
function putResult(row){return openDb(RESULT_DB,1,function(db){if(!db.objectStoreNames.contains(RESULT_STORE))db.createObjectStore(RESULT_STORE,{keyPath:"materialization_id"});}).then(function(db){return new Promise(function(resolve,reject){
  var tx=db.transaction(RESULT_STORE,"readwrite"),s=tx.objectStore(RESULT_STORE),r=s.get(row.materialization_id);r.onsuccess=function(){if(r.result&&canon(r.result)!==canon(row)){tx.abort();reject(new Error("my_kv_n_result_write_once_collision"));return;}if(!r.result)s.add(row);};r.onerror=function(){reject(r.error);};tx.oncomplete=function(){db.close();resolve(row);};tx.onabort=function(){db.close();};
});});}
function rejectSensitive(value,path){path=path||"value";if(Array.isArray(value)){value.forEach(function(v,i){rejectSensitive(v,path+"["+i+"]");});return;}if(!value||typeof value!=="object")return;Object.keys(value).forEach(function(key){
  var lower=String(key).toLowerCase();if(["password","secret","token","access_token","refresh_token","private_key","credential_material","skap_credential_ref","interlock_receipt_ref","intr_receipt_ref"].some(function(part){return lower===part||lower.indexOf(part)>=0;}))throw new Error("sensitive_my_kv_n_field_forbidden:"+path+"."+key);rejectSensitive(value[key],path+"."+key);
});}
function validateSetProjection(p,setId){
  requireValue(p&&p.schema===SET_SCHEMA,"my_kv_set_schema_invalid");
  requireValue(typeof p.kv_set_id==="string"&&p.kv_set_id===setId,"my_kv_set_binding_invalid");
  requireValue(Array.isArray(p.instances)&&p.instances.length>=1&&p.instance_count===p.instances.length,"my_kv_set_instances_invalid");
  requireValue(p.private_content_included===false&&p.credential_material_included===false,"my_kv_set_content_boundary_invalid");
  requireValue(p.authority_effect==="NONE_STATUS_ONLY"&&p.activation_effect===false,"my_kv_set_authority_invalid");
  rejectSensitive(p,"projection");return JSON.parse(JSON.stringify(p));
}
function loadSetProjection(q){
  requireValue(q.selector&&typeof q.selector.kv_set_id==="string"&&q.selector.kv_set_id,"my_kv_set_selector_invalid");
  return getKvRow(SET_PATH).then(function(row){
    requireValue(row&&typeof row.content_base64==="string","my_kv_set_projection_not_admitted");
    var parsed;try{parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(row.content_base64),function(c){return c.charCodeAt(0);})));}catch(_){throw new Error("my_kv_set_projection_json_invalid");}
    return validateSetProjection(parsed,q.selector.kv_set_id);
  });
}
function pendingProvider(q){
  var r=q.my_kv_request;requireValue(r&&r.schema===PROVIDER_SCHEMA,"provider_request_schema_invalid");
  requireValue(r.governance_state==="PENDING_INTERLOCK_INTR"&&r.credential_material_present===false&&r.provider_operation_authorized===false,"provider_request_authority_invalid");
  requireValue(r.authority_effect==="NONE_REQUEST_ONLY"&&r.activation_effect===false,"provider_request_activation_invalid");rejectSensitive(r,"provider_request");
  return Object.assign({},JSON.parse(JSON.stringify(r)),{request_id:q.request_id,governance_state:"PENDING_INTERLOCK_INTR",credential_material_present:false,provider_operation_authorized:false,authority_effect:"NONE_REQUEST_ONLY",activation_effect:false});
}
function pendingRelationship(q){
  var r=q.my_kv_request;requireValue(r&&r.schema===RELATIONSHIP_SCHEMA,"relationship_request_schema_invalid");
  requireValue(r.governance_state==="PENDING_INTERLOCK_INTR"&&r.data_moved===false&&r.replication_started===false&&r.ai_corpus_exposed===false,"relationship_request_effect_invalid");
  requireValue(r.relationship_mutation_authorized===false&&r.authority_effect==="NONE_REQUEST_ONLY"&&r.activation_effect===false,"relationship_request_authority_invalid");rejectSensitive(r,"relationship_request");
  return Object.assign({},JSON.parse(JSON.stringify(r)),{request_id:q.request_id,governance_state:"PENDING_INTERLOCK_INTR",data_moved:false,replication_started:false,ai_corpus_exposed:false,relationship_mutation_authorized:false,authority_effect:"NONE_REQUEST_ONLY",activation_effect:false});
}
function validateTrigger(payload){
  requireValue(payload&&payload.schema===TRIGGER_SCHEMA,"node_trigger_schema_invalid");
  requireValue(payload.transport_origin==="STEGOS_NODE_OUTBOX"&&payload.request_grants_execution_authority===false&&payload.claim_or_fence_minted===false&&payload.authority_effect==="NONE_TRIGGER_ONLY","node_trigger_boundary_invalid");
  var entry=payload.node_outbox_entry;requireValue(entry&&entry.schema===OUTBOX_SCHEMA&&entry.state==="LOCAL_OUTBOX_PENDING_NETWORK_DELIVERY","node_outbox_invalid");
  requireValue(entry.credential_authority==="TV/TVC"&&entry.github_token_runtime_authority==="NONE"&&entry.request_grants_execution_authority===false&&entry.claim_or_fence_minted===false,"node_outbox_authority_invalid");
  var eb=Object.assign({},entry),eh=eb.outbox_entry_hash;delete eb.outbox_entry_hash;
  return shaUri(eb).then(function(actual){requireValue(actual===eh,"node_outbox_hash_mismatch");requireValue(payload.node_id===entry.node_id&&payload.interlock_id===entry.interlock_id&&payload.outbox_entry_hash===eh,"node_trigger_binding_mismatch");
    var tb=Object.assign({},payload),th=tb.trigger_sha256;delete tb.trigger_sha256;return shaUri(tb).then(function(ta){requireValue(ta===th,"node_trigger_hash_mismatch");
      var req=entry.materialization_request;requireValue(req&&req.schema===MATERIALIZATION_SCHEMA&&req.state==="QUEUED_FOR_EVENT_EPHEMERAL_MATERIALIZATION","materialization_request_invalid");
      requireValue(JSON.stringify(req.destination)===DEVICE_KV_DEST&&req.downstream_owner_ref===DEVICE_KV_OWNER,"materialization_destination_invalid");
      requireValue(req.request_grants_execution_authority===false&&req.transport_grants_execution_authority===false&&req.claim_or_fence_minted===false&&req.credential_authority==="TV/TVC"&&req.github_token_runtime_authority==="NONE","materialization_authority_invalid");
      var rb=Object.assign({},req),rh=rb.request_hash;delete rb.request_hash;return shaUri(rb).then(function(ra){requireValue(ra===rh,"materialization_request_hash_mismatch");return {entry:entry,request:req};});
    });
  });
}
function materialize(entry,req){
  var q=req.kv_request;requireValue(q&&q.schema_version==="kv.interlock.request.v1"&&q.operation==="REQUEST","my_kv_n_request_invalid");
  requireValue(q.authority_ref==="stegos-node://"+entry.node_id&&q.credential_material_present===false&&q.provider_operation_authorized===false&&q.relationship_mutation_authorized===false&&q.authority_effect==="NONE_REQUEST_ONLY"&&q.activation_effect===false,"my_kv_n_envelope_authority_invalid");
  requireValue(q.record_class===SET_CLASS||q.record_class===PROVIDER_CLASS||q.record_class===RELATIONSHIP_CLASS,"my_kv_n_record_class_invalid");
  var resultPromise=q.record_class===SET_CLASS?loadSetProjection(q):Promise.resolve(q.record_class===PROVIDER_CLASS?pendingProvider(q):pendingRelationship(q));
  return resultPromise.then(function(result){
    var response={schema:RESPONSE_SCHEMA,state:"QUERY_COMPLETE",materialization_id:req.materialization_id,request_hash:req.request_hash,node_id:entry.node_id,query_request_id:q.request_id,record_class:q.record_class,credential_material_present:false,provider_operation_authorized:false,request_grants_authority:false,response_grants_authority:false,authority_effect:"NONE"};
    if(q.record_class===SET_CLASS)response.projection=result;else response.result=result;
    return shaUri(response).then(function(receiptHash){return putResult({materialization_id:req.materialization_id,request_hash:req.request_hash,node_id:entry.node_id,response:response,response_receipt_hash:receiptHash}).then(function(){
      return {schema:"stegverse.device-kv.my-kv-n-resident-receipt/v1",state:"RESULT_AVAILABLE",materialization_id:req.materialization_id,request_hash:req.request_hash,node_id:entry.node_id,record_class:q.record_class,response:response,response_receipt_hash:receiptHash,local_ingress_observed:true,resident_materialization_observed:true,provider_execution_attempted:false,relationship_mutation_attempted:false,data_moved:false,replication_started:false,ai_corpus_exposed:false,credential_material_present:false,provider_operation_authorized:false,relationship_mutation_authorized:false,credential_authority:"TV/TVC",github_token_runtime_authority:"NONE",authority_effect:"NONE_RESULT_DELIVERY_ONLY"};
    });});
  });
}
function handle(trigger){return validateTrigger(trigger).then(function(v){return materialize(v.entry,v.request);});}

self.addEventListener("install",function(event){event.waitUntil(self.skipWaiting());});
self.addEventListener("activate",function(event){event.waitUntil(Promise.resolve());});
self.addEventListener("message",function(event){
  var data=event.data||{};if(data.type!=="STEGVERSE_MY_KV_N_LOCAL_TRIGGER"||!event.ports||!event.ports.length)return;
  var port=event.ports[0];event.waitUntil(handle(data.trigger).then(function(receipt){port.postMessage({ok:true,receipt:receipt});}).catch(function(e){port.postMessage({ok:false,state:"DENIED",reason:String(e&&e.message||e),authority_effect:"NONE"});}));
});
