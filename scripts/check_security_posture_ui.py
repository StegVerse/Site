from pathlib import Path

root = Path(__file__).resolve().parents[1]
mykv = (root / "assets" / "my-kv-personal-form-profile.js").read_text()
okv = (root / "organizational-kv.html").read_text()

for marker in [
    'id="kv-security-posture"',
    'Automatic: <strong id="kv-automatic-posture">Awaiting InTr</strong>',
    'Selected: <strong id="kv-selected-posture">SECURE</strong>',
    'Authority: <strong id="kv-posture-authority">Pending</strong>',
    'stegverse:security-posture-selected',
    'stegverse:security-posture-resolution',
    'resolution_authority!=="INTERLOCK_INTR"',
    'authority_effect:"NONE_REQUEST_INPUT_ONLY"',
    'Interlock/InTr computes the non-downgradable automatic floor',
]:
    assert marker in mykv, f"MyKV posture UI missing: {marker}"

for marker in [
    'id="okv-security-posture"',
    'id="okv-automatic-posture">Awaiting InTr',
    'id="okv-selected-posture">SECURE',
    'id="okv-posture-authority">Pending',
    'stegverse:security-posture-selected',
    'stegverse:security-posture-resolution',
    "r.resolution_authority!=='INTERLOCK_INTR'",
    "authority_effect:'NONE_REQUEST_INPUT_ONLY'",
    'Site cannot lower, grant, or reinterpret it',
]:
    assert marker in okv, f"Organizational KV posture UI missing: {marker}"

assert okv.index('class="state">NOT CONNECTED') < okv.index('id="okv-security-posture"') < okv.index('<h1>Organizational KV</h1>')
print("security posture UI validation: PASS")
