# Future Explorations & Enhancements

**Last Updated:** 2025-10-28

This document tracks future tasks and improvements to explore for TogetherOS development workflow.

---

## 1. GitHub Copilot Integration for Claude Code

**Goal:** Add GitHub Copilot UI suggestions to the workflow where Copilot proposes changes, Claude critiques them, and then implements after review.

**Approach:**
- Integrate GitHub Copilot API or UI extension
- Create workflow: Copilot suggests → Claude reviews/critiques → Claude implements
- Add approval step for human oversight
- Document cases where Copilot vs Claude is more appropriate

**Benefits:**
- Leverage both AI tools for better code quality
- Claude's critique layer adds reasoning and project context awareness
- Potential for faster iteration on routine changes

**Status:** Not started

---

## 2. Permission File Auto-Update

**Goal:** When user selects option 2 (permission choice) in Claude Code prompts, automatically update the permissions file to avoid repeated prompts.

**Current Behavior:**
- Claude asks for permission each time for certain operations
- User repeatedly selects same option (e.g., option 2)
- No persistence of this choice

**Desired Behavior:**
- On permission prompt, detect user's choice
- If user consistently chooses option 2, update `.claude/settings.local.json`
- Future sessions skip the prompt for that operation
- User can always revoke permissions via config

**Investigation Findings (2025-10-28):**

**Permission File Location:**
- `.claude/settings.local.json` in project root
- Contains `permissions.allow` array
- Supports wildcards (e.g., `Write(*)`, `Bash(npm:*)`)

**Current Allow List:**
```json
{
  "permissions": {
    "allow": [
      "Bash", "Write(*)", "Edit(*)", "Read(*)", "Glob(*)", "Grep(*)",
      "TodoWrite(*)",
      "Bash(gh pr:*)", "Bash(npm run dev:*)", "Bash(npm install:*)",
      "Bash(vercel login)", "Bash(vercel:*)", "Bash(curl:*)",
      "mcp__notion__API-post-search",
      "mcp__notion__API-retrieve-a-page",
      "mcp__notion__API-get-block-children",
      "mcp__notion__API-post-page",
      "mcp__notion__API-patch-block-children",
      "mcp__notion__API-delete-a-block",
      "mcp__notion__API-update-a-block"
    ]
  }
}
```

**Mystery:** User reports being prompted for Notion operations despite them being in allow list.

**Possible Causes:**
1. Global permissions override local settings
2. Interactive prompts vs allow list confusion
3. Operation names don't match exactly
4. Permission system bug in Claude Code
5. Different Notion MCP operations not in list

**Next Steps:**
- [ ] Monitor which specific operations trigger prompts
- [ ] Check if there's a global `.claude.json` overriding local
- [ ] Test wildcard: `mcp__notion__API-*` instead of individual operations
- [ ] Document exact operation names when prompted
- [ ] File issue with Claude Code team if bug confirmed

**Auto-Update Strategy:**
When user approves an operation:
1. Detect operation name from prompt
2. Read `.claude/settings.local.json`
3. Add operation to `permissions.allow` array
4. Write updated JSON back
5. Confirm with user: "Added X to permanent allow list"

**Status:** Investigation in progress

---

## 3. Full Percentage Updates Across Repo & Project

**Goal:** Implement automated % completion updates across all relevant files in the repo and GitHub Projects.

**Current State:**
- `STATUS_v2.md` tracks module completion percentages
- Manual updates required
- No automatic propagation to GitHub Projects or other files

**Desired Features:**
1. **Single Source of Truth:** Designate one authoritative location for % values (likely `STATUS_v2.md`)
2. **Auto-Propagation:**
   - Update module docs with latest % on commit
   - Sync to GitHub Projects automatically
   - Update any dashboards or tracking files
3. **Validation:**
   - Ensure % values are realistic (0-100)
   - Flag suspicious jumps (e.g., 10% → 90% in one commit)
   - Require justification for large changes
4. **Reporting:**
   - Generate progress reports automatically
   - Track velocity (% per week)
   - Highlight modules needing attention

**Implementation Tasks:**
- [ ] Audit all files that reference module completion %
- [ ] Create parser for `STATUS_v2.md` to extract % values
- [ ] Build updater script that propagates changes
- [ ] Integrate with existing GitHub Projects sync workflow
- [ ] Add validation rules and pre-commit hooks
- [ ] Create progress dashboard/report generator

**Files to Update:**
- `STATUS_v2.md` (source of truth)
- `docs/modules/*/README.md` or similar
- GitHub Projects via API
- Any Notion pages tracking progress
- Progress log files

**Status:** Not started

---

## Implementation Priority

1. **Permission File Auto-Update** (Quickest win, improves UX immediately)
2. **Full % Updates** (High impact, foundational for project tracking)
3. **GitHub Copilot Integration** (Most complex, experimental)

---

## Notes

- All explorations should maintain the "one tiny change per PR" principle
- Document findings and decisions in this file
- Each exploration may spawn multiple PRs as we iterate
- Keep user informed of progress and ask for feedback early

---

*This document is living and should be updated as we explore these areas.*
