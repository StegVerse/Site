(function(root,factory){
  "use strict";
  var api=factory(root);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.StegVerseMyKVSKAPAccountTransfer=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var PROFILE_ID="kv-skap-account-metadata";
  var OPERATION="SKAP_ACCOUNT_METADATA_ADMIT";
  var PACKET_SCHEMA="stegverse.kv-skap.account-metadata-transfer/v1";
  var ENVELOPE_SCHEMA="stegverse.intr.boundary-transfer/v1";
  var RECEIPT_SCHEMA="stegverse.skap.account-metadata-receipt/v1";
  var FORBIDDEN=["password","secret","token","private_key","access_key","refresh_token","client_secret","authorization","cookie","session_key","account_id","provider_account_id","raw_provider_account_identifier"];

  function normalize(v){
    if(Array.isArray(v))return v.map(normalize);
    if(v&&typeof v==="object"){
      var out={};Object.keys(v).sort().forEach(function(k){out[k]=normalize(v[k]);});return out;
    }
    return v;
  }
  function canonical(v){return JSON.stringify(normalize(v));}
  function bytesToHex(bytes){return Array.prototype.map.call(new Uint8Array(bytes),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function sha256Text(text){
    if(root&&root.crypto&&root.crypto.subtle){
      return root.crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)).then(function(d){return "sha256:"+bytesToHex(d);});
    }
    if(typeof require==="function"){
      var crypto=require("crypto");return Promise.resolve("sha256:"+crypto.createHash("sha256").update(text,"utf8").digest("hex"));
    }
    return Promise.reject(new Error("FAIL_CLOSED: SHA-256 unavailable"));
  }
  function sha256Value(v){return sha256Text(canonical(v));}
  function assertNoSecretFields(value,path){
    path=path||"value";
    if(Array.isArray(value)){value.forEach(function(v,i){assertNoSecretFields(v,path+"["+i+"]");});return;}
    if(!value||typeof value!=="object")return;
    Object.keys(value).forEach(function(key){
      var lower=key.toLowerCase();
      var safeNegative=(lower==="raw_provider_account_identifier_present"||lower==="contains_secret_material")&&value[key]===false;
      if(!safeNegative&&FORBIDDEN.some(function(p){return lower.indexOf(p)!==-1;}))throw new Error("FAIL_CLOSED: secret or raw provider identifier prohibited at "+path+"."+key);
      assertNoSecretFields(value[key],path+"."+key);
    });
  }
  function validateInput(input){
    if(!input||typeof input!=="object")throw new Error("FAIL_CLOSED: account transfer input required");
    assertNoSecretFields(input,"input");
    var provider=String(input.provider_org_ref||"");
    if(!/^org:[-a-z0-9._]+$/.test(provider))throw new Error("FAIL_CLOSED: provider_org_ref invalid");
    if(["social","financial","identity","email","cloud","other"].indexOf(String(input.account_class||""))===-1)throw new Error("FAIL_CLOSED: account_class invalid");
    if(["ACTIVE","INACTIVE","CLOSED","UNKNOWN"].indexOf(String(input.account_status||""))===-1)throw new Error("FAIL_CLOSED: account_status invalid");
    if(!/^sha256:[0-9a-f]{64}$/.test(String(input.source_evidence_sha256||"")))throw new Error("FAIL_CLOSED: source evidence hash invalid");
    if(!String(input.owner_selection_ref||"")||!String(input.source_evidence_ref||""))throw new Error("FAIL_CLOSED: owner selection and evidence reference required");
    return input;
  }
  function buildTransferPacket(input){
    input=validateInput(input);
    var payload={owner_selection_ref:String(input.owner_selection_ref),provider_org_ref:String(input.provider_org_ref),account_class:String(input.account_class),account_status:String(input.account_status),source_evidence_ref:String(input.source_evidence_ref),source_evidence_sha256:String(input.source_evidence_sha256)};
    return sha256Value(payload).then(function(payloadHash){
      return sha256Text(payload.owner_selection_ref+"\n"+payloadHash).then(function(idHash){
        var packet={schema:PACKET_SCHEMA,transfer_id:"kvskap_"+idHash.slice(7,31),direction:"KNOWLEDGEVAULT_TO_SKAP_VAULT",source_boundary:"KnowledgeVault",destination_boundary:"SKAP_Vault",owner_selection_ref:payload.owner_selection_ref,provider_org_ref:payload.provider_org_ref,account_class:payload.account_class,account_status:payload.account_status,source_evidence_ref:payload.source_evidence_ref,source_evidence_sha256:payload.source_evidence_sha256,payload_sha256:payloadHash,contains_secret_material:false,raw_provider_account_identifier_present:false,requested_transition:OPERATION};
        assertNoSecretFields(packet,"packet");return packet;
      });
    });
  }
  function buildKVRequest(packet,requestId,authorityRef){
    if(!packet||packet.schema!==PACKET_SCHEMA)throw new Error("FAIL_CLOSED: transfer packet invalid");
    return {schema_version:"kv.interlock.request.v1",operation:"COMMIT_CANDIDATE",request_id:String(requestId),requester:{module:"KnowledgeVault",component:"SKAPAccountMetadataTransfer"},purpose:"Transfer owner-selected non-secret account metadata from KnowledgeVault to the internal SKAP Vault boundary.",record_class:"SKAP_ACCOUNT_METADATA_TRANSFER",requested_scope:["provider_org_ref","account_class","account_status","source_evidence_ref","source_evidence_sha256"],minimum_necessary_justification:"Only provider class/status and evidence references are required to establish an internal SKAP account binding without exporting provider identifiers or secrets.",authority_ref:String(authorityRef),disclosure_mode:"SOURCE_REFERENCE_ONLY",candidate_writeback:{candidate_type:"SKAP_ACCOUNT_METADATA_TRANSFER",payload_ref:packet.payload_sha256,requested_destination:"skap://internal/account-metadata"}};
  }
  function buildBoundaryEnvelope(packet,request,intrReceiptRef){
    if(!packet||packet.schema!==PACKET_SCHEMA||!request||request.schema_version!=="kv.interlock.request.v1")return Promise.reject(new Error("FAIL_CLOSED: packet/request binding invalid"));
    if(!request.candidate_writeback||request.candidate_writeback.payload_ref!==packet.payload_sha256)return Promise.reject(new Error("FAIL_CLOSED: request packet binding mismatch"));
    return Promise.all([sha256Value(request),sha256Value(packet)]).then(function(h){return {schema:ENVELOPE_SCHEMA,direction:"KNOWLEDGEVAULT_TO_SKAP_VAULT",source_boundary:"KnowledgeVault",destination_boundary:"SKAP_Vault",request_id:request.request_id,request_sha256:h[0],transfer_id:packet.transfer_id,transfer_packet_sha256:h[1],payload_sha256:packet.payload_sha256,intr_receipt_ref:intrReceiptRef||null,canonical_state_changed:false,credential_material_transferred:false};});
  }
  function requireProfile(intr){
    if(!intr||!intr.PROFILES||!intr.PROFILES[PROFILE_ID])throw new Error("FAIL_CLOSED: canonical kv-skap-account-metadata InTr profile unavailable");
    var p=intr.PROFILES[PROFILE_ID];
    if(!Array.isArray(p.operations)||p.operations.indexOf(OPERATION)===-1)throw new Error("FAIL_CLOSED: SKAP account metadata operation unavailable");
    if(!p.source||p.source.boundary!=="KV"||!p.destination||p.destination.boundary!=="SKAP_VAULT")throw new Error("FAIL_CLOSED: KV to SKAP profile boundary mismatch");
    return p;
  }
  function buildTransportMaterialization(intr,packet,request,envelope,carrierBinding){
    requireProfile(intr);
    if(typeof intr.buildIntent!=="function"||typeof intr.buildMaterializationRequest!=="function"||typeof intr.canonical!=="function")return Promise.reject(new Error("FAIL_CLOSED: canonical generated InTr methods unavailable"));
    var bytes=new TextEncoder().encode(intr.canonical(packet));
    return Promise.resolve(intr.buildIntent(PROFILE_ID,bytes,OPERATION,request.request_id)).then(function(intent){return intr.buildMaterializationRequest(PROFILE_ID,intent,"inline://materialization_request.account_metadata_transfer",carrierBinding||null,{account_metadata_transfer:packet,kv_interlock_request:request,intr_boundary_envelope:envelope});});
  }
  function validateSKAPReceipt(receipt,packet,envelope){
    if(!receipt||receipt.schema!==RECEIPT_SCHEMA)throw new Error("FAIL_CLOSED: SKAP account metadata receipt missing");
    if(receipt.provider_org_ref!==packet.provider_org_ref||receipt.account_class!==packet.account_class||receipt.account_status!==packet.account_status)throw new Error("FAIL_CLOSED: SKAP receipt account binding mismatch");
    if(receipt.transfer_id!==packet.transfer_id||receipt.payload_sha256!==packet.payload_sha256)throw new Error("FAIL_CLOSED: SKAP receipt transfer binding mismatch");
    if(receipt.intr_request_sha256!==envelope.request_sha256||receipt.transfer_packet_sha256!==envelope.transfer_packet_sha256)throw new Error("FAIL_CLOSED: SKAP receipt InTr binding mismatch");
    if(receipt.synthetic_material_only!==false||receipt.contains_secret_material!==false||receipt.raw_provider_account_identifier_present!==false)throw new Error("FAIL_CLOSED: SKAP receipt evidence boundary invalid");
    if(!/^skap:\/\/accounts\/[-a-z0-9._]+\/[0-9a-f]{24}$/.test(String(receipt.object_id||"")))throw new Error("FAIL_CLOSED: SKAP opaque account object invalid");
    if(!/^intr:\/\/.+/.test(String(receipt.intr_receipt_ref||"")))throw new Error("FAIL_CLOSED: admitted InTr receipt reference missing");
    if(!/^sha256:[0-9a-f]{64}$/.test(String(receipt.receipt_sha256||"")))throw new Error("FAIL_CLOSED: SKAP receipt digest invalid");
    assertNoSecretFields(receipt,"receipt");return receipt;
  }
  return Object.freeze({profileId:PROFILE_ID,operation:OPERATION,canonical:canonical,sha256Value:sha256Value,buildTransferPacket:buildTransferPacket,buildKVRequest:buildKVRequest,buildBoundaryEnvelope:buildBoundaryEnvelope,requireProfile:requireProfile,buildTransportMaterialization:buildTransportMaterialization,validateSKAPReceipt:validateSKAPReceipt});
}));
