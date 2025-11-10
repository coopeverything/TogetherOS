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

### TypeScript Build Errors - 14 Remaining (2025-11-07)

**Status:** In Progress
**Severity:** Low (non-blocking for deployment)
**Branch:** `feature/build-typescript-fixes`
**Progress:** Reduced from 100+ errors to 14 (86% improvement)

**Context:**
Deployment failures were caused by missing `tsconfig.base.json` and incorrect module resolution settings. Major fixes completed, 14 low-priority errors remain.

#### Error Categories

**1. lib/db Path Resolution (SUPPRESSED - 2025-11-10)**
- **Status:** Temporarily suppressed with `@ts-ignore` comments
- **Count:** 2 TypeScript errors (TS6059, TS6307) affecting 8 files
- **Files affected:**
  - `apps/api/src/modules/bridge-behavioral/repos/PostgresMemoryRepo.ts:17`
  - `apps/api/src/modules/bridge-behavioral/repos/PostgresQuestionnaireRepo.ts:12`
  - `apps/api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo.ts:11`
  - `apps/api/src/modules/bridge-training/repos/PostgresBridgeTrainingRepo.ts:14`
  - `apps/api/src/modules/groups/repos/PostgresGroupRepo.ts:12`
  - `apps/api/src/modules/feed/repos/PostgresPostRepo.ts:7`
  - `apps/api/src/services/bridge/OnboardingService.ts:6`
  - `apps/api/src/services/bridge/SimilarityDetector.ts:6`
- **Errors:**
  - `TS6059` - `/lib/db/index.ts` not under rootDir `/apps/api/src`
  - `TS6307` - `/lib/db/index.ts` not listed in project file list
- **Root cause:** TypeScript composite project constraints prevent including files outside rootDir
  - apps/api MUST be composite (apps/web references it)
  - Composite projects CANNOT include files outside rootDir
  - This is by design for TypeScript project references system
- **Runtime behavior:** ✅ Works correctly (path aliases resolve at runtime)
- **Compile-time:** ❌ Fails with `tsc --build` (CI composite mode)

**Suppression Format:**
```typescript
// @ts-ignore - TS6059/TS6307: lib/db path alias outside apps/api rootDir (CI only)
// Runtime works correctly. Proper fix: Create @togetheros/db package (see docs/dev/tech-debt.md)
import { query } from '@/lib/db';
```

**Note:** Using `@ts-ignore` instead of `@ts-expect-error` because errors only appear in CI's `tsc --build` (composite mode), not in local `npx tsc --noEmit`. `@ts-expect-error` would fail locally when no error is present.

**Proper Fix:** Create `@togetheros/db` package
- Move `lib/db/*` → `packages/db/src/`
- Update ~50 import statements across apps/api and apps/web
- Add package to tsconfig references
- **Effort:** 3-4 hours
- **Priority:** Medium (do during next database refactor)
- **Confidence:** 70-75% (needs iteration on feature branch)

**Testing Strategy When Ready:**
1. Implement on feature branch (`yolo-db-refactor`)
2. Deploy to production via manual trigger:
   ```bash
   gh workflow run auto-deploy-production.yml --ref yolo-db-refactor
   ```
3. Monitor auto-rollback (2-3 min recovery if issues)
4. Iterate until working, then merge to yolo

**Reference:**
- Session notes: `.claude/knowledge/togetheros-kb.md` → TypeScript Architecture → Evening Session
- Verification workflow: `.claude/workflows/typescript-verification.md` → When to Accept Errors

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

_No resolved items yet._
