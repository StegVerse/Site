const assert = require('assert');
const prep = require('../assets/stegsocials-post-preparation.js');
const kvDirectory = require('../assets/my-kv-directory.js');

function expectFailure(fn, fragment) {
  let failed = false;
  try { fn(); } catch (err) {
    failed = true;
    assert(String(err.message).includes(fragment), `${err.message} did not include ${fragment}`);
  }
  assert(failed, `expected failure containing ${fragment}`);
}

const domains = kvDirectory.listDomains();
const erl = domains.find((entry) => entry.id === 'erl');
const drafts = domains.find((entry) => entry.id === 'stegsocials-drafts');
assert(erl);
assert.strictEqual(erl.path, '02_Research/ERL');
assert(drafts);
assert.strictEqual(drafts.path, '02_Research/StegSocials/Drafts');

const standard = prep.build({
  platform: 'LINKEDIN',
  erl_ref: '02_Research/ERL/2026-09-08_NSA_AI_Distillation_ERL_RECORD.md',
  body: 'Evidence-grounded draft',
  evidence_bundle_ref: '02_Research/StegSocials/Evidence/nsa.json',
  tier: 'STANDARD',
  publication_plan: 'MANUAL',
  automated_posting_entitled: false,
  hashtags: ['#StegVerse']
});
assert.strictEqual(standard.schema, 'stegverse.stegsocials.post-preparation/v1');
assert.strictEqual(standard.task_id, 'SS-EVIDENCE-COMPARISON-001');
assert.strictEqual(standard.kv_context.erl_refs[0].authority, 'ERL');
assert(standard.kv_context.draft_path.startsWith('02_Research/StegSocials/Drafts/LinkedIn/'));
assert.strictEqual(standard.execution.provider_call_performed, false);
assert.strictEqual(standard.execution.credential_material_present, false);
assert.strictEqual(standard.execution.publication_authority_effect, 'NONE_PREPARATION_ONLY');

expectFailure(() => prep.build({
  platform: 'LINKEDIN', erl_ref: standard.kv_context.erl_refs[0].ref,
  body: 'x', tier: 'STANDARD', publication_plan: 'AUTOMATED'
}), 'premium entitlement');

expectFailure(() => prep.build({
  platform: 'LINKEDIN', erl_ref: '../private.txt', body: 'x'
}), 'inside the ERL lane');

expectFailure(() => prep.build({
  platform: 'LINKEDIN', erl_ref: standard.kv_context.erl_refs[0].ref,
  body: 'x', access_token: 'not-allowed'
}), 'Credential/secret-like material');

const premiumPreparation = prep.build({
  platform: 'FACEBOOK',
  erl_ref: standard.kv_context.erl_refs[0].ref,
  body: 'Premium-eligible draft',
  tier: 'PREMIUM',
  publication_plan: 'SCHEDULED',
  automated_posting_entitled: true
});
assert.strictEqual(premiumPreparation.publication_plan, 'SCHEDULED');
assert.strictEqual(premiumPreparation.execution.provider_call_performed, false);

console.log(JSON.stringify({
  status: 'PASS',
  erl_domain: true,
  drafts_domain: true,
  standard_manual_preparation: true,
  premium_entitlement_boundary: true,
  provider_execution_from_site_preparation: false,
  credential_material_refused: true
}));
