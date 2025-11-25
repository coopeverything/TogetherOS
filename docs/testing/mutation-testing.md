# Mutation Testing Guide

**Status:** Phase 2.2 Complete (Observability Module)
**Library:** [Stryker Mutator](https://stryker-mutator.io/) v9.3+

## Overview

Mutation testing is a technique that evaluates the **quality** of your tests by introducing small changes (mutations) to your code and checking if your tests catch them. If a test suite passes with a mutation, it means your tests may not be effective enough.

**Traditional Code Coverage:**
```typescript
function isPositive(n: number): boolean {
  return n > 0
}

it('should work for positive numbers', () => {
  expect(isPositive(5)).toBe(true)
})
// ✅ 100% code coverage - but incomplete testing!
```

**Mutation Testing:**
```typescript
// Mutation 1: Change > to >=
function isPositive(n: number): boolean {
  return n >= 0  // Mutated
}

it('should work for positive numbers', () => {
  expect(isPositive(5)).toBe(true)  // ✅ Still passes!
})
// ❌ Mutation survived - test doesn't catch edge case (zero)

// Better test:
it('should return false for zero', () => {
  expect(isPositive(0)).toBe(false)  // ✅ Kills the mutation
})
```

## Why Mutation Testing?

### Benefits

1. **Validates Test Quality** - High coverage doesn't mean effective tests
2. **Finds Missing Edge Cases** - Discovers gaps in test scenarios
3. **Prevents False Confidence** - Exposes weak assertions
4. **Regression Detection** - Ensures tests actually verify behavior
5. **Documentation** - Survived mutations highlight risk areas

### When to Use

✅ **Good fit:**
- Critical business logic (validators, calculations)
- Security-sensitive code (auth, permissions)
- Complex algorithms with edge cases
- Stable, well-tested codebases

❌ **Not ideal for:**
- UI components (too many trivial mutations)
- Rapid prototyping phase
- Integration test suites (too slow)
- Generated code or type definitions

## Setup

Mutation testing is already configured in TogetherOS:

```json
// package.json
{
  "devDependencies": {
    "@stryker-mutator/core": "^9.3.0",
    "@stryker-mutator/vitest-runner": "^9.3.0"
  },
  "scripts": {
    "test:mutation": "stryker run"
  }
}
```

```json
// stryker.conf.json
{
  "testRunner": "vitest",
  "mutate": [
    "packages/validators/src/**/*.ts"
  ],
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```

## Running Mutation Tests

### Basic Commands

```bash
# Run mutation testing on all configured files
npm run test:mutation

# Run on specific file
npx stryker run --mutate "packages/validators/src/governance.ts"

# Dry run (show what would be mutated)
npx stryker run --dryRun

# Generate HTML report
npx stryker run --reporters html,json
```

### Reading Results

```bash
$ npm run test:mutation

Mutant testing finished! Results:
  Killed:   45 / 50 (90.00%)
  Survived: 5  / 50 (10.00%)
  Timeout:  0  / 50 (0.00%)
  No coverage: 0  / 50 (0.00%)

Mutation score: 90.00%
```

**Mutation States:**

- **Killed** ✅ - Test caught the mutation (good!)
- **Survived** ❌ - Mutation passed tests (test gap!)
- **Timeout** ⏱️  - Test took too long (infinite loop, etc.)
- **No Coverage** 📊 - Code not executed by tests

## Mutation Types

Stryker introduces these types of mutations:

### 1. Arithmetic Operators

```typescript
// Original
function add(a: number, b: number) {
  return a + b
}

// Mutations
return a - b  // Subtraction
return a * b  // Multiplication
return a / b  // Division
```

### 2. Comparison Operators

```typescript
// Original
function isValid(age: number) {
  return age >= 18
}

// Mutations
return age > 18   // Greater than
return age <= 18  // Less than or equal
return age < 18   // Less than
return age == 18  // Equal
```

### 3. Logical Operators

```typescript
// Original
function canVote(age: number, registered: boolean) {
  return age >= 18 && registered
}

// Mutations
return age >= 18 || registered  // OR instead of AND
return age >= 18                // Remove second condition
return registered               // Remove first condition
```

### 4. Boolean Literals

```typescript
// Original
function isEnabled() {
  return true
}

// Mutation
return false  // Flip boolean
```

### 5. String Literals

```typescript
// Original
function getMessage() {
  return "Hello"
}

// Mutation
return ""  // Empty string
```

### 6. Conditional Boundaries

```typescript
// Original
for (let i = 0; i < 10; i++) {
  // ...
}

// Mutations
for (let i = 0; i <= 10; i++)   // Include boundary
for (let i = 1; i < 10; i++)    // Change start
```

## Interpreting Mutation Scores

### Target Thresholds

- **90-100%** 🟢 Excellent - Comprehensive test coverage
- **80-89%** 🟡 Good - Minor gaps acceptable
- **60-79%** 🟠 Fair - Needs improvement
- **<60%** 🔴 Poor - Significant test gaps

### TogetherOS Targets

```json
{
  "thresholds": {
    "high": 80,    // Goal for critical modules
    "low": 60,     // Minimum acceptable
    "break": 50    // CI fails below this
  }
}
```

### When Survived Mutations Are OK

Some mutations are acceptable to survive:

1. **Equivalent Mutations** - Semantically identical code
2. **Logging/Debugging** - Non-functional code
3. **Performance Optimizations** - Behavior unchanged
4. **Error Messages** - Exact wording not critical

```typescript
// Example: Equivalent mutation
function isEven(n: number) {
  return n % 2 === 0
  // vs
  return n % 2 == 0  // Mutation survives (both work)
}
```

## Improving Mutation Score

### 1. Add Boundary Tests

```typescript
// Original test
it('should validate age', () => {
  expect(isAdult(25)).toBe(true)
})

// Add boundary tests
it('should accept exact boundary (18)', () => {
  expect(isAdult(18)).toBe(true)  // Kills >= to > mutation
})

it('should reject below boundary (17)', () => {
  expect(isAdult(17)).toBe(false)  // Kills >= to <= mutation
})
```

### 2. Test Negative Cases

```typescript
// Original test (only happy path)
it('should return valid result', () => {
  expect(validator('valid input')).toBe(true)
})

// Add negative case
it('should reject invalid input', () => {
  expect(validator('invalid')).toBe(false)  // Kills boolean flip
})
```

### 3. Test Logical Combinations

```typescript
// Original test (partial logic)
it('should require age AND registration', () => {
  expect(canVote(20, true)).toBe(true)
})

// Add combination tests
it('should reject if age valid but not registered', () => {
  expect(canVote(20, false)).toBe(false)  // Kills && to || mutation
})

it('should reject if registered but age invalid', () => {
  expect(canVote(16, true)).toBe(false)
})
```

### 4. Verify Edge Cases

```typescript
// Test empty collections
it('should handle empty array', () => {
  expect(sum([])).toBe(0)
})

// Test null/undefined
it('should handle undefined', () => {
  expect(validate(undefined)).toBe(false)
})

// Test extreme values
it('should handle max safe integer', () => {
  expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1)
})
```

## Best Practices

### 1. Start Small

```bash
# Don't run mutation tests on entire codebase at once
# Start with one critical file
npx stryker run --mutate "packages/validators/src/governance.ts"
```

### 2. Focus on High-Value Code

Prioritize mutation testing for:
- Validators and schemas
- Business logic calculations
- Security-critical functions
- Complex algorithms

### 3. Use Incremental Mode

```json
{
  "incremental": true,
  "incrementalFile": ".stryker-tmp/incremental.json"
}
```

Only mutates changed code on subsequent runs (much faster!).

### 4. Ignore Known Survivors

```json
{
  "mutate": [
    "packages/validators/src/**/*.ts",
    "!packages/validators/src/generated/**"
  ]
}
```

### 5. Set Realistic Thresholds

Don't aim for 100% immediately:

```json
// Initial setup
{
  "thresholds": {
    "high": 70,
    "low": 50,
    "break": 40
  }
}

// After improvements
{
  "thresholds": {
    "high": 85,
    "low": 70,
    "break": 60
  }
}
```

## Integration with CI/CD

### Local Development

```bash
# Run before committing
npm run test:mutation

# Check report
open mutation-report.html
```

### CI Pipeline (Optional)

```yaml
# .github/workflows/mutation-test.yml
name: Mutation Testing
on:
  pull_request:
    paths:
      - 'packages/validators/src/**'

jobs:
  mutation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:mutation
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: mutation-report.html
```

**Note:** Mutation testing is slow (5-30 minutes). Only run on critical paths or manually trigger.

## Troubleshooting

### Mutation Tests Take Too Long

```json
{
  "timeoutMS": 60000,        // Increase timeout
  "timeoutFactor": 2,        // Multiply test timeout
  "maxConcurrentTestRunners": 2,  // Reduce parallelism
  "mutate": [
    "packages/validators/src/governance.ts"  // Reduce scope
  ]
}
```

### False Positives (Equivalent Mutations)

```typescript
// Use mutant killer comments
function isEven(n: number) {
  // Stryker disable next-line EqualityOperator
  return n % 2 === 0
}
```

### Out of Memory Errors

```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=4096 npm run test:mutation
```

## Examples from TogetherOS

### Governance Validator Mutations

**File:** `packages/validators/src/governance.ts`

**Critical Mutations to Kill:**

1. **Scope Type Validation**
```typescript
// Original
const validScopeTypes = ['individual', 'group']

// Mutation: Change array
const validScopeTypes = ['individual']  // Missing 'group'

// Killed by property test:
fc.property(
  fc.constantFrom('individual', 'group'),  // Tests both values
  (scopeType) => {
    expect(proposalScopeTypeSchema.safeParse(scopeType).success).toBe(true)
  }
)
```

2. **Boundary Conditions**
```typescript
// Original
title: z.string().min(3).max(200)

// Mutation: Change boundary
title: z.string().min(2).max(200)  // or .min(4)

// Killed by boundary tests:
it('should reject title with 2 chars', () => {
  expect(titleSchema.safeParse('ab').success).toBe(false)
})

it('should accept title with 3 chars', () => {
  expect(titleSchema.safeParse('abc').success).toBe(true)
})
```

3. **Refinement Logic**
```typescript
// Original
.refine((data) => {
  if (data.scopeType === 'individual') {
    return data.scopeId === data.authorId
  }
  return true
})

// Mutation: Change === to !==
return data.scopeId !== data.authorId  // Inverted logic

// Killed by property test:
it('should reject individual proposals where scopeId != authorId', () => {
  fc.assert(
    fc.property(uuidArbitrary, uuidArbitrary, (scopeId, authorId) => {
      fc.pre(scopeId !== authorId)
      const result = schema.safeParse({
        scopeType: 'individual',
        scopeId,
        authorId
      })
      expect(result.success).toBe(false)
    })
  )
})
```

## Resources

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Mutation Testing Introduction](https://en.wikipedia.org/wiki/Mutation_testing)
- [Stryker Vitest Runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [TogetherOS Governance Property Tests](../../packages/validators/src/__tests__/governance.property.test.ts)

## Next Steps

**Phase 2.3:** Synthetic Monitoring
- Activate Playwright E2E tests
- 5 critical user journeys
- Automated health checks

**Phase 3:** Advanced Monitoring Activation
- Enable Docker monitoring stack
- Grafana dashboards for metrics
- Uptime Kuma for service monitoring
