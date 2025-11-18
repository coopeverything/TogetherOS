# TogetherOS Development Setup Guide

This guide will help you set up your local development environment for contributing to TogetherOS.

## Prerequisites

### Required Software

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))

### Recommended Tools

- **VS Code** ([Download](https://code.visualstudio.com/))
  - Extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- **GitHub CLI** ([Download](https://cli.github.com/))
- **Docker** (optional, for dev containers)

## Quick Start

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/coopeverything/TogetherOS.git
cd TogetherOS

# Or via SSH
git clone git@github.com:coopeverything/TogetherOS.git
cd TogetherOS
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo, including packages and apps.

### 3. Set Up Environment Variables

Create `.env.local` in `apps/web/`:

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/togetheros

# Authentication
JWT_SECRET=your-secret-key-here
SESSION_SECRET=another-secret-key

# Bridge (optional)
ANTHROPIC_API_KEY=your-api-key-here
```

### 4. Set Up Database

```bash
# Create database
createdb togetheros

# Run migrations (when available)
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
TogetherOS/
├── apps/
│   └── web/                  # Next.js frontend application
│       ├── app/              # App Router pages and API routes
│       ├── components/       # React components
│       ├── lib/              # Utility functions
│       └── package.json
│
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── validators/           # Validation schemas (Zod)
│   └── ui/                   # Shared UI components
│
├── docs/                     # Documentation
├── scripts/                  # Build and validation scripts
├── .github/                  # CI/CD workflows
│
├── package.json              # Root workspace config
├── tsconfig.json             # TypeScript project references
└── vitest.config.ts          # Test configuration
```

## Development Workflow

### Branch Strategy

All work happens on the `yolo` branch:

```bash
# Create feature branch from yolo
git checkout yolo
git pull origin yolo
git checkout -b feature/my-feature

# Work on changes
git add .
git commit -m "feat(module): add new feature"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --base yolo
```

**Important:** Never create branches from or PRs to `main`. Use `yolo` as the base branch.

### Making Changes

1. **Check the spec** - Read `docs/modules/{module}.md` for requirements
2. **Create branch** - Use descriptive names: `feature/bridge-streaming`, `fix/auth-jwt`
3. **Make smallest change** - One feature or fix per PR
4. **Write tests** - Add tests for new functionality
5. **Run validation** - Ensure all checks pass
6. **Create PR** - Include proof lines and clear description

### Running Commands

```bash
# Development
npm run dev                   # Start web app in dev mode
npm run dev --workspace=@togetheros/web  # Same, explicit

# Building
npm run build                 # Build all packages + web app
npm run build:packages        # Build only packages
npm run build:web             # Build only web app
npm run clean                 # Clean build artifacts

# Testing
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # Generate coverage report
npm run test:packages         # Test only packages
npm run test:web              # Test only web app

# Type Checking
npm run typecheck             # Check types without building

# Linting
npm run lint                  # Lint all workspaces

# Validation
./scripts/validate.sh         # Run all validators
```

### Code Quality

Before committing, ensure:

```bash
# TypeScript compiles
npm run typecheck

# Tests pass
npm test

# Linting passes (when configured)
npm run lint

# All validators pass
./scripts/validate.sh
```

Expected output:
```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

## Working with Packages

### Adding Dependencies

**To web app:**
```bash
npm install <package> --workspace=@togetheros/web
```

**To a package:**
```bash
npm install <package> --workspace=@togetheros/types
```

**To root (dev dependencies):**
```bash
npm install -D <package>
```

### Using Packages in Code

Import from packages using path aliases:

```typescript
// In apps/web or packages
import { User } from '@togetheros/types'
import { Button } from '@togetheros/ui'
import { validateEmail } from '@togetheros/validators'
```

### Creating a New Package

1. Create directory in `packages/`:
```bash
mkdir -p packages/my-package/src
```

2. Add `package.json`:
```json
{
  "name": "@togetheros/my-package",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

3. Add `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [
    { "path": "../types" }
  ]
}
```

4. Update root `tsconfig.json`:
```json
{
  "references": [
    { "path": "./packages/my-package" }
  ]
}
```

5. Create entry point:
```typescript
// packages/my-package/src/index.ts
export * from './my-feature'
```

## Writing Tests

### Component Tests

```typescript
// components/ui/__tests__/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Validation Tests

```typescript
// packages/validators/__tests__/user.test.ts
import { describe, it, expect } from 'vitest'
import { userSchema } from '../user'

describe('userSchema', () => {
  it('accepts valid user', () => {
    const result = userSchema.safeParse({
      email: 'test@example.com',
      handle: 'testuser',
    })

    expect(result.success).toBe(true)
  })
})
```

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

## Git Workflow

### Commit Messages

Follow conventional commits format:

```bash
git commit -m "feat(bridge): add streaming response"
git commit -m "fix(auth): resolve JWT expiration bug"
git commit -m "docs(api): update authentication guide"
git commit -m "refactor(ui): extract button variants"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

### Creating Pull Requests

Use the PR template:

```markdown
## Summary
Brief description of changes

## What & Why
Explain what changed and why

## Files Changed
- path/to/file1.ts
- path/to/file2.tsx

## Testing
How to test these changes

## Proof Lines
LINT=OK
VALIDATORS=GREEN
SMOKE=OK

## Category & Keywords
Category: Cooperative Technology
Keywords: testing, infrastructure, vitest
```

Create PR:
```bash
# Using GitHub CLI (recommended)
gh pr create --base yolo --title "feat: add testing infrastructure"

# Or push and use web UI
git push -u origin feature/my-feature
```

## Troubleshooting

### "Cannot find module '@togetheros/...'"

**Solution:**
```bash
npm install
npm run build:packages
```

### Build errors after pulling latest

**Solution:**
```bash
npm run clean
npm install
npm run build
```

### TypeScript errors in IDE

**Solution:** Restart TypeScript server
- VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server"
- Or restart your editor

### Contradictory TypeScript errors

**Symptom:** Error messages that flip when you fix them
- "Expected X, got Y" → change to Y → "Expected Y, got X"

**Solution:** Clear build caches
```bash
rm -rf apps/web/.next apps/web/tsconfig.tsbuildinfo
npm run typecheck
```

**When this happens:**
- After upgrading Next.js or React
- With Next.js 16 dynamic route params
- TypeScript errors don't match actual code

**See also:**
- `.claude/workflows/typescript-verification.md` (Mistake 6)
- `docs/dev/common-mistakes.md` (Section 7)
- `docs/dev/typescript-guide.md` (Pattern 5)

### Tests fail with path errors

**Solution:** Check path aliases in `vitest.config.ts` match `tsconfig.json`

### Database connection errors

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check `.env.local` has correct `DATABASE_URL`
3. Verify database exists: `psql -l | grep togetheros`

### Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

## Editor Setup

### VS Code

Recommended settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Error Lens

### Environment Variables

Example `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/togetheros

# Auth
JWT_SECRET=dev-secret-change-in-production
SESSION_SECRET=another-dev-secret

# Bridge AI Assistant (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Feature Flags (optional)
ENABLE_BRIDGE=true
ENABLE_GROUPS=false

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Additional Resources

- [OPERATIONS.md](./OPERATIONS.md) - Contributor workflow
- [PACKAGES.md](./PACKAGES.md) - Package structure
- [TESTING.md](./TESTING.md) - Testing guide
- [ROUTING.md](./ROUTING.md) - Routing conventions
- [CI/CD Actions Playbook](./CI/Actions_Playbook.md) - CI/CD details

## Getting Help

- **GitHub Discussions:** [TogetherOS Discussions](https://github.com/coopeverything/TogetherOS/discussions)
- **Issues:** [Report bugs or request features](https://github.com/coopeverything/TogetherOS/issues)
- **Documentation:** [docs/modules/INDEX.md](./modules/INDEX.md)

## Next Steps

After setting up your environment:

1. Read [OPERATIONS.md](./OPERATIONS.md) for contributor workflow
2. Check [STATUS_v2.md](./STATUS_v2.md) for current progress
3. Browse [docs/modules/](./modules/) for module specs
4. Pick an issue labeled `good first issue`
5. Create a PR following the guidelines above

---

**Last Updated:** 2025-10-30
**Scaffold Progress:** 100% (Phase 3 Complete)
