# Independent Minimality Evaluator Instructions

## Purpose

This document defines a repeatable downstream procedure for classifying whether an ITC field or section is REQUIRED, CONDITIONALLY_REQUIRED, REDUNDANT, OPTIONAL, or UNDETERMINED.

## Evaluator posture

The evaluator must not know which field or section was removed until after completing the reconstruction attempt.

The evaluator must assess only the supplied fixture and may not query Conectrr or inspect the canonical ITC during the attempt.

## Required questions

For each fixture, answer:

1. Can the evaluator identify the interpreted intent?
2. Can the evaluator identify what was recommended?
3. Can the evaluator explain why the recommendation exists?
4. Can the evaluator identify the material criteria and constraints?
5. Can the evaluator identify uncertainty and unresolved dependencies?
6. Can the evaluator distinguish discovery from consent, authority, admissibility, commitment, governance, and execution?
7. Can the evaluator determine whether the recommendation may proceed without making an unauthorized inference?
8. Can the evaluator identify provenance sufficient to attribute the recommendation to a source process?
9. Did the fixture introduce a new ambiguity not present in the canonical record?
10. Did the evaluator rely on assumptions not grounded in the fixture?

## Classification rules

### REQUIRED

Removal causes at least one new material failure in explanation, reconstruction, boundary preservation, provenance, or downstream decision independence.

### CONDITIONALLY_REQUIRED

The removed element is necessary only when a stated condition applies. The condition must be explicit and testable.

### REDUNDANT

Removal introduces no new failure because equivalent information is already preserved elsewhere.

### OPTIONAL

Removal introduces no material failure and the information is useful but not necessary to the handoff contract.

### UNDETERMINED

Evidence is insufficient, evaluators disagree materially, or the canonical record's inherited limitations prevent attribution.

## Evidence discipline

A classification requires:

- the fixture identifier and hash;
- evaluator identity or pseudonymous evaluator reference;
- evaluator answers;
- inherited limitations;
- newly introduced failures;
- classification rationale;
- whether the result was independently reproduced.

No single internal evaluation may be labeled independently reproduced.

## Boundary rule

A field must not be classified as unnecessary merely because the evaluator filled the gap by assuming consent, authority, admissibility, commitment, or execution state.

An assumption that collapses a boundary is itself a test failure.
