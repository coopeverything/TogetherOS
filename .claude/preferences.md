# Claude Code Preferences for TogetherOS

**Last Updated:** 2025-10-28

This file documents user preferences and workflow expectations that should persist across sessions.

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

## Skill Usage

### togetheros-code-ops (YOLO Skill)

**Auto-Trigger When User Says:**
- "implement [feature]"
- "build [module]"
- "create [functionality]"
- "add [capability]"
- "YOLO [task]"
- Any request for complete feature implementation

**What It Does:**
- Creates branch
- Implements changes
- Tests continuously
- Commits and pushes
- Creates PR
- **Runs PR verification checks**
- **Updates Notion memory**
- Reports status

**Don't Ask Permission** - Just use it when the request matches

---

## PR Workflow

### ⚠️ CRITICAL: Base Branch

**ALWAYS use `claude-yolo` as base branch - NEVER use `main`**
- All feature branches created from `claude-yolo`
- All PRs target `claude-yolo`, not `main`
- User NEVER works directly with main

### Always Required Before Suggesting Merge

**Run This Checklist:**
```bash
# 1. Check mergeable
gh pr view <PR#> --json mergeable,baseRefName

# 2. Verify base is claude-yolo (not main!)
# baseRefName should be "claude-yolo"

# 3. Review CI
gh pr checks <PR#>

# 4. Fix conflicts if needed
git fetch origin claude-yolo && git merge origin/claude-yolo

# 5. Fix CI failures if needed
gh run view <run-id> --log-failed
```

**Never Say "Ready to Merge" Until:**
- ✅ Mergeable status = MERGEABLE
- ✅ All CI checks passing
- ✅ No unaddressed reviews
- ✅ All commits quality-checked

**See:** `docs/dev/pr-checklist.md`

---

## Notion Memory Updates

### When to Update

**After Every:**
- PR creation
- Major milestone completion
- Session handoff point
- User requests it

### What to Update

**Quick Handoff Page Only:**
- What we did (3-5 bullets)
- Where we are (branch, commit, status)
- Next steps (2-3 items)

**Keep It Minimal:** 10-15 lines total, easy to scan

**Don't:** Create verbose session summaries unless explicitly asked

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

## Session Memory Strategy

### Priority 1: Quick Handoff Page (Notion)
- Single source of truth for "what/where/next"
- Update at end of every work session
- Maximum 15 lines

### Priority 2: Git Commits
- Good commit messages are searchable history
- Include "what and why"
- Reference file paths

### Priority 3: Detailed Session Pages (Notion)
- Only when major milestones reached
- Keep last 3 sessions, archive older
- Full technical details for complex work

**Read Order When Starting New Session:**
1. Quick Handoff page (always)
2. Recent commits (if needed)
3. Detailed session page (if context needed)

---

## How Claude Should Remember This

### At Session Start
1. Read `.claude/preferences.md` (this file)
2. Read Notion "Quick Handoff" page
3. Check `git status` and recent commits
4. Resume work based on context

### During Session
- Follow autonomy guidelines
- Use TodoWrite for tracking
- Update Quick Handoff when approaching token limit

### At Session End
- Update Quick Handoff page
- Push all changes
- Clear TodoWrite list

---

**This file should be read at the start of every Claude Code session.**
