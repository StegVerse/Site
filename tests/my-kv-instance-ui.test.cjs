const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ui=require('../assets/my-kv-instance-ui.js');
const manager=require('../assets/my-kv-instance-manager.js');

function projection(){return {
 schema:'stegverse.kv.my-kv-set-projection/v1',kv_set_id:'personal',instance_count:2,
 instances:[1,2].map(n=>({schema:'stegverse.kv.my-kv-instance-projection/v1',instance_id:'kvi_'+n,instance_number:n,kv_set_id:'personal',private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false,management:{provider_mutation_authorized:false,relationship_mutation_authorized:false},relationship:{tier:'NOT_CONNECTED'},provider:n===1?{provider_id:'icloud',state:'OBSERVED',credential_material_included:false}:null})),
 private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false
};}
const summary=ui.summarizeProjection(projection(),manager);
assert.strictEqual(summary.instance_count,2);
assert.strictEqual(summary.instances[0].label,'KV #1');
assert.strictEqual(summary.instances[1].provider_state,'NOT_OBSERVED');
assert.strictEqual(summary.activation_effect,false);

const page=fs.readFileSync(path.join(__dirname,'..','my-kv-instances.html'),'utf8');
for(const required of [
 'assets/stegverse-node-continuity.js','assets/generated/site-browser-intr-connectors.js','assets/hb-intr-carrier.js',
 'assets/my-kv-instance-manager.js','assets/my-kv-instance-device-kv-bridge.js','assets/my-kv-instance-ui.js',
 'No authentic admitted KV-set projection is available','KV #2 is not being inferred or created','PENDING_INTERLOCK_INTR',
 'Provider execution authorized=false','data_moved=false','replication_started=false','ai_corpus_exposed=false'
]) assert(page.includes(required),`missing UI boundary marker: ${required}`);
assert(!page.includes('provider_operation_authorized=true'));
assert(!page.includes('data_moved=true'));
assert(!page.includes('replication_started=true'));
assert(!page.includes('ai_corpus_exposed=true'));
console.log('MY_KV_MULTI_INSTANCE_UI=PASS');
console.log('MY_KV_UI_AUTHENTIC_PROJECTION_ONLY=PASS');
console.log('MY_KV_UI_PROVIDER_EXECUTION_AUTHORITY=NONE');
console.log('MY_KV_UI_RELATIONSHIP_EXECUTION_AUTHORITY=NONE');
