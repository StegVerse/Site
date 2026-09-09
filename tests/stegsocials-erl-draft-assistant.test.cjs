const assert=require('assert');
const crypto=require('crypto').webcrypto;
global.crypto=crypto;
const api=require('../assets/stegsocials-erl-draft-assistant.js');

function b64(text){return Buffer.from(text,'utf8').toString('base64');}
async function sha(text){const d=await crypto.subtle.digest('SHA-256',Buffer.from(text,'utf8'));return 'sha256:'+Buffer.from(d).toString('hex');}

(async function(){
  const text=`# NSA AI Distillation Advisory\n\n## Source synopsis\nNSA, FBI, and CISA describe industrial-scale model distillation activity distributed across providers and infrastructure so no single point sees the entire campaign.\n\n## StegOS / GADI interpretation\nA single interaction can appear ordinary while accumulated behavior becomes adversarial. Governance should correlate state, provenance, relationships, and prior transitions before deciding whether the next interaction remains admissible.\n\nSource: https://www.nsa.gov/example\n`;
  const row={
    key:'02_Research/ERL/nsa.md',canonical_path:'02_Research/ERL',name:'nsa.md',
    media_type:'text/markdown',size_bytes:Buffer.byteLength(text),sha256:await sha(text),content_base64:b64(text),
    credential_material_present:false,provider_operation_authorized:false,authority_effect:'NONE'
  };
  const result=await api.parseVerifiedRow(row,{erl_ref:'02_Research/ERL/nsa.md',platform:'LINKEDIN'});
  assert.equal(result.state,'ERL_ASSISTED_DRAFT_READY');
  assert.equal(result.erl_authority_preserved,true);
  assert.equal(result.deterministic_local_assistance,true);
  assert.equal(result.ai_provider_call_performed,false);
  assert.equal(result.provider_call_performed,false);
  assert.equal(result.credential_material_present,false);
  assert(result.body.includes('NSA AI Distillation Advisory'));
  assert(result.body.includes('industrial-scale model distillation'));
  assert(result.body.includes('accumulated behavior becomes adversarial'));
  assert(result.body.includes('https://www.nsa.gov/example'));
  assert(result.hashtags.includes('#StegVerse'));
  assert(result.hashtags.includes('#GADI'));
  assert(result.hashtags.includes('#StegOS'));

  const x=await api.parseVerifiedRow(row,{erl_ref:'02_Research/ERL/nsa.md',platform:'X'});
  assert(x.body.length<=280);
  assert.deepEqual(x.hashtags,[]);

  assert.throws(()=>api.normalizeRef('03_Records/nope.md'),/ERL lane/);
  assert.throws(()=>api.normalizeRef('02_Research/ERL/../escape.md'),/traversal/);
  assert.throws(()=>api.normalizeRef('02_Research/ERL/sub/file.md'),/one bounded root artifact/);
  await assert.rejects(()=>api.parseVerifiedRow({...row,sha256:'sha256:'+'0'.repeat(64)},{erl_ref:'02_Research/ERL/nsa.md',platform:'LINKEDIN'}),/SHA-256 mismatch/);
  assert.throws(()=>api.parseVerifiedRow({...row,credential_material_present:true},{erl_ref:'02_Research/ERL/nsa.md',platform:'LINKEDIN'}),/credential boundary/);

  console.log(JSON.stringify({status:'PASS',erl_assisted_draft:true,provider_call_performed:false,ai_provider_call_performed:false}));
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
