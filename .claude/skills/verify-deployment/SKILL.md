---
name: verify-deployment
description: Run E2E verification tests against production after deployment. Called by yolo1 before claiming delivery.
---

# Verify Deployment

Runs Playwright E2E tests against production to verify deployment actually works.

## When Called

Invoked automatically by `yolo1` after deployment succeeds, before claiming delivery.

## Execution

```bash
# 1. Run verification script
./scripts/verify-fix.sh

# 2. Interpret results
# - Exit 0 = PASS → yolo1 can claim delivery
# - Exit 1 = FAIL → yolo1 must NOT claim delivery
```

## On Failure

If verification fails:
1. Report which tests failed
2. Analyze failure cause
3. Fix the issue
4. Re-deploy
5. Re-run verification
6. Only proceed when PASS

## Test Coverage

Tests are mapped by module (see `scripts/verify-fix.sh`):
- `feed` → `verify-feed.spec.ts`
- `governance` → `verify-governance.spec.ts`
- `auth` → `verify-auth.spec.ts`
- `forum` → `verify-forum.spec.ts`
- `timebank` → `verify-timebank.spec.ts`
- `groups` → `verify-groups.spec.ts`
