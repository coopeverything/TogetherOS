# Common Development Mistakes & How to Avoid Them

This guide documents common pitfalls in TogetherOS development and how to prevent them.

---

## 1. Committing Build Artifacts

### The Problem

**Build artifacts should never be committed to the repository.** These files are generated during the build process and should not be tracked in version control.

### Common Examples

**❌ Bad: next-env.d.ts with build artifact imports**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";  // ❌ This is a build artifact!
```

**Why it breaks:**
- `.next/types/routes.d.ts` only exists after running a build
- Fresh checkouts fail with "Cannot find module" errors
- CI environments break (clean builds fail)
- Violates Next.js conventions (next-env.d.ts should not be manually edited)

**✅ Good: next-env.d.ts without build artifacts**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
```

### How to Prevent

**Install the pre-commit hook:**

```bash
./scripts/install-pre-commit-hook.sh
```

This hook automatically:
- ✅ Blocks commits with build artifact imports in next-env.d.ts
- ⚠️  Warns about .next/ directory commits
- ⚠️  Warns about node_modules/ commits

**Manual check before committing:**

```bash
# Check what you're committing
git diff --cached apps/web/next-env.d.ts

# If you see .next/ imports, restore the file
git checkout apps/web/next-env.d.ts
```

### Recovery

If you already committed a build artifact:

```bash
# Option 1: Amend the last commit (if not pushed)
git checkout apps/web/next-env.d.ts
git add apps/web/next-env.d.ts
git commit --amend --no-edit

# Option 2: Create a fix commit (if already pushed)
git checkout apps/web/next-env.d.ts
git add apps/web/next-env.d.ts
git commit -m "fix: remove build artifact import from next-env.d.ts"
git push
```

---

## 2. Missing Bot Review Comments

### The Problem

**AI code reviewers (Codex, Copilot) leave inline comments on PRs that are easy to miss** if you only check the review summary or use basic gh CLI commands.

### What Happens

- Codex reviews a PR and leaves inline comments on specific lines
- Developer checks `gh pr view <PR#> --comments` (only shows general comments)
- Developer misses the inline code review comments
- P1 (critical) issues are not addressed
- PR merges with known issues

### Real Example

**PR #164** merged with a Codex P1 issue about `next-env.d.ts` importing build artifacts because inline comments were not detected by the API query used.

### How to Detect Inline Comments

**❌ Wrong: Only checking general PR comments**

```bash
gh pr view <PR#> --comments
# This misses inline code review comments!
```

**✅ Correct: Check for inline review comments via API**

```bash
# Check Codex inline comments
gh api repos/coopeverything/TogetherOS/pulls/<PR#>/comments \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector") | {file: .path, line: .line, body: .body}'

# Check Copilot inline comments
gh api repos/coopeverything/TogetherOS/pulls/<PR#>/comments \
  --jq '.[] | select(.user.login | contains("copilot")) | {file: .path, line: .line, body: .body}'
```

**✅ Fallback: View PR on web**

If API queries return empty but the PR shows "Commented" status:

```bash
gh pr view <PR#> --web
# Manually scroll through "Files Changed" tab to find inline comments
```

### Priority Levels

**P1 (Critical)** - MUST fix before merge:
- Security vulnerabilities
- Build artifacts in committed code
- Breaking changes
- Data loss risks

**P2 (Important)** - SHOULD fix before merge:
- Performance issues
- Code quality problems
- Best practice violations

**P3 (Nice-to-have)** - CAN defer:
- Style preferences
- Minor optimizations
- Documentation suggestions

### How to Prevent

**Follow the updated yolo1/pr-formatter workflows:**

Both skills now include:
1. Wait ~60 seconds for bot analysis
2. Check for inline comments via API
3. Fallback to web view if needed
4. Categorize feedback by priority
5. Fix all P1 issues before proceeding

See `.claude/skills/yolo1/SKILL.md` and `.claude/skills/pr-formatter/SKILL.md` for complete workflows.

---

## 3. Forgetting to Update Progress Markers

### The Problem

PRs should include progress markers to trigger automatic progress tracking:

```markdown
progress:bridge=+10
```

### How to Prevent

- Use `status-tracker` skill to calculate progress
- Include progress marker in PR body
- yolo1 skill automatically handles this

---

## 4. Incorrect Branch Protection Status Check Names

### The Problem

Branch protection requires a status check named `test` but the workflow creates a check named `Run tests`. This mismatch blocks merges.

### The Fix

**Workflow job names must match branch protection requirements.**

```yaml
# ❌ Wrong - creates check named "Run tests"
jobs:
  test:
    name: Run tests

# ✅ Correct - creates check named "test"
jobs:
  test:
    name: test
```

### Current Status

✅ Fixed in PR #165 - workflow now creates `test` check to match branch protection.

---

## 5. Not Checking for Copilot Sub-PRs

### The Problem

Copilot SWE Agent creates **separate sub-PRs** with suggested fixes instead of leaving inline comments. These can be missed if you only monitor the parent PR.

### How to Detect

```bash
# Check for sub-PRs after creating your PR
gh pr list --author "app/copilot-swe-agent" --search "sub-pr-<PR#>"
```

### What to Do

1. Review the sub-PR changes
2. Cherry-pick useful fixes to your branch
3. Close the sub-PR with a note (e.g., "Changes reviewed and integrated into parent PR")
4. Don't let sub-PRs orphan - always evaluate them

---

## 6. Pushing to Wrong Base Branch

### The Problem

PRs accidentally target `main` instead of `yolo`.

### How to Prevent

**Always verify before creating PR:**

```bash
# Check your current branch
git branch --show-current

# Create PR targeting yolo explicitly
gh pr create --base yolo --head feature/my-branch

# Verify base after creation
gh pr view <PR#> --json baseRefName --jq '.baseRefName'
# Should output: "yolo"
```

**If you made a mistake:**

```bash
# Change PR base to yolo
gh pr edit <PR#> --base yolo
```

---

## Quick Reference

### Pre-Flight Checklist

Before creating a PR:
- [ ] Run `./scripts/validate.sh` for proof lines
- [ ] Verify build passes: `npm run build`
- [ ] Check no build artifacts staged: `git diff --cached | grep -v "\.next/"`
- [ ] Confirm base branch is yolo: `gh pr create --base yolo`

### Post-PR Checklist

After creating a PR:
- [ ] Wait 60 seconds for bot reviews
- [ ] Check Codex inline comments via API
- [ ] Check Copilot sub-PRs
- [ ] View PR on web if API returns empty
- [ ] Fix all P1 issues before merge
- [ ] Verify all checks pass: `gh pr checks <PR#>`

### Recovery Commands

```bash
# Remove build artifact from next-env.d.ts
git checkout apps/web/next-env.d.ts

# View PR on web to find inline comments
gh pr view <PR#> --web

# Check for Codex inline comments
gh api repos/coopeverything/TogetherOS/pulls/<PR#>/comments \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector")'

# Check for Copilot sub-PRs
gh pr list --author "app/copilot-swe-agent" --search "sub-pr-<PR#>"
```

---

## Related Documentation

- [Pre-Commit Hook Installation](../../scripts/install-pre-commit-hook.sh)
- [yolo1 Skill](../../.claude/skills/yolo1/SKILL.md)
- [pr-formatter Skill](../../.claude/skills/pr-formatter/SKILL.md)
- [PR Checklist](./pr-checklist.md)
- [CI/CD Discipline](../../.claude/knowledge/ci-cd-discipline.md)
