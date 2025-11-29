# Groups & Organizations Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/groups.md](../../modules/groups.md).

**Category:** Community Connection, Collective Governance

---

## Implementation Status

### Phase 1: Create & Join Groups (Complete - 30%)

- [x] Group data models and types
- [x] Zod validation schemas
- [x] Fixture repository (in-memory)
- [x] Basic UI components (GroupCard, GroupList)
- [x] Group listing page with filters

### Phase 2: Membership Management (Complete - 60%)

- [x] Member directory per group
- [x] Role assignment/rotation
- [x] Group settings page (admin only)
- [x] Create group form with validation
- [x] Join/leave group functionality

### Phase 3: Resources & Coordination (Complete - 100%)

- [x] Group-level decision making (proposals scoped to groups)
- [x] Event coordination components
- [x] Federation protocol basics
- [x] Federation status display

### Future Enhancements

- [ ] Shared resource pools
- [ ] Inter-group messaging
- [ ] Invite system
- [ ] Member profile within group context
- [ ] Contribution tracking

---

## Data Models

### Group Entity

```typescript
interface Group {
  id: string                    // UUID
  name: string                  // Display name (3-100 chars)
  handle: string                // Unique, federation-ready (@group@domain.tld)
  type: 'local' | 'thematic' | 'federated'
  description?: string          // 10-500 chars
  location?: string             // City, region (for local groups)
  members: string[]             // Member IDs
  roles: GroupRole[]            // Member roles and permissions
  createdAt: Date
  updatedAt: Date
}
```

### GroupRole

```typescript
interface GroupRole {
  id: string                    // UUID
  groupId: string
  memberId: string
  role: 'admin' | 'coordinator' | 'member'
  grantedAt: Date
  expiresAt?: Date              // Optional term limit
  grantedBy: string             // Member ID who granted
  recallable: boolean           // Can be recalled by group
}
```

### GroupMembership

```typescript
interface GroupMembership {
  id: string                    // UUID
  groupId: string
  memberId: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  joinedAt: Date
  contributions: Contribution[] // What they've done
  lastActiveAt?: Date
}
```

---

## Validation Rules

### Group Creation

```typescript
import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  handle: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric + hyphens'),
  type: z.enum(['local', 'thematic', 'federated']),
  description: z.string().min(10).max(500).optional(),
  location: z.string().max(100).optional(),
})
```

**Business Rules:**
- `handle` must be globally unique across instance
- `location` required for `type: 'local'`
- First member automatically becomes `admin`
- Group cannot be deleted if active proposals exist

### Membership

```typescript
export const joinGroupSchema = z.object({
  groupId: z.string().uuid(),
  memberId: z.string().uuid(),
  message: z.string().min(10).max(500).optional(), // Optional intro
})
```

**Business Rules:**
- Member can join max 20 groups (prevent spam)
- Joining requires approval if group is `invite_only`
- Suspended members cannot rejoin for 30 days
- Must be logged in (no anonymous membership)

---

## Repository Interface

```typescript
interface GroupRepo {
  // Create
  create(input: CreateGroupInput): Promise<Group>

  // Read
  findById(id: string): Promise<Group | null>
  findByHandle(handle: string): Promise<Group | null>
  list(filters: GroupFilters): Promise<Group[]>

  // Update
  update(id: string, updates: Partial<Group>): Promise<Group>
  addMember(groupId: string, memberId: string): Promise<void>
  removeMember(groupId: string, memberId: string): Promise<void>

  // Delete
  delete(id: string): Promise<void>
}

interface GroupFilters {
  type?: 'local' | 'thematic' | 'federated'
  location?: string
  memberCount?: { min?: number; max?: number }
  search?: string  // Search name/description
  limit?: number
  offset?: number
}
```

---

## UI Components

### GroupCard

```typescript
interface GroupCardProps {
  group: Group
  showJoinButton?: boolean
  onJoin?: (groupId: string) => void
}
```

**Layout:**
- Group avatar/icon (generated from name)
- Name and handle
- Type badge (Local/Thematic/Federated)
- Member count
- Location (if local)
- Short description (truncated)
- "View Group" or "Join Group" button

### GroupList

```typescript
interface GroupListProps {
  groups: Group[]
  filters?: GroupFilters
  onFilterChange?: (filters: GroupFilters) => void
}
```

**Features:**
- Filter by type, location, search
- Sort by: newest, most members, alphabetical
- Pagination (20 per page)
- Empty state: "No groups found"

### GroupView

```typescript
interface GroupViewProps {
  group: Group
  currentMemberId?: string
  isMember: boolean
}
```

**Sections:**
1. Header: Name, handle, type, member count
2. Description
3. Members grid (avatars + names)
4. Activity feed (recent proposals, events)
5. Actions: Join/Leave, Settings (if admin)

---

## Routes

```
/groups                     → GroupsPage (list all groups)
/groups/new                 → CreateGroupPage
/groups/[id]                → GroupViewPage (detail)
/groups/[id]/settings       → GroupSettingsPage (admin only)
/groups/[id]/members        → GroupMembersPage
```

---

## API Endpoints (tRPC)

```typescript
// apps/api/src/trpc/routers/groups.ts

export const groupsRouter = router({
  // List groups with filters
  list: publicProcedure
    .input(groupFiltersSchema)
    .query(async ({ input, ctx }) => {
      return await ctx.repos.groups.list(input)
    }),

  // Get single group by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const group = await ctx.repos.groups.findById(input.id)
      if (!group) throw new TRPCError({ code: 'NOT_FOUND' })
      return group
    }),

  // Create group (authenticated)
  create: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const group = await ctx.repos.groups.create({
        ...input,
        members: [ctx.session.userId],
      })
      return { id: group.id }
    }),

  // Join group (authenticated)
  join: protectedProcedure
    .input(joinGroupSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.repos.groups.addMember(input.groupId, ctx.session.userId)
      return { success: true }
    }),
})
```

---

## Privacy & Security

### Public Information

- Group name, handle, type
- Description, location
- Member count (not individual members unless member opts in)
- Public proposals/decisions

### Private Information

- Individual member list (visible only to group members)
- Join requests (visible only to admins)
- Internal discussions (group members only)
- Federated groups: each instance controls its own privacy

### Rate Limiting

- Group creation: 5 per user per day
- Join requests: 20 per user per hour
- Member list queries: 100 per hour per IP

---

## Federation Protocol (Future)

### Handle Format

```
@groupname@domain.tld
```

**Examples:**
- `@boston-coop@coopeverything.org`
- `@housing-alliance@coops.boston.ma.us`

### Federated Operations

```typescript
interface FederatedGroupSync {
  localGroupId: string
  remoteGroupHandle: string
  remoteInstance: string
  syncedAt: Date
  operations: ('proposals' | 'events' | 'members')[]
}
```

**Sync Rules:**
- Proposals can be cross-posted with consent
- Events visible to federated members
- Member lists remain local (privacy)
- Decision outcomes published via ActivityPub-style protocol

---

## Initial Fixture Data

Fixture repo includes 5 sample groups:

1. **Boston Cooperative Network** (local) — 24 members, Boston MA
2. **Oakland Tool Library** (local) — 18 members, Oakland CA
3. **Open Source Educators** (thematic) — 42 members, virtual
4. **Climate Adaptation Network** (thematic) — 31 members, virtual
5. **Cooperative Housing Alliance** (federated) — 15 members, 3 instances

---

## Testing Strategy

### Unit Tests

- Entity validation logic
- Repository CRUD operations
- Handle uniqueness checks
- Member count calculations

### Integration Tests

- Create group → Add members → Assign roles
- Join flow with approval
- Filter/search operations
- Pagination edge cases

### E2E Tests (Future)

- Full user journey: signup → create group → invite → accept
- Multi-user role rotation
- Federation handshake

---

## Key Files

```
packages/types/src/groups.ts              # Type definitions
packages/validators/src/groups.ts         # Zod validation schemas
apps/api/src/modules/groups/              # API handlers
apps/web/app/groups/                      # UI routes
packages/ui/src/groups/                   # UI components
packages/fixtures/src/groups.ts           # Fixture data
```

---

## Known Constraints

1. **No nested groups:** Groups cannot contain other groups (keeps model simple)
2. **Single-instance first:** Federation protocol postponed to Phase 3
3. **Fixture-only storage:** No database until MVP validated
4. **Manual approval:** Auto-join not supported initially
5. **20 group limit per user:** Prevents spam, can increase later

---

## Dependencies

### Required Modules

- **Auth & Identity:** User sessions, member IDs
- **Profiles:** Member display names, avatars
- **Proposals:** Group-scoped decision making (60%+)

### Optional Integrations

- **Events:** Group events calendar
- **Social Economy:** Shared resource pools
- **Forum:** Group discussions
- **Gamification:** Milestone tracking, growth progress bars, invitation rewards

---

## Related Documentation

- [Data Models](../../data-models.md) — Group entity spec
- [Architecture](../../architecture.md) — Repository pattern
- [Cooperation Paths](../../cooperation-paths.md) — Community Connection taxonomy
- [Governance Module](./governance-technical.md) — Group-scoped proposals
- [Social Economy](./social-economy-technical.md) — Shared resource coordination
