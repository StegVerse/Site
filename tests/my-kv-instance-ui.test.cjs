const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ui=require('../assets/my-kv-instance-ui.js');
const manager=require('../assets/my-kv-instance-manager.js');

function providerProjection(n){
 const items=n===1?{
  'google-drive':{connection_state:'CONNECTED',verified:true,last_request_id:'kvprov_1',last_operation:'VERIFY',last_result_ref:'result:1'},
  'icloud-drive':{connection_state:'NOT_CONNECTED',verified:false,last_request_id:null,last_operation:null,last_result_ref:null}
 }:{};
 return {items,pending_requests:n===1?[{request_id:'kvprov_pending',provider_id:'icloud-drive',operation:'CONNECT'}]:[],provider_mutation_authorized:false,credential_material_included:false};
}
function projection(){return {
 schema:'stegverse.kv.my-kv-set-projection/v1',kv_set_id:'personal',instance_count:2,
 instances:[1,2].map(n=>({
  schema:'stegverse.kv.my-kv-instance-projection/v1',instance_id:'kvi_'+n,instance_number:n,logical_name:'KV #'+n,kv_set_id:'personal',
  storage:{medium:n===1?'google-drive':'icloud-drive',locator:null,provider_authority_effect:'NONE'},
  private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false,
  management:{provider_mutation_authorized:false,relationship_mutation_authorized:false},
  relationship:{tier:'NOT_CONNECTED',governance_state:'NOT_CONNECTED',pending_request_ids:[]},
  providers:providerProjection(n)
 })),
 private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false
};}
const summary=ui.summarizeProjection(projection(),manager);
assert.strictEqual(summary.instance_count,2);
assert.strictEqual(summary.instances[0].label,'KV #1');
assert.strictEqual(summary.instances[0].storage_medium,'google-drive');
assert.strictEqual(summary.instances[0].provider_count,2);
assert.strictEqual(summary.instances[0].providers[0].provider_id,'google-drive');
assert.strictEqual(summary.instances[0].providers[0].connection_state,'CONNECTED');
assert.strictEqual(summary.instances[0].providers[0].verified,true);
assert.strictEqual(summary.instances[0].pending_provider_requests[0].provider_id,'icloud-drive');
assert.strictEqual(summary.instances[1].provider_count,0);
assert.strictEqual(summary.instances[1].providers.length,0);
assert.strictEqual(summary.activation_effect,false);
assert.throws(()=>ui.summarizeProjection({...projection(),instances:projection().instances.map((x,i)=>i===0?{...x,providers:{...x.providers,provider_mutation_authorized:true}}:x)},manager),/FAIL_CLOSED/);
assert.throws(()=>ui.summarizeProjection({...projection(),instances:projection().instances.map((x,i)=>i===0?{...x,providers:{...x.providers,credential_material_included:true}}:x)},manager),/FAIL_CLOSED/);

const page=fs.readFileSync(path.join(__dirname,'..','my-kv-instances.html'),'utf8');
for(const required of [
 'assets/stegverse-node-continuity.js','assets/generated/site-browser-intr-connectors.js','assets/hb-intr-carrier.js',
 'assets/my-kv-instance-manager.js','assets/my-kv-instance-device-kv-bridge.js','assets/my-kv-instance-ui.js',
 'No authentic admitted KV-set projection is available','KV #2 is not being inferred or created','PENDING_INTERLOCK_INTR',
 'Provider execution authorized=false','data_moved=false','replication_started=false','ai_corpus_exposed=false',
 'Provider status:','Pending provider requests:'
]) assert(page.includes(required),`missing UI boundary marker: ${required}`);
assert(!page.includes('provider_operation_authorized=true'));
assert(!page.includes('data_moved=true'));
assert(!page.includes('replication_started=true'));
assert(!page.includes('ai_corpus_exposed=true'));
console.log('MY_KV_MULTI_INSTANCE_UI=PASS');
console.log('MY_KV_UI_CANONICAL_PLURAL_PROVIDERS=PASS');
console.log('MY_KV_UI_AUTHENTIC_PROJECTION_ONLY=PASS');
console.log('MY_KV_UI_PROVIDER_EXECUTION_AUTHORITY=NONE');
console.log('MY_KV_UI_RELATIONSHIP_EXECUTION_AUTHORITY=NONE');
