# verify-fix Skill

## Purpose

**MANDATORY skill to run after claiming any fix is complete.**

This skill verifies that code changes actually work end-to-end before claiming "fix deployed" or "feature complete". It prevents the pattern of:
1. Make change
2. Run unit tests (pass)
3. Deploy
4. Claim "fixed!"
5. User tests → doesn't work
6. Find real issue, repeat

## When to Use

**ALWAYS run this skill:**
- After deploying any bug fix
- After deploying any new feature
- Before telling the user "it's fixed" or "it's done"

**DO NOT claim a fix is complete until this skill passes.**

## How It Works

1. **Analyze changes**: Determine what modules/features were affected
2. **Select tests**: Map changes to relevant E2E verification tests
3. **Run tests**: Execute Playwright tests against production
4. **Report results**: Only claim "fixed" if tests pass

## Invocation

After deploying, run:

```bash
# 1. Identify affected modules from recent commits
git diff HEAD~3 --name-only | grep -E "^(apps|packages)" | cut -d'/' -f3 | sort -u

# 2. Run verification tests for affected modules
BASE_URL=https://coopeverything.org npx playwright test tests/e2e/verify/ --grep "<module>"

# 3. If tests pass, THEN claim fix is complete
# 4. If tests fail, fix the issue and repeat
```

## Module Test Mapping

| Files Changed | Run Tests |
|--------------|-----------|
| `*/feed/*` | `verify-feed.spec.ts` |
| `*/governance/*` | `verify-governance.spec.ts` |
| `*/groups/*` | `verify-groups.spec.ts` |
| `*/auth/*`, `*/login/*`, `*/signup/*` | `verify-auth.spec.ts` |
| `*/timebank/*` | `verify-timebank.spec.ts` |
| `*/forum/*` | `verify-forum.spec.ts` |
| Any UI component | `verify-ui.spec.ts` |

## Test Requirements

Each verification test must:
1. **Authenticate** as a test user (if feature requires auth)
2. **Execute the user flow** that was fixed/added
3. **Verify the outcome** (UI shows correctly, data saved to DB)
4. **Clean up** test data if created

## Example Workflow

```
Claude: "I fixed the feed image upload bug"
Claude: *runs verify-fix skill*

$ git diff HEAD~1 --name-only
packages/ui/src/feed/PostComposerUnified.tsx

$ BASE_URL=https://coopeverything.org npx playwright test tests/e2e/verify/verify-feed.spec.ts

Running 3 tests...
✓ feed image upload saves to database (2.3s)
✓ feed images display in post card (1.8s)
✓ feed post creation with images (3.1s)

All tests passed.

Claude: "Fix verified. Image upload now works correctly."
```

## Failure Protocol

If verification tests fail:
1. **DO NOT claim the fix is complete**
2. Analyze the failure (screenshot, error message)
3. Identify the actual issue
4. Fix and redeploy
5. Run verification again
6. Only claim complete when tests pass

## Creating New Verification Tests

When adding a new feature or fixing a bug in a module that doesn't have verification tests:

1. Create `tests/e2e/verify/verify-{module}.spec.ts`
2. Add tests that exercise the actual user flow
3. Include database verification where applicable
4. Add to the module mapping table above
