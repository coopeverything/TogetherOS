# TypeScript Verification Workflow (Mandatory)

**Version**: TypeScript 5.9.3
**Last Updated**: 2025-11-08
**Purpose**: Prevent TypeScript errors through verification-first workflow

---

## Root Cause Analysis

**Why errors keep happening**:
1. ❌ **Assumption-based coding** - Writing code based on training data patterns, not actual codebase
2. ❌ **Skip verification** - Not checking if types/imports actually exist before using them
3. ❌ **Ignore workspace boundaries** - Forgetting server (apps/api) vs client (apps/web) separation
4. ❌ **Guess data shapes** - Assuming SQL column names or API response shapes without verification
5. ❌ **Outdated patterns** - Using pre-TS 5.0 export syntax (`export {Interface}` vs `export type {Interface}`)

**NOT a knowledge gap** - TypeScript 5.9.3 documentation is accessible, the issue is **not consulting it before writing code**.

---

## MANDATORY Pre-Flight Checklist

**BEFORE writing ANY TypeScript code, complete ALL steps below:**

### Step 1: Understand the Workspace Boundary (30 seconds)

```bash
# Question: Where am I writing code?
pwd

# If path contains "apps/api" → SERVER-ONLY CODE
#   ❌ NO browser APIs (window, localStorage, document, navigator)
#   ✅ CAN use Node.js APIs (fs, process, Buffer)

# If path contains "apps/web" → CLIENT OR SERVER CODE
#   ✅ CAN use browser APIs in /lib, /components
#   ❌ NO browser APIs in /app (Next.js server components by default)
```

**Decision**: Write down which workspace you're in before proceeding.

---

### Step 2: Verify Actual Data Shapes (60 seconds)

**For database queries**:
```bash
# BEFORE writing the TypeScript interface, test the actual SQL query

# Example: Check what columns a query actually returns
ssh root@72.60.27.167 "sudo -u postgres psql -d togetheros -c '
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = \"user_activity\"
ORDER BY ordinal_position;
'"

# Then write the interface matching ACTUAL column names
```

**For API responses**:
```bash
# BEFORE assuming response shape, check actual API response
curl -s https://api.example.com/endpoint | jq '.'

# Then write interface matching ACTUAL response structure
```

**For existing code**:
```bash
# BEFORE assuming a function signature, READ the actual code
cat path/to/file.ts | grep -A 10 "function functionName"
```

---

### Step 3: Verify Type Availability (30 seconds)

**Before using a type**:
```bash
# Check if type is exported from the module you think it's in
grep "export.*TypeName" packages/types/src/*.ts

# Check if type needs to be imported
grep "import.*TypeName" apps/web/**/*.ts
```

**Before importing**:
```bash
# Verify the import path actually exists
ls -la path/to/module.ts

# Check what's actually exported
grep "^export" path/to/module.ts
```

**CRITICAL: Verify path alias mapping** (prevents import resolution failures):
```bash
# If using path alias like @/lib/*, verify it maps to correct location

# Example: Importing from '@/lib/repos/Foo'
# 1. Check where the file actually is
ls -la apps/web/lib/repos/Foo.ts

# 2. Check what @/lib/* maps to in tsconfig.json
grep -A2 '"@/lib' apps/web/tsconfig.json
# Output: "@/lib/*": ["../../lib/*"]  ← Maps to ROOT lib/, not apps/web/lib/

# 3. If mismatch, use correct import path:
#    - ✅ Relative: '../lib/repos/Foo'
#    - ✅ Absolute workspace: 'apps/web/lib/repos/Foo'
#    - ❌ Wrong alias: '@/lib/repos/Foo' (resolves to wrong location)
```

---

### Step 4: Check TypeScript 5.9 Requirements (15 seconds)

**For exports** (isolatedModules: true requirement):
```typescript
// ❌ WRONG (pre-TS 5.0 pattern)
export { InterfaceName }

// ✅ CORRECT (TS 5.0+ with isolatedModules)
export type { InterfaceName }
```

**For module resolution** (moduleResolution: bundler):
```json
// tsconfig.json MUST have:
{
  "compilerOptions": {
    "module": "esnext",              // NOT "commonjs"
    "moduleResolution": "bundler",   // NOT "node" or "node16"
    "isolatedModules": true,         // Required for Next.js
    "verbatimModuleSyntax": true     // TS 5.9 recommended
  }
}
```

**Documentation reference**:
- TS 5.9 Release Notes: https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/
- Module Resolution: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html

---

### Step 5: Read Similar Existing Code (60 seconds)

**Before writing a new database repo**:
```bash
# Find and read an existing repo implementation
find . -name "*Repo.ts" -type f | grep -v node_modules | head -1 | xargs cat
```

**Before writing a new API route**:
```bash
# Find and read an existing route
find apps/web/app/api -name "route.ts" | head -1 | xargs cat
```

**Pattern matching rule**: If similar code exists, COPY the pattern exactly, then modify minimally.

---

## MANDATORY Post-Write Verification

**AFTER writing TypeScript code, run ALL checks below:**

### Check 1: Type Check (REQUIRED)
```bash
npx tsc --noEmit

# MUST output nothing (success)
# If errors appear, fix ALL before committing
```

### Check 2: Verify Imports Resolve (REQUIRED)
```bash
# For each import you added, verify file exists
ls -la path/from/import/statement.ts

# Example: import { Foo } from '@/lib/bar'
# → Check: ls -la apps/web/lib/bar.ts
```

### Check 3: Check for Implicit 'any' (REQUIRED)
```bash
npx tsc --noEmit --noImplicitAny 2>&1 | grep "implicitly has an 'any' type"

# MUST output nothing
# If matches found, add explicit types
```

### Check 4: Validate Against Current Docs (RECOMMENDED)
```bash
# If using new TS feature, verify against official docs
# Search: "TypeScript 5.9 [feature name]"
```

---

## Common Mistake Prevention

### Mistake 1: Assuming SQL Column Names
**WRONG**:
```typescript
const result = await query<{ action_count: number }>(
  `SELECT COUNT(*) as post_count FROM ...`
);
const count = result.rows[0].action_count; // ❌ UNDEFINED!
```

**CORRECT**:
```typescript
// 1. Test query first: sudo -u postgres psql -d db -c "SELECT ..."
// 2. See actual column names in output
// 3. Match interface to ACTUAL columns
const result = await query<{ post_count: number }>(
  `SELECT COUNT(*) as post_count FROM ...`
);
const count = result.rows[0].post_count; // ✅ WORKS
```

---

### Mistake 2: Browser APIs in Server Code
**WRONG**:
```typescript
// File: apps/api/src/repos/StorageRepo.ts
class StorageRepo {
  save() {
    localStorage.setItem('key', 'value'); // ❌ Server has no localStorage!
  }
}
```

**CORRECT**:
```typescript
// File: apps/web/lib/repos/LocalStorageRepo.ts
// Note: Moved to apps/web (client workspace)
class LocalStorageRepo {
  save() {
    if (typeof window !== 'undefined') { // ✅ Runtime check
      localStorage.setItem('key', 'value');
    }
  }
}
```

---

### Mistake 3: Missing Type Imports
**WRONG**:
```typescript
// Using ConsentFlags without importing
function check(flags: ConsentFlags) { // ❌ Cannot find name 'ConsentFlags'
  return flags.analytics;
}
```

**CORRECT**:
```typescript
// 1. First verify type exists: grep "export.*ConsentFlags" packages/types/src/*.ts
// 2. Then import it
import type { ConsentFlags } from '@togetheros/types';

function check(flags: ConsentFlags) { // ✅ Type resolved
  return flags.analytics;
}
```

---

### Mistake 4: Wrong Export Syntax
**WRONG**:
```typescript
// File: types.ts
interface User { ... }
export { User }; // ❌ Fails with isolatedModules: true
```

**CORRECT**:
```typescript
// File: types.ts
interface User { ... }
export type { User }; // ✅ Correct for TS 5.0+
```

---

### Mistake 5: Wrong Path Alias Resolution
**WRONG**:
```typescript
// File: apps/web/app/groups/page.tsx
// Trying to import from apps/web/lib/repos/LocalStorageGroupRepo.ts
import { LocalStorageGroupRepo } from '@/lib/repos/LocalStorageGroupRepo'
// ❌ FAILS: @/lib/* maps to ../../lib/* (root lib/), not ./lib/* (apps/web/lib/)
```

**CORRECT**:
```typescript
// Option 1: Check tsconfig path mapping first
// grep '"@/lib' apps/web/tsconfig.json
// → "@/lib/*": ["../../lib/*"]  ← Points to ROOT lib/, not apps/web/lib/

// Option 2: Use relative import (ALWAYS WORKS)
import { LocalStorageGroupRepo } from '../../lib/repos/LocalStorageGroupRepo'
// ✅ WORKS: Relative path, no alias confusion

// Option 3: If file should be in root lib/, MOVE IT
// mv apps/web/lib/repos/Foo.ts lib/repos/Foo.ts
// Then @/lib/repos/Foo works correctly
```

**Prevention**:
- Always verify path alias mapping in tsconfig.json BEFORE using aliases
- When in doubt, use relative imports (./../../) - they always work
- Test import: Run `npx tsc --noEmit` after adding import

---

## Integration with PR Workflow

**Add to PR body** (REQUIRED for TypeScript changes):
```
TYPECHECK=OK (npx tsc --noEmit passed)
```

**CI will verify**:
- `tsc --build` passes (deployment gate)
- No implicit 'any' types
- All imports resolve

---

## When to Accept Errors as Structural Limitations

**Not all TypeScript errors can be fixed with configuration changes.**

### Composite Project Constraints (Known Limitation)

**Example: lib/db cross-workspace imports**

**Symptom:**
```
error TS6059: File 'lib/db/index.ts' is not under 'rootDir' 'apps/api/src'
error: File 'lib/db/index.ts' is not listed within file list of project 'apps/api/tsconfig.json'
```

**Why it cannot be fixed:**
1. apps/api imports from lib/db (outside rootDir)
2. apps/api MUST be composite (apps/web references it)
3. Composite projects CANNOT include files outside rootDir
4. This is TypeScript's design for project references

**Attempted fixes (all fail):**
- ❌ Add ../../lib/**/* to includes → TS6059 violations persist
- ❌ Remove rootDir setting → TS infers workspace root anyway
- ❌ Set composite: false → TS6306 (referenced project must be composite)

**Runtime behavior:**
- ✅ Code works correctly (path aliases resolve at runtime)
- ✅ `tsc --noEmit` passes (local type checking)
- ❌ `tsc --build` fails (CI composite build mode)

**When to accept:**
1. Multiple fix attempts failed with different errors
2. Errors are due to TypeScript design constraints (not bugs)
3. Runtime behavior is correct
4. Alternative would require major refactoring (e.g., creating packages)

**Documentation required:**
- Update `.claude/knowledge/togetheros-kb.md` with session notes
- Explain root cause and why unfixable
- Document runtime behavior (does it work?)
- Note future fix if applicable (e.g., create @togetheros/lib package)
- Add to "Accepted Limitations" section

**Deployment strategy:**
- Use `workflow_dispatch` with `force: true` to bypass preflight
- OR fix by creating proper package structure (long-term solution)

**Reference:** See togetheros-kb.md → TypeScript Architecture → Evening Session

---

## Quick Reference Card

**Copy this to every session:**

```
BEFORE writing TypeScript:
☐ Check workspace (server vs client)
☐ Verify data shape (test SQL, check API response)
☐ Verify type exists (grep for export)
☐ Verify path alias mapping (check tsconfig.json)
☐ Read similar existing code
☐ Check TS 5.9 syntax requirements

AFTER writing TypeScript:
☐ Run: npx tsc --noEmit
☐ Verify all imports resolve
☐ Check for implicit 'any'
☐ Add TYPECHECK=OK to PR
```

---

## Documentation URLs (Check These First)

**TypeScript 5.9 Core**:
- Release Notes: https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

**Module Resolution**:
- Choosing Options: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
- Bundler Mode: https://www.typescriptlang.org/docs/handbook/modules/reference.html#bundler

**Strict Mode**:
- Compiler Options: https://www.typescriptlang.org/tsconfig

**When in doubt**: Search "TypeScript 5.9 [topic]" and read official docs BEFORE writing code.

---

## Enforcement

**This workflow is MANDATORY for all TypeScript code.**

Violations will result in:
- ❌ Build failures in CI
- ❌ Deployment blocks
- ❌ Wasted time fixing preventable errors
- ❌ Lost user trust in code quality

**The goal**: Write TypeScript correctly the FIRST time by verifying BEFORE coding, not fixing AFTER failing.
