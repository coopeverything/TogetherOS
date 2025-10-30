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

#### Tooltip
Contextual information on hover/focus.

```tsx
import { Tooltip } from '@/components/ui/tooltip';

<Tooltip content="Helpful hint" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

**Positions:** `top`, `bottom`, `left`, `right`

#### Dropdown
Menu with clickable items.

```tsx
import { Dropdown } from '@/components/ui/dropdown';

<Dropdown
  trigger={<Button>Open Menu</Button>}
  items={[
    { label: 'Edit', value: 'edit', onClick: () => {} },
    { label: 'Delete', value: 'delete', onClick: () => {}, disabled: true },
  ]}
  position="bottom-left"
/>
```

**Positions:** `bottom-left`, `bottom-right`, `top-left`, `top-right`

#### Accordion
Expandable content sections.

```tsx
import { Accordion } from '@/components/ui/accordion';

<Accordion
  items={[
    { id: '1', title: 'Question 1', content: 'Answer 1' },
    { id: '2', title: 'Question 2', content: 'Answer 2' },
  ]}
  allowMultiple={false}
  defaultOpen={['1']}
/>
```

#### Progress
Progress bars with variants and labels.

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={65} max={100} variant="brand" showLabel />
```

**Sizes:** `sm`, `md`, `lg`
**Variants:** `brand`, `joy`, `success`, `info`, `warning`, `danger`

#### Toast
Temporary notification system with auto-dismiss.

```tsx
import { useToast } from '@/components/ui/toast';

const { addToast } = useToast();

addToast({
  title: 'Success!',
  description: 'Your changes have been saved.',
  variant: 'success',
  duration: 5000
});
```

**Variants:** `default`, `success`, `info`, `warning`, `danger`
**Features:**
- Auto-dismiss with configurable duration
- Manual dismiss button
- Toast queue management
- Stacking notifications

#### Dialog
Structured dialog with header, body, and footer sections.

```tsx
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';

<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogHeader>
    <DialogTitle>Confirm Action</DialogTitle>
  </DialogHeader>
  <DialogBody>
    <p>Are you sure you want to proceed?</p>
  </DialogBody>
  <DialogFooter>
    <Button onClick={() => setOpen(false)}>Confirm</Button>
  </DialogFooter>
</Dialog>
```

**Features:**
- Backdrop overlay
- Escape key handling
- Scroll lock
- Composable parts for flexible layouts

### Navigation Components

#### Breadcrumb
Navigation hierarchy display.

```tsx
import { Breadcrumb } from '@/components/ui/breadcrumb';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ]}
  separator="/"
/>
```

**Features:**
- Custom separator (default: `/`)
- Click handlers or hrefs
- Automatic current page styling
- ARIA navigation support

#### Pagination
Page navigation for lists and tables.

```tsx
import { Pagination } from '@/components/ui/pagination';

<Pagination
  currentPage={1}
  totalPages={20}
  onPageChange={(page) => setPage(page)}
  showFirstLast={true}
  siblingCount={1}
/>
```

**Features:**
- Ellipsis for large page counts
- First/last page buttons (optional)
- Configurable sibling count
- Fully accessible with ARIA
- Smart page range calculation

## Dark Mode

The application includes a comprehensive dark mode system using React Context.

### Using Dark Mode

```tsx
import { useDarkMode, DarkModeToggle } from '@/components/dark-mode-provider';

// In your component
const { darkMode, toggleDarkMode, setDarkMode } = useDarkMode();

// Or use the pre-built toggle
<DarkModeToggle />
```

**Features:**
- Automatic persistence to localStorage
- System preference detection
- Smooth transitions
- CSS variable-based theming

## Component Showcase

Visit `/design` to see all components in action with interactive examples.

#### Avatar
User profile images with fallbacks and grouping.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui/avatar';

<Avatar src="/user.jpg" alt="User" fallback="U" size="md" />

<AvatarGroup max={3}>
  <Avatar src="/user1.jpg" alt="User 1" />
  <Avatar src="/user2.jpg" alt="User 2" />
  <Avatar src="/user3.jpg" alt="User 3" />
</AvatarGroup>
```

**Sizes:** `sm`, `md`, `lg`, `xl`
**Features:**
- Automatic fallback to initials
- Image error handling
- Avatar grouping with overflow count
- Ring styling for groups

#### Skeleton
Loading placeholders for content.

```tsx
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

<Skeleton variant="text" lines={3} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />

<SkeletonCard hasAvatar lines={4} />
```

**Variants:** `text`, `circular`, `rectangular`
**Features:**
- Animated pulse effect
- Multi-line text skeletons
- Pre-built card skeleton
- Customizable dimensions

#### Empty State
Placeholder for empty data states.

```tsx
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state';

<EmptyState
  icon={<EmptyStateIcons.NoData />}
  title="No data available"
  description="Get started by adding your first item."
  action={<Button>Add Item</Button>}
/>
```

**Built-in Icons:** `NoData`, `NoResults`, `NoContent`, `Error`
**Features:**
- Customizable icon, title, description
- Optional action button
- Centered layout with proper spacing

#### Command Palette
Keyboard-driven command launcher (Cmd/Ctrl+K).

```tsx
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette';

const items = [
  {
    id: 'home',
    label: 'Go to Home',
    description: 'Navigate to homepage',
    onSelect: () => navigate('/'),
    keywords: ['home', 'dashboard'],
  },
];

<CommandPalette items={items} />
```

**Features:**
- Cmd/Ctrl+K keyboard shortcut
- Fuzzy search with keyword matching
- Keyboard navigation (arrows, enter, escape)
- Icon support for items
- Auto-focus search input

## Next Steps

- [x] Add Tooltip component
- [x] Add Dropdown/Popover component
- [x] Add Accordion component
- [x] Add Progress Bar component
- [x] Create component showcase page at `/design`
- [x] Add dark mode toggle
- [x] Add Toast/Notification system
- [x] Add Dialog component (different from Modal)
- [x] Add Breadcrumb component
- [x] Add Pagination component
- [x] Add Avatar component
- [x] Add Skeleton loader component
- [x] Add Empty state component
- [x] Add Command palette (Cmd+K)
- [ ] Set up Storybook (optional)

## Resources

- **Design System**: [docs/design/system.md](../../design/system.md)
- **Tailwind Config**: `apps/web/tailwind.config.ts`
- **Component Source**: `apps/web/components/ui/`
- **Component Showcase**: `/design` route

---

**Version:** 2.5
**Last Updated:** October 2025
**Status:** 100% Complete ✅

### Component Count: 25

**Form (6):** Input, Textarea, Label, Checkbox, Radio, Select
**Action (1):** Button
**Display (3):** Card, Badge, Alert
**Interactive (9):** Modal, Tabs, Spinner, Tooltip, Dropdown, Accordion, Progress, Toast, Dialog
**Navigation (3):** Breadcrumb, Pagination, CommandPalette
**Utility (3):** Avatar/AvatarGroup, Skeleton/SkeletonCard, EmptyState

## Summary

The TogetherOS UI library is now **production-ready** with:
- 25 fully-featured components
- Complete dark mode system
- Comprehensive accessibility support (WCAG AA)
- Full TypeScript coverage
- Interactive showcase at `/design`
- Design system compliance

All components follow the Warm Minimalism design philosophy and include proper ARIA attributes, keyboard navigation, and semantic HTML.
