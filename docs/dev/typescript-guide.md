# TypeScript Architecture & Patterns Guide

A comprehensive guide to TypeScript configuration, patterns, and anti-patterns used in TogetherOS.

**Document Version:** 2025-11-08
**Status:** Reference guide (auto-loaded in knowledge base)

---

## Quick Reference: Critical Rules

| Rule | Status | Cost of Violation |
|------|--------|-------------------|
| Browser APIs only in `apps/web/` | ❌ NO exceptions | 6+ TypeScript errors |
| Use `export type` for interfaces | ❌ NO exceptions | Build failure |
| `moduleResolution: "bundler"` | ✅ Required | 50+ cascading errors |
| Document accepted errors | ✅ Required | Prevents future mistakes |

---

## Architecture: Client vs Server Code

### The Problem

TogetherOS is a monorepo with both client (Next.js web) and server (Node.js API) code in the same workspace. TypeScript needs clear separation because:

1. **Server code** (`apps/api/`) runs in Node.js
   - Has no `window`, `document`, `localStorage`, `navigator`
   - Uses Node.js APIs: `fs`, `path`, `process`, etc.

2. **Client code** (`apps/web/`) runs in the browser
   - Has access to browser APIs: `window`, `localStorage`, `navigator`
   - Cannot use Node.js filesystem APIs

3. **Shared code** (`packages/*`) must work in both environments
   - No browser APIs, no Node.js APIs
   - Use types and pure functions only

### The Solution: Repository Placement

```
✅ CORRECT LOCATIONS:

apps/web/
├── lib/repos/
│   ├── LocalStorageGroupRepo.ts     ← Browser-only data access
│   ├── InMemoryGroupRepo.ts         ← Could work client-side
│   └── GroupRepo.ts                 ← Interface (shared)
└── app/groups/
    └── page.tsx                     ← Uses LocalStorageGroupRepo

apps/api/
├── src/modules/groups/
│   ├── repos/
│   │   ├── PostgresGroupRepo.ts     ← Server-only (database)
│   │   └── GroupRepo.ts             ← Interface (could be shared)
│   └── entities/
│       └── Group.ts                 ← Pure domain entity

packages/
├── types/src/
│   └── groups.ts                    ← Interfaces only, no implementation
└── validators/src/
    └── groups.ts                    ← Zod schemas, no API calls
```

### Real-World Example: LocalStorageGroupRepo

**The Violation (Before):**
```
apps/api/src/modules/groups/repos/LocalStorageGroupRepo.ts
│
├── Uses localStorage (line 33)      ← Browser API!
├── Uses window (line 30)            ← Browser API!
└── Imported by apps/web/app/groups/page.tsx

❌ TypeScript Error: Cannot find name 'localStorage'
❌ TypeScript Error: Cannot find name 'window'
```

**The Fix (After):**
```
apps/web/lib/repos/LocalStorageGroupRepo.ts
│
├── Uses localStorage (line 33)      ← ✅ Correct location
├── Uses window (line 30)            ← ✅ Correct location
└── Imported by apps/web/app/groups/page.tsx

✅ No TypeScript errors
✅ Clear separation: browser code in browser workspace
```

---

## Type Exports: The `export type` Rule

### Why `export type` Matters

With `isolatedModules: true` in TypeScript, type-only exports must use `export type` syntax.

**This Matters Because:**
- TypeScript completely erases types during compilation (no `.js` at runtime)
- Without `export type`, TypeScript assumes the export creates a value
- If the value doesn't exist at runtime, the code breaks

### The Pattern

```typescript
// ❌ WRONG: Will fail with isolatedModules
export { GroupRepo }

// ✅ CORRECT: Type-only export
export type { GroupRepo }

// ✅ ALSO CORRECT: Mixed exports
export type { GroupRepo, CreateGroupInput }
export { InMemoryGroupRepo, LocalStorageGroupRepo }
```

### When to Use Each

```typescript
// Use `export type` for:
export type { InterfaceName }       // Interfaces
export type { TypeAlias }           // Type aliases
export type { SomeType }            // Generic types

// Use regular `export` for:
export { ConcreteClass }            // Classes
export { functionName }             // Functions
export { CONSTANT }                 // Constants
```

### Real-World Example from Codebase

```typescript
// apps/api/src/modules/groups/repos/index.ts
// ✅ CORRECT: Type exports use `export type`
export type { GroupRepo, CreateGroupInput, UpdateGroupInput }
export { InMemoryGroupRepo, PostgresGroupRepo }
```

---

## Module Resolution: Configuration Matters

### The Requirement

Every TypeScript workspace must use `moduleResolution: "bundler"` for Next.js compatibility.

```json
// ✅ CORRECT: tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "resolveJsonModule": true,
    "downlevelIteration": true
  }
}
```

### Why Not "node16"?

```
moduleResolution: "node16"
├── Doesn't understand path aliases properly
├── Causes 50+ cascading TypeScript errors
├── Incompatible with Next.js build process
└── ❌ NEVER use in this project
```

### Configuration Checklist

Every `tsconfig.json` must include:

- [ ] `moduleResolution: "bundler"`
- [ ] `isolatedModules: true`
- [ ] `resolveJsonModule: true` (if importing JSON files)
- [ ] `downlevelIteration: true` (for Map/Set support)

---

## Path Aliases: The `/lib/db` Limitation

### The Current State

The path alias `@/lib/db` in `apps/api/` is a known limitation:

```typescript
// apps/api/src/modules/groups/repos/PostgresGroupRepo.ts
import { db } from '@/lib/db'  // ← References files outside rootDir

// TypeScript Error (Accepted):
// TS6059: File is not under 'rootDir'
// TS6307: File not listed within file list
```

### Why It's Accepted

| Aspect | Status |
|--------|--------|
| **Runtime behavior** | ✅ Works correctly |
| **Development** | ✅ IDE resolves properly |
| **Build** | ✅ Next.js builds successfully |
| **TypeScript check** | ❌ tsc reports errors |

**Conclusion:** The errors are purely type-checking artifacts. The code runs fine.

### The Long-Term Solution

Create a proper `@togetheros/db` package:

```typescript
// Future: packages/db/src/index.ts
export { db } from './connection'
export { query } from './query'

// Then in apps/api:
import { db } from '@togetheros/db'  // ← Proper package import
```

### For Now: Accept the Errors

Document in `docs/dev/tech-debt.md`:
```markdown
### Accepted TypeScript Errors

**lib/db Path Resolution (2 errors)**
- Files: All PostgreSQL repos in apps/api/
- Status: ACCEPTED - Runtime works, only TypeScript error
- Future Fix: Create @togetheros/db package
- Action: None required
```

---

## Common Error Patterns & Solutions

### Pattern 1: Browser API in Server Code

```
❌ Error: Cannot find name 'window'
❌ Error: Cannot find name 'localStorage'
❌ Error: Cannot find name 'document'
```

**Diagnosis:**
1. Check file location - is it in `apps/api/`?
2. Look for browser API usage: localStorage, window, document, navigator
3. This file should be in `apps/web/lib/`

**Solution:**
```bash
# Move the file
mv apps/api/src/modules/X/repos/LocalStorageRepo.ts \
   apps/web/lib/repos/LocalStorageRepo.ts

# Update imports in web components
# Before: import { ... } from '../../../api/...'
# After:  import { ... } from '@/lib/repos/...'
```

### Pattern 2: Type Export With isolatedModules

```
❌ Error: Cannot use namespace as a type
❌ Error: Individual declarations in merged declaration types
```

**Diagnosis:**
1. Check the export statement - is it `export { Type }`?
2. Is the export a type-only construct (interface, type alias)?
3. This file has `isolatedModules: true` in tsconfig

**Solution:**
```typescript
// Before
export { GroupRepo, UserRepo }

// After
export type { GroupRepo, UserRepo }
```

### Pattern 3: Incorrect Type Assertion

```
❌ Error: Type 'string | boolean | Date' is not assignable to type 'boolean'
```

**Diagnosis:**
1. Function returns union type that includes non-boolean values
2. Code assumes only boolean, but TypeScript sees union
3. Function parameter type needs refinement

**Solution:**
```typescript
// Before (incorrect signature)
private checkConsent(actionType: string, flags: typeof import('@togetheros/types').ConsentFlags.prototype)

// After (correct imports + assertion)
import type { ConsentFlags } from '@togetheros/types'

private checkConsent(actionType: string, flags: ConsentFlags): boolean {
  const requiredFlag = consentMap[actionType]
  return requiredFlag ? (flags[requiredFlag] as boolean) : false
}
```

### Pattern 4: Path Mapping Broken Across Workspaces

```
❌ Error: Cannot find module '@/lib/repos/LocalStorageGroupRepo'
```

**Diagnosis:**
1. File exists but TypeScript can't find it
2. Path mapping points to wrong location in tsconfig
3. Different workspaces have different path mappings

**Solution:**
```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/lib/*": ["./lib/*"]     // ← Relative to apps/web/
    }
  }
}

// apps/api/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/lib/*": ["../../lib/*"]  // ← Relative to /lib outside apps/
    }
  }
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Mix Server and Client Code in Same File

```typescript
// ❌ BAD: This file tries to do everything
export class GroupRepository {
  // Server method
  async save(group: Group) {
    return db.query(...)
  }

  // Client method
  async sync() {
    localStorage.setItem(...)  // ← Browser API in server file!
  }
}
```

**Why:** TypeScript can't be imported by server-only or client-only code without errors.

**Instead:** Create separate implementations
```typescript
// apps/api/src/modules/groups/repos/PostgresGroupRepo.ts
export class PostgresGroupRepo implements GroupRepo { ... }

// apps/web/lib/repos/LocalStorageGroupRepo.ts
export class LocalStorageGroupRepo implements GroupRepo { ... }

// packages/types/src/groups.ts
export type { GroupRepo }  // Shared interface
```

### ❌ Don't: Use `export` for Type-Only Exports

```typescript
// ❌ FAILS with isolatedModules: true
export { UserRole, AdminRole }  // These are types!

// ✅ CORRECT
export type { UserRole, AdminRole }
```

### ❌ Don't: Change moduleResolution to "node16"

```json
// ❌ WRONG - Causes massive failures
{
  "compilerOptions": {
    "moduleResolution": "node16"
  }
}

// ✅ CORRECT
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### ❌ Don't: Try to "Fix" Path Resolution Errors

```typescript
// ❌ WRONG: Don't change rootDir to include /lib
{
  "compilerOptions": {
    "rootDir": "../../lib"  // No! This breaks everything
  }
}

// ✅ CORRECT: Accept the error OR create a package
{
  "compilerOptions": {
    "rootDir": "src"
  }
}
// Document in tech-debt.md as accepted limitation
```

### ❌ Don't: Ignore TypeScript Errors Without Documentation

```markdown
// ❌ BAD: Errors left undocumented
// Just some random errors we'll ignore

// ✅ GOOD: Errors documented with rationale
/**
 * Accepted TypeScript Errors:
 *
 * TS6059: File is not under 'rootDir'
 * - Reason: Path alias @/lib/db references files outside rootDir
 * - Impact: None (works at runtime with Next.js)
 * - Fix: Create @togetheros/db package (future refactoring)
 * - Status: ACCEPTED
 */
```

---

## Debugging TypeScript Errors

### Step 1: Read the Error Message Carefully

```
error TS2304: Cannot find name 'localStorage'
  at apps/api/src/modules/groups/repos/LocalStorageGroupRepo.ts:33
```

**Extract:**
- Error type: `TS2304` (Cannot find name)
- Symbol: `localStorage`
- Location: specific file and line

### Step 2: Determine Root Cause

```
1. Is this a browser API?
   ✅ localStorage, window, document, navigator, fetch, etc.
   → Root cause: File is in apps/api but uses browser API

2. Is this a type import issue?
   ✅ Type-only symbol exported without `export type`
   → Root cause: Missing `export type` syntax

3. Is this a path mapping issue?
   ✅ Module not found with @ alias
   → Root cause: tsconfig.json path mapping wrong

4. Is this a missing import?
   ✅ Cannot find module '@togetheros/types'
   → Root cause: Missing or wrong import statement
```

### Step 3: Apply the Right Fix

```
Browser API error
├── Check file location
├── If in apps/api → Move to apps/web/lib/
├── Update imports
└── Verify build

Type export error
├── Find the export statement
├── Change to `export type { ... }`
└── Verify build

Path mapping error
├── Check tsconfig.json paths
├── Verify path matches workspace structure
├── Clear node_modules/.tsconfig.json cache
└── Verify build
```

---

## Real Session: 2025-11-08 Error Reduction

### Summary

**Starting Point:** 15 TypeScript errors (down from 100+)
**Ending Point:** 2 accepted limitations
**Time:** Single session
**Key Insight:** Architecture violations cause cascading errors

### What Was Done

1. **LocalStorageGroupRepo Migration** (6 errors fixed)
   - Identified: Browser APIs in server workspace
   - Solution: Moved to apps/web/lib/repos/
   - Impact: Clean architecture, 6 errors gone

2. **DecisionLoop Type Fixes** (7 errors fixed)
   - Identified: Incorrect type imports and function signatures
   - Solution: Added proper type imports, fixed function signatures
   - Impact: All experimental module errors resolved

3. **Path Mapping Fix** (import resolution)
   - Identified: @/lib/* mapping wrong in apps/web/tsconfig.json
   - Solution: Changed from `../../lib/*` to `./lib/*`
   - Impact: Web app can now find new repos

4. **Documentation** (2 errors accepted)
   - Identified: lib/db path alias limitation is TypeScript artifact
   - Solution: Documented as accepted, no functional impact
   - Impact: Clear record why errors remain

### Lessons Learned

1. **Architecture comes first, types second**
   - Fixing file location > fixing type annotations
   - Bad architecture = cascading errors

2. **Browser APIs are the quickest diagnosis**
   - Look for: localStorage, window, document, navigator
   - Location tells you the solution immediately

3. **Path mappings vary by workspace**
   - apps/api: `"@/lib/*": ["../../lib/*"]`
   - apps/web: `"@/lib/*": ["./lib/*"]`
   - Don't assume they're the same!

4. **Document accepted errors clearly**
   - Prevents future developers from trying to fix them
   - Explains why 2 errors remain (and that's OK)

---

## Key Takeaways for Future Work

### Before Making Changes

1. ✅ Check if code uses browser APIs → belongs in `apps/web/`
2. ✅ Check if code uses Node.js APIs → belongs in `apps/api/`
3. ✅ Check if code is type-only → use `export type`
4. ✅ Check configuration → must use `"bundler"` module resolution

### When Fixing Errors

1. ✅ Read the error location (which workspace?)
2. ✅ Diagnose root cause (architecture vs config vs types)
3. ✅ Apply architectural fix first (move files)
4. ✅ Then fix type/import issues
5. ✅ Document any accepted limitations

### When Reviewing PRs

1. ✅ Watch for browser APIs in apps/api/
2. ✅ Watch for regular `export` on type-only symbols
3. ✅ Verify path mappings are workspace-appropriate
4. ✅ Ensure TypeScript errors are explained in tech-debt.md

---

## Quick Links

- **Knowledge Base:** [TypeScript Architecture & Patterns](./../.claude/knowledge/togetheros-kb.md#typescript-architecture--patterns)
- **Tech Debt Tracking:** [docs/dev/tech-debt.md](./tech-debt.md)
- **Configuration Reference:** [TypeScript Handbook](https://www.typescriptlang.org/tsconfig)
- **Next.js TypeScript:** [Next.js TS Config](https://nextjs.org/docs/basic-features/typescript)
