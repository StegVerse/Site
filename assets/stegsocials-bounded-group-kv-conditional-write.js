(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsBoundedGroupKVConditionalWrite=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var STATE_SCHEMA="stegsocials.bounded-post-group-use-state.v1";
  var STATE_ROOT="03_Records/StegSocials/PostGroupState/";
  var HASH_RE=/^sha256:[0-9a-f]{64}$/;
  var SECRET_PARTS=["password","secret","token","private_key","oauth","cookie","api_key","credential","refresh_token","access_token"];

  function fail(message){throw new Error("FAIL_CLOSED: "+message);}
  function requireValue(ok,message){if(!ok)fail(message);}
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function canon(value){
    if(value===null||typeof value!=="object") return JSON.stringify(value);
    if(Array.isArray(value)) return "["+value.map(canon).join(",")+"]";
    return "{"+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+":"+canon(value[key]);}).join(",")+"}";
  }
  function containsForbiddenKey(value,path){
    path=path||"$";
    if(Array.isArray(value)){
      for(var i=0;i<value.length;i++){var nested=containsForbiddenKey(value[i],path+"["+i+"]");if(nested)return nested;}
      return null;
    }
    if(!value||typeof value!=="object") return null;
    var keys=Object.keys(value);
    for(var j=0;j<keys.length;j++){
      var key=keys[j],lower=String(key).toLowerCase();
      if(SECRET_PARTS.some(function(part){return lower===part||lower.indexOf(part)>=0;})) return path+"."+key;
      var child=containsForbiddenKey(value[key],path+"."+key);if(child)return child;
    }
    return null;
  }
  function validateState(state){
    requireValue(state&&typeof state==="object"&&!Array.isArray(state),"bounded group state required");
    requireValue(state.schema_version===STATE_SCHEMA,"bounded group state schema invalid");
    requireValue(/^post-group-[a-z0-9][a-z0-9._-]{2,127}$/.test(String(state.group_id||"")),"bounded group id invalid");
    requireValue(["ACTIVE","REVOKED","EXHAUSTED","EXPIRED"].indexOf(state.state)>=0,"bounded group state invalid");
    requireValue(/^kv:\/\/personal\/StegSocials\/PostGroupState\/[a-zA-Z0-9._/-]+$/.test(String(state.state_ref||"")),"bounded group state_ref invalid");
    requireValue(Array.isArray(state.consumed_use_indices),"consumed use indices required");
    var seen={};state.consumed_use_indices.forEach(function(index){
      requireValue(Number.isInteger(index)&&index>=1,"consumed use index invalid");
      requireValue(!seen[index],"consumed use index duplicate");seen[index]=true;
    });
    requireValue(Number.isInteger(state.successful_posts)&&state.successful_posts>=0,"successful_posts invalid");
    requireValue(state.successful_posts===state.consumed_use_indices.length,"successful_posts/use-index count mismatch");
    requireValue(state.last_successful_at===null||!Number.isNaN(Date.parse(state.last_successful_at)),"last_successful_at invalid");
    requireValue(typeof state.observed_at==="string"&&!Number.isNaN(Date.parse(state.observed_at)),"observed_at invalid");
    var forbidden=containsForbiddenKey(state);requireValue(!forbidden,"secret-like field prohibited at "+forbidden);
    return clone(state);
  }
  function statePath(groupId){
    requireValue(/^post-group-[a-z0-9][a-z0-9._-]{2,127}$/.test(String(groupId||"")),"bounded group id invalid");
    return STATE_ROOT+groupId+".json";
  }
  function hex(buffer){return Array.prototype.map.call(new Uint8Array(buffer),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function sha256Text(text){
    requireValue(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function","WebCrypto SHA-256 unavailable");
    return root.crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)).then(function(digest){return "sha256:"+hex(digest);});
  }
  function stateEtag(state){return sha256Text(canon(validateState(state))+"\n");}
  function buildRequest(currentState,nextState,expectedEtag,publicationProof){
    var current=validateState(currentState),next=validateState(nextState);
    requireValue(HASH_RE.test(String(expectedEtag||"")),"expected state etag invalid");
    requireValue(current.group_id===next.group_id&&current.state_ref===next.state_ref,"bounded group identity mutation prohibited");
    requireValue(next.successful_posts===current.successful_posts+1,"bounded group state must consume exactly one successful post");
    requireValue(next.consumed_use_indices.length===current.consumed_use_indices.length+1,"bounded group use-state must add exactly one index");
    current.consumed_use_indices.forEach(function(index){requireValue(next.consumed_use_indices.indexOf(index)>=0,"previously consumed use index removed");});
    requireValue(publicationProof&&publicationProof.publication_proven===true,"proven publication required before state commit");
    requireValue(typeof publicationProof.publication_receipt_ref==="string"&&publicationProof.publication_receipt_ref,"publication receipt ref required");
    requireValue(HASH_RE.test(String(publicationProof.final_content_hash||"")),"publication content hash invalid");
    requireValue(publicationProof.session_state_destroyed===true,"terminal StegBrowser destruction proof required");
    requireValue(publicationProof.credential_material_present===false,"credential material may not enter state commit");
    var added=next.consumed_use_indices.filter(function(index){return current.consumed_use_indices.indexOf(index)<0;});
    requireValue(added.length===1,"exactly one new use index required");
    return stateEtag(current).then(function(actual){
      requireValue(actual===expectedEtag,"expected etag does not match supplied current state");
      return stateEtag(next).then(function(nextEtag){
        return {
          schema:"stegverse.site.stegsocials-bounded-group-kv-conditional-write/v1",
          operation:"COMPARE_AND_SWAP",
          task_id:"SS-KV-SKAP-SOCIAL-RELEASE-001",
          canonical_path:statePath(current.group_id),
          group_id:current.group_id,
          state_ref:current.state_ref,
          expected_previous_etag:expectedEtag,
          next_state_etag:nextEtag,
          consumed_use_index:added[0],
          next_state:next,
          publication_proof:{
            publication_receipt_ref:publicationProof.publication_receipt_ref,
            final_content_hash:publicationProof.final_content_hash,
            session_state_destroyed:true,
            credential_material_present:false
          },
          request_grants_execution_authority:false,
          provider_operation_authorized:false,
          credential_material_present:false,
          authority_effect:"NONE_STATE_TRANSITION_REQUEST_ONLY"
        };
      });
    });
  }
  function executeConditionalWrite(transaction,request){
    requireValue(transaction&&typeof transaction==="function","conditional-write transaction adapter required");
    requireValue(request&&request.schema==="stegverse.site.stegsocials-bounded-group-kv-conditional-write/v1","conditional-write request invalid");
    return transaction({
      canonical_path:request.canonical_path,
      expected_previous_etag:request.expected_previous_etag,
      next_state:clone(request.next_state),
      next_state_etag:request.next_state_etag
    }).then(function(result){
      requireValue(result&&result.committed===true,"conditional-write was not committed");
      requireValue(result.previous_etag===request.expected_previous_etag,"conditional-write previous etag mismatch");
      requireValue(result.persisted_etag===request.next_state_etag,"conditional-write persisted etag mismatch");
      requireValue(result.exact_readback_verified===true,"conditional-write exact readback not verified");
      requireValue(result.credential_material_present===false,"conditional-write result contains credential material");
      return {
        schema:"stegverse.site.stegsocials-bounded-group-kv-conditional-write-result/v1",
        state:"GROUP_USE_STATE_COMMITTED",
        group_id:request.group_id,
        canonical_path:request.canonical_path,
        consumed_use_index:request.consumed_use_index,
        previous_etag:result.previous_etag,
        persisted_etag:result.persisted_etag,
        exact_readback_verified:true,
        publication_receipt_ref:request.publication_proof.publication_receipt_ref,
        credential_material_present:false,
        authority_effect:"NONE_EVIDENCE_ONLY"
      };
    });
  }

  return Object.freeze({
    state_root:STATE_ROOT,
    validateState:validateState,
    statePath:statePath,
    stateEtag:stateEtag,
    buildRequest:buildRequest,
    executeConditionalWrite:executeConditionalWrite
  });
}));