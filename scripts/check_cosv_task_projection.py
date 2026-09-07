#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/"data/cosv/task-vector-index.json"
ORDER="LRUIVGOCMTBEAP"
LIFECYCLE={"UNKNOWN":0,"UNCLAIMED":1,"CLAIMED_IMPLEMENTATION":2,"CLAIMED_VALIDATION":3,"CLAIMED_INTEGRATION":4,"MACHINE_OWNED":5,"BLOCKED":6,"COMPLETE":7,"SUPERSEDED":8,"MERGED_INTO_CANONICAL_WORKSTREAM":9}

def enc(m):
    vals=[
        LIFECYCLE[m["lifecycle"]],
        1 if m["archive_ready"] else 0,
        m["unassigned_work"],m["chat_owned_implementation"],m["chat_owned_validation"],
        m["chat_owned_integration"],m["chat_owned_observation"],m["chat_owned_credentials"],
        1 if m["canonical_owner_installed"] else 0,
        1 if m["thread_required"] else 0,
        min(9,m["blocker_count"]),
        1 if m["evidence_complete"] else 0,
        1 if m["activated"] else 0,
        1 if m["propagated"] else 0,
    ]
    return "".join(str(x) for x in vals)

def main():
    idx=json.loads(INDEX.read_text())
    assert idx["profile"]=="task.v1" and idx["notation"]=="L R U I V G O C M T B E A P" and idx["width"]==14
    assert idx["authority_effect"]=="NONE"
    ids=[]
    source_bound=0
    deferred=0
    for row in idx["tasks"]:
        ids.append(row["task_id"])
        task=json.loads((ROOT/row["task_ref"]).read_text())
        rec=json.loads((ROOT/row["vector_ref"]).read_text())
        assert task["task_id"]==row["task_id"]
        assert rec["identity"]==f"StegVerse-Labs/Site:task:{row['task_id']}"
        assert rec["exact_metrics"]["symbol_order"]==ORDER
        assert rec["vector"]==row["vector"]==enc(rec["exact_metrics"])
        if row["binding_mode"]=="SOURCE_BOUND":
            source_bound += 1
            assert task["source_state_vector_ref"]==row["vector_ref"]
            assert task["machine_readable_state"]["cosv"]["vector"]==row["vector"]
            assert task["machine_readable_state"]["cosv"]["authority_effect"]=="NONE"
        else:
            deferred += 1
            assert row["binding_mode"]=="EXTERNAL_PROJECTION_SOURCE_BINDING_DEFERRED_ACTIVE_OWNER"
        assert rec["authority_effect"]=="NONE"
    assert len(ids)==len(set(ids))
    cov=idx["coverage"]
    assert cov["explicit_cosv_task_surfaces_discovered"]==5
    assert cov["task_vectors_emitted"]==len(ids)==4
    assert cov["source_bound_task_vectors"]==source_bound==1
    assert cov["active_owner_deferred_source_bindings"]==3
    assert cov["legacy_claim_deferred_tasks"]==1
    assert cov["explicit_cosv_surface_gap"]==1
    assert cov["repository_active_task_surface_audit_complete"] is False
    assert cov["repository_vector_present_claimed"] is False
    print(f"SITE_COSV_TASK_PROJECTION_PASS emitted={len(ids)} source_bound={source_bound} deferred={deferred + cov['legacy_claim_deferred_tasks']} repository_vector_present=false")

if __name__=="__main__":
    main()
