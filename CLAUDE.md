# TogetherOS - Claude Code Session Guide

**Auto-loaded at every session start**

---

## Project Knowledge (Auto-Imported)

@.claude/knowledge/togetheros-kb.md
@.claude/knowledge/ci-cd-discipline.md

## Mandatory Workflows

**Pre-Work Verification** (REQUIRED for ALL work):
- See: "Pre-Work Verification Protocol" section below
- Quick checks executed BEFORE starting ANY work
- Prevents wrong branch commits, uncommitted changes leakage

**Pre-Commit Verification** (REQUIRED before git commit):
- See: "Pre-Commit Verification Protocol" section below
- Essential checks executed BEFORE running git commit
- At minimum: tests must pass

**TypeScript Verification** (REQUIRED for ALL TypeScript code):
- See: `.claude/workflows/typescript-verification.md`
- Pre-flight checklist BEFORE writing code
- Post-write verification AFTER writing code
- Prevents 90%+ of TypeScript errors through verification-first approach

**Feature Completion Verification** (REQUIRED for ALL features):
- Backend alone ≠ complete feature
- **MUST verify:** Can a user complete the full workflow from UI to database?
- Check: Does the UI exist to access the backend?
- Check: Are all CRUD operations accessible from the interface?
- Lesson learned: Teaching Sessions had complete backend but no conversation UI (Dec 2025)

**Skill Execution Rule** (REQUIRED when user requests a skill):
- See: "Skill Execution Protocol" section below
- When user says "use X skill" - EXECUTE the skill steps, don't just read them
- Reading a skill file ≠ executing the skill
- Lesson learned: Read UX skill but didn't run validation script or check dark mode classes (Dec 2025)

---

## Skill Execution Protocol

**MANDATORY when user says "use X skill", "run X skill", or similar:**

### The Problem This Solves

Reading a skill's documentation and understanding what it describes is NOT the same as executing the steps. Skills are **executable procedures**, not just reference material.

**Anti-pattern (causes bugs):**
```
User: "use UX skill to audit governance page"
Claude: *reads SKILL.md* *understands it checks CSS* *makes assumptions about what to fix*
Result: Fixed wrong component, missed actual issues
```

**Correct pattern:**
```
User: "use UX skill to audit governance page"
Claude: *reads SKILL.md* *executes Step 1* *executes Step 2* *reports output* ...
Result: Found actual issues via systematic execution
```

### Execution Steps

1. **Locate the skill file:**
   - Check `.claude/skills/{skill-name}/SKILL.md`
   - Or `.claude/skills/{skill-name}.md`

2. **Read the skill file completely**

3. **Find the procedure section** (often titled "Manual Invocation", "Workflow", "Steps", etc.)

4. **Execute EVERY step in order:**
   - If step says "run command" → actually run the command
   - If step says "check file" → actually read the file
   - If step says "report output" → actually show the output to user
   - Do NOT skip steps
   - Do NOT assume outcomes

5. **Report results in the format specified by the skill**

### Example: UX Skill Execution

```
User: "use UX skill on governance page"

Step 1: Identify files
→ Read apps/web/app/governance/page.tsx
→ Find imports: ProposalList from @togetheros/ui/governance
→ Read packages/ui/src/governance/ProposalList.tsx
→ Find imports: ProposalCard
→ Read packages/ui/src/governance/ProposalCard.tsx

Step 2: Run validation
→ Execute: ./scripts/validate-css.sh
→ Report ALL output

Step 3: Manual dark mode check
→ For EACH file, grep for light-only classes
→ Report: file:line - class needs dark:variant

Step 4-7: Continue executing each step...
```

---

## Pre-Work Verification Protocol

**Quick checks before starting work:**

### Check 1: Branch & Working Directory State

```bash
git branch --show-current
git status
```

**Questions to answer:**
- ✅ Am I on the correct branch for this work?
  - Feature work? Should be on `feature/*` branch
  - Bug fixes/small changes? Can be on `yolo` branch directly
  - Docs only? Can be on `docs/*` or `yolo`
- ✅ Are there uncommitted changes from previous work?
  - If YES: Commit them OR stash them OR switch to correct branch
  - If NO: Proceed

**STOP if:**
- Uncommitted changes exist that don't belong on current branch
- Current branch doesn't match the type of work about to start

**Action if STOP:**
```bash
# Option A: Commit if changes belong on current branch
git add . && git commit -m "..."

# Option B: Stash if switching contexts
git stash push -m "WIP: description"

# Option C: Switch to correct branch for those files
git checkout <correct-branch>
git add . && git commit -m "..."
```

### Check 2: Working Directory Must Be Clean

```bash
git status --porcelain
```

**Expected output:** Empty (no output) OR only files related to current task

**If not empty:**
- Review each file: `git status`
- Ask: "Should this file be part of my current work?"
- If NO: Commit it separately or stash it
- If YES: Proceed with work

---

## Pre-Commit Verification Protocol

**Essential checks before committing:**

### Check 1: Tests Must Pass

```bash
npm test
```

**MUST show:** All tests passing

**Why this matters:**
- `TESTS=OK` proof line is REQUIRED for yolo PRs
- CI blocks merge if tests fail
- Danger.js enforces test passing

**If tests fail:**
- Read the error message
- Fix the issue
- Re-run tests
- DO NOT commit until tests pass

### Check 2: TypeScript Verification (RECOMMENDED for TS changes)

```bash
npx tsc --noEmit
```

**Best practice:** Run before committing TypeScript changes

**See:** `.claude/workflows/typescript-verification.md` for detailed TypeScript workflow

### Check 3: Build Verification (OPTIONAL - for production-critical changes)

```bash
npm run build
```

**Run this for:**
- Major refactoring
- Changes to build configuration
- Production-critical features

**If build fails:**
- Fix the issue before committing
- Build failures block deployment

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

**Test Pages (Optional):** `/test/{module}` pattern
- Component testing and demos at www.coopeverything.org/test/{module}
- Rarely used, not required for most features

**Clean Working Directory Discipline:**
- Always verify `git status` is clean before creating feature branches
- Never start new work with uncommitted changes in working directory
- Use `git stash` or commit changes before switching contexts
- Feature branches MUST start from clean state to prevent accidental file inclusion
- See yolo1 skill Step 1 for verification commands

**CI on yolo branch:**
- Tests: Enabled (npm test) - REQUIRED ✅
- Dual-bot code review: RECOMMENDED (optional for features)
  - **Codex** (`chatgpt-codex-connector`) - PRIMARY: Inline reviews, P1 issues block merge
  - **Copilot SWE** (`copilot-swe-agent`) - SECONDARY: Creates sub-PRs with fixes
  - Wait time: 5 minutes for bot reviews (if using)
  - **IMPORTANT**: Check for Copilot sub-PRs BEFORE merging parent PR
- Human approval: NOT REQUIRED
- Lint/smoke: Disabled (only runs on main)
- Auto-deploy: Triggers on merge to production

**Proof lines for yolo PRs:**
- `TESTS=OK` - REQUIRED (Danger.js enforces this)
- `TYPECHECK=OK` - RECOMMENDED for TypeScript changes (run `npx tsc --noEmit`)
- `LINT=OK` - RECOMMENDED (run `./scripts/validate.sh` locally for best practices)
- `VALIDATORS=GREEN`, `DOCS=OK` - Optional

**Proof lines for main PRs:**
- `LINT=OK` - REQUIRED (CI validates)
- `SMOKE=OK` - REQUIRED (CI validates)
- `TESTS=OK` - REQUIRED (CI validates)

**Detailed workflows:** See `pr-formatter` and `yolo1` skills

### When to Push Directly vs Create PR

**Direct push to yolo (no PR needed):**
- ✅ Documentation typo fixes (<50 lines)
- ✅ Comment updates
- ✅ Small bug fixes (<50 lines)
- ✅ Test page additions (/test/module)
- ✅ CHANGELOG updates
- ✅ Emergency hotfixes (with post-push monitoring)

**Create PR for:**
- Features requiring bot feedback (Codex/Copilot suggestions)
- Major refactoring (>300 lines changed)
- Breaking API changes
- Security-sensitive code (want bot security review)
- Want deployment verification before merge

### PR Merge Decision

**When to merge immediately:**
- ✅ Tests pass (required)
- ✅ No P1 security alerts in modified files
- ✅ Changes align with task scope
- ✅ Small fixes or docs updates

**When to wait for bot reviews:**
- Features with complex logic
- Security-sensitive changes
- API changes
- Want additional validation

**PR merge workflow:**
1. Wait 5 minutes for bot reviews (if using bots)
2. Check CI status: `gh pr checks <PR#>`
3. Check for Copilot sub-PRs: `gh pr list --author "app/copilot-swe-agent"`
4. Fix any P1 issues immediately
5. Merge when ALL checks pass: `gh pr merge <PR#> --squash --delete-branch`
6. Monitor auto-deploy: `gh run watch`

### Force Deploy Option

**When to use `workflow_dispatch` with `force: true`:**
- TypeScript errors that don't affect runtime
- Build passes locally but fails in CI due to cache issues
- Known pre-existing errors being fixed in separate PR
- Emergency hotfix that can't wait for full CI

**How to force deploy:**
```bash
# Via GitHub UI: Actions → auto-deploy-production → Run workflow → Check "Force"
# Or via gh CLI (if supported)
```

**After force deploy:**
- Document reason in commit message or PR
- Create follow-up issue for any bypassed errors
- Monitor deployment health closely

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

## Dependabot & Security Alerts

**For detailed protocols, see:** `.claude/knowledge/ci-cd-discipline.md`

**Quick reference:**

### Dependabot Updates
- **≥75%** compatibility → Safe to merge
- **<75%** → Review changelog, test locally
- Major versions → Defer 30-90 days for ecosystem maturity

### Security Alerts (CodeQL)
- **P1 alerts in modified files** → BLOCK merge (must fix)
- **P1 alerts in other files** → Don't block
- **P2/P3 alerts** → Informational only

**View alerts:** https://github.com/coopeverything/TogetherOS/security/code-scanning

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

### Adding New Operations to Allow List

Operations can be added manually to `.claude/settings.local.json` to skip prompts.

**See:** `docs/dev/future-explorations.md` for permission auto-update plans

---

## Device Context

**Detect your environment:**
- **PC (Windows/Mac/Linux):** Full IDE, local database, Docker → use `yolo1` for complete features
- **Tablet (Android Termux):** nano/vim editor, remote DB, no Docker → use `yolo1` for docs/types/fixes

**Device Capabilities:**

| Task | PC | Tablet |
|------|-----|---------|
| Code editing | ✅ Full IDE | ✅ nano/vim |
| npm build | ✅ Full | ✅ Full |
| npm dev | ✅ With DB | ❌ No local DB |
| Docker | ✅ Yes | ❌ No |
| Git ops | ✅ Yes | ✅ Yes |
| PR creation | ✅ Yes | ✅ Yes |
| Database work | ✅ Local | ❌ Remote VPS only |

**Tablet-Specific Adjustments:**
- Skip `npm run dev` commands (no local database)
- Use `npm run typecheck` + `npm run build` instead
- Work on docs, types, and shell scripts
- Use simple test-driven approach (commit frequently)

**Cross-Device:** Always pull before starting a session to avoid conflicts. See `docs/_device-notes/CROSS_DEVICE_WORKFLOW.md`

**Setup Help:** See `docs/_device-notes/TERMUX_SETUP.md` for tablet configuration

---

## Communication Style

- ✅ Concise, direct, technical
- ✅ Use code blocks and examples
- ✅ Show file paths with line numbers (file.ts:123)
- ✅ Status updates via TodoWrite
- ✅ On tablet: acknowledge slower performance, use smaller commits
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

## CRITICAL: Admin Page Registration (MANDATORY)

**EVERY admin page MUST be registered in the /admin dashboard. NO EXCEPTIONS.**

When creating ANY page under `apps/web/app/admin/*/page.tsx`:

1. **IMMEDIATELY add entry to `apps/web/app/admin/page.tsx`** sections array
2. **Choose appropriate section:**
   - System Configuration: Settings, feature flags
   - AI & Content: Onboarding, training, content management
   - Users & Groups: Member/group management
   - Governance & Economy: SP, RP, governance tools
   - Monitoring & Data: Logs, status, analytics, modules
   - Development & Testing: Test pages, design exploration
3. **VERIFY page appears in dashboard at `/admin` BEFORE committing**
4. **NO ORPHANED PAGES** - every admin page must be discoverable from /admin

**Example registration:**
```typescript
// In apps/web/app/admin/page.tsx sections array
{
  title: 'New Admin Page',
  description: 'Brief description of what this admin page does',
  path: '/admin/new-page',
  status: 'active',  // or 'coming-soon' for placeholders
}
```

**If Claude creates an admin page without registering it, this is a BUG to fix immediately.**

**Why this matters:** Admin pages created without navigation registration become orphaned and inaccessible. Users expect ALL admin functionality to be discoverable from the main `/admin` dashboard.

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
2. **Verify clean state (CRITICAL):**
   ```bash
   git status
   git branch --show-current
   ```
   - **If uncommitted changes exist:** Ask user what to do with them
     - Commit them? Stash them? Continue with them?
     - NEVER proceed without acknowledging uncommitted changes
   - **If on feature branch:** Ask if user wants to continue or switch to yolo
   - **Document current state** in first message to user
3. **Check deployment status (if relevant):**
   - Look for open `deployment-failure` GitHub issues
   - Check recent deployment history: `gh run list --limit 5`
   - Report any failures to user
4. **Create Notion session page (RECOMMENDED for complex work):**
   - Use: `mcp__notion__API-post-page`
   - Parent: `296d133a-246e-80a6-a870-c0d163e9c826`
   - Title: `"Nov 10, 25 14:30 - Session"`
   - See `status-tracker` skill for format details
   - If UUID bug occurs, retry once then proceed
5. Review recent commits: `git log --oneline -5`

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

## Branch Naming & Workflow

**Quick Reference - Branch/Work Type Matching:**
- Feature work → `feature/*` branch
- Bug fixes/small changes → `yolo` branch (direct commit)
- Docs only → `docs/*` or `yolo` branch
- Emergency production fix → `yolo` branch (direct commit allowed)

### Branch Naming Patterns

**Feature branches:**
```bash
feature/<topic>              # Example: feature/governance-rewards
claude/<module>-<sessionId>  # Example: claude/bridge-landing-011CUQtanTsWEweh3xMQupeE
```

**Documentation branches:**
```bash
docs/<topic>                 # Example: docs/update-workflows
```

**Bug fix branches:**
```bash
fix/<issue>                  # Example: fix/rating-calculation
```

### Common Scenarios

**Scenario 1: Starting new task**
```bash
# Always check first
git branch --show-current

# Create new feature branch from yolo
git checkout yolo
git pull origin yolo
git checkout -b feature/new-task
```

**Scenario 2: Continuing previous work**
```bash
# Verify on correct branch
git branch --show-current

# If on wrong branch, switch
git checkout feature/previous-task
```

**Scenario 3: Multiple parallel tasks**
```bash
# User may have multiple feature branches
# ALWAYS verify which branch to use for current task
git branch --show-current

# List recent branches if unsure
git branch -a --sort=-committerdate | head -20
```

### Never

- ❌ Assume current branch is correct
- ❌ Start work without checking branch
- ❌ Make changes and discover wrong branch later
- ❌ Rely on previous session's branch state
- ❌ Work on yolo directly (unless explicit user request)

### If Unsure

**Ask user with context:**
```
Currently on branch: <branch-name>
About to work on: <task description>

Is this the correct branch? Should I:
A) Work on current branch (<branch-name>)
B) Switch to existing branch (which one?)
C) Create new feature branch from yolo
```

---

## Background Process Protocol

**Execute immediately when system reminds:**
```
Background Bash XYZ has new output available
```

**Action:**
1. Call BashOutput(bash_id=XYZ) IMMEDIATELY
2. Analyze result (pass/fail/error/progress)
3. Act on finding or continue to next process
4. Never wait, never defer, never summarize instead

**Pattern:**
```bash
# System reminder appears
# ⚠️ DO NOT ignore
# ⚠️ DO NOT wait
# ⚠️ DO NOT summarize first

# ✅ IMMEDIATELY check output
BashOutput(bash_id=XYZ)

# Then analyze and act
```

**Common Mistakes:**
- ❌ Waiting 45+ minutes without checking completed process
- ❌ Summarizing work instead of checking process output
- ❌ Assuming process is still running without verification
- ❌ Checking processes at end of session instead of immediately

**Correct Behavior:**
- ✅ Check output within 30 seconds of reminder
- ✅ Multiple reminders = check each process separately
- ✅ Act on results immediately (fix errors, proceed if pass)
- ✅ Kill hung processes if stuck (use KillShell tool)

---

## Database Table Naming Convention (CRITICAL)

**Context:** We had a production collision where both Feed and Forum modules created a `posts` table. This MUST never happen again.

### Mandatory Naming Convention

**ALL module-specific tables MUST use module prefixes:**

```sql
{module}_{entity}
```

**Examples:**
- ✅ `feed_posts` - Posts in the feed module
- ✅ `forum_posts` - Posts in the forum module
- ✅ `governance_proposals` - Proposals in governance
- ❌ `posts` - NEVER create without module prefix
- ❌ `comments` - NEVER create without module prefix

**Shared tables (no prefix):**
- `users` - Core user accounts
- `groups` - Already established without prefix
- `verification_tokens` - Auth tokens
- `migrations` - Migration tracking

### Migration Creation Checklist

**BEFORE creating ANY migration:**

1. **Check for naming collisions:**
```bash
# List all existing tables (from project root)
find db/migrations -name "*.sql" -exec grep -h "CREATE TABLE" {} \; | \
  sed 's/CREATE TABLE IF NOT EXISTS //;s/CREATE TABLE //;s/ (.*//;s/"//g' | \
  sort -u
```

2. **Verify module prefix:**
- Does your table name start with `{module}_`?
- Is this a truly shared table (users, groups)?
- If shared, have you documented why?

3. **Check related tables:**
```bash
# Find all tables that might relate
grep -r "REFERENCES your_table_name" db/migrations/
```

4. **Test locally first:**
```bash
# Reset local DB and run all migrations
dropdb togetheros_dev && createdb togetheros_dev
for f in db/migrations/*.sql; do psql -U postgres -d togetheros_dev -f "$f"; done
```

5. **Document foreign keys:**
- List all tables this migration references
- List all future tables that will reference this one

### Production Database Access

**SSH Connection:**
```bash
# ALWAYS use IP address (72.60.27.167), not hostname
ssh root@72.60.27.167

# Navigate to project
cd /var/www/togetheros

# Connect to PostgreSQL
sudo -u postgres psql togetheros
```

**Common Operations:**
```sql
-- List all tables with row counts
SELECT schemaname, tablename, n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY tablename;

-- Check for table existence before creating
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'your_table_name'
);

-- View table structure
\d table_name

-- View all foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;
```

**IMPORTANT:** Never use hostname aliases (like @continentjump) - always use the numerical IP address (72.60.27.167) as it's stable across server changes.

---

**This file is automatically loaded at the start of every Claude Code session.**
