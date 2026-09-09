# Boundary Ontology v0.1

**Status:** Working Draft

## 1. Lifecycle Boundaries

### Discovery Boundary
Produces candidate alignment and explanatory context. It MUST NOT assert consent, authority, admissibility, commitment, or execution.

### Evidence Boundary
Transfers references, digests, receipts, or bounded summaries. It MUST distinguish evidence existence from evidence authority.

### Governance Boundary
Evaluates policy, safety, appropriateness, and review posture. It MUST NOT imply execution merely because a recommendation is approved.

### Authority Boundary
Determines who or what may authorize a transition. Authority MUST be explicit, scoped, current, and reconstructable.

### Admissibility Boundary
Determines whether a proposed transition may proceed under current evidence, policy, authority, and constraints. Approval alone is insufficient.

### Commit Boundary
Binds the final transition candidate to the evidence, policy, authority, and state valid at commit time.

### Execution Boundary
Performs the authorized action and emits execution receipts. Execution MUST NOT retroactively establish admissibility.

### Observation Boundary
Records what occurred after execution without silently converting observation into authorization or legitimacy.

### Historical Boundary
Preserves lineage, supersession, receipts, and evidence needed for later reconstruction.

## 2. Prohibited Collapses

The following equivalences are invalid unless independently established:

- recommendation = consent
- recommendation = authority
- approval = admissibility
- admissibility = execution
- execution = legitimacy
- observation = correctness
- replayability = reconstructability
- provenance = authority
- confidence = permission

## 3. Required Transition Questions

At every boundary crossing, a downstream evaluator SHOULD ask:

1. What is being transferred?
2. What is explicitly not being transferred?
3. Which identity remains stable?
4. Which constraints were active?
5. What evidence supports the transition?
6. Who has authority at this boundary?
7. What remains unresolved?
8. What receipt proves the crossing occurred?

## 4. Failure Classes

- `OVERREACH`: upstream artifact asserts downstream state or authority.
- `UNDER_SPECIFICATION`: downstream reconstruction is impossible because required meaning is absent.
- `IDENTITY_COLLAPSE`: source, export, transition, or supersession identities are conflated.
- `STATE_AMBIGUITY`: null or empty values conceal materially different semantic states.
- `EVIDENCE_OPACITY`: evidence is named but cannot be independently resolved or bounded.
- `COMMIT_DRIFT`: authority, policy, evidence, or constraints differ at commit time.
- `EXECUTION_LEAKAGE`: execution state appears in a non-executable handoff.

## 5. Relationship to Current Work

The Conectrr ITC is currently evaluated at the Discovery-to-Evidence/Governance handoff. StegVerse governs later admissibility, commit, execution, and continuity stages without requiring Conectrr to assume those responsibilities.
