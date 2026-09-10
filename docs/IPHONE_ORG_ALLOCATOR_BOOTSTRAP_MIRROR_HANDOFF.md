# iPhone Organization Allocator Bootstrap Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Issue: #945
Original claim: `SITE-IPHONE-ORG-ALLOCATOR-BOOTSTRAP-945-20260902`
Parent goal: `STEGOS-SOVEREIGN-RELAY-RETURN-PATH-001`

## Purpose

Break allocator/publication bootstrap circularity without bypassing the canonical organization allocator or reusing a prior product claim.

Canonical allocator authority:
- `StegVerse-Labs/.github#884`;
- successor-catalog lineage through `.github#1308` / merge `933a388b0b2ff156446bcbfe5e423fd3f91dc5a0`.

Site role is orchestration/bootstrap transport only.

## Exact projected authority artifacts

- `.github:org_allocator/portable_allocator.js`
- `.github:control/portable-org-allocator/current-iphone-package.json`

The Site copies must remain byte-identical to their merged source blobs.

Current exact projections:

```text
stegos-node/org-allocator-portable.js
  blob af4ada6b50647ffab0061960e7e4a153dbd83b68

stegos-node/org-allocator-current-iphone-package.json
  blob f244f4cbc792a3bce1dc6486654be9a47fac6dec
```

## Same-device execution

```text
established CURRENT_USER_IPHONE node continuity
-> exact canonical allocator JS/package
-> dedicated IndexedDB portable allocator state
-> atomic compare-and-swap
-> canonical allocator selection
-> claim/fence generation
-> claim observation retained in established node journal
```

Site, HB, browser shell, static hosting, transport, and source materialization grant no claim authority.

## Bootstrap/product separation

This lane modifies only `stegos-node/` bootstrap transport plus its validation/handoff surfaces. It does not modify any task-gated `stegos-bootstrap/*` product path.

The product successor for the current-iPhone TestFlight static assets is separate canonical task `TASK-2026-0010`, with dependency surface:

`site:current-iphone-testflight-static-bootstrap`

The product branch `claim/current-iphone-testflight-static-bootstrap-r1` remains untouched until an authentic current-iPhone allocator claim for TASK-0010 is observed.

## Authentic G5 failure evidence and source remediation

The physical current iPhone retained the authentic allocator lineage and advanced through:

```text
TASK-2026-0007 -> generation/fence 3
TASK-2026-0008 -> generation/fence 4
TASK-2026-0009 -> generation/fence 5
next allocation -> selected null / generation 5 / only TASK-2026-0010 queued
```

The original G5 null-selection exposed two accidental scoped-exclusive collisions between TASK-0009 and TASK-0010: shared `README.md` ownership and shared `stegos.current-iphone-site-projection-successor.v1` contract ownership. `.github#1308` removed both and source validation proved retained G3/G4/G5 can select TASK-0010 at generation/fence 6.

## Authentic post-remediation G5 evidence and stale-cache defect

A second physical current-iPhone execution at `2026-09-10T02:09:07.725Z` still returned selected `null`, generation 5, only TASK-0010 queued, and the same allocator receipt hash as the pre-remediation null run while appending a new node-journal entry. This demonstrated that execution occurred but the browser-visible allocator inputs had not changed.

Root cause: `stegos-node/service-worker.js` used cache-first handling for every GET. Although the allocator package loader requested `cache:"no-store"`, the active service worker intercepted the request first and returned `caches.match(event.request)` when an older allocator HTML/JS/package response existed. The allocator artifacts were not in the static SHELL list, but the generic fetch handler cached every successful GET, so the old pair could persist across source updates while `CACHE_NAME` remained unchanged.

Remediation on `fix/iphone-org-allocator-stale-sw-cache`:

```text
service-worker cache epoch -> stegos-node-shell-v10-org-allocator-fresh-v1
allocator HTML path -> network-only
allocator JS path -> network-only
allocator package path -> network-only
allocator JS request -> versioned with g5-cachefix-20260909-1
allocator package request -> versioned with g5-cachefix-20260909-1
exported execution evidence -> includes allocator_release + portable_package_source_binding
```

The versioned request pair is intentional defense-in-depth: even a still-active predecessor cache-first service worker has no cached match for the new query-qualified allocator JS/package URLs, while the v10 worker permanently excludes the allocator bootstrap assets from persistent cache-first storage.

## Runtime evidence

Authentic evidence is retained as:
- canonical allocator portable state in dedicated IndexedDB;
- allocator receipt;
- claim observation;
- established StegOS node continuity journal entry;
- exact portable package source binding used by the execution after cache-fix deployment.

Current truth:

```text
canonical allocator TASK-0010 collision remediation: MERGED / VALIDATED
Site corrected allocator/package source projection: MERGED
physical current-iPhone post-source-fix retry: OBSERVED / STILL G5 NULL
stale service-worker cache root cause: IDENTIFIED
cache-bypass remediation: IMPLEMENTED_ON_BRANCH / VALIDATION_PENDING
physical current-iPhone execution with allocator_release g5-cachefix-20260909-1: NOT OBSERVED
physical current-iPhone TASK-0010 allocation: NOT OBSERVED
G6/fence 6: NOT OBSERVED
TASK-0010 product branch mutation: NOT STARTED
```

## Authority invariants

```text
canonical organization allocator claim authority: true
Site claim authority: false
StegOS claim authority: false
HeartBeat claim/execution authority: false
GitHub runtime authority: NONE
credential authority: TV/TVC
second user-operated device required: false
external non-StegVerse machine required: false
```

The cache fix changes transport freshness only. It does not reset retained allocator state, grant TASK-0010, release TASK-0009, authorize task-gated product files, or create any alternate runtime/claim authority.
