# UI Module

The UI module provides a comprehensive set of reusable components following the TogetherOS Design System (Warm Minimalism).

## Design Philosophy

- **Warm Minimalism**: Clean, joyful, and restful with lots of white space
- **Accessibility First**: WCAG AA compliance, semantic HTML, keyboard navigation
- **Design Tokens**: Consistent colors, spacing, and typography via CSS variables
- **Type Safety**: Full TypeScript support with proper prop types

## Component Library

### Form Components

#### Input
Basic text input field with design system styling.

```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Enter text..."
  disabled={false}
/>
```

#### Textarea
Multi-line text input for longer content.

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Enter description..."
  rows={4}
/>
```

#### Label
Semantic form label with proper styling.

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

#### Checkbox
Single or multi-select checkbox with optional label.

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  id="terms"
  label="I agree to the terms"
/>
```

#### Radio
Mutually exclusive selection with optional label.

```tsx
import { Radio } from '@/components/ui/radio';

<Radio
  name="plan"
  value="basic"
  label="Basic Plan"
/>
```

#### Select
Native dropdown component.

```tsx
import { Select } from '@/components/ui/select';

<Select>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### Action Components

#### Button
Primary, secondary, and tertiary button variants.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn More</Button>
```

**Variants:**
- `primary`: Cooperative Green background (main actions)
- `secondary`: White/bg-1 with border (secondary actions)
- `tertiary`: Transparent link-style (tertiary actions)

### Display Components

#### Card
Content container with proper spacing and borders.

```tsx
import { Card } from '@/components/ui/card';

<Card>
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>
```

**Variants:**
- `default`: Standard white card with border
- `highlighted`: Brand or joy accent border
- `subtle`: Lower contrast for secondary content

#### Badge
Tags and status indicators.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="brand">Active</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
```

**Variants:**
- `default`: Neutral gray
- `brand`: Cooperative Green
- `joy`: Apricot
- `success`: Green
- `info`: Blue
- `warning`: Amber
- `danger`: Red

#### Alert
Notification and message boxes.

```tsx
import { Alert } from '@/components/ui/alert';

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>
```

**Variants:** Same as Badge

### Interactive Components

#### Modal
Dialog boxes and confirmations.

```tsx
import { Modal } from '@/components/ui/modal';

const [open, setOpen] = useState(false);

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={() => setOpen(false)}>Confirm</Button>
    <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
  </div>
</Modal>
```

**Features:**
- Backdrop overlay
- Escape key to close
- Scroll lock when open
- Accessible with ARIA attributes

#### Tabs
Navigation between related content sections.

```tsx
import { Tabs } from '@/components/ui/tabs';

<Tabs
  tabs={[
    { id: 'profile', label: 'Profile', content: <ProfileForm /> },
    { id: 'settings', label: 'Settings', content: <SettingsForm /> },
  ]}
  defaultTab="profile"
  onChange={(tabId) => console.log('Tab changed:', tabId)}
/>
```

#### Spinner
Loading indicators for async operations.

```tsx
import { Spinner } from '@/components/ui/spinner';

<Spinner size="md" variant="brand" />
```

**Sizes:** `sm`, `md`, `lg`
**Variants:** `brand`, `joy`, `default`

## Design Tokens

### Colors

All components use CSS variables from the design system:

```css
/* Backgrounds */
--bg-0: Page background
--bg-1: Card/panel background
--bg-2: Subtle panel background

/* Text */
--ink-900: Primary text
--ink-700: Secondary text
--ink-400: Muted text
--border: Border color

/* Accents */
--brand-600: Primary action (darker)
--brand-500: Primary action
--brand-100: Soft brand background

--joy-600: Joy accent (darker)
--joy-500: Joy accent
--joy-100: Soft joy background
```

### Typography

```
H1: 30–36px, Bold
H2: 24–28px, Bold
H3: 20–24px, SemiBold
Body: 16–18px, Regular
Caption: 14px, Regular
```

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

## Accessibility

All components follow WCAG AA standards:

- **Semantic HTML**: Proper use of `<button>`, `<input>`, `<label>`, etc.
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Escape, Arrow keys)
- **ARIA Attributes**: Proper roles, labels, and states
- **Focus States**: Visible focus rings (2px brand-500)
- **Color Contrast**: Minimum 7:1 ratio for body text
- **Screen Readers**: Hidden labels and status messages

## Usage Guidelines

### One Accent Per Screen
Choose either **brand** (green) or **joy** (apricot) as the hero color on any page, not both.

### Generous Spacing
- Default card padding: ≥ 2rem
- Line height: 1.6+ for body text
- Separate sections with whitespace first, borders second

### Readable Typography
- Cap line length at 68–72 characters
- Use `ink-900` for primary text
- Reserve `ink-700` for secondary, `ink-400` for muted

### Calm Motion
- Transitions: 150–200ms ease-out
- No parallax or looping animations
- Subtle hover states only

## Development

### Adding New Components

1. Create component in `apps/web/components/ui/`
2. Follow existing patterns (forwardRef, TypeScript, design tokens)
3. Include accessibility attributes
4. Add to this documentation
5. Test keyboard navigation and screen readers

### Testing Components

In YOLO mode, test components as you build:
- Verify visual appearance matches design system
- Test all variants and states
- Check keyboard navigation
- Verify TypeScript types
- Ensure responsive behavior

## Next Steps

- [ ] Add Tooltip component
- [ ] Add Dropdown/Popover component
- [ ] Add Accordion component
- [ ] Add Progress Bar component
- [ ] Create component showcase page at `/design`
- [ ] Add dark mode toggle
- [ ] Set up Storybook (optional)

## Resources

- **Design System**: [docs/design/system.md](../../design/system.md)
- **Tailwind Config**: `apps/web/tailwind.config.ts`
- **Component Source**: `apps/web/components/ui/`

---

**Version:** 1.0
**Last Updated:** October 2025
**Status:** 50% Complete (scaffolding + core components)
