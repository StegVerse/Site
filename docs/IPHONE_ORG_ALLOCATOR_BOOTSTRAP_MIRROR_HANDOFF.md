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

## Cache-freshness remediation

A later physical retry still returned selected `null`, generation 5, only TASK-0010 queued, while appending a fresh node-journal entry. Root cause was cache-first service-worker handling of allocator HTML/JS/package responses.

Site PR #1185 advanced the cache lineage to `stegos-node-shell-v10-org-allocator-fresh-v1`, made allocator HTML/JS/package paths network-only, versioned JS/package requests, and added `allocator_release` plus `portable_package_source_binding` to exported execution evidence. Site PR #1187 then added a never-before-used immutable `org-allocator-bootstrap-g6.html` entry so an already-open pre-fix document could not masquerade as the corrected page.

## Verified auto-execution

The manual `Run canonical allocation` control is not an authority requirement. It was a bootstrap safeguard. Site PR #1188 merged successor `stegos-node/org-allocator-bootstrap-auto.html`, removing that manual claim-control interaction while preserving the same authority boundary.

Auto-execution is permitted only after all of these predicates pass:

```text
1. established current-iPhone node continuity validates;
2. the node/device binding receipt is present and the node journal replays exactly;
3. canonical portable allocator package validation passes;
4. package source_binding.task_0010_git_blob_sha == 248bed8cf5428c3ba759ee0d34db5fec8949a835;
5. retained portable allocator state already exists; no automatic reset or initial-state replacement is allowed;
6. the canonical allocator itself is run first against a non-persistent cloned preview store;
7. preview has zero blocked_missing_dependency_declaration entries;
8. preview exposes exactly one queued canonical successor;
9. that successor is TASK-2026-0010 and is selected by the canonical allocator;
10. preview generation is exactly retained generation + 1;
11. only then is the same canonical allocator invoked once against the real IndexedDB atomic compare-and-swap store;
12. committed selected task and generation must equal the preview result.
```

If any predicate fails, the page reports `FAIL_CLOSED`, records no claim-authority assertion, and does not reset or replace retained allocator state. The preview uses the canonical allocator implementation itself; Site does not reimplement conflict, dependency, priority, or selection logic.

Successful auto-execution evidence records:
- `execution_trigger: VERIFIED_AUTO_EXECUTION`;
- allocator release `g6-auto-20260909-1`;
- the exact portable package source binding;
- selected task and claim generation;
- canonical claim observation/fencing tokens;
- the appended established-node journal entry and replay tail.

## Normal StegOS Node carrier

The allocator auto-execution page is an internal carrier, not a URL the user should have to know or invoke. The ordinary `stegos-node/index.html` lifecycle starts exactly one same-origin hidden carrier only after the dashboard observes canonical `REGISTERED` state.

```text
ordinary StegOS Node page active
-> node-state resolves to REGISTERED
-> startVerifiedAllocatorCarrier()
-> one hidden same-origin iframe
-> ./org-allocator-bootstrap-auto.html?v=normal-node-carrier-20260909-1
-> verified auto-execution predicates run
-> canonical allocator preview
-> real allocator CAS only if preview is admissible
-> same-device receipt retained in established node journal
```

Carrier invariants:

```text
unregistered/loading/error state -> no carrier start
REGISTERED -> carrier starts once per active document
no special allocator URL required from the user
no Run canonical allocation button
no allocator implementation duplicated into index.html
no allocator IndexedDB reset
no claim/fence authority transferred to Site or browser shell
```

The carrier only makes existing verified allocator auto-execution part of ordinary StegOS Node activity. It does not create background execution while iOS has no active eligible runtime surface.

## Runtime evidence

Authentic evidence is retained as:
- canonical allocator portable state in dedicated IndexedDB;
- allocator receipt;
- claim observation;
- established StegOS node continuity journal entry;
- exact portable package source binding used by execution.

Current truth:

```text
canonical allocator TASK-0010 collision remediation: MERGED / VALIDATED
Site corrected allocator/package source projection: MERGED
stale service-worker cache remediation: MERGED / PUBLICLY OBSERVED
immutable corrected G6 entry: MERGED
verified auto-execution entry: MERGED / VALIDATED / PUBLICLY OBSERVED
normal StegOS Node auto-execution carrier: IMPLEMENTED_ON_BRANCH / VALIDATION_PENDING
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

The normal-node carrier changes invocation topology only. It does not reset retained allocator state, grant TASK-0010 outside canonical allocator selection, release TASK-0009, authorize task-gated product files, or create any alternate runtime/claim authority.
