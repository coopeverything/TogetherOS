# TogetherOS CI / Actions Playbook

This playbook explains our required checks, how to read their logs, how to fix common issues, and what **proof lines** to capture. Keep edits tiny and verifiable—**one PR at a time**.

---

## 1) Required checks (gate to merge)

**Protected checks**

- **ci/lint** — validates all GitHub workflow YAML
  - Tools: `yamllint` (repo-root `.yamllint.yaml`), `actionlint`
  - **Log proof lines (end of job)**
    ```
    PROOF: YAMLLINT=OK
    PROOF: ACTIONLINT=OK
    PROOF: LINT=OK
    ```

- **ci/docs** — docs-only validation (Markdown + links)
  - Tools: `markdownlint-cli2`, `lychee` link checker
  - **Log proof lines**
    ```
    PROOF: MARKDOWNLINT=OK
    PROOF: LINKS=OK
    PROOF: DOCS=OK
    ```

- **ci/smoke** *(optional, but recommended)* — repo hygiene / validator availability
  - Runs `scripts/validate.sh` (`jq`, `yamllint`, `actionlint`, `gh`, etc.)
  - **Log proof lines**
    ```
    PROOF: VALIDATORS=GREEN
    PROOF: SMOKE=OK
    ```

> ✅ Branch protection: **ci/lint** (always), **ci/docs** (for docs PRs), and **ci/smoke** if you enable it. GitHub only blocks on checks that are required **and** actually run.

---

## 2) When do workflows run?

- **pull_request → main**: `ci/lint`, `ci/docs` (always for .md), `ci/smoke` (if configured)
- **push → main**: same checks confirm main’s health
- **manual**: any workflow with `workflow_dispatch` (Actions tab → *Run workflow*)

*Docs-only PRs*: `ci/docs` runs; `ci/lint` should ignore `.md` if your lint workflow uses `paths-ignore` for Markdown.

---

## 3) Reading logs & capturing proof

1. PR → **Checks** → open the failing job.  
2. Click the failing **step** → scroll to the end.  
3. Copy the final proof lines and include them in any requested hand-off.

Examples:
PROOF: YAMLLINT=OK
PROOF: ACTIONLINT=OK
PROOF: LINT=OK
PROOF: MARKDOWNLINT=OK
PROOF: LINKS=OK
PROOF: DOCS=OK
PROOF: VALIDATORS=GREEN
PROOF: SMOKE=OK


---

## 4) Common failures & quick fixes

### YAML (ci/lint)
- **Brackets/spacing**: `branches: [main]` (no extra spaces).
- **Document start**: add `---` if your `.yamllint.yaml` requires it.
- **Truthy values / quoting**: quote `on: "push"` patterns as needed.
- **Actionlint path/expr errors**: fix the exact file:line it prints.

### Markdown & Links (ci/docs)
- **Headings**: single `#` for H1 per file; nested levels increase by 1.
- **Line length / trailing spaces**: wrap or add exceptions in `.markdownlint.jsonc` if truly needed.
- **Code fences**: specify language when possible (e.g., ` ```bash `).
- **Links**: `lychee` failures:
  - Internal: fix relative paths (prefer `./file.md` under `docs/`).
  - External: if a site blocks bots, add to lychee ignore list; otherwise update the URL.
  - Mailto: already excluded by `--exclude-mail`.

### 401 vs 403 vs 422 (any job)
- **401**: bad/expired credentials → refresh token / secret.
- **403**: missing scopes or branch protection rule → adjust PAT/scopes or update rule.
- **422**: invalid input / schema mismatch → fix the workflow inputs or file format.

### Merge conflicts
- Use **Resolve conflicts** in the PR, remove conflict markers, commit, re-run checks.

---

## 5) PR body convention (always include)

These are **human-visible** proof lines (separate from log proofs). Keep them simple:

Category: <one of the 8 canonical categories>
Keywords: comma, separated, words

LINT=OK
SMOKE=OK


- For docs-only PRs, you may add `DOCS=OK` after CI passes.
- For CI/docs or infra changes, set `Category: Cooperative Technology`.

---

## 6) Our discipline (non-negotiable)

- **One tiny change per PR.**
- **Full files** for YAML/JSON/PowerShell (no partial patches).
- Fix **one red check at a time**—don’t stack unrelated changes.
- Any behavior/config change must update the relevant doc (this playbook or `docs/OPERATIONS.md`).

---

## 7) Useful paths

- `.github/workflows/` — workflow YAMLs  
- `.yamllint.yaml` — YAML rules  
- `scripts/validate.sh` — validator checks used by **ci/smoke**  
- `docs/OPERATIONS.md` — contributor flow (start here)

---

## 8) After merge

- Verify the push to `main` re-runs checks and ends with:

LINT=OK  
VALIDATORS=GREEN  
SMOKE=OK  


*(for docs-only PRs, also confirm `DOCS=OK` in job logs).*

*End of Playbook.*

