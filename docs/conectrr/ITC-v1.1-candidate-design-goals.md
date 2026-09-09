# ITC v1.1 Candidate Design Goals

**Status:** Working design record
**Date:** 2026-07-26
**Source:** First Conectrr ↔ StegVerse interoperability evaluation
**Normative effect:** None. This document records candidate goals for a future ITC v1.1 draft. It does not retroactively modify or invalidate ITC v1.0-draft.

## 1. Confirmed v1.0 architectural result

The first real downstream evaluation found that the Conectrr ITC preserves the intended discovery/governance boundary in the submitted canonical sample.

The artifact did not assert:

- consent;
- authority;
- admissibility;
- commitment;
- governance approval;
- execution authorization;
- recommendation outcome state.

This is the primary architectural result of the first round.

## 2. Candidate v1.1 goals

### 2.1 Stable discovery-event identity

Separate the persistent identity of the underlying discovery event from the identity of an emitted or exported ITC instance.

Candidate fields:

```json
{
  "source_event_id": "<persistent discovery-event identifier>",
  "source_created_at": "<source event timestamp>",
  "itc_emission_id": "<individual emission identifier>",
  "emitted_at": "<emission timestamp>",
  "canonical_content_hash": "<hash over canonicalized ITC content>"
}
```

Required property: repeated exports of the same unchanged discovery event remain correlatable without being falsely represented as the same emission.

### 2.2 Explicit constraint-state semantics

Replace ambiguous `null` values with explicit semantic states.

Candidate state vocabulary:

- `APPLIED`
- `DEFAULT_APPLIED`
- `NOT_CONFIGURED`
- `NOT_APPLICABLE`
- `UNAVAILABLE`
- `UNKNOWN`
- `NOT_RECORDED`

Where a default is applied, the source and version of the default should be identified.

Required property: a downstream system must be able to distinguish absence of a constraint from absence of knowledge about the constraint.

### 2.3 Privacy-preserving evidence verification

Allow downstream verification without requiring disclosure of private source data or granting governance authority to Conectrr.

Candidate evidence properties:

```json
{
  "evidence_reference": "<stable reference>",
  "resolution_class": "PUBLICLY_RESOLVABLE | AUTHORIZED_RESOLUTION_REQUIRED | INTERNAL_ONLY | SUMMARY_ONLY",
  "evidence_digest": "<optional cryptographic digest>",
  "verification_receipt": "<optional bounded verification receipt>"
}
```

Required property: the ITC should disclose whether evidence is independently inspectable, conditionally inspectable, or explanatory only.

### 2.4 Empirical minimality

Do not assume the current schema is minimal. Test it.

For each field or bounded field group:

1. remove the field;
2. preserve all other content;
3. run downstream reconstruction;
4. record whether explanation, boundary separation, and independent decision posture remain intact;
5. classify the field as mandatory, conditionally mandatory, optional, or redundant.

Required property: the final minimum handoff must be evidence-based rather than intuition-based.

## 3. Version fairness rule

ITC v1.0-draft must be evaluated according to its own stated claims and implementation limits.

The candidate v1.1 goals above must not be used to retroactively fail v1.0. Instead, the evaluation must distinguish:

- what v1.0 already proves;
- what v1.0 discloses as unresolved;
- what should become normative in v1.1;
- what should remain optional or implementation-specific.

## 4. Evidence posture

```text
architectural_boundary_v1_0=PASS_PRELIMINARY
v1_1_design_goals_agreed_in_principle=true
v1_1_specification_published=false
v1_1_implementation_available=false
independent_reproduction=false
production_observed=false
```

## 5. Next actions

- complete the v1.0 downstream evaluation after receipt of the Conectrr internal validation report;
- compare Conectrr internal findings with StegVerse downstream findings;
- create executable field-removal fixtures;
- define canonical identity and hashing requirements;
- define constraint-state conformance tests;
- define evidence-resolution classes and receipts;
- prepare a bounded v1.1 working-draft proposal only after the first-round record is complete.
