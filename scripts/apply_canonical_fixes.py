#!/usr/bin/env python3
"""
Apply Canonical Fixes
- Reads self_healing_out/GAPS.json from the scanner
- Creates missing scripts/workflows/files from embedded templates
- Appends actions to self_healing_out/REMEDIATIONS.md
Safe: it only creates files that are missing; never deletes.
"""

import json, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / "self_healing_out"
GAPS = OUTDIR / "GAPS.json"
JOURNAL = OUTDIR / "REMEDIATIONS.md"

# ---------------- Templates (compact, proven) ----------------

REBUILD_SCRIPT = """#!/usr/bin/env bash
set -euo pipefail
SHA="${1:-$(git rev-parse HEAD)}"; PREV="${2:-$(git rev-parse HEAD~1)}"; OUTDIR="${3:-rebuild_kit}"
REPO_NAME="${4:-$(basename "$(git rev-parse --show-toplevel)")}"
DATE_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"; mkdir -p "$OUTDIR"
{ echo "repo: $REPO_NAME"; echo "date_utc: $DATE_ISO"; echo "commit_sha: $SHA"; echo "prev_sha: $PREV"; echo "branch: ${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}"; } > "$OUTDIR/meta.txt"
git diff --name-status "$PREV" "$SHA" > "$OUTDIR/changed_files.txt" || true
git diff -U3 "$PREV" "$SHA" > "$OUTDIR/changes.patch" || true
mkdir -p "$OUTDIR/files"
awk '{ if ($1==\"A\" || $1==\"M\" || $1==\"R100\" || $1==\"R\") print $NF }' "$OUTDIR/changed_files.txt" | while read -r f; do
  [ -f \"$f\" ] && mkdir -p \"$OUTDIR/files/$(dirname \"$f\")\" && cp -a \"$f\" \"$OUTDIR/files/$f\"
done
CRIT=( \"api/app/main.py\" \"api/requirements.txt\" \"public/diag.html\" \"render.yaml\" \"package.json\" \"pnpm-lock.yaml\" \"yarn.lock\" \"package-lock.json\" \".github/workflows\" )
for p in \"${CRIT[@]}\"; do [ -e \"$p\" ] && mkdir -p \"$OUTDIR/crit/$(dirname \"$p\")\" && cp -a \"$p\" \"$OUTDIR/crit/$p\" || true; done
( cd \"$OUTDIR\" && find files crit -type f 2>/dev/null | LC_ALL=C sort | xargs -r sha256sum > file_hashes.sha256 )
( tree -L 3 -a -I '.git|node_modules|__pycache__' > \"$OUTDIR/tree.txt\" ) || ( find . -maxdepth 3 -type f -printf \"%TY-%Tm-%Td %p\\n\" | sort -r > \"$OUTDIR/tree.txt\" )
cat > \"$OUTDIR/README-RECOVERY.md\" <<'REC'
# Rebuild Kit
Fast: rsync -a files/ .
Patch: git apply --whitespace=fix changes.patch
REC
ZIP=\"rebuild_kit_${REPO_NAME}_$(echo $SHA | cut -c1-7).zip\"
( cd \"$OUTDIR/..\" && zip -r \"$ZIP\" \"$(basename \"$OUTDIR\")\" >/dev/null ); echo \"$ZIP\"
"""

REBUILD_WORKFLOW = """name: Rebuild Kit
on: { push: { branches: [ main ] }, workflow_dispatch: {} }
jobs:
  bundle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - name: Build Rebuild Kit
        run: |
          PREV="$(git rev-parse HEAD~1 || echo HEAD)"
          SHA="$(git rev-parse HEAD)"
          bash scripts/make_rebuild_bundle.sh "$SHA" "$PREV" "rebuild_kit" "$(basename "$GITHUB_REPOSITORY")" > zipname.txt
          cat zipname.txt
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with: { name: rebuild_kit, path: ./*.zip, if-no-files-found: error }
      - name: Report to SCW (optional)
        if: ${{ secrets.DEPLOY_REPORT_URL != '' && secrets.DEPLOY_REPORT_TOKEN != '' }}
        env:
          DEPLOY_REPORT_URL: ${{ secrets.DEPLOY_REPORT_URL }}
          DEPLOY_REPORT_TOKEN: ${{ secrets.DEPLOY_REPORT_TOKEN }}
        run: |
          set -euo pipefail
          SHA="$(git rev-parse HEAD)"; BRANCH="${GITHUB_REF_NAME}"
          RUN_URL="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
          BODY=$(cat <<JSON
          { "source":"github-actions","workflow":"Rebuild Kit","run_id":"${GITHUB_RUN_ID}","run_url":"${RUN_URL}",
            "commit_sha":"${SHA}","branch":"${BRANCH}","status":"success","health_code":200,
            "health_body":{"type":"rebuild_kit","repo":"${GITHUB_REPOSITORY}","zip":"(artifact)","note":"kit uploaded as artifact"},
            "ts": $(date +%s) }
          JSON
          )
          curl -sS -X POST -H "Authorization: Bearer ${DEPLOY_REPORT_TOKEN}" -H "Content-Type: application/json" -d "$BODY" "$DEPLOY_REPORT_URL" || true
"""

SCAN_WORKFLOW = """name: Self-Healing Scan
on:
  push:
    branches: [ main ]
    paths:
      - '.github/workflows/**'
      - 'scripts/**'
      - 'api/**'
      - 'public/diag.html'
      - 'render.yaml'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'yarn.lock'
      - 'package-lock.json'
  workflow_dispatch: {}
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - name: Run collector
        run: python3 scripts/collect_self_healing.py
      - name: Upload manifest
        uses: actions/upload-artifact@v4
        with:
          name: self_healing_manifest
          path: |
            self_healing_out/SELF_HEALING_MANIFEST.json
            self_healing_out/SELF_HEALING_MANIFEST.md
            self_healing_out/index.json
            self_healing_out/GAPS.json
            self_healing_out/REMEDIATIONS.md
          if-no-files-found: error
      - name: Report to SCW (optional)
        if: ${{ secrets.DEPLOY_REPORT_URL != '' && secrets.DEPLOY_REPORT_TOKEN != '' }}
        env:
          DEPLOY_REPORT_URL: ${{ secrets.DEPLOY_REPORT_URL }}
          DEPLOY_REPORT_TOKEN: ${{ secrets.DEPLOY_REPORT_TOKEN }}
        run: |
          set -euo pipefail
          SHA="$(git rev-parse HEAD)"; BRANCH="${GITHUB_REF_NAME}"
          RUN_URL="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
          BODY=$(cat <<JSON
          { "source":"github-actions","workflow":"Self-Healing Scan","run_id":"${GITHUB_RUN_ID}","run_url":"${RUN_URL}",
            "commit_sha":"${SHA}","branch":"${BRANCH}","status":"success","health_code":200,
            "health_body":{"type":"self_healing_manifest","repo":"${GITHUB_REPOSITORY}","artifact":"self_healing_manifest"},
            "ts": $(date +%s) }
          JSON
          )
          curl -sS -X POST -H "Authorization: Bearer ${DEPLOY_REPORT_TOKEN}" -H "Content-Type: application/json" -d "$BODY" "$DEPLOY_REPORT_URL" || true
"""

# Optional SCW API deploy workflow (we won't auto-create this unless repo is SCW)
SCW_DEPLOY_WORKFLOW = """name: SCW API • Configure & Deploy
on:
  push: { branches: [ main ], paths: [ 'api/**', '.github/workflows/scw-api-config-and-deploy.yml' ] }
  workflow_dispatch: {}
jobs:
  configure-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: |
          python -m pip install --upgrade pip && pip install ruff
          ruff check api
          python -m py_compile $(git ls-files 'api/**/*.py')
      - name: Configure Render (build/start + env)
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
          ENV_NAME:       ${{ secrets.ENV_NAME }}
          ALLOW_ORIGINS:  ${{ secrets.ALLOW_ORIGINS }}
          HMAC_SECRET:    ${{ secrets.HMAC_SECRET }}
          REDIS_URL:      ${{ secrets.REDIS_URL }}
          DEPLOY_REPORT_TOKEN: ${{ secrets.DEPLOY_REPORT_TOKEN }}
        run: |
          set -euo pipefail
          auth="Authorization: Bearer ${RENDER_API_KEY}"; json="Content-Type: application/json"
          curl -sS -X PATCH -H "$auth" -H "$json" "https://api.render.com/v1/services/${RENDER_SERVICE_ID}" \
            -d '{"buildCommand":"pip install -r api/requirements.txt","startCommand":"uvicorn app.main:app --app-dir api --host 0.0.0.0 --port $PORT"}'
          to_pair () { printf '{"key":"%s","value":"%s","type":"plain"}' "$1" "$2"; }
          arr=()
          [ -n "${ENV_NAME:-}" ]            && arr+=("$(to_pair ENV_NAME "$ENV_NAME")")
          [ -n "${ALLOW_ORIGINS:-}" ]       && arr+=("$(to_pair ALLOW_ORIGINS "$ALLOW_ORIGINS")")
          [ -n "${HMAC_SECRET:-}" ]         && arr+=("$(to_pair HMAC_SECRET "$HMAC_SECRET")")
          [ -n "${REDIS_URL:-}" ]           && arr+=("$(to_pair REDIS_URL "$REDIS_URL")")
          [ -n "${DEPLOY_REPORT_TOKEN:-}" ] && arr+=("$(to_pair DEPLOY_REPORT_TOKEN "$DEPLOY_REPORT_TOKEN")")
          payload="{\"envVars\":[`IFS=,; echo "${arr[*]-}"`]}"
          curl -sS -X PUT -H "$auth" -H "$json" "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars" -d "$payload"
      - name: Try resume
        env: { RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}, RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }} }
        run: |
          curl -sS -X POST -H "Authorization: Bearer ${RENDER_API_KEY}" \
            "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/resume" || true
      - name: Trigger deploy
        env: { RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}, RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }} }
        run: |
          curl -sS -X POST -H "Authorization: Bearer ${RENDER_API_KEY}" -H "Content-Type: application/json" \
            "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" -d '{"clearCache": false}'
      - name: Wait for health
        id: health
        env: { HEALTH_URL: ${{ secrets.HEALTH_URL }} }
        run: |
          set -euo pipefail
          for i in {1..40}; do
            sleep 6; code=$(curl -s -o /tmp/h -w "%{http_code}" "$HEALTH_URL")
            if [ "$code" = "200" ]; then
              echo "health_code=$code" >> $GITHUB_OUTPUT
              echo "health_body=$(tr -d '\\n' < /tmp/h | sed 's/\"/\\\\\"/g')" >> $GITHUB_OUTPUT
              exit 0
            fi; echo "Attempt $i/40: HTTP $code"; done
          echo "health_code=${code:-0}" >> $GITHUB_OUTPUT; echo "health_body=" >> $GITHUB_OUTPUT; exit 1
      - name: Report deploy to SCW
        if: ${{ always() }}
        env:
          DEPLOY_REPORT_URL: ${{ secrets.DEPLOY_REPORT_URL }}
          DEPLOY_REPORT_TOKEN: ${{ secrets.DEPLOY_REPORT_TOKEN }}
          HEALTH_CODE: ${{ steps.health.outputs.health_code || 0 }}
          HEALTH_BODY: ${{ steps.health.outputs.health_body || '' }}
        run: |
          set -euo pipefail
          RUN_URL="https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          BODY=$(cat <<JSON
          {"source":"github-actions","workflow":"${{ github.workflow }}","run_id":"${{ github.run_id }}",
           "run_url":"${RUN_URL}","commit_sha":"${{ github.sha }}","branch":"${{ github.ref_name }}",
           "status":"${{ job.status }}","health_code":${HEALTH_CODE:-0},"health_body":${HEALTH_BODY:-{}},
           "ts": $(date +%s)}
          JSON
          )
          curl -sS -X POST -H "Authorization: Bearer ${DEPLOY_REPORT_TOKEN}" -H "Content-Type: application/json" \
            -d "$BODY" "$DEPLOY_REPORT_URL" || true
"""

def write(path: Path, content: str, executable=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")
        if executable:
            os.chmod(path, 0o755)
        return True
    return False

def append_journal(lines):
    ts = datetime.datetime.utcnow().isoformat()+"Z"
    with JOURNAL.open("a", encoding="utf-8") as f:
        f.write(f"## {ts} — canonical fixes\n")
        for ln in lines: f.write(f"- {ln}\n")
        f.write("\n")

def main():
    if not GAPS.exists():
        print("No GAPS.json found. Run collect_self_healing.py first.")
        return 0
    gaps = json.loads(GAPS.read_text(encoding="utf-8"))
    actions = []

    # Create missing common items
    for miss in gaps.get("missing", []):
        path = miss["path"]
        created = False
        if path == "scripts/make_rebuild_bundle.sh":
            created = write(ROOT / path, REBUILD_SCRIPT, executable=True)
        elif path == ".github/workflows/rebuild-kit.yml":
            created = write(ROOT / path, REBUILD_WORKFLOW)
        elif path == ".github/workflows/self-healing-scan.yml":
            created = write(ROOT / path, SCAN_WORKFLOW)
        elif "(one of)" in path:
            # If it's the SCW api deploy workflow requirement, choose secrets-mode by default (safer to edit)
            created = write(ROOT / ".github/workflows/scw-api-config-and-deploy.yml", SCW_DEPLOY_WORKFLOW)
        # We intentionally do not write api/app/main.py or diag.html automatically to avoid overwriting app code.
        if created:
            actions.append(f"created {path}")

    if actions:
        append_journal([f"{a}" for a in actions])
    else:
        append_journal(["no actions required (nothing missing or auto-creatable)"])

    print("\n".join(actions) if actions else "No fixes applied.")
    return 0

if __name__ == "__main__":
    import os
    main()
