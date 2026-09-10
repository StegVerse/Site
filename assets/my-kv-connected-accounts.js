(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.StegVerseMyKVConnectedAccounts=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  var FORBIDDEN_KEYS=["password","secret","token","private_key","access_token","refresh_token","credential","provider_account_id","raw_provider_id","account_number","routing_number"];

  function clone(value){return JSON.parse(JSON.stringify(value));}

  function assertBounded(value,path){
    path=path||"observation";
    if(Array.isArray(value)){value.forEach(function(item,index){assertBounded(item,path+"["+index+"]");});return;}
    if(!value||typeof value!=="object")return;
    Object.keys(value).forEach(function(key){
      var lower=key.toLowerCase();
      if(FORBIDDEN_KEYS.some(function(part){return lower.indexOf(part)!==-1;}))throw new Error("FAIL_CLOSED: secret or raw provider identifier prohibited at "+path+"."+key);
      assertBounded(value[key],path+"."+key);
    });
  }

  function normalizeObservation(item){
    if(!item||typeof item!=="object")throw new Error("FAIL_CLOSED: provider account observation must be an object");
    assertBounded(item);
    var provider=String(item.provider||item.provider_org_ref||"").trim().toLowerCase().replace(/^org:/,"");
    var accountRef=String(item.account_ref||item.account_key||"").trim();
    var label=String(item.label||item.display_name||provider||"Connected account").trim();
    var accountClass=String(item.account_class||"other").trim().toLowerCase();
    if(!provider||!accountRef)throw new Error("FAIL_CLOSED: bounded provider and account reference required");
    if(!/^[-a-z0-9._]+$/.test(provider))throw new Error("FAIL_CLOSED: provider reference invalid");
    if(!/^[-a-zA-Z0-9._:/]+$/.test(accountRef))throw new Error("FAIL_CLOSED: account reference invalid");
    return {provider_org_ref:"org:"+provider,account_ref:accountRef,label:label,account_class:accountClass,status:String(item.status||"UNKNOWN").toUpperCase()};
  }

  function discover(bridge){
    if(!bridge||typeof bridge.listObservedAccounts!=="function")return Promise.reject(new Error("FAIL_CLOSED: provider account observation bridge unavailable"));
    return Promise.resolve(bridge.listObservedAccounts({schema:"stegverse.site.my-kv.connected-account-observation-request/v1",minimum_necessary:true,include_secrets:false,include_raw_provider_ids:false})).then(function(result){
      assertBounded(result,"result");
      if(!result||!Array.isArray(result.accounts))throw new Error("FAIL_CLOSED: bounded account observations were not returned");
      return result.accounts.map(normalizeObservation);
    });
  }

  function populate(selected,bridge){
    if(!Array.isArray(selected)||!selected.length)return Promise.reject(new Error("Select at least one account"));
    if(!bridge||typeof bridge.populateSelectedAccountMetadata!=="function")return Promise.reject(new Error("FAIL_CLOSED: SKAP account metadata population bridge unavailable"));
    var accounts=selected.map(normalizeObservation);
    return Promise.resolve(bridge.populateSelectedAccountMetadata({
      schema:"stegverse.site.my-kv.connected-account-population-request/v1",
      accounts:accounts,
      destination:"SKAP_NONSECRET_ACCOUNT_METADATA",
      synthetic_input_allowed:false,
      raw_provider_identifiers_present:false,
      credential_material_present:false
    })).then(function(result){
      assertBounded(result,"population_result");
      if(!result||result.accepted!==true)throw new Error("FAIL_CLOSED: selected account metadata was not admitted");
      return clone(result);
    });
  }

  return {assertBounded:assertBounded,normalizeObservation:normalizeObservation,discover:discover,populate:populate};
}));