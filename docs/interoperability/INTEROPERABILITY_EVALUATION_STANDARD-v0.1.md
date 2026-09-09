# Interoperability Evaluation Standard v0.1

**Status:** Working Draft  
**Purpose:** Provide a framework-neutral method for evaluating discovery, governance, execution, and evidence handoffs.

## 1. Evaluation Principle

No protocol receives one undifferentiated pass/fail result. Evaluation is separated into independently reportable properties.

## 2. Required Evaluation Dimensions

1. **Boundary Integrity** — whether the artifact remains inside its declared architectural layer.
2. **Explainability** — whether a human or machine can understand why the artifact exists.
3. **Reconstructability** — whether the causal and logical path can be independently reconstructed.
4. **Replayability** — whether the artifact can be processed again under declared rules.
5. **Identity Stability** — whether source identity, emission identity, and supersession identity remain distinguishable.
6. **Evidence Sufficiency** — whether evidence is present, resolvable, or accompanied by bounded verification receipts.
7. **Constraint Semantics** — whether absent, unknown, defaulted, unavailable, and inapplicable states remain distinguishable.
8. **Minimality** — whether each required field survives systematic removal testing.
9. **Immutability** — whether canonical content and lineage are preserved without mutation.
10. **Evolution Readiness** — whether corrections, supersessions, and schema changes remain reconstructable.

## 3. Required Result States

Each dimension MUST report one of:

- `PASS`
- `PASS_PRELIMINARY`
- `PARTIAL_PASS`
- `PARTIAL_FAIL`
- `FAIL`
- `NOT_ESTABLISHED`
- `NOT_TESTED`
- `NOT_APPLICABLE`
- `DEFER`

## 4. Evidence Classes

Every evaluation MUST identify its evidence class:

- `INTERNAL_EXECUTION`
- `PUBLIC_REPLAYABLE`
- `INDEPENDENTLY_REPRODUCED`
- `PRODUCTION_OBSERVED`

These are cumulative claims only when each layer is actually established.

## 5. Boundary Test Sequence

1. Declare the source layer.
2. Declare the downstream layer.
3. Identify prohibited state transfer.
4. Validate structural conformance.
5. Validate semantic sufficiency.
6. Test independent reconstruction.
7. Test identity stability.
8. Test evidence resolvability.
9. Perform field-removal minimality testing.
10. Publish bounded findings and unresolved limitations.

## 6. Fairness Rule

A protocol MUST be evaluated against its declared version and current claims. Proposed future capabilities may be recorded as design goals but MUST NOT be used to retroactively fail the current version.

## 7. Initial Reference Implementation

The first working application of this standard is the external Conectrr ITC v1.0 draft and canonical PEOPLE_DISCOVERY sample. That evaluation is a reference case, not a definition of the standard itself.
