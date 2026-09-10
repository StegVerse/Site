"use strict";

(function(root){
  var PACKAGE_SCHEMA="stegverse.org-allocator-portable-package/v1";
  var STATE_SCHEMA="stegverse.org-allocator-portable-state/v1";
  var RECEIPT_SCHEMA="stegverse.org-allocator-portable-receipt/v1";
  var OBS_SCHEMA="stegverse.org-claim-grant-observation/v1";
  var PRIORITY={security:0,release:1,critical:2,elevated:3,normal:4};
  var MUTABLE_MODES={shared_write:true,scoped_exclusive:true,repository_exclusive:true};

  function fail(reason){throw new Error("FAIL_CLOSED: "+reason);}
  function canonicalize(value){
    if(value===null||typeof value!=="object"){return JSON.stringify(value);}
    if(Array.isArray(value)){return "["+value.map(canonicalize).join(",")+"]";}
    return "{"+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+":"+canonicalize(value[k]);}).join(",")+"}";
  }
  function bytesToHex(bytes){var out="";for(var i=0;i<bytes.length;i+=1){out+=bytes[i].toString(16).padStart(2,"0");}return out;}
  function sha256Hex(value){
    var text=typeof value==="string"?value:canonicalize(value);
    return crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)).then(function(d){return bytesToHex(new Uint8Array(d));});
  }
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function dependencySurfaces(claim){
    var values=((claim||{}).scope||{}).dependency_surfaces||[];
    var set={}; values.forEach(function(v){var s=String(v||"").trim().toLowerCase();if(s){set[s]=true;}});
    return Object.keys(set);
  }
  function surfaces(claim){
    var scope=(claim||{}).scope||{}, result={};
    ["paths","contracts","release_surfaces","capabilities","workflows"].forEach(function(key){
      (scope[key]||[]).forEach(function(v){result[key+"|"+String(v)]=true;});
    });
    return Object.keys(result);
  }
  function intersects(a,b){var s={};a.forEach(function(v){s[v]=true;});return b.some(function(v){return !!s[v];});}
  function dependencyDeclarationPresent(claim){
    if(!MUTABLE_MODES[claim.mode]){return true;}
    var scope=claim.scope||{};
    return dependencySurfaces(claim).length>0||String(scope.dependency_surface_exempt||"").trim().length>0;
  }
  function conflicts(request,active){
    if(request.mode==="shared_read"&&active.mode==="shared_read"){return false;}
    if(intersects(dependencySurfaces(request),dependencySurfaces(active))&&(MUTABLE_MODES[request.mode]||MUTABLE_MODES[active.mode])){return true;}
    if(request.repository.full_name!==active.repository.full_name){return false;}
    if(request.mode==="repository_exclusive"||active.mode==="repository_exclusive"){return true;}
    if(request.mode==="shared_read"&&active.mode==="shared_read"){return false;}
    return intersects(surfaces(request),surfaces(active));
  }
  function dependenciesComplete(task,tasks){
    return (task.dependencies||[]).every(function(id){return tasks[id]&&tasks[id].status==="completed";});
  }
  function taskClaimsAdmissible(task){
    var mandatory=((task.requirements||{}).mandatory)||[];
    return mandatory.length>0&&mandatory.every(dependencyDeclarationPresent);
  }
  function stamp(ms){
    var d=new Date(Math.floor(ms/1000)*1000);
    if(Number.isNaN(d.getTime())){fail("invalid allocation time");}
    return d.toISOString().replace(".000Z","Z");
  }
  function validatePackage(pkg){
    if(!pkg||pkg.schema!==PACKAGE_SCHEMA){fail("portable allocator package schema mismatch");}
    if(pkg.canonical_authority_owner!=="StegVerse-Labs/.github organization allocator"){fail("canonical allocator owner mismatch");}
    if(pkg.execution_surface!=="CURRENT_USER_IPHONE"){fail("same-device execution surface required");}
    if(pkg.credential_authority!=="TV/TVC"||pkg.github_token_runtime_authority!=="NONE"){fail("credential/runtime boundary drift");}
    if(pkg.heartbeat_grants_claim_authority!==false||pkg.request_grants_claim_authority!==false||pkg.stegos_grants_claim_authority!==false){fail("claim authority widening");}
    if(pkg.requires_other_machine!==false||pkg.second_user_operated_device_required!==false||pkg.always_on_external_host_required!==false){fail("other-machine dependency prohibited");}
    var source=pkg.source_binding||{};
    var exact={
      allocator_git_blob_sha:"7c0105c8529b682c24a94b39ba31a8ca574c3717",
      task_0007_git_blob_sha:"a5fd4662b2a370e8a86099c943b8d1ec18b93e19",
      task_0008_git_blob_sha:"f534167633c867bbee6b397ae345b10ed502aa2b",
      claims_git_blob_sha:"9e7eaf9cb1319dd570714a0c1806d7173a7ba7ff",
      queue_git_blob_sha:"6cab961c8750495dab36d1a523980516b1ac3a5e"
    };
    Object.keys(exact).forEach(function(k){if(source[k]!==exact[k]){fail("source binding mismatch: "+k);}});
    var successor9Sha=source.task_0009_git_blob_sha;
    var successor10Sha=source.task_0010_git_blob_sha;
    if(successor9Sha!==undefined&&successor9Sha!=="eeb661ca59f305ce8a86c2f46adced37056baec8"){fail("source binding mismatch: task_0009_git_blob_sha");}
    if(successor10Sha!==undefined&&successor10Sha!=="bd67e9e6f289a388e4836e844a5f8ff7eaacccca"){fail("source binding mismatch: task_0010_git_blob_sha");}
    if(!Array.isArray(pkg.tasks)||(pkg.tasks.length<2||pkg.tasks.length>4)){fail("portable allocator current task package mismatch");}
    var ids=pkg.tasks.map(function(t){return t.task_id;}).sort().join("|");
    var predecessorIds="TASK-2026-0007|TASK-2026-0008";
    var successor9Ids="TASK-2026-0007|TASK-2026-0008|TASK-2026-0009";
    var successor10Ids="TASK-2026-0007|TASK-2026-0008|TASK-2026-0009|TASK-2026-0010";
    if(ids!==predecessorIds&&ids!==successor9Ids&&ids!==successor10Ids){fail("portable allocator task identities mismatch");}
    if((ids===successor9Ids||ids===successor10Ids)&&successor9Sha===undefined){fail("TASK-2026-0009 source binding required");}
    if(ids===successor10Ids&&successor10Sha===undefined){fail("TASK-2026-0010 source binding required");}
    if(ids!==successor10Ids&&successor10Sha!==undefined){fail("TASK-2026-0010 source binding without task");}
    if(ids===predecessorIds&&successor9Sha!==undefined){fail("TASK-2026-0009 source binding without task");}
    var task7=pkg.tasks.find(function(t){return t.task_id==="TASK-2026-0007";});
    var task8=pkg.tasks.find(function(t){return t.task_id==="TASK-2026-0008";});
    var task9=pkg.tasks.find(function(t){return t.task_id==="TASK-2026-0009";});
    var task10=pkg.tasks.find(function(t){return t.task_id==="TASK-2026-0010";});
    function validateTaskFloor(task,requestedAt,surface){
      if(!task||task.organization!=="StegVerse-Labs"||task.status!=="queued"||task.requested_at!==requestedAt||task.priority_class!=="release"){fail("portable allocator task floor mismatch");}
      if((task.dependencies||[]).length!==0){fail("portable allocator task dependency floor mismatch");}
      var mandatory=((task.requirements||{}).mandatory)||[];
      if(mandatory.length!==1||!mandatory[0].repository||mandatory[0].repository.full_name!=="StegVerse-Labs/Site"){fail("portable allocator task repository floor mismatch");}
      if(dependencySurfaces(mandatory[0]).indexOf(surface)===-1){fail("portable allocator task dependency surface floor mismatch");}
    }
    validateTaskFloor(task7,"2026-08-22T04:39:00Z","site:unified-conversational-capability-contract");
    validateTaskFloor(task8,"2026-09-03T00:28:00Z","site:stegos-de006-bound-inference-publication");
    if(task9){validateTaskFloor(task9,"2026-09-06T13:25:00Z","site:hb31-ecosystem-chat-runtime-opportunity-successor");}
    if(task10){validateTaskFloor(task10,"2026-09-10T00:59:00Z","site:current-iphone-testflight-static-bootstrap");}
    if(pkg.claims_state.schema!=="stegverse.org-claims/v1"||pkg.queue_state.schema!=="stegverse.org-queue/v1"){fail("portable allocator predecessor state schema mismatch");}
    if(pkg.claims_state.generation!==2||!Array.isArray(pkg.claims_state.claims)||pkg.claims_state.claims.length!==0){fail("portable allocator predecessor claim state mismatch");}
    return pkg;
  }
  function initialState(pkg){
    var statuses={};
    pkg.tasks.forEach(function(t){statuses[t.task_id]=t.status;});
    return {
      schema:STATE_SCHEMA,
      portable_authority_epoch:pkg.portable_authority_epoch,
      canonical_authority_owner:pkg.canonical_authority_owner,
      execution_surface:"CURRENT_USER_IPHONE",
      claims_state:clone(pkg.claims_state),
      queue_state:clone(pkg.queue_state),
      task_statuses:statuses,
      allocation_tail_sha256:null,
      last_allocation_receipt:null,
      last_claim_observation:null,
      credential_authority:"TV/TVC",
      heartbeat_grants_claim_authority:false,
      request_grants_claim_authority:false,
      stegos_grants_claim_authority:false,
      requires_other_machine:false,
      authority_effect:"CANONICAL_ORGANIZATION_ALLOCATOR_STATE"
    };
  }
  function effectiveTasks(pkg,state){
    var tasks={};
    pkg.tasks.forEach(function(base){
      var t=clone(base);
      if(state.task_statuses&&state.task_statuses[t.task_id]){t.status=state.task_statuses[t.task_id];}
      tasks[t.task_id]=t;
    });
    return tasks;
  }
  function allocate(pkg,store,options){
    validatePackage(pkg);
    if(!store||typeof store.read!=="function"||typeof store.atomicCompareAndSwap!=="function"){fail("atomic portable allocator store required");}
    var nowMs=options&&Number.isFinite(options.now_ms)?options.now_ms:Date.now();
    return store.read().then(function(existing){
      var state=existing||initialState(pkg);
      if(state.schema!==STATE_SCHEMA||state.portable_authority_epoch!==pkg.portable_authority_epoch){fail("portable allocator state lineage mismatch");}
      if(state.canonical_authority_owner!==pkg.canonical_authority_owner||state.credential_authority!=="TV/TVC"){fail("portable allocator state authority mismatch");}
      if(state.requires_other_machine!==false){fail("portable allocator state violates same-device invariant");}

      var tasks=effectiveTasks(pkg,state);
      var activeClaims=clone((state.claims_state||{}).claims||[]);
      var queued=Object.keys(tasks).map(function(id){return tasks[id];}).filter(function(t){return t.status==="queued"&&dependenciesComplete(t,tasks);});
      queued.sort(function(a,b){
        var pa=PRIORITY[a.priority_class]===undefined?4:PRIORITY[a.priority_class];
        var pb=PRIORITY[b.priority_class]===undefined?4:PRIORITY[b.priority_class];
        if(pa!==pb){return pa-pb;}
        if(a.requested_at!==b.requested_at){return a.requested_at<b.requested_at?-1:1;}
        return a.task_id<b.task_id?-1:(a.task_id>b.task_id?1:0);
      });

      var selected=null,blocked=[];
      for(var i=0;i<queued.length;i+=1){
        var task=queued[i];
        if(!taskClaimsAdmissible(task)){blocked.push(task.task_id);continue;}
        var mandatory=((task.requirements||{}).mandatory)||[];
        var admissible=mandatory.every(function(req){return !activeClaims.some(function(held){return conflicts(req,held);});});
        if(admissible){selected=task;break;}
      }

      var next=clone(state);
      next.queue_state=clone(state.queue_state||pkg.queue_state);
      next.queue_state.generation=Number(next.queue_state.generation||0)+1;
      next.queue_state.updated_at=stamp(nowMs);
      next.queue_state.ordered_task_ids=queued.map(function(t){return t.task_id;});
      next.queue_state.blocked_missing_dependency_declaration=blocked;

      var selectedId=null,granted=[],generation=Number((state.claims_state||{}).generation||0);
      var claimObservation=null;
      if(selected){
        selectedId=selected.task_id;
        generation+=1;
        (((selected.requirements||{}).mandatory)||[]).forEach(function(request){
          var claim=clone(request);
          claim.task_id=selected.task_id;
          claim.lease={
            expires_at:stamp(nowMs+24*60*60*1000),
            heartbeat_due_at:stamp(nowMs+8*60*60*1000),
            fencing_token:generation,
            service_class:"low_contention"
          };
          granted.push(claim);
        });
        next.claims_state=clone(state.claims_state||pkg.claims_state);
        next.claims_state.claims=activeClaims.concat(granted);
        next.claims_state.generation=generation;
        next.claims_state.updated_at=stamp(nowMs);
        next.task_statuses=Object.assign({},state.task_statuses||{});
        next.task_statuses[selected.task_id]="active";
      } else {
        next.claims_state=clone(state.claims_state||pkg.claims_state);
      }

      var receiptBody={
        schema:RECEIPT_SCHEMA,
        state:"ALLOCATION_COMPLETE",
        selected:selectedId,
        queued:next.queue_state.ordered_task_ids,
        blocked_missing_dependency_declaration:blocked,
        claim_registry_generation:next.claims_state.generation,
        granted_claims:granted,
        execution_surface:"CURRENT_USER_IPHONE",
        canonical_authority_owner:"StegVerse-Labs/.github organization allocator",
        credential_authority:"TV/TVC",
        heartbeat_grants_claim_authority:false,
        request_grants_claim_authority:false,
        stegos_grants_claim_authority:false,
        github_token_runtime_authority:"NONE",
        network_source_fetch_performed:false,
        requires_other_machine:false,
        second_user_operated_device_required:false,
        authority_effect:selectedId?"CLAIM_AUTHORITY_ONLY_WHEN_SELECTED_BY_CANONICAL_ALLOCATOR":"NONE"
      };
      return sha256Hex(receiptBody).then(function(receiptHash){
        receiptBody.receipt_sha256="sha256:"+receiptHash;
        if(selectedId){
          var snapshot={task_id:selectedId,claim_registry_generation:generation,claims:granted};
          return sha256Hex(snapshot).then(function(snapshotHash){
            claimObservation={
              schema:OBS_SCHEMA,
              state:"CLAIM_GRANT_OBSERVED",
              task_id:selectedId,
              claim_registry_generation:generation,
              fencing_tokens:granted.map(function(c){return c.lease.fencing_token;}).sort(function(a,b){return a-b;}),
              dependency_surfaces:Array.from(new Set(granted.flatMap(function(c){return dependencySurfaces(c);}))).sort(),
              claims:granted,
              claim_snapshot_sha256:snapshotHash,
              allocator_remains_claim_authority:true,
              observation_grants_claim_authority:false,
              heartbeat_grants_claim_authority:false,
              github_token_required:false,
              network_source_fetch_performed:false,
              credential_authority:"TV/TVC",
              second_machine_required:false,
              execution_surface:"CURRENT_USER_IPHONE",
              authority_effect:"NONE_OBSERVATION_ONLY"
            };
            next.allocation_tail_sha256=receiptBody.receipt_sha256;
            next.last_allocation_receipt=receiptBody;
            next.last_claim_observation=claimObservation;
            return {receipt:receiptBody,observation:claimObservation};
          });
        }
        next.allocation_tail_sha256=receiptBody.receipt_sha256;
        next.last_allocation_receipt=receiptBody;
        next.last_claim_observation=null;
        return {receipt:receiptBody,observation:null};
      }).then(function(result){
        return store.atomicCompareAndSwap(state,next).then(function(committed){
          if(committed!==true){fail("atomic organization allocator CAS lost race or stale state");}
          return {state:next,receipt:result.receipt,claim_observation:result.observation};
        });
      });
    });
  }
  root.StegVersePortableOrgClaimAllocator={
    packageSchema:PACKAGE_SCHEMA,
    stateSchema:STATE_SCHEMA,
    receiptSchema:RECEIPT_SCHEMA,
    canonicalize:canonicalize,
    sha256Hex:sha256Hex,
    validatePackage:validatePackage,
    initialState:initialState,
    allocate:allocate
  };
}(typeof self!=="undefined"?self:globalThis));
