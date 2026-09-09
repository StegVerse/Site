(function(root,factory){
  "use strict";
  var api=factory(root||{});
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.StegVerseStegSocialsERLDraftAssistant=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  var DB_NAME="stegverse-device-local-intr-v1";
  var DB_VERSION=1;
  var STORE="kv_files";
  var ERL_ROOT="02_Research/ERL/";
  var MAX_BYTES=1024*1024;
  var PLATFORM_LIMIT={LINKEDIN:3000,FACEBOOK:5000,INSTAGRAM:2200,X:280,OTHER:5000};

  function requireValue(ok,message){if(!ok)throw new Error("FAIL_CLOSED: "+message);}
  function normalizePlatform(value){var p=String(value||"").trim().toUpperCase();requireValue(PLATFORM_LIMIT[p],"unsupported social platform");return p;}
  function normalizeRef(ref){
    ref=String(ref||"").trim();
    requireValue(ref.indexOf(ERL_ROOT)===0,"ERL reference must remain inside the ERL lane");
    requireValue(ref.indexOf("..")===-1&&ref.indexOf("\\")===-1,"ERL path traversal prohibited");
    var name=ref.slice(ERL_ROOT.length);
    requireValue(name&&name.indexOf("/")===-1,"ERL assistant currently accepts one bounded root artifact");
    requireValue(/\.(md|txt|json)$/i.test(name),"ERL artifact type unsupported for local drafting");
    return {key:ref,canonical_path:"02_Research/ERL",name:name};
  }
  function base64ToBytes(value){
    requireValue(typeof value==="string"&&value.length>0,"ERL content bytes unavailable");
    var raw;
    if(typeof atob==="function") raw=atob(value);
    else if(typeof Buffer!=="undefined") raw=Buffer.from(value,"base64").toString("binary");
    else throw new Error("FAIL_CLOSED: base64 decoder unavailable");
    var out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
  }
  function hex(buffer){return Array.prototype.map.call(new Uint8Array(buffer),function(x){return x.toString(16).padStart(2,"0");}).join("");}
  function digest(bytes){
    requireValue(root.crypto&&root.crypto.subtle&&typeof root.crypto.subtle.digest==="function","WebCrypto SHA-256 unavailable");
    return root.crypto.subtle.digest("SHA-256",bytes).then(function(value){return "sha256:"+hex(value);});
  }
  function decodeUtf8(bytes){return new TextDecoder().decode(bytes);}
  function stripMarkdown(text){
    return String(text||"")
      .replace(/^---[\s\S]*?---\s*/m,"")
      .replace(/```[\s\S]*?```/g," ")
      .replace(/^#{1,6}\s+/gm,"")
      .replace(/^\s*[-*+]\s+/gm,"")
      .replace(/^\s*\d+[.)]\s+/gm,"")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g,"$1")
      .replace(/[*_`>]/g,"")
      .replace(/\s+/g," ").trim();
  }
  function titleFrom(text,fallback){
    var match=String(text||"").match(/^#\s+(.+)$/m);return stripMarkdown(match?match[1]:fallback||"ERL research note");
  }
  function firstUrl(text){var m=String(text||"").match(/https?:\/\/[^\s)\]>]+/);return m?m[0].replace(/[.,;]+$/,""):null;}
  function section(text,names,max){
    var source=String(text||"");
    for(var i=0;i<names.length;i++){
      var escaped=names[i].replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      var re=new RegExp("^#{1,6}\\s+.*"+escaped+".*$([\\s\\S]*?)(?=^#{1,6}\\s+|$)","im");
      var m=source.match(re);if(m){var cleaned=stripMarkdown(m[1]);if(cleaned)return cleaned.slice(0,max);}
    }
    return "";
  }
  function fallbackSummary(text,max){
    var cleaned=String(text||"").replace(/^#.*$/gm," ");return stripMarkdown(cleaned).slice(0,max);
  }
  function sentenceCut(text,max){
    text=String(text||"").trim();if(text.length<=max)return text;
    var slice=text.slice(0,max-1),cut=Math.max(slice.lastIndexOf(". "),slice.lastIndexOf("? "),slice.lastIndexOf("! "));
    if(cut>Math.floor(max*.55))slice=slice.slice(0,cut+1);else slice=slice.replace(/\s+\S*$/,"");
    return slice.trim()+"…";
  }
  function hashtagsFor(text){
    var hay=String(text||"").toLowerCase(),tags=["#StegVerse","#AIGovernance"];
    if(hay.indexOf("gadi")!==-1)tags.push("#GADI");
    if(hay.indexOf("stegos")!==-1)tags.push("#StegOS");
    if(hay.indexOf("cyber")!==-1||hay.indexOf("security")!==-1)tags.push("#AISecurity");
    return tags.slice(0,5);
  }
  function compose(parsed,platform){
    platform=normalizePlatform(platform);
    var summary=parsed.summary||"This ERL artifact records source-grounded research relevant to governed AI behavior.";
    var relevance=parsed.relevance||"The StegVerse relevance is to keep consequential interactions observable, bounded, attributable, and reconstructable rather than evaluating each event in isolation.";
    var sourceLine=parsed.source_url?"Source: "+parsed.source_url:"ERL source: "+parsed.erl_ref;
    var body;
    if(platform==="X"){
      body=parsed.title+" — "+sentenceCut(summary,135)+" StegVerse relevance: "+sentenceCut(relevance,70)+(parsed.source_url?" "+parsed.source_url:"");
      return {body:sentenceCut(body,PLATFORM_LIMIT.X),hashtags:[]};
    }
    body=parsed.title+"\n\n"+summary+"\n\nWhy this matters for governed AI:\n"+relevance+"\n\nThe important question is not only what one isolated interaction says. It is what the accumulated evidence says about the consequential process producing it.\n\n"+sourceLine;
    return {body:sentenceCut(body,PLATFORM_LIMIT[platform]-90),hashtags:hashtagsFor(parsed.raw_text)};
  }
  function parseVerifiedRow(row,expected){
    var ref=normalizeRef(expected.erl_ref);
    requireValue(row&&typeof row==="object","ERL KV row unavailable");
    requireValue(row.key===ref.key,"ERL stored key mismatch");
    requireValue(row.canonical_path===ref.canonical_path,"ERL stored canonical path mismatch");
    requireValue(row.name===ref.name,"ERL stored filename mismatch");
    requireValue(row.credential_material_present===false,"ERL credential boundary invalid");
    requireValue(row.provider_operation_authorized===false,"ERL provider-operation boundary invalid");
    requireValue(row.authority_effect==="NONE","ERL authority boundary invalid");
    var bytes=base64ToBytes(row.content_base64);requireValue(bytes.length>0&&bytes.length<=MAX_BYTES,"ERL artifact exceeds bounded local drafting limit");
    return digest(bytes).then(function(actual){
      requireValue(/^sha256:[a-f0-9]{64}$/.test(String(row.sha256||"")),"ERL stored SHA-256 invalid");
      requireValue(row.sha256===actual,"ERL content SHA-256 mismatch");
      requireValue(row.size_bytes===bytes.length,"ERL content size mismatch");
      var text=decodeUtf8(bytes);
      var parsed={
        erl_ref:ref.key,
        erl_sha256:actual,
        title:titleFrom(text,ref.name.replace(/\.[^.]+$/,"")),
        source_url:firstUrl(text),
        summary:section(text,["Source synopsis","Synopsis","Summary","Source-grounded observations","ERL-relevant claims","What happened"],850)||fallbackSummary(text,850),
        relevance:section(text,["StegOS / GADI interpretation","StegOS","GADI","Interpretation","Architectural implications","Implications","Why it matters"],950),
        raw_text:text
      };
      var composed=compose(parsed,expected.platform);
      return {
        schema:"stegverse.site.stegsocials.erl-assisted-draft/v1",
        state:"ERL_ASSISTED_DRAFT_READY",
        erl_ref:parsed.erl_ref,
        erl_sha256:parsed.erl_sha256,
        title:parsed.title,
        source_url:parsed.source_url,
        body:composed.body,
        hashtags:composed.hashtags,
        platform:normalizePlatform(expected.platform),
        erl_authority_preserved:true,
        deterministic_local_assistance:true,
        ai_provider_call_performed:false,
        provider_call_performed:false,
        credential_material_present:false,
        provider_operation_authorized:false,
        publication_authority_effect:"NONE_PREPARATION_ONLY"
      };
    });
  }
  function openDb(){
    requireValue(root.indexedDB&&typeof root.indexedDB.open==="function","device-local KV IndexedDB unavailable");
    return new Promise(function(resolve,reject){var r=root.indexedDB.open(DB_NAME,DB_VERSION);r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error("device-local KV open failed"));};});
  }
  function assist(request){
    request=request||{};var ref=normalizeRef(request.erl_ref);normalizePlatform(request.platform);
    return openDb().then(function(db){return new Promise(function(resolve,reject){
      requireValue(db.objectStoreNames.contains(STORE),"device-local KV file store unavailable");
      var tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(ref.key),row=null;
      req.onsuccess=function(){row=req.result||null;};req.onerror=function(){reject(req.error||new Error("ERL read failed"));};
      tx.oncomplete=function(){db.close();parseVerifiedRow(row,request).then(resolve,reject);};
      tx.onerror=function(){db.close();reject(tx.error||new Error("ERL read transaction failed"));};tx.onabort=function(){db.close();reject(tx.error||new Error("ERL read transaction aborted"));};
    });});
  }

  return Object.freeze({
    bridge_kind:"DEVICE_LOCAL_KV_ERL_STEGSOCIALS_DRAFT_ASSISTANT",
    access:"READ_ONLY",
    authority_effect:"NONE",
    normalizeRef:normalizeRef,
    parseVerifiedRow:parseVerifiedRow,
    compose:compose,
    assist:assist
  });
}));
