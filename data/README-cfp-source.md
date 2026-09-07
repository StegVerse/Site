# CFP data ingestion — source and freshness contract

`data/cfp-data.json` is the current-season CFP/NCAAF projection consumed by the public Site surface. Its canonical schema is `schema_version: 2.0.0`.

## Canonical path

```text
College Football Playoff authority reference + NCAA-derived supporting data
        ↓
scripts/fetch_cfp_data.py
        ↓
scripts/check_cfp_data_freshness.py
        ↓
data/cfp-data.json
        ↓
cfp/cfp.js
```

`.github/workflows/cfp_ingest.yml` is the scheduled/manual carrier for this same path. No `CFP_SOURCE_URL` secret, provider API key, or alternate JSON authority is required.

Current supporting AP and FBS scoreboard JSON is fetched from the credential-free `henrygd/ncaa-api` public service. The data contract records the NCAA origin URL separately. This supporting source does not become College Football Playoff authority, and AP data never becomes a CFP committee ranking.

## Fail-closed freshness rule

Historical rankings must never be carried forward into the current data file merely because a fetch fails. A new `last_updated` value does not make old data current.

The required invariants are:

- `season` equals the current UTC season year;
- `freshness.current_season_only` is `true`;
- `freshness.historical_rankings_carried_forward` is `false`;
- `PRE_CFP_RANKINGS` has an empty `rankings` array;
- CFP rankings appear only after a current-season CFP committee ranking is actually observed;
- other polls remain labeled as their own polls and are not promoted to CFP rankings;
- source failures are represented in `freshness.source_errors` and `availability`;
- `freshness.supporting_source_observed` records whether this ingestion actually received current games or a supporting poll.

The retained 2025 material is historical reference only. `historical_reference.included_in_current_rankings` must remain `false`.

## Validation

Checked-in contract validation:

```bash
python scripts/check_cfp_data_freshness.py
```

Live-source execution validation:

```bash
python scripts/fetch_cfp_data.py
python scripts/check_cfp_data_freshness.py --require-live-source
```

The latter fails if both current supporting games and polls are unavailable. This prevents a completely disconnected ingestion run from being labeled healthy merely because it preserved the empty fail-closed schema.

## Authority boundary

This data plane is a public sports-information projection. It grants no sports-officiating, wagering, ticketing, governance, credential, runtime, or publication authority. Source, CI, merge, workflow success, or a generated timestamp is not proof that public deployment or a specific upstream observation occurred.
