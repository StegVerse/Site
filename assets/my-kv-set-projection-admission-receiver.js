"use strict";

/* Dedicated resident DEVICE_KV writer for the bounded MyKV set projection only.
 * It accepts a registered-Node outbox trigger, validates exact payload/path/schema
 * boundaries, writes only _System/my-kv-set-projection.json, and proves exact readback.
 */
var TRIGGER_SCHEMA="stegos.node_intr_materialization_trigger.v1";
var OUTBOX_SCHEMA="stegos.node_intr_outbox_entry.v1";
var MATERIALIZATION_SCHEMA="stegverse.universal-intr-materialization-request/v1";
var ADMISSION_CLASS="MY_KV_INSTANCE_SET_PROJECTION_ADMISSION";
var SET_SCHEMA="stegverse.kv.my-kv-set-projection/v1";
var INSTANCE_SCHEMA="stegverse.kv.my-kv-instance-projection/v1";
var RESPONSE_SCHEMA="stegverse.device-kv.my-kv-set-projection-admission-response/v1";
var RECEIPT_SCHEMA="stegverse.device-kv.my-kv-set-projection-admission-receipt/v1";
var SET_PATH="_System/my-kv-set-projection.json";
var KV_DB="stegverse-device-local-intr-v1";
var KV_DB_VERSION=1;
var KV_FILES="kv_files";
var DEVICE_KV_DEST='{"boundary":"KV","subsystem":"KnowledgeVault:Interlock"}';
var DEVICE_KV_OWNER="StegVerse-Labs/continuity-vault-kit#79";

function requireValue(ok,message){if(!ok)throw new Error(message);}
function canon(v){
  if(v===null||typeof v!=="object")return JSON.stringify(v);
  if(Array.isArray(v))return "["+v.map(canon).join(",")+"]";
  return "{"+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+":"+canon(v[k]);}).join(",")+"}";
}
function bytesToHex(bytes){return Array.prototype.map.call(new Uint8Array(bytes),function(x){return x.toString(16).padStart(2,"0");}).join("");}
function shaUriBytes(bytes){return crypto.subtle.digest("SHA-256",bytes).then(function(d){return "sha256:"+bytesToHex(d);});}
function shaUri(value){return shaUriBytes(new TextEncoder().encode(canon(value)));}
function base64ToBytes(v){var raw=atob(v),out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
function openDb(){return new Promise(function(resolve,reject){
  var r=indexedDB.open(KV_DB,KV_DB_VERSION);
  r.onupgradeneeded=function(){var db=r.result;if(!db.objectStoreNames.contains(KV_FILES))db.createObjectStore(KV_FILES,{keyPath:"key"});};
  r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error("device_kv_db_open_failed"));};
});}
function getKvRow(key){return openDb().then(function(db){return new Promise(function(resolve,reject){
  if(!db.objectStoreNames.contains(KV_FILES)){db.close();reject(new Error("canonical_kv_store_unavailable"));return;}
  var tx=db.transaction(KV_FILES,"readonly"),r=tx.objectStore(KV_FILES).get(key);r.onsuccess=function(){resolve(r.result||null);};r.onerror=function(){reject(r.error);};tx.oncomplete=function(){db.close();};
});});}
function putKvRow(row){return openDb().then(function(db){return new Promise(function(resolve,reject){
  var tx=db.transaction(KV_FILES,"readwrite");tx.objectStore(KV_FILES).put(row);tx.oncomplete=function(){db.close();resolve(row);};tx.onerror=function(){db.close();reject(tx.error||new Error("projection_store_failed"));};tx.onabort=function(){db.close();reject(tx.error||new Error("projection_store_aborted"));};
});});}
function rejectSensitive(value,path){
  path=path||"projection";
  if(Array.isArray(value)){value.forEach(function(v,i){rejectSensitive(v,path+"["+i+"]");});return;}
  if(!value||typeof value!=="object")return;
  Object.keys(value).forEach(function(key){
    var lower=String(key).toLowerCase(),child=value[key];
    if(lower==="credential_material_included"||lower==="credential_material_present"){requireValue(child===false,"credential_sentinel_invalid:"+path+"."+key);return;}
    var forbidden=["password","secret","token","access_token","refresh_token","private_key","credential_material","skap_credential_ref","interlock_receipt_ref","intr_receipt_ref"];
    requireValue(!forbidden.some(function(part){return lower===part||lower.indexOf(part)>=0;}),"sensitive_projection_field_forbidden:"+path+"."+key);
    rejectSensitive(child,path+"."+key);
  });
}
function validateProjection(p,setId){
  requireValue(p&&p.schema===SET_SCHEMA,"projection_schema_invalid");
  requireValue(typeof p.kv_set_id==="string"&&p.kv_set_id&&p.kv_set_id===setId,"projection_set_binding_invalid");
  requireValue(Array.isArray(p.instances)&&p.instances.length>=1&&p.instance_count===p.instances.length,"projection_instances_invalid");
  requireValue(p.private_content_included===false&&p.credential_material_included===false,"projection_content_boundary_invalid");
  requireValue(p.authority_effect==="NONE_STATUS_ONLY"&&p.activation_effect===false,"projection_authority_boundary_invalid");
  var ids={},numbers={};
  p.instances.forEach(function(instance){
    requireValue(instance&&instance.schema===INSTANCE_SCHEMA,"instance_schema_invalid");
    requireValue(typeof instance.instance_id==="string"&&instance.instance_id.indexOf("kvi_")===0,"instance_id_invalid");
    requireValue(Number.isInteger(instance.instance_number)&&instance.instance_number>=1,"instance_number_invalid");
    requireValue(instance.kv_set_id===setId,"instance_set_binding_invalid");
    requireValue(!ids[instance.instance_id]&&!numbers[instance.instance_number],"duplicate_instance_identity");ids[instance.instance_id]=true;numbers[instance.instance_number]=true;
    requireValue(instance.private_content_included===false&&instance.credential_material_included===false,"instance_content_boundary_invalid");
    requireValue(instance.authority_effect==="NONE_STATUS_ONLY"&&instance.activation_effect===false,"instance_authority_boundary_invalid");
    requireValue(instance.management&&instance.management.provider_mutation_authorized===false&&instance.management.relationship_mutation_authorized===false,"instance_mutation_authority_invalid");
    requireValue(instance.providers&&instance.providers.provider_mutation_authorized===false&&instance.providers.credential_material_included===false,"provider_projection_boundary_invalid");
    requireValue(instance.providers.items&&typeof instance.providers.items==="object"&&!Array.isArray(instance.providers.items)&&Array.isArray(instance.providers.pending_requests),"provider_projection_shape_invalid");
    requireValue(instance.provider===undefined,"singular_provider_projection_forbidden");
  });
  rejectSensitive(p,"projection");return JSON.parse(JSON.stringify(p));
}
function validateTrigger(payload){
  requireValue(payload&&payload.schema===TRIGGER_SCHEMA,"node_trigger_schema_invalid");
  requireValue(payload.transport_origin==="STEGOS_NODE_OUTBOX"&&payload.request_grants_execution_authority===false&&payload.claim_or_fence_minted===false&&payload.authority_effect==="NONE_TRIGGER_ONLY","node_trigger_boundary_invalid");
  var entry=payload.node_outbox_entry;
  requireValue(entry&&entry.schema===OUTBOX_SCHEMA&&entry.state==="LOCAL_OUTBOX_PENDING_NETWORK_DELIVERY","node_outbox_invalid");
  requireValue(entry.credential_authority==="TV/TVC"&&entry.github_token_runtime_authority==="NONE"&&entry.request_grants_execution_authority===false&&entry.claim_or_fence_minted===false,"node_outbox_authority_invalid");
  var eb=Object.assign({},entry),eh=eb.outbox_entry_hash;delete eb.outbox_entry_hash;
  return shaUri(eb).then(function(actual){
    requireValue(actual===eh,"node_outbox_hash_mismatch");
    requireValue(payload.node_id===entry.node_id&&payload.interlock_id===entry.interlock_id&&payload.outbox_entry_hash===eh,"node_trigger_binding_mismatch");
    var tb=Object.assign({},payload),th=tb.trigger_sha256;delete tb.trigger_sha256;
    return shaUri(tb).then(function(ta){
      requireValue(ta===th,"node_trigger_hash_mismatch");
      var req=entry.materialization_request;
      requireValue(req&&req.schema===MATERIALIZATION_SCHEMA&&req.state==="QUEUED_FOR_EVENT_EPHEMERAL_MATERIALIZATION","materialization_request_invalid");
      requireValue(JSON.stringify(req.destination)===DEVICE_KV_DEST&&req.downstream_owner_ref===DEVICE_KV_OWNER,"materialization_destination_invalid");
      requireValue(req.request_grants_execution_authority===false&&req.transport_grants_execution_authority===false&&req.claim_or_fence_minted===false&&req.credential_authority==="TV/TVC"&&req.github_token_runtime_authority==="NONE","materialization_authority_invalid");
      var rb=Object.assign({},req),rh=rb.request_hash;delete rb.request_hash;
      return shaUri(rb).then(function(ra){requireValue(ra===rh,"materialization_request_hash_mismatch");return {entry:entry,request:req};});
    });
  });
}
function decodeCandidate(q){
  requireValue(q&&q.schema_version==="kv.interlock.request.v1"&&q.operation==="COMMIT_CANDIDATE","projection_admission_request_invalid");
  requireValue(q.record_class===ADMISSION_CLASS,"projection_admission_record_class_invalid");
  requireValue(q.authority_ref&&q.credential_material_present===false&&q.provider_operation_authorized===false&&q.relationship_mutation_authorized===false&&q.request_grants_authority===false&&q.authority_effect==="NONE_REQUEST_ONLY"&&q.activation_effect===false,"projection_admission_envelope_authority_invalid");
  var c=q.candidate_writeback;
  requireValue(c&&c.candidate_type==="MY_KV_SET_PROJECTION_REPLACE"&&c.requested_destination===SET_PATH,"projection_admission_destination_invalid");
  requireValue(typeof c.payload_ref==="string"&&c.payload_ref.indexOf("data:application/json;base64,")===0,"projection_payload_ref_invalid");
  requireValue(/^sha256:[0-9a-f]{64}$/.test(String(c.payload_sha256||"")),"projection_payload_hash_invalid");
  var bytes=base64ToBytes(c.payload_ref.slice("data:application/json;base64,".length));
  requireValue(c.payload_size_bytes===bytes.length,"projection_payload_size_mismatch");
  return shaUriBytes(bytes).then(function(actual){
    requireValue(actual===c.payload_sha256,"projection_payload_sha256_mismatch");
    var parsed;try{parsed=JSON.parse(new TextDecoder().decode(bytes));}catch(_){throw new Error("projection_payload_json_invalid");}
    return {bytes:bytes,payload_sha256:actual,projection:validateProjection(parsed,q.kv_set_id)};
  });
}
function materialize(entry,req){
  var q=req.kv_request;
  requireValue(q&&q.authority_ref==="stegos-node://"+entry.node_id,"projection_admission_node_binding_invalid");
  return decodeCandidate(q).then(function(candidate){
    var row={
      key:SET_PATH,directory_id:"MY_KV_INSTANCE_SET",canonical_path:"_System",name:"my-kv-set-projection.json",media_type:"application/json",
      size_bytes:candidate.bytes.length,sha256:candidate.payload_sha256,content_base64:q.candidate_writeback.payload_ref.slice("data:application/json;base64,".length),
      admitted_at:new Date().toISOString(),credential_material_present:false,provider_operation_authorized:false,relationship_mutation_authorized:false,authority_effect:"NONE"
    };
    return putKvRow(row).then(function(){return getKvRow(SET_PATH);}).then(function(readback){
      requireValue(readback&&readback.key===SET_PATH&&readback.sha256===candidate.payload_sha256&&readback.size_bytes===candidate.bytes.length&&readback.content_base64===row.content_base64,"projection_exact_readback_failed");
      var response={schema:RESPONSE_SCHEMA,state:"PROJECTION_ADMITTED",materialization_id:req.materialization_id,request_hash:req.request_hash,node_id:entry.node_id,request_id:q.request_id,record_class:ADMISSION_CLASS,canonical_path:SET_PATH,kv_set_id:candidate.projection.kv_set_id,instance_count:candidate.projection.instance_count,projection_sha256:candidate.payload_sha256,size_bytes:candidate.bytes.length,exact_readback_verified:true,private_content_included:false,credential_material_included:false,credential_material_present:false,provider_operation_authorized:false,relationship_mutation_authorized:false,request_grants_authority:false,response_grants_authority:false,authority_effect:"NONE",activation_effect:false};
      return shaUri(response).then(function(receiptHash){
        return {schema:RECEIPT_SCHEMA,state:"RESULT_AVAILABLE",materialization_id:req.materialization_id,request_hash:req.request_hash,node_id:entry.node_id,record_class:ADMISSION_CLASS,response:response,response_receipt_hash:receiptHash,local_ingress_observed:true,resident_materialization_observed:true,provider_execution_attempted:false,relationship_mutation_attempted:false,data_moved:false,replication_started:false,ai_corpus_exposed:false,credential_material_present:false,provider_operation_authorized:false,relationship_mutation_authorized:false,credential_authority:"TV/TVC",github_token_runtime_authority:"NONE",authority_effect:"NONE_RESULT_DELIVERY_ONLY"};
      });
    });
  });
}
function handle(trigger){return validateTrigger(trigger).then(function(v){return materialize(v.entry,v.request);});}

self.addEventListener("install",function(event){event.waitUntil(self.skipWaiting());});
self.addEventListener("activate",function(event){event.waitUntil(Promise.resolve());});
self.addEventListener("message",function(event){
  var data=event.data||{};if(data.type!=="STEGVERSE_MY_KV_SET_PROJECTION_ADMISSION_TRIGGER"||!event.ports||!event.ports.length)return;
  var port=event.ports[0];event.waitUntil(handle(data.trigger).then(function(receipt){port.postMessage({ok:true,receipt:receipt});}).catch(function(e){port.postMessage({ok:false,state:"DENIED",reason:String(e&&e.message||e),authority_effect:"NONE"});}));
});
