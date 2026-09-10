# iPhone Organization Allocator Bootstrap Mirror Handoff

Updated: 2026-09-09
Repository: `StegVerse-Labs/Site`
Issue: #945
Original claim: `SITE-IPHONE-ORG-ALLOCATOR-BOOTSTRAP-945-20260902`

## Purpose

Break allocator/publication bootstrap circularity without bypassing the canonical organization allocator or reusing a prior product claim.

Canonical allocator authority:
- `StegVerse-Labs/.github#884`;
- current successor-catalog merge `e484be32e5b017a4a6f172635ea80c5d46913d8e`.

Site role is orchestration/bootstrap transport only.

## Exact projected authority artifacts

- `.github:org_allocator/portable_allocator.js`
- `.github:control/portable-org-allocator/current-iphone-package.json`

The Site copies must remain byte-identical to their merged source blobs.

Current exact projections:

```text
stegos-node/org-allocator-portable.js
  blob 238c0f9ba4e9952fcd12ab4a5d8bfc7a1ab0c9e5

stegos-node/org-allocator-current-iphone-package.json
  blob 3eef719830889c41a14f20f30eccc533ce3278b8
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

## Retained state and successor catalog

The physical current iPhone previously executed the same portable allocator authority epoch and retained the authentic TASK-0008 G4/fence-4 observation. The current package now contains exact task identities TASK-0007, TASK-0008, TASK-0009, and TASK-0010 while preserving the same authority epoch and seed state.

The allocator does not reset retained state when a new catalog task is absent from persisted `task_statuses`; it falls back to that task's packaged queued state. Existing active claims remain collision inputs.

Source regression proves that a retained G3/G4/G5 state can select TASK-0010 only at monotonic generation/fence 6 when its exact Site scope is non-conflicting. This is source behavior only until the current iPhone actually performs the CAS.

## Runtime evidence

Authentic evidence is retained as:
- canonical allocator portable state in dedicated IndexedDB;
- allocator receipt;
- claim observation;
- established StegOS node continuity journal entry.

Current truth:

```text
canonical allocator TASK-0010 source: MERGED
Site bootstrap allocator bytes: REFRESHED_ON_BRANCH / VALIDATION_PENDING
Site bootstrap package bytes: REFRESHED_ON_BRANCH / VALIDATION_PENDING
public bootstrap route with refreshed bytes: NOT YET OBSERVED
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

The bootstrap refresh exists because public Site was still serving the original two-task allocator/package from September 2 after canonical successor tasks were added. That stale transport was the concrete defect permitted by the original bootstrap handoff's remediation clause. Refreshing these byte-identical bootstrap artifacts does not itself grant TASK-0010 or authorize its product files.
