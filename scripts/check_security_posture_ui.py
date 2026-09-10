from pathlib import Path

root=Path(__file__).resolve().parents[1]
mykv=(root/"assets"/"my-kv-personal-form-profile.js").read_text()
okv=(root/"organizational-kv.html").read_text()
for marker in ['id="kv-security-posture"','id="kv-automatic-posture">Awaiting InTr','id="kv-selected-posture">Automatic','Automatic (ecosystem floor)','selection_present:chosen!==null','stegverse:security-posture-resolution','resolution_authority!=="INTERLOCK_INTR"','authority_effect:"NONE_REQUEST_INPUT_ONLY"']:
    assert marker in mykv,f"MyKV posture UI missing: {marker}"
for marker in ['id="okv-security-posture"','id="okv-automatic-posture">Awaiting InTr','id="okv-selected-posture">Automatic','Automatic (ecosystem floor)',"selection_present:chosen!==null",'stegverse:security-posture-resolution',"r.resolution_authority!=='INTERLOCK_INTR'","authority_effect:'NONE_REQUEST_INPUT_ONLY'"]:
    assert marker in okv,f"Organizational KV posture UI missing: {marker}"
assert okv.index('class="state">NOT CONNECTED')<okv.index('id="okv-security-posture"')<okv.index('<h1>Organizational KV</h1>')
print("security posture automatic-default UI validation: PASS")
