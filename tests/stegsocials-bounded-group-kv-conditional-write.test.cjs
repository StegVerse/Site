const assert = require('assert');
const bridge = require('../assets/stegsocials-bounded-group-kv-conditional-write.js');

function baseState(successful=0, indices=[], state='ACTIVE') {
  return {
    schema_version:'stegsocials.bounded-post-group-use-state.v1',
    group_id:'post-group-social-001',
    state,
    state_ref:'kv://personal/StegSocials/PostGroupState/post-group-social-001',
    consumed_use_indices:indices,
    successful_posts:successful,
    last_successful_at:successful ? '2026-09-10T21:00:00Z' : null,
    observed_at:successful ? '2026-09-10T21:00:00Z' : '2026-09-10T20:00:00Z'
  };
}
async function expectReject(action, fragment){
  let failed=false;
  try {
    const value = typeof action === 'function' ? action() : action;
    await value;
  } catch (e) {
    failed=true;
    assert(String(e.message).includes(fragment), `${e.message} did not include ${fragment}`);
  }
  assert(failed, `expected rejection containing ${fragment}`);
}

(async function(){
  const current=baseState();
  const expected=await bridge.stateEtag(current);
  const next=baseState(1,[1]);
  const proof={publication_proven:true,publication_receipt_ref:'receipt://social/1',final_content_hash:'sha256:'+'a'.repeat(64),session_state_destroyed:true,credential_material_present:false};
  const request=await bridge.buildRequest(current,next,expected,proof);
  assert.strictEqual(request.operation,'COMPARE_AND_SWAP');
  assert.strictEqual(request.consumed_use_index,1);
  assert.strictEqual(request.canonical_path,'03_Records/StegSocials/PostGroupState/post-group-social-001.json');

  let persistedEtag=expected;
  async function tx(args){
    assert.strictEqual(args.expected_previous_etag,persistedEtag);
    persistedEtag=args.next_state_etag;
    return {committed:true,previous_etag:args.expected_previous_etag,persisted_etag:persistedEtag,exact_readback_verified:true,credential_material_present:false};
  }
  const result=await bridge.executeConditionalWrite(tx,request);
  assert.strictEqual(result.state,'GROUP_USE_STATE_COMMITTED');
  assert.strictEqual(result.exact_readback_verified,true);

  await expectReject(()=>bridge.buildRequest(current,next,'sha256:'+'b'.repeat(64),proof),'expected etag does not match');
  await expectReject(()=>bridge.buildRequest(current,next,expected,{...proof,publication_proven:false}),'proven publication required');
  await expectReject(()=>bridge.buildRequest(current,next,expected,{...proof,session_state_destroyed:false}),'terminal StegBrowser destruction proof required');

  const replay=baseState(1,[1]);
  const replayNext=baseState(2,[1]);
  const replayEtag=await bridge.stateEtag(replay);
  await expectReject(()=>bridge.buildRequest(replay,replayNext,replayEtag,proof),'use-state must add exactly one index');

  const tampered=baseState(1,[1]); tampered.access_token='forbidden';
  await expectReject(()=>bridge.stateEtag(tampered),'secret-like field prohibited');

  await expectReject(()=>bridge.executeConditionalWrite(async()=>({committed:false}),request),'conditional-write was not committed');

  console.log(JSON.stringify({status:'PASS',conditional_write_contract:true,stale_etag_refused:true,publication_proof_required:true,terminal_destruction_required:true,replay_refused:true,credential_fields_refused:true,exact_readback_required:true}));
})().catch(err=>{console.error(err.stack||err);process.exit(1);});