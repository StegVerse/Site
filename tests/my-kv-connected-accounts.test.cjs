const assert = require('node:assert/strict');
const directory = require('../assets/my-kv-directory.js');
const accounts = require('../assets/my-kv-connected-accounts.js');

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

assert.throws(() => accounts.normalizeObservation({
  provider: 'linkedin',
  account_ref: 'account://linkedin/stegverse-page',
  provider_account_id: '123456789'
}), /FAIL_CLOSED/);

assert.throws(() => accounts.normalizeObservation({
  provider: 'linkedin',
  account_ref: 'account://linkedin/stegverse-page',
  access_token: 'secret-value'
}), /FAIL_CLOSED/);

accounts.discover({
  listObservedAccounts() {
    return {accounts:[{provider:'facebook',account_ref:'account://facebook/stegverse',label:'StegVerse',account_class:'social'}]};
  }
}).then((items) => {
  assert.equal(items.length, 1);
  assert.equal(items[0].provider_org_ref, 'org:facebook');
  console.log('My KV connected accounts tests: PASS');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
