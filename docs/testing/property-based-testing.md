# Property-Based Testing Guide

**Status:** Phase 2.1 Complete (Observability Module)
**Library:** [fast-check](https://fast-check.dev/) v4.3+

## Overview

Property-based testing is a testing methodology where you define **properties** that should hold true for all possible inputs, and the testing framework generates hundreds of random test cases to verify those properties.

**Traditional Example-Based Test:**
```typescript
it('should validate email format', () => {
  expect(validateEmail('user@example.com')).toBe(true)
  expect(validateEmail('invalid-email')).toBe(false)
})
```

**Property-Based Test:**
```typescript
it('should validate all RFC-compliant emails', () => {
  fc.assert(
    fc.property(
      fc.emailAddress(), // Generates 100+ random valid emails
      (email) => {
        expect(validateEmail(email)).toBe(true)
      }
    )
  )
})
```

## Why Property-Based Testing?

### Benefits

1. **Exhaustive Edge Case Coverage** - Tests hundreds of inputs automatically
2. **Boundary Testing** - Finds edge cases you didn't think of
3. **Regression Prevention** - Once found, edge cases are preserved as seeds
4. **Documentation** - Properties serve as executable specifications
5. **Reduced Test Maintenance** - One property test = hundreds of examples

### When to Use

✅ **Good fit:**
- Validator functions (Zod schemas, custom validators)
- Pure utility functions (string manipulation, calculations)
- Data transformations (serialization, parsing)
- Business logic with invariants
- State machines with properties

❌ **Not ideal for:**
- UI component snapshots
- Integration tests with external dependencies
- Time-dependent operations
- Tests requiring specific sequences

## Setup

Property-based testing is already configured in TogetherOS:

```json
// package.json
{
  "devDependencies": {
    "fast-check": "^4.3.0"
  }
}
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

## Writing Property Tests

### Basic Structure

```typescript
import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('MyValidator', () => {
  it('should have property X', () => {
    fc.assert(
      fc.property(
        fc.string(), // Arbitrary generator
        (input) => {
          // Test property holds for all inputs
          expect(validator(input)).toBe(expected)
        }
      )
    )
  })
})
```

### Built-in Arbitraries

fast-check provides generators for common types:

```typescript
// Primitives
fc.string()           // Random strings
fc.integer()          // Random integers
fc.boolean()          // true/false
fc.constant('value')  // Always returns 'value'

// Strings with constraints
fc.string({ minLength: 3, maxLength: 200 })
fc.hexaString({ minLength: 32, maxLength: 32 }) // UUIDs
fc.emailAddress()
fc.webUrl()

// Collections
fc.array(fc.integer())
fc.record({ name: fc.string(), age: fc.integer() })
fc.constantFrom('option1', 'option2', 'option3') // Enums

// Combinators
fc.oneof(fc.string(), fc.integer()) // Union types
fc.tuple(fc.string(), fc.integer()) // Tuples
```

### Custom Arbitraries

Create custom generators for domain objects:

```typescript
// UUID arbitrary
const uuidArbitrary = fc.hexaString({ minLength: 32, maxLength: 32 })

// Proposal title arbitrary (3-200 chars)
const titleArbitrary = fc.string({ minLength: 3, maxLength: 200 })

// User object arbitrary
const userArbitrary = fc.record({
  id: uuidArbitrary,
  email: fc.emailAddress(),
  age: fc.integer({ min: 18, max: 120 }),
})
```

### Filtering Invalid Inputs

Use `filter()` or `fc.pre()` to exclude invalid cases:

```typescript
// Filter approach
fc.assert(
  fc.property(
    fc.string().filter(s => s !== 'individual' && s !== 'group'),
    (invalidScope) => {
      expect(validator(invalidScope)).toBe(false)
    }
  )
)

// Pre-condition approach
fc.assert(
  fc.property(
    fc.string(),
    fc.string(),
    (a, b) => {
      fc.pre(a !== b) // Skip test cases where a === b
      expect(areDistinct(a, b)).toBe(true)
    }
  )
)
```

## Testing Patterns

### Pattern 1: Valid Input Always Succeeds

```typescript
it('should accept all valid proposal statuses', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('draft', 'research', 'deliberation', 'voting'),
      (status) => {
        const result = proposalStatusSchema.safeParse(status)
        expect(result.success).toBe(true)
      }
    )
  )
})
```

### Pattern 2: Invalid Input Always Fails

```typescript
it('should reject invalid scope types', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => s !== 'individual' && s !== 'group'),
      (invalidScope) => {
        const result = proposalScopeTypeSchema.safeParse(invalidScope)
        expect(result.success).toBe(false)
      }
    )
  )
})
```

### Pattern 3: Boundary Conditions

```typescript
describe('boundary conditions', () => {
  it('should accept title exactly at minimum length (3 chars)', () => {
    fc.assert(
      fc.property(
        fc.constant('abc'), // Exactly 3 characters
        (title) => {
          const result = titleSchema.safeParse(title)
          expect(result.success).toBe(true)
        }
      )
    )
  })

  it('should reject title one character below minimum (2 chars)', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 2 }), // Less than 3 characters
        (title) => {
          const result = titleSchema.safeParse(title)
          expect(result.success).toBe(false)
        }
      )
    )
  })
})
```

### Pattern 4: Custom Refinement Rules

```typescript
it('should reject individual proposals where scopeId != authorId', () => {
  fc.assert(
    fc.property(
      uuidArbitrary,
      uuidArbitrary,
      (scopeId, authorId) => {
        fc.pre(scopeId !== authorId) // Only test distinct IDs

        const proposal = {
          scopeType: 'individual',
          scopeId,
          authorId,
          title: 'Valid Title',
          summary: 'Valid summary text here',
        }

        const result = createProposalSchema.safeParse(proposal)
        expect(result.success).toBe(false)

        if (!result.success) {
          expect(result.error.issues[0].message).toContain('scopeId must equal authorId')
        }
      }
    )
  )
})
```

### Pattern 5: Invariants

Test properties that should always hold:

```typescript
it('should satisfy: sort(sort(array)) === sort(array) (idempotency)', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const sorted = mySort(arr)
        const doubleSorted = mySort(sorted)
        expect(doubleSorted).toEqual(sorted)
      }
    )
  )
})

it('should satisfy: encode(decode(value)) === value (round-trip)', () => {
  fc.assert(
    fc.property(
      fc.string(),
      (original) => {
        const encoded = encode(original)
        const decoded = decode(encoded)
        expect(decoded).toBe(original)
      }
    )
  )
})
```

## Configuration

### Number of Test Cases

```typescript
fc.assert(
  fc.property(
    fc.string(),
    (s) => expect(validator(s)).toBeDefined()
  ),
  { numRuns: 1000 } // Run 1000 test cases (default: 100)
)
```

### Seed for Reproducibility

When a property test fails, fast-check provides a seed to reproduce:

```typescript
// Failed with seed: 1234567890
fc.assert(
  fc.property(
    fc.string(),
    (s) => expect(validator(s)).toBe(true)
  ),
  { seed: 1234567890 } // Reproduce exact failure
)
```

### Verbose Output

```typescript
fc.assert(
  fc.property(
    fc.string(),
    (s) => {
      expect(validator(s)).toBe(true)
    }
  ),
  { verbose: true } // Show all generated test cases
)
```

## Best Practices

### 1. Name Properties Clearly

```typescript
// ❌ Bad: Generic name
it('should work', () => { ... })

// ✅ Good: Describes the property
it('should accept all RFC-compliant email addresses', () => { ... })
it('should satisfy idempotency: sort(sort(x)) === sort(x)', () => { ... })
```

### 2. Test One Property at a Time

```typescript
// ❌ Bad: Multiple properties in one test
it('should validate correctly', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    expect(validator(s).length).toBeGreaterThan(0)
    expect(validator(s).type).toBe('valid')
    expect(validator(s).errors).toEqual([])
  }))
})

// ✅ Good: Separate tests for each property
it('should return non-empty result', () => { ... })
it('should mark valid inputs with type="valid"', () => { ... })
it('should return empty error array for valid inputs', () => { ... })
```

### 3. Use Meaningful Shrinking

fast-check automatically shrinks failing inputs to minimal examples:

```typescript
// If test fails with input "abcdefghijklmnop"
// fast-check shrinks to smallest failing input: "a"
fc.assert(
  fc.property(
    fc.string(),
    (s) => expect(s.length).toBeLessThan(20)
  )
)
// Failure: "aaaaaaaaaaaaaaaaaaaa" (20 a's)
// Shrunk to: "aaaaaaaaaaaaaaaaaaaa" (minimal 20-char string)
```

### 4. Document Edge Cases

When property tests find edge cases, document them:

```typescript
it('should handle empty strings (edge case found by property test)', () => {
  // Property test revealed that validator('') throws instead of returning false
  expect(() => validator('')).not.toThrow()
})
```

## Examples from TogetherOS

### Governance Validator Tests

See: `packages/validators/src/__tests__/governance.property.test.ts`

**Properties tested:**
1. Valid scope types always pass validation
2. Invalid scope types always fail validation
3. Individual proposals must have scopeId === authorId
4. Title length is bounded [3, 200]
5. Summary length is bounded [10, 2000]
6. Boundary conditions are handled correctly

### Writing Property Tests for Your Module

**Step 1: Identify Properties**
```typescript
// For a validator: What makes an input valid/invalid?
// For a transformer: What invariants hold? (round-trip, idempotency)
// For business logic: What rules must always be satisfied?
```

**Step 2: Choose Arbitraries**
```typescript
// Use built-in arbitraries when possible
fc.string(), fc.integer(), fc.emailAddress()

// Create custom arbitraries for domain objects
const proposalArbitrary = fc.record({
  title: fc.string({ minLength: 3, maxLength: 200 }),
  summary: fc.string({ minLength: 10, maxLength: 2000 }),
})
```

**Step 3: Write the Test**
```typescript
fc.assert(
  fc.property(
    proposalArbitrary,
    (proposal) => {
      const result = validateProposal(proposal)
      expect(result.success).toBe(true)
    }
  )
)
```

## Running Property Tests

```bash
# Run all tests (includes property tests)
npm test

# Run only property tests
npm test -- --grep property

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Integration with Vitest

Property tests integrate seamlessly with Vitest:

```typescript
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('MyModule', () => {
  // Regular example-based test
  it('should handle known edge case', () => {
    expect(validator('')).toBe(false)
  })

  // Property-based test
  it('should reject all strings below minimum length', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 2 }),
        (s) => expect(validator(s)).toBe(false)
      )
    )
  })
})
```

## Resources

- [fast-check Documentation](https://fast-check.dev/)
- [fast-check GitHub](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Introduction](https://increment.com/testing/in-praise-of-property-based-testing/)
- [TogetherOS Governance Property Tests](../../packages/validators/src/__tests__/governance.property.test.ts)

## Next Steps

**Phase 2.2:** Mutation Testing
- Set up Stryker for mutation testing
- Target >80% mutation score
- Validate test quality (not just coverage)

**Phase 2.3:** Synthetic Monitoring
- Activate Playwright E2E tests
- 5 critical user journeys
- Automated health checks
