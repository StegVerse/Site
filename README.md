# StegVerse-Labs / Site

Public mirror for the StegVerse ecosystem. Renders proof surfaces, transition status,
governance documentation, and product information from canonical source data.

**Live site:** https://stegverse-labs.github.io/Site/

---

## Boundary

```
formalism-tests    =  proof/test authority
StegVerse-002      =  governed deployment authority
Site               =  public mirror only
Ecosystem Chat     =  governed conversational capability interface, not proof authority or shell authority

Site publishes receipts. Site does not generate them.
Site must never become the authority for receipts, transitions, accreditation, shell execution, credentials, or repository administration.
```

### Ecosystem Chat boundary markers

```text
raw_shell_allowed=false
authority_required=true
rate_limit_required=true
receipt_required_for_execution=true
Restricted admin=false for public Site runtime
```

### Ecosystem Chat functional scope and expansion model

Ecosystem Chat is being developed as a governed conversational interface through
which humans and autonomous entities can discover, invoke, combine, and continue
working with capabilities. It is not defined by one LLM provider and its scope is
intended to expand by integrating provider-owned and StegVerse-native capabilities
without erasing provider identity or provenance.

The intended LLM capability is initially a distributed service across named model
sources. Named models may contribute independently; Ecosystem Chat governs source
selection, evidence, reconciliation, provenance, and the resulting answer. No
contributing model becomes final governance authority merely because it generated a
response. The unfinished 12-lane analysis may inform provider comparison and routing,
but it is not a prerequisite for defining or implementing this distributed-service
contract.

The future native Ecosystem Chat LLM is distinguished by governance participating in
reasoning and generation rather than relying primarily on reactive post-generation
guardrails:

> **No reactive guardrails. Native governance instead.**

External capability expansion preserves ownership. For example, a visual,
interactive-topology, animation, or real-time-3D capability supplied by AI SiteFlow
would remain an **AI SiteFlow capability** when invoked through Ecosystem Chat.
Ecosystem Chat supplies the governed conversational integration boundary; it does not
relabel the provider's capability as a StegVerse-native renderer.

These statements describe intended architecture and capability semantics. They do not
establish that distributed multi-LLM execution, a live AI SiteFlow endpoint, Site#242
activation, or a real external render receipt has already been observed.

---

## Site structure

### Public pages

| Page | Purpose |
|------|---------|
| [`index.html`](index.html) | Home — Ecosystem Chat entry surface, scope/expansion positioning, and current chat experience |
| [`ecosystem-chat.html`](ecosystem-chat.html) | User advancement console — local route scaffold, no shell, no credential authority, no proof authority |
| [`tga-reexamine.html`](tga-reexamine.html) | Temporal Governed Analysis “Re-examine” projection — exact source/time/rule-context/provenance/variance display with local-only media binding; projection is not ground truth or adjudicative authority |
| [`hugging-face.html`](hugging-face.html) | Public NVIDIA–Hugging Face acquisition-impact landing page — explains the pre-acquisition reference, Hugging Face capability axis, NVIDIA absorption axis, and links to the living analysis, governance paper, and technical evidence |
| [`demo.html`](demo.html) | Execution demo — commit-boundary decision with receipt hash |
| [`stegverse-002.html`](stegverse-002.html) | StegVerse-002 / core-lite mirror — gate map, live evidence |
| [`formalism-tests-stage-1-to-31.html`](formalism-tests-stage-1-to-31.html) | Stage 1–31 proof mirror — Beta_Orionis / StegVerse-001 |
| [`stegfinco.html`](stegfinco.html) | StegFinCo — governed financial execution layer |
| [`product.html`](product.html) | Trust & Risk Systems Audit — product details |
| [`pricing.html`](pricing.html) | Pricing — rendered from canonical manifest |
| [`methodology.html`](methodology.html) | Methodology — evidence over self-attestation |
| [`about.html`](about.html) | About StegVerse |
| [`support.html`](support.html) | Support StegVerse Research |
| [`Papers.html`](Papers.html) | Papers and research |
| [`cfp/cfp.html`](cfp/cfp.html) | CFP/NCAAF current-season projection with explicit season, phase, freshness, and degraded-state semantics |
| [`stegsocials-prepare.html`](stegsocials-prepare.html) | ERL-backed StegSocials preparation surface — standard/manual draft preparation only; no social-provider call or credential resolution |

### ERL-backed StegSocials post preparation

Site projects the canonical StegSocials `stegverse.stegsocials.post-preparation/v1` capability into MyKV. The canonical owner is `StegVerse-Labs/StegSocials`; Site does not create a competing preparation or evidence authority.

MyKV exposes `02_Research/ERL` and `02_Research/StegSocials/Drafts`. Eligible ERL file entries can open `stegsocials-prepare.html`, which builds a private platform-shaped preparation bundle, preserves the ERL reference, shows the intended KV draft path, and supports copy/manual-publication completion.

```text
STANDARD
KV -> ERL -> StegSocials preparation -> private draft -> review/edit -> manual publication

PREMIUM
STANDARD + explicit entitlement -> separate governed provider release path -> automated/scheduled publication -> result/receipt
```

Automated or scheduled publication is premium and remains outside the Site preparation surface. Preparation performs no provider call, accepts no provider credential material, and does not claim that a displayed target KV path has been durably written without authentic KV write/readback evidence.

Relevant surfaces:

| File | Purpose |
|------|---------|
| [`assets/my-kv-directory.js`](assets/my-kv-directory.js) | MyKV ERL and StegSocials Drafts directory registration plus read-only directory semantics |
| [`my-kv-directory.html`](my-kv-directory.html) | ERL entry browser with Prepare post action |
| [`assets/stegsocials-post-preparation.js`](assets/stegsocials-post-preparation.js) | Local canonical-shape preparation builder, entitlement boundary, and credential-like input refusal |
| [`stegsocials-prepare.html`](stegsocials-prepare.html) | Standard preparation/manual completion UI |
| [`tests/stegsocials-post-preparation.test.cjs`](tests/stegsocials-post-preparation.test.cjs) | Deterministic ERL, tier, provider-call, and credential refusal tests |
| [`docs/ERL_STEGSOCIALS_POST_PREPARATION_CONTRACT.md`](docs/ERL_STEGSOCIALS_POST_PREPARATION_CONTRACT.md) | Site projection contract referencing canonical StegSocials ownership |
| [`docs/ERL_STEGSOCIALS_POST_PREPARATION_HANDOFF.md`](docs/ERL_STEGSOCIALS_POST_PREPARATION_HANDOFF.md) | Site integration handoff and remaining runtime predicates |

### CFP/NCAAF current-season projection

The CFP tracker uses `data/cfp-data.json` schema `2.0.0` and must distinguish current-season observations from historical material. During `PRE_CFP_RANKINGS`, current games and non-CFP polls may be shown while the CFP `rankings` array remains empty. AP, Coaches, ESPN, or historical CFP rankings are never silently promoted into current CFP committee rankings.

The canonical path is `scripts/fetch_cfp_data.py` → `scripts/check_cfp_data_freshness.py` → `data/cfp-data.json` → `cfp/cfp.js`. Historical rankings are never carried forward merely because a source fetch fails or a timestamp changes. The 2025 lane remains historical reference only under `sports/ncaaf/2025/`.

The scheduled/manual carrier is `.github/workflows/cfp_ingest.yml`; it reuses the same canonical ingestion and validator rather than creating a second data contract. No CFP source secret or provider API key is required. Source, CI, merge, workflow success, generated timestamps, and deployment are not equivalent to a current public source observation or public-site verification.

### NVIDIA–Hugging Face living analysis

The primary longitudinal question is whether NVIDIA expands what Hugging Face was built to do, increasingly absorbs Hugging Face into the NVIDIA stack for NVIDIA-specific strategic ends, or whether both happen at the same time.

`hugging-face.html` is the public orientation surface. `hugging-face-analysis.html` is the evidence-linked measurement surface. The fixed `nvidia-hugging-face-governance-analysis.html` remains a related governance argument rather than the longitudinal metric itself.

The substantive comparison origin is the **pre-acquisition Hugging Face reference** `B0_PRE_ACQUISITION_HF`. It is reconstructed only from retained, dated evidence that predates NVIDIA's acquisition announcement. Existing retained checkpoint `T0` remains immutable and is not rewritten into historical evidence it never contained.

Pre-existing NVIDIA relationships are part of the baseline. Hugging Face documented NVIDIA robotics collaboration before the acquisition announcement, so later NVIDIA involvement is not automatically classified as new absorption. The analysis requires evidence of new or materially increased concentration relative to the pre-acquisition state.

The final measurement is a **two-axis** baseline-deviation trajectory:

- **Hugging Face capability change** (horizontal): contraction ← pre-acquisition baseline → expansion. Component measures cover ecosystem breadth, provider/hardware neutrality, inference/deployment choice, open-access/mission reach, LeRobot/robotics breadth, and third-party ecosystem participation.
- **NVIDIA absorption** (vertical): less NVIDIA-coupled ← pre-acquisition baseline → more NVIDIA-absorbed/coupled. Component measures cover NVIDIA dependency concentration, privileged execution pathways, NVIDIA stack coupling, robotics/Physical AI coupling, strategic-direction control, and neutrality loss.

The axes are independent rather than zero-sum: Hugging Face capability can expand while NVIDIA absorption also increases. For each authentic checkpoint, the combined coordinate is the pair `(Δ Hugging Face capability, Δ NVIDIA absorption)`. Each axis uses the net count of evidence-backed component movements in its positive direction minus evidence-backed movements in its negative direction; unchanged components contribute zero. A coordinate is withheld unless every defined component on both axes has comparable retained evidence. Missing evidence is never treated as zero, and arbitrary percentages or opaque scores are prohibited.

Canonical data remains `data/nvidia-hugging-face-living-analysis.json`. Authentic retained checkpoints remain append-only; `T0` is immutable, and later `T1`, `T2`, ... checkpoints may be added only from authentic observations. Failed or absent observations remain explicit gaps. Source, merge, CI, deployment, route reachability, or the presence of observation code must never be substituted for observation evidence.

Identity, provenance, compatibility, authority/admissibility, and reconstruction remain cross-cutting controls used to verify that a claimed change is real, comparable, attributable, and reconstructable. Site is not the observation authority and grants no execution, admission, credential, publication, or governance authority.

Relevant living-analysis surfaces:

| File | Purpose |
|------|---------|
| [`hugging-face.html`](hugging-face.html) | Public acquisition-impact orientation: why the NVIDIA acquisition matters, what the pre-acquisition baseline means, and how the two axes are interpreted |
| [`hugging-face-analysis.html`](hugging-face-analysis.html) | Living metric definitions, evidence gaps, baseline state, and the Hugging Face capability / NVIDIA absorption two-axis trajectory |
| [`data/nvidia-hugging-face-living-analysis.json`](data/nvidia-hugging-face-living-analysis.json) | Canonical pre-acquisition reference, metric families, trajectory contract, evidence registry, and append-only retained checkpoints |
| [`nvidia-hugging-face-governance-analysis.html`](nvidia-hugging-face-governance-analysis.html) | Fixed long-form governance thesis and architectural argument |
| [`stegos-node/sv-dn1-resident-observation-v3.html`](stegos-node/sv-dn1-resident-observation-v3.html) | Separate technical observation/evidence capability; source presence is not runtime proof |
| [`scripts/validate_nvidia_hugging_face_living_analysis.py`](scripts/validate_nvidia_hugging_face_living_analysis.py) | Deterministic pre-acquisition-baseline, immutable-T0, metric-family, two-axis, evidence, page, and README validator |
| [`docs/NVIDIA_HUGGING_FACE_ANALYSIS_MIRROR_HANDOFF.md`](docs/NVIDIA_HUGGING_FACE_ANALYSIS_MIRROR_HANDOFF.md) | Canonical bounded handoff and completion predicates |

### StegOS same-device operational cards

`stegos-bootstrap/` provides the same-device operational-card UX used to retain and
reuse completed local workflow data without turning Site into an authority plane.
The explicit offline shell includes `persistent-card-ux.js`, the exact canonical
Master Records G23 recovery module, the automatic same-device recovery carrier, and
all eleven card-help routes. The current service-worker propagation generation is
`stegos-web-bootstrap-v16`. v16 imports the exact released v13 runtime predecessor plus
the HIL portable WorkerCoordinator bridges. The HIL activation surface pins both the
worker script URL and local receiver route to protocol `HIL_BROWSER_EVIDENCE_V16`,
requires the receiver to echo that protocol with the exact request/context bindings,
and reports the specific mismatched field if convergence fails. A stale pre-v16
controller therefore cannot silently satisfy the current activation contract. The
roll-forward preserves existing IndexedDB, browser context, and portable
WorkerCoordinator checkout lineage; it does not mint a second claim/fence or create
another runtime, scheduler, heartbeat, WorkerCoordinator, InTr boundary, or custody
implementation.

The normal Master Records path first reuses an exact same-device persisted SV001 proof
when one is available. For the legacy canonical G23 execution whose complete proof
snapshot predates persistent-card retention, the current-iPhone bootstrap makes an
automatic deterministic, hash-verified recovery attempt from the existing same-device
journal. The recovery target is only canonical G23,
`sha256:81a078eeeacffb8fc86d287d7aaa8a9904c6f53973471dad7f6d7c3fa6818a35`;
G24 remains retained duplicate non-custodial evidence and is never substituted. The
exact recovery module and custody package remain owned by `master-records/orchestration`
and are projected byte-for-byte into Site.

Recovery does not grant custody authority. An exact retained proof or successful
unique recovery supplies source material only. Once that exact canonical G23 source
is available, the same-device carrier now performs **automatic machine-governed
continuation** by invoking the already-existing
`StegOSWebBootstrap.executeMasterRecordsSv001Custody()` path. That executor derives a
current reference from the existing HB32 independent oscillator, constructs the
non-authorizing HB-derived carrier binding, and requests a fresh write-once root
Universal InTr decision for this exact custody/reconstruction transition before any
Master Records mutation. The prior SV001 receipt and the recovery result remain
non-authorizing evidence inputs; neither is reused as authority for the next state
change.

If exact retained journal material is incomplete, inconsistent, ambiguous, or does
not uniquely reproduce the canonical source hash, recovery fails closed and exact
manual proof import remains a source fallback. If exact G23 is present but fresh root
InTr governance is denied, missing, mismatched, or times out—or if Master Records
custody/reconstruction does not return PASS—the automatic continuation fails closed
with the exact source retained for a later existing page/resume lifecycle opportunity.
It does not rerun terminal SV001, synthesize G23, mint replacement authority, or start
a new scheduler.

SV001 Master Records custody/reconstruction is a machine-owned transition even when
the execution surface is the current iPhone. Before the Site same-device carrier may
invoke the canonical Master Records portable custody module or append custody and
reconstruction state, the exact
`SV001_MASTER_RECORDS_CUSTODY_AND_RECONSTRUCTION` transition must receive a fresh,
write-once admission from the existing root Universal InTr service worker. The
admission is bound to the registered Node/Interlock, exact canonical G23 source
receipt hash, machine-governed authority class, and current HB-derived carrier
reference. Missing, mismatched, stale, or partial admission fails closed before
Master Records mutation. Historical custody/reconstruction entries are not
grandfathered: an idempotent replay may return PASS only when the same local journal
also retains and validates the matching contemporaneous InTr admission.
Custody/reconstruction without that admission fails closed and must not be repaired
by minting a replacement admission, inferring authorization from G23, or rerunning
terminal SV001. Admission-only state is likewise partial and requires explicit
recovery rather than later reuse.

This path adds no human approval checkpoint and does not create a second InTr runtime,
scheduler, WorkerCoordinator, credential path, heartbeat, oscillator, or custody
authority. The human iOS interaction queue does not authorize or block this
machine-owned transition. No second user-operated device is required;
`CURRENT_USER_IPHONE` remains the intended physical execution surface. HB32 provides
timing/reference/correlation only and grants no execution or transition authority.

Offline caching, same-device UI persistence, and the presence of recovery-capable
source do not establish authentic recovery or Master Records custody. Source/CI/merge,
validation, cache generation, publication, or deployment do not prove that the current
iPhone recovered G23, received a contemporaneous root-InTr ALLOW, materialized Master
Records custody, reconstructed PASS, or produced an SV002 disposition. Site remains
an exact materialization/persistence carrier only; WorkerCoordinator claim/fence
ownership, TV/TVC credential authority, Master Records custody authority, and InTr
transition authority are unchanged.

Relevant source surfaces:

| File | Purpose |
|------|---------|
| [`stegos-bootstrap/persistent-card-ux.js`](stegos-bootstrap/persistent-card-ux.js) | Same-device operational-card hydration/persistence and exact retained proof lookup |
| [`stegos-bootstrap/master-records-sv001-recovery.js`](stegos-bootstrap/master-records-sv001-recovery.js) | Exact canonical G23 retained-journal recovery module |
| [`stegos-bootstrap/master-records-sv001-custody-package.json`](stegos-bootstrap/master-records-sv001-custody-package.json) | Canonical Master Records custody/recovery package projection |
| [`stegos-bootstrap/master-records-auto-recovery.js`](stegos-bootstrap/master-records-auto-recovery.js) | Automatic same-device recovery + current-governance continuation carrier |
| [`stegos-bootstrap/service-worker.js`](stegos-bootstrap/service-worker.js) | Current v16 wrapper/import boundary |
| [`stegos-bootstrap/service-worker-v13-runtime.js`](stegos-bootstrap/service-worker-v13-runtime.js) | Exact retained v13 predecessor runtime |
| [`scripts/validate_stegos_persistent_card_ux.py`](scripts/validate_stegos_persistent_card_ux.py) | Deterministic persistent-card/recovery source validation |
| [`scripts/check_mr_sv001_intr_governance.py`](scripts/check_mr_sv001_intr_governance.py) | Master Records/InTr source boundary validation |
| [`scripts/check_stegos_ipod_bootstrap_projection.py`](scripts/check_stegos_ipod_bootstrap_projection.py) | Exact StegOS projection validation |
| [`docs/STEGOS_PERSISTENT_CARD_UX_MIRROR_HANDOFF.md`](docs/STEGOS_PERSISTENT_CARD_UX_MIRROR_HANDOFF.md) | Persistent-card continuation handoff |
| [`docs/MR_SV001_CURRENT_IPHONE_CUSTODY_MIRROR_HANDOFF.md`](docs/MR_SV001_CURRENT_IPHONE_CUSTODY_MIRROR_HANDOFF.md) | Current-iPhone Master Records custody handoff |

---

## Provider-independent runtime and recovery boundary

The public Site surface is `https://stegverse.org/`. Site #497 / COSV `50000000102000` records the current runtime and recovery posture in machine-readable source rather than inferring it from a historical provider receipt.

```text
canonical runtime = RESIDENT_STEGVERSE
production continuity third-party dependency = false
activation third-party dependency = false
automatic third-party runtime selection = false
Cloudflare quick tunnel required = false
Cloudflare quick tunnel canonical runtime carrier = false
GitHub Actions runtime required = false
GitHub Actions runtime authority = NONE
```

Older Render and `trycloudflare.com` observations remain provenance. `data/third-party-dependency-inventory-supersession.json` marks the retired requirement observations `HISTORICAL_SUPERSEDED`; they are not current dependency, endpoint, liveness, or runtime evidence.

Provider-neutral recovery source is defined by `data/dns-edge-portability.json` and `data/source-publication-recovery.json`. `scripts/materialize_site_recovery_bundle.py` materializes `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` from a local checkout into `build/site-recovery-bundle/source`, emits SHA-256 path hashes in `build/site-recovery-bundle/manifest.json` and `build/site-recovery-bundle/SHA256SUMS`, and requires no GitHub API, GitHub Actions, network access, or provider credentials. `scripts/check_site_recovery_bundle_manifest.py` rematerializes and verifies the bundle deterministically.

Repository/CI materialization proves that the recovery bundle can be constructed from the exact checkout. Site #497 now also records an authentic external-retention round trip: a verified `STEGVERSE_SITE_RECOVERY_BUNDLE_V1` archive was retained in connected Google Drive, downloaded back, matched SHA-256 `a9b81dfb7a34e7b4c627145e6ab817466b92c1ea9176fc41f76e420a2b201b0f`, verified all 3,400 `SHA256SUMS` entries, restored cleanly, and passed the repository-local provider/DNS/recovery/Ecosystem Chat/Master Records/StegOS validator set without GitHub API or GitHub Actions. The private external object locator is intentionally not published.

This proves external retention plus off-GitHub restore and validation. It still does **not** prove publication through a non-GitHub origin, DNS/TLS recovery, exact public-content equivalence, or a resident/provider-neutral public rendezvous. Those remain separate authentic evidence requirements.

Relevant surfaces:

- `data/third-party-runtime-cutover-current.json`
- `data/third-party-dependency-inventory-supersession.json`
- `data/dns-edge-portability.json`
- `data/source-publication-recovery.json`
- `data/site-recovery-bundle-materialization.json`
- `data/off-github-recovery-evidence-2026-09-09.json`
- `scripts/check_no_required_third_party_runtime.py`
- `scripts/check_third_party_dependency_reconciliation.py`
- `scripts/check_dns_edge_portability.py`
- `scripts/check_source_publication_recovery.py`
- `scripts/materialize_site_recovery_bundle.py`
- `scripts/check_site_recovery_bundle_manifest.py`
- `docs/SITE_497_STEGGATE_DEPENDENCY_RECONCILIATION_MIRROR_HANDOFF.md`
