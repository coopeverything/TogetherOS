# TogetherOS CI / Actions Playbook

This playbook explains our required checks, how to read their logs, how to fix common issues, and what **proof lines** to capture after each step. Keep edits tiny and verifiable—**one PR at a time**.

## 1) Required checks (gate to merge)

- **ci/lint** — validates all GitHub workflow YAML:
  - `yamllint` (rules from repo‐root `.yamllint.yaml`)
  - `actionlint` (structural + shell checks)
  - **Proof lines expected in logs:**
    - `PROOF: YAMLLINT=OK`
    - `PROOF: ACTIONLINT=OK`
    - `PROOF: LINT=OK`

- **ci/smoke** — repo hygiene and validator availability:
  - Runs `scripts/validate.sh` (checks: `jq`, `yamllint`, `actionlint`, `gh`, etc.)
  - May run lightweight sanity steps (no builds, no deploys)
  - **Proof lines expected in logs:**
    - `PROOF: VALIDATORS=GREEN`
    - `PROOF: SMOKE=OK`

> ✅ A PR may merge only when **both** checks succeed.

## 2) When do workflows run?

- **On pull requests** to `main`: `ci/lint`, `ci/smoke`
- **On push** to `main`: the same checks confirm main’s health
- Some workflows can be run **manually** via “Run workflow” if configured

## 3) Reading logs & capturing proof

1. Open the PR → **Checks** → pick the failing job.  
2. Open the failing **step** and scroll to the end.  
3. Copy the final **proof line(s)** and paste them in the conversation when requested.

Examples:
```
PROOF: YAMLLINT=OK
PROOF: ACTIONLINT=OK
PROOF: LINT=OK
PROOF: VALIDATORS=GREEN
PROOF: SMOKE=OK
```

## 4) Common failures & quick fixes

- **YAML formatting** (ci/lint):
  - Errors like “line too long”, “truthy value”, or “document-start” → adjust the file to our root `.yamllint.yaml` rules and re-push.
  - Actionlint errors usually show the **file and line**; fix the exact spot.

- **Missing tools** (ci/smoke):
  - `scripts/validate.sh` will print what’s missing. Add/fix the setup step in the workflow or the script.

- **401 vs 403 vs 422**:
  - **401**: bad/expired credentials.
  - **403**: permissions/policy (e.g., branch protection, missing token scopes).
  - **422**: semantic validation failed (bad inputs, schema mismatch).

- **Merge conflicts**:
  - Click **Resolve conflicts** on the PR.
  - Keep the canonical or base version when in doubt.
  - Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and save.
  - **Mark as resolved** → **Commit merge** → wait for checks.

## 5) PR body convention (always include)

```
Category: <one of the 8 canonical categories>
Keywords: comma, separated, words
VALIDATORS=GREEN
LINT=OK
```

For CI/docs changes use:
```
Category: Cooperative Technology
```

## 6) Our discipline (non-negotiable)

- **One tiny change per PR.**  
- **Full files** (no partial patches for YAML/JSON/PowerShell).  
- **Always** end steps with a short proof line.  
- If a check is red, fix that one check first—do not stack changes.

## 7) Useful paths

- `.github/workflows/` — all action workflows
- `.yamllint.yaml` — lint rules
- `scripts/validate.sh` — validator checks used by **ci/smoke**

## 8) After merge

- Verify the push to `main` re-runs **ci/lint** and **ci/smoke** and ends with:
  - `LINT=OK`
  - `VALIDATORS=GREEN`
  - `SMOKE=OK`

*End of Playbook.*
