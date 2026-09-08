const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const manager=require('../assets/my-kv-instance-manager.js');
const admission=require('../assets/my-kv-set-projection-admission-bridge.js');

function projection(){return {
  schema:'stegverse.kv.my-kv-set-projection/v1',
  kv_set_id:'personal',
  instances:[{
    schema:'stegverse.kv.my-kv-instance-projection/v1',
    instance_id:'kvi_test0001',instance_number:1,logical_name:'KV #1',kv_set_id:'personal',
    storage:{medium:'google-drive',locator:'drive-folder:test',provider_authority_effect:'NONE'},
    relationship:{tier:'NOT_CONNECTED',governance_state:'NOT_CONNECTED',last_admitted_request_id:null,pending_request_ids:[]},
    providers:{items:{},pending_requests:[],provider_mutation_authorized:false,credential_material_included:false},
    management:{request_connect_supported:true,request_disconnect_supported:true,request_verify_supported:true,request_read_supported:true,request_write_supported:true,request_sync_supported:true,request_tier_change_supported:true,provider_mutation_authorized:false,relationship_mutation_authorized:false},
    private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false
  }],
  instance_count:1,private_content_included:false,credential_material_included:false,authority_effect:'NONE_STATUS_ONLY',activation_effect:false
};}

(async()=>{
  const p=projection();
  assert.equal(admission._test.validateProjection(p,manager).instance_count,1);
  const raw=Buffer.from(JSON.stringify(p,null,2)+'\n');
  const built=await admission._test.buildEnvelope('node-test',new Uint8Array(raw),p,manager);
  assert.equal(built.query.operation,'COMMIT_CANDIDATE');
  assert.equal(built.query.record_class,'MY_KV_INSTANCE_SET_PROJECTION_ADMISSION');
  assert.equal(built.query.candidate_writeback.requested_destination,'_System/my-kv-set-projection.json');
  assert.equal(built.query.candidate_writeback.candidate_type,'MY_KV_SET_PROJECTION_REPLACE');
  assert.equal(built.query.candidate_writeback.payload_size_bytes,raw.length);
  assert.equal(built.query.candidate_writeback.payload_sha256,'sha256:'+crypto.createHash('sha256').update(raw).digest('hex'));
  assert.equal(built.query.credential_material_present,false);
  assert.equal(built.query.provider_operation_authorized,false);
  assert.equal(built.query.relationship_mutation_authorized,false);
  assert.equal(built.query.request_grants_authority,false);
  assert.equal(built.query.activation_effect,false);

  const bad=projection();bad.instances[0].management.provider_mutation_authorized=true;
  assert.throws(()=>admission._test.validateProjection(bad,manager),/FAIL_CLOSED/);

  const page=fs.readFileSync(path.join(__dirname,'..','my-kv-instances.html'),'utf8');
  const receiver=fs.readFileSync(path.join(__dirname,'..','assets','my-kv-set-projection-admission-receiver.js'),'utf8');
  for(const marker of [
    'assets/my-kv-set-projection-admission-bridge.js',
    'Select KV-set projection from Files',
    'exact resident readback',
    '_System/my-kv-set-projection.json',
    'No provider or relationship authority was granted'
  ])assert(page.includes(marker),'missing page marker '+marker);
  for(const marker of [
    'MY_KV_INSTANCE_SET_PROJECTION_ADMISSION',
    'MY_KV_SET_PROJECTION_REPLACE',
    '_System/my-kv-set-projection.json',
    'projection_payload_sha256_mismatch',
    'projection_exact_readback_failed',
    'exact_readback_verified:true',
    'provider_execution_attempted:false',
    'relationship_mutation_attempted:false',
    'data_moved:false',
    'replication_started:false',
    'ai_corpus_exposed:false',
    'credential_material_present:false',
    'provider_operation_authorized:false',
    'relationship_mutation_authorized:false',
    'github_token_runtime_authority:"NONE"',
    'NONE_RESULT_DELIVERY_ONLY'
  ])assert(receiver.includes(marker),'missing receiver marker '+marker);
  for(const forbidden of ['provider_execution_attempted:true','relationship_mutation_attempted:true','data_moved:true','replication_started:true','ai_corpus_exposed:true','provider_operation_authorized:true','relationship_mutation_authorized:true']){
    assert(!receiver.includes(forbidden),'forbidden receiver marker '+forbidden);
  }
  console.log('MY_KV_SET_PROJECTION_ADMISSION=PASS');
  console.log('MY_KV_SET_PROJECTION_EXACT_READBACK_CONTRACT=PASS');
  console.log('MY_KV_SET_PROJECTION_ADMISSION_AUTHORITY=NONE');
})().catch(err=>{console.error(err);process.exit(1);});
