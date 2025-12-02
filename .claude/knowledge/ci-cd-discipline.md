# CI/CD Discipline & Proof Lines

## Quick Mode Reference

| Aspect | Yolo Mode (Current) | Contributor Mode (Future) |
|--------|---------------------|---------------------------|
| **Who** | User initiates → Claude (autonomous operator) implements, tests, catches errors, validates | External contributors (GitHub community) |
| **Branch access** | Direct push to yolo allowed | Fork and PR required |
| **Merge target** | yolo (auto-deploy to production) | main (staging/review branch) |
| **Chunk size** | Big chunks OK - only concern: don't deliver whole module in one PR (break into 2-3 PRs) | Smallest shippable increment only |
| **Bot reviews** | Optional (recommended for features) | **REQUIRED** (Codex + Copilot) |
| **Proof lines** | **RECOMMENDED** (`TESTS=OK`) | **REQUIRED** (`LINT=OK SMOKE=OK TESTS=OK`) |
| **CI enforcement** | Tests only (npm test) | Lint + Smoke + Tests + Docs |
| **Human approval** | Not needed (Claude is autonomous operator) | Not needed (bot reviews sufficient) |
| **Deployment** | Auto-deploy on push to yolo | Manual sync from main to yolo |
| **Iteration speed** | Fast (push directly for big chunks) | Slower (PR overhead required) |
| **Trust model** | Trust-based (Claude responsible for verification) | Gated (bots enforce quality) |

---

## Mode Selection Guide

### When to Use Yolo Mode

**Current default for TogetherOS development**

✅ **Use Yolo Mode when:**
- User initiates work with Claude in autonomous mode
- Implementing features (<whole module scope)
- Documentation updates, refactoring, bug fixes
- Iterating on new features (multiple commits per session)
- Emergency hotfixes needed (production issues)
- Internal experimentation (test pages at /test/module)

**Workflow:**
```bash
# User initiates task
# Claude implements, tests, catches errors, validates
git push origin yolo
# Auto-deploy triggers to production
```

### When to Use Contributor Mode

**Future workflow when external contributors join**

✅ **Use Contributor Mode when:**
- External contributor submitting code
- Major refactoring requiring review
- Breaking changes to public APIs
- Security-sensitive changes (auth, data access)
- Changes to CI/CD infrastructure
- Syncing yolo → main (production validation complete)

**Workflow:**
```bash
# Fork repository
# Create feature branch
# Push to fork
# Open PR to main (not yolo)
# Bot reviews (Codex + Copilot)
# All checks pass → merge
```

---

## Yolo Mode Workflow (Current)

**Philosophy:** Trust-based, fast iteration, autonomous Claude operator

### Operator Roles

**User (initiates):**
- Provides task description and strategic direction
- Does not have coding knowledge to catch/fix errors
- Reviews final output and deployment results

**Claude (autonomous operator):**
- Implements features and fixes
- Catches errors during development
- Validates all checks pass
- Executes deployment
- Monitors production health

### Required vs Recommended

**REQUIRED (blocking):**
- ✅ Tests must pass (`npm test`)
- ✅ Changes must not break production
- ✅ TypeScript must compile (build succeeds)
- ✅ No P1 CodeQL security alerts in modified files
- ✅ Proof line: `TESTS=OK` in PR description (Danger.js enforces this)

**RECOMMENDED (best practice):**
- Proof line: `TYPECHECK=OK` in PR description
- Run `./scripts/validate.sh` for critical code
- Create PR for features requiring bot feedback
- Document breaking changes in CHANGELOG.md
- Verify deployment succeeds after merge

### Chunk Size Guidelines

**Big chunks acceptable:**
- ✅ Multiple related files in one PR
- ✅ Feature implementation across layers (API + UI + types)
- ✅ Refactoring that touches many files
- ❌ **Only concern:** Don't deliver whole module in one PR

**How to break down:**
- If implementing new module: Split into 2-3 PRs by layer or concern
- Example: PR 1 = types + API, PR 2 = UI components, PR 3 = integration
- Use judgment: If PR touches >500 lines, consider splitting

### Acceptable Direct Push Scenarios

✅ **Direct push to yolo (no PR needed):**
- Documentation typo fixes
- Comment updates
- Small bug fixes (<50 lines)
- Test page additions (/test/module)
- CHANGELOG updates
- Emergency hotfixes (with post-push monitoring)

### When to Create PR Even in Yolo Mode

**Create PR for:**
- Features requiring bot feedback (Codex/Copilot suggestions)
- Major refactoring (>300 lines changed)
- Breaking API changes
- Security-sensitive code (want Codex security review)
- Want deployment verification before merge

**PR process (REQUIRED - complete ALL steps):**
1. Push feature branch
2. Create PR to yolo (not main) with `TESTS=OK` proof line
3. **WAIT 5 minutes** for bot reviews to start
4. Check CI status: `gh pr checks <PR#>`
5. Check for Codex P1 issues: `gh pr view <PR#> --json reviews`
6. Check for Copilot sub-PRs: `gh pr list --author "app/copilot-swe-agent" --search "<PR#>"`
7. Fix any P1 issues immediately
8. **MERGE when ALL checks pass:** `gh pr merge <PR#> --squash --delete-branch`
9. Monitor auto-deploy: `gh run watch`
10. Verify deployment health before moving to next task

### Proof Lines (Recommended)

Include in PR body or commit message:

**Minimal (tests only):**
```
TESTS=OK
```

**Full (best practice):**
```
TESTS=OK
LINT=OK (optional: via ./scripts/validate.sh)
VALIDATORS=GREEN (optional: via ./scripts/validate.sh)
SECURITY=OK (0 P1 alerts in modified files)
```

**Note:** Proof lines are advisory in yolo mode. CI only enforces test passing.

---

## Contributor Mode Workflow (Future)

**Philosophy:** Gated quality checks, bot reviews replace human approval, strict enforcement

### Required Checks (All Must Pass)

**Branch protection on main:**
- ✅ ci/lint (YAML validation)
- ✅ ci/docs (Markdown validation, if docs changed)
- ✅ ci/smoke (validator suite)
- ✅ test (npm test)
- ✅ Bot reviews (Codex + Copilot)

### Required Proof Lines

**Every PR to main must include:**
```
Category: <one of 8 Cooperation Paths>
Keywords: comma, separated, words

LINT=OK
SMOKE=OK
TESTS=OK
```

**For docs changes, also:**
```
DOCS=OK
```

### Dual-Bot Review System

#### Bot 1: Codex (`chatgpt-codex-connector`) - PRIMARY

**What Codex checks:**
- Security vulnerabilities (SQL injection, XSS, eval, auth issues)
- Type safety & correctness
- Performance problems
- Code quality & best practices
- Architecture & design patterns

**Priority levels:**
- **P1 (Critical):** BLOCKS MERGE - Must fix
- **P2 (Important):** Should fix before merge
- **P3 (Nice-to-have):** Can defer

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

### Merge Requirements

**PR can ONLY merge if:**
- ✅ All status checks pass (lint, smoke, tests, docs)
- ✅ Codex reviewed (NO P1 issues unfixed)
- ✅ Copilot sub-PR evaluated (changes cherry-picked or noted)
- ✅ Sub-PR closed with explanation
- ✅ Proof lines present in PR body

**Wait time:** 5 minutes for Codex + 2-5 minutes for Copilot sub-PR

### Chunk Size (Strict)

**Contributor mode enforces minimal changes:**
- ✅ One tiny change per PR
- ✅ Smallest shippable increment only
- ❌ No bundling unrelated changes
- ❌ No scope creep

**If PR touches >500 lines:** Request split into smaller PRs

---

## Shared Practices (Both Modes)

### Commit Message Convention

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, missing semi-colons
- `refactor` — Code change that neither fixes bug nor adds feature
- `test` — Adding missing tests
- `chore` — Maintain (CI, build, deps)

**Examples:**
```bash
docs: update yolo mode workflow in CI discipline

feat(governance): add proposal scoring util

fix(ci): correct docs workflow include paths

chore(deps): bump next to 14.2.0
```

### Branch Naming

**Pattern:**
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

**Base branch:**
- ✅ **Always branch from yolo** (not main)
- ✅ PRs target yolo (not main)

### Git Operations Best Practices

#### Pre-Work Branch Verification (MANDATORY)

**Before starting ANY work, verify your branch:**
```bash
git branch --show-current
git status
```

**Questions to answer:**
- Am I on the correct branch for this task?
- Are there uncommitted changes from previous work?

**If on wrong branch:**
```bash
# Switch to correct branch BEFORE making changes
git checkout yolo
git pull origin yolo
git checkout -b feature/new-task
```

**Why this matters:** Starting work on the wrong branch leads to:
- Commits on unrelated branches
- Complex cherry-pick/rebase operations to fix
- Accidental inclusion of unrelated files in PRs

#### Stashing with Untracked Files

**Problem:** `git stash` by default does NOT include untracked files.

**Solution:** Always use `-u` flag when stashing with new files:
```bash
# ❌ Wrong - loses untracked files
git stash

# ✅ Correct - includes untracked files
git stash push -u -m "description of changes"

# ✅ Also correct - shorthand
git stash -u
```

**Options:**
- `-u` / `--include-untracked`: Stash untracked files (recommended)
- `-a` / `--all`: Stash everything including ignored files (use with caution)

**Warning:** After stashing with `-u`, untracked files are deleted from working directory (they're in the stash). Use `git stash pop` to restore.

**Source:** [Git Stash Documentation](https://git-scm.com/docs/git-stash)

#### If You Commit to Wrong Branch

```bash
# Option 1: Move last commit to correct branch (before push)
git reset HEAD~1 --soft          # Undo commit, keep changes staged
git stash push -u                 # Stash everything
git checkout correct-branch       # Switch to correct branch
git stash pop                     # Apply changes
git commit -m "..."               # Recommit

# Option 2: Cherry-pick (after push or multiple commits)
git checkout correct-branch
git cherry-pick <commit-sha>
git checkout wrong-branch
git reset --hard HEAD~1           # Remove from wrong branch (CAREFUL!)
```

### Path Labels & Taxonomy

**Use these exact labels** (validated against `codex/taxonomy/CATEGORY_TREE.json`):
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

**Adding new keywords:**
1. Update `codex/taxonomy/CATEGORY_TREE.json` (machine-readable)
2. Update `docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md` (human-readable)
3. Include rationale in PR description

### Security Alerts (CodeQL)

**Policy:** P1 security alerts in modified files BLOCK merge.

**How It Works:**
- Danger.js automatically checks for P1 (error severity) CodeQL alerts
- Cross-references with files modified by PR
- **Blocks merge** if any P1 alerts in modified files

**Decision Criteria:**

**BLOCKS merge:**
- ❌ P1 alert exists in file modified by this PR
- Example: PR modifies `apps/api/route.ts` which has log injection alert

**DOES NOT block merge:**
- ✅ P1 alert exists in file NOT modified by this PR
- ✅ P2/P3 alerts (warnings/notes) - informational only

**Alert Severity Levels:**
- **P1 (Error):** Critical vulnerabilities (SQL injection, XSS, auth bypass, log injection) - MUST FIX
- **P2 (Warning):** Medium-severity issues (incomplete validation, race conditions) - SHOULD FIX
- **P3 (Note):** Code quality issues (unused variables, style) - CAN DEFER

**When Blocked:**
1. View alert: Click link in PR comment
2. Fix issue: Update code to address vulnerability
3. Common fixes:
   - Log injection: `JSON.stringify(userInput)` before logging
   - SQL injection: Use parameterized queries
   - XSS: Sanitize/escape user input before rendering
4. Push update: Danger.js re-checks automatically
5. Merge when clear

**View alerts:** https://github.com/coopeverything/TogetherOS/security/code-scanning

---

## Dependabot Update Protocol

**Before merging Dependabot PRs:**

### 1. Check Compatibility Score (in PR description)

**Thresholds:**
- **≥75%** ✅ - Safe to merge (still test locally for major versions)
- **50-74%** 🟡 - Moderate risk → Review changelog + test locally
- **<50%** 🔴 - High risk → Defer or close PR
- **"Unknown"** ⚠️ - New release → Check ecosystem readiness

### 2. Version Type Rules

**Patch updates (1.0.0 → 1.0.1):**
- ✅ Can bypass score threshold (bug fixes only)
- Auto-merge if CI passes

**Minor updates (1.0.0 → 1.1.0):**
- Check score, test locally if <75%

**Major updates (1.0.0 → 2.0.0):**
- Always require manual review (breaking changes expected)
- Defer 30-90 days for ecosystem maturity
- Check framework compatibility (Next.js for React, etc.)

### 3. Ecosystem Readiness Checklist

**For React updates:**
- ✅ Next.js officially supports version
- ✅ Radix UI/shadcn compatible
- ✅ @types/react available

**For Next.js updates:**
- ✅ React version compatible
- ✅ Release >14 days old (early bugs fixed)

**For Tailwind updates:**
- ✅ tailwind-merge compatible version exists
- ✅ UI package ecosystem updated

### 4. Danger.js Automation

Danger.js will automatically:
- Warn if score <75%
- Flag "unknown" scores for manual review
- Provide risk assessment based on score

**No action needed** - warnings appear in PR comments automatically.

### 5. Override for Well-Established Upgrades

**If researching an upgrade to fix errors (e.g., TypeScript):**
- Check release notes for relevant bug fixes
- Verify upgrade is "well established and accepted" in community
- Look for:
  - Release >30 days old
  - No major reported issues in GitHub/Stack Overflow
  - Adopted by major projects (Next.js, Vite, etc.)
- **If all criteria met:** Override Dependabot compatibility score
- Document rationale in PR comment

---

## CI/CD Infrastructure

### Required Checks (Gate to Merge)

#### ci/lint (Required for main PRs)
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

**Branch Protection:**
- ✅ **main branch:** ci/lint REQUIRED (enforced by CI)
- ⚠️  **yolo branch:** ci/lint does NOT run (fast iteration mode)
  - Run `./scripts/validate.sh` locally for proof lines
  - Danger.js requires `TESTS=OK` for yolo PRs (not `LINT=OK`)
  - Lint validation happens when syncing to main branch

---

#### ci/docs (Required for Docs PRs)
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

#### ci/smoke (Optional but Recommended)
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

### When Workflows Run

**Pull Request → main:**
- **ci/lint** — Always
- **ci/docs** — If `**/*.md` changed
- **ci/smoke** — If configured

**Push → main:**
- Same checks confirm main's health

**Manual Trigger:**
- Any workflow with `workflow_dispatch` (Actions tab → Run workflow)

---

### Reading Logs & Capturing Proof

**How to Read CI Logs:**
1. Open PR → **Checks** tab
2. Click failing job
3. Click failing step
4. Scroll to end
5. Copy proof lines

**Example Output:**
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

### Common Failures & Quick Fixes

#### YAML Errors (ci/lint)

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

#### Markdown & Link Errors (ci/docs)

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

#### HTTP Error Codes (Any Job)

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

## After Merge

### Verify Main Health (Contributor Mode)
1. Check push to `main` re-runs checks
2. Confirm output:
   ```
   LINT=OK
   VALIDATORS=GREEN
   SMOKE=OK
   ```

### Verify Deployment (Yolo Mode)
1. Monitor auto-deploy workflow: `gh run watch`
2. Check deployment status
3. Verify production health: `https://coopeverything.org/api/health`

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
docs/CI/Actions_Playbook.md # Detailed CI/CD workflows
docs/modules/INDEX.md       # Module hub
docs/ERROR_CATCHING.md      # Bot error codes (P1/P2/P3)
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

## Quick Checklist

### Before Opening PR (Contributor Mode)
- [ ] Smallest possible change
- [ ] Correct Path label selected
- [ ] Ran `./scripts/validate.sh` locally
- [ ] Relevant docs updated
- [ ] Proof lines captured (LINT=OK, SMOKE=OK, etc.)
- [ ] Commit messages follow convention

### Before Pushing (Yolo Mode)
- [ ] Tests pass locally
- [ ] TypeScript compiles (build succeeds)
- [ ] No P1 security alerts in modified files
- [ ] Changes align with task scope
- [ ] Deployment will auto-trigger (ready for production)

### PR Description Includes (Both Modes)
- [ ] What & Why (1-3 sentences)
- [ ] Files touched list
- [ ] Proof lines (yolo: recommended, contributor: required)
- [ ] Category & Keywords

### After Merge
- [ ] Verify deployment health (yolo mode)
- [ ] Verify main health (contributor mode)
- [ ] Update STATUS_v2.md if needed
- [ ] Post to Discussions #88 if affects contributors

---

## Related KB Files

- [Main KB](./togetheros-kb.md) — Core principles, workflow
- [Tech Stack](./tech-stack.md) — Tools, versions, dependencies
- [Architecture](./architecture.md) — Code structure, patterns
- [Cooperation Paths](./cooperation-paths.md) — Path labels and taxonomy
- [Error Catching](../../docs/ERROR_CATCHING.md) — Bot error codes (P1/P2/P3)