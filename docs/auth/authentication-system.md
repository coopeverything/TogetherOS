# TogetherOS Authentication & User System

**Version:** 1.0
**Date:** October 28, 2025
**Status:** Ready for Deployment

## Overview

Complete user authentication and onboarding system for TogetherOS, implementing progressive profiling with JWT-based session management, multi-step onboarding, and full CRUD operations for user profiles.

## System Architecture

### Authentication Flow

```
┌─────────────┐
│   Signup    │
│ /signup     │
└──────┬──────┘
       │
       ├─ Create User
       ├─ Create Session (JWT)
       ├─ Set Cookie
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Dashboard  │────▶│  Onboarding  │
│ /dashboard  │     │ /onboarding  │
└─────────────┘     └──────┬───────┘
       ▲                   │
       │                   │
       └───────────────────┘
              (complete)

┌─────────────┐
│    Login    │
│   /login    │
└──────┬──────┘
       │
       ├─ Verify Password
       ├─ Create Session
       ├─ Set Cookie
       │
       ▼
   Dashboard
```

## Components

### 1. Authentication APIs

#### POST /api/auth/signup
**Purpose:** Create new user account and auto-login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "optional_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "timestamp"
  }
}
```

**Sets Cookie:** `session` (HttpOnly, 7-day expiry)

**Behavior:**
- Validates email format
- Checks for existing user
- Hashes password with bcrypt (10 rounds)
- Creates user record
- Generates JWT session token
- Logs signup activity
- Sets session cookie
- Auto-logs user in

#### POST /api/auth/login
**Purpose:** Authenticate existing user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Sets Cookie:** `session` (HttpOnly, 7-day expiry)

**Behavior:**
- Validates credentials
- Verifies password against hash
- Creates new session
- Logs login activity
- Sets session cookie

#### POST /api/auth/logout
**Purpose:** Terminate user session

**Behavior:**
- Deletes session from database
- Clears session cookie
- Returns success response

### 2. Profile Management

#### GET /api/profile
**Purpose:** Get current user profile

**Authentication:** Required (session cookie)

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "username": "username",
    "bio": "User bio",
    "avatar_url": "https://...",
    "city": "City",
    "state": "State",
    "country": "Country",
    "paths": ["education", "technology"],
    "skills": ["JavaScript", "Design"],
    "can_offer": "Web development",
    "seeking_help": "Community organizing"
  }
}
```

#### PATCH /api/profile
**Purpose:** Update user profile

**Authentication:** Required (session cookie)

**Request:**
```json
{
  "name": "New Name",
  "username": "newusername",
  "bio": "Updated bio",
  "avatar_url": "https://...",
  "city": "New City",
  "state": "New State",
  "country": "New Country",
  "paths": ["education", "technology", "community"],
  "skills": ["JavaScript", "Design", "Writing"],
  "can_offer": "Web development and design",
  "seeking_help": "Community organizing help"
}
```

**Validation:**
- Username: 3-50 characters, alphanumeric + underscores/hyphens
- All fields optional
- Auto-updates `updated_at` timestamp

**Error Responses:**
- 400: Invalid username format
- 409: Username already taken
- 401: Unauthorized

### 3. Onboarding

#### POST /api/onboarding/complete
**Purpose:** Mark user onboarding as complete

**Authentication:** Required (session cookie)

**Behavior:**
- Sets `onboarding_completed_at` to current timestamp
- Sets `onboarding_step` to "completed"
- Returns success

## User Pages

### /signup - Signup Page
**Type:** Public page

**Features:**
- Email + optional password signup
- OAuth placeholders (Google, Facebook - coming soon)
- Auto-redirect to dashboard after signup
- Link to login page
- Warm minimalism design
- Cooperative messaging

**Copy:**
- "Welcome to the beginning of something different."
- "Start with just your email. No essays, no commitments."
- "The system we have isn't working. Let's build the one that does."

### /login - Login Page
**Type:** Public page

**Features:**
- Email + password authentication
- OAuth placeholders
- Link to signup page
- Error handling
- Auto-redirect to dashboard

### /dashboard - User Dashboard
**Type:** Protected page (requires authentication)

**Redirect Logic:**
- If not authenticated → `/login`
- If authenticated but not onboarded → `/onboarding`
- If authenticated and onboarded → Show dashboard

**Features:**
1. **Header**
   - Welcome message with user name
   - Profile button
   - Logout button

2. **Stats Section** (4 cards)
   - Active Members: 1,247
   - Open Proposals: 23
   - Mutual Aid Requests: 89
   - Your Paths: X/8

3. **Your Cooperation Paths**
   - Displays active paths with emojis
   - Shows only paths user selected

4. **Explore Cooperation Paths** (8 paths grid)
   - 📚 Collaborative Education
   - 💰 Social Economy
   - 🫶 Common Wellbeing
   - 💻 Cooperative Technology
   - 🏛️ Collective Governance
   - 🤝 Community Connection
   - 🎨 Collaborative Media
   - 🌍 Common Planet
   - Shows "Active" badge for selected paths
   - Color-coded borders

5. **Quick Actions** (4 cards)
   - Edit Profile
   - Browse Proposals
   - Offer Help
   - Learn & Connect

### /profile - User Profile
**Type:** Protected page (requires authentication)

**Modes:**
1. **View Mode**
   - Display avatar (if set)
   - Show all profile information
   - Display cooperation paths as badges
   - Show skills as tags
   - Edit Profile button
   - Dashboard button

2. **Edit Mode**
   - Form inputs for all fields
   - Cooperation paths selector (multi-select grid)
   - Skills input (comma-separated)
   - Save Changes button
   - Cancel button
   - Real-time validation
   - Error messages

**Sections:**
- Basic Info (email, name, username, bio, avatar URL)
- Location (city, state, country)
- Cooperation Paths (multi-select from 8 paths)
- Skills & Interests (skills, can offer, seeking help)

### /onboarding - Onboarding Wizard
**Type:** Protected page (requires authentication)

**Redirect Logic:**
- If not authenticated → `/login`
- If already completed → `/dashboard`

**Features:**
- Progress bar showing completion (4 steps)
- Step indicator
- Back/Continue navigation
- Form validation
- Smooth animations

**Steps:**

**Step 1: Welcome**
- Welcome message
- Project introduction
- "Let's Get Started" button

**Step 2: Name**
- "What should we call you?"
- Name input field
- Explanation that it can be real name or nickname
- Continue disabled until name entered

**Step 3: Cooperation Paths** (Required)
- "Choose Your Paths"
- Grid of 8 paths with:
  - Large emoji
  - Path name
  - Description
  - Checkmark when selected
- Must select at least one path
- Can select multiple

**Step 4: Skills** (Optional)
- "What skills can you share?"
- Skills input (comma-separated)
- "Skip for now" option
- "Complete Setup" button
- Saves all data and redirects to dashboard

## Database Schema

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,

  -- Profile
  name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url TEXT,

  -- Location
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),

  -- Cooperation data
  paths JSONB DEFAULT '[]'::jsonb,
  skills TEXT[],
  can_offer TEXT,
  seeking_help TEXT,

  -- Onboarding
  onboarding_step VARCHAR(50) DEFAULT 'welcome',
  onboarding_completed_at TIMESTAMP,

  -- Auth
  password_hash TEXT,

  -- OAuth (prepared for future)
  google_id VARCHAR(255) UNIQUE,
  facebook_id VARCHAR(255) UNIQUE,
  bluesky_handle VARCHAR(255) UNIQUE,
  mastodon_handle VARCHAR(255) UNIQUE,
  instagram_id VARCHAR(255) UNIQUE,
  oauth_display_name VARCHAR(255),
  oauth_avatar_url TEXT,
  oauth_locale VARCHAR(10),
  oauth_verified BOOLEAN DEFAULT FALSE,
  oauth_raw_profile JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### sessions table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### user_activity table
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Features

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Storage:** Only hash stored, never plaintext
- **Verification:** Constant-time comparison

### Session Management
- **Token Type:** JWT (JSON Web Tokens)
- **Expiry:** 7 days
- **Storage:** Database + HttpOnly cookie
- **Secret:** Environment variable `JWT_SECRET`
- **Cookie Flags:**
  - `httpOnly: true` - Not accessible via JavaScript
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `path: '/'` - Site-wide access

### Protected Routes
- Server-side verification
- Middleware checks session validity
- Auto-redirect to login if unauthorized
- User object available in route handlers

### Input Validation
- Email format validation
- Username format validation (alphanumeric + _-)
- SQL injection prevention (parameterized queries)
- XSS prevention (Next.js automatic escaping)

## Code Structure

### Library Files

**`lib/auth/session.ts`**
- `createSession(userId, email, ip, userAgent)` - Generate JWT and store session
- `verifySession(token)` - Validate JWT and return session data
- `deleteSession(token)` - Remove session from database

**`lib/auth/middleware.ts`**
- `getCurrentUser(request)` - Extract and verify user from request
- `requireAuth(request)` - Throw error if not authenticated

**`lib/db/users.ts`**
- `createUser(email, password)` - Create new user with hashed password
- `findUserByEmail(email)` - Look up user by email
- `findUserById(id)` - Look up user by ID
- `verifyPassword(email, password)` - Authenticate user
- `updateUser(userId, updates)` - Update user profile
- `logActivity(userId, action, metadata)` - Log user action

**`lib/db/index.ts`**
- PostgreSQL connection pooling
- Query execution with logging
- Slow query detection (>100ms)

### File Structure
```
apps/web/app/
├── api/
│   ├── auth/
│   │   ├── signup/route.ts
│   │   ├── login/route.ts
│   │   └── logout/route.ts
│   ├── profile/route.ts
│   └── onboarding/
│       └── complete/route.ts
├── signup/
│   ├── page.tsx
│   └── signup.module.css
├── login/
│   └── page.tsx
├── dashboard/
│   ├── page.tsx (server component)
│   ├── DashboardClient.tsx (client component)
│   └── dashboard.module.css
├── profile/
│   ├── page.tsx (server component)
│   ├── ProfileClient.tsx (client component)
│   └── profile.module.css
└── onboarding/
    ├── page.tsx (server component)
    ├── OnboardingClient.tsx (client component)
    └── onboarding.module.css

lib/
├── auth/
│   ├── session.ts
│   └── middleware.ts
└── db/
    ├── index.ts
    └── users.ts
```

## Environment Variables

Required for deployment:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=togetheros
DB_USER=togetheros_app
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_random_secret_key_min_32_chars

# Node Environment
NODE_ENV=production
```

## Deployment Instructions

### 1. Prerequisites
- PostgreSQL 16+ installed and running
- Node.js 18+ installed
- Database schema applied (`db/schema.sql`)
- Environment variables configured

### 2. Deploy to VPS

```bash
# SSH into VPS
ssh user@coopeverything.org

# Navigate to project directory
cd /var/www/coopeverything.org

# Pull latest changes
git fetch origin
git checkout claude-yolo
git pull origin claude-yolo

# Install dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 restart togetheros
# OR
systemctl restart togetheros
```

### 3. Verify Deployment

```bash
# Check application is running
pm2 status
# OR
systemctl status togetheros

# Check logs for errors
pm2 logs togetheros
# OR
journalctl -u togetheros -f

# Test endpoints
curl https://coopeverything.org/signup
curl https://coopeverything.org/login
```

### 4. Database Verification

```bash
# Connect to database
psql -U togetheros_app -d togetheros

# Verify tables exist
\dt

# Check users table structure
\d users

# Check sessions table
\d sessions
```

## Testing Checklist

### User Registration Flow
- [ ] Visit `/signup`
- [ ] Enter email and password
- [ ] Submit form
- [ ] Verify redirect to `/dashboard`
- [ ] Verify redirect to `/onboarding` (if not completed)
- [ ] Complete onboarding flow
- [ ] Verify redirect to `/dashboard`

### Login Flow
- [ ] Visit `/login`
- [ ] Enter credentials
- [ ] Verify redirect to `/dashboard`
- [ ] Check session cookie is set

### Profile Management
- [ ] Visit `/profile`
- [ ] View profile information
- [ ] Click "Edit Profile"
- [ ] Update fields (name, bio, paths, skills)
- [ ] Save changes
- [ ] Verify changes persisted

### Dashboard
- [ ] View stats cards
- [ ] See active cooperation paths
- [ ] Interact with path explorer
- [ ] Click quick action cards

### Logout
- [ ] Click logout button
- [ ] Verify redirect to `/login`
- [ ] Verify cannot access `/dashboard` without login
- [ ] Verify session cookie cleared

### Security
- [ ] Try accessing `/dashboard` without login → redirects to `/login`
- [ ] Try accessing `/profile` without login → redirects to `/login`
- [ ] Verify session expires after 7 days
- [ ] Verify password is hashed in database
- [ ] Verify session token is JWT format

## Design System

All pages use the TogetherOS Warm Minimalism design system:

**Colors:**
- Brand (Cooperative Green): `#059669` (primary), `#10B981`, `#D1FAE5` (light)
- Joy (Apricot): `#F59E0B` (accent), `#FDBA74`, `#FFF7ED` (light)
- Ink: `#0F172A` (900), `#334155` (700), `#475569` (600), `#94A3B8` (400)
- Background: `#FAFAF9` (bg-0), `#FFFFFF` (bg-1), `#F5F5F4` (bg-2)
- Border: `#E5E7EB`

**Typography:**
- Font family: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, etc.)
- Headings: 700 weight
- Body: 400 weight
- Line height: 1.6-1.7

**Spacing:**
- Consistent use of rem units
- 8px base grid
- Generous padding (2-3rem)

**Components:**
- Rounded corners (0.5-1rem)
- Subtle shadows on hover
- Smooth transitions (0.15s ease-out)
- Mobile-first responsive design

## Future Enhancements

### Phase 2: OAuth Integration
- Google OAuth 2.0
- Facebook Login
- Bluesky authentication
- Mastodon authentication
- Instagram OAuth
- Auto-capture profile data

### Phase 3: Enhanced Features
- Email verification
- Password reset flow
- Two-factor authentication
- Profile picture upload (not just URL)
- Activity feed
- Notifications system

### Phase 4: Social Features
- User search and discovery
- Connection requests
- Direct messaging
- Group creation
- Project collaboration

## Support

**Documentation:** `/docs/auth/`
**Database Schema:** `/db/schema.sql`
**Design System:** `/docs/design/system.md`
**OAuth Mapping:** `/docs/auth/oauth-data-mapping.md`

## Changelog

### Version 1.0 (October 28, 2025)
- ✅ Complete authentication system (signup, login, logout)
- ✅ JWT session management with 7-day expiry
- ✅ Protected routes middleware
- ✅ User dashboard with stats and cooperation paths
- ✅ User profile page (view/edit modes)
- ✅ Multi-step onboarding wizard
- ✅ Progressive profiling strategy
- ✅ Warm minimalism design implementation
- ✅ Mobile responsive design
- ✅ Database schema with OAuth preparation
- ✅ Activity logging
- ✅ Security best practices (bcrypt, HttpOnly cookies, CSRF protection)

---

**Status:** ✅ Ready for Production Deployment
**Branch:** `claude-yolo`
**Last Updated:** October 28, 2025
