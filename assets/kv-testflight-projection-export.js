(function(root){
"use strict";
if(!root) return;
var OUTPUT_SCHEMA="stegos.kv-bound-ephemeral-projection-context/v1";
var EXPECTED_KEYS=["admission_commitment","authority_effect","browser_capability_commitment","browser_capability_state","entry_state","kv_transition_commitment","persistence_effect","purpose","schema"];
function requireValue(ok,message){if(!ok) throw new Error("FAIL_CLOSED: "+message);}
function exactProjection(result){
  requireValue(result&&result.schema===OUTPUT_SCHEMA,"projection materializer result invalid");
  requireValue(result.evidence&&result.evidence.entry_receipt&&result.evidence.browser_capability_receipt,"projection evidence package missing");
  var projection={
    schema:result.schema,
    purpose:result.purpose,
    entry_state:result.entry_state,
    kv_transition_commitment:result.kv_transition_commitment,
    admission_commitment:result.admission_commitment,
    browser_capability_state:result.browser_capability_state,
    browser_capability_commitment:result.browser_capability_commitment,
    persistence_effect:result.persistence_effect,
    authority_effect:result.authority_effect
  };
  requireValue(Object.keys(projection).sort().join(",")===EXPECTED_KEYS.join(","),"projection schema key drift");
  requireValue(projection.purpose==="CURRENT_IPHONE_TESTFLIGHT_SIGNING"&&projection.entry_state==="ADMITTED"&&projection.browser_capability_state==="OBSERVED_COMPATIBLE","projection state invalid");
  requireValue(/^sha256:[0-9a-f]{64}$/.test(projection.kv_transition_commitment)&&/^sha256:[0-9a-f]{64}$/.test(projection.admission_commitment)&&/^sha256:[0-9a-f]{64}$/.test(projection.browser_capability_commitment),"projection commitments invalid");
  requireValue(projection.persistence_effect==="NONE_EPHEMERAL_CONTEXT_ONLY"&&projection.authority_effect==="NONE_PROJECTION_GATE_ONLY","projection authority/persistence invalid");
  requireValue(JSON.stringify(projection).indexOf("kv_lineage_id")===-1,"KV lineage leaked into projection");
  return Object.freeze(projection);
}
function materialize(){
  var adapter=root.StegVerseKVTestFlightProjectionEntry;
  requireValue(adapter&&typeof adapter.materialize==="function","KV TestFlight entry adapter unavailable");
  return adapter.materialize().then(function(result){
    return Object.freeze({
      schema:"stegverse.site.kv-testflight-projection-materialization/v1",
      state:"PROJECTION_CONTEXT_READY",
      projection_context:exactProjection(result),
      evidence:Object.freeze({
        entry_receipt:result.evidence.entry_receipt,
        browser_capability_receipt:result.evidence.browser_capability_receipt,
        kv_installation_receipt_sha256:result.evidence.kv_installation_receipt_sha256,
        raw_browser_observation:result.evidence.raw_browser_observation
      }),
      authority_effect:"NONE_PROJECTION_ONLY"
    });
  });
}
root.StegVerseKVTestFlightProjectionExport=Object.freeze({materialize:materialize,authority_effect:"NONE_PROJECTION_ONLY"});
})(typeof window!=="undefined"?window:self);
