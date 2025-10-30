# TogetherOS Design System

**Philosophy:** Warm Minimalism
Clean, joyful, and restful. Lots of white space, soft neutrals, one lively accent, and a gentle warm companion.

## Color Palette

### Backgrounds & Surfaces

```
bg-0 (page):        #FAFAF9 (light) | #0B0F14 (dark)
bg-1 (cards):       #FFFFFF (light) | #0F141A (dark)
bg-2 (panels):      #F5F5F4 (light) | #121922 (dark)
```

### Text & Neutrals

```
ink-900 (primary):  #0F172A (light) | #E5E7EB (dark)
ink-700 (secondary):#334155 (light) | #CBD5E1 (dark)
ink-400 (muted):    #94A3B8
border:             #E5E7EB (light) | #1F2937 (dark)
```

### Brand Accent — "Cooperative Green"

Primary action color, trust, growth.

```
brand-600:          #059669
brand-500:          #10B981 (light) | #22C55E (dark)
brand-100:          #D1FAE5 (pills, soft backgrounds)
```

### Joy Accent — "Apricot"

Warmth, celebration, gentle attention.

```
joy-600:            #F59E0B
joy-500:            #FDBA74 (light) | #FBBF24 (dark)
joy-100:            #FFF7ED (soft backgrounds)
```

### Semantic Colors

```
Success:            #16A34A / bg #DCFCE7
Info:               #0EA5E9 / bg #E0F2FE
Warning:            #D97706 / bg #FEF3C7
Danger:             #DC2626 / bg #FEE2E2
```

## Typography

**Font Stack:** Inter, DM Sans (fallback: system sans-serif)

```
H1: 30–36px, Bold (font-weight: 700)
H2: 24–28px, Bold
H3: 20–24px, SemiBold (font-weight: 600)
Body: 16–18px, Regular (font-weight: 400–500)
Caption: 14px, Regular
```

**Line Height:** 1.6+ for body text, 1.2 for headings
**Line Length:** Max 68–72 characters for comfortable reading

## Components

### Buttons

**Primary:**
- Background: `brand-600`
- Text: `white`
- Hover: `brand-700`
- Padding: `0.75rem 1.5rem`
- Border radius: `0.5rem`

**Secondary:**
- Background: `white` / `bg-1`
- Text: `ink-700`
- Border: `1px solid border`
- Hover: `bg-2`

**Tertiary (Link):**
- Background: `transparent`
- Text: `ink-700`
- Underline on focus
- Hover: `ink-900`

### Cards & Panels

**Default Card:**
- Background: `bg-1`
- Padding: `2rem` (≥ px-8 py-6)
- Border: `1px solid border`
- Border radius: `1rem`

**Highlighted Card (attention):**
- Background: `brand-100` or `joy-100`
- Border: `1px solid brand-500` or `joy-500`

**Subtle Panel (secondary content):**
- Background: `bg-2`
- Lower contrast text (`ink-700`, `ink-400`)

### Forms

**Input Fields:**
- Background: `bg-1`
- Border: `1px solid border`
- Focus: `2px brand-500` ring
- Padding: `0.75rem 1rem`
- Border radius: `0.5rem`

**Labels:**
- Font weight: 600
- Color: `ink-700`
- Margin bottom: `0.5rem`

### States

**Focus:**
- Ring: `2px brand-500` (or `joy-500` when joy is page accent)

**Selected:**
- Border: `1px brand-200`
- Background: `brand-50` / `brand-100`

**Disabled:**
- Opacity: `0.5`
- Cursor: `not-allowed`

## Layout

### Spacing Scale

```
0.25rem (1)  → Hairline gaps
0.5rem  (2)  → Tight spacing
0.75rem (3)  → Form elements
1rem    (4)  → Standard gap
1.5rem  (6)  → Section gaps
2rem    (8)  → Card padding
3rem    (12) → Large section spacing
4rem    (16) → Hero sections
```

### Grid

- **Base:** 12-column grid
- **Gap:** `1.5rem` (gap-6)
- **Max width:** `1400px` for main content
- **Breakpoints:** Mobile-first, standard Tailwind

### Dashboard

**Tile Sizes:**
- Small: 3×3 columns
- Medium: 6×3 columns
- Large: 6×6 columns

**Density Modes:**
- **Calm (default):** Large tiles, fewer metrics, more padding
- **Compact:** Smaller tiles, denser information

**Panel Anatomy:**
1. Title (left) + Action (right)
2. Primary metric (center stage)
3. Single secondary insight
4. One "Next step" action

## Design Principles

### 1. One Accent Per Screen
Choose either **brand** (green) or **joy** (apricot) as the hero color on any given page, not both.

### 2. Big, Breathable Panels
- Default card padding: ≥ `2rem`
- Line height: `1.6+`
- Generous spacing between sections

### 3. Space First, Borders Second
Separate sections with whitespace before adding borders. Use hairline borders (`1px`) sparingly.

### 4. Readable Typography
- Cap line length at 68–72 characters
- Use `ink-900` for primary text
- Reserve `ink-700` for secondary, `ink-400` for muted

### 5. Calm Motion
- Transitions: `150–200ms ease-out`
- No parallax or looping animations
- Subtle hover states only

### 6. Accessibility
- Body text contrast: ≥ WCAG AA (aim 7:1)
- Reserve `joy` (apricot) for fills/badges, not long-read text
- Always provide non-color affordances (shape, weight, underline) for states

## Implementation

### CSS Variables

```css
:root {
  --bg-0: #FAFAF9;
  --bg-1: #FFFFFF;
  --bg-2: #F5F5F4;
  --ink-900: #0F172A;
  --ink-700: #334155;
  --ink-400: #94A3B8;
  --border: #E5E7EB;
  --brand-600: #059669;
  --brand-500: #10B981;
  --brand-100: #D1FAE5;
  --joy-600: #F59E0B;
  --joy-500: #FDBA74;
  --joy-100: #FFF7ED;
  --success: #16A34A;
  --success-bg: #DCFCE7;
  --info: #0EA5E9;
  --info-bg: #E0F2FE;
  --warn: #D97706;
  --warn-bg: #FEF3C7;
  --danger: #DC2626;
  --danger-bg: #FEE2E2;
}

.dark {
  --bg-0: #0B0F14;
  --bg-1: #0F141A;
  --bg-2: #121922;
  --ink-900: #E5E7EB;
  --ink-700: #CBD5E1;
  --border: #1F2937;
  --brand-500: #22C55E;
  --joy-500: #FBBF24;
}
```

### Tailwind Config

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      bg: {
        0: 'var(--bg-0)',
        1: 'var(--bg-1)',
        2: 'var(--bg-2)'
      },
      ink: {
        900: 'var(--ink-900)',
        700: 'var(--ink-700)',
        400: 'var(--ink-400)'
      },
      brand: {
        100: 'var(--brand-100)',
        500: 'var(--brand-500)',
        600: 'var(--brand-600)'
      },
      joy: {
        100: 'var(--joy-100)',
        500: 'var(--joy-500)',
        600: 'var(--joy-600)'
      },
      success: 'var(--success)',
      info: 'var(--info)',
      warn: 'var(--warn)',
      danger: 'var(--danger)'
    }
  }
}
```

## Usage Examples

### Page Structure

```tsx
<div style={{ background: 'var(--bg-0)', minHeight: '100vh' }}>
  <header style={{
    background: 'var(--bg-1)',
    borderBottom: '1px solid var(--border)',
    padding: '1.5rem 2rem'
  }}>
    {/* Header content */}
  </header>

  <main style={{
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '3rem 2rem'
  }}>
    {/* Main content */}
  </main>
</div>
```

### Card Component

```tsx
<div style={{
  background: 'var(--bg-1)',
  padding: '2rem',
  borderRadius: '1rem',
  border: '1px solid var(--border)'
}}>
  <h3 style={{
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
    marginBottom: '1rem'
  }}>
    Card Title
  </h3>
  <p style={{
    color: 'var(--ink-700)',
    lineHeight: 1.6,
    marginBottom: '1.5rem'
  }}>
    Card content with comfortable line height.
  </p>
  <button style={{
    background: 'var(--brand-600)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer'
  }}>
    Take Action
  </button>
</div>
```

## Resources

- **Live Showcase:** [/design](/design)
- **Figma (coming soon):** Design tokens and component library
- **Accessibility Checker:** [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Updates

**Version 1.0** (Oct 2025)
- Initial warm minimalism system
- Cooperative Green + Apricot accents
- Light/dark mode support
- Dashboard density modes
