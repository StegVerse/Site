# ITC-REAL-001 Preliminary Boundary Evaluation

## Evaluation class

```text
source_artifact=EXTERNAL_CONECTRR_ARTIFACT
stegverse_evaluation=INTERNAL_EXECUTION
publicly_inspectable=true
independently_reproduced=false
production_observed=false
final_disposition=PENDING_SOURCE_VALIDATION_REPORT
```

## Scope

This preliminary evaluation compares the received Conectrr ITC specification and the canonical sample generated from an actual `PEOPLE_DISCOVERY` recommendation against the agreed two-direction boundary:

1. Conectrr must not assume downstream consent, authority, admissibility, commitment, governance, or execution responsibility.
2. Conectrr must preserve enough discovery context for a downstream system to independently understand and evaluate the recommendation.

This is not yet a final validation. The Conectrr internal validation report remains outstanding.

## Preliminary dimension findings

| Dimension | Finding | Basis |
|---|---|---|
| Discovery/governance separation | ESTABLISHED_IN_ARTIFACT | The schema contains recommendation evidence and explanation, not approval or execution instructions. |
| Consent transfer | NOT_ASSERTED | No action-specific consent field or claim appears. |
| Authority transfer | NOT_ASSERTED | No authority grant or delegation appears. |
| Admissibility transfer | NOT_ASSERTED | The sample does not claim that the recommendation may proceed. |
| Commitment or execution transfer | NOT_ASSERTED | No obligation or executable command appears. |
| Intent legibility | ESTABLISHED_WITH_ENCODING_DEFECT | Intent is present, but mojibake corrupts French text. |
| Criteria legibility | ESTABLISHED | Dimensions and weights are explicit and sum to 1.00. |
| Constraint reconstruction | NOT_ESTABLISHED | All operational constraint fields are null or empty; the sample admits default assumptions may have been applied. |
| Recommendation identity stability | DISPUTED | `result_reference` appears truncated or malformed and is not demonstrated to be stable. |
| Reasoning legibility | PARTIAL | Human-readable reasoning exists, but it is not linked to resolvable evidence records. |
| Evidence reconstructability | NOT_ESTABLISHED | The sole evidence reference is an internal, non-resolvable summary. |
| Alternatives reconstruction | NOT_ESTABLISHED | 111 candidates were evaluated, but alternatives are not persisted. |
| Confidence transparency | ESTABLISHED | Overall and dimension-level confidence are explicit. |
| Uncertainty disclosure | ESTABLISHED | Known missing alternatives and visibility uncertainty are disclosed. |
| Dependency disclosure | PARTIAL | Identity and trust dependencies are disclosed but marked non-blocking without downstream justification. |
| Provenance | PARTIAL | Engine and timestamps are present; specification version values conflict. |
| Immutability | NOT_ESTABLISHED | The source explicitly states that immutability is simulated and each export creates a new identifier and timestamp. |
| Minimality | NOT_ESTABLISHED | No field-removal or necessity test has yet been performed. |

## Material findings requiring tests

### F-01 — Constraint evidence is absent

The specification requires preservation of privacy, visibility, availability, AI participation, and profile-field constraints. The canonical sample provides structural placeholders but no actual constraint evidence.

A downstream evaluator cannot determine whether:

- no constraints existed;
- constraints existed but were unavailable;
- default constraints were applied;
- constraint enforcement was skipped.

These states must not collapse into the same empty representation.

### F-02 — `result_reference` appears malformed

The submitted value ends with:

```text
PEOPLE_DISCOVERY_Multilingual_linguist_Multilingualism (EN/
```

This does not resemble a complete opaque identifier and may expose content-derived profile information. The test must determine whether this is truncation, serialization damage, or the actual reference format.

### F-03 — Evidence is descriptive but not independently resolvable

`Conectrr Network` and `Discovery engine result with compatibility scoring` describe the source but do not permit independent inspection or reconstruction. This may support explanation but does not yet establish independent reconstructability.

### F-04 — Alternatives are known to exist but not preserved

The artifact reports that 111 candidates were evaluated and one remained after filtering, while `alternatives_considered` is empty. The uncertainty is properly disclosed, but the sample does not meet the specification's stronger reconstruction language for alternatives.

### F-05 — Visibility posture is internally inconsistent

The sample states that visibility was not set and defaults may have been applied. It also lists `contact_info` among `revealed_fields`, while the narrative states that contact information is never contained in the ITC. Although no contact value is included, the semantic meaning of `revealed_fields` must be clarified.

### F-06 — Version identity is inconsistent

The sample contains:

```text
itc_version=1.0-draft
itc_record_metadata.specification_version=1.0.0
provenance.itc_specification_version=1.0-draft
```

Schema version and specification version need distinct, consistently named fields.

### F-07 — Immutability claim is not yet satisfied

The historical recommendation record may be stable, but a new `itc_id` and `emitted_at` are generated on each export. Therefore identical source state may produce multiple differently identified ITCs. This prevents direct identity-based replay unless a stable source-event identifier and content hash are also preserved.

### F-08 — Encoding integrity failed in transit or export

French text and punctuation contain mojibake. A canonical handoff must preserve Unicode content byte-for-byte or declare the transformation that occurred.

## Preliminary disposition

```text
schema_shape=PASS
boundary_overreach=PASS_PRELIMINARY
explainability=PARTIAL_PASS
reconstructability=PARTIAL_FAIL
immutability=FAIL_NOT_IMPLEMENTED
minimality=NOT_TESTED
canonical_identity=DISPUTED
final_boundary_result=DEFER
```

The appropriate current downstream decision is `DEFER`, not rejection of the architecture. The sample demonstrates a strong responsibility boundary and meaningful explanatory content, but it does not yet provide sufficient evidence for independent reconstruction of constraint enforcement, candidate selection, or stable artifact identity.

## Required next inputs

1. Conectrr's internal validation report.
2. Clarification or correction of the `result_reference` format.
3. A stable source recommendation or MatchExplanation identifier in the canonical handoff.
4. The distinction between absent, unavailable, defaulted, and unenforced constraints.
5. A resolvable evidence-reference model or explicit bounded claim that evidence is descriptive only.

## Next test tranche

After the source validation report is installed:

- run structural conformance;
- run forbidden-state/overreach checks;
- run semantic sufficiency checks;
- run stable-identity and deterministic-emission checks;
- run field-removal minimization;
- import the source unchanged into the canonical event stream;
- produce independent `ALLOW`, `DENY`, and `DEFER` downstream evaluations without mutating the source;
- publish a bounded final report and response packet for Conectrr.
