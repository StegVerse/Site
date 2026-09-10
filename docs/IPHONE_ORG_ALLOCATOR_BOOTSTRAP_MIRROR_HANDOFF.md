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

## Authentic G5 failure evidence and remediation

The physical current iPhone retained the authentic allocator lineage and advanced through:

```text
TASK-2026-0007 -> generation/fence 3
TASK-2026-0008 -> generation/fence 4
TASK-2026-0009 -> generation/fence 5
next allocation -> selected null / generation 5 / only TASK-2026-0010 queued
```

The G5 null-selection was correct fail-closed behavior. Inspection found two accidental scoped-exclusive collisions between the retained TASK-0009 G5 claim and TASK-0010: shared `README.md` path ownership and the generic `stegos.current-iphone-site-projection-successor.v1` contract. `.github#1308` removed both shared coordination surfaces from TASK-0010 while preserving its unique TestFlight product/runtime paths, signing-executor contract, release surface, capabilities and dependency surface.

A proper `unittest.TestCase` regression now reconstructs the retained G3/G4/G5 claim topology and requires TASK-0010 to select at generation/fence 6. The full deterministic repository suite and Heartbeat validation both passed before #1308 merged.

## Runtime evidence

Authentic evidence is retained as:
- canonical allocator portable state in dedicated IndexedDB;
- allocator receipt;
- claim observation;
- established StegOS node continuity journal entry.

Current truth:

```text
canonical allocator TASK-0010 collision remediation: MERGED / VALIDATED
Site bootstrap allocator bytes: REFRESHED_ON_BRANCH / VALIDATION_PENDING
Site bootstrap package bytes: REFRESHED_ON_BRANCH / VALIDATION_PENDING
public bootstrap route with corrected G5-collision bytes: NOT YET OBSERVED
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

This bootstrap refresh transports the corrected byte-identical canonical allocator after an authentic current-iPhone collision exposed a source-scope defect. It does not grant TASK-0010, reset retained allocator state, release TASK-0009, or authorize any TASK-0010 product file.
