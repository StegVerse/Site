(function(root){
"use strict";
if(!root) return;

var PURPOSE="CURRENT_IPHONE_TESTFLIGHT_SIGNING";
var INSTALLATION_CLASS="MY_KV_INSTALLATION_STATUS";
var RESULT_REQUEST_SCHEMA="stegverse.device-kv.query-result-request/v1";
var RESULT_SCHEMA="stegverse.device-kv.query-result-delivery/v1";
var INGRESS_SCHEMA="stegverse.device-kv-intr-materialization-ingress/v1";
var INSTALLATION_SCHEMA="stegverse.kv.installation-status-projection/v1";
var ENTRY_SCHEMA="stegverse.kv.entry-transition-admission/v1";
var CAPABILITY_SCHEMA="stegverse.kv.browser-capability-observation/v1";
var OUTPUT_SCHEMA="stegos.kv-bound-ephemeral-projection-context/v1";

function requireValue(ok,message){if(!ok) throw new Error("FAIL_CLOSED: "+message);}
function delay(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
function bytesToHex(bytes){return Array.prototype.map.call(new Uint8Array(bytes),function(x){return x.toString(16).padStart(2,"0");}).join("");}
function sha256Uri(value){
  var intr=root.StegVerseGeneratedInTr;
  requireValue(intr&&typeof intr.canonical==="function","canonical InTr serializer unavailable");
  var bytes=new TextEncoder().encode(intr.canonical(value));
  return crypto.subtle.digest("SHA-256",bytes).then(function(digest){return "sha256:"+bytesToHex(digest);});
}
function randomId(){
  var bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
  return "KV-TESTFLIGHT-ENTRY-"+bytesToHex(bytes);
}
function buildQuery(nodeId){
  return {
    schema_version:"kv.interlock.request.v1",
    operation:"REQUEST",
    request_id:randomId(),
    requester:{module:"Site",component:"KVTestFlightProjectionEntry"},
    purpose:PURPOSE,
    record_class:INSTALLATION_CLASS,
    requested_scope:["installation_status","purpose_bound_entry_admission"],
    minimum_necessary_justification:"Confirm the existing resident KV continuity boundary before materializing the exact current-iPhone TestFlight signing projection.",
    authority_ref:"stegos-node://"+nodeId,
    disclosure_mode:"BOUNDED_CONTEXT",
    selector:{receipt_path:"_System/installation.receipt.json"}
  };
}
function postResult(target,lookup){
  var intr=root.StegVerseGeneratedInTr,text=intr.canonical(lookup),bytes=new TextEncoder().encode(text);
  return crypto.subtle.digest("SHA-256",bytes).then(function(digest){
    return fetch(target.result_url,{method:"POST",mode:"cors",cache:"no-store",credentials:"omit",headers:{
      "Content-Type":"application/json","X-StegVerse-Transport":"InTr","X-StegVerse-Transport-Origin":"STEGOS_NODE_OUTBOX","X-StegVerse-Payload-SHA256":bytesToHex(digest)
    },body:text});
  }).then(function(response){return response.json().catch(function(){return null;}).then(function(body){return {status:response.status,body:body};});});
}
function pollResult(target,lookup,attempt){
  return postResult(target,lookup).then(function(result){
    if(result.status===200) return result.body;
    var reason=result.body&&result.body.reason;
    if(result.status===400&&reason==="device_kv_result_not_ready"&&attempt<20) return delay(250).then(function(){return pollResult(target,lookup,attempt+1);});
    throw new Error("FAIL_CLOSED: DEVICE_KV TestFlight entry result unavailable"+(reason?": "+reason:""));
  });
}
function validateIngress(delivery,materialization,nodeId,query){
  requireValue(delivery&&delivery.schema==="stegos.node_intr_delivery_receipt.v1","DEVICE_KV delivery receipt invalid");
  requireValue(delivery.materialization_id===materialization.materialization_id&&delivery.node_id===nodeId,"DEVICE_KV delivery binding mismatch");
  requireValue(delivery.credential_authority==="TV/TVC"&&delivery.authority_effect==="NONE_OBSERVATION_ONLY","DEVICE_KV delivery authority invalid");
  var receipt=delivery.ingress_receipt;
  requireValue(receipt&&receipt.schema===INGRESS_SCHEMA&&receipt.state==="INGRESS_ADMITTED","canonical Device-KV InTr admission missing");
  requireValue(receipt.materialization_id===materialization.materialization_id&&receipt.request_hash===materialization.request_hash,"InTr receipt request binding mismatch");
  requireValue(receipt.node_id===nodeId&&receipt.interlock_id&&receipt.outbox_entry_hash,"InTr Node/Interlock/outbox binding missing");
  requireValue(receipt.exact_request_validated===true&&receipt.write_once_persisted===true,"InTr exact admission persistence missing");
  requireValue(receipt.runtime_execution_attempted===false&&receipt.consumer_dispatch_attempted===false&&receipt.claim_or_fence_minted===false,"InTr admission overclaimed execution");
  requireValue(receipt.credential_authority==="TV/TVC"&&receipt.github_token_runtime_authority==="NONE"&&receipt.authority_effect==="NONE_INGRESS_ONLY","InTr admission authority invalid");
  requireValue(materialization.kv_request&&materialization.kv_request.request_id===query.request_id&&materialization.kv_request.purpose===PURPOSE,"purpose-bound KV request drift");
  requireValue(typeof delivery.ingress_receipt_sha256==="string"&&/^sha256:[0-9a-f]{64}$/.test(delivery.ingress_receipt_sha256),"InTr receipt digest invalid");
  return delivery.ingress_receipt_sha256;
}
function validateResult(result,materialization,nodeId,query){
  requireValue(result&&result.schema===RESULT_SCHEMA&&result.state==="RESULT_AVAILABLE","DEVICE_KV result invalid");
  requireValue(result.materialization_id===materialization.materialization_id&&result.request_hash===materialization.request_hash&&result.node_id===nodeId,"DEVICE_KV result binding mismatch");
  requireValue(result.credential_authority==="TV/TVC"&&result.github_token_runtime_authority==="NONE"&&result.authority_effect==="NONE_RESULT_DELIVERY_ONLY","DEVICE_KV result authority invalid");
  requireValue(result.response_transported_on_hb_derived_carrier===true&&result.exact_response_packet_recovered===true,"DEVICE_KV exact response recovery missing");
  var response=result.response;
  requireValue(response&&response.schema==="stegverse.device-kv.query-response/v1"&&response.state==="QUERY_COMPLETE","DEVICE_KV query response invalid");
  requireValue(response.query_request_id===query.request_id&&response.record_class===INSTALLATION_CLASS,"DEVICE_KV purpose request response drift");
  requireValue(response.receipt_path==="_System/installation.receipt.json","KV installation selector drift");
  var projection=response.projection;
  requireValue(projection&&projection.schema===INSTALLATION_SCHEMA&&projection.state==="KV_INSTALLATION_VERIFIED","resident KV installation not verified");
  requireValue(projection.resident_kv_root_observed===true&&projection.installation_receipt_present===true&&projection.full_template_parity==="VALIDATED","resident KV continuity proof incomplete");
  requireValue(typeof projection.receipt_sha256==="string"&&/^sha256:[0-9a-f]{64}$/.test(projection.receipt_sha256),"KV installation receipt commitment invalid");
  requireValue(projection.credential_material_present===false&&projection.provider_operation_authorized===false&&projection.authority_effect==="NONE","KV installation projection authority invalid");
  return projection;
}
function observeCapabilities(){
  var observation={
    schema:"stegverse.browser-capability-raw-observation/v1",
    purpose:PURPOSE,
    secure_context:root.isSecureContext===true,
    webassembly:typeof root.WebAssembly==="object"&&typeof root.WebAssembly.instantiate==="function",
    subtle_crypto:!!(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function"),
    file_api:typeof root.File==="function"&&typeof root.Blob==="function",
    fetch_api:typeof root.fetch==="function",
    text_codec:typeof root.TextEncoder==="function"&&typeof root.TextDecoder==="function",
    browser_identity_collected:false,
    user_agent_collected:false,
    device_fingerprint_collected:false,
    authority_effect:"NONE_OBSERVATION_ONLY"
  };
  var compatible=observation.secure_context&&observation.webassembly&&observation.subtle_crypto&&observation.file_api&&observation.fetch_api&&observation.text_codec;
  requireValue(compatible,"required current-iPhone browser capabilities not observed");
  return sha256Uri(observation).then(function(commitment){return {observation:observation,commitment:commitment};});
}
function buildProjection(ingressCommitment,installation,capability){
  var lineage="kv-installation:"+installation.receipt_sha256;
  var entry={schema:ENTRY_SCHEMA,purpose:PURPOSE,state:"ADMITTED",authority_effect:"NONE",continuity_boundary:"KV",kv_lineage_id:lineage,transition_commitment:ingressCommitment};
  var capabilityReceipt={schema:CAPABILITY_SCHEMA,purpose:PURPOSE,state:"OBSERVED_COMPATIBLE",authority_effect:"NONE",continuity_boundary:"KV",browser_identity_authority:false,kv_lineage_id:lineage,capability_commitment:capability.commitment};
  return sha256Uri(entry).then(function(entryReceiptCommitment){
    var admissionBasis={schema:ENTRY_SCHEMA,purpose:PURPOSE,state:"ADMITTED",kv_lineage_id:lineage,transition_commitment:ingressCommitment,entry_receipt_commitment:entryReceiptCommitment};
    return sha256Uri(admissionBasis).then(function(admissionCommitment){
      return {
        schema:OUTPUT_SCHEMA,purpose:PURPOSE,entry_state:"ADMITTED",kv_transition_commitment:ingressCommitment,
        admission_commitment:admissionCommitment,browser_capability_state:"OBSERVED_COMPATIBLE",browser_capability_commitment:capability.commitment,
        persistence_effect:"NONE_EPHEMERAL_CONTEXT_ONLY",authority_effect:"NONE_PROJECTION_GATE_ONLY",
        evidence:{entry_receipt:entry,browser_capability_receipt:capabilityReceipt,kv_installation_receipt_sha256:installation.receipt_sha256,raw_browser_observation:capability.observation}
      };
    });
  });
}
function materialize(){
  var intr=root.StegVerseGeneratedInTr,hb=root.StegVerseHBInTrCarrier,node=root.StegVerseNodeContinuity,sync=root.StegVerseDeviceKVInTrSync;
  requireValue(intr&&typeof intr.buildIntent==="function"&&typeof intr.buildMaterializationRequest==="function"&&typeof intr.canonical==="function","canonical generated InTr unavailable");
  requireValue(hb&&typeof hb.buildBinding==="function","canonical HB-derived carrier unavailable");
  requireValue(node&&typeof node.status==="function"&&typeof node.queueIntrMaterializationRequest==="function","registered StegVerse Node unavailable");
  requireValue(sync&&typeof sync.synchronizeMaterialization==="function"&&typeof sync.loadTarget==="function"&&typeof sync.getDeliveryReceipt==="function","canonical Device-KV InTr sync unavailable");
  return node.status().then(function(state){
    requireValue(state&&state.registered===true&&state.registration&&state.registration.node_id,"registered current-device StegVerse Node required");
    var nodeId=state.registration.node_id,query=buildQuery(nodeId),bytes=new TextEncoder().encode(intr.canonical(query));
    return intr.buildIntent("device-kv",bytes,"REQUEST",query.request_id).then(function(intent){
      return hb.buildBinding(intent.packet_id,intent.payload_hash).then(function(binding){
        return intr.buildMaterializationRequest("device-kv",intent,"inline://materialization_request.kv_request",binding,{kv_request:query});
      });
    }).then(function(materialization){
      return node.queueIntrMaterializationRequest(materialization).then(function(){return sync.synchronizeMaterialization(materialization.materialization_id);}).then(function(){
        return Promise.all([sync.getDeliveryReceipt(materialization.materialization_id),sync.loadTarget(INSTALLATION_CLASS),observeCapabilities()]);
      }).then(function(values){
        var delivery=values[0],target=values[1],capability=values[2];
        var ingressCommitment=validateIngress(delivery,materialization,nodeId,query);
        requireValue(target&&target.state==="CONFORMING_SOVEREIGN_INTR_INGRESS"&&target.runtime_ingress_observed===true&&typeof target.result_url==="string","canonical Device-KV result target unavailable");
        var lookup={schema:RESULT_REQUEST_SCHEMA,materialization_id:materialization.materialization_id,request_hash:materialization.request_hash,node_id:nodeId,authority_effect:"NONE_RESULT_LOOKUP_ONLY"};
        return pollResult(target,lookup,0).then(function(result){
          var installation=validateResult(result,materialization,nodeId,query);
          return buildProjection(ingressCommitment,installation,capability);
        });
      });
    });
  });
}

root.StegVerseKVTestFlightProjectionEntry=Object.freeze({
  purpose:PURPOSE,
  materialize:materialize,
  authority_effect:"NONE_PROJECTION_ONLY"
});
})(typeof window!=="undefined"?window:self);
