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
Full-stack feature implementation: branch → code → test → commit → push → PR → deploy

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

**CI on yolo branch:**
- Tests: Enabled (npm test) - REQUIRED ✅
- Dual-bot code review: REQUIRED ✅
  - **Codex** (`chatgpt-codex-connector`) - PRIMARY: Inline reviews, P1 issues block merge
  - **Copilot SWE** (`copilot-swe-agent`) - SECONDARY: Creates sub-PRs with fixes
  - Wait time: 5 minutes for bot reviews
  - **IMPORTANT**: Check for Copilot sub-PRs BEFORE merging parent PR
- Lint/smoke: Disabled (only runs on main)
- Auto-deploy: Triggers on merge to production

**Detailed workflows:** See `pr-formatter` and `yolo1` skills

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
2. Check Notion session memory (see `status-tracker` skill)
3. Review `git status` and recent commits

**During:**
- Follow autonomy guidelines
- Use TodoWrite for multi-step tasks
- Update Notion on achievements/discoveries

**At End:**
- Update Notion session page
- Push all changes
- Clear TodoWrite list

---

**This file is automatically loaded at the start of every Claude Code session.**
