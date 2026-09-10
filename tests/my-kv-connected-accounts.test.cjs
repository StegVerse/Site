const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const directory = require('../assets/my-kv-directory.js');
const accounts = require('../assets/my-kv-connected-accounts.js');
const transfer = require('../assets/my-kv-skap-account-transfer.js');

(async () => {
  assert.equal(directory.getDomain('connected-accounts').label, 'Connected Accounts');
  assert.equal(directory.directoryHref('connected-accounts'), 'my-kv-connected-accounts.html');
  assert.equal(directory.getDomain('connected-accounts').path, '_Vault/SKAP/Accounts');

  const normalized = accounts.normalizeObservation({
    provider: 'linkedin',
    account_ref: 'account://linkedin/stegverse-page',
    label: 'StegVerse',
    account_class: 'social',
    status: 'ACTIVE'
  });
  assert.deepEqual(normalized, {
    provider_org_ref: 'org:linkedin',
    account_ref: 'account://linkedin/stegverse-page',
    label: 'StegVerse',
    account_class: 'social',
    status: 'ACTIVE'
  });

  assert.throws(() => accounts.normalizeObservation({provider:'linkedin',account_ref:'account://linkedin/stegverse-page',provider_account_id:'123456789'}), /FAIL_CLOSED/);
  assert.throws(() => accounts.normalizeObservation({provider:'linkedin',account_ref:'account://linkedin/stegverse-page',access_token:'secret-value'}), /FAIL_CLOSED/);

  const discovered = await accounts.discover({
    listObservedAccounts() {
      return {accounts:[{provider:'facebook',account_ref:'account://facebook/stegverse',label:'StegVerse',account_class:'social'}]};
    }
  });
  assert.equal(discovered.length, 1);
  assert.equal(discovered[0].provider_org_ref, 'org:facebook');

  const vector = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','kv_skap_account_metadata_conformance_v1.json'),'utf8'));
  const packet = await transfer.buildTransferPacket({
    owner_selection_ref:'kv://selection/conformance-linkedin-001',
    provider_org_ref:'org:linkedin',
    account_class:'social',
    account_status:'ACTIVE',
    source_evidence_ref:'evidence://provider-observation/conformance-linkedin-001',
    source_evidence_sha256:'sha256:'+'a'.repeat(64)
  });
  assert.deepEqual(packet, vector.packet);
  const request = transfer.buildKVRequest(packet,'KVSKAP-CONFORMANCE-001','owner://conformance');
  assert.deepEqual(request, vector.kv_interlock_request);
  const envelope = await transfer.buildBoundaryEnvelope(packet,request);
  assert.deepEqual(envelope, vector.intr_boundary_envelope);

  assert.throws(() => transfer.requireProfile({PROFILES:{'kv-skap':{operations:['RESOLVE_REFERENCE','VERIFY_SESSION'],source:{boundary:'KV'},destination:{boundary:'SKAP_VAULT'}}}}), /FAIL_CLOSED/);
  const exactProfile = {PROFILES:{'kv-skap-account-metadata':{operations:['SKAP_ACCOUNT_METADATA_ADMIT'],source:{boundary:'KV'},destination:{boundary:'SKAP_VAULT'}}}};
  assert.equal(transfer.requireProfile(exactProfile).operations[0], 'SKAP_ACCOUNT_METADATA_ADMIT');

  const receiptBase = {
    schema:'stegverse.skap.account-metadata-receipt/v1',
    object_id:'skap://accounts/linkedin/0123456789abcdef01234567',
    provider_org_ref:packet.provider_org_ref,
    account_class:packet.account_class,
    account_status:packet.account_status,
    source_class:'AUTHENTIC_PROVIDER_ACCOUNT_OBSERVATION',
    source_evidence_ref:packet.source_evidence_ref,
    source_evidence_sha256:packet.source_evidence_sha256,
    owner_selection_ref:packet.owner_selection_ref,
    transfer_id:packet.transfer_id,
    payload_sha256:packet.payload_sha256,
    intr_receipt_ref:'intr://receipt/KVSKAP-CONFORMANCE-001',
    intr_request_sha256:envelope.request_sha256,
    transfer_packet_sha256:envelope.transfer_packet_sha256,
    synthetic_material_only:false,
    contains_secret_material:false,
    raw_provider_account_identifier_present:false,
    receipt_sha256:'sha256:'+'b'.repeat(64)
  };
  assert.equal(transfer.validateSKAPReceipt(receiptBase,packet,envelope).object_id, receiptBase.object_id);
  assert.throws(() => transfer.validateSKAPReceipt({...receiptBase,synthetic_material_only:true},packet,envelope), /FAIL_CLOSED/);
  assert.throws(() => transfer.validateSKAPReceipt({...receiptBase,provider_org_ref:'org:facebook'},packet,envelope), /FAIL_CLOSED/);

  console.log('My KV connected accounts + KV→SKAP conformance tests: PASS');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
