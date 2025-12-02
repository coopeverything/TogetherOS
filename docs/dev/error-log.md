# Error Learning Log

This log tracks errors that Claude made during development, to prevent recurrence.

---

## Entry 2: Missing LLM Integration

**Date:** 2025-12-02
**Error Type:** Incomplete implementation - hardcoded placeholders
**File:** apps/web/app/api/bridge-teaching/sessions/[id]/generate/route.ts
**Root Cause:** Teaching session endpoints had `// TODO: Replace with actual LLM call` comments and returned hardcoded template responses instead of calling OpenAI
**Impact:** Bridge training sessions appeared functional but never actually used the LLM - only returned static templates
**Discovery:** Admin tested teaching sessions and got no meaningful response
**Fix Applied:** Connected to OpenAI API using same pattern as `/api/bridge/ask`
**Lesson:** When implementing features that depend on external services (LLMs, databases, etc.), NEVER leave placeholder implementations without clear warnings to the user. Either connect to the real service or clearly indicate the feature is incomplete.
**Prevention:**
1. Search for `TODO`, `FIXME`, `placeholder` before considering a feature complete
2. Features with external dependencies should be verified end-to-end, not just syntactically
3. "Backend complete" ≠ "Feature complete" - verify the full user flow works

---

## Entry 1: Stale State in Streaming Response

**Date:** 2025-12-02
**Error Type:** Logic bug in streaming response
**File:** packages/ui/src/bridge/BridgeChat.tsx:104
**Root Cause:** Used stale state variable (messages.length + 1) instead of functional update (updated.length - 1)
**Impact:** User messages sent but no visible response displayed
**Fix Applied:** Use updated.length - 1 inside setMessages callback
**Lesson:** In React, when calculating indices for state updates that depend on previous state mutations in the same async flow, always use the value inside the functional update callback, not captured closure variables.
**Prevention:** When updating arrays in streaming scenarios, always reference array length inside the functional update.

