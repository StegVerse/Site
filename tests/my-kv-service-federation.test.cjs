const assert=require('assert');
const api=require('../assets/my-kv-service-federation.js');

function binding(overrides={}){
  return {
    schema:'stegverse.kv.service-binding/v1',
    service_class:'MAIL',
    provider:'MICROSOFT365',
    provider_account_ref:'rigel@stegverse.org',
    kv_instance_ref:'kvi_1',
    relationship_state:'CONNECTED',
    custody_posture:'REFERENCE_ONLY',
    provider_authority_effect:'NONE_STATUS_ONLY',
    credential_material_present:false,
    provider_mutation_authorized:false,
    activation_effect:false,
    ...overrides
  };
}

(function validatesBinding(){
  const row=api.validateBinding(binding());
  assert.strictEqual(row.binding_key,'MAIL|MICROSOFT365|rigel@stegverse.org|kvi_1|CONNECTED');
})();

(function supportsMultipleAccountsAndProviders(){
  const rows=api.validateBindings([
    binding(),
    binding({provider:'GMAIL',provider_account_ref:'rigelrandolph@gmail.com'}),
    binding({service_class:'CALENDAR',provider:'MICROSOFT365'})
  ]);
  assert.strictEqual(rows.length,3);
  const allMail=api.buildUnifiedProjection(rows,'MAIL');
  assert.strictEqual(allMail.binding_count,2);
  assert.strictEqual(allMail.provenance_preserved,true);
  assert.strictEqual(allMail.custody_merged,false);
})();

(function relationshipIsPerBinding(){
  const rows=api.validateBindings([
    binding({relationship_state:'AI_INTERACTION'}),
    binding({service_class:'FILES',relationship_state:'CONNECTED'})
  ]);
  assert.strictEqual(rows[0].relationship_state,'AI_INTERACTION');
  assert.strictEqual(rows[1].relationship_state,'CONNECTED');
})();

(function rejectsSecretFields(){
  assert.throws(()=>api.validateBinding(binding({refresh_token:'nope'})),/sensitive federation field prohibited/);
})();

(function rejectsDuplicateBinding(){
  assert.throws(()=>api.validateBindings([binding(),binding()]),/duplicate service\/account binding/);
})();

(async function skapFirstOnboardingStaysPending(){
  const bridge={requestAccountOnboarding(req){
    assert.strictEqual(req.credential_destination,'SKAP_VAULT');
    assert.strictEqual(req.authorization_mode,'PROVIDER_NATIVE_OR_SKAP_SEALED');
    assert.strictEqual(req.provider_capability_discovery_required,true);
    assert.strictEqual(req.relationship_default,'NOT_CONNECTED');
    assert.strictEqual(req.sync_default,false);
    assert.strictEqual(req.ai_interaction_default,false);
    assert.strictEqual(req.provider_operation_authorized,false);
    return {...req,request_id:'acct_test_1'};
  }};
  const result=await api.requestAccountOnboarding({
    provider:'MICROSOFT365',
    account_hint:'rigel@stegverse.org',
    kv_instance_ref:'kvi_1',
    requested_service_classes:['MAIL','CALENDAR','CONTACTS','FILES']
  },bridge);
  assert.strictEqual(result.governance_state,'PENDING_INTERLOCK_INTR');
  assert.strictEqual(result.credential_material_present,false);
})();

(function noDirectOnboardingWithoutGovernedBridge(){
  assert.throws(()=>api.requestAccountOnboarding({provider:'GMAIL',account_hint:'x@example.com',kv_instance_ref:'kvi_1'},null),/governed account-onboarding bridge unavailable/);
})();

console.log('MyKV service federation tests: PASS');
