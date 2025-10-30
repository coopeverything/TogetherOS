# PR Pre-Merge Checklist

**Purpose:** Every PR must pass this checklist BEFORE suggesting merge to user.

**When to Use:** After creating/updating a PR, before telling user "ready to merge"

---

## Automated Checks (Claude Must Run)

### 1. Check PR Mergeable Status
```bash
gh pr view <PR#> --json mergeable,statusCheckRollup
```

**What to Look For:**
- `"mergeable": "MERGEABLE"` (not "CONFLICTING")
- Review CI check statuses

**If Conflicting:**
- Fetch and merge latest main
- Resolve all conflicts
- Push merge commit
- Re-check mergeable status

---

### 2. Review CI Check Failures

```bash
gh pr checks <PR#>
gh run list --branch <branch> --limit 5
```

**Common Issues:**
- Lint failures (actionlint, yamllint, markdown)
- Smoke test failures (validation scripts)
- Build failures
- Test failures

**If Failing:**
- Get logs: `gh run view <run-id> --log-failed`
- Identify root cause
- Fix issues locally
- Push fixes
- Verify CI re-runs and passes

---

### 3. Review All Commits in PR

```bash
git log main..HEAD --oneline
```

**Check Each Commit For:**
- Valid syntax (no obvious errors)
- Follows project conventions
- Imports/paths are correct
- No missing dependencies
- Commit message quality

**If Issues Found:**
- Fix with new commits (don't rewrite history if already pushed)
- Or squash/fixup if still in draft

---

### 4. Check for Codex/Bot Reviews

```bash
gh pr view <PR#> --json reviews
```

**Review Types:**
- Codex automated suggestions
- Dependabot alerts
- Other bot feedback

**If Suggestions Exist:**
- Review each suggestion
- Address or document why skipping
- Add response comment if needed

---

### 5. Verify File Changes Make Sense

```bash
git diff main...HEAD --stat
```

**Red Flags:**
- Unexpected file modifications
- Large binary files added
- Sensitive data (keys, credentials)
- Files outside scope of PR

**If Red Flags:**
- Investigate and fix before merge
- Update .gitignore if needed
- Remove sensitive data properly (not just new commit)

---

## Manual Verification Steps

### 6. Re-read PR Description

**Questions:**
- Does description match actual changes?
- Are all features mentioned actually implemented?
- Are testing instructions clear and accurate?
- Are deployment notes complete?

**If Mismatched:**
- Update PR description with actual changes
- Add missing sections (testing, deployment, etc.)

---

### 7. Check Documentation Updates

**Required Updates:**
- README if user-facing changes
- Module docs if new features
- API docs if endpoints changed
- Migration guides if breaking changes

**If Missing:**
- Add documentation in same PR
- Or create follow-up issue and note in PR

---

### 8. Verify Proof Lines (If Applicable)

For TogetherOS PRs, check for:
- `LINT=OK`
- `VALIDATORS=GREEN`
- `SMOKE=OK`

**If Missing and Required:**
- Run validators locally
- Add proof lines to PR description

---

## PR Ready Criteria

✅ **All Must Be True:**
- [ ] Mergeable status = MERGEABLE (no conflicts)
- [ ] All CI checks passing (or documented exceptions)
- [ ] No unaddressed review comments
- [ ] Documentation updated where needed
- [ ] Commits reviewed and quality checked
- [ ] PR description accurate and complete
- [ ] No security/sensitive data issues
- [ ] Tested locally (if applicable)

---

## Example Workflow

```bash
# 1. Create PR
gh pr create --base main --head feature/my-feature --title "..." --body "..."

# 2. IMMEDIATELY run checks
gh pr view 123 --json mergeable,statusCheckRollup | jq .
gh pr checks 123

# 3. If conflicts found
git fetch origin main
git merge origin/main
# ... resolve conflicts ...
git push

# 4. If CI failures
gh run view <run-id> --log-failed
# ... fix issues ...
git push

# 5. Final verification
gh pr view 123 --json mergeable
git log main..HEAD --oneline
git diff main...HEAD --stat

# 6. ONLY THEN tell user "PR ready to merge"
```

---

## Integration with TodoWrite

**Always Use TodoWrite for PR Workflows:**

```javascript
[
  {"content": "Create PR", "status": "in_progress", "activeForm": "Creating PR"},
  {"content": "Check PR mergeable status", "status": "pending", "activeForm": "Checking PR mergeable status"},
  {"content": "Review CI check results", "status": "pending", "activeForm": "Reviewing CI check results"},
  {"content": "Fix any conflicts/failures", "status": "pending", "activeForm": "Fixing any conflicts/failures"},
  {"content": "Verify all commits", "status": "pending", "activeForm": "Verifying all commits"},
  {"content": "Update PR if needed", "status": "pending", "activeForm": "Updating PR if needed"},
  {"content": "Confirm ready to merge", "status": "pending", "activeForm": "Confirming ready to merge"}
]
```

**Benefits:**
- User sees progress in real-time
- No surprises about PR status
- Clear handoff point when ready

---

## Anti-Patterns to Avoid

❌ **Don't:**
- Create PR and immediately say "ready to merge" without checks
- Ignore CI failures with "you can fix later"
- Skip conflict resolution
- Assume tests will pass without verifying
- Create PR from stale branch

✅ **Do:**
- Run full checklist before declaring ready
- Fix issues proactively
- Keep user informed via TodoWrite
- Document any known issues clearly
- Merge main regularly to avoid conflicts

---

## Future Automation

**Candidate for Script:**
```bash
#!/bin/bash
# scripts/pre-merge-check.sh <PR#>
# Runs all automated checks and outputs report
```

**See:** `docs/dev/future-explorations.md` for automation ideas

---

**This discipline ensures quality and saves user time by catching issues early.**
