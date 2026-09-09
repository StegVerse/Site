# ERL / StegSocials Post Preparation Site Projection Contract

Canonical task: `SS-EVIDENCE-COMPARISON-001`
Canonical COSV ID: `40000100100000`
Canonical owner: `StegVerse-Labs/StegSocials`
Canonical handoff: `StegVerse-Labs/StegSocials/docs/STEGSOCIALS_EVIDENCE_CONTEXT_MIRROR_HANDOFF.md`
Canonical schema: `stegverse.stegsocials.post-preparation/v1`
Canonical implementation merge: `StegVerse-Labs/StegSocials@3de2f75a0e9accceebd46485d3f3e4e9c09bc03a`
Status: `SITE_PROJECTION_IMPLEMENTED / AUTHENTIC_PROVIDER_PUBLICATION_NOT_CLAIMED`

## Purpose

Project the canonical StegSocials ERL-backed preparation capability into MyKV without creating a second preparation contract or evidence authority.

Site exposes the user-facing navigation and local preparation surface. `StegVerse-Labs/StegSocials` owns the canonical preparation schema, deterministic preparation semantics, evidence relationship, and standard-versus-premium product boundary.

## Canonical product model

```text
STANDARD
eligible KV -> ERL reference -> StegSocials evidence/provenance -> private platform-shaped draft -> user review/edit -> manual publication

PREMIUM
STANDARD + explicit automated-posting entitlement -> separate governed provider release path -> schedule/automatic publish -> result/receipt
```

Preparation is standard functionality. Automated or scheduled provider execution is premium. This Site projection never interprets draft preparation as publication.

## Site projection surfaces

```text
assets/my-kv-directory.js
my-kv-directory.html
assets/stegsocials-post-preparation.js
stegsocials-prepare.html
tests/stegsocials-post-preparation.test.cjs
.github/workflows/stegsocials-post-preparation.yml
```

`assets/my-kv-directory.js` exposes two additional KnowledgeVault domains:

```text
ERL                -> 02_Research/ERL
StegSocials Drafts -> 02_Research/StegSocials/Drafts
```

ERL file entries can link to `stegsocials-prepare.html` with an ERL reference. The preparation surface builds the canonical schema shape for a standard/manual draft, shows the target KV draft path, and offers copy-text/copy-bundle completion. It performs no provider call and does not resolve or store credentials.

## Preparation invariants

- ERL references must remain under `02_Research/ERL/`.
- ERL authority remains ERL.
- Standard preparation uses `PREPARE_ONLY` or `MANUAL` semantics.
- Automated/scheduled plans require premium entitlement in the canonical StegSocials contract.
- The Site builder rejects secret/credential-like keys.
- `provider_call_performed=false` for all preparation bundles constructed by Site.
- `credential_material_present=false` for all preparation bundles constructed by Site.
- `publication_authority_effect=NONE_PREPARATION_ONLY`.
- Site does not claim that a displayed target KV path has been durably written unless an authentic KV write/readback path later proves it.
- Site does not perform external social publication from the preparation surface.

## KnowledgeVault relationship

The user-owned KnowledgeVault currently contains the canonical platform draft hierarchy:

```text
02_Research/StegSocials/Drafts/
  LinkedIn/
  Facebook/
  Instagram/
  X/
  Other/
```

A first standard/manual LinkedIn bundle for the NSA/FBI/CISA AI-distillation source was materialized in the user-owned KV. That user-owned artifact is evidence of the draft-lane shape; it is not evidence of arbitrary-user KV propagation or external publication.

## Premium boundary

Premium provider execution remains outside this Site preparation projection and follows the separately registered `SS-KV-SKAP-SOCIAL-RELEASE-001` path. Site preparation does not accept OAuth tokens, cookies, passwords, API keys, refresh tokens, private keys, or other provider credentials.

## Validation

The focused Site workflow runs `node tests/stegsocials-post-preparation.test.cjs` and verifies:

- ERL and StegSocials Drafts directory registration;
- standard/manual bundle construction;
- canonical ERL authority reference;
- platform draft path construction;
- refusal of standard automated posting;
- refusal of non-ERL paths;
- refusal of credential-like material;
- premium entitlement semantics without provider execution.

## Remaining runtime/product work

1. Prove the MyKV directory bridge can read the ERL and Drafts paths for each authentically materialized KV provider/instance.
2. Add a canonical authenticated KV draft writer/readback path before claiming the Site-generated bundle is durably saved from the UI.
3. Expand platform shaping only where backed by current platform constraints.
4. Keep provider execution entirely behind the premium release task and authentic provider result/receipt evidence.
5. Preserve ERL and evidence references into any eventual publication record.

Site is a projection and preparation interface. It does not replace the canonical StegSocials implementation or ERL evidence authority.
