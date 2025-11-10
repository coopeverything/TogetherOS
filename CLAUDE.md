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

**CI on yolo branch:**
- Lint/smoke: Disabled
- Copilot/Codex reviewers: Enabled
- Build verification: Required

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
