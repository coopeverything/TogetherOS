# Technical Debt & Known Issues

This document tracks technical debt items and known issues that require external fixes or future resolution.

## External Dependencies

### Claude Code: UUID Corruption in MCP Tool Parameters

**Status:** Open (Upstream bug)
**Severity:** Low (workaround available)
**Affects:** Notion MCP integration
**Related Issue:** [Claude Code #5504](https://github.com/anthropics/claude-code/issues/5504) (JSON serialization bug)

**Description:**
Claude Code occasionally corrupts UUIDs when passing them to Notion MCP tools by removing one dash from the UUID format (e.g., `29fd133a-246e-811d-b872-eccf65334c38` becomes `29fd133a-246e-811db872-eccf65334c38`).

**Impact:**
- Notion API calls fail with UUID validation error
- Requires manual retry with correct UUID

**Corruption Pattern:**
- Dash removed at position 18 (merging two segments)
- Example: `811d-b872` → `811db872`
- Results in 35-character string instead of 36

**Root Cause:**
- Claude Code internal MCP parameter serialization
- Related to #5504 (double-encoding JSON objects as strings)
- Not our codebase or MCP server

**Workaround:**
Simply retry the operation with the original correct UUID. Second attempt usually succeeds.

**Fix Status:**
- Requires Anthropic to fix Claude Code internals
- No configuration or code changes available to us
- Documented in:
  - `.claude/skills/status-tracker/skill.md` (Troubleshooting section)
  - `.claude/knowledge/togetheros-kb.md` (Important Reminders)

**Future Action:**
- Monitor Claude Code releases for #5504 fix
- Consider filing dedicated bug report with reproduction case
- Re-test after Claude Code updates

---

## Internal Tech Debt

_No internal tech debt items tracked yet._

---

## Resolved Items

_No resolved items yet._
