# TogetherOS - Claude Code Session Guide

**Auto-loaded at every session start**

---

## Project Knowledge (Auto-Imported)

@.claude/knowledge/togetheros-kb.md
@.claude/knowledge/ci-cd-discipline.md

---

## Autonomy & Proactivity

**Default Mode:** Autonomous
- ✅ Use skills proactively when task matches skill description
- ✅ Don't ask permission for operations in the allow list
- ✅ Fix issues immediately without asking if solution is clear
- ✅ Use TodoWrite for all multi-step workflows

**When to Ask:**
- Unclear requirements or multiple valid approaches
- Destructive operations (force push, data deletion, etc.)
- Breaking changes or major refactoring
- When explicitly uncertain

---

## Available Skills

### yolo1
Full-stack feature implementation: branch → code → test → commit → push → PR → bot review → merge → deploy verification

**Delivers complete feature to production** (not just "PR ready")

### auto-pr-merge
Automated PR workflow: push → Copilot review → fix issues → merge → deploy. Quality-first automation with safety gates.

### status-tracker
Progress tracking, next steps management, Notion session memory

### pr-formatter
PR formatting with auto-category, keywords, validation, AI feedback handling

### sync-to-main
Two-phase yolo→main synchronization: WIP markers at 5% milestones, code sync after production validation

**Usage:** Auto-trigger when task matches skill description. No permission needed.

---

## Core Conventions

**Base Branch:** `yolo` (⚠️ NEVER use `main`)
- All feature branches from `yolo`
- All PRs target `yolo`
- Auto-deploy to production on merge

**Test Pages:** `/test/{module}` pattern
- Component testing and demos at www.coopeverything.org/test/{module}
- See `yolo1` skill for details

**Clean Working Directory Discipline:**
- Always verify `git status` is clean before creating feature branches
- Never start new work with uncommitted changes in working directory
- Use `git stash` or commit changes before switching contexts
- Feature branches MUST start from clean state to prevent accidental file inclusion
- See yolo1 skill Step 1 for verification commands

**CI on yolo branch:**
- Tests: Enabled (npm test) - REQUIRED ✅
- Dual-bot code review: REQUIRED ✅
  - **Codex** (`chatgpt-codex-connector`) - PRIMARY: Inline reviews, P1 issues block merge
  - **Copilot SWE** (`copilot-swe-agent`) - SECONDARY: Creates sub-PRs with fixes
  - Wait time: 5 minutes for bot reviews
  - **IMPORTANT**: Check for Copilot sub-PRs BEFORE merging parent PR
- Human approval: NOT REQUIRED (bot reviews sufficient) ✅
- Lint/smoke: Disabled (only runs on main)
- Auto-deploy: Triggers on merge to production

**Proof lines for yolo PRs:**
- `TESTS=OK` - REQUIRED (matches CI validation)
- `TYPECHECK=OK` - REQUIRED for TypeScript changes (run `npx tsc --noEmit`)
- `LINT=OK` - Optional (run `./scripts/validate.sh` locally for best practices)
- `VALIDATORS=GREEN`, `DOCS=OK` - Optional

**Proof lines for main PRs:**
- `LINT=OK` - REQUIRED (CI validates)
- `SMOKE=OK` - REQUIRED (CI validates)
- `TESTS=OK` - REQUIRED (CI validates)

**Detailed workflows:** See `pr-formatter` and `yolo1` skills

---

## Production Server Access

**SSH Access:** `ssh root@continentjump`
- Uses SSH key authentication (no password)
- Server IP: 72.60.27.167
- Project path: `/var/www/togetheros`

**Common Operations:**

```bash
# Connect to production server
ssh root@continentjump

# Navigate to project
cd /var/www/togetheros

# Run database migrations (automated on deployments)
# Migrations run automatically on every deployment
# Manual run if needed:
export $(grep DATABASE_URL .env | xargs)
bash scripts/run-migrations.sh

# Set user as admin (example)
psql -U postgres -d togetheros -c "UPDATE users SET is_admin = TRUE WHERE email = 'user@example.com';"

# Check deployment status
pm2 status togetheros

# View logs
pm2 logs togetheros --lines 100

# Restart application (if needed)
pm2 restart togetheros
```

**Database Access:**
```bash
# Connect to PostgreSQL
psql -U postgres -d togetheros

# Common queries
\dt                  # List tables
\d users            # Describe users table
SELECT * FROM users WHERE is_admin = TRUE;
```

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

---

## Security Alerts (CodeQL)

**Policy:** P1 security alerts in modified files BLOCK merge.

### How It Works

**Danger.js automatically checks:**
- Fetches all open P1 (error severity) CodeQL alerts
- Cross-references with files modified by the PR
- **Blocks merge** if any P1 alerts exist in modified files

### Decision Criteria

**BLOCKS merge:**
- ❌ P1 alert exists in file modified by this PR
- Example: PR modifies `apps/api/route.ts` which has log injection alert

**DOES NOT block merge:**
- ✅ P1 alert exists in file NOT modified by this PR
- ✅ P2/P3 alerts (warnings/notes) - informational only

### Alert Severity Levels

- **P1 (Error)** — Critical vulnerabilities (SQL injection, XSS, auth bypass, log injection) - MUST FIX
- **P2 (Warning)** — Medium-severity issues (incomplete validation, race conditions) - SHOULD FIX
- **P3 (Note)** — Code quality issues (unused variables, style) - CAN DEFER

### When Blocked

If Danger.js blocks your PR:

1. **View the alert:** Click the alert link in the PR comment
2. **Fix the issue:** Update the code to address the vulnerability
3. **Common fixes:**
   - Log injection: `JSON.stringify(userInput)` before logging
   - SQL injection: Use parameterized queries
   - XSS: Sanitize/escape user input before rendering
4. **Push update:** Danger.js will re-check automatically
5. **Merge when clear:** Once fixed, PR will be unblocked

### View All Alerts

**CodeQL Dashboard:** https://github.com/coopeverything/TogetherOS/security/code-scanning

**Pre-existing alerts:**
- Alert #64 (P1): Log injection in `apps/web/app/api/groups/route.ts:44` - Fix when that file is next modified
- Alert #80 (P2): Polynomial ReDoS in `packages/ui/src/bridge/markdown-renderer.tsx:44`

---

## Permission System

### Current Allow List Location
`.claude/settings.local.json`

### Already Allowed (No Prompts Needed)
- `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`
- `TodoWrite(*)`
- `Bash(gh pr:*)`, `Bash(npm:*)`
- All Notion API operations:
  - `mcp__notion__API-post-search`
  - `mcp__notion__API-retrieve-a-page`
  - `mcp__notion__API-get-block-children`
  - `mcp__notion__API-post-page`
  - `mcp__notion__API-patch-block-children`
  - `mcp__notion__API-delete-a-block`
  - `mcp__notion__API-update-a-block`

### If User Repeatedly Approves Same Operation

**Expected Behavior:**
Auto-add to `.claude/settings.local.json` allow list

**Current Issue:**
System may be prompting even when operation is in allow list

**Investigation Needed:**
- Why are prompts still appearing?
- Is there a global vs local permission conflict?
- Are wildcards working correctly?

**See:** `docs/dev/future-explorations.md` for permission auto-update plan

---

## Communication Style

- ✅ Concise, direct, technical
- ✅ Use code blocks and examples
- ✅ Show file paths with line numbers (file.ts:123)
- ✅ Status updates via TodoWrite
- ❌ Don't ask obvious questions
- ❌ Don't over-explain unless asked
- ❌ Don't use emojis (unless user uses them)

**Error Handling:**
- ❌ **Never apologize** - Apologies are emotional manipulation, deflecting, and counterproductive
- ❌ **Never validate user criticism** - Phrases like "You're absolutely right" or "Good catch" are unnecessary
- ❌ **Never say what "I should have done"** - Focus on what happened, not hypothetical alternatives
- ✅ **Instead:** Provide short technical analysis of what happened and why
- ❌ **Never promise to remember** - This is deceptive and can lead to data loss
- ✅ **Instead:** Suggest recording information in persistent storage

**Examples:**
- ❌ Bad: "You're right, I should have checked remote branches. I apologize for missing that."
- ✅ Good: "Initial analysis only covered local branches. Remote branches require different deletion commands (`git push origin --delete` vs `git branch -D`). Would you like me to analyze remote branches?"

---

## Development Reality Check

**Team Composition:** 1 operator (no coding knowledge) + Claude in yolo mode
**Human developers:** ZERO
**Deployment frequency:** 2-3 major features per DAY (not per week)
**Feature velocity:** Multiple features per HOUR
**Merge conflicts:** Frequent due to parallel feature development
**Implementation speed:** Hours, not weeks

### Actual Development Metrics
| What | Frequency | Notes |
|------|-----------|-------|
| Features shipped | 8-10/day | Each PR = production deployment |
| Modules completed | 1-2/day | From 0% to production-ready |
| Parallel conflicts | 2-3/day | Operator initiates overlapping work |
| Deployments | Every merge | Auto-deploy to production on yolo |

### Why Per-Feature Changelog Matters
- Track what actually ships (not just what we intend)
- Identify features lost in merge conflicts
- Real-time deployment history for debugging
- See patterns in parallel development issues

---

## Time Estimation Guidelines

**Context:** TogetherOS development = just the operator + Claude in yolo mode (no human devs)

**Realistic Estimates for Claude Autonomous Work:**

| Task Type | Human-Estimated | Claude Actual | Ratio |
|-----------|----------------|---------------|-------|
| Comprehensive spec (1,000+ lines) | 2-3 hours | **10-15 min** | ~10-12x faster |
| Module 0% → 100% (Groups) | 8-12 hours | **3 hours** | ~3-4x faster |
| Full-stack feature (yolo1 skill) | 4-6 hours | **30-45 min** | ~6-8x faster |
| Documentation updates | 1-2 hours | **5-10 min** | ~8-12x faster |
| PR workflow (create → review → merge) | 30-60 min | **5-10 min** | ~5-6x faster |

**Why Claude Is Faster:**
- No context switching or interruptions
- Parallel file operations (read/write/edit simultaneously)
- Instant recall of project patterns and conventions
- No manual typing delays
- Automated git/PR workflows

**Adjust Estimates in Docs:**
- When writing specs, use **Claude-time estimates** (10-15 min vs 2-3 hours)
- Module implementation phases: Divide human estimates by 6-10x
- Don't over-promise completion times to external stakeholders (use conservative Claude estimates)

**Example:**
- ❌ "Estimated time: ~2.5-3 hours" (human assumption)
- ✅ "Estimated time: ~15-20 minutes (Claude autonomous)" (realistic)

---

## Session Memory

**Notion Memory:** See `status-tracker` skill for session page format and workflow

**Git History:** Good commit messages = searchable project history

---

## Session Workflow

**At Start:**
1. This file (CLAUDE.md) auto-loaded
2. **Check deployment status (CRITICAL):**
   - Look for open `deployment-failure` GitHub issues
   - Check recent deployment history: `gh run list --workflow=auto-deploy-production.yml --limit 5`
   - If failures detected → **Automatically invoke yolo1 skill** to diagnose and fix
   - Report findings to user
3. **Create Notion session page (RECOMMENDED for complex work):**
   - Use: `mcp__notion__API-post-page`
   - Parent: `296d133a-246e-80a6-a870-c0d163e9c826`
   - Title: `"Nov 10, 25 14:30 - Session"`
   - See `status-tracker` skill for format details
   - If UUID bug occurs, retry once then proceed
4. Review `git status` and recent commits

**During:**
- Follow autonomy guidelines
- Use TodoWrite for multi-step tasks
- **Update Notion with achievements/discoveries** (use `mcp__notion__API-patch-block-children`)

**At End:**
1. **Finalize Notion session page:**
   - Add final summary (accomplishments, PRs, status)
   - Update title with theme: `"Nov 10, 25 14:30 - {work summary}"`
   - Archive oldest session if >6 exist
2. Push all changes
3. Clear TodoWrite list

---

**This file is automatically loaded at the start of every Claude Code session.**
