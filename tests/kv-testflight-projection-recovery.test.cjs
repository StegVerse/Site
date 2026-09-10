const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync('kv-testflight-projection.html', 'utf8');
const bridge = fs.readFileSync('assets/my-kv-portable-installation-bridge.js', 'utf8');

test('projection page reuses the canonical portable installation admission bridge', () => {
  assert.match(page, /assets\/my-kv-portable-installation-bridge\.js/);
  assert.match(page, /Admit Existing KV Installation Receipt/);
  assert.match(page, /StegVerseKVInstallationBridge/);
  assert.match(page, /installAndVerify/);
  assert.match(page, /device_local_kv_materialization_observed/);
  assert.match(page, /_System\/installation\.receipt\.json/);
});

test('recovery is offered only after the resident KV verification predicate fails', () => {
  assert.match(page, /resident KV installation not verified/);
  assert.match(page, /recover\.hidden=message\.indexOf\("resident KV installation not verified"\)===-1/);
  assert.match(page, /KV_INSTALLATION_RECEIPT_ADMITTED/);
  assert.match(page, /return runProjection\(\)/);
});

test('recovery does not create a second KV authority path', () => {
  assert.match(bridge, /root\.StegVerseKVInstallationBridge/);
  assert.match(bridge, /intr\.buildIntent\("device-kv"/);
  assert.match(bridge, /node\.queueIntrMaterializationRequest\(request\)/);
  assert.match(bridge, /sync\.synchronizeMaterialization\(request\.materialization_id\)/);
  assert.match(bridge, /credential_authority:"TV\/TVC"/);
  assert.match(bridge, /authority_effect:"NONE"/);
  assert.doesNotMatch(page, /localStorage\.|sessionStorage\.|document\.cookie/);
});

test('projection download remains unavailable until projection context is ready', () => {
  assert.match(page, /<a id="save" hidden/);
  assert.match(page, /save\.hidden=true/);
  assert.match(page, /state\.textContent="PROJECTION_CONTEXT_READY"/);
  assert.match(page, /save\.href=url;save\.hidden=false/);
});
