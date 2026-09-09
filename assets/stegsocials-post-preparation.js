(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsPreparation=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  var SCHEMA="stegverse.stegsocials.post-preparation/v1";
  var TASK_ID="SS-EVIDENCE-COMPARISON-001";
  var PLATFORM_DIR={LINKEDIN:"LinkedIn",FACEBOOK:"Facebook",INSTAGRAM:"Instagram",X:"X",OTHER:"Other"};
  var MANUAL_PLANS=["PREPARE_ONLY","MANUAL"];
  var AUTOMATED_PLANS=["AUTOMATED","SCHEDULED"];
  var SECRET_PARTS=["password","secret","token","private_key","oauth","cookie","api_key","credential"];

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function slug(v){
    var s=String(v||"").trim().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^[-._]+|[-._]+$/g,"");
    return s||"draft";
  }
  function containsSecretKey(value,path){
    path=path||"$";
    if(Array.isArray(value)){
      for(var i=0;i<value.length;i++){var a=containsSecretKey(value[i],path+"["+i+"]");if(a)return a;}
      return null;
    }
    if(!value||typeof value!=="object")return null;
    var keys=Object.keys(value);
    for(var j=0;j<keys.length;j++){
      var key=keys[j], lower=key.toLowerCase();
      if(SECRET_PARTS.some(function(part){return lower.indexOf(part)!==-1;})) return path+"."+key;
      var found=containsSecretKey(value[key],path+"."+key); if(found)return found;
    }
    return null;
  }
  function pseudoId(input){
    var s=[input.platform,input.erl_ref,input.body,input.evidence_bundle_ref||""].join("\u241f");
    var h=2166136261;
    for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return "ssprep_site_"+(h>>>0).toString(16).padStart(8,"0");
  }
  function normalizePlatform(v){var p=String(v||"").trim().toUpperCase();if(!PLATFORM_DIR[p])throw new Error("Unsupported platform");return p;}

  function build(input){
    input=clone(input||{});
    var secret=containsSecretKey(input);if(secret)throw new Error("Credential/secret-like material is prohibited at "+secret);
    var platform=normalizePlatform(input.platform);
    var body=String(input.body||"").trim();if(!body)throw new Error("Draft body is required");
    var erlRef=String(input.erl_ref||"").trim();if(!erlRef)throw new Error("ERL reference is required");
    if(erlRef.indexOf("02_Research/ERL/")!==0)throw new Error("ERL reference must remain inside the ERL lane");
    var tier=String(input.tier||"STANDARD").toUpperCase();if(tier!=="STANDARD"&&tier!=="PREMIUM")throw new Error("Unsupported tier");
    var plan=String(input.publication_plan||"MANUAL").toUpperCase();
    if(MANUAL_PLANS.indexOf(plan)===-1&&AUTOMATED_PLANS.indexOf(plan)===-1)throw new Error("Unsupported publication plan");
    var entitled=input.automated_posting_entitled===true;
    if(tier==="STANDARD"&&entitled)throw new Error("STANDARD tier cannot claim automated posting entitlement");
    if(AUTOMATED_PLANS.indexOf(plan)!==-1&&!(tier==="PREMIUM"&&entitled))throw new Error("Automated or scheduled publication requires premium entitlement");
    var id=pseudoId({platform:platform,erl_ref:erlRef,body:body,evidence_bundle_ref:input.evidence_bundle_ref});
    return {
      schema:SCHEMA,
      bundle_id:id,
      task_id:TASK_ID,
      kv_context:{
        kv_instance_ref:String(input.kv_instance_ref||"KV_CURRENT"),
        draft_path:"02_Research/StegSocials/Drafts/"+PLATFORM_DIR[platform]+"/"+slug(input.draft_name||id)+".json",
        erl_refs:[{ref:erlRef,authority:"ERL",sha256:input.erl_sha256||null}]
      },
      target:{platform:platform,account_ref:input.account_ref||null,surface_ref:input.surface_ref||null},
      content:{
        title:input.title||null,
        body:body,
        hashtags:Array.isArray(input.hashtags)?input.hashtags.slice():[],
        media_refs:Array.isArray(input.media_refs)?input.media_refs.slice():[],
        source_links:Array.isArray(input.source_links)?input.source_links.slice():[]
      },
      provenance:{
        evidence_bundle_ref:String(input.evidence_bundle_ref||"UNRESOLVED_POST_SPECIFIC_EVIDENCE"),
        claim_comparison_ref:input.claim_comparison_ref||null,
        source_refs:Array.isArray(input.source_refs)?input.source_refs.slice():[erlRef]
      },
      entitlement:{tier:tier,automated_posting_entitled:entitled},
      publication_plan:plan,
      execution:{provider_call_performed:false,credential_material_present:false,publication_authority_effect:"NONE_PREPARATION_ONLY"}
    };
  }

  function platformGuidance(platform){
    platform=normalizePlatform(platform);
    var guidance={
      LINKEDIN:{label:"LinkedIn",soft_limit:3000},
      FACEBOOK:{label:"Facebook",soft_limit:null},
      INSTAGRAM:{label:"Instagram",soft_limit:2200},
      X:{label:"X",soft_limit:280},
      OTHER:{label:"Other",soft_limit:null}
    };
    return clone(guidance[platform]);
  }

  return {SCHEMA:SCHEMA,TASK_ID:TASK_ID,build:build,platformGuidance:platformGuidance,containsSecretKey:containsSecretKey};
}));