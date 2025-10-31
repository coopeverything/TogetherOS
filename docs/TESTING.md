# TogetherOS Testing Guide

This document describes testing conventions, patterns, and best practices for the TogetherOS codebase.

## Overview

TogetherOS uses **Vitest** as the test runner and **React Testing Library** for component testing. These tools provide:
- Fast test execution with native ESM support
- TypeScript support out of the box
- React component testing utilities
- Coverage reporting

## Test Structure

### Location Conventions

Tests are colocated with the code they test:

```
packages/types/
  src/
    user.ts
  __tests__/
    user.test.ts

packages/ui/src/
  bridge/
    BridgeChat.tsx
    __tests__/
      BridgeChat.test.tsx

apps/web/components/
  ui/
    button.tsx
    __tests__/
      button.test.tsx
```

**Rules:**
- Test files go in `__tests__/` directories alongside source
- Test files use `.test.ts` or `.test.tsx` extensions
- Test file names match source file names (e.g., `button.tsx` → `button.test.tsx`)

### Test Organization

Use `describe` blocks to organize tests by functionality:

```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      // test
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      // test
    })
  })

  describe('accessibility', () => {
    it('has correct ARIA labels', () => {
      // test
    })
  })
})
```

**Common categories:**
- `rendering` - Visual output and props
- `interaction` - User events and callbacks
- `state` - Component state management
- `accessibility` - ARIA, keyboard navigation, screen readers
- `error handling` - Error states and edge cases
- `integration` - Multi-component workflows

## Writing Tests

### Component Tests

Use React Testing Library to test components:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Key patterns:**
- Use `screen.getByRole()` for accessibility-focused queries
- Use `userEvent` for realistic user interactions
- Use `vi.fn()` for mock functions
- Always await async operations

### Validation Tests

Test validation schemas and helpers:

```typescript
import { describe, it, expect } from 'vitest'
import { userSchema } from '@togetheros/validators/user'

describe('userSchema', () => {
  it('accepts valid user data', () => {
    const result = userSchema.safeParse({
      email: 'test@example.com',
      handle: 'testuser',
      displayName: 'Test User',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = userSchema.safeParse({
      email: 'not-an-email',
      handle: 'testuser',
    })

    expect(result.success).toBe(false)
  })
})
```

### API Tests

Test API routes with fetch mocks:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API: /api/bridge/ask', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('returns streaming response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Answer') })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })
    global.fetch = mockFetch

    // Test implementation
  })
})
```

## Best Practices

### 1. Test User Behavior, Not Implementation

**Good:**
```typescript
it('shows error when email is invalid', async () => {
  const user = userEvent.setup()
  render(<SignupForm />)

  await user.type(screen.getByLabelText('Email'), 'invalid')
  await user.click(screen.getByRole('button', { name: 'Sign up' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
})
```

**Bad:**
```typescript
it('sets emailError state when validation fails', () => {
  const { rerender } = render(<SignupForm />)
  // Testing internal state instead of user-visible behavior
})
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact with the app:

**Priority order:**
1. `getByRole` - Accessible by assistive tech
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Inputs with placeholders
4. `getByText` - Content visible to users
5. `getByTestId` - Last resort only

**Examples:**
```typescript
// Good
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email address')

// Avoid
screen.getByTestId('submit-button')
screen.getByClassName('email-input')
```

### 3. Test Accessibility

Always test keyboard navigation and ARIA attributes:

```typescript
describe('accessibility', () => {
  it('can be navigated with keyboard', async () => {
    const user = userEvent.setup()
    render(<Dialog />)

    await user.tab()
    expect(screen.getByRole('dialog')).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has correct ARIA labels', () => {
    render(<Button aria-label="Close dialog">×</Button>)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })
})
```

### 4. Mock External Dependencies

Mock CSS modules, APIs, and external services:

```typescript
// Mock CSS modules
vi.mock('./Component.module.css', () => ({
  default: {
    'container': 'container',
    'button': 'button',
  },
}))

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
})

// Clean up
beforeEach(() => {
  vi.clearAllMocks()
})
```

### 5. Use Setup Functions for Common Patterns

Extract repeated setup logic:

```typescript
function renderWithUser(component: React.ReactElement) {
  const user = userEvent.setup()
  return {
    user,
    ...render(component),
  }
}

it('handles user interaction', async () => {
  const { user } = renderWithUser(<MyComponent />)
  await user.click(screen.getByRole('button'))
  // ...
})
```

## Running Tests

### Commands

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only package tests (exclude web app)
npm run test:packages

# Run only web app tests
npm run test:web

# Run tests in UI mode (browser-based)
npm run test:ui
```

### Watch Mode

In watch mode, Vitest will re-run tests when files change:

```bash
npm run test:watch
```

**Keyboard shortcuts:**
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename
- `t` - Filter by test name
- `q` - Quit

### Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/coverage-final.json` - JSON data
- Terminal output shows summary

**Coverage targets:**
- Aim for >80% coverage on critical paths
- 100% coverage not required but encouraged for validation logic
- Focus on meaningful tests over coverage percentage

## Configuration

### Root Config (packages/*)

`vitest.config.ts` at root configures tests for packages:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@togetheros/types': path.resolve(__dirname, './packages/types/src'),
      '@togetheros/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
})
```

### Web App Config (apps/web/*)

`apps/web/vitest.config.ts` configures tests for Next.js app:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
    },
  },
})
```

### Setup Files

`vitest.setup.ts` files run before tests:

```typescript
import '@testing-library/jest-dom'
```

This adds custom matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

## Common Patterns

### Testing Forms

```typescript
it('submits form with valid data', async () => {
  const handleSubmit = vi.fn()
  const user = userEvent.setup()

  render(<Form onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

### Testing Async Behavior

```typescript
it('loads data on mount', async () => {
  render(<DataComponent />)

  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Testing Error States

```typescript
it('shows error message on failure', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
  global.fetch = mockFetch

  render(<Component />)

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load')
  })
})
```

### Testing Conditional Rendering

```typescript
it('shows different content based on user role', () => {
  const { rerender } = render(<Dashboard userRole="member" />)
  expect(screen.getByText('Member Dashboard')).toBeInTheDocument()

  rerender(<Dashboard userRole="admin" />)
  expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
})
```

## Troubleshooting

### Tests fail with "Cannot find module"

**Solution:** Check path aliases in `vitest.config.ts` match `tsconfig.json`:

```typescript
resolve: {
  alias: {
    '@togetheros/ui': path.resolve(__dirname, './packages/ui/src'),
  },
}
```

### Tests fail with "window is not defined"

**Solution:** Ensure `environment: 'jsdom'` is set in config:

```typescript
test: {
  environment: 'jsdom',
}
```

### CSS module imports fail

**Solution:** Mock CSS modules in test files:

```typescript
vi.mock('./Component.module.css', () => ({
  default: {
    'className': 'className',
  },
}))
```

### Tests are slow

**Solution:**
- Use `vi.mock()` to mock slow dependencies
- Avoid unnecessary `waitFor()` calls
- Use `--no-coverage` flag for faster runs during development

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2025-10-30
**Scaffold Progress:** Phase 3 (Testing Infrastructure)
