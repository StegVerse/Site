# ERL / StegSocials Post Preparation Site Handoff

Status: `SITE_PROJECTION_IMPLEMENTED / FOCUSED_VALIDATION_PENDING / PREMIUM_AUTOMATION_SEPARATE`
Canonical task: `SS-EVIDENCE-COMPARISON-001`
COSV ID: `40000100100000`
Canonical handoff: `StegVerse-Labs/StegSocials/docs/STEGSOCIALS_EVIDENCE_CONTEXT_MIRROR_HANDOFF.md`
Canonical StegSocials merge: `3de2f75a0e9accceebd46485d3f3e4e9c09bc03a`
Site PR: `StegVerse-Labs/Site#1136`

## Current architecture

The KV ERL lane is available to the Site/MyKV projection as source provenance for StegSocials post preparation. StegSocials owns the canonical preparation schema and semantics. Site projects discovery, selection, platform shaping, and manual completion without becoming a second evidence or publication owner.

## Implemented Site path

```text
MyKV directory
-> ERL domain (`02_Research/ERL`)
-> ERL file entry
-> Prepare post
-> `stegsocials-prepare.html`
-> canonical `stegverse.stegsocials.post-preparation/v1` bundle shape
-> private target path under `02_Research/StegSocials/Drafts/<platform>/`
-> copy post text / copy bundle
-> manual publication by user
```

Additional MyKV domain:

```text
StegSocials Drafts -> 02_Research/StegSocials/Drafts
```

The UI does not claim a durable KV write merely because it computes a target draft path.

## Product split

```text
STANDARD
ERL discovery + evidence/provenance reference + draft preparation + platform shaping + copy/manual publication

PREMIUM
STANDARD + explicit automated-posting entitlement + separate governed release/provider execution
```

Automated and scheduled publication remain under `SS-KV-SKAP-SOCIAL-RELEASE-001`. The Site preparation surface contains no provider-call path.

## Current files

```text
docs/ERL_STEGSOCIALS_POST_PREPARATION_CONTRACT.md
docs/ERL_STEGSOCIALS_POST_PREPARATION_HANDOFF.md
assets/my-kv-directory.js
my-kv-directory.html
assets/stegsocials-post-preparation.js
stegsocials-prepare.html
tests/stegsocials-post-preparation.test.cjs
.github/workflows/stegsocials-post-preparation.yml
data/session-work-claims.d/site-erl-stegsocials-post-prep-20260908.json
README.md
```

## Validation predicates

- `ERL` domain resolves to `02_Research/ERL`.
- `StegSocials Drafts` resolves to `02_Research/StegSocials/Drafts`.
- standard/manual bundle creation succeeds.
- ERL references outside the ERL lane fail closed.
- credential-like input fails closed.
- standard tier cannot request automated/scheduled publication.
- premium preparation eligibility still performs no provider call.
- the preparation page states that no social provider is contacted.
- README accurately documents standard post preparation versus premium automated posting before merge.

## Remaining work

1. Pass focused Site validation and normal repository orchestration for PR #1136.
2. Update actual `README.md` and remove the temporary README maintenance marker.
3. Merge PR #1136 only after required checks pass.
4. Add authenticated KV draft write/readback integration in a successor step; do not infer persistence from target-path display.
5. Prove ERL/Drafts readback on authentically materialized KV instances/providers before claiming arbitrary-KV runtime support.
6. Keep authentic provider publication and publication receipts in the separate premium release workstream.

No external social provider call, automatic publication, credential resolution, or live publication proof is claimed by this Site handoff.
