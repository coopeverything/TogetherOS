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

- ✅ GitHub Copilot PR reviewer enabled on repository
- ✅ Branch protection on `yolo` with status checks
- ✅ Tests configured and passing
- ✅ Auto-deploy workflow ready (`.github/workflows/auto-deploy-production.yml`)

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

Waiting for Copilot review...
EOF
)"
```

### 4. Wait for Copilot Review

```bash
# Wait 60 seconds for Copilot to analyze code
sleep 60

# Get PR number from gh pr list
PR_NUMBER=$(gh pr list --head feature/{module}-{description} --json number --jq '.[0].number')

# Check for reviews
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/reviews \
  --jq '.[] | select(.user.login | contains("copilot"))'
```

### 5. Read and Analyze Bot Comments

```bash
# Get all line-level comments from Copilot
gh api repos/coopeverything/TogetherOS/pulls/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login | contains("copilot") or contains("Copilot")) | {
    file: .path,
    line: .line,
    issue: .body,
    suggestion: .body | capture("```suggestion\\n(?<code>[\\s\\S]*?)```").code // null
  }'
```

### 6. Address Each Issue

For each Copilot comment:

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

### 7. Verify Review Status

```bash
# Check if Copilot approved or requested changes
REVIEW_DECISION=$(gh pr view $PR_NUMBER --json reviewDecision --jq '.reviewDecision')

# Possible values: APPROVED, CHANGES_REQUESTED, REVIEW_REQUIRED, ""

if [ "$REVIEW_DECISION" = "CHANGES_REQUESTED" ]; then
  echo "⚠️  Copilot requested changes - not ready to merge"
  exit 1
fi
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

### 9. Auto-Merge

```bash
# Merge if:
# - No CHANGES_REQUESTED review
# - All status checks pass
# - At least 1 approval OR no blocking reviews

gh pr merge $PR_NUMBER \
  --squash \
  --delete-branch \
  --subject "{type}({scope}): {description}" \
  --body "Automated merge after Copilot review and test validation"
```

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
