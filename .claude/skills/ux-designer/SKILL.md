---
name: ux-designer
description: |
  **AUTO-TRIGGER when:** "use UX skill", "audit page", "theme change", "CSS update",
  "dark mode fix", or any UI work that touches multiple files.

  Verification workflow to ensure ALL affected files are updated.
  Prevents missed pages/components during UI changes.
---

# UI Change Verification Workflow

## MANDATORY for ALL UI/Theme/CSS Changes

### Step 1: Scope Discovery (BEFORE any edits)

Find ALL files affected by your change:

```bash
# For hardcoded colors needing CSS vars:
grep -rln "text-gray-\|bg-gray-\|bg-white\|text-white" apps/web/ packages/ui/ --include="*.tsx"

# For specific pattern replacement:
grep -rln "YOUR_PATTERN" apps/web/ packages/ui/ --include="*.tsx"

# For theme CSS variable changes:
grep -rln "var(--VARIABLE_NAME)" apps/web/ packages/ui/ --include="*.tsx"
```

**Create TodoWrite item for EACH file found.**
Do NOT start editing until the full list is captured.

### Step 2: Systematic Updates

Work through TodoWrite list file-by-file.
Mark each complete ONLY after editing and saving.

### Step 3: Verification (BEFORE PR)

Re-run the EXACT same grep from Step 1:

```bash
grep -rln "YOUR_PATTERN" apps/web/ packages/ui/ --include="*.tsx"
```

- **Results found** → NOT DONE. Continue fixing.
- **Zero results** → Verification passed.

### Step 4: Visual Test

For theme/dark mode changes:
1. Toggle theme picker through 3+ themes
2. Toggle dark mode on/off
3. Check affected pages render correctly

---

## Source of Truth Files

| What | File |
|------|------|
| Theme list (40+ themes) | `apps/web/components/dark-mode-provider.tsx` |
| CSS variables | `apps/web/app/globals.css` |
| Design tokens | `apps/web/styles/design-system/tokens.css` |

**Never duplicate these.** Always read the actual files.

---

## Common Patterns to Check

| Issue | Grep Pattern |
|-------|-------------|
| Hardcoded grays | `text-gray-[0-9]\|bg-gray-[0-9]` |
| Hardcoded white/black | `bg-white[^-]\|text-white[^-]` |
| Missing dark variants | `text-gray-` without nearby `dark:` |
| Should use CSS var | `text-gray-900\|text-gray-700\|bg-gray-50` |

### App's Actual CSS Variables

```css
/* Backgrounds */
--bg-0, --bg-1, --bg-2

/* Text */
--ink-900, --ink-700, --ink-400

/* Brand */
--brand-600, --brand-500, --brand-100

/* Accent */
--joy-600, --joy-500, --joy-100

/* Semantic */
--success, --info, --warn, --danger

/* Border */
--border
```

---

## Pre-Deployment Validation

```bash
./scripts/validate-css.sh
```

Must show `CSS=OK` before creating PR.

---

## Quick Reference: Tailwind to CSS Var

| Instead of | Use |
|------------|-----|
| `bg-white` | `bg-bg-1` or `bg-[var(--bg-1)]` |
| `bg-gray-50` | `bg-bg-2` |
| `text-gray-900` | `text-ink-900` |
| `text-gray-700` | `text-ink-700` |
| `text-gray-500` | `text-ink-400` |
| `border-gray-200` | `border-border` |

---

## Card Layout Pattern (CRITICAL)

**Problem:** Cards with flex layout often have buttons stuck directly under text with no spacing.

**Root Cause:** CardFooter lacks top padding/margin when CardContent uses `flex-grow`.

### Correct Pattern

```tsx
<Card className="flex flex-col">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="flex-grow">
    <p className="text-sm text-ink-700">Content text...</p>
  </CardContent>
  <CardFooter className="pt-4">  {/* ← CRITICAL: Add pt-4 for spacing */}
    <Link href="/path" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
      Action →
    </Link>
  </CardFooter>
</Card>
```

### Key Rules

1. **Always add `pt-4` to CardFooter** when using `flex-grow` on CardContent
2. **Use text links instead of buttons** for card CTAs (less visual noise)
3. **For disabled/coming soon states**: Use `<span className="text-sm text-ink-400">Coming Soon</span>`
4. **For accent actions** (like AI Bridge): Use `text-joy-600` instead of `text-brand-600`

### Anti-Pattern (err-009)

```tsx
{/* ❌ WRONG - Button directly in CardFooter without spacing */}
<CardFooter>
  <Button variant="default" size="sm">Action</Button>
</CardFooter>

{/* ✅ RIGHT - Text link with padding */}
<CardFooter className="pt-4">
  <Link href="/path" className="text-sm font-medium text-brand-600 hover:text-brand-700">
    Action →
  </Link>
</CardFooter>
```

### Why This Happens

Claude tends to copy Button patterns from other parts of the codebase without considering:
1. Visual hierarchy (buttons are "loud" and compete for attention)
2. Spacing context (card layout needs explicit padding between sections)
3. Touch target size (text links need less vertical space than buttons)
