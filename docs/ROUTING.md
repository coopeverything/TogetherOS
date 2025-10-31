# TogetherOS Routing Conventions

This document describes routing patterns and conventions for the TogetherOS Next.js application.

## Overview

TogetherOS uses **Next.js 14 App Router** with file-based routing. Routes are defined by the file structure in `apps/web/app/`.

## Route Structure

### Basic Routes

Routes map directly to the file system:

```
apps/web/app/
  page.tsx              → /
  about/
    page.tsx            → /about
  profile/
    page.tsx            → /profile
  bridge/
    page.tsx            → /bridge
```

**Rules:**
- `page.tsx` files define routes
- Folder names become URL segments
- Routes are automatically created based on file structure

### Dynamic Routes

Use square brackets for dynamic segments:

```
apps/web/app/
  profile/
    [id]/
      page.tsx          → /profile/:id
  proposals/
    [id]/
      page.tsx          → /proposals/:id
```

**Access params in component:**

```typescript
// app/profile/[id]/page.tsx
export default function ProfilePage({ params }: { params: { id: string } }) {
  return <div>Profile ID: {params.id}</div>
}
```

### Route Groups

Use parentheses to organize routes without affecting URLs:

```
apps/web/app/
  (auth)/
    login/
      page.tsx          → /login
    signup/
      page.tsx          → /signup
  (dashboard)/
    profile/
      page.tsx          → /profile
    settings/
      page.tsx          → /settings
```

Route groups help organize related routes without adding segments to the URL.

### Nested Layouts

Each route can have its own layout:

```
apps/web/app/
  layout.tsx            # Root layout (all pages)
  dashboard/
    layout.tsx          # Dashboard layout (dashboard/* pages)
    page.tsx            → /dashboard
    profile/
      page.tsx          → /dashboard/profile
```

**Layout component:**

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

## Special Files

### page.tsx

Defines the UI for a route:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About TogetherOS</div>
}
```

### layout.tsx

Defines shared UI for a route segment and its children:

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

**Layout characteristics:**
- Preserves state on navigation
- Doesn't re-render on route changes
- Can fetch data
- Can nest infinitely

### loading.tsx

Shows loading UI while route is loading:

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <Skeleton />
    </div>
  )
}
```

### error.tsx

Handles errors in route segments:

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Note:** Error boundaries must be Client Components (`'use client'`)

### not-found.tsx

Shows 404 UI when route doesn't exist:

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404: Page Not Found</h2>
      <Link href="/">Return Home</Link>
    </div>
  )
}
```

## API Routes

API routes are defined in `app/api/`:

```
apps/web/app/
  api/
    auth/
      login/
        route.ts        → POST /api/auth/login
      signup/
        route.ts        → POST /api/auth/signup
    bridge/
      ask/
        route.ts        → POST /api/bridge/ask
```

**API route handler:**

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Handle login logic

  return NextResponse.json({ success: true })
}
```

**Supported methods:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

### API Route Examples

**Simple endpoint:**

```typescript
// app/api/status/route.ts
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

**With request body:**

```typescript
// app/api/user/route.ts
export async function POST(request: Request) {
  const { email, name } = await request.json()

  // Validate and process

  return Response.json({ id: '123', email, name })
}
```

**With dynamic params:**

```typescript
// app/api/user/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserById(params.id)
  return Response.json(user)
}
```

**Streaming response:**

```typescript
// app/api/stream/route.ts
export async function POST(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('Chunk 1\n'))
      controller.enqueue(encoder.encode('Chunk 2\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
```

## Navigation

### Link Component

Use Next.js `Link` for client-side navigation:

```typescript
import Link from 'next/link'

<Link href="/about">About</Link>
<Link href="/profile/123">View Profile</Link>
```

**Benefits:**
- Prefetches routes in viewport
- No full page reload
- Preserves state

### Programmatic Navigation

Use `useRouter` hook for navigation in code:

```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function MyComponent() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard')
  }

  return <button onClick={handleClick}>Go to Dashboard</button>
}
```

**Router methods:**
- `router.push('/path')` - Navigate to route
- `router.replace('/path')` - Replace current route
- `router.back()` - Go back in history
- `router.forward()` - Go forward in history
- `router.refresh()` - Refresh current route

### URL Search Params

Access and modify search params:

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function SearchComponent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query = searchParams.get('q')

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', value)
    router.push(`/search?${params.toString()}`)
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

## Route Conventions

### Module Routes

Each core module has its own top-level route:

```
/bridge          - AI assistant interface
/profile         - User profile
/groups          - Groups and organizations
/forum           - Discussion forums
/proposals       - Governance proposals
/economy         - Social economy features
/search          - Search and discovery
/notifications   - Notification center
```

### Authentication Routes

Auth routes are grouped together:

```
/login           - Sign in
/signup          - Create account
/logout          - Sign out
/onboarding      - New user onboarding
```

### Static Pages

Static informational pages:

```
/about           - About TogetherOS
/design          - Design system showcase
/status          - System status
```

### Nested Resource Routes

Resources with detail views use nested routes:

```
/profile         - Current user profile
/profile/[id]    - View any user's profile
/profile/edit    - Edit profile

/proposals       - List all proposals
/proposals/new   - Create proposal
/proposals/[id]  - View proposal
/proposals/[id]/edit - Edit proposal
```

## Redirects

### Static Redirects

Define in `next.config.js`:

```javascript
module.exports = {
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },
}
```

### Dynamic Redirects

In route handlers or middleware:

```typescript
import { redirect } from 'next/navigation'

export default function MyPage() {
  const isAuthorized = checkAuth()

  if (!isAuthorized) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

## Middleware

Middleware runs before routes are processed:

```typescript
// middleware.ts (at root of app directory)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check auth, log requests, etc.

  if (!request.cookies.get('auth-token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

## Best Practices

### 1. Co-locate Related Files

Keep route components, styles, and utilities together:

```
app/
  profile/
    page.tsx
    ProfileClient.tsx
    profile.module.css
    utils.ts
```

### 2. Use Route Groups for Organization

Group related routes without affecting URLs:

```
app/
  (auth)/
    login/
    signup/
  (admin)/
    users/
    settings/
```

### 3. Leverage Loading and Error States

Always provide loading and error UIs:

```
app/
  proposals/
    page.tsx
    loading.tsx
    error.tsx
```

### 4. Use Layouts for Shared UI

Extract common UI into layouts:

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div>
      <DashboardNav />
      <main>{children}</main>
    </div>
  )
}
```

### 5. Separate Client and Server Logic

Mark client-only components with `'use client'`:

```typescript
'use client'

import { useState } from 'react'

export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 6. Use Meaningful Route Names

Route names should be clear and follow REST conventions:

```
Good:
/proposals/new
/profile/edit
/groups/[id]/members

Avoid:
/create-proposal
/profile-editor
/group-member-list
```

## Current Routes

### Implemented Routes

These routes are currently implemented in TogetherOS:

```
/                    - Home page
/login               - User login
/signup              - User registration
/onboarding          - New user onboarding
/dashboard           - User dashboard
/profile             - User profile
/profile/example     - Example profile
/bridge              - Bridge AI assistant
/design              - Design system showcase
/status              - System status

# Module placeholders (UI only, no functionality)
/groups              - Groups & Organizations
/forum               - Forum & Deliberation
/proposals           - Proposals & Decisions
/economy             - Social Economy
/search              - Search & Discovery
/notifications       - Notifications & Inbox

# API routes
/api/auth/login      - Login endpoint
/api/auth/signup     - Signup endpoint
/api/auth/logout     - Logout endpoint
/api/bridge/ask      - Bridge Q&A endpoint
/api/onboarding/complete - Complete onboarding
/api/profile         - Profile data
/api/status          - Status check
```

### Planned Routes

Routes to be implemented:

```
# Authentication
/reset-password      - Password reset
/verify-email        - Email verification

# Profile
/profile/[id]        - View other user profiles
/profile/settings    - Account settings

# Groups
/groups/new          - Create group
/groups/[id]         - View group
/groups/[id]/join    - Join group

# Proposals
/proposals/new       - Create proposal
/proposals/[id]      - View proposal
/proposals/[id]/vote - Cast vote

# Social Economy
/economy/mutual-aid  - Mutual aid board
/economy/timebank    - Timebank
/economy/marketplace - Fair marketplace

# Admin
/admin/users         - User management
/admin/moderation    - Moderation queue
```

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Last Updated:** 2025-10-30
**Scaffold Progress:** Phase 3 (Documentation)
