# Groups & Organizations Module

## Overview

The Groups & Organizations module enables communities to self-organize into cooperative structures with transparent governance, shared resources, and federated capabilities. Groups are the primary unit of coordination in TogetherOS.

**Current Progress:** <!-- progress:groups=100 --> 100%

**Category:** Community Connection, Collective Governance

---

## Core Purpose

Enable members to:
- Create and join local, thematic, or federated groups
- Manage transparent membership and roles
- Coordinate shared resources and decision-making
- Build trust through visible accountability
- Connect with other groups via federation handles

---

## Key Entities

### Group

The primary entity representing a cooperative organization.

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

Rotating, recallable roles with clear accountability.

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

Tracks member participation and contribution history.

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

## Group Types

### Local Groups
- **Geography-based:** Neighborhood, city, region
- **Shared resources:** Physical spaces, tools, time
- **In-person events:** Meetups, workshops, mutual aid
- **Example:** "Boston Cooperative Network", "Oakland Tool Library"

### Thematic Groups
- **Interest-based:** Topic, skill, or cause
- **Virtual-first:** Can span locations accross the globe
- **Focused collaboration:** Specific projects or learning
- **Example:** "Open Source Educators", "Climate Adaptation Network"

### Federated Groups
- **Cross-instance:** Connect groups across TogetherOS instances
- **Shared proposals:** Coordinate multi-group initiatives
- **Decentralized governance:** Each group maintains autonomy
- **Example:** "@coop-housing@boston.coopeverything.org ↔ @housing@portland.coopeverything.org"

---

## Core Features

### Phase 1: Create & Join Groups (30% - COMPLETE)
- [x] Group data models and types
- [x] Zod validation schemas
- [x] Fixture repository (in-memory)
- [x] Basic UI components (GroupCard, GroupList)
- [x] Group listing page with filters
- [ ] Create group form (next)
- [ ] Join group flow (next)

### Phase 2: Membership Management (60% - COMPLETE)
- [x] Member directory per group
- [x] Role assignment/rotation
- [x] Group settings page (admin only)
- [x] Create group form with validation
- [x] Join/leave group functionality
- [ ] Invite system (next)
- [ ] Member profile within group context (next)
- [ ] Contribution tracking (next)

### Phase 3: Resources & Coordination (100% - COMPLETE)
- [x] Group-level decision making (proposals scoped to groups)
- [x] Event coordination components
- [x] Federation protocol basics
- [x] Federation status display
- [ ] Shared resource pools (future enhancement)
- [ ] Inter-group messaging

---

## User Journeys

### Journey 1: Create a Local Group

**Actor:** Alice, community organizer

**Steps:**
1. Navigate to `/groups` → "Create Group"
2. Fill form:
   - Name: "Boston Cooperative Network"
   - Type: Local
   - Location: "Boston, MA"
   - Description: "Building solidarity economy in Greater Boston"
3. Submit → Group created with Alice as first admin
4. Invite initial members via email/handle

**Outcome:** Group page live at `/groups/[id]` with Alice as sole member

---

### Journey 2: Join an Existing Group

**Actor:** Bob, interested member

**Steps:**
1. Browse groups at `/groups`
2. Filter by location → "Boston, MA"
3. See "Boston Cooperative Network" card
4. Click "View Group" → See description, members, activity
5. Click "Request to Join"
6. Admin Alice reviews → Approves
7. Bob receives notification → Can now participate

**Outcome:** Bob is active member, sees group in their profile

---

### Journey 3: Rotate Group Roles

**Actor:** Carol, existing coordinator

**Steps:**
1. Navigate to group settings → "Roles"
2. See current roles: Carol (Coordinator, expires Jan 2026)
3. Click "Nominate Successor"
4. Select member Dave from dropdown
5. Set term: 6 months
6. Submit → Proposal created for group approval
7. After approval → Dave becomes coordinator on Jan 1

**Outcome:** Transparent, time-bound role transition

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

## Initial Fixture Data

Fixture repo will include 5 sample groups:

1. **Boston Cooperative Network** (local)
   - 24 members, Boston MA
   - Focus: Solidarity economy, mutual aid

2. **Oakland Tool Library** (local)
   - 18 members, Oakland CA
   - Focus: Shared tools, repair workshops

3. **Open Source Educators** (thematic)
   - 42 members, virtual
   - Focus: Free software in education

4. **Climate Adaptation Network** (thematic)
   - 31 members, virtual
   - Focus: Community resilience, local action

5. **Cooperative Housing Alliance** (federated)
   - 15 members, federated across 3 instances
   - Focus: Housing coops, legal support

---

## UI Components

### GroupCard

Display-only card for list views.

**Props:**
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

---

### GroupList

Filterable list of groups.

**Props:**
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

---

### GroupView

Detailed group page.

**Props:**
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

## Success Metrics

### 30% Milestone (COMPLETE)
- [x] Data models defined
- [x] Fixtures available
- [x] Basic UI rendering
- [x] Can list groups with filters

### 60% Milestone (COMPLETE)
- [x] Create group flow complete
- [x] Join/leave functionality
- [x] Member directory per group
- [x] Role assignment UI
- [x] Group settings page

### 100% (MVP - COMPLETE)
- [x] Role rotation implemented
- [x] Group-scoped proposals UI
- [x] Federation basics components
- [x] Complete UI component library
- [x] Full type safety
- [x] Comprehensive documentation

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
- **Gamification:** Milestone tracking, growth progress bars, invitation rewards (see `docs/modules/gamification.md`)

---

## Known Constraints

1. **No nested groups:** Groups cannot contain other groups (keeps model simple)
2. **Single-instance first:** Federation protocol postponed to Phase 3
3. **Fixture-only storage:** No database until MVP validated
4. **Manual approval:** Auto-join not supported initially
5. **20 group limit per user:** Prevents spam, can increase later

---

## Next Steps (Implementation Plan)

### For 30% Completion

**Week 1: Data Layer**
1. ✅ Create `packages/types/src/groups.ts`
2. ✅ Create `packages/validators/src/groups.ts`
3. ✅ Create `apps/api/src/modules/groups/entities/Group.ts`
4. ✅ Create `apps/api/src/modules/groups/repos/InMemoryGroupRepo.ts`
5. ✅ Add fixture data to `packages/fixtures/src/groups.ts`

**Week 2: UI Components**
6. ✅ Create `packages/ui/src/groups/GroupCard.tsx`
7. ✅ Create `packages/ui/src/groups/GroupList.tsx`
8. ✅ Update `apps/web/app/groups/page.tsx` with real data

**Week 3: Polish & Validation**
9. [ ] Add filters and search to group list
10. [ ] Run `./scripts/validate.sh`
11. [ ] Update `docs/STATUS_v2.md` to 30%
12. [ ] Open PR with proof lines

---

## References

- [Data Models](../data-models.md) — Group entity spec
- [Architecture](../architecture.md) — Repository pattern
- [Cooperation Paths](../cooperation-paths.md) — Community Connection taxonomy
- [Governance Module](./governance.md) — Group-scoped proposals
- [Social Economy](./social-economy.md) — Shared resource coordination
- [Gamification Module](./gamification.md) — Local community growth tracking, milestones, invitation rewards

---

**Document Status:** Complete
**Last Updated:** 2025-10-30
**Next Review:** After 30% milestone achieved
