# Session Memory Workflow

This document defines how Claude Code manages session memory using Notion integration.

## Overview

Every Claude Code session is automatically documented in Notion under the "Claude memory" page. This creates a persistent record of work, decisions, and context that can be referenced in future sessions.

## Notion Structure

- **Parent Page**: "Claude memory"
- **Parent Page ID**: `296d133a-246e-80a6-a870-c0d163e9c826` (REQUIRED - all sessions must be created under this page)
- **Session Pages**: Child pages created for each session
- **Naming Convention**: `[Date] [Time] - Session` → updated to `[Date] [Time] - [Theme]` at session end

**IMPORTANT**: When creating session pages, always use this parent page configuration:
```json
{
  "parent": {
    "page_id": "296d133a-246e-80a6-a870-c0d163e9c826"
  }
}
```

## Workflow Steps

### 1. Session Start (Automatic)

When a new session begins, Claude Code should:

1. Create a new page under "Claude memory" (page_id: `296d133a-246e-80a6-a870-c0d163e9c826`)
2. Set initial title: `YYYY-MM-DD HH:MM - Session`
3. Add initial content:
   ```markdown
   # Session Started: YYYY-MM-DD HH:MM

   ## Context
   - Repository: TogetherOS
   - Branch: [current branch]
   - Working Directory: [cwd]

   ## Session Log

   _Updates will be added as work progresses..._
   ```

**Notion API Call**:
```
mcp__notion__API-post-page
{
  "parent": {
    "page_id": "296d133a-246e-80a6-a870-c0d163e9c826"
  },
  "properties": {
    "title": [
      {
        "text": {
          "content": "2025-10-29 16:30 - Session"
        }
      }
    ]
  }
}
```

### 2. During Session (Continuous)

As work progresses, append updates to the session page:

- **Commands executed**: Major bash commands, builds, tests
- **Files modified**: Key file changes with brief descriptions
- **Decisions made**: Architecture choices, approach selections
- **Issues encountered**: Errors, blockers, and how they were resolved
- **PRs created**: Links to pull requests with summaries

**Update Format**:
```markdown
### [HH:MM] - [Action]

[Brief description of what was done]

**Files:**
- `path/to/file.ts` - [what changed]

**Outcome:**
[Result or next step]
```

### 3. Session End (Automatic)

When the session concludes, Claude Code should:

1. Generate a session summary
2. Identify the main theme/focus of the session
3. Update the page title: `YYYY-MM-DD HH:MM - [Theme]`
4. Append final summary:
   ```markdown
   ---

   ## Session Summary

   **Theme**: [Primary focus of the session]

   **Accomplishments**:
   - [Key achievement 1]
   - [Key achievement 2]

   **Files Changed**: [Count] files across [modules]

   **PRs Created**: [List with links]

   **Next Steps**:
   - [Recommended follow-up 1]
   - [Recommended follow-up 2]

   **Session Duration**: [Start time] - [End time]

   **Status**: ✅ Completed | ⚠️ Interrupted | 🔄 Continued in next session
   ```

## Integration with YOLO Workflow

When using the `togetheros-code-ops` skill (YOLO mode), session memory should capture:

- Module and slice being worked on
- Cooperation Path selected
- Progress increments
- Build/test results
- PR creation details

## When to Create Session Pages

**Always create a session page when**:
- Starting any code implementation work
- Using the `/yolo` command or `togetheros-code-ops` skill
- Making architectural decisions
- Troubleshooting complex issues
- Multi-step operations that span multiple commands

**Optional for**:
- Simple file reads or searches
- Quick documentation updates
- Information-only queries

## Retrieval and Reference

**Starting a new session**: Claude Code can search Notion for recent session pages to understand:
- Recent work context
- Ongoing tasks
- Previous decisions
- Known issues

**Search command**:
```
Search Notion for sessions from the last [N] days about [topic]
```

## Privacy and Security

- **Never store**: API keys, tokens, passwords, or sensitive credentials
- **Hash identifiers**: User IDs, IP addresses should be hashed if logged
- **Safe to store**: File paths, module names, public repo URLs, decision rationale

## Manual Override

Users can:
- Request session page creation at any time: "Create a Notion session page"
- Skip session logging: "Skip Notion logging for this session"
- Update session theme mid-session: "Update session theme to [new theme]"

## Benefits

1. **Continuity**: Pick up where you left off in future sessions
2. **Accountability**: Track what was accomplished and when
3. **Learning**: Review past approaches to similar problems
4. **Collaboration**: Share session context with team members
5. **Audit Trail**: Understand how decisions were made

## Implementation Notes

- Uses MCP Notion integration (configured in `.mcp.json`)
- Parent page ID is hard-coded but can be overridden via environment variable
- Session pages are never deleted, only archived if needed
- Date/time uses ISO 8601 format in UTC

## Example Session Page

**Title**: `2025-10-29 16:30 - Bridge Module Streaming UI Implementation`

**Content**:
```markdown
# Session Started: 2025-10-29 16:30 UTC

## Context
- Repository: TogetherOS
- Branch: feature/bridge-streaming-ui
- Working Directory: /mnt/g/Coopeverything/TogetherOS

## Session Log

### 16:30 - Created feature branch
Created branch `feature/bridge-streaming-ui` from `claude-yolo`

### 16:35 - Implemented streaming component
**Files:**
- `apps/frontend/app/bridge/components/StreamingAnswer.tsx` - New streaming UI component
- `apps/frontend/app/api/bridge/ask/route.ts` - API route with streaming response

**Outcome:** Component renders but needs styling

### 16:45 - Applied design system
**Files:**
- `apps/frontend/app/bridge/components/StreamingAnswer.tsx` - Added design tokens

**Outcome:** Build passes, UI matches design system

### 16:50 - Created PR
**PR**: https://github.com/coopeverything/TogetherOS/pull/123
**Title**: feat(bridge): streaming UI component
**Path**: Cooperative Technology

---

## Session Summary

**Theme**: Bridge Module Streaming UI Implementation

**Accomplishments**:
- Implemented streaming answer component with proper React patterns
- Integrated design system tokens for consistent styling
- Created and pushed PR to claude-yolo branch

**Files Changed**: 2 files (1 component, 1 API route)

**PRs Created**:
- #123: feat(bridge): streaming UI component

**Next Steps**:
- Wait for PR review
- Add Storybook story for component
- Implement error states

**Session Duration**: 16:30 - 17:00 UTC (30 minutes)

**Status**: ✅ Completed
```

---

## Automation Checklist

For Claude Code to implement this workflow automatically:

- [ ] Session start detection (first substantive command)
- [ ] Notion page creation with template
- [ ] Incremental updates during work
- [ ] Theme extraction from session content
- [ ] Final summary generation
- [ ] Title update with theme
- [ ] Integration with YOLO workflow steps

---

**Related Documentation**:
- `.claude/skills/togetheros-code-ops/SKILL.md` - YOLO workflow integration
- `.mcp.json` - Notion MCP server configuration
- `docs/OPERATIONS.md` - General operations guide
