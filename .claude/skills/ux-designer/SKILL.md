---
name: ux-designer
description: |
  **AUTO-TRIGGER when user says:** "use UX skill", "audit page", "check CSS", "dark mode issues", "accessibility audit", "responsive check", or requests UI/CSS validation.

  UX/UI design and validation for TogetherOS. Runs CSS validation, checks dark mode support, verifies accessibility, and audits responsive design. Creates ultra-modern, fully responsive interfaces.

  **Key capability:** When invoked, EXECUTES validation steps (runs scripts, reads files, reports issues) - does NOT just describe what the skill does.

  Use proactively for any UI work or when user reports visual issues.
---

# TogetherOS UX Designer Skill

Specialized UX/UI design agent for TogetherOS. Creates ultra-modern, fully responsive interfaces with dynamic theme selection, intelligent multilingual support, and cooperation-first design patterns.

---

## Design Principles

1. **Cooperation-first visual hierarchy** - Emphasize collective action over individual
2. **Ultra-modern aesthetic** - 2025 trends (bento grids, progressive blur, micro-interactions)
3. **Fully responsive** - Mobile-first, fluid typography
4. **Accessible** - WCAG 2.1 AA minimum
5. **Dynamic theme system** - 6 color palettes
6. **Intelligent i18n** - Suggestive language detection, never forced

---

## When to Trigger This Skill

- UI component creation requests
- Page layout design
- Theme customization
- Responsive implementation
- Accessibility audits
- CSS validation before deployment
- **User explicitly asks for UX audit** (e.g., "use UX skill", "audit this page")

---

## Manual UX Audit (MANDATORY when user requests)

When user asks to "use UX skill", "audit page", "check CSS", or similar:

### Step 1: Identify Target Files

```
User says: "audit governance page"
→ Find: apps/web/app/governance/page.tsx
→ Find all imported components (check imports at top of file)
→ If imports from @togetheros/ui/*, find those files too
```

### Step 2: Run Validation Script

```bash
./scripts/validate-css.sh
```

Report ALL output to user, especially any warnings or errors.

### Step 3: Manual Dark Mode Audit

For EACH file identified in Step 1, check every Tailwind class:

| Light-Only Class | Required Dark Variant |
|------------------|----------------------|
| `text-gray-700` | `dark:text-gray-300` |
| `text-gray-600` | `dark:text-gray-400` |
| `text-gray-500` | `dark:text-gray-400` |
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-900` |
| `bg-blue-50` | `dark:bg-blue-900` |
| `text-blue-900` | `dark:text-blue-100` |
| `text-blue-800` | `dark:text-blue-200` |
| `bg-yellow-100` | `dark:bg-yellow-900` |
| `text-yellow-800` | `dark:text-yellow-200` |
| `bg-green-100` | `dark:bg-green-900` |
| `text-green-800` | `dark:text-green-200` |
| `bg-red-50` | `dark:bg-red-900` |
| `text-red-900` | `dark:text-red-100` |
| `bg-purple-100` | `dark:bg-purple-900` |
| `text-purple-800` | `dark:text-purple-200` |

**For each class found WITHOUT its dark variant, report:**
```
FILE:LINE - text-gray-700 missing dark:text-gray-300
```

### Step 4: Check Form Controls

Form elements (select, input, textarea) need BOTH:
- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Border: `border-gray-300 dark:border-gray-600`

### Step 5: Check Labels

All `<label>` elements need dark variants:
- `text-gray-700 dark:text-gray-300` (or similar)

### Step 6: Report Format

```
## UX Audit Results: [page name]

### Files Analyzed
- apps/web/app/[path]/page.tsx
- packages/ui/src/[component].tsx

### Issues Found

#### Dark Mode (X issues)
- file.tsx:42 - text-gray-700 needs dark:text-gray-300
- file.tsx:58 - bg-white needs dark:bg-gray-800

#### Accessibility (X issues)
- file.tsx:100 - button missing focus-visible styles

#### Responsive (X issues)
- file.tsx:30 - no responsive breakpoints in 150-line component

### Recommended Fixes
[List specific edits needed]
```

### Step 7: Apply Fixes (if user approves)

After reporting, ask:
> "Found X issues. Should I fix them now?"

If yes, apply all fixes following yolo1 workflow.

---

## Theme System (6 Palettes)

All themes use CSS custom properties. Switch themes by changing the `data-theme` attribute on `<html>`.

| Theme | Primary | Accent | Background | Text | Character |
|-------|---------|--------|------------|------|-----------|
| `horizon-dawn` | #FF6B6B | #FFE66D | #FFF9E6 | #2D2A26 | Optimistic |
| `ocean-depth` | #0A8F8F | #7FDBDA | #0F1419 | #E8F1F2 | Professional |
| `forest-canvas` | #4A7C59 | #A3C9A8 | #F5F5F5 | #1A1A2E | Organic |
| `cosmic-violet` | #7B2CBF | #00D9FF | #0D0D0D | #E0AAFF | Futuristic |
| `terracotta-earth` | #CC5500 | #E6D5AC | #FAF7F2 | #2C2C2C | Grounded |
| `arctic-minimal` | #4A6FA5 | #F0F4F8 | #FFFFFF | #1A1A1A | Clean |

### Theme Implementation

```tsx
// Theme switcher component pattern
'use client';
import { useEffect, useState } from 'react';

const themes = [
  'horizon-dawn',
  'ocean-depth',
  'forest-canvas',
  'cosmic-violet',
  'terracotta-earth',
  'arctic-minimal'
] as const;

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<typeof themes[number]>('arctic-minimal');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as typeof themes[number])}>
      {themes.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}
```

---

## Fluid Typography System

Use CSS `clamp()` for smooth scaling between mobile and desktop.

```css
:root {
  /* Typography scale */
  --fs-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --fs-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --fs-base: clamp(1rem, 0.9rem + 0.45vw, 1.125rem);
  --fs-lg: clamp(1.125rem, 1rem + 0.55vw, 1.25rem);
  --fs-xl: clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem);
  --fs-2xl: clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem);
  --fs-3xl: clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem);
  --fs-4xl: clamp(2.25rem, 1.8rem + 2vw, 3rem);
  --fs-5xl: clamp(3rem, 2.4rem + 2.5vw, 3.75rem);

  /* Spacing scale */
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --space-xl: clamp(2rem, 1.6rem + 2vw, 3rem);
  --space-2xl: clamp(3rem, 2.4rem + 3vw, 4rem);
}
```

### Mobile vs Desktop Guidelines

| Element | Mobile | Desktop |
|---------|--------|---------|
| Body text | 18-20px | 16-18px |
| H1 | 28-32px | 40-48px |
| Line height | 1.6-1.8 | 1.5-1.6 |
| Touch targets | 44×44px min | 32×32px min |
| Line length | 45-60 chars | 60-75 chars |

---

## 2025 UI Patterns

### Bento Grids
Use for dashboards and feature showcases:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="col-span-2 row-span-2 bg-surface rounded-2xl p-6">Large feature</div>
  <div className="bg-surface rounded-2xl p-4">Small item</div>
  <div className="bg-surface rounded-2xl p-4">Small item</div>
  <div className="col-span-2 bg-surface rounded-2xl p-4">Wide item</div>
</div>
```

### Progressive Blur
For focus states and overlays:
```css
.modal-overlay {
  backdrop-filter: blur(8px);
  background: rgba(var(--color-bg-rgb), 0.7);
}

.focus-gradient {
  mask-image: linear-gradient(to bottom, black 60%, transparent);
}
```

### Micro-interactions
```css
.btn-primary {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}
.btn-primary:active {
  transform: translateY(0);
}
```

---

## Intelligent Multilingual (i18n)

### Language Detection Hierarchy
1. User explicit preference (saved in profile)
2. URL identifier (`/es/governance`, `/fr/bridge`)
3. Browser `Accept-Language` header
4. IP geolocation (ONLY as suggestion)
5. Default fallback (English)

### Suggestive Approach (NOT forced)
```tsx
// Show gentle suggestion, never auto-switch
function LanguageSuggestion({ detectedCountry, suggestedLang }) {
  return (
    <div className="bg-surface border rounded-lg p-4">
      <p>We noticed you might be in {detectedCountry}.</p>
      <p>Would you prefer to browse in {suggestedLang}?</p>
      <div className="flex gap-2 mt-2">
        <button onClick={switchLanguage}>Yes, switch</button>
        <button onClick={dismiss}>No, keep English</button>
        <button onClick={neverAsk}>Don't ask again</button>
      </div>
    </div>
  );
}
```

---

## Accessibility Checklist (WCAG 2.1 AA)

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components: 3:1 minimum

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Keyboard Navigation
- All interactive elements must be focusable
- Tab order must be logical
- Skip links for main content

### Screen Reader
- Use semantic HTML (`<main>`, `<nav>`, `<article>`)
- Add `aria-label` for icon-only buttons
- Use `aria-live` for dynamic content

---

## CSS Validation (Pre-Deploy)

Run before every deployment to catch CSS errors:

```bash
# From project root
./scripts/validate-css.sh
```

### What It Checks
1. **Syntax errors** - Invalid CSS properties/values
2. **Contrast ratios** - WCAG AA compliance
3. **Missing variables** - Undefined CSS custom properties
4. **Responsive issues** - Missing mobile styles
5. **Dark mode support** - Light-only classes missing dark: variants
6. **Unused classes** - Dead CSS (optional)

### Integration with yolo1
The yolo1 skill automatically runs CSS validation before creating PRs for pages that include `.tsx` or `.css` files.

### Manual Invocation
When user explicitly requests UX audit, follow the "Manual UX Audit" section above - don't just run the script, also do manual file inspection.

---

## Component Patterns

### Card
```tsx
<div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold text-primary">Title</h3>
  <p className="text-text mt-2">Description</p>
</div>
```

### Button
```tsx
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-primary text-white
  hover:bg-primary/90
  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
  transition-colors
">
  Action
</button>
```

### Input
```tsx
<input className="
  w-full px-4 py-2 rounded-lg
  bg-surface border border-border
  focus:border-primary focus:ring-2 focus:ring-primary/20
  placeholder:text-text/50
" />
```

---

## File References

- Design tokens: `@.claude/skills/ux-designer/design-system/tokens.css`
- Theme definitions: `@.claude/skills/ux-designer/design-system/themes/*.css`
- Validation script: `@scripts/validate-css.sh`
