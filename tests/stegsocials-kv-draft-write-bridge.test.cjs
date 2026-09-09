const assert = require('assert');
const prep = require('../assets/stegsocials-post-preparation.js');
const writer = require('../assets/stegsocials-kv-draft-write-bridge.js');

function expectFailure(fn, fragment) {
  let failed = false;
  try { fn(); } catch (err) {
    failed = true;
    assert(String(err.message).includes(fragment), `${err.message} did not include ${fragment}`);
  }
  assert(failed, `expected failure containing ${fragment}`);
}

async function main() {
  const bundle = prep.build({
    platform: 'LINKEDIN',
    erl_ref: '02_Research/ERL/2026-09-08_NSA_AI_Distillation_ERL_RECORD.md',
    body: 'Evidence-grounded draft body',
    evidence_bundle_ref: '02_Research/StegSocials/Evidence/2026-09-08_LinkedIn_NSA_AI_Distillation_Draft.md',
    source_refs: ['https://www.nsa.gov/example'],
    source_links: ['https://www.nsa.gov/example'],
    hashtags: ['#StegVerse'],
    tier: 'STANDARD',
    publication_plan: 'MANUAL',
    automated_posting_entitled: false,
    draft_name: 'nsa-ai-distillation'
  });

  assert.doesNotThrow(() => writer.validateBundle(bundle));
  const split = writer.splitDraftPath(bundle.kv_context.draft_path);
  assert.strictEqual(split.canonical_path, '02_Research/StegSocials/Drafts/LinkedIn');
  assert.strictEqual(split.name, 'nsa-ai-distillation.json');

  const prepared = await writer.buildPortablePayload(bundle);
  assert.strictEqual(prepared.payload.schema, 'stegverse.kv.portable-direct-source-inline-payload/v1');
  assert.strictEqual(prepared.payload.directory_id, 'stegsocials-drafts');
  assert.strictEqual(prepared.payload.canonical_path, '02_Research/StegSocials/Drafts/LinkedIn');
  assert.strictEqual(prepared.payload.source_class, 'OWNER_CONTROLLED_GENERATED_DRAFT');
  assert.strictEqual(prepared.payload.credential_requirement, 'NONE');
  assert.strictEqual(prepared.payload.authority_effect, 'NONE');
  assert.strictEqual(prepared.payload.files.length, 1);
  assert.strictEqual(prepared.payload.files[0].name, 'nsa-ai-distillation.json');
  assert.match(prepared.sha256, /^sha256:[a-f0-9]{64}$/);
  assert.strictEqual(prepared.payload.files[0].sha256, prepared.sha256);
  assert.strictEqual(prepared.payload.files[0].size_bytes, prepared.bytes.length);

  const outside = JSON.parse(JSON.stringify(bundle));
  outside.kv_context.draft_path = '03_Records/StegSocials/Publications/not-a-draft.json';
  expectFailure(() => writer.validateBundle(outside), 'canonical Drafts lane');

  const traversal = JSON.parse(JSON.stringify(bundle));
  traversal.kv_context.draft_path = '02_Research/StegSocials/Drafts/LinkedIn/../escape.json';
  expectFailure(() => writer.validateBundle(traversal), 'path traversal');

  const secret = JSON.parse(JSON.stringify(bundle));
  secret.access_token = 'forbidden';
  expectFailure(() => writer.validateBundle(secret), 'credential/secret-like field');

  const provider = JSON.parse(JSON.stringify(bundle));
  provider.execution.provider_call_performed = true;
  expectFailure(() => writer.validateBundle(provider), 'may not contain provider execution');

  const wrongERL = JSON.parse(JSON.stringify(bundle));
  wrongERL.kv_context.erl_refs[0].ref = '02_Research/StegSocials/Evidence/fake.md';
  expectFailure(() => writer.validateBundle(wrongERL), 'ERL authority/path invalid');

  const source = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'stegsocials-kv-draft-write-bridge.js'), 'utf8');
  assert.match(source, /canonical_kv_admission_observed:true/);
  assert.match(source, /admitted_hash_readback_verified:true/);
  assert.match(source, /exact_content_bytes_readback_verified:false/);
  assert.match(source, /provider_call_performed:false/);
  assert.match(source, /provider_operation_authorized:false/);

  console.log(JSON.stringify({
    status: 'PASS',
    canonical_draft_lane_enforced: true,
    erl_provenance_enforced: true,
    credential_material_refused: true,
    portable_kv_admission_payload_built: true,
    admitted_hash_readback_semantics_present: true,
    exact_content_readback_not_overclaimed: true,
    social_provider_execution_from_writer: false
  }));
}

main().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
