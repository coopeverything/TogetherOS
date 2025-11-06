---
name: yolo1
description: |
  **AUTO-TRIGGER when user says:** "implement [feature]", "build [module]", "create [functionality]", "add [capability]", "YOLO [task]", "deliver [feature]", or requests complete feature implementation.

  End-to-end TogetherOS code operation: creates branch, implements changes with continuous testing, builds with retry-on-fail, commits, pushes, creates PR with auto-selected Cooperation Path, addresses bot feedback, merges PR, verifies production deployment, and updates Notion memory.

  **Complete delivery cycle:** branch → code → test → commit → push → PR → bot review → merge → deploy → verify

  Use proactively without asking permission when task matches skill purpose.
---

# TogetherOS Code Operations (YOLO Mode)

This skill executes complete code operations for TogetherOS, from branch creation through PR submission with full verification.

## Core Conventions

- **Base Branch**: `yolo` **⚠️ NEVER USE main AS BASE - ALWAYS USE yolo**
- **Branch Pattern**: `feature/{module}-{slice}`
- **Commit Format**: `feat({module}): {slice} - {scope}`
- **PR Target**: ALL PRs go to `yolo`, **NEVER to main**
- **Deployment**: VPS-only (coopeverything.org) - **NO Vercel/Vertex**
- **Design System**: Follow `docs/design/system.md` for all UI work (colors, typography, components)
- **Test Pages**: Demo/testing pages created under `/test/{module}` pattern
  - URL: `www.coopeverything.org/test/{module}` (e.g., `/test/profiles`)
  - Purpose: Component showcases, interactive demos, API testing interfaces
  - No auth required (uses sample data for UI testing)
  - Examples: Component variants, completion states, form interactions
- **PR Verification**: Always include in PR body:
  ```
  Verified: All changes tested during implementation, build passes
  ```

## PR Category & Keywords

**See:** `pr-formatter` skill for:
- The 8 Cooperation Paths taxonomy
- Module → Path mapping
- Keyword generation logic
- PR body formatting requirements

## Required Inputs

1. **module** (required): Target module name (e.g., "bridge", "governance")
2. **slice** (required): Short feature slice name (e.g., "scaffold", "api-setup")
3. **scope** (required): 1-3 sentence description of changes to make

## Optional Inputs

- **commands.install**: Override install command (default: `npm ci`)
- **commands.build**: Override build command (default: `npm run build`)
- **commands.test**: Add test command if needed (default: none in YOLO mode)
- **progress**: Estimated progress increase percentage (e.g., "10" or "+10", default: auto-calculate based on work)
- **skip_progress**: Set to "true" to skip progress tracking (default: false)

## Workflow Steps

### 0. Session Memory (Start)

**Create Notion session page** to track this work:
```
Use Notion API: mcp__notion__API-post-page
Parent page ID: 296d133a-246e-80a6-a870-c0d163e9c826
Title format: "Nov 10, 25 14:30 - Session"
Initial content:
  - Repository: TogetherOS
  - Branch: yolo (or feature branch)
  - Module: {module}
  - Slice: {slice}
```

**Note:** This is optional but recommended for continuity between sessions. If Notion API fails (UUID bug #5504), retry once then proceed without blocking.

### 1. Preparation & Clean State Verification
- Verify working directory is clean (no uncommitted changes):
  ```bash
  # Check for uncommitted changes
  git status --porcelain

  # If output is NOT empty, stop and report:
  # "Working directory has uncommitted changes. Please commit or stash before starting:"
  # [list the uncommitted files]
  ```
- **CRITICAL:** Do NOT proceed if working directory is dirty. Feature branches must start from clean state to avoid accidental file inclusion.
- Ensure repo is on `yolo` branch and up to date:
  ```bash
  git checkout yolo
  git fetch origin yolo
  git merge origin/yolo
  ```
- Verify merge succeeded with no conflicts
- Create feature branch: `feature/{module}-{slice}`
  ```bash
  git checkout -b feature/{module}-{slice}
  ```

### 2. Implementation (Test as You Go)
- Apply scoped edits described in the `scope` parameter
- **CRITICAL**: Test your work continuously during implementation:
  - Read files you create/modify to verify correctness
  - Check syntax and logic as you write
  - Verify imports and dependencies
  - Ensure type safety
- List each file touched with a brief reason
- Keep changes strictly within scope (no scope creep)

### 3. Dependency Installation
- Run install command (default: `npm ci`)
- Verify dependencies installed correctly

### 4. Build with Auto-Retry
- Run build command (default: `npm run build`)
- **If build fails:**
  1. Read error output carefully
  2. Identify the specific issue (type error, import error, syntax error, etc.)
  3. Fix the issue
  4. Re-run build
  5. Repeat until build succeeds
- **Never give up on build failures** - keep correcting until build passes

### 5. Optional Testing
- If `commands.test` is provided, run tests
- Fix any test failures using the same retry approach as builds

### 6. Validation (Optional but Recommended)
- If `scripts/validate.sh` exists, run it to get proof lines
- This runs linting and validation checks
- Outputs: `LINT=OK` and `VALIDATORS=GREEN`
- If validation fails, fix issues and retry
- These proof lines should be included in PR body

### 7. Security Check (Recommended)
- Check for open critical CodeQL alerts before creating PR
- Run: `gh api repos/coopeverything/TogetherOS/code-scanning/alerts --jq '[.[] | select(.state == "open" and .rule.severity == "error")] | length'`
- If critical alerts exist, warn about them (don't block, just inform)
- Include security status in PR body: `SECURITY=OK (0 new critical alerts)` or `SECURITY=WARN (X critical alerts exist)`
- View alerts at: https://github.com/coopeverything/TogetherOS/security/code-scanning

### 8. Git Operations
- Commit with message: `feat({module}): {slice} - {scope}`
- Push branch: `git push -u origin feature/{module}-{slice}`

### 9. Progress & Next Steps Update

**Use `status-tracker` skill** to:
- Calculate estimated progress increase based on work completed
- Update module's Next Steps using `scripts/update-module-next-steps.sh`
- Mark completed tasks as done
- Add any new tasks discovered during implementation
- Prepare progress marker for PR body (e.g., `progress:bridge=+10`)

### 10. PR Creation with Auto-Category & Progress

**Use `pr-formatter` skill** to:
- Auto-select Cooperation Path from module
- Generate 3-5 relevant keywords
- Format PR body with exact structure
- Include progress marker from step 8
- Create PR with `gh pr create --base yolo`

**Then monitor post-push and verify bot reviews:**
- Wait ~60 seconds for AI reviewers (Copilot/Codex) to complete analysis
- **CRITICAL: Check for Codex inline comments** (not just review body):
  ```bash
  # Method 1: Check inline code review comments (try multiple endpoints)

  # Endpoint 1: Pull request comments
  gh api repos/coopeverything/TogetherOS/pulls/<PR#>/comments \
    --jq '.[] | select(.user.login == "chatgpt-codex-connector") | {file: .path, line: .line, body: .body}'

  # Endpoint 2: Pull request reviews
  gh api repos/coopeverything/TogetherOS/pulls/<PR#>/reviews \
    --jq '.[] | select(.user.login == "chatgpt-codex-connector")'

  # Endpoint 3: Issue comments (general PR comments)
  gh api repos/coopeverything/TogetherOS/issues/<PR#>/comments \
    --jq '.[] | select(.user.login == "chatgpt-codex-connector")'

  # Method 2: ALWAYS verify on web UI (MANDATORY, not just fallback)
  gh pr view <PR#> --web
  # REQUIRED: Manually inspect "Files Changed" tab for inline comments
  # GitHub sometimes returns empty API results even when comments exist
  ```
- **Process for verification:**
  1. Run all API commands above
  2. Open web UI (mandatory verification step)
  3. Scroll through EVERY file in "Files Changed" tab
  4. Look for comment badges on line numbers
  5. Only after web UI verification can you confirm "no P1 issues"
- **Analyze Codex feedback priority**:
  - **P1 (Critical)**: MUST fix before merge - security issues, breaking changes, build artifacts
  - **P2 (Important)**: SHOULD fix before merge - code quality, best practices
  - **P3 (Nice-to-have)**: CAN defer - minor suggestions, stylistic preferences
- **Fix all P1 issues** before considering PR merge-ready
- **For each P1 issue**:
  1. Fix the code
  2. Commit with descriptive message (e.g., "fix: address Codex P1 - remove build artifact import")
  3. Push to update PR
  4. Wait for re-analysis
- Check for Copilot sub-PRs:
  ```bash
  gh pr list --author "app/copilot-swe-agent" --search "sub-pr-<PR#>"
  ```
- If sub-PR exists: Review changes, cherry-pick useful fixes, close sub-PR with explanation
- Verify all checks passing: `gh pr checks <PR#>`
- **Note:** Lint/smoke disabled on yolo branch, but test check must pass

Output PR URL and summary of bot feedback addressed

### 11. Merge PR When Ready

**After all checks pass and P1 issues resolved:**
```bash
# Verify PR is truly merge-ready
gh pr checks <PR#>  # All must be green
gh pr view <PR#> --json mergeable --jq '.mergeable'  # Must be "MERGEABLE"

# Verify no unresolved P1 Codex issues via web UI (mandatory check)
gh pr view <PR#> --web
# Manually confirm no P1 issues in Files Changed tab

# Merge PR
gh pr merge <PR#> --squash --delete-branch

# Capture merge commit SHA
MERGE_SHA=$(gh pr view <PR#> --json mergeCommit --jq '.mergeCommit.oid')
echo "Merged as commit: $MERGE_SHA"
```

**Do NOT stop at "ready to merge" - actually merge the PR when verified.**

### 12. Deployment Verification

**After merge, verify production deployment:**
```bash
# Get workflow run triggered by merge
WORKFLOW_RUN=$(gh run list --workflow=auto-deploy-production.yml --branch=yolo --limit 1 --json databaseId --jq '.[0].databaseId')

# Monitor deployment (wait up to 5 minutes)
gh run watch $WORKFLOW_RUN --exit-status

# Check deployment status
DEPLOY_STATUS=$(gh run view $WORKFLOW_RUN --json conclusion --jq '.conclusion')

if [ "$DEPLOY_STATUS" = "success" ]; then
  echo "✅ Deployment successful"
  echo "Changes live at: https://www.coopeverything.org"
else
  echo "❌ Deployment failed - see logs:"
  gh run view $WORKFLOW_RUN --log-failed
  # Report deployment failure to user for investigation
fi
```

**Output final delivery summary:**
```
✅ Feature delivered:
- PR #<num>: <title>
- Merged commit: <sha>
- Deployment: <SUCCESS|FAILED>
- Live URL: https://www.coopeverything.org/<relevant-path>
```

**Only after deployment verification is delivery complete.**

### 13. Session Memory (Finalize)

**Update Notion session page** with final summary:
```
Use Notion API: mcp__notion__API-patch-block-children
Update session page created in Step 0

Add final blocks:
  - Accomplishments: What was delivered
  - PR: Link to merged PR
  - Deployment: Success/failure status
  - Files Changed: Count and key files
  - Duration: Session start to end time
  - Status: ✅ Completed

Update page title: "Nov 10, 25 14:30 - {module} {slice} implementation"
```

**Cleanup old sessions** (keep only 6 most recent):
```
Use Notion API: mcp__notion__API-post-search
Search for session pages, sort by last_edited_time
If count > 6: Archive oldest pages using mcp__notion__API-delete-a-block
```

**Note:** This is optional but recommended for session continuity. If it fails, don't block - report completion and move on.

## Safety Guidelines

1. **Never commit secrets** — Use environment variables or CI secrets
2. **Stay within scope** — No unrelated refactoring or feature creep
3. **Minimal diffs** — Change only what's necessary
4. **Test continuously** — Verify your work as you implement, not just at the end
5. **Fix all build errors** — Never open a PR with a failing build
6. **One concern per PR** — No bundling unrelated changes

## Example Usage

### Example 1: Bridge Scaffold
```
Use Skill: togetheros-code-ops
Inputs:
  module: bridge
  slice: scaffold
  scope: Create /bridge route, stub component in packages/ui, docs/modules/bridge/README.md
```

**Expected Behavior**:
- Branch: `feature/bridge-scaffold`
- Commit: `feat(bridge): scaffold - Create /bridge route, stub component in packages/ui, docs/modules/bridge/README.md`
- PR formatted via `pr-formatter` skill (auto-selected category & keywords)

### Example 2: Governance Integration
```
Use Skill: togetheros-code-ops
Inputs:
  module: governance
  slice: oss-integration
  scope: Integrate selected governance OSS with auth/DB and CI
```

**Expected Behavior**:
- Branch: `feature/governance-oss-integration`
- Commit: `feat(governance): oss-integration - Integrate selected governance OSS with auth/DB and CI`
- PR formatted via `pr-formatter` skill (auto-selected category & keywords)

## Testing Philosophy (YOLO Mode)

In YOLO mode, **you (Claude) are the primary quality gate**:
- No formal linting required before commit (you check code quality as you write)
- No separate test phase (you verify correctness during implementation)
- Build must pass (automated check for syntax/type correctness)
- Optional validation via `scripts/validate.sh` (recommended for proof lines)
- Continuous self-testing replaces traditional QA pipeline

**This means**: Read your code, check your logic, verify your types, and ensure correctness at every step. The build is your final verification that everything compiles correctly.

**About Validation Scripts**: While YOLO mode emphasizes self-testing, running `scripts/validate.sh` before committing provides proof lines (`LINT=OK`, `VALIDATORS=GREEN`) that CI checks look for. These checks are advisory-only and won't block merges, but including them shows good practice.

## Related Skills

- **pr-formatter**: PR creation, formatting, validation, AI feedback loop
- **status-tracker**: Progress tracking, next steps management, Notion memory

**See those skills for:**
- Keyword generation details → `pr-formatter`
- Progress estimation guide → `status-tracker`
- Module progress keys → `status-tracker`
- Notion memory updates → `status-tracker`
- PR verification checklist → `pr-formatter`
