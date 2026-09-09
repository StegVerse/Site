(() => {
  'use strict';

  const FALLBACK_TRACKS = [
    {index:0,id:'stegdj-night-drive',title:'Night Drive Boundary',energy:58,brightness:34,bass:78,exploration:36,bpm:96},
    {index:1,id:'stegdj-low-orbit',title:'Low Orbit Relay',energy:42,brightness:24,bass:84,exploration:24,bpm:78},
    {index:2,id:'stegdj-signal-rise',title:'Signal Rise',energy:72,brightness:52,bass:66,exploration:58,bpm:112},
    {index:3,id:'stegdj-black-glass',title:'Black Glass Highway',energy:68,brightness:28,bass:88,exploration:44,bpm:104},
    {index:4,id:'stegdj-slow-telemetry',title:'Slow Telemetry',energy:34,brightness:20,bass:76,exploration:16,bpm:72},
    {index:5,id:'stegdj-redline-signal',title:'Redline Signal',energy:88,brightness:72,bass:64,exploration:62,bpm:124}
  ];
  const tracks = () => {
    const runtimeTracks = window.StegMusicRuntime?.getTracks?.();
    if (!Array.isArray(runtimeTracks) || runtimeTracks.length < 6) return FALLBACK_TRACKS;
    return runtimeTracks.map((track,index) => ({
      index,
      id:track.id,
      title:track.title,
      energy:Number(track.energy),
      brightness:Number(track.brightness),
      bass:Number(track.bass),
      exploration:Number(track.exploration ?? 32),
      bpm:Number(track.bpm)
    }));
  };
  const INTENT_TARGETS = {
    fine_tune:{energy:58,brightness:38,bass:72,exploration:34},
    stay_alert:{energy:76,brightness:50,bass:64,exploration:42},
    focus:{energy:54,brightness:30,bass:74,exploration:18},
    settle:{energy:34,brightness:22,bass:76,exploration:12},
    explore:{energy:62,brightness:48,bass:66,exploration:78}
  };
  const MODEL_KEY = 'stegmusic.trait-model.v1';
  const TRANSITION_KEY = 'stegmusic.transition-model.v1';
  const $ = id => document.getElementById(id);
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const parse = (value,fallback) => { try { return JSON.parse(value); } catch (_) { return fallback; } };
  const emit = (type,human,governed) => window.dispatchEvent(new CustomEvent('stegmusic:emit',{detail:{type,human,governed}}));

  let model = parse(localStorage.getItem(MODEL_KEY),{version:4,observations:0,targets:{energy:58,brightness:38,bass:72,exploration:32},last_selection:null,last_transition:null});
  let transitionModel = parse(localStorage.getItem(TRANSITION_KEY),{version:1,observations:0,pairs:{},last_outcome:null});

  function observedControls(){
    return {energy:Number($('energy').value),brightness:Number($('brightness').value),bass:Number($('bass').value),exploration:Number($('exploration').value)};
  }
  function persist(){
    localStorage.setItem(MODEL_KEY,JSON.stringify(model));
    localStorage.setItem(TRANSITION_KEY,JSON.stringify(transitionModel));
  }
  function activeTrackId(){
    const active=window.StegMusicRuntime?.getCurrentTrack?.();
    return active?.id || model.last_selection;
  }
  function syncActiveSelection(){
    const activeId=activeTrackId();
    if(activeId&&model.last_selection!==activeId){model.last_selection=activeId;persist();}
    return activeId;
  }
  function updateModel(reason){
    const observed=observedControls(),intent=INTENT_TARGETS[$('sessionIntent').value]||INTENT_TARGETS.fine_tune,weight=model.observations?.28:.55;
    for(const key of Object.keys(observed)){
      const blended=observed[key]*.7+intent[key]*.3;
      model.targets[key]=Math.round(clamp(model.targets[key]*(1-weight)+blended*weight,0,100));
    }
    model.version=4;model.observations+=1;model.updated_at=new Date().toISOString();model.last_reason=reason;persist();renderModel();
  }
  function preferenceFit(track){
    const weights={energy:1.2,brightness:.9,bass:1.1,exploration:1};let distance=0;
    for(const key of Object.keys(weights))distance+=Math.abs(track[key]-model.targets[key])*weights[key];
    return Math.max(0,100-distance/3.2);
  }
  function transitionPair(fromId,toId){return `${fromId||'session-start'}->${toId}`;}
  function transitionOutcomeAdjustment(track){
    const pair=transitionModel.pairs[transitionPair(model.last_selection,track.id)];
    if(!pair)return 0;
    return clamp(pair.accepted*4+pair.completed*3+pair.replayed*2-pair.skipped*6,-18,18);
  }
  function transitionFit(track){
    if(!model.last_selection)return 72;
    const previous=tracks().find(x=>x.id===model.last_selection);if(!previous)return 72;
    const bpmDistance=Math.abs(previous.bpm-track.bpm),energyDistance=Math.abs(previous.energy-track.energy),brightnessDistance=Math.abs(previous.brightness-track.brightness);
    return Math.max(0,100-(bpmDistance*1.15+energyDistance*.65+brightnessDistance*.45));
  }
  function score(track){
    const preference=preferenceFit(track),transition=transitionFit(track),outcomeAdjustment=transitionOutcomeAdjustment(track),samePenalty=model.last_selection===track.id?1000:0;
    const total=preference*.68+transition*.24+outcomeAdjustment-samePenalty;
    return{total:Math.max(0,total),preference,transition,outcomeAdjustment,samePenalty};
  }
  function rank(){return tracks().map(track=>({...track,...score(track)})).sort((a,b)=>b.total-a.total);}
  function renderTransitionModel(){
    const target=$('transitionLearningState');if(!target)return;
    target.textContent=JSON.stringify({model_version:transitionModel.version,observations:transitionModel.observations,last_outcome:transitionModel.last_outcome,pairs:transitionModel.pairs,profile_scoped:true,authority:'none'},null,2);
  }
  function renderModel(){
    const target=$('adaptiveModel');if(!target)return;const ranked=rank();
    target.textContent=JSON.stringify({model_version:model.version,observations:model.observations,learned_targets:model.targets,current_intent:$('sessionIntent').value,last_selection:model.last_selection,last_transition:model.last_transition,candidate_count:ranked.length,registry_backed:ranked.length>=6,ranked_candidates:ranked.map(x=>({track_id:x.id,title:x.title,total_score:Number(x.total.toFixed(2)),preference_fit:Number(x.preference.toFixed(2)),transition_fit:Number(x.transition.toFixed(2)),learned_outcome_adjustment:x.outcomeAdjustment,repeat_penalty:x.samePenalty})),local_only:true,authority:'none'},null,2);
    $('adaptiveRecommendation').textContent=ranked.length?`Recommended next: ${ranked[0].title} · total ${ranked[0].total.toFixed(1)}% · preference ${ranked[0].preference.toFixed(1)}% · transition ${ranked[0].transition.toFixed(1)}% · learned ${ranked[0].outcomeAdjustment>=0?'+':''}${ranked[0].outcomeAdjustment}`:'No candidate available.';
    renderTransitionModel();
  }
  function chooseAdaptive(){
    const previous=syncActiveSelection();
    updateModel('adaptive_next_requested');
    const ranked=rank(),next=ranked.find(candidate=>candidate.id!==previous);if(!next)return;
    const decision={from_track_id:previous,to_track_id:next.id,total_score:Number(next.total.toFixed(2)),preference_fit:Number(next.preference.toFixed(2)),transition_fit:Number(next.transition.toFixed(2)),learned_outcome_adjustment:next.outcomeAdjustment,repeat_penalty:next.samePenalty,active_track_excluded:true,candidate_count:ranked.length,registry_backed:ranked.length>=6,model_version:model.version,transition_model_version:transitionModel.version,session_intent:$('sessionIntent').value,authority:'none'};
    model.last_selection=next.id;model.last_transition=decision;persist();
    emit('adaptive_selection_decision',`StegDJ recommended “${next.title}” from ${ranked.length} ranked tracks.`,{rights_status:'stegdj_generated_local_prototype',source_class:'adaptive_local_model',captured_records:[{requested_action:'adaptive_next',current_controls:observedControls(),session_intent:$('sessionIntent').value,previous_track_id:previous,candidate_track_ids:ranked.map(x=>x.id)}],derived_records:[decision,...ranked.filter(x=>x.id!==next.id).map(x=>({rejected_candidate:x.id,total_score:Number(x.total.toFixed(2))}))],contribution_eligibility:'candidate',royalty_state:'not_realized',artifact_refs:[next.id],policy_refs:['stegdj-adaptive-selection-v3','stegdj-six-track-registry-v1','stegdj-active-track-exclusion-v1','stegdj-transition-outcome-learning-v1','governed-service-envelope-v0']});
    window.StegMusicRuntime?.selectGeneratedTrack?.(next.index,{reason:'adaptive_selection',details:{adaptive_decision:decision}});
    $('adaptiveRecommendation').textContent=`Selected ${next.title} from ${ranked.length} candidates: preference ${next.preference.toFixed(1)}%, transition ${next.transition.toFixed(1)}%, learned adjustment ${next.outcomeAdjustment>=0?'+':''}${next.outcomeAdjustment}.`;renderModel();
  }
  function recordTransitionOutcome(outcome){
    const transition=model.last_transition;
    if(!transition||!transition.to_track_id){$('transitionLearningNotice').textContent='TRANSITION LEARNING · choose Adaptive next before rating a transition';return;}
    const pairId=transitionPair(transition.from_track_id,transition.to_track_id);
    const stats=transitionModel.pairs[pairId]||{from_track_id:transition.from_track_id||null,to_track_id:transition.to_track_id,accepted:0,skipped:0,replayed:0,completed:0};
    stats[outcome]=(stats[outcome]||0)+1;stats.updated_at=new Date().toISOString();transitionModel.pairs[pairId]=stats;transitionModel.observations+=1;
    transitionModel.last_outcome={pair_id:pairId,outcome,recorded_at:stats.updated_at};persist();
    emit('transition_outcome_recorded',`Recorded transition outcome: ${outcome}.`,{rights_status:'stegdj_generated_local_prototype',source_class:'browser_local_transition_model',captured_records:[{pair_id:pairId,from_track_id:stats.from_track_id,to_track_id:stats.to_track_id,outcome,session_intent:$('sessionIntent').value}],derived_records:[{updated_pair_stats:stats,future_ranking_adjustment:transitionOutcomeAdjustment(tracks().find(t=>t.id===stats.to_track_id)||tracks()[0]),model_scope:'active_isolated_profile',authority:'none'}],contribution_eligibility:'candidate',royalty_state:'prototype_estimate_only',policy_refs:['stegdj-transition-outcome-learning-v1','governed-service-envelope-v0']});
    $('transitionLearningNotice').textContent=`TRANSITION LEARNING · ${outcome.toUpperCase()} recorded for ${pairId}`;
    if(outcome==='replayed'){const track=tracks().find(t=>t.id===stats.to_track_id);if(track)window.StegMusicRuntime?.selectGeneratedTrack?.(track.index,{reason:'transition_replay'});}
    if(outcome==='skipped')window.setTimeout(chooseAdaptive,0);
    renderModel();
  }
  function installTransitionControls(){
    const adaptive=$('adaptiveModel');if(!adaptive||$('transitionLearningControls'))return;
    const section=document.createElement('div');section.id='transitionLearningControls';section.className='inspection';section.setAttribute('aria-labelledby','transition-learning-heading');
    section.innerHTML='<h3 id="transition-learning-heading">Transition outcome learning</h3><p class="muted">Rate the most recent Adaptive next transition. Outcomes stay inside the active isolated profile and alter later ranking only as bounded evidence.</p><div class="feedback-row" role="group" aria-label="Transition outcome controls"><button class="sv-btn sv-btn-secondary" type="button" data-transition-outcome="accepted">Accept transition</button><button class="sv-btn sv-btn-secondary" type="button" data-transition-outcome="skipped">Skip / poor fit</button><button class="sv-btn sv-btn-secondary" type="button" data-transition-outcome="replayed">Replay track</button><button class="sv-btn sv-btn-secondary" type="button" data-transition-outcome="completed">Mark segment complete</button></div><div class="status pending" id="transitionLearningNotice" role="status" aria-live="polite">TRANSITION LEARNING · waiting for Adaptive next</div><pre id="transitionLearningState" tabindex="0"></pre>';
    adaptive.parentElement.appendChild(section);
    section.querySelectorAll('[data-transition-outcome]').forEach(button=>button.addEventListener('click',()=>recordTransitionOutcome(button.dataset.transitionOutcome)));
  }

  $('adaptiveNext').addEventListener('click',chooseAdaptive);
  $('sessionIntent').addEventListener('change',()=>{updateModel('session_intent_changed');renderModel();});
  document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',()=>window.setTimeout(()=>updateModel(`feedback:${button.dataset.feedback}`),0)));
  $('applyFeedback').addEventListener('click',()=>window.setTimeout(()=>updateModel('free_text_feedback'),0));
  ['energy','brightness','bass','exploration'].forEach(id=>$(id).addEventListener('change',()=>updateModel(`control:${id}`)));
  $('resetAdaptiveModel').addEventListener('click',()=>{model={version:4,observations:0,targets:{energy:58,brightness:38,bass:72,exploration:32},last_selection:null,last_transition:null,reset_at:new Date().toISOString()};transitionModel={version:1,observations:0,pairs:{},last_outcome:null};persist();emit('adaptive_model_reset','Reset the browser-local StegDJ adaptive and transition models.',{rights_status:'not_applicable',source_class:'browser_local_model',captured_records:[{reset_at:model.reset_at}],derived_records:[{future_ranking_state:'default_targets',transition_outcomes_cleared:true,historical_governed_events_preserved:true}],contribution_eligibility:'not_evaluated'});renderModel();});
  syncActiveSelection();installTransitionControls();renderModel();
  window.StegDJTransitionLearning=Object.freeze({recordTransitionOutcome,storage_key:TRANSITION_KEY,profile_scoped:true,registry_backed:true,candidate_count:tracks().length,active_track_exclusion:true,authority:'none'});
})();