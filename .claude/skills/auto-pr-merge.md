# auto-pr-merge

**Type:** Workflow automation
**Auto-trigger:** No (invoke explicitly with `@auto-pr-merge`)

## Purpose

Automates the full PR workflow: push → wait for Copilot review → address feedback → merge → deploy.

This skill implements the quality-first automation pattern:
1. Create and push PR
2. Wait for GitHub Copilot code review (30-60 seconds)
3. Read all bot review comments
4. Address each issue with targeted fixes
5. Verify tests pass and bot approves
6. Auto-merge to yolo
7. Monitor auto-deployment to production

## When to Use

Use this skill when you want to:
- Implement a feature with automated quality gates
- Ensure all code gets bot review before production
- Iterate quickly while maintaining code quality
- Follow the documented CI/CD discipline

## Prerequisites

- ✅ **Dual bot reviewers enabled:**
  - `chatgpt-codex-connector` (OpenAI Codex) - PRIMARY reviewer (inline reviews)
  - `copilot-swe-agent` (GitHub Copilot SWE) - SECONDARY reviewer (creates sub-PRs)
- ✅ Branch protection on `yolo` with status checks
- ✅ Tests configured and passing
- ✅ Auto-deploy workflow ready (`.github/workflows/auto-deploy-production.yml`)

## Dual-Bot Review System

**Every PR gets reviewed by BOTH bots before merge:**

### Bot 1: Codex (chatgpt-codex-connector) - INLINE REVIEWS
- OpenAI GPT-4 powered code analysis
- Provides **inline review comments** on the same PR
- Priority levels:
  - **P1** (Critical) - BLOCKS MERGE - Must fix before merge
  - **P2** (Important) - Should fix before merge
  - **P3** (Nice-to-have) - Can defer to future PR
- Review format: Comprehensive analysis with specific recommendations
- **Manual trigger**: Comment `@codex review` on PR

### Bot 2: Copilot SWE Agent (copilot-swe-agent) - SUB-PR CREATOR
- GitHub Copilot code writing bot
- Creates **separate sub-PR** with suggested fixes (not inline review)
- Branch naming: `copilot/sub-pr-{parent-pr-number}`
- Sub-PR must be evaluated BEFORE merging parent PR
- **Manual trigger**: Comment `@copilot review` on PR

### Merge Requirements (ALL must be true)
- ✅ Tests pass
- ✅ Codex reviewed (no P1 issues fixed)
- ✅ Copilot sub-PR evaluated (useful changes cherry-picked or noted)
- ✅ All blocking issues addressed

### Codex Can Block Merge
- Codex P1 issue → ❌ Cannot merge until fixed
- Copilot sub-PR → ⚠️  Evaluate before merging (may contain important fixes)

## Handling Copilot SWE Agent Sub-PRs

**IMPORTANT:** When you comment `@copilot review`, the bot creates a **separate PR** with suggested fixes, NOT inline comments.

### Detection

After triggering Copilot review, wait 2-5 minutes then check for sub-PR:

```bash
# Get your PR number
PR_NUMBER=$(gh pr list --head feature/{your-branch} --json number --jq '.[0].number')

# Check if Copilot created a sub-PR
SUB_PR=$(gh pr list --author "app/copilot-swe-agent" \
  --search "sub-pr-$PR_NUMBER in:title" \
  --json number --jq '.[0].number // empty')

if [ -n "$SUB_PR" ]; then
  echo "✓ Copilot created sub-PR #$SUB_PR"
  gh pr view $SUB_PR
else
  echo "ℹ No sub-PR created by Copilot"
fi
```

### Evaluation Workflow

**Step 1: Review Sub-PR Changes**
```bash
# View sub-PR diff
gh pr diff $SUB_PR

# Read PR description to understand what Copilot is fixing
gh pr view $SUB_PR --json title,body --jq '{title, body}'
```

**Step 2: Decision Tree**

Choose one option:

**Option A: Cherry-pick useful changes** (recommended for security/bug fixes)
```bash
# Checkout sub-PR branch
gh pr checkout $SUB_PR

# View commits
git log --oneline copilot/sub-pr-$PR_NUMBER ^yolo

# Return to your feature branch
git checkout feature/{your-branch}

# Cherry-pick specific commits (replace SHA)
git cherry-pick <commit-sha>

# Or merge entire sub-PR branch if all changes useful
git merge --no-ff copilot/sub-pr-$PR_NUMBER -m "merge: incorporate Copilot sub-PR fixes"

# Push updates
git push origin feature/{your-branch}

# Close sub-PR with comment
gh pr close $SUB_PR --comment "Changes incorporated into parent PR #$PR_NUMBER via cherry-pick. Thank you Copilot!"
```

**Option B: Note for later** (for suggestions that aren't urgent)
```bash
# Add comment to sub-PR acknowledging the feedback
gh pr comment $SUB_PR --body "Thanks for the suggestions. These improvements are noted for a future PR focused on code quality. Closing sub-PR as parent PR #$PR_NUMBER will merge first."

# Close sub-PR
gh pr close $SUB_PR

# Document findings in parent PR
gh pr comment $PR_NUMBER --body "Note: Copilot sub-PR #$SUB_PR suggested improvements to [list topics]. Will address in follow-up PR."
```

**Option C: Ignore** (only if sub-PR has no useful changes)
```bash
# Close with explanation
gh pr close $SUB_PR --comment "Sub-PR created after parent was already reviewed and ready to merge. No additional changes needed."
```

### **CRITICAL: Always handle sub-PR BEFORE merging parent PR**

**Wrong workflow** (creates orphaned sub-PRs):
```
❌ Merge parent PR → Sub-PR becomes conflicted → Must close stale sub-PR
```

**Correct workflow**:
```
✅ Check for sub-PR → Evaluate changes → Cherry-pick or note → Merge parent PR → Close sub-PR
```

### Auto-Detection in PR Workflow

Add this step after waiting for Codex review:

```bash
# After Codex reviews and you fix P1 issues
# Before merging, check for Copilot sub-PR

SUB_PR=$(gh pr list --author "app/copilot-swe-agent" \
  --search "sub-pr-$PR_NUMBER" --json number --jq '.[0].number // empty')

if [ -n "$SUB_PR" ]; then
  echo "⚠️  Copilot created sub-PR #$SUB_PR"
  echo "Evaluate sub-PR before merging:"
  gh pr view $SUB_PR

  # Prompt for action
  read -p "Action: [c]herry-pick, [n]ote, [i]gnore? " action

  case $action in
    c) gh pr checkout $SUB_PR
       echo "Review commits and cherry-pick:"
       git log --oneline
       ;;
    n) gh pr comment $SUB_PR --body "Noted for future PR"
       gh pr close $SUB_PR
       ;;
    i) gh pr close $SUB_PR --comment "No changes needed"
       ;;
  esac
fi
```

## Workflow Steps

### 1. Create Feature Branch

```bash
git checkout yolo
git pull origin yolo
git checkout -b feature/{module}-{description}
```

### 2. Implement Changes

- Make your code changes
- Follow one tiny change per PR rule
- Ensure changes are testable

### 3. Push and Create PR

```bash
git add {files}
git commit -m "{type}({scope}): {description}"
git push -u origin feature/{module}-{description}

gh pr create --base yolo \
  --title "{Clear title}" \
  --body "$(cat <<'EOF'
## What & Why
{1-3 sentences}

## Changes
{bullet list of files}

Category: {one of 8 Cooperation Paths}
Keywords: {comma, separated}

Waiting for Codex + Copilot review...
EOF
)"
```

### 4. Wait for BOTH Bot Reviews (Codex + Copilot)

```bash
# Get PR number
PR_NUMBER=$(gh pr list --head feature/{module}-{description} --json number --jq '.[0].number')

# Wait 5 minutes for BOTH bots to analyze code
echo "Waiting 5 minutes for chatgpt-codex-connector + copilot-pull-request-reviewer..."
sleep 300

# Check if BOTH reviewed
CODEX_REVIEWED=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '[.[] | select(.user.login == "chatgpt-codex-connector")] | length')

COPILOT_REVIEWED=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '[.[] | select(.user.login == "copilot-pull-request-reviewer")] | length')

echo "✓ Codex reviews: $CODEX_REVIEWED"
echo "✓ Copilot reviews: $COPILOT_REVIEWED"

# If either missing, trigger manually
if [ "$CODEX_REVIEWED" -eq 0 ]; then
  echo "⚠️  Codex hasn't reviewed yet. Manually triggering..."
  gh pr comment $PR_NUMBER --body "@codex review"
  sleep 120  # Wait 2 more minutes
fi

if [ "$COPILOT_REVIEWED" -eq 0 ]; then
  echo "⚠️  Copilot hasn't reviewed yet. Manually triggering..."
  gh pr comment $PR_NUMBER --body "@copilot review"
  sleep 120  # Wait 2 more minutes
fi
```

### 5. Read and Analyze BOTH Bot Reviews

```bash
# Read Codex review (chatgpt-codex-connector)
echo "=== CODEX REVIEW ==="
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector") | {
    state: .state,
    body: .body
  }'

# Count P1 issues from Codex
CODEX_P1=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector") | .body' \
  | grep -c "P1:" || echo 0)

echo "Codex P1 issues: $CODEX_P1"

# Read Copilot review (copilot-pull-request-reviewer)
echo ""
echo "=== COPILOT REVIEW ==="
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "copilot-pull-request-reviewer") | {
    state: .state,
    body: .body
  }'

# Get Copilot line-level comments
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login == "Copilot") | {
    file: .path,
    line: .line,
    issue: .body,
    suggestion: .body | capture("```suggestion\\n(?<code>[\\s\\S]*?)```").code // null
  }'
```

### 6. Address Issues from BOTH Bots

**Priority order:**
1. Fix ALL Codex P1 issues (blocking)
2. Fix ALL Copilot CHANGES_REQUESTED issues (blocking)
3. Fix Codex P2 issues (should fix)
4. Address Copilot suggestions (nice-to-have)

For each issue:

**If suggestion provided:**
```bash
# Apply the suggested fix directly
# (Copilot provides ```suggestion blocks with exact code)
```

**If no suggestion:**
- Analyze the issue described
- Implement appropriate fix
- Commit with descriptive message

```bash
git add {fixed-file}
git commit -m "fix({scope}): address Copilot feedback - {issue summary}"
git push origin feature/{module}-{description}
```

### 7. Verify BOTH Bot Reviews (Blocking Check)

```bash
# Get Codex review state
CODEX_STATE=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector") | .state' | tail -1)

# Count Codex P1 issues
CODEX_P1_COUNT=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "chatgpt-codex-connector") | .body' \
  | grep -c "P1:" || echo 0)

# Get Copilot review state
COPILOT_STATE=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login == "copilot-pull-request-reviewer") | .state' | tail -1)

# Check for blocking issues
BLOCKED=false

if [ "$CODEX_STATE" = "CHANGES_REQUESTED" ]; then
  echo "❌ BLOCKED: Codex requested changes"
  BLOCKED=true
fi

if [ "$CODEX_P1_COUNT" -gt 0 ]; then
  echo "❌ BLOCKED: Codex found $CODEX_P1_COUNT P1 (critical) issues"
  BLOCKED=true
fi

if [ "$COPILOT_STATE" = "CHANGES_REQUESTED" ]; then
  echo "❌ BLOCKED: Copilot requested changes"
  BLOCKED=true
fi

if [ "$BLOCKED" = true ]; then
  echo ""
  echo "Cannot merge until all blocking issues from BOTH bots are resolved."
  echo "Address feedback and push updates, then wait for re-review."
  exit 1
fi

# If we reach here, both bots reviewed with no blocking issues
echo "✅ Both Codex and Copilot reviewed - no blocking issues"
```

### 8. Check Status Checks

```bash
# Verify all required checks pass
gh pr checks $PR_NUMBER --watch

# Get check status
CHECKS_PASS=$(gh pr checks $PR_NUMBER --json state --jq '[.[] | select(.state != "SUCCESS")] | length == 0')

if [ "$CHECKS_PASS" != "true" ]; then
  echo "❌ Status checks failing - not ready to merge"
  exit 1
fi
```

### 9. Auto-Merge (After Dual-Bot Approval)

```bash
# Merge ONLY if:
# - Tests passed (step 8)
# - Codex reviewed with no P1 issues (step 7)
# - Copilot reviewed with no CHANGES_REQUESTED (step 7)
# - All blocking feedback addressed

gh pr merge $PR_NUMBER \
  --squash \
  --delete-branch \
  --subject "{type}({scope}): {description}" \
  --body "Automated merge after Codex + Copilot review and test validation.

Reviews:
- Codex (chatgpt-codex-connector): $CODEX_STATE
- Copilot (copilot-pull-request-reviewer): $COPILOT_STATE
- Tests: PASSED"
```

**Note:** For SQL-only or documentation-only PRs where bots don't review, use `--admin` flag to bypass branch protection.

### 10. Monitor Deployment

```bash
# auto-deploy-production.yml triggers on push to yolo

# Watch the deployment
gh run list --workflow=auto-deploy-production --limit 1

# Get run ID
RUN_ID=$(gh run list --workflow=auto-deploy-production --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch logs
gh run watch $RUN_ID

# Verify deployment success
gh run view $RUN_ID --json conclusion --jq '.conclusion'
# Expected: "success"
```

## Safety Safeguards

### Never Auto-Merge If:

1. **Copilot requested changes**
   - Review decision = "CHANGES_REQUESTED"
   - Action: Address feedback, wait for re-review

2. **Tests failing**
   - Any required status check != SUCCESS
   - Action: Fix failing tests, push update

3. **Security-sensitive code** (require human approval):
   - Authentication/authorization changes
   - Database migrations
   - Payment processing
   - Environment variable changes
   - Dependency updates with known CVEs

4. **Large changes** (>500 lines):
   - May indicate violation of "tiny change" rule
   - Action: Split into smaller PRs

5. **Multiple fix attempts** (>3 iterations):
   - Suggests fundamental design issue
   - Action: Request human review

### Rollback Plan

If auto-merge causes production issues:

```bash
# 1. Identify bad commit
git log yolo -1

# 2. Revert on yolo
git checkout yolo
git revert {bad-commit-sha}
git push origin yolo

# 3. Production auto-deploys revert

# 4. Or manual VPS rollback
ssh root@72.60.27.167
cd /var/www/togetheros
git reset --hard {previous-good-commit}
npm run build
pm2 restart togetheros
```

## Example Usage

### Full Automation Flow

```bash
# 1. Make changes
git checkout -b feature/feed-add-reactions
# ... implement reactions feature ...

# 2. Push and create PR
git add apps/api/src/modules/feed/entities/Reaction.ts
git commit -m "feat(feed): add reaction entity and types"
git push -u origin feature/feed-add-reactions

gh pr create --base yolo \
  --title "feat(feed): Add multi-dimensional reactions" \
  --body "Implements care/insightful/agree/disagree reactions per spec"

# 3. Wait for Copilot
sleep 60

# 4. Get PR number
PR_NUM=$(gh pr list --head feature/feed-add-reactions --json number --jq '.[0].number')

# 5. Check for review comments
COMMENTS=$(gh api repos/coopeverything/TogetherOS/pulls/$PR_NUM/comments \
  --jq '[.[] | select(.user.login | contains("copilot"))] | length')

echo "Copilot left $COMMENTS comments"

# 6. Read each comment
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUM/comments \
  --jq '.[] | select(.user.login | contains("copilot")) | {file: .path, line: .line, issue: .body}'

# 7. Address feedback (example: add missing null check)
# Edit file based on Copilot suggestion
git add apps/api/src/modules/feed/entities/Reaction.ts
git commit -m "fix(feed): add null check for reaction author (Copilot feedback)"
git push origin feature/feed-add-reactions

# 8. Wait for tests
gh pr checks $PR_NUM --watch

# 9. Verify ready to merge
REVIEW_STATUS=$(gh pr view $PR_NUM --json reviewDecision --jq '.reviewDecision')
if [ "$REVIEW_STATUS" != "CHANGES_REQUESTED" ]; then
  echo "✅ Ready to merge"
  gh pr merge $PR_NUM --squash --delete-branch
else
  echo "⚠️  Still has requested changes"
fi

# 10. Monitor deployment
gh run watch $(gh run list --workflow=auto-deploy-production --limit 1 --json databaseId --jq '.[0].databaseId')
```

## Integration with Existing Skills

### Relation to yolo1

The `yolo1` skill implements full feature development. `auto-pr-merge` is a component that can be used within `yolo1` or standalone.

**yolo1 workflow:**
1. Create feature branch ✅
2. Implement feature ✅
3. Create test page ✅
4. **→ Use auto-pr-merge for PR workflow** ✅
5. Monitor deployment ✅
6. Create GitHub Project issue ✅

### Relation to pr-formatter

`pr-formatter` handles PR metadata (category, keywords, validation). `auto-pr-merge` handles the lifecycle.

**Combined flow:**
1. `auto-pr-merge` creates PR with basic body
2. `pr-formatter` validates and enriches PR metadata
3. `auto-pr-merge` waits for Copilot review
4. `auto-pr-merge` addresses feedback and merges

## Configuration

### Branch Protection Setup

Required on `yolo` branch:

```bash
gh api repos/coopeverything/TogetherOS/branches/yolo/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=test \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field enforce_admins=false \
  --field allow_force_pushes=false
```

### Copilot Configuration

Enable in repository settings:
1. Settings → Code security → Copilot
2. Enable "Copilot code review"
3. Configure: "Automatically review new PRs"

## Metrics & Success Criteria

Track these metrics over 1 week:

- **PR cycle time**: time from creation to merge
- **Issues caught**: number of Copilot comments per PR
- **Merge success rate**: % of PRs that merge without human intervention
- **Deployment success rate**: % of auto-deploys that succeed
- **Rollback frequency**: number of reverts needed

**Success thresholds:**
- ✅ 90%+ PRs get Copilot review
- ✅ 70%+ issues fixed automatically
- ✅ 95%+ deployments succeed
- ✅ <5% rollback rate

## Troubleshooting

### Copilot not reviewing

**Symptoms:** No review after 60 seconds
**Causes:**
- Copilot not enabled on repo
- PR too small (< 10 lines changed)
- Copilot rate limited

**Solutions:**
1. Verify Copilot enabled: Settings → Copilot
2. Make slightly larger change to trigger review
3. Wait longer (up to 5 minutes)
4. Manually request: Comment `@copilot review` in PR

### Status checks stuck

**Symptoms:** Tests never complete
**Causes:**
- Workflow file syntax error
- Missing required secrets
- GitHub Actions quota exceeded

**Solutions:**
1. Check workflow logs: gh run view --log-failed
2. Verify secrets exist: gh secret list
3. Check Actions quota: Settings → Billing

### Merge conflicts

**Symptoms:** Cannot auto-merge due to conflicts
**Causes:**
- Base branch (yolo) updated during PR review
- Multiple PRs touching same files

**Solutions:**
1. Rebase on latest yolo: git pull origin yolo --rebase
2. Resolve conflicts manually
3. Push resolved version

### Deployment fails

**Symptoms:** auto-deploy-production workflow fails
**Causes:**
- VPS unreachable
- Build errors
- PM2 restart fails

**Solutions:**
1. Check workflow logs
2. SSH to VPS and check logs: pm2 logs
3. Manual rollback if needed

## Related Documentation

- `CLAUDE.md` - Main session guide
- `.claude/knowledge/ci-cd-discipline.md` - CI/CD rules
- `.github/workflows/auto-deploy-production.yml` - Deployment workflow
- `docs/CI/Actions_Playbook.md` - GitHub Actions reference

## Version History

- v1.0 (2025-01-11): Initial implementation
  - Auto-PR creation
  - Copilot review integration
  - Feedback addressing
  - Auto-merge with safety checks
  - Deployment monitoring
