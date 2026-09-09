// Validation checkpoint: Math specialty remains inside the existing shared conversational runtime; authority effect NONE.
(()=>{
  const form=document.getElementById('chatForm');
  const input=document.getElementById('messageInput');
  const log=document.getElementById('chatLog');
  const mathImageInput=document.getElementById('mathImageInput');
  const mathImageName=document.getElementById('mathImageName');
  const nodeApi=window.StegVerseNodeContinuity||null;
  const nodeStatus=document.getElementById('node-llm-status');
  const nodeRegister=document.getElementById('node-register-device');
  let registrationRecheckConfirmedUnregistered=false;
  if(!form||!input||!log)return;

  async function refreshNodeStatus(){
    if(!nodeApi||!nodeStatus)return;
    try{
      const trial=await nodeApi.trialStatus();
      if(trial.node_registered){
        registrationRecheckConfirmedUnregistered=false;
        nodeStatus.textContent='Registered StegVerse Node · unregistered 10-question limit does not apply.';
        if(nodeRegister){
          nodeRegister.hidden=true;
          nodeRegister.disabled=false;
          nodeRegister.dataset.action='check';
          nodeRegister.textContent='Check current registration';
        }
      }else{
        nodeStatus.textContent=registrationRecheckConfirmedUnregistered
          ? 'No current registration was found in this browser context · '+trial.remaining+' of '+trial.limit+' LLM questions remaining.'
          : 'Current Node registration is not visible in this browser context · '+trial.remaining+' of '+trial.limit+' LLM questions remaining.';
        if(nodeRegister){
          nodeRegister.hidden=false;
          nodeRegister.disabled=false;
          nodeRegister.dataset.action=registrationRecheckConfirmedUnregistered?'register':'check';
          nodeRegister.textContent=registrationRecheckConfirmedUnregistered?'Register this device':'Check current registration';
        }
      }
    }catch(_error){
      nodeStatus.textContent='Node status unavailable · LLM admission fails closed when entitlement cannot be resolved.';
      if(nodeRegister){nodeRegister.hidden=true;nodeRegister.disabled=true;}
    }
  }

  function append(kind,text){
    const item=document.createElement('div');item.className='chat-message '+kind;
    const body=document.createElement('div');body.className='body';body.textContent=text;
    item.appendChild(body);log.appendChild(item);log.scrollTop=log.scrollHeight;
    return item;
  }
  function usePrompt(text){input.value=text;input.focus()}

  function evidenceKind(result){
    if(result?.source_observation===true)return 'source-observation';
    if(result?.model_execution===false&&result?.deterministic_execution===true)return 'deterministic-capability';
    if(result?.model_execution===false)return 'non-model-capability';
    return 'model';
  }

  document.querySelectorAll('[data-chat-prompt]').forEach(button=>{
    button.addEventListener('click',()=>{usePrompt(button.dataset.chatPrompt||'')});
  });
  nodeRegister?.addEventListener('click',async()=>{
    if(!nodeApi)return;
    nodeRegister.disabled=true;
    const action=nodeRegister.dataset.action||'check';
    if(action==='check'){
      nodeRegister.textContent='Checking…';
      try{
        const current=await nodeApi.status();
        if(current.registered){
          registrationRecheckConfirmedUnregistered=false;
          await refreshNodeStatus();
          return;
        }
        registrationRecheckConfirmedUnregistered=true;
        await refreshNodeStatus();
      }catch(_error){
        nodeStatus.textContent='Current registration could not be verified · '+String(_error?.message||_error);
        nodeRegister.hidden=false;
        nodeRegister.disabled=false;
        nodeRegister.dataset.action='check';
        nodeRegister.textContent='Check current registration';
      }
      return;
    }

    nodeRegister.textContent='Registering…';
    try{
      const current=await nodeApi.status();
      if(current.registered){
        registrationRecheckConfirmedUnregistered=false;
        await refreshNodeStatus();
        return;
      }
      await nodeApi.registerDevice();
      registrationRecheckConfirmedUnregistered=false;
      await refreshNodeStatus();
    }catch(_error){
      nodeStatus.textContent='Device registration failed · '+String(_error?.message||_error);
      nodeRegister.hidden=false;
      nodeRegister.disabled=false;
      nodeRegister.dataset.action='check';
      nodeRegister.textContent='Check current registration';
      registrationRecheckConfirmedUnregistered=false;
    }
  });

  mathImageInput?.addEventListener('change',()=>{
    const file=mathImageInput.files?.[0]||null;
    if(mathImageName)mathImageName.textContent=file?file.name:'';
  });

  form.addEventListener('submit',async event=>{
    const message=input.value.trim();
    const mathImage=mathImageInput?.files?.[0]||null;
    if(!message&&!mathImage)return;
    const runtime=window.EcosystemRuntime||window.EcosystemVARuntime;
    if(!mathImage&&runtime?.isVA?.(message))return;
    event.preventDefault();
    if(message)append('user',message);
    if(mathImage)append('user','Math image: '+mathImage.name);
    input.value='';
    if(mathImageInput)mathImageInput.value='';
    if(mathImageName)mathImageName.textContent='';
    const pending=append('system',mathImage?'Reviewing the image…':'Thinking…');
    try{
      if(!runtime?.askGeneral)throw new Error('shared_runtime_unavailable');
      if(nodeApi)await nodeApi.beforeLlmRequest();
      let result;
      if(mathImage){
        if(!runtime?.reviewMathImage)throw new Error('math_image_runtime_unavailable');
        result=await runtime.reviewMathImage(mathImage);
        if(message){
          result={...result,text:result.text+'\n\nYour question was not answered from the image because a mathematical transcription has not been produced or admitted yet.'};
        }
      }else{
        result=runtime?.isMath?.(message)&&runtime?.askMath
          ? await runtime.askMath(message)
          : await runtime.askGeneral(message);
      }
      if(nodeApi&&result?.model_execution!==false){await nodeApi.recordLlmExecution();await refreshNodeStatus();}
      pending.remove();
      const response=append('system',result.text);
      if(result.receipt){
        response.dataset.executionReceipt=result.receipt;
        response.dataset.reconstructionState=result.reconstruction_state||'';
        response.dataset.executionKind=evidenceKind(result);
        if(result.source_observation===true)response.dataset.sourceObservation='true';
        if(result.source_provider)response.dataset.sourceProvider=String(result.source_provider);
      }
      if(result.attachment_hash)response.dataset.attachmentHash=result.attachment_hash;
      if(result.transcription_state)response.dataset.transcriptionState=result.transcription_state;
    }catch(_error){
      pending.remove();
      if(_error?.code==='UNREGISTERED_LLM_LIMIT_REACHED'||_error?.message==='UNREGISTERED_LLM_LIMIT_REACHED'){
        append('system','You have used the 10-question unregistered allowance on this device. Register this device to continue with model-backed Ecosystem Chat.');
        await refreshNodeStatus();
      }else{
        append('system',mathImage
          ? 'I could not admit that image through the governed Math intake just now. The image was not treated as mathematical source text.'
          : 'I could not complete that conversation locally just now. Please try again.');
      }
    }
  });
  refreshNodeStatus();
})();
