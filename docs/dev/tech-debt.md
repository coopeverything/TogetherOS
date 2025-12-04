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

### SSH Deploy User - Direct Root Access (2025-12-04)

**Status:** Deferred
**Severity:** Medium (security improvement)
**Documented In:** `docs/dev/ssh-key-rotation.md`, `.claude/plans/serene-mapping-popcorn.md`

**Description:**
Current deployment uses `root@72.60.27.167` for SSH access. This grants full server control to anyone with the SSH key. A dedicated `deploy` user with limited sudo privileges would reduce attack surface.

**Risk:**
- If SSH key is compromised (GitHub breach, laptop theft), attacker gets full root access
- Can delete files, install backdoors, access database credentials
- No audit trail separation between deployment actions and admin actions

**Recommended Fix:**
1. Create `deploy` user on VPS with limited sudo:
   ```bash
   sudo useradd -m -s /bin/bash deploy
   echo 'deploy ALL=(ALL) NOPASSWD: /usr/bin/git, /usr/local/bin/pm2, /usr/bin/npm' | sudo tee /etc/sudoers.d/deploy
   ```
2. Copy SSH authorized_keys to deploy user
3. Update GitHub Secret `VPS_USER` from `root` to `deploy`
4. Update workflow commands to use `sudo` where needed

**Why Deferred:**
- Requires server access (not just code changes)
- Current setup works and team is small (1 operator + Claude)
- Other security fixes were higher priority

**When to Implement:**
- Before sharing SSH keys with additional team members
- If security audit requires it
- When scaling to multiple deploy sources

**Related:**
- SSH security fixes implemented: Commits `1d2f1e3`, `a5523be`
- Plan file: `.claude/plans/serene-mapping-popcorn.md` (Future Work section)

---

### TypeScript Build Errors - 14 Remaining (2025-11-07)

**Status:** In Progress
**Severity:** Low (non-blocking for deployment)
**Branch:** `feature/build-typescript-fixes`
**Progress:** Reduced from 100+ errors to 14 (86% improvement)

**Context:**
Deployment failures were caused by missing `tsconfig.base.json` and incorrect module resolution settings. Major fixes completed, 14 low-priority errors remain.

#### Error Categories

**1. lib/db Path Resolution (✅ RESOLVED - 2025-11-16)**
- **Status:** ✅ Fixed by creating `@togetheros/db` package
- **Resolution date:** November 16, 2025
- **Previously:** 2 TypeScript errors (TS6059, TS6307) affecting 8 files with `@ts-ignore` suppressions
- **Files refactored:**
  - `apps/api/src/modules/bridge-behavioral/repos/PostgresMemoryRepo.ts`
  - `apps/api/src/modules/bridge-behavioral/repos/PostgresQuestionnaireRepo.ts`
  - `apps/api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo.ts`
  - `apps/api/src/modules/bridge-training/repos/PostgresBridgeTrainingRepo.ts`
  - `apps/api/src/modules/groups/repos/PostgresGroupRepo.ts`
  - `apps/api/src/modules/feed/repos/PostgresPostRepo.ts`
  - `apps/api/src/services/bridge/OnboardingService.ts`
  - `apps/api/src/services/bridge/SimilarityDetector.ts`

**What was done:**
1. Created `packages/db/` package with proper monorepo structure
   - `packages/db/package.json` - Package configuration with pg dependencies
   - `packages/db/tsconfig.json` - TypeScript configuration extending base config
   - `packages/db/src/index.ts` - Database connection utilities (moved from `lib/db/index.ts`)
2. Updated all 8 files to import from `@togetheros/db` instead of `@/lib/db`
3. Removed all 8 `@ts-ignore` suppressions
4. Added `@togetheros/db` path alias to `apps/api/tsconfig.json`
5. Added project reference to `packages/db` in `apps/api/tsconfig.json`
6. Removed old `lib/db/` directory (lib/ directory retained for auth, bridge, observability, utils.ts)

**Verification:**
- ✅ TypeScript check: `npx tsc --noEmit` passes with 0 errors
- ✅ Dependencies installed successfully
- ✅ All imports resolved correctly
- ✅ Proper monorepo package structure established
- ✅ CI workflow updated to use `npm install --legacy-peer-deps` (fixed preflight checks)
- ✅ Deployed to production successfully (run #19413703170)
- ✅ Production health check: `status: "ok"` at coopeverything.org/api/health

**Result:** All TypeScript errors eliminated, proper separation of concerns achieved, successfully deployed to production

**Related PRs:**
- [#296](https://github.com/coopeverything/TogetherOS/pull/296) - Create @togetheros/db package
- [#297](https://github.com/coopeverything/TogetherOS/pull/297) - Fix React 19 peer dependency conflict

**Related Commits:**
- `701a73a` - Regenerate package-lock.json to resolve CI sync issues
- `235e7e0` - Fix CI workflow to use npm install --legacy-peer-deps

**2. DecisionLoop Type Mismatches (P4 - Defer)**
- **Count:** 7 errors
- **File:** `apps/api/src/modules/bridge-behavioral/services/DecisionLoop.ts`
- **Errors:**
  - Line 342: Property 'sessionId' doesn't exist on `EpisodicMemory` type
  - Line 487: Type `"show_recommendation"` should be `"offer_recommendation"`
  - Line 492: Type `"send_nudge"` not in allowed action types
  - Lines 515, 637, 645, 658: `ConsentFlags` and `EpisodicMemory` not exported from `@togetheros/types`
- **Impact:** None - Bridge behavioral AI module is experimental and not in active use
- **Fix:**
  - Add missing type exports to `packages/types/src/bridge-behavioral.ts`
  - Correct action type names to match union type
  - Add `sessionId` field to `EpisodicMemory` type
- **Defer Until:** Bridge behavioral module is activated for production use

**3. LocalStorageGroupRepo Browser APIs (P2 - Medium Priority)**
- **Count:** 6 errors
- **File:** `apps/api/src/modules/groups/repos/LocalStorageGroupRepo.ts`
- **Lines:** 30, 33, 52, 56, 108, 109
- **Error:** `TS2304` - Cannot find name 'window' and 'localStorage'
- **Impact:** Medium - Server-side code incorrectly using browser-only APIs
- **Root Cause:** Repository designed for browser placed in API code
- **Fix Options:**
  1. **Recommended:** Move `LocalStorageGroupRepo.ts` to `apps/web/lib/repos/`
  2. Add conditional checks: `if (typeof window !== 'undefined')`
  3. Remove file if not needed (check for usage first)
- **Action:** Audit usage and relocate to appropriate workspace

**4. JSON File Inclusion (P3 - Low Priority)**
- **Count:** 1 error
- **File:** `apps/api/src/modules/groups/fixtures/index.ts:5`
- **Error:** `TS6307` - `groups.json` not in file list
- **Impact:** Low - Fixtures are test data, not critical for production
- **Fix:** Add `"src/**/*.json"` to `apps/api/tsconfig.json` include pattern
- **Alternative:** Convert `groups.json` to `groups.ts` with typed export

#### Completed Fixes

✅ Created missing `tsconfig.base.json` with proper module resolution
✅ Fixed `apps/api/tsconfig.json` to use `moduleResolution: "bundler"`
✅ Replaced 7 relative imports with `@/lib/db` path alias
✅ Resolved all `@togetheros/types/*` and `@togetheros/validators/*` module errors
✅ Fixed Map/Set iterator errors with `downlevelIteration: true`
✅ Enabled `resolveJsonModule` for JSON imports
✅ Fixed export type syntax in 4 barrel files
✅ Added type assertions for 9 `unknown` data values

#### Files Modified
- `tsconfig.base.json` (new file)
- `apps/api/tsconfig.json`
- `apps/api/src/modules/*/repos/*.ts` (7 files - import path fixes)
- `apps/api/src/services/bridge/*.ts` (2 files - import path + type assertion)
- `apps/api/src/services/socialMediaFetcher.ts` (type assertion)
- `apps/api/src/modules/*/repos/index.ts` (4 files - export type syntax)

#### Next Steps
1. Add `groups.json` to include pattern (quick win)
2. Audit and relocate `LocalStorageGroupRepo.ts`
3. Defer DecisionLoop fixes until module activation
4. Accept lib/db path resolution as known limitation

**Related:**
- Commit: `067fcb0` - fix(build): Resolve TypeScript configuration errors
- PR: [#252](https://github.com/coopeverything/TogetherOS/pull/252) - Bridge authentication integration

---

## Resolved Items

### Bridge User Context - Database Table Fallback (RESOLVED - 2025-11-10)

**Status:** Resolved
**Severity:** Medium (affected user experience)
**Resolved By:** PR [#266](https://github.com/coopeverything/TogetherOS/pull/266), [#267](https://github.com/coopeverything/TogetherOS/pull/267)
**Date Resolved:** 2025-11-10

**Problem:**
Bridge AI assistant was returning mock data ("Portland, Oregon") instead of real user data ("Los Angeles, California") when users were logged in. This occurred because `buildUserContextFromDB()` was failing when querying the `support_points_transactions` table, which doesn't exist yet in the production database.

**Impact:**
- Users saw incorrect location data in Bridge responses
- Personalization features were non-functional
- System fell back to hardcoded mock context

**Root Cause:**
`apps/web/lib/bridge/context-service-db.ts` performed 4 database queries to build user context:
1. Query 1: `users` table (critical) ✅ exists
2. Query 2: `user_interests` table ⚠️ exists but empty
3. Query 3: `support_points_transactions` table ❌ doesn't exist
4. Query 4: `user_activity` table ✅ exists

When Query 3 failed, the entire function threw an error, triggering fallback to mock data in `context-service.ts`.

**Solution:**
Wrapped non-critical queries (2-4) in try-catch blocks:
- Queries that fail now return empty arrays/zeros instead of throwing
- Critical Query 1 (users table) kept unwrapped to fail fast if broken
- Functions now gracefully degrade with partial data

**Code Changes:**
```typescript
// Before (Query 3):
const spResult = await query<{...}>(`SELECT ... FROM support_points_transactions ...`);
const supportPointsAllocated = spResult.rows.map(...);

// After (Query 3):
let supportPointsAllocated: Array<{...}> = [];
try {
  const spResult = await query<{...}>(`SELECT ... FROM support_points_transactions ...`);
  supportPointsAllocated = spResult.rows.map(...);
} catch (err) {
  console.warn('Failed to fetch support points, continuing without them:', err);
}
```

Applied same pattern to:
- Query 2: user_interests (user implicit interests)
- Query 4: user_activity (posts/comments count)
- City context Query 2: user_interests trending topics

**Result:**
✅ Bridge now returns real user data from `users` table
✅ Graceful degradation when optional tables missing
✅ No more fallback to mock context for authenticated users
✅ System works with incomplete database schema (MVP-friendly)

**Testing:**
- Logged in as g.rodafinos@gmail.com (Los Angeles, California)
- Asked Bridge "What is my city?"
- Response: "Los Angeles, California" (correct) ✅
- No errors in production logs

**Files Modified:**
- `apps/web/lib/bridge/context-service-db.ts` (or `lib/bridge/context-service-db.ts`)
  - Added try-catch to 5 database queries
  - Added explicit type annotation for `supportPointsAllocated`

**Lessons Learned:**
1. **Graceful degradation over fail-fast** for non-critical features in MVP
2. **Database schema evolution** requires defensive querying
3. **Type annotations matter** for complex array initializations (TS7034)
4. **Local build issues** (WSL file locking) don't prevent CI deployment

**Related:**
- Commits: `52da737`, `10ea89f`
- Deployment: Run #19246226834 (success)
