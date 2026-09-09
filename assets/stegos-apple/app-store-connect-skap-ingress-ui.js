(() => {
  'use strict';

  const $=(id)=>document.getElementById(id);
  const setStatus=(message)=>{const node=$('appStoreConnectIngressStatus');if(node)node.textContent=message;};
  const clearInputs=()=>{for(const id of ['ascIssuerId','ascKeyId']){const node=$(id);if(node)node.value='';}const file=$('ascPrivateKeyFile');if(file)file.value='';};

  async function readPrivateKeyFile(file){
    if(!file)throw new Error('Select the downloaded App Store Connect .p8 file');
    if(file.size<=0||file.size>32768)throw new Error('App Store Connect .p8 file size invalid');
    const text=await file.text();
    if(!text.includes('-----BEGIN PRIVATE KEY-----')||!text.includes('-----END PRIVATE KEY-----'))throw new Error('Selected file is not a PKCS8 private key');
    return text;
  }

  async function refreshAvailability(){
    const button=$('ascSealButton');if(!button)return;
    button.disabled=true;
    try{await window.StegOSAppStoreConnectSkapIngress.loadConfig();await window.StegOSAppStoreConnectSkapSubmission.loadSubmissionConfig();button.disabled=false;setStatus('TVC/SKAP recipient and governed InTr route are active. Credential selection remains local to this browser.');}
    catch(error){setStatus(`Not ready for credential ingress: ${String(error?.message||error)}.`);}
  }

  async function sealAndSubmit(){
    const button=$('ascSealButton');if(button)button.disabled=true;
    let issuerId=String($('ascIssuerId')?.value||'').trim(),keyId=String($('ascKeyId')?.value||'').trim(),privateKeyP8='';
    try{
      if(!issuerId||issuerId.length>128)throw new Error('Issuer ID required');
      if(!keyId||keyId.length>64)throw new Error('Key ID required');
      privateKeyP8=await readPrivateKeyFile($('ascPrivateKeyFile')?.files?.[0]);
      setStatus('Authorizing this iPhone and sealing the Apple credential locally…');
      const packet=await window.StegOSAppStoreConnectSkapIngress.sealAppStoreConnectCredential({issuerId,keyId,privateKeyP8});
      clearInputs();issuerId='';keyId='';privateKeyP8='';
      window.dispatchEvent(new CustomEvent('stegverse:app-store-connect-skap-ingress-sealed',{detail:packet}));
    }catch(error){clearInputs();issuerId='';keyId='';privateKeyP8='';setStatus(`Fail closed: ${String(error?.message||error)}.`);if(button)button.disabled=false;}
  }

  document.addEventListener('DOMContentLoaded',()=>{const button=$('ascSealButton');if(button)button.addEventListener('click',sealAndSubmit);refreshAvailability();});
  window.addEventListener('stegverse:app-store-connect-skap-ingress-failed',()=>{const button=$('ascSealButton');if(button)button.disabled=false;});

  window.StegOSAppStoreConnectSkapIngressUI=Object.freeze({readPrivateKeyFile,refreshAvailability,sealAndSubmit,clearInputs});
})();
