const assert = require('assert');
const nodeCrypto = require('crypto');

function makeIndexedDB(initialRows) {
  const rows = new Map(Object.entries(initialRows || {}));
  function makeDb() {
    return {
      objectStoreNames: { contains(name){ return name === 'kv_files'; } },
      createObjectStore(){},
      close(){},
      transaction(name, mode) {
        assert.strictEqual(name, 'kv_files');
        const tx = { oncomplete:null, onerror:null, onabort:null, error:null, aborted:false };
        const store = {
          get(key) {
            const req = { result:null, error:null, onsuccess:null, onerror:null };
            setTimeout(() => {
              if (tx.aborted) return;
              req.result = rows.has(key) ? JSON.parse(JSON.stringify(rows.get(key))) : undefined;
              if (req.onsuccess) req.onsuccess();
              if (mode === 'readonly' && tx.oncomplete) setTimeout(() => tx.oncomplete(), 0);
            }, 0);
            return req;
          },
          put(row) {
            if (mode !== 'readwrite') throw new Error('readonly transaction');
            rows.set(row.key, JSON.parse(JSON.stringify(row)));
            setTimeout(() => { if (!tx.aborted && tx.oncomplete) tx.oncomplete(); }, 0);
          }
        };
        tx.objectStore = () => store;
        tx.abort = () => { tx.aborted = true; if (tx.onabort) setTimeout(() => tx.onabort(), 0); };
        return tx;
      }
    };
  }
  return {
    rows,
    open() {
      const req = { result:null, error:null, onsuccess:null, onerror:null, onupgradeneeded:null };
      setTimeout(() => { req.result = makeDb(); if (req.onsuccess) req.onsuccess(); }, 0);
      return req;
    }
  };
}

global.crypto = nodeCrypto.webcrypto;
global.indexedDB = makeIndexedDB();
const receiver = require('../assets/stegsocials-bounded-group-device-kv-cas-receiver.js');

function state(successful, indices, status='ACTIVE') {
  return {
    schema_version:'stegsocials.bounded-post-group-use-state.v1',
    group_id:'post-group-social-001',
    state:status,
    state_ref:'kv://personal/StegSocials/PostGroupState/post-group-social-001',
    consumed_use_indices:indices,
    successful_posts:successful,
    last_successful_at:successful ? '2026-09-10T22:00:00Z' : null,
    observed_at:successful ? '2026-09-10T22:00:00Z' : '2026-09-10T21:00:00Z'
  };
}

function toRow(path, value, etag) {
  const bytes = Buffer.from(JSON.stringify(value, Object.keys(value).sort()));
  return {
    key:path,
    sha256:etag,
    content_base64:Buffer.from(canonical(value)+'\n').toString('base64'),
    size_bytes:Buffer.byteLength(canonical(value)+'\n'),
    credential_material_present:false,
    provider_operation_authorized:false,
    authority_effect:'NONE'
  };
}
function canonical(v){
  if(v===null||typeof v!=='object') return JSON.stringify(v);
  if(Array.isArray(v)) return '['+v.map(canonical).join(',')+']';
  return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
}
async function expectReject(action, fragment) {
  let failed=false;
  try { await (typeof action === 'function' ? action() : action); }
  catch (e) { failed=true; assert(String(e.message).includes(fragment), `${e.message} did not include ${fragment}`); }
  assert(failed, `expected rejection containing ${fragment}`);
}

(async function(){
  const path='03_Records/StegSocials/PostGroupState/post-group-social-001.json';
  const current=state(0,[]);
  const currentEtag=await receiver.stateEtag(current);
  global.indexedDB = makeIndexedDB({[path]:toRow(path,current,currentEtag)});

  const next=state(1,[1]);
  const nextEtag=await receiver.stateEtag(next);
  const request={
    schema:'stegverse.site.stegsocials-bounded-group-kv-conditional-write/v1',
    operation:'COMPARE_AND_SWAP',
    canonical_path:path,
    group_id:'post-group-social-001',
    consumed_use_index:1,
    expected_previous_etag:currentEtag,
    next_state_etag:nextEtag,
    next_state:next,
    publication_proof:{
      publication_proven:true,
      publication_receipt_ref:'receipt://social/1',
      final_content_hash:'sha256:'+'a'.repeat(64),
      session_state_destroyed:true,
      credential_material_present:false
    },
    credential_material_present:false,
    provider_operation_authorized:false,
    authority_effect:'NONE_STATE_TRANSITION_REQUEST_ONLY'
  };

  const result=await receiver.commit(request);
  assert.strictEqual(result.state,'GROUP_USE_STATE_COMMITTED');
  assert.strictEqual(result.previous_etag,currentEtag);
  assert.strictEqual(result.persisted_etag,nextEtag);
  assert.strictEqual(result.exact_readback_verified,true);
  assert.strictEqual(result.session_state_destroyed,true);

  await expectReject(()=>receiver.commit({...request, expected_previous_etag:'sha256:'+'b'.repeat(64)}),'stale expected etag');
  await expectReject(()=>receiver.commit({...request, next_state_etag:'sha256:'+'c'.repeat(64)}),'next state etag mismatch');
  await expectReject(()=>receiver.commit({...request, credential_material_present:true}),'credential material prohibited');
  await expectReject(()=>receiver.commit({...request, provider_operation_authorized:true}),'provider authority prohibited');
  await expectReject(()=>receiver.commit({...request, publication_proof:{...request.publication_proof,session_state_destroyed:false}}),'terminal destruction proof missing');

  const second=state(2,[1,2],'EXHAUSTED');
  const secondEtag=await receiver.stateEtag(second);
  const secondReq={...request,consumed_use_index:2,expected_previous_etag:nextEtag,next_state_etag:secondEtag,next_state:second,publication_proof:{...request.publication_proof,publication_receipt_ref:'receipt://social/2'}};
  const secondResult=await receiver.commit(secondReq);
  assert.strictEqual(secondResult.previous_etag,nextEtag);
  assert.strictEqual(secondResult.persisted_etag,secondEtag);

  console.log(JSON.stringify({
    status:'PASS',
    existing_device_kv_store_reused:receiver.db_name==='stegverse-device-local-intr-v1'&&receiver.store==='kv_files',
    indexeddb_readwrite_cas:true,
    stale_etag_refused:true,
    next_state_hash_verified:true,
    exact_readback_rehash_verified:true,
    publication_destruction_gate:true,
    credential_and_provider_authority_refused:true,
    sequential_multi_use_commit:true
  }));
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
