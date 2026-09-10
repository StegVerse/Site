from pathlib import Path

root = Path(__file__).resolve().parents[1]
mykv = (root / "assets" / "my-kv-personal-form-profile.js").read_text()
okv = (root / "organizational-kv.html").read_text()

for marker in [
    'id="kv-security-posture"',
    'Automatic: <strong>HIGH</strong>',
    'SECURE — below automatic floor',
    'HIGHEST',
    'cannot lower it',
]:
    assert marker in mykv, f"MyKV posture UI missing: {marker}"

for marker in [
    'id="okv-security-posture"',
    'Automatic: <strong>SECURE</strong>',
    'id="okv-posture-select"',
    '<option value="HIGH">HIGH</option>',
    '<option value="HIGHEST">HIGHEST</option>',
    'cannot lower it below that floor',
]:
    assert marker in okv, f"Organizational KV posture UI missing: {marker}"

assert okv.index('class="state">NOT CONNECTED') < okv.index('id="okv-security-posture"') < okv.index('<h1>Organizational KV</h1>')
print("security posture UI validation: PASS")
