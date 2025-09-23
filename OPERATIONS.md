# OPERATIONS — CI Validators & Proof-Lines (Path A)

This repo uses **two lightweight CI checks** and a few “proof-lines” to keep `main` safe whether changes come from humans, Copilot, or Codex.

---

## 1) Workflows

### A) `smoke / ci/smoke`
- Purpose: single “all good” gate for validators.
- Triggers: `workflow_dispatch`, `pull_request`, `push` on `main`.
- Key steps:
  - Tooling check (`jq`, `yamllint`, `actionlint`, `gh`)
  - Repo preflight (devcontainer presence)
  - Delegates to `bash scripts/validate.sh`
- **Expected proofs in logs:**
  - `PREFLIGHT=OK`
  - `LINT_SUITE=OK` (or `LINT_SUITE=SKIPPED` if lint script is missing)
  - **`VALIDATORS=GREEN`** ← unified success signal
  - `SMOKE=OK` (marker from workflow)

### B) `lint / ci/lint`
- Purpose: lints all workflow YAML and runs `actionlint`.
- Runs `bash scripts/lint.sh`.
- Current behavior:
  - `yamllint` runs (warnings may be tolerated per script)
  - `actionlint` runs; ShellCheck may be disabled temporarily
- **Expected proof in logs:**
  - **`LINT=OK`**

---

## 2) Scripts

### `scripts/validate.sh` (unified gate)
- POSIX Bash, invoked as `bash scripts/validate.sh`
- Prints tool presence proofs:
  - `JQ=OK`, `YAMLLINT_TOOL=OK`, `ACTIONLINT_TOOL=OK`, `GH=OK`
- Preflight:
  - `DEVCONTAINER=OK` or `DEVCONTAINER=MISSING`
  - `PREFLIGHT=OK`
- Delegates to `scripts/lint.sh` and prints:
  - `LINT_SUITE=OK` (or `LINT_SUITE=SKIPPED`)
- Final line on success:
  - **`VALIDATORS=GREEN`**

### `scripts/lint.sh`
- Globs: `.github/workflows/**/*.yml|yaml`
- Runs `yamllint` (config and strictness may be relaxed to allow legacy files)
- Runs `actionlint` on the same files
- Final line on success:
  - **`LINT=OK`**

---

## 3) Branch Protection (main)
- **Require status checks to pass before merging**
- Required checks (recommended):
  - `smoke / ci/smoke`
  - `lint / ci/lint`

> If a check doesn’t appear in the rule editor, run it on **main** once, refresh, then add it.

---

## 4) How to run checks (UI)

- **Manual run:** Actions → select `smoke` or `lint` → **Run workflow** → Branch: `main`.
- **On PRs:** Both workflows run automatically; open the PR’s **Checks** tab → job → step → read the proof-lines near the end.

---

## 5) Troubleshooting quick refs

- **Actionlint download fails (tar/HTML):** use the official install script (already wired in `smoke.yml`).
- **Lint fails on legacy YAML:** relax `scripts/lint.sh` inline config (line length, truthy, document-start) or add `---` to top of workflows.
- **No suggestions in Branch Protection:** run checks on `main` first, then add `smoke / ci/smoke` and `lint / ci/lint`.

---

## 6) Codex (later)

When ready to let Codex open PRs/branches autonomously:
- Add repo secret `CODEX_GH_PAT` (fine-grained PAT with Contents/PR/Actions).
- Gateway tasks (issue-driven JSON under `codex/*`) can then be executed by Codex with these CI rails and proof-lines.

---

## 7) Canonical proof-lines (copy/paste targets)

