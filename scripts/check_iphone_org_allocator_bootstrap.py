#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXPECTED={
 "stegos-node/org-allocator-portable.js":"af4ada6b50647ffab0061960e7e4a153dbd83b68",
 "stegos-node/org-allocator-current-iphone-package.json":"f244f4cbc792a3bce1dc6486654be9a47fac6dec",
}
RELEASE="g5-cachefix-20260909-1"

def git_blob_sha(path:Path)->str:
    data=path.read_bytes()
    return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()

def verify()->dict:
    for rel,expected in EXPECTED.items():
        path=ROOT/rel
        if not path.is_file():
            raise RuntimeError(f"missing {rel}")
        actual=git_blob_sha(path)
        if actual!=expected:
            raise RuntimeError(f"{rel} blob mismatch: {actual} != {expected}")
    html=(ROOT/"stegos-node/org-allocator-bootstrap.html").read_text(encoding="utf-8")
    required=[
      'ALLOC_DB="stegos-org-allocator-v1"',
      'StegVersePortableOrgClaimAllocator.allocate',
      'atomicCompareAndSwap',
      'site_grants_claim_authority:false',
      'heartbeat_grants_claim_authority:false',
      'browser_shell_grants_claim_authority:false',
      'task_0008_granted',
      'continued_receipts:continuity.rows.slice()',
      'node:continuity.node',
      'device_continuity:continuity.device',
      'CURRENT_USER_IPHONE',
      'requires_other_machine:false',
      'credential_authority:"TV/TVC"',
      'github_token_runtime_authority:"NONE"',
      f'org-allocator-portable.js?v={RELEASE}',
      f'ORG_ALLOCATOR_RELEASE="{RELEASE}"',
      'portable_package_source_binding:sourceBinding',
      'task_0010_source_binding:sourceBinding.task_0010_git_blob_sha||null',
    ]
    for marker in required:
        if marker not in html:
            raise RuntimeError(f"bootstrap invariant missing: {marker}")
    if "stegos-bootstrap/" in html:
        raise RuntimeError("bootstrap runner may not reference task-gated product paths")
    worker=(ROOT/"stegos-node/service-worker.js").read_text(encoding="utf-8")
    for marker in [
      'stegos-node-shell-v10-org-allocator-fresh-v1',
      '"/stegos-node/org-allocator-bootstrap.html": true',
      '"/stegos-node/org-allocator-portable.js": true',
      '"/stegos-node/org-allocator-current-iphone-package.json": true',
      'NETWORK_ONLY_PATHS[url.pathname]',
      'fetch(event.request, {cache: "no-store"})',
    ]:
        if marker not in worker:
            raise RuntimeError(f"allocator cache-bypass invariant missing: {marker}")
    pkg=json.loads((ROOT/"stegos-node/org-allocator-current-iphone-package.json").read_text(encoding="utf-8"))
    if pkg.get("canonical_authority_owner")!="StegVerse-Labs/.github organization allocator":
        raise RuntimeError("canonical allocator owner drift")
    if pkg.get("execution_surface")!="CURRENT_USER_IPHONE":
        raise RuntimeError("execution surface drift")
    if pkg.get("stegos_grants_claim_authority") is not False:
        raise RuntimeError("StegOS claim authority widening")
    ids=[task.get("task_id") for task in pkg.get("tasks",[])]
    if ids != ["TASK-2026-0007","TASK-2026-0008","TASK-2026-0009","TASK-2026-0010"]:
        raise RuntimeError("portable allocator task catalog stale")
    if pkg.get("immediate_target_task_id") != "TASK-2026-0010":
        raise RuntimeError("portable allocator immediate target stale")
    if pkg.get("immediate_target_dependency_surface") != "site:current-iphone-testflight-static-bootstrap":
        raise RuntimeError("portable allocator target surface stale")
    task9=next(task for task in pkg["tasks"] if task["task_id"]=="TASK-2026-0009")
    task10=next(task for task in pkg["tasks"] if task["task_id"]=="TASK-2026-0010")
    scope9=task9["requirements"]["mandatory"][0]["scope"]
    scope10=task10["requirements"]["mandatory"][0]["scope"]
    for key in ("paths","contracts","release_surfaces","capabilities","dependency_surfaces"):
        if not set(scope9.get(key,[])).isdisjoint(set(scope10.get(key,[]))):
            raise RuntimeError(f"TASK-0010 retains G5 collision in {key}")
    if pkg.get("source_binding",{}).get("task_0010_git_blob_sha") != "248bed8cf5428c3ba759ee0d34db5fec8949a835":
        raise RuntimeError("TASK-0010 corrected source binding stale")
    return {
      "schema":"stegverse.site.iphone-org-allocator-bootstrap-validation/v1",
      "state":"PASS",
      "exact_allocator_blob":EXPECTED["stegos-node/org-allocator-portable.js"],
      "exact_package_blob":EXPECTED["stegos-node/org-allocator-current-iphone-package.json"],
      "allocator_release":RELEASE,
      "service_worker_cache_epoch":"stegos-node-shell-v10-org-allocator-fresh-v1",
      "allocator_assets_network_only":True,
      "task_catalog":["TASK-2026-0007","TASK-2026-0008","TASK-2026-0009","TASK-2026-0010"],
      "immediate_target_task_id":"TASK-2026-0010",
      "g5_collision_removed":True,
      "site_product_authority":False,
      "canonical_allocator_remains_claim_authority":True,
      "task_0010_claim_observed":False,
      "physical_iphone_execution_observed":False,
      "authority_effect":"NONE_VALIDATION_ONLY",
    }

if __name__=="__main__":
    print(json.dumps(verify(),sort_keys=True))
