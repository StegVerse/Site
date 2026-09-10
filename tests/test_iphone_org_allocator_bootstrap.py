from pathlib import Path
import importlib.util

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"scripts/check_iphone_org_allocator_bootstrap.py"

def load():
    spec=importlib.util.spec_from_file_location("check_iphone_org_allocator_bootstrap",SCRIPT)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

def test_bootstrap_projection_is_exact_and_non_authorizing():
    result=load().verify()
    assert result["state"]=="PASS"
    assert result["canonical_allocator_remains_claim_authority"] is True
    assert result["site_product_authority"] is False
    assert result["task_0010_claim_observed"] is False
    assert result["physical_iphone_execution_observed"] is False
    assert result["immediate_target_task_id"]=="TASK-2026-0010"
    assert result["allocator_assets_network_only"] is True
    assert result["allocator_release"]=="g5-cachefix-20260909-1"

def test_runner_does_not_touch_task_gated_product_paths():
    html=(ROOT/"stegos-node/org-allocator-bootstrap.html").read_text(encoding="utf-8")
    assert "stegos-bootstrap/" not in html
    assert 'site_grants_claim_authority:false' in html
    assert 'browser_shell_grants_claim_authority:false' in html
    assert 'StegVersePortableOrgClaimAllocator.allocate' in html

def test_allocator_assets_bypass_stale_service_worker_cache():
    worker=(ROOT/"stegos-node/service-worker.js").read_text(encoding="utf-8")
    html=(ROOT/"stegos-node/org-allocator-bootstrap.html").read_text(encoding="utf-8")
    assert 'stegos-node-shell-v10-org-allocator-fresh-v1' in worker
    assert 'NETWORK_ONLY_PATHS[url.pathname]' in worker
    assert 'fetch(event.request, {cache: "no-store"})' in worker
    assert '/stegos-node/org-allocator-bootstrap.html' in worker
    assert '/stegos-node/org-allocator-portable.js' in worker
    assert '/stegos-node/org-allocator-current-iphone-package.json' in worker
    assert 'org-allocator-portable.js?v=g5-cachefix-20260909-1' in html
    assert 'ORG_ALLOCATOR_RELEASE="g5-cachefix-20260909-1"' in html
    assert 'portable_package_source_binding:sourceBinding' in html

def test_exact_upstream_git_blobs_are_pinned():
    mod=load()
    for rel,expected in mod.EXPECTED.items():
        assert mod.git_blob_sha(ROOT/rel)==expected
