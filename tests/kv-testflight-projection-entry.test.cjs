const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const entry=fs.readFileSync(path.join(root,'assets/kv-testflight-projection-entry.js'),'utf8');
const exporter=fs.readFileSync(path.join(root,'assets/kv-testflight-projection-export.js'),'utf8');
const page=fs.readFileSync(path.join(root,'kv-testflight-projection.html'),'utf8');

function has(text,needle){assert.ok(text.includes(needle),`missing ${needle}`);}

test('reuses canonical current-device Device-KV InTr admission',()=>{
  has(entry,'CURRENT_IPHONE_TESTFLIGHT_SIGNING');
  has(entry,'MY_KV_INSTALLATION_STATUS');
  has(entry,'StegVerseGeneratedInTr');
  has(entry,'StegVerseHBInTrCarrier');
  has(entry,'StegVerseNodeContinuity');
  has(entry,'StegVerseDeviceKVInTrSync');
  has(entry,'stegverse.device-kv-intr-materialization-ingress/v1');
  has(entry,'receipt.state==="INGRESS_ADMITTED"');
  has(entry,'receipt.exact_request_validated===true&&receipt.write_once_persisted===true');
  has(entry,'receipt.authority_effect==="NONE_INGRESS_ONLY"');
});

test('requires a validated resident KV installation before projection',()=>{
  has(entry,'stegverse.kv.installation-status-projection/v1');
  has(entry,'projection.state==="KV_INSTALLATION_VERIFIED"');
  has(entry,'projection.resident_kv_root_observed===true');
  has(entry,'projection.installation_receipt_present===true');
  has(entry,'projection.full_template_parity==="VALIDATED"');
  has(entry,'kv-installation:');
});

test('observes capabilities without browser identity or fingerprint authority',()=>{
  has(entry,'secure_context:root.isSecureContext===true');
  has(entry,'webassembly:typeof root.WebAssembly');
  has(entry,'subtle_crypto:');
  has(entry,'file_api:');
  has(entry,'fetch_api:');
  has(entry,'text_codec:');
  has(entry,'browser_identity_collected:false');
  has(entry,'user_agent_collected:false');
  has(entry,'device_fingerprint_collected:false');
  has(entry,'browser_identity_authority:false');
  assert.equal(entry.includes('navigator.userAgent'),false);
  assert.equal(entry.includes('localStorage'),false);
  assert.equal(entry.includes('sessionStorage'),false);
});

test('exports only the exact canonical projection context fields',()=>{
  has(exporter,'stegos.kv-bound-ephemeral-projection-context/v1');
  has(exporter,'EXPECTED_KEYS');
  has(exporter,'Object.keys(projection).sort().join(",")===EXPECTED_KEYS.join(",")');
  has(exporter,'JSON.stringify(projection).indexOf("kv_lineage_id")===-1');
  has(exporter,'NONE_EPHEMERAL_CONTEXT_ONLY');
  has(exporter,'NONE_PROJECTION_GATE_ONLY');
  has(exporter,'^sha256:[0-9a-f]{64}$');
});

test('page exposes only user-mediated in-memory projection export',()=>{
  has(page,'Create KV Projection Context');
  has(page,'stegverse-kv-testflight-projection.json');
  has(page,'URL.createObjectURL(new Blob');
  has(page,'URL.revokeObjectURL');
  has(page,'assets/kv-testflight-projection-entry.js');
  has(page,'assets/kv-testflight-projection-export.js');
  assert.equal(page.includes('localStorage'),false);
  assert.equal(page.includes('indexedDB'),false);
  assert.equal(page.includes('navigator.userAgent'),false);
});
