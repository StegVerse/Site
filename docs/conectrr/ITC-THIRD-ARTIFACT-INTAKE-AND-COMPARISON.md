# Conectrr ITC Third-Artifact Intake and Comparison Protocol

**Status:** Active working protocol  
**Applies to:** Conectrr internal ITC validation report  
**Evaluation case:** `ITC-REAL-001`

## Purpose

This protocol defines how the pending Conectrr internal validation report will be preserved and compared against the independent StegVerse downstream evaluation.

The report must not be used to rewrite the source specification, canonical ITC, or prior downstream findings. It is a third source artifact with its own provenance and claims.

## Intake rules

1. Preserve the supplied report unchanged.
2. Record its supplied filename, date, author or emitting system if stated, and source URL or delivery channel.
3. Compute a content hash over the received bytes or exact supplied text.
4. Create a separate UTF-8-normalized derivative only when necessary; never replace the preserved source.
5. Record any encoding corruption as an intake finding.
6. Do not classify Conectrr's internal execution as independent reproduction.

## Claim extraction

Every material report claim must be extracted into a comparison register with:

- claim identifier;
- claim text or bounded paraphrase;
- test performed;
- input artifact used;
- result reported;
- evidence supplied;
- limitation disclosed;
- authority class of the evaluator;
- reproducibility status.

## Comparison outcomes

Each Conectrr internal claim receives one of these outcomes:

- `AGREE` — both evaluations reach materially equivalent conclusions;
- `AGREE_WITH_DIFFERENT_SCOPE` — both are correct within different declared scopes;
- `DISAGREE` — conclusions materially conflict under the same scope and evidence;
- `UNTESTED_BY_STEGVERSE` — Conectrr reports a result that StegVerse has not tested;
- `UNTESTED_BY_CONECTRR` — StegVerse reports a finding not addressed in the internal report;
- `INSUFFICIENT_EVIDENCE` — the claim cannot be evaluated from supplied evidence;
- `DEFER` — disposition requires another artifact, test, or clarification.

## Required separations

The comparison must preserve these distinctions:

```text
schema conformance != semantic sufficiency
boundary validity != reconstructability
internal validation != independent reproduction
point-in-time reconstruction != cryptographic immutability
explanation != evidence resolvability
candidate refinement != normative requirement
```

## Fairness rule

The v1.0 draft is judged against its own declared scope and claims. Candidate v1.1 refinements may explain future improvements, but they cannot be used retroactively as requirements for v1.0.

Conversely, an internal validator cannot establish a broad property merely by checking that a required section exists. The exact property tested must match the property claimed.

## Final outputs

After intake, the evaluation must produce:

1. preserved source report;
2. source receipt and hash record;
3. machine-readable claim comparison register;
4. human-readable comparison report;
5. updated evidence-ledger record;
6. bounded final disposition for ITC v1.0;
7. separate candidate register updates for any v1.1 findings.

## Current state

```text
specification_received=true
canonical_sample_received=true
internal_validation_report_received=false
final_comparison=BLOCKED_ON_SOURCE_ARTIFACT
v1.0_final_disposition=DEFER
```
