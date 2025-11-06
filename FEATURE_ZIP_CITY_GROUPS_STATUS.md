# ZIP-Based City Groups Implementation Status

**Feature Branch:** `feature/groups-zip-city-groups`
**Date:** 2025-01-06
**Status:** Foundation Complete, Build Fixes Required

## Implemented

### 1. Database Migrations ✅
**File:** `db/migrations/022_add_zip_city_groups_system.sql`

- ✅ User geocoding fields (zip_code, geocoded_city, geocoded_state, latitude, longitude)
- ✅ Group type enum updated (local, national, global)
- ✅ Group tags (JSONB array)
- ✅ Group cooperation_path field
- ✅ City group flags (is_city_group, moderator_count, creator_id)
- ✅ Group moderators table
- ✅ Group members table (replaces JSONB array)
- ✅ New reward event types and badges

### 2. Geocoding Service ✅
**File:** `apps/api/src/modules/geo/services/NominatimService.ts`

- ✅ OpenStreetMap Nominatim integration
- ✅ Rate limiting (1 req/sec for free tier)
- ✅ US ZIP code validation
- ✅ City/state/neighborhood extraction

### 3. TypeScript Types ✅
**Files:**
- `packages/types/src/groups.ts`
- `packages/types/src/rewards.ts`

- ✅ Updated GroupType: local | national | global
- ✅ Added CooperationPath type (8 paths)
- ✅ Extended Group interface with new fields
- ✅ Added GroupModerator and GroupMember interfaces
- ✅ Updated GroupFilters for tag/path search
- ✅ Added group reward event types (group_created, group_joined, city_group_joined)
- ✅ Updated SP_WEIGHTS mapping

### 4. Validator Schemas ✅
**File:** `packages/validators/src/rewards.ts`

- ✅ Added new reward event types to schema
- ✅ Updated SP weight mapping

### 5. Service Layer ✅
**Files:**
- `apps/api/src/modules/groups/services/CityGroupService.ts`
- `apps/api/src/modules/groups/services/GroupRewardsService.ts`
- `apps/api/src/modules/groups/services/BridgeTagSuggestionService.ts`

- ✅ City group auto-creation logic
- ✅ Moderator assignment (first 5 members)
- ✅ RP rewards integration
- ✅ Badge awarding (Group Founder, Community Builder, City Pioneer)
- ✅ Bridge tag suggestion placeholder

### 6. UI Components ✅
**File:** `packages/ui/src/groups/CreateGroupForm.tsx`

- ✅ Updated group type dropdown (local/national/global)
- ✅ Added cooperation path dropdown (required)
- ✅ Added tags input (0-5 tags with add/remove)
- ✅ Form validation updated

## Incomplete (Build Errors)

### 1. Group Entity Class ❌
**File:** `apps/api/src/modules/groups/entities/Group.ts`

**Issues:**
- Constructor missing new fields: tags, isCityGroup, moderatorCount, cooperationPath
- Factory methods need updating
- Business logic methods need new field handling

**Fix Required:**
```typescript
private constructor(
  // ... existing fields ...
  public readonly tags: ReadonlyArray<string>,
  public readonly cooperationPath: string | undefined,
  public readonly isCityGroup: boolean,
  public readonly moderatorCount: number,
  public readonly creatorId: string | undefined,
  // ... geocoded fields ...
)
```

### 2. Group Fixtures ❌
**File:** `apps/api/src/modules/groups/fixtures/index.ts`

**Issues:**
- Mock groups missing required fields

**Fix Required:**
Add to each mock group:
```typescript
tags: [],
cooperationPath: 'Community Connection',
isCityGroup: false,
moderatorCount: 0,
// ... other new fields ...
```

### 3. Repository Layer ❌
**Files:**
- `apps/api/src/modules/groups/repos/InMemoryGroupRepo.ts`
- `apps/api/src/modules/groups/repos/PostgresGroupRepo.ts`

**Issues:**
- `creatorId` is now optional in CreateGroupInput, but repos expect it to be required
- `mapRowToGroup` needs to include new fields

**Fix Required:**
- Handle optional creatorId (null for system-created city groups)
- Map new database columns to Group entity

### 4. Group Schema Validator ❌
**File:** `packages/validators/src/groups.ts`

**Issues:**
- Schema needs updating to match new Group interface

**Fix Required:**
```typescript
export const groupSchema = z.object({
  // ... existing fields ...
  tags: z.array(z.string()).max(5).default([]),
  cooperationPath: z.string().optional(),
  isCityGroup: z.boolean().default(false),
  moderatorCount: z.number().int().min(0).default(0),
  creatorId: z.string().uuid().optional(),
  // ... geocoded fields ...
})
```

### 5. Web Pages ❌
**File:** `apps/web/app/groups/[id]/page.tsx`

**Issues:**
- References old 'federated' type (now 'global')

**Fix Required:**
Replace all instances of 'federated' with 'global'

## Next Steps

1. **Fix Group Entity** - Update constructor and factory methods
2. **Fix Fixtures** - Add required fields to mock data
3. **Fix Repositories** - Handle optional creatorId, map new fields
4. **Fix Validators** - Update groupSchema
5. **Fix Web Pages** - Replace 'federated' with 'global'
6. **Re-run Build** - Ensure TypeScript compiles
7. **Test Locally** - Verify basic functionality
8. **Commit & Push** - Create PR for bot review

## Testing Notes

Once build passes, test:
- ✅ Group creation form shows new fields
- ✅ Tags can be added/removed
- ✅ Cooperation path dropdown works
- ❌ City group auto-creation (needs full implementation)
- ❌ RP rewards (needs repository integration)
- ❌ Moderator badges (needs repository integration)

## Dependencies

- OpenStreetMap Nominatim API (no API key required)
- Existing reward system infrastructure
- Existing group CRUD handlers

## Rewards Summary

| Event | SP Awarded | Badge |
|-------|-----------|-------|
| Create group (not city) | 15 SP | Group Founder (1st group) |
| Join group (not city) | 3 SP | Community Builder (5+ groups) |
| Join city group | 0 SP | - |
| Become city moderator | 0 SP | City Pioneer badge |

## Design Decisions

1. **ZIP Code Only (US)** - Starting with US ZIP codes, international support later
2. **OpenStreetMap** - Free, no API key, rate-limited to 1 req/sec
3. **First 5 = Moderators** - Auto-grant moderator to first 5 city group members
4. **Cooperation Path Optional for City Groups** - Defaults to "Community Connection"
5. **Tags Limited to 5** - Prevents tag spam
6. **City Groups = No Creator** - System-created, creatorId is null

## Known Issues

- Build currently fails (TypeScript errors)
- Service layer methods are placeholders (commented out repo calls)
- No actual integration with user profile ZIP code input
- Bridge tag suggestion is simple keyword extraction (not LLM)

## Time Estimate to Complete

**Remaining work:** ~2-3 hours
- Fix build errors: 1 hour
- Integration testing: 1 hour
- Bot review fixes: 30 min - 1 hour
