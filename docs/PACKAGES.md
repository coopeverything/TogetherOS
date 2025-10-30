# TogetherOS Monorepo Package Structure

This document describes the monorepo structure, package organization, and how to work with the codebase.

## Overview

TogetherOS uses npm workspaces for monorepo management with TypeScript project references for efficient builds and type checking.

## Package Structure

```
TogetherOS/
├── apps/
│   └── web/                    # Next.js 14 frontend application
│       ├── app/                # Next.js App Router pages
│       ├── components/         # App-specific components
│       ├── lib/                # App-specific utilities
│       └── package.json        # @togetheros/web
│
├── packages/
│   ├── types/                  # Shared TypeScript type definitions
│   │   ├── src/
│   │   └── package.json        # @togetheros/types
│   │
│   ├── ui/                     # Shared React UI components
│   │   ├── src/
│   │   │   ├── index.ts       # Main export
│   │   │   └── bridge/        # Bridge-specific components
│   │   └── package.json        # @togetheros/ui
│   │
│   └── validators/             # Shared validation utilities
│       ├── src/
│       └── package.json        # @togetheros/validators
│
├── package.json                # Root workspace configuration
└── tsconfig.json               # Root TypeScript project references
```

## Packages

### `@togetheros/web`

**Location:** `apps/web`
**Description:** Next.js 14 frontend application with App Router

**Dependencies:**
- `@togetheros/ui` - UI components
- `@togetheros/types` - Type definitions
- `@togetheros/validators` - Validation utilities

**Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run linter

**Path Aliases:**
- `@togetheros/ui` - Shared UI components
- `@togetheros/types` - Shared types
- `@togetheros/validators` - Shared validators
- `@/components/*` - App components
- `@/lib/*` - Lib utilities
- `@/*` - App root

### `@togetheros/types`

**Location:** `packages/types`
**Description:** Shared TypeScript type definitions used across all packages

**Features:**
- Core domain types (User, Group, Proposal, etc.)
- API contract types
- Database model types
- Utility types

**Exports:**
- `@togetheros/types` - Main export (all types)
- `@togetheros/types/*` - Individual type modules

**Dependencies:** None (base package)

### `@togetheros/ui`

**Location:** `packages/ui`
**Description:** Shared React UI components with Tailwind CSS

**Features:**
- 25+ production-ready components
- Dark mode support
- Accessible (ARIA compliant)
- TypeScript support

**Exports:**
- `@togetheros/ui` - Main components export
- `@togetheros/ui/bridge` - Bridge-specific components

**Dependencies:**
- `@togetheros/types` - Type definitions
- React 18+ (peer dependency)

**Component Categories:**
- Form components (Input, Textarea, Select, etc.)
- Navigation (Button, Link, etc.)
- Feedback (Toast, Dialog, Alert, etc.)
- Layout (Card, Separator, etc.)
- Data display (Table, Badge, Progress, etc.)

### `@togetheros/validators`

**Location:** `packages/validators`
**Description:** Shared validation utilities and schemas

**Features:**
- Input validation functions
- Schema definitions
- Error message formatting
- Type guards

**Exports:**
- `@togetheros/validators` - Main export
- `@togetheros/validators/*` - Individual validator modules

**Dependencies:**
- `@togetheros/types` - Type definitions

## TypeScript Configuration

### Project References

The monorepo uses TypeScript project references for efficient incremental builds:

**Root `tsconfig.json`:**
References all packages and apps:
```json
{
  "references": [
    { "path": "./packages/types" },
    { "path": "./packages/validators" },
    { "path": "./packages/ui" },
    { "path": "./apps/web" }
  ]
}
```

**Package-level tsconfig.json:**
Each package has `composite: true` and references its dependencies:
```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "../types" }
  ]
}
```

### Path Aliases

Path aliases are configured in each `tsconfig.json` for clean imports:

**In apps/web:**
```typescript
import { Button } from '@togetheros/ui'
import { User } from '@togetheros/types'
import { validateEmail } from '@togetheros/validators'
import { MyComponent } from '@/components/MyComponent'
```

**In packages:**
```typescript
import { UserType } from '@togetheros/types'
```

## Development Workflow

### Initial Setup

```bash
# Install dependencies (from root)
npm install

# Type check all packages
npm run typecheck
```

### Development

```bash
# Start web app in dev mode
npm run dev

# Or from apps/web directory
cd apps/web && npm run dev
```

### Building

```bash
# Build all packages and apps
npm run build

# Build only packages (types, validators, ui)
npm run build:packages

# Build only web app
npm run build:web

# Clean all build artifacts
npm run clean
```

### Adding Dependencies

**To a specific workspace:**
```bash
npm install <package> --workspace=@togetheros/web
npm install <package> --workspace=@togetheros/ui
```

**To root (shared across all):**
```bash
npm install <package>
```

### Type Checking

```bash
# Type check all packages (dry run, no emit)
npm run typecheck

# Build TypeScript project references
tsc --build

# Clean TypeScript build cache
tsc --build --clean
```

## Package Dependencies Graph

```
@togetheros/types (base package)
    ↓
    ├── @togetheros/validators
    └── @togetheros/ui
            ↓
        @togetheros/web
```

**Dependency rules:**
1. `types` has no internal dependencies (base package)
2. `validators` depends on `types`
3. `ui` depends on `types`
4. `web` depends on all packages

## Adding a New Package

1. Create package directory in `packages/`
2. Add `package.json` with:
   - Unique name (`@togetheros/<name>`)
   - Correct main/types/exports fields
   - Dependencies (including `@togetheros/types` if needed)
3. Add `tsconfig.json` with:
   - `composite: true`
   - `declaration: true`
   - References to dependencies
4. Update root `tsconfig.json` references
5. Run `npm install` to link workspace
6. Add path alias in consuming packages

## Common Issues

### "Cannot find module '@togetheros/...'"

**Solution:** Ensure package is installed and path alias is configured in consuming package's `tsconfig.json`

### Build errors after adding dependency

**Solution:**
```bash
npm run clean
npm install
npm run build
```

### Type errors in IDE but builds succeed

**Solution:** Restart TypeScript server in your editor (VS Code: Cmd+Shift+P → "Restart TS Server")

## Best Practices

1. **Keep packages focused:** Each package should have a single, clear responsibility
2. **Avoid circular dependencies:** Never import from a package that imports from you
3. **Use path aliases:** Always use `@togetheros/*` imports, not relative paths across packages
4. **Export explicitly:** Only export what's needed in package index files
5. **Document public APIs:** Add JSDoc comments to exported types and functions
6. **Version together:** All packages use same version (0.0.0 during development)

## Scripts Reference

**Root package.json scripts:**
- `npm run build` - Build all packages + web app
- `npm run build:web` - Build only web app
- `npm run build:packages` - Build only packages
- `npm run clean` - Clean build artifacts
- `npm run dev` - Start web app dev server
- `npm run lint` - Lint all workspaces
- `npm run typecheck` - Type check without emit

**Web app scripts:**
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Next.js linter

**Package scripts:**
- `npm run build` - TypeScript build with project references
- `npm run clean` - Clean TypeScript build cache

## Additional Resources

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** 2025-10-30
**Scaffold Progress:** 65% → 85% (Phase 2 complete)
