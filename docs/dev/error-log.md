## Error Learning Entry

**Date:** 2025-12-02
**Error Type:** Logic bug in streaming response
**File:** packages/ui/src/bridge/BridgeChat.tsx:104
**Root Cause:** Used stale state variable (messages.length + 1) instead of functional update (updated.length - 1)
**Impact:** User messages sent but no visible response displayed
**Fix Applied:** Use updated.length - 1 inside setMessages callback
**Lesson:** In React, when calculating indices for state updates that depend on previous state mutations in the same async flow, always use the value inside the functional update callback, not captured closure variables.
**Prevention:** When updating arrays in streaming scenarios, always reference array length inside the functional update.

