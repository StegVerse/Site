# ITC Evidence-Linked Change Log v0.1

**Status:** Working draft
**Created:** 2026-07-26
**Purpose:** Preserve a transparent, reproducible record of how proposed ITC revisions arise from observed interoperability findings rather than assumption.

## Change-entry requirements

Every proposed revision must identify:

- change identifier;
- affected ITC version;
- proposed target version;
- originating evaluation artifact or external response;
- observed finding;
- affected boundary or reconstructability property;
- proposed change;
- disposition: proposed, accepted-in-principle, normative, optional, implementation-specific, rejected, or deferred;
- supporting evidence references;
- known tradeoffs;
- verification status.

## Entries

### ITC-CHG-001 — Stable source-event identity

- **Origin:** First real downstream evaluation of ITC v1.0 canonical sample
- **Finding:** Export-time `itc_id` and `emitted_at` do not preserve a stable identity for the underlying discovery event across repeated exports.
- **Affected property:** Identity stability; reconstructability; replay
- **Proposed change:** Distinguish stable discovery-event identity from emission/export identity and consider a canonical content hash.
- **Disposition:** Accepted in principle as an ITC v1.1 candidate design goal
- **Normative status:** Not yet normative
- **Verification:** Not implemented or tested

### ITC-CHG-002 — Explicit constraint-state semantics

- **Origin:** First real downstream evaluation of ITC v1.0 canonical sample
- **Finding:** `null`, empty objects, and empty arrays conflate materially different states such as not configured, unknown, default applied, unavailable, and not applicable.
- **Affected property:** Semantic reconstruction; constraint reconstruction
- **Proposed change:** Define explicit machine-readable semantic states for unresolved or absent constraints.
- **Disposition:** Accepted in principle as an ITC v1.1 candidate design goal
- **Normative status:** Not yet normative
- **Verification:** Not implemented or tested

### ITC-CHG-003 — Privacy-preserving evidence verification

- **Origin:** First real downstream evaluation of ITC v1.0 canonical sample
- **Finding:** Internal evidence references explain provenance but are not independently resolvable by an external downstream evaluator.
- **Affected property:** Evidence reconstruction; verification
- **Proposed change:** Explore verification receipts, evidence digests, or bounded proof artifacts that preserve privacy while strengthening provenance.
- **Disposition:** Accepted in principle as an ITC v1.1 candidate design goal
- **Normative status:** Not yet normative
- **Verification:** Not implemented or tested

### ITC-CHG-004 — Empirical minimality testing

- **Origin:** First real downstream evaluation and subsequent architectural discussion
- **Finding:** The v1.0 schema is complete by declaration, but minimum sufficiency has not been demonstrated.
- **Affected property:** Minimality; interoperability burden
- **Proposed change:** Perform systematic field-removal and section-removal testing against downstream reconstruction criteria.
- **Disposition:** Accepted in principle as an ITC v1.1 candidate design goal
- **Normative status:** Test methodology to be defined before any field is reclassified
- **Verification:** Not started

### ITC-CHG-005 — Evidence-linked specification evolution

- **Origin:** External architect response following first-round downstream evaluation
- **Finding:** Publishing new versions without tracing changes to observed findings would make specification evolution less transparent and less reproducible.
- **Affected property:** Specification governance; provenance; evolution readiness
- **Proposed change:** Maintain a formal change log alongside the ITC specification, linking every revision to an observed interoperability finding, reconstruction requirement, or architectural refinement.
- **Disposition:** Accepted for immediate implementation in the evaluation record
- **Normative status:** Process rule for the collaborative evaluation; not yet an ITC schema requirement
- **Verification:** This document is the initial implementation

## Fairness rule

ITC v1.0 must be evaluated on its own declared scope and intended capabilities. Candidate v1.1 improvements may arise from v1.0 findings, but v1.0 must not be retroactively failed for capabilities it did not claim to provide.

## Classification rule

Every finding must be assigned to one of four categories:

1. demonstrated by v1.0;
2. intentionally unresolved in v1.0;
3. candidate normative requirement for v1.1;
4. optional or implementation-specific behavior.

No item moves into category 3 solely through agreement. Normative status requires an explicit specification change and supporting test evidence.
