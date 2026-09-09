const assert = require('assert');
const crypto = require('crypto').webcrypto;
global.crypto = crypto;
const api = require('../assets/stegsocials-kv-exact-content-readback.js');

function b64(text){ return Buffer.from(text, 'utf8').toString('base64'); }
async function sha(text){
  const digest = await crypto.subtle.digest('SHA-256', Buffer.from(text, 'utf8'));
  return 'sha256:' + Buffer.from(digest).toString('hex');
}

(async function(){
  const content = '{"schema":"stegverse.stegsocials.post-preparation/v1","body":"test"}';
  const expected = {
    canonical_path:'02_Research/StegSocials/Drafts/LinkedIn',
    name:'example.json',
    sha256:await sha(content),
    size_bytes:Buffer.byteLength(content)
  };
  const row = {
    key:expected.canonical_path+'/'+expected.name,
    directory_id:'stegsocials-drafts',
    canonical_path:expected.canonical_path,
    name:expected.name,
    media_type:'application/vnd.stegverse.stegsocials-post-preparation+json',
    size_bytes:expected.size_bytes,
    sha256:expected.sha256,
    content_base64:b64(content),
    credential_material_present:false,
    provider_operation_authorized:false,
    authority_effect:'NONE'
  };

  const receipt = await api.verifyStoredRow(row, expected);
  assert.equal(receipt.state,'EXACT_CONTENT_BYTES_READBACK_VERIFIED');
  assert.equal(receipt.exact_content_bytes_readback_verified,true);
  assert.equal(receipt.device_local_kv_store_observed,true);
  assert.equal(receipt.cloud_provider_readback_observed,false);
  assert.equal(receipt.provider_call_performed,false);
  assert.equal(receipt.credential_material_present,false);
  assert.equal(receipt.provider_operation_authorized,false);

  const mutations = [
    [{...row,content_base64:b64(content+'x')}, expected, /exact-content size mismatch|SHA-256 mismatch/],
    [{...row,sha256:'sha256:'+'0'.repeat(64)}, expected, /metadata\/content SHA-256 mismatch/],
    [{...row,directory_id:'erl'}, expected, /directory id mismatch/],
    [{...row,credential_material_present:true}, expected, /credential boundary invalid/],
    [{...row,provider_operation_authorized:true}, expected, /provider-operation boundary invalid/],
    [{...row,authority_effect:'WRITE'}, expected, /authority boundary invalid/]
  ];
  for(const [badRow, exp, pattern] of mutations){
    await assert.rejects(Promise.resolve().then(()=>api.verifyStoredRow(badRow,exp)),pattern);
  }

  assert.throws(()=>api.normalizeExpected({...expected,canonical_path:'02_Research/ERL'}),/Drafts/);
  assert.throws(()=>api.normalizeExpected({...expected,name:'../escape.json'}),/filename invalid/);
  assert.throws(()=>api.normalizeExpected({...expected,size_bytes:1024*1024+1}),/size invalid/);

  console.log(JSON.stringify({status:'PASS',exact_content_bytes_readback_verified:true,device_local_only:true,cloud_provider_readback_observed:false,provider_call_performed:false}));
})().catch(error=>{console.error(error.stack||error);process.exit(1);});
