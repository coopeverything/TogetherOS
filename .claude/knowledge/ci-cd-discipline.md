# CI/CD Discipline & Proof Lines

## Core Discipline (Non-Negotiable)

### The Rules
1. **One tiny change per PR** — Smallest shippable increment only
2. **All PRs require bot review** — Copilot must review all code before merge
3. **Full files for YAML/JSON** — No partial patches
4. **Fix one red check at a time** — Don't stack unrelated changes
5. **Docs-first** — Any behavior/config change must update relevant docs
6. **Proof lines required** — Every PR body includes validation output

---

## Required Checks (Gate to Merge)

### ci/lint (Always Required)
**Purpose:** Validate all GitHub workflow YAML

**Tools:**
- `yamllint` — Uses `.yamllint.yaml` config
- `actionlint` — GitHub Actions workflow validation

**Log Proof Lines:**
```
PROOF: YAMLLINT=OK
PROOF: ACTIONLINT=OK
PROOF: LINT=OK
```

**Branch Protection:** ✅ **ci/lint** always required

---

### ci/docs (Required for Docs PRs)
**Purpose:** Validate Markdown and links

**Tools:**
- `markdownlint-cli2` — Uses `.markdownlint.jsonc` config
- `lychee` — Link checker (internal & external)

**Log Proof Lines:**
```
PROOF: MARKDOWNLINT=OK
PROOF: LINKS=OK
PROOF: DOCS=OK
```

**Branch Protection:** ✅ **ci/docs** required for docs changes

**Path Triggers:**
- Runs on changes to `**/*.md` files
- `ci/lint` skips `.md` files (via `paths-ignore`)

---

### ci/smoke (Optional but Recommended)
**Purpose:** Repo health checks, validator availability

**Runs:** `scripts/validate.sh`

**Checks:**
- Tool presence (`jq`, `yamllint`, `actionlint`, `gh`)
- Lint suite execution
- Custom validators (Bridge logs, fixtures, etc.)

**Log Proof Lines:**
```
PROOF: VALIDATORS=GREEN
PROOF: SMOKE=OK
```

**Branch Protection:** Optional (enable if needed)

---

### Security Checks (Recommended)

**Purpose:** Verify no new critical security issues introduced

**Tool:** GitHub CodeQL code scanning

**Check Command:**
```bash
gh api repos/coopeverything/TogetherOS/code-scanning/alerts \
  --jq '[.[] | select(.state == "open" and .rule.severity == "error")] | length'
```

**Proof Lines:**
```
SECURITY=OK (0 new critical alerts)
# or
SECURITY=WARN (X critical alerts exist)
```

**When to use:**
- Before creating PRs (integrated in yolo1 skill Step 7)
- After fixing security vulnerabilities
- When modifying authentication, authorization, or data validation code

**When to block merge:**
- New P1 (error-level) alerts introduced by PR changes
- Existing P1 alerts in files modified by PR (must be addressed first)
- Security-sensitive code (auth routes, data validation) with open alerts

**View alerts:** https://github.com/coopeverything/TogetherOS/security/code-scanning

**Alert Severity Levels:**
- **Error (P1)** — Critical vulnerabilities (SSRF, auth bypass, injection attacks) - MUST FIX
- **Warning (P2)** — Medium-severity issues (incomplete validation, race conditions) - SHOULD FIX
- **Note (P3)** — Code quality issues (unused variables, style) - CAN DEFER

**Branch Protection:** Optional (advisory-only, doesn't block)

---

## When Workflows Run

### Pull Request → main
- **ci/lint** — Always
- **ci/docs** — If `**/*.md` changed
- **ci/smoke** — If configured

### Push → main
- Same checks confirm main's health

### Manual Trigger
- Any workflow with `workflow_dispatch` (Actions tab → Run workflow)

---

## PR Body Convention

### Required Proof Lines (Human-Visible)
Every PR description must include:
```
Category: <one of the 8 canonical Cooperation Paths>
Keywords: comma, separated, words

LINT=OK
SMOKE=OK (or VALIDATORS=GREEN)
```

**For docs-only PRs:**
```
Category: Cooperative Technology
Keywords: documentation, ci, playbook

DOCS=OK
LINT=OK
```

**For CI/docs or infra changes:**
- Set `Category: Cooperative Technology`

---

## Reading Logs & Capturing Proof

### How to Read CI Logs
1. Open PR → **Checks** tab
2. Click failing job
3. Click failing step
4. Scroll to end
5. Copy proof lines

### Example Output
```bash
# End of ci/lint job
PROOF: YAMLLINT=OK
PROOF: ACTIONLINT=OK
PROOF: LINT=OK

# End of ci/docs job
PROOF: MARKDOWNLINT=OK
PROOF: LINKS=OK
PROOF: DOCS=OK

# End of ci/smoke job
PROOF: VALIDATORS=GREEN
PROOF: SMOKE=OK
```

---

## Common Failures & Quick Fixes

### YAML Errors (ci/lint)

**Brackets/spacing:**
```yaml
# ❌ Bad
branches: [ main ]

# ✅ Good
branches: [main]
```

**Document start:**
```yaml
# Add if .yamllint.yaml requires it
---
name: CI Lint
```

**Truthy values:**
```yaml
# Quote when needed
on: "push"
```

**Actionlint path/expr errors:**
- Fix the exact file:line it prints

---

### Markdown & Link Errors (ci/docs)

**Headings:**
```markdown
# Single H1 per file
## Nested levels increase by 1
### Not allowed to skip levels (H1 → H3)
```

**Line length:**
- Wrap long lines
- Or add exceptions in `.markdownlint.jsonc` if truly needed

**Code fences:**
```markdown
<!-- Specify language -->
```bash
echo "Good"
```
<!-- Not -->
```
echo "Bad"
```
```

**Link failures:**
- **Internal:** Fix relative paths (prefer `./file.md` under `docs/`)
- **External:** If site blocks bots, add to lychee ignore list; otherwise update URL
- **Mailto:** Already excluded by `--exclude-mail`

---

### HTTP Error Codes (Any Job)

**401 Unauthorized:**
- Bad/expired credentials
- **Fix:** Refresh token/secret

**403 Forbidden:**
- Missing scopes or branch protection rule
- **Fix:** Adjust PAT/scopes or update rule

**422 Unprocessable Entity:**
- Invalid input / schema mismatch
- **Fix:** Fix workflow inputs or file format

---

### Merge Conflicts

**Resolution:**
1. Use **Resolve conflicts** button in PR
2. Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Commit resolution
4. Re-run checks

---

## scripts/validate.sh

### Purpose
Runs all validators and outputs proof lines

### What It Checks
```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. Tool presence
command -v jq >/dev/null || { echo "jq missing"; exit 1; }
command -v yamllint >/dev/null || { echo "yamllint missing"; exit 1; }
command -v actionlint >/dev/null || { echo "actionlint missing"; exit 1; }

# 2. Lint suite
yamllint . || { echo "YAML lint failed"; exit 1; }
actionlint || { echo "Action lint failed"; exit 1; }

# 3. Custom validators (add as needed)
# Example: Bridge log validation
if [[ -f logs/bridge/actions-$(date +%Y-%m-%d).ndjson ]]; then
  tail -n 1 logs/bridge/actions-$(date +%Y-%m-%d).ndjson | jq empty || {
    echo "Invalid NDJSON in Bridge logs"
    exit 1
  }
fi

# 4. Output proof lines
echo "LINT=OK"
echo "VALIDATORS=GREEN"
echo "SMOKE=OK"
```

### Running Locally
```bash
# From repo root
./scripts/validate.sh

# Expected output:
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

---

## Branching Strategy

### Branch Naming
```bash
# Feature branches
feature/bridge-qa-endpoint
feature/governance-list-view

# Docs branches
docs/update-operations-playbook
docs/add-module-spec

# Claude sessions (special format)
claude/bridge-landing-011CUQtanTsWEweh3xMQupeE
# Must start with "claude/" and end with session ID
```

### Branch from main
```bash
git checkout main
git pull origin main
git checkout -b feature/my-tiny-change
```

---

## Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, missing semi-colons
- `refactor` — Code change that neither fixes bug nor adds feature
- `test` — Adding missing tests
- `chore` — Maintain (CI, build, deps)

### Examples
```bash
docs: align overview with contributor hub

feat(governance): add proposal scoring util

fix(ci): correct docs workflow include paths

chore(deps): bump next to 14.2.0
```

---

## PR Template

### Copy/Paste for PR Body
```markdown
## What & Why
<1-3 sentences describing the change>

## Smallest Change
<1 sentence confirming this is the smallest shippable increment>

## Touchpoints
- Files:
  - `path/to/file1.ts`
  - `path/to/file2.md`

## Proof

LINT=OK
SMOKE=OK (or VALIDATORS=GREEN, or DOCS=OK)

## Category & Keywords
Category: <one of 8 Cooperation Paths>
Keywords: comma, separated, words
```

---

## After Merge

### Verify Main Health
1. Check push to `main` re-runs checks
2. Confirm output:
   ```
   LINT=OK
   VALIDATORS=GREEN
   SMOKE=OK
   ```

### Update Discussions
If change affects onboarding or contributor flow:
- Post short note in [Discussions #88](https://github.com/coopeverything/TogetherOS/discussions/88)

### Update STATUS_v2.md
If module progress changed:
```bash
# Bump progress marker
docs/STATUS_v2.md

# Find HTML comment like:
<!-- progress:governance=0 -->

# Update to:
<!-- progress:governance=5 -->

# Commit:
git commit -m "docs(status): bump governance to 5%"
```

---

## Useful Paths

### CI/CD Files
```
.github/workflows/          # All workflow YAMLs
.github/workflows/lint.yml  # ci/lint
.github/workflows/ci_docs.yml  # ci/docs
.github/workflows/deploy.yml   # VPS deployment

.yamllint.yaml              # YAML linting rules
.markdownlint.jsonc         # Markdown rules

scripts/validate.sh         # Main validator script
scripts/lint.sh             # Lint runner
```

### Documentation
```
docs/OPERATIONS.md          # Contributor flow (start here)
docs/CI/Actions_Playbook.md # This spec, detailed
docs/modules/INDEX.md       # Module hub
```

---

## Security & Access

### Least-Privilege Tokens
- GitHub Actions use minimal permissions
- Contents/PR/Actions as needed
- **Never** use admin tokens unless absolutely required

### Never Echo Secrets
```yaml
# ❌ Bad
- run: echo ${{ secrets.API_KEY }}

# ✅ Good
- run: |
    # Use secret in command, don't echo
    curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" ...
```

### Deployment Keys
- Stored in GitHub Secrets
- `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PATH`
- Details in `docs/OPS/MAINTAINERS_DEPLOY.md` (internal)

---

## Path Labels & Taxonomy

### Canonical Path Names
Use these exact labels (validated against `codex/taxonomy/CATEGORY_TREE.json`):
```
path:collaborative-education
path:social-economy
path:common-wellbeing
path:cooperative-technology
path:collective-governance
path:community-connection
path:collaborative-media-culture
path:common-planet
```

### Adding New Keywords
If you add a keyword:
1. Update `codex/taxonomy/CATEGORY_TREE.json` (machine-readable taxonomy for validation)
2. Update `docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md` (human-readable documentation)
3. Include short rationale in PR description

---

## Quick Checklist

### Before Opening PR
- [ ] Smallest possible change
- [ ] Correct Path label selected
- [ ] Ran `./scripts/validate.sh` locally
- [ ] Relevant docs updated
- [ ] Proof lines captured (LINT=OK, SMOKE=OK, etc.)
- [ ] Commit messages follow convention

### PR Description Includes
- [ ] What & Why (1-3 sentences)
- [ ] Smallest change confirmation
- [ ] Files touched list
- [ ] Proof lines
- [ ] Category & Keywords

### After Merge
- [ ] Verify main health (checks pass)
- [ ] Update STATUS_v2.md if needed
- [ ] Post to Discussions #88 if affects contributors

---

## Automated PR Workflow (New Process)

### Overview

As of 2025-01-11, all code must go through automated PR review before merging to `yolo`. This ensures quality gates are met and prevents large, unreviewed code dumps.

### Required Flow

```
feature branch → PR → Copilot review → fix issues → tests pass → merge → deploy
```

**No direct pushes to yolo allowed** (except emergency hotfixes with explicit approval).

### Using auto-pr-merge Skill

See `.claude/skills/auto-pr-merge.md` for complete documentation.

**Quick start:**
```bash
# 1. Implement feature
git checkout -b feature/my-change
# ... make changes ...

# 2. Push and create PR
git push -u origin feature/my-change
gh pr create --base yolo --title "..." --body "..."

# 3. Wait for Copilot review (30-60 seconds)
sleep 60

# 4. Check for feedback
gh pr view <num> --json reviews,comments

# 5. Address all Copilot comments
# ... fix issues ...
git push origin feature/my-change

# 6. Merge when approved and tests pass
gh pr merge <num> --squash --delete-branch
```

### Quality Gates

**PR will NOT auto-merge if:**
- ❌ Copilot requested changes
- ❌ Tests failing
- ❌ >500 lines changed (split into smaller PRs)
- ❌ Security-sensitive code (requires human approval)

**PR will auto-merge when:**
- ✅ Copilot approved OR no blocking reviews
- ✅ All status checks pass
- ✅ Change is <500 lines
- ✅ Not flagged as security-sensitive

### Dual-Bot Review Integration

**Two bots review EVERY PR (both required):**

#### Bot 1: Codex (`chatgpt-codex-connector`) - PRIMARY
**What Codex checks:**
- Security vulnerabilities (SQL injection, XSS, eval, auth issues)
- Type safety & correctness
- Performance problems
- Code quality & best practices
- Architecture & design patterns

**Priority levels:**
- **P1 (Critical)**: BLOCKS MERGE - Must fix
- **P2 (Important)**: Should fix before merge
- **P3 (Nice-to-have)**: Can defer

**Manual trigger:**
```bash
gh pr comment <PR#> --body "@codex review"
```

#### Bot 2: Copilot SWE Agent (`copilot-swe-agent`) - SECONDARY
**What Copilot SWE Agent does:**
- Creates **separate sub-PR** with suggested fixes (NOT inline review)
- Suggests improvements for:
  - Security vulnerabilities
  - Performance issues (render optimization, memoization)
  - Type safety (any usage, unsafe casts, null checks)
  - Code quality (unused variables, error handling, accessibility)
  - Best practices (React patterns, async/await)

**Output format:**
- **Sub-PR** on branch `copilot/sub-pr-{parent-pr-number}`
- Contains actual code changes, not just comments
- Must be evaluated BEFORE merging parent PR

**Manual trigger:**
```bash
gh pr comment <PR#> --body "@copilot review"

# Then check for sub-PR (wait 2-5 minutes):
SUB_PR=$(gh pr list --author "app/copilot-swe-agent" \
  --search "sub-pr-<PR#>" --json number --jq '.[0].number // empty')
```

**Handling sub-PRs:**
1. **Cherry-pick** useful changes to parent PR branch
2. **Note** for later if not urgent
3. **Close** sub-PR after evaluating (don't let it orphan)

### Merge Requirements (Dual-Bot Gate)

**PR can ONLY merge if:**
- ✅ Tests pass
- ✅ Codex reviewed (NO P1 issues fixed)
- ✅ Copilot sub-PR evaluated (changes cherry-picked or noted)
- ✅ Sub-PR closed with explanation

**Codex can block:**
- ❌ Codex P1 issue → Cannot merge until fixed

**Copilot sub-PR workflow:**
- ⚠️  Check for sub-PR before merging parent
- ⚠️  Evaluate changes, cherry-pick if useful
- ⚠️  Close sub-PR to avoid orphaning

**Wait time:** 5 minutes after opening PR + 2-5 minutes for sub-PR creation

### Example: Full Workflow

```bash
# Feature: Add user avatar upload

# 1. Create branch
git checkout yolo
git checkout -b feature/user-avatar-upload

# 2. Implement (small change)
# - Add avatar field to User entity
# - Add upload endpoint
# - Add UI component

git add lib/db/users.ts apps/api/src/modules/profiles/handlers/avatar.ts
git commit -m "feat(profiles): add avatar upload endpoint"

git push -u origin feature/user-avatar-upload

# 3. Create PR
gh pr create --base yolo \
  --title "feat(profiles): Add user avatar upload" \
  --body "Implements avatar upload via file or URL.

Category: Cooperative Technology
Keywords: profiles, avatar, upload, UX

Waiting for Copilot review..."

# 4. Get PR number
PR=$(gh pr list --head feature/user-avatar-upload --json number --jq '.[0].number')

# 5. Wait for Copilot
sleep 60

# 6. Check feedback
gh api repos/coopeverything/TogetherOS/pulls/$PR/comments \
  --jq '.[] | select(.user.login | contains("copilot")) | {file: .path, line: .line, issue: .body}'

# Example output:
# {
#   "file": "apps/api/src/modules/profiles/handlers/avatar.ts",
#   "line": 15,
#   "issue": "Missing file size validation. Add check for max 5MB upload."
# }

# 7. Fix issue
# Edit file to add size validation
git add apps/api/src/modules/profiles/handlers/avatar.ts
git commit -m "fix(profiles): add 5MB file size limit (Copilot feedback)"
git push origin feature/user-avatar-upload

# 8. Verify tests pass
gh pr checks $PR --watch

# 9. Merge
gh pr merge $PR --squash --delete-branch

# 10. Monitor deployment
gh run watch $(gh run list --workflow=auto-deploy-production --limit 1 --json databaseId --jq '.[0].databaseId')
```

### Safety & Rollback

If deployed code causes issues:

```bash
# Option 1: Revert via git
git checkout yolo
git revert <bad-commit-sha>
git push origin yolo
# Auto-deploy will deploy the revert

# Option 2: Manual VPS rollback
ssh root@72.60.27.167
cd /var/www/togetheros
git reset --hard <previous-good-commit>
npm run build
pm2 restart togetheros
```

---

## Related KB Files

- [Main KB](./togetheros-kb.md) — Core principles, workflow
- [Tech Stack](./tech-stack.md) — Tools, versions, dependencies
- [Architecture](./architecture.md) — Code structure, patterns
- [Cooperation Paths](./cooperation-paths.md) — Path labels and taxonomy
- [Auto-PR-Merge Skill](../../.claude/skills/auto-pr-merge.md) — Complete automation workflow
