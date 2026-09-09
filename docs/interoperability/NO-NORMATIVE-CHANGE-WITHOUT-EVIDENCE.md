# No Normative Change Without Demonstrated Evidence

**Status:** Working governance principle
**Applies to:** ITC evolution and framework-neutral interoperability standards derived from observed testing

## Principle

> No normative change without demonstrated evidence.

A proposed capability, field, requirement, or prohibition may become normative only when it is traceable to at least one of the following:

1. a reproducible interoperability finding;
2. a reconstruction requirement demonstrated by downstream evaluation;
3. an independently observed limitation;
4. a boundary failure reproduced against a declared protocol scope;
5. an implementation divergence that materially affects interoperability.

Ideas that do not yet meet this threshold may remain documented as candidates for exploration, but they must not be represented as required by the standard.

## Purpose

This principle prevents specification growth by preference, prestige, convenience, or speculative completeness. It keeps protocol evolution intentionally conservative and focused on interoperability rather than feature accumulation.

It also protects architectural boundaries. A downstream evaluator may identify missing information needed for reconstruction, but it may not use that finding to transfer governance, authority, admissibility, commitment, or execution responsibility into a discovery protocol.

## Required traceability

Every normative change proposal must record:

- `change_id`
- `target_version`
- `affected_clause_or_field`
- `evidence_class`
- `evidence_references`
- `observed_limitation`
- `reproduction_status`
- `boundary_impact`
- `compatibility_impact`
- `implementation_status`
- `test_status`
- `disposition`

## Evidence classes

Allowed evidence classes are:

- `REPRODUCIBLE_INTEROPERABILITY_FINDING`
- `DOWNSTREAM_RECONSTRUCTION_REQUIREMENT`
- `INDEPENDENTLY_OBSERVED_LIMITATION`
- `REPRODUCED_BOUNDARY_FAILURE`
- `MATERIAL_IMPLEMENTATION_DIVERGENCE`

The following are not sufficient by themselves:

- architectural preference;
- anticipated usefulness;
- elegance;
- feature parity;
- internal convenience;
- untested concern;
- speculative future integration.

## Dispositions

Each proposal must have exactly one disposition:

- `CANDIDATE`
- `EVIDENCE_PENDING`
- `EVIDENCE_SUFFICIENT`
- `ACCEPTED_NORMATIVE`
- `ACCEPTED_OPTIONAL`
- `REJECTED`
- `SUPERSEDED`

A proposal may not move to `ACCEPTED_NORMATIVE` unless:

1. the evidence is preserved;
2. the finding is reproducible or independently observed;
3. the proposed change addresses the finding without expanding the protocol beyond its declared responsibility;
4. compatibility impact is documented;
5. a test exists that can distinguish compliant from non-compliant implementations.

## Fairness rule

A protocol version must be evaluated against the scope and claims it declared when emitted. Later evidence may justify future normative changes, but proposed future capabilities must not be used retroactively to fail an earlier version unless that version explicitly claimed them.

## Boundary preservation rule

A normative addition is invalid if it resolves an interoperability issue by collapsing distinct responsibilities, including:

- recommendation into consent;
- evidence into authority;
- confidence into admissibility;
- approval into commitment;
- commitment into execution;
- execution into legitimacy;
- outcome into retroactive authorization.

## Initial application

For the Conectrr ITC v1.0 evaluation, the following remain candidate v1.1 design goals rather than established normative requirements:

- stable discovery-event identity distinct from export identity;
- explicit semantic states for unresolved constraints;
- privacy-preserving evidence receipts or digests;
- field-removal testing to establish practical minimality.

Each may become normative only after the evidence record and corresponding conformance test are completed.
