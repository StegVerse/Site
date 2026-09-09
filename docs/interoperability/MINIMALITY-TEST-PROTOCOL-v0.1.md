# Minimality Test Protocol v0.1

**Status:** Working draft
**Purpose:** Determine the smallest practical interoperable handoff through evidence rather than assumption.

## 1. Principle

A protocol is not minimal merely because its authors describe it as minimal. Minimality must be demonstrated by controlled removal and downstream reconstruction testing.

## 2. Unit of testing

Tests MAY remove:

1. one scalar field;
2. one nested field;
3. one object member;
4. one array entry class;
5. one top-level section.

The source artifact MUST remain unchanged. Every mutation is a derived test fixture with its own identifier and content hash.

## 3. Required downstream questions

For each derived fixture, the evaluator determines whether a downstream system can still:

- identify the source recommendation event;
- understand the interpreted intent;
- understand what was recommended;
- reconstruct why it was recommended;
- identify applied, absent, unknown, or unresolved constraints;
- identify material uncertainty;
- distinguish recommendation from consent, authority, admissibility, commitment, governance, and execution;
- determine what additional evidence or decision is required before action.

## 4. Result classes

- `REQUIRED`: removal causes a material reconstruction or boundary failure.
- `CONDITIONALLY_REQUIRED`: required only when the represented condition exists.
- `REDUNDANT`: removal produces no material loss because equivalent information remains elsewhere.
- `OPTIONAL`: useful but not necessary for the tested reconstruction target.
- `UNDETERMINED`: evidence is insufficient to classify.

A field MUST NOT be classified `REDUNDANT` merely because a human evaluator can infer its value from private context.

## 5. Failure classes

- `IDENTITY_FAILURE`
- `INTENT_RECONSTRUCTION_FAILURE`
- `RECOMMENDATION_RECONSTRUCTION_FAILURE`
- `REASONING_RECONSTRUCTION_FAILURE`
- `CONSTRAINT_STATE_AMBIGUITY`
- `EVIDENCE_OPACITY`
- `UNCERTAINTY_LOSS`
- `BOUNDARY_COLLAPSE`
- `DOWNSTREAM_ACTION_AMBIGUITY`

## 6. Baseline requirement

The unmodified source artifact must first receive a recorded baseline evaluation. Field-removal results are comparative and do not cure failures already present in the baseline.

## 7. Evidence rule

A candidate normative requirement may be proposed only when removal produces a reproducible material failure. One evaluator's preference is insufficient.

## 8. Initial ITC application

For `ITC-REAL-001`, the first sweep should test top-level removal of:

- `alternatives_considered`
- `confidence`
- `uncertainties`
- `unresolved_dependencies`
- `provenance`
- `constraints`

Then test high-risk nested removals including:

- source recommendation identity;
- dimension weights;
- ranking context;
- evidence references;
- constraint state representation;
- withheld/revealed field semantics.

The current canonical sample already contains baseline gaps. Results must distinguish a failure caused by removal from a failure inherited from the original artifact.
