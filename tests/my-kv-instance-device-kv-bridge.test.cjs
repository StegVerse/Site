const assert=require("assert");

function makeRoot(){
  let counter=0;
  global.crypto={getRandomValues(bytes){for(let i=0;i<bytes.length;i++) bytes[i]=(counter+++i)%256;return bytes;}};
  return require("../assets/my-kv-instance-device-kv-bridge.js");
}

const api=makeRoot();
const t=api._test;

const setReq={schema:"stegverse.site.my-kv.kv-set-status-request/v1",access:"READ_ONLY",authority_effect:"NONE"};
assert.doesNotThrow(()=>t.validateInput(t.classes.set,setReq));
assert.throws(()=>t.validateInput(t.classes.set,{...setReq,access:"WRITE"}),/FAIL_CLOSED/);

const provider={
  schema:"stegverse.site.my-kv.provider-operation-request/v1",
  kv_set_id:"personal",instance_id:"kvi_1",provider_id:"icloud",operation:"CONNECT",
  governance_state:"PENDING_INTERLOCK_INTR",credential_destination:"SKAP_VAULT",
  credential_material_present:false,provider_operation_authorized:false,
  authority_effect:"NONE_REQUEST_ONLY",activation_effect:false
};
assert.doesNotThrow(()=>t.validateInput(t.classes.provider,provider));
assert.throws(()=>t.validateInput(t.classes.provider,{...provider,provider_operation_authorized:true}),/FAIL_CLOSED/);
assert.throws(()=>t.validateInput(t.classes.provider,{...provider,credential_material_present:true}),/FAIL_CLOSED/);
assert.throws(()=>t.validateInput(t.classes.provider,{...provider,governance_state:"ALLOW"}),/FAIL_CLOSED/);

const relationship={
  schema:"stegverse.site.my-kv.relationship-transition-request/v1",
  kv_set_id:"personal",participant_instance_ids:["kvi_1","kvi_2"],
  current_tier:"NOT_CONNECTED",target_tier:"CONNECTED",
  governance_state:"PENDING_INTERLOCK_INTR",data_moved:false,replication_started:false,ai_corpus_exposed:false,
  relationship_mutation_authorized:false,authority_effect:"NONE_REQUEST_ONLY",activation_effect:false
};
assert.doesNotThrow(()=>t.validateInput(t.classes.relationship,relationship));
for(const key of ["data_moved","replication_started","ai_corpus_exposed","relationship_mutation_authorized"]){
  assert.throws(()=>t.validateInput(t.classes.relationship,{...relationship,[key]:true}),/FAIL_CLOSED/);
}

assert.strictEqual(api.bridge_kind,"DEVICE_KV_MY_KV_N_RESIDENT_TRANSPORT");
assert.strictEqual(t.classes.set,"MY_KV_INSTANCE_SET_PROJECTION");
assert.strictEqual(t.classes.provider,"MY_KV_PROVIDER_OPERATION_REQUEST");
assert.strictEqual(t.classes.relationship,"MY_KV_RELATIONSHIP_TRANSITION_REQUEST");

console.log("MY_KV_DEVICE_KV_TRANSPORT_CLIENT=PASS");
console.log("MY_KV_RESIDENT_TRIGGER_BINDING=PASS");
console.log("MY_KV_SET_PROJECTION_TRANSPORT=BOUNDED_ALREADY_ADMITTED_ONLY");
console.log("MY_KV_PROVIDER_REQUEST_EXECUTION_AUTHORITY=NONE");
console.log("MY_KV_RELATIONSHIP_REQUEST_EXECUTION_AUTHORITY=NONE");
console.log("MY_KV_RUNTIME_PROVIDER_STATE_FABRICATION=PROHIBITED");
