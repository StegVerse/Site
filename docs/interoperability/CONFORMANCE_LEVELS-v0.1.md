# Interoperability Conformance Levels v0.1

**Status:** Working Draft

## Level 0 — Declared

The protocol declares its scope, fields, exclusions, and architectural boundary.

No execution evidence is implied.

## Level 1 — Structurally Conformant

A supplied artifact conforms to the declared schema and required sections.

Structural conformance does not establish semantic sufficiency.

## Level 2 — Boundary Valid

The artifact does not cross into prohibited authority, consent, governance, commitment, execution, or outcome state.

## Level 3 — Explainable

A downstream human or system can understand the artifact's purpose, reasoning, confidence, limitations, and provenance.

## Level 4 — Reconstructable

A downstream evaluator can independently reconstruct the material path that produced the artifact, including constraints, dependencies, and evidence posture.

## Level 5 — Replayable

The artifact can be processed again under declared rules with stable source identity and bounded expectations.

Replayability does not automatically establish reconstructability.

## Level 6 — Verifiable

Canonical serialization, stable identifiers, evidence digests or receipts, and lineage allow independent integrity verification.

## Level 7 — Independently Reproduced

An external implementation reproduces the declared result or produces a documented, bounded disagreement from the same source inputs.

## Level 8 — Production Observed

The protocol has been observed operating in a real production environment with preserved receipts and without expanding its claims beyond the evidence.

## Reporting Rule

A protocol MUST report the highest fully established level and all partial results separately. It MUST NOT claim a higher level merely because a lower-level test passed.

## Current Conectrr ITC Posture

Based on the first two supplied artifacts only:

- Level 0: PASS
- Level 1: PASS
- Level 2: PASS_PRELIMINARY
- Level 3: PARTIAL_PASS
- Level 4: PARTIAL_FAIL
- Levels 5–8: NOT_ESTABLISHED

Final disposition remains deferred pending the internal validation report and executable completion of the first-round test suite.
