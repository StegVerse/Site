# Interoperability Evaluation Program

This directory contains the framework-neutral methodology used to evaluate external interoperability artifacts without allowing any evaluated protocol, including StegVerse, to define the evaluator.

## Current reference case

The first reference case is the Conectrr Intent Transition Contract (ITC) v1.0 draft, evaluated from an actual PEOPLE_DISCOVERY recommendation.

The current bounded result is:

- declared scope: PASS
- structural conformance: PASS
- discovery/governance boundary: PASS_PRELIMINARY
- explainability: PARTIAL_PASS
- reconstructability: PARTIAL_FAIL
- replayability: NOT_ESTABLISHED
- independent verification: NOT_ESTABLISHED
- independent reproduction: NOT_ESTABLISHED
- production observation: NOT_ESTABLISHED
- final disposition: DEFER

## Core documents

- `INTEROPERABILITY_EVALUATION_STANDARD-v0.1.md` — evaluation dimensions and reporting discipline.
- `BOUNDARY_ONTOLOGY-v0.1.md` — lifecycle boundaries, responsibilities, and prohibited collapses.
- `CONFORMANCE_LEVELS-v0.1.md` — progressive conformance levels that prevent evidence inflation.
- `NO-NORMATIVE-CHANGE-WITHOUT-EVIDENCE.md` — requirement that normative protocol changes be justified by demonstrated evidence.
- `EVIDENCE-TO-NORMATIVE-PROMOTION-GATE.md` — promotion process from candidate idea to normative requirement.

## Machine-readable records

- `../../data/interoperability/evaluation-record.schema.json`
- `../../data/interoperability/evaluations/ITC-REAL-001.evaluation.json`
- `../../data/interoperability/normative-change-proposal.schema.json`
- `../../data/interoperability/proposals/ITC-v1.1-candidate-register.json`

## Validation

The repository validates:

1. the canonical Conectrr ITC artifact;
2. the interoperability evidence ledger;
3. the normative-promotion register.

Validation runs through:

```bash
python scripts/check_conectrr_real_itc.py
python scripts/validate_interoperability_evaluation.py
python scripts/validate_normative_promotion.py
```

The GitHub Actions workflow `.github/workflows/interoperability-evidence-validation.yml` runs these checks automatically on relevant pull requests and pushes to `main`.

## Governing discipline

A lower-level pass never implies a higher-level pass.

In particular:

- structural conformance does not imply semantic sufficiency;
- explanation does not imply independent reconstruction;
- reconstruction does not imply verification;
- verification does not imply independent reproduction;
- execution does not imply legitimacy;
- a candidate design improvement does not become normative without demonstrated evidence.
