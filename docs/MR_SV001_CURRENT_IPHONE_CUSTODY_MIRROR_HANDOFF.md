# Current-iPhone Master Records SV001 Custody Projection Mirror Handoff

Updated: 2026-09-08
Repository: StegVerse-Labs/Site
Issue: #955
Goal: SITE-MR-SV001-CUSTODY-PROJECTION-955
Goal Task ID: `SHWP-STEGVERSE001-BOUNDED-AUTONOMY-RUNTIME-001`
Handoff Task ID: `STEGVERSE001-EVIDENCE-CHAIN-CONTINUATION-001`
COSV ID: `50000000100000`
State: `POST_CUSTODY_SV002_BRIDGE_IMPLEMENTING / AUTHENTIC_CURRENT_DEVICE_RUNTIME_PENDING`

## Current source of truth

This handoff owns the current-iPhone SV001 -> contemporaneously governed Master Records custody/reconstruction -> retained downstream SV002 observation/disposition continuation.

Canonical task state is registered in `StegVerse-Labs/.github:data/canonical-task-records/STEGVERSE001-EVIDENCE-CHAIN-CONTINUATION-001.json`. The canonical post-terminal WorkerCoordinator continuation binding is merged in `.github` PR #1181. Site #1096 / PR #1098 previously closed the false wait between exact G23 recovery and the already-existing governed custody executor.

The 2026-09-08 continuation preflight identified a distinct remaining same-device seam after custody: Site already retained the authentic governed custody proof in its service-worker journal, but the `.github` continuation consumed a filesystem proof path (`~/.stegverse/state/stegverse001-evidence-chain/site-master-records-custody.latest.json`) that the current iPhone browser runtime does not produce. Authentic custody could therefore complete while downstream SV002 disposition remained unreachable on the same physical execution surface.

The admitted repair does not add another runtime plane. It reuses the existing current-device Site service worker and receipt journal and moves the downstream observation/disposition onto the already-resident same-device evidence chain.

## Canonical immutable evidence target

```text
execution surface: CURRENT_USER_IPHONE
canonical task: SHWP-STEGVERSE001-BOUNDED-AUTONOMY-RUNTIME-001
claim/fence: G23 / 23
transition: SV001_BOUNDED_AUTONOMY_CYCLE_COMPLETED
canonical cycle receipt SHA: sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35
terminal SV001 rerun allowed: false
G24 custody eligibility: false
```

G23 remains evidence input only. The receipt/hash does not authorize custody, SV002 observation, or any later transition.

## Canonical coordination and authority state

```text
Task Registry / COSV work intent: StegVerse-Labs/.github
WorkerCoordinator claim / fence authority: canonical WorkerCoordinator
Master Records custody / reconstruction authority: master-records/orchestration
Interlock/InTr transition governance: root Universal InTr
TV/TVC credential authority: TV/TVC
HB32 role: oscillator/reference/correlation only
HB32 authority: NONE
Site custody authority: false
Site execution authority: false
SV002 disposition authority effect: NONE_OBSERVATION_AND_DISPOSITION_ONLY
```

Every custody mutation still requires a fresh contemporaneous root-InTr decision for the exact `SV001_MASTER_RECORDS_CUSTODY_AND_RECONSTRUCTION` transition. Neither G23, HB32, recovery, historical state, nor a prior admission grants later authority.

## Existing runtime solution reused

The runtime solution already exists and remains the only admissible runtime plane:

```text
HB32 independent oscillator
-> current HB reference
-> canonical current-iPhone Site carrier
-> exact G23 retained proof or deterministic retained-journal recovery
-> StegOSWebBootstrap.executeMasterRecordsSv001Custody()
-> root Universal InTr MasterRecords:SV001Custody
-> fresh ALLOW required
-> canonical Master Records custody
-> canonical reconstruction PASS
-> existing Site receipt journal replay PASS
```

No new heartbeat, oscillator, scheduler, WorkerCoordinator, resident runtime, InTr runtime, custody executor, credential path, or second user-operated machine is introduced.

## 2026-09-08 post-custody defect

The prior flow ended after governed custody with the proof living in the browser/service-worker journal. The `.github` continuation expected a host filesystem projection instead:

```text
Site current-device custody proof
-> IndexedDB/service-worker journal PASS
-> browser event stegverse:sv001-master-records-custody-complete
-> [missing current-iPhone filesystem proof producer]
-> ~/.stegverse/state/stegverse001-evidence-chain/site-master-records-custody.latest.json
-> .github continuation
-> SV002 disposition
```

That filesystem seam is not a valid current-iPhone dependency. Creating a second resident, export loop, or manual transfer would duplicate or weaken the existing runtime architecture.

## Admitted repair

Preflight: `data/preflight/sv001-post-custody-sv002-bridge-20260908.json`
Claim: `data/session-work-claims.d/site-sv001-post-custody-sv002-bridge-20260908.json`
Branch: `task/sv001-post-custody-sv002-bridge-20260908`
README impact: `MATERIAL / SAME CHANGE SET REQUIRED`

The v15 Site successor keeps the exact released v13 runtime predecessor and adds only a bounded post-custody evidence/disposition extension:

```text
stegos-bootstrap/service-worker.js
  -> importScripts("./service-worker-v13-runtime.js", "./sv001-evidence-chain-continuation.js")
  -> CACHE_NAME = "stegos-web-bootstrap-v15"

stegos-bootstrap/service-worker-v13-runtime.js
  -> unchanged exact governed custody/runtime predecessor

stegos-bootstrap/sv001-evidence-chain-continuation.js
  -> validates exact canonical G23
  -> validates authentic governed custody/reconstruction PASS proof
  -> requires retained root-InTr admission evidence
  -> evaluates canonical frozen SV002 v0.3 semantics
  -> runs the exact 12-case AO-01..AO-12 adversarial disposition set
  -> appends one bounded non-authorizing SV002 disposition receipt
  -> requires its previous_entry_sha256 to equal the custody replay tail
  -> replays the same local journal and requires PASS
  -> returns idempotent PASS on later retries without duplicating the terminal disposition
```

The frozen evaluator semantics are copied from the canonical `.github/scripts/evaluate_sv002_adversarial_observation.py` behavior and bound to the exact canonical fixture blob `fba8beea98838bc16b4b2502c5a2ac363c72add3` from `.github/fixtures/sv002-adversarial-observation/cases.v1.json`.

`master-records-auto-recovery.js` now performs:

```text
exact retained/recovered G23
-> existing current-governance custody executor
-> custody/reconstruction PASS
-> automatically POST exact G23 + exact custody proof to same-device continuation endpoint
-> SV002 disposition retained in the same local journal
-> final replay PASS
```

No filesystem export is required. No manual receipt copy is required. No second device is required.

## Same-execution evidence rule

For the first successful post-custody continuation, the new SV002 disposition journal entry is valid only when:

```text
new_entry.previous_entry_sha256 == governed_custody_proof.final_replay_tail_sha256
```

The final journal replay must then end at that disposition entry. This binds custody/reconstruction and downstream SV002 disposition in the same resident evidence chain without making custody evidence an authority source.

Later page/resume retries are idempotent: a previously retained canonical continuation is replayed and returned without appending another disposition.

## Failure behavior

```text
G23 unavailable / ambiguous
-> AWAITING_EXACT_COMPLETED_PROOF
-> no SV001 rerun

G23 exact but root-InTr governance denied/missing/mismatched/timed out
-> EXACT_G23_PRESENT_MACHINE_GOVERNANCE_FAIL_CLOSED
-> no custody mutation
-> no human approval checkpoint

custody/reconstruction incomplete
-> FAIL_CLOSED before SV002 disposition

custody/reconstruction PASS but post-custody SV002 validation/retention fails
-> custody success remains retained
-> UI: PASS — MASTER RECORDS CUSTODY / SV002 CONTINUATION FAIL_CLOSED
-> no custody rollback
-> no fabricated SV002 success
-> later retry through existing page/resume lifecycle

partial historical admission/custody/reconstruction
-> FAIL_CLOSED
-> no retroactive authorization
-> prior admission cannot authorize later mutation
```

## v15 propagation semantics

The current wrapper advances from v14 to v15 solely so installed cache-first clients receive the post-custody extension. The exact v13 runtime predecessor remains unchanged. v15 does not create another runtime or governance plane.

```text
v13 exact runtime predecessor
+ bounded sv001-evidence-chain-continuation.js
-> v15 service-worker propagation successor
```

## Runtime truth

Source/CI/merge are not runtime evidence. Until current-device retained evidence establishes otherwise, these predicates remain unclaimed:

```text
v15 current-device consumption: NOT YET CLAIMED
fresh root-InTr ALLOW for canonical G23 custody: NOT YET CLAIMED
Master Records custody PASS under current v15 lifecycle: NOT YET CLAIMED
Master Records reconstruction PASS under current v15 lifecycle: NOT YET CLAIMED
same-journal downstream continuation entry: NOT YET CLAIMED
SV002 authentic OBSERVED disposition: NOT YET CLAIMED
final same-device journal replay PASS through SV002: NOT YET CLAIMED
```

The source repair is intended to make those predicates reachable automatically on the existing current-device lifecycle. Authentic completion must still be observed from the authoritative resident producers.

## Development disposition

Fully developed/reused before this continuation:
- HB32 independent oscillator/reference derivation;
- canonical current-iPhone Site execution surface;
- exact G23 retained-proof and deterministic recovery;
- root Universal InTr Master Records custody profile;
- same-device machine-governed custody executor;
- canonical Master Records custody/reconstruction;
- no-retroactive-authorization handling;
- automatic G23 -> governed custody continuation;
- exact v13 runtime predecessor.

New bounded source being integrated:
- same-device post-custody SV002 observation/disposition extension;
- v15 propagation wrapper;
- idempotent same-journal continuation/replay checks;
- README/handoff/validator completeness for the new semantics.

Remaining uninstalled independent runtime module: **none**.

## User work

Routine user work: **NONE**.

Do not rerun SV001, synthesize G23, manually approve the machine-owned custody transition, export the browser proof to a filesystem path, or operate another device.

## Archive readiness

Historical #1096/#1098 source lanes remain released and archive-eligible. This post-custody continuation lane is not archive-ready until its source change is validated, merged, and claim-terminalized. The broader evidence-chain task is not runtime-complete until authentic current-device custody/reconstruction/SV002 evidence is retained and reconstructed.
