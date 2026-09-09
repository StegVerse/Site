# Evidence-to-Normative Promotion Gate

**Status:** Working rule
**Applies to:** Interoperability specifications, protocol schemas, conformance requirements, and boundary contracts

## Purpose

This gate prevents candidate ideas from becoming normative requirements until their necessity has been demonstrated.

## Promotion states

1. `OBSERVATION_RECORDED`
2. `CANDIDATE_DOCUMENTED`
3. `TEST_DEFINED`
4. `EVIDENCE_REPRODUCED`
5. `COMPATIBILITY_REVIEWED`
6. `BOUNDARY_REVIEWED`
7. `ACCEPTED_NORMATIVE`
8. `REJECTED`
9. `DEFERRED`

States are monotonic except that any pre-acceptance state may move to `REJECTED` or `DEFERRED`.

## Required evidence chain

A proposal may enter `ACCEPTED_NORMATIVE` only when all of the following are present:

- a stable proposal identifier;
- the source interoperability finding;
- the affected protocol version;
- an explicit problem statement;
- a reproducible test;
- at least one successful reproduction of the problem;
- a proposed normative rule;
- compatibility impact analysis;
- privacy impact analysis where applicable;
- boundary impact analysis;
- evidence that the change does not collapse responsibility boundaries;
- a conformance test that passes for the proposed rule;
- a disposition record identifying who accepted the change and on what evidence.

## Boundary-preservation rule

A proposal must be rejected if it solves an interoperability problem by making any of the following equivalences:

- recommendation = consent;
- evidence = authority;
- confidence = admissibility;
- approval = commitment;
- commitment = execution;
- execution = legitimacy;
- discovery = governance;
- reconstruction = authorization.

## Conservative default

When evidence is incomplete, the proposal remains non-normative.

The default disposition is:

```text
DEFERRED_PENDING_EVIDENCE
```

Lack of evidence is not evidence of rejection. It is evidence that normative promotion is not yet admissible.

## v1.1 application

The following ITC v1.1 topics remain candidates until each passes this gate:

- stable discovery-event identity;
- explicit constraint-state semantics;
- privacy-preserving evidence receipts or digests;
- empirical minimality requirements.

No candidate is normative merely because both collaborating parties agree that it is promising.
