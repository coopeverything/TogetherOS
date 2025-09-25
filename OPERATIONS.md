# OPERATIONS — CI Validators & Proof-Lines (Path A)

Keep this simple: we have **two CI checks** and a few **proof-lines**. If both checks are green and the proof-lines appear at the end of logs, you can merge.

---

## 1) Workflows

### A) `smoke / ci/smoke`
- Purpose: quick “all good” gate for basic validators.
- Triggers: `workflow_dispatch`, `pull_request`, `push` on `main`.
- What it does:
  - Checks tools: `jq`, `yamllint`, `actionlint`, `gh`
  - Checks repo preflight (devcontainer presence)
  - Runs `bash scripts/validate.sh`
- **You should see these in the job logs (near the end):**
  - `PREFLIGHT=OK`
  - `LINT_SUITE=OK` (or `LINT_SUITE=SKIPPED` if `scripts/lint.sh` is missing)
  - `VALIDATORS=GREEN`
  - `SMOKE=OK`

### B) `lint / ci/lint`
- Purpose: lint workflow YAML and run `actionlint`.
- Runs `bash scripts/lint.sh`.
- **You should see this at the end of the job logs:**
  - `LINT=OK`

---

## 2) Scripts

### `scripts/validate.sh` (unified gate)
Run with:
```bash
bash scripts/validate.sh
