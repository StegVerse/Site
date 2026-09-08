const assert=require("assert");
const api=require("../assets/my-kv-instance-manager.js");

function projection(){
  return {
    schema:"stegverse.kv.my-kv-set-projection/v1",kv_set_id:"personal",instance_count:2,
    instances:[1,2].map((n)=>({
      schema:"stegverse.kv.my-kv-instance-projection/v1",instance_id:`kvi_${n}`,instance_number:n,logical_name:`KV #${n}`,kv_set_id:"personal",
      storage:{medium:"icloud-drive",locator:`slot-${n}`,provider_authority_effect:"NONE"},
      relationship:{tier:"NOT_CONNECTED",governance_state:"NOT_CONNECTED",last_admitted_request_id:null,pending_request_ids:[]},
      provider:{provider_id:"icloud-drive",connection_state:"NOT_CONNECTED",verified:false,last_request_id:null,last_operation:null,last_result_ref:null,pending_requests:[]},
      management:{request_connect_supported:true,request_disconnect_supported:true,request_verify_supported:true,request_read_supported:true,request_write_supported:true,request_sync_supported:true,request_tier_change_supported:true,provider_mutation_authorized:false,relationship_mutation_authorized:false},
      private_content_included:false,credential_material_included:false,authority_effect:"NONE_STATUS_ONLY",activation_effect:false
    })),
    private_content_included:false,credential_material_included:false,authority_effect:"NONE_STATUS_ONLY",activation_effect:false
  };
}

(function validateProjection(){
  const p=api.validateSetProjection(projection());
  assert.strictEqual(p.instance_count,2);
  assert.deepStrictEqual(p.instances.map(x=>x.instance_number),[1,2]);
})();

(function rejectAuthority(){
  const p=projection();p.instances[0].management.provider_mutation_authorized=true;
  assert.throws(()=>api.validateSetProjection(p),/FAIL_CLOSED/);
})();

(function rejectCredentialReferenceLeak(){
  const p=projection();p.instances[0].provider.skap_credential_ref="skap://private";
  assert.throws(()=>api.validateSetProjection(p),/sensitive MyKV projection field/);
})();

(async function unavailableBridge(){
  const r=await api.loadKVSet(null);assert.strictEqual(r.state,"BRIDGE_UNAVAILABLE");assert.strictEqual(r.projection,null);
})();

(async function providerRequestStaysPending(){
  const bridge={requestProviderOperation(req){
    assert.strictEqual(req.credential_destination,"SKAP_VAULT");
    assert.strictEqual(req.provider_operation_authorized,false);
    return {...req,request_id:"kvprov_test"};
  }};
  const r=await api.requestProviderOperation(projection(),"kvi_1","icloud-drive","CONNECT",bridge);
  assert.strictEqual(r.governance_state,"PENDING_INTERLOCK_INTR");
})();

(async function relationshipRequestStaysPending(){
  const bridge={requestRelationshipTransition(req){return {...req,request_id:"kvrel_test"};}};
  const r=await api.requestRelationshipTransition(projection(),["kvi_2","kvi_1"],"CONNECTED",bridge);
  assert.deepStrictEqual(r.participant_instance_ids,["kvi_1","kvi_2"]);
  assert.strictEqual(r.data_moved,false);assert.strictEqual(r.replication_started,false);assert.strictEqual(r.ai_corpus_exposed,false);
})();

(async function directProviderMutationUnavailableFails(){
  await assert.rejects(()=>api.requestProviderOperation(projection(),"kvi_1","icloud-drive","CONNECT",null),/governed provider-operation bridge unavailable/);
})();

console.log("My KV instance manager tests: PASS");
