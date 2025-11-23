# Support Points & Reward Points UI Module

## Overview

The Support Points & Reward Points UI module provides member-facing interfaces for TogetherOS's dual points system: Support Points (SP) for signaling priorities on proposals, and Reward Points (RP) for gamification and community growth incentives. It also includes the RP → SP exchange mechanism and admin tracking panels.

**Current Progress:** <!-- progress:support-points-ui=35 --> 35%

**Category:** Social Economy, Cooperative Technology

**Note:** This module extends the existing **Reputation backend** (45% complete) which provides SP database, APIs, and types. This module focuses on UI/UX.

---

## Core Purpose

Enable members to:
- View SP and RP balances in dedicated wallet interfaces
- Allocate Support Points to proposals (max 10 per proposal)
- Track SP allocation history and reclaim from closed proposals
- View Reward Points earnings with action descriptions
- Monitor badge unlock progress and skill tree advancement
- (Admin) Track SP/RP circulation and allocation patterns

**Note:** RP → SP conversion is NOT part of this module (violates anti-plutocracy invariant).

---

## Anti-Plutocracy Invariant (Critical)

**TogetherOS enforces strict separation between governance power and economic benefits.**

### The Invariant

**Support Points (SP) and Reward Points (RP) NEVER intermix.**

| Aspect | Support Points (SP) | Reward Points (RP) |
|--------|---------------------|-------------------|
| **Purpose** | Governance energy (prioritize proposals) | Economic claims (real-world benefits) |
| **Sources** | ONLY non-monetary contributions | Contributions + dues + donations |
| **How Used** | Allocate to proposals (agenda-setting) | Convert to TBC, SH purchase events, perks |
| **Reclaimed** | Yes, when proposals close | No, consumed when spent |
| **Convertible To** | NEVER converts to RP or money | Converts to TBC (throttled), SH (rare events) |
| **Governance Power** | Controls agenda (what gets voted on) | NEVER grants voting power |

### Why This Matters

**Prevents plutocracy:**
- Money/donations → RP ✅ (tangible benefit for financial support)
- Money/donations → SP ❌ (prevents buying governance influence)
- RP → SP conversion ❌ (would allow indirect governance purchase)

**Key Quote (docs/guides/4-ledger-system.md:26):**
> "Money and Reward Points Are Never Support Points. SP comes ONLY from non-monetary contribution events. Why: Prevents buying governance influence."

### For Developers

**This module implements SP wallet UI only.**
- RP wallet UI exists separately (displays earnings, badges)
- RP → TBC conversion belongs in timebank module
- **RP → SP conversion must NEVER be implemented** (violates core invariant)

See `docs/guides/4-ledger-system.md` for complete 4-ledger economic system specification.

---

## Key Concepts

### Support Points (SP) — Priority Signaling

**Purpose:** Non-transferable currency for signaling which proposals matter most to you

**Mechanics:**
- Every member starts with **100 SP**
- Earned through political/governance activities (proposals, moderation quality, facilitation, deliberation)
- **NEVER from code** (code earns RP, not SP - this prevents plutocracy)
- **Max 10 SP per proposal** (anti-whale safeguard)
- **Non-transferable** (cannot gift or sell)
- **Reclaimed** when proposals close (returned to wallet)
- Used to unlock capabilities (e.g., "Unlock governance features after allocating 50 SP")

**Backend Status:** 45% complete
- ✅ Database schema (`support_points_balances`, `support_points_transactions`, `support_points_allocations`)
- ✅ API endpoints (`/api/support-points/*`)
- ✅ SP calculation based on event types
- ❌ UI components (this module)

---

### Reward Points (RP) — Gamification Incentives

**Purpose:** Permanent points earned through community growth actions and quality work

**Mechanics:**
- Starting balance: **100 RP** (if invited by existing member)
- Earned through:
  - Gamification actions (send invitation: +25 RP, invitee joins: +50 RP)
  - Organize first meetup (15+ members): +100 RP
  - Launch working group (50+ members): +150 RP
  - **NEW: Moderation quality score** (see Moderation Transparency module)
- Used to unlock badges and skill tree progression
- **Permanently earned** (not reclaimed)
- Can be converted to SP at configurable exchange rate

**Backend Status:** 15% complete (Gamification module — spec only)
- ❌ RP earning system not implemented
- ❌ Badge system not implemented
- This module designs the RP → SP exchange interface

---

### RP → SP Exchange

**Purpose:** Allow members to convert gamification rewards into governance influence

**Mechanics:**
- **One-way conversion:** RP → SP only (irreversible)
- **Configurable exchange rate:** Set by assembly decision (e.g., 10:1, 20:1)
- **Fraud detection:** Monitor rapid conversions, suspicious patterns
- **Audit trail:** All conversions logged in NDJSON format

**Example:**
- Member has 500 RP
- Exchange rate: 10:1
- Converts 100 RP → 10 SP
- New balances: 400 RP, 110 SP (original 100 + 10)

---

## Key Entities

### SP Wallet (Member View)

```typescript
interface SPWallet {
  memberId: string
  balance: {
    total_earned: number          // All-time SP earned
    available: number             // Not allocated
    allocated: number             // Locked to proposals
  }
  allocations: SPAllocation[]     // Current allocations
  history: SPTransaction[]        // Past transactions
}
```

### SPAllocation (Already Exists in Backend)

```typescript
interface SPAllocation {
  id: string                      // UUID
  memberId: string
  proposalId: string
  amount: number                  // 1-10
  allocatedAt: Date
  status: 'active' | 'reclaimed'
  reclaimedAt?: Date
}
```

### SPTransaction (Already Exists in Backend)

```typescript
interface SPTransaction {
  id: string                      // UUID
  memberId: string
  type: 'earned' | 'allocated' | 'reclaimed'
  amount: number
  sourceType: 'pr_merged' | 'proposal_created' | 'moderation_quality' | 'allocation' | 'reclaim'
  sourceId?: string               // PR ID, proposal ID, etc.
  timestamp: Date
  description: string             // Human-readable
}
```

### RP Wallet (Member View)

```typescript
interface RPWallet {
  memberId: string
  balance: number                 // Current RP
  total_earned: number            // All-time RP (including converted)
  recent_earnings: RPTransaction[] // Last 10 transactions
  badges_unlocked: Badge[]        // Badge progress
  skill_tree_progress: SkillTreeNode[]
}
```

### RPTransaction

```typescript
interface RPTransaction {
  id: string                      // UUID
  memberId: string
  type: 'earned' | 'converted_to_sp'
  amount: number                  // Positive for earn, negative for conversion
  actionType: 'invitation_sent' | 'invitee_joined' | 'meetup_organized' |
              'moderation_quality' | 'working_group_launched' | 'exchange'
  actionId?: string               // Source event ID
  timestamp: Date
  description: string             // Human-readable
}
```

### Note on Reward Points (RP)

**IMPORTANT:** RP and SP are strictly separate ledgers (anti-plutocracy invariant).

- **SP (Support Points)** = Governance energy (agenda-setting, prioritization)
- **RP (Reward Points)** = Economic claims (convert to TBC, SH purchase events)

**RP → SP conversion is NOT ALLOWED** (prevents buying governance influence).

For RP conversion capabilities, see:
- `docs/guides/4-ledger-system.md` (complete economic system)
- Future timebank module (RP → TBC conversion)

---

## Core Features

### Phase 1: SP Wallet & Allocation UI (0% - SPEC ONLY)

#### Features:
- SP wallet dashboard at `/economy/support-points`
- Displays: Total earned, available, allocated
- Allocation history timeline (recent 30 days)
- Filter by: Active allocations, reclaimed, date range
- Embedded allocation widget on proposal pages

#### Proposal Allocation Widget:
- Appears on `/governance/proposals/[id]` page
- Shows member's available SP
- Slider input (0-10 max per proposal)
- Real-time feedback: "This proposal has 450 SP from 67 members"
- Progress bar showing threshold (e.g., "725 SP needed for high priority")
- "Allocate" button → locks SP to proposal
- Confirmation message: "You allocated 8 SP to this proposal"

#### UI Components:
- `SPWalletCard` — Balance display
- `AllocationHistory` — Timeline of past allocations
- `ProposalAllocationWidget` — Embedded on proposal pages
- `AllocationSlider` — 0-10 input with validation

#### UI Routes:
- `/economy/support-points` — SP wallet dashboard
- `/economy/support-points/history` — Full transaction history

#### Implementation:
- [ ] `SPWalletCard` component (uses existing API)
- [ ] `AllocationHistory` component with filters
- [ ] `ProposalAllocationWidget` integration
- [ ] Real-time SP balance updates (websockets or polling)
- [ ] Allocation validation (max 10, sufficient balance)

---

### Phase 2: RP Dashboard & Earnings Tracker (0% - SPEC ONLY)

#### Features:
- RP wallet dashboard at `/economy/reward-points`
- Displays: Current balance, total earned (all-time)
- Recent earnings breakdown (last 10 transactions)
- Badge unlock progress (e.g., "Connector: 3/5 invitations")
- Skill tree visualization (gamification paths)

#### Recent Earnings List:
- Table with columns: Date, Action, Amount, Description
- Example rows:
  - "Jan 10 | Invitation sent | +25 RP | Invited alice@example.com"
  - "Jan 11 | Moderation quality | +15 RP | 4-star avg on 3 actions"
  - "Jan 12 | Invitee joined | +50 RP | alice@example.com accepted"

#### Badge Progress Cards:
- **Connector Badge:** "Invite 5 members" (3/5 complete)
- **Organizer Badge:** "Host 3 meetups" (1/3 complete)
- **Moderator Badge:** "Maintain 4-star avg for 1 month" (In progress)

#### UI Components:
- `RPWalletCard` — Balance and total earned
- `RPEarningsTable` — Recent transactions
- `BadgeProgressCard` — Unlock progress per badge
- `SkillTreeVisualization` — Interactive tree (future)

#### UI Routes:
- `/economy/reward-points` — RP dashboard
- `/economy/reward-points/badges` — Badge collection
- `/economy/reward-points/history` — Full transaction history

#### Implementation:
- [ ] `RPWalletCard` component
- [ ] `RPEarningsTable` with pagination
- [ ] `BadgeProgressCard` component
- [ ] Skill tree data structure (Phase 2 enhancement)
- [ ] Badge unlock notifications

---

### Phase 3: Admin SP/RP Tracking Panels (0% - SPEC ONLY)

#### Admin SP Panel (`/admin/support-points`):

**Features:**
- Community-wide SP circulation stats:
  - Total SP in system
  - Total SP allocated (locked)
  - Total SP available
  - Average SP per member
- Top allocators table (members who signal priorities most):
  - Columns: Member, Total Allocated, Active Allocations, Last Allocation
  - Example: "Alice | 50 SP | 5 proposals | Jan 10"
- Allocation audit log:
  - All SP allocations across community
  - Filter by: Member, proposal, date range
- Export functionality (CSV, JSON)

**UI Route:** `/admin/support-points`

**Access Control:** Coordinators and admins only

#### Admin RP Panel (`/admin/reward-points`):

**Features:**
- Community-wide RP stats:
  - Total RP earned (all-time)
  - Total RP converted to SP
  - Average RP per member
  - RP earning velocity (per week/month)
- Top earners table:
  - Columns: Member, Total Earned, Converted, Balance
  - Example: "Bob | 850 RP | 200 RP | 650 RP"
- RP earning sources breakdown:
  - Pie chart: Invitations (35%), Moderation (25%), Meetups (20%), etc.
- Fraud detection alerts:
  - Members with suspicious conversion patterns
  - Rapid earning spikes (possible exploit)

**UI Route:** `/admin/reward-points`

**Access Control:** Coordinators and admins only

#### Implementation:
- [ ] Admin SP panel with aggregate queries
- [ ] Top allocators ranking algorithm
- [ ] Admin RP panel with earning breakdown
- [ ] RP earning source breakdown visualization
- [ ] Export functionality (CSV/JSON)

**Note:** RP conversion features (RP → TBC) belong in the timebank module, not here.

---

## User Journeys

### Journey 1: Member Allocates SP to Proposal

**Actor:** Alice, community member

**Steps:**
1. Navigate to `/governance/proposals/42` ("Community Garden Budget")
2. Read proposal details
3. See allocation widget: "You have 85 SP available"
4. Move slider to 8 SP
5. Widget shows: "This proposal will have 458 SP (from 68 members) if you allocate"
6. Click "Allocate"
7. Confirmation modal: "Allocate 8 SP to this proposal? You can reclaim when it closes."
8. Click "Confirm"
9. System:
   - Deducts 8 SP from available balance (85 → 77)
   - Creates `SPAllocation` record (status: active)
   - Logs transaction: `type: 'allocated'`
10. Success message: "You allocated 8 SP to this proposal"
11. Proposal priority recalculated (458 SP → High Priority)

**Outcome:** Alice's SP locked to proposal, proposal priority increased

---

## Validation Rules

### SP Allocation

```typescript
import { z } from 'zod'

export const allocateSPSchema = z.object({
  proposalId: z.string().uuid(),
  amount: z.number()
    .int()
    .min(1, 'Minimum 1 SP')
    .max(10, 'Maximum 10 SP per proposal'),
}).refine(async (data) => {
  // Check if member has sufficient available balance
  const wallet = await getSPWallet(memberId)
  return wallet.balance.available >= data.amount
}, {
  message: 'Insufficient available SP',
}).refine(async (data) => {
  // Check if already allocated to this proposal
  const existing = await getSPAllocation(memberId, data.proposalId)
  return !existing || existing.status === 'reclaimed'
}, {
  message: 'Already allocated to this proposal',
})
```

---

## API Endpoints (tRPC)

```typescript
// apps/api/src/trpc/routers/support-points-ui.ts
export const supportPointsUIRouter = router({
  // Get member's SP wallet
  getSPWallet: protectedProcedure
    .query(async ({ ctx }) => {
      const balance = await ctx.repos.supportPoints.getBalance(ctx.session.userId)
      const allocations = await ctx.repos.supportPoints.getAllocations(ctx.session.userId)
      const history = await ctx.repos.supportPoints.getTransactions(ctx.session.userId, { limit: 30 })

      return {
        memberId: ctx.session.userId,
        balance: {
          total_earned: balance.total_earned,
          available: balance.available,
          allocated: balance.allocated,
        },
        allocations: allocations.filter(a => a.status === 'active'),
        history,
      }
    }),

  // Allocate SP to proposal
  allocateSP: protectedProcedure
    .input(allocateSPSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.repos.supportPoints.allocate({
        memberId: ctx.session.userId,
        proposalId: input.proposalId,
        amount: input.amount,
      })

      return { allocationId: result.id }
    }),

  // Reclaim SP from closed proposal
  reclaimSP: protectedProcedure
    .input(z.object({ proposalId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.repos.supportPoints.reclaim({
        memberId: ctx.session.userId,
        proposalId: input.proposalId,
      })

      return { reclaimedAmount: result.amount }
    }),
})

// apps/api/src/trpc/routers/reward-points-ui.ts
export const rewardPointsUIRouter = router({
  // Get member's RP wallet
  getRPWallet: protectedProcedure
    .query(async ({ ctx }) => {
      const balance = await ctx.repos.rewardPoints.getBalance(ctx.session.userId)
      const recent_earnings = await ctx.repos.rewardPoints.getTransactions(ctx.session.userId, { limit: 10 })
      const badges = await ctx.repos.badges.getUnlocked(ctx.session.userId)

      return {
        memberId: ctx.session.userId,
        balance: balance.current,
        total_earned: balance.total_earned,
        recent_earnings,
        badges_unlocked: badges,
      }
    }),

  // Note: RP → TBC conversion belongs in timebank module
  // RP → SP conversion is NOT ALLOWED (anti-plutocracy invariant)
})

// apps/api/src/trpc/routers/admin-economy.ts
export const adminEconomyRouter = router({
  // Get SP tracking stats
  getSPStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Coordinator or admin only
      await ctx.services.auth.requireRole(['coordinator', 'admin'])

      const stats = await ctx.repos.supportPoints.getGlobalStats()
      const topAllocators = await ctx.repos.supportPoints.getTopAllocators({ limit: 20 })

      return { stats, topAllocators }
    }),

  // Get RP tracking stats
  getRPStats: protectedProcedure
    .query(async ({ ctx }) => {
      await ctx.services.auth.requireRole(['coordinator', 'admin'])

      const stats = await ctx.repos.rewardPoints.getGlobalStats()
      const topEarners = await ctx.repos.rewardPoints.getTopEarners({ limit: 20 })
      const earningBreakdown = await ctx.repos.rewardPoints.getEarningBreakdown()

      return { stats, topEarners, earningBreakdown }
    }),

  // Note: RP conversion and fraud detection belong in timebank module
})
```

---

## Privacy & Security

### Public Information
- Aggregate SP/RP statistics (total in system, average per member)
- Top allocators/earners (pseudonymized unless opt-in)
- Exchange rate history

### Private Information (Members Only)
- Individual SP/RP balances
- Allocation history
- Conversion history

### Admin Information (Coordinators/Admins Only)
- Detailed member balances
- Fraud detection alerts
- Exchange rate configuration

### Audit Logging
- All SP allocations logged
- All RP conversions logged to NDJSON
- Exchange rate changes logged with decision ID
- Log location: `/logs/economy/actions-YYYY-MM-DD.ndjson`

### Fraud Detection
- Daily conversion limits enforced (1000 RP max)
- Rapid earning spike detection (>1000 RP in 24h)
- Coordinated exchange patterns (multiple accounts converting simultaneously)
- Suspicious invitation patterns (>100 invitations in 24h)

---

## Dependencies

### Required Modules:
- **Reputation** (45%) — SP backend (database, APIs, types)
- **Gamification** (15%) — RP earning system, badges
- **Governance** (0%) — Proposal entity, voting system
- **Auth** (100%) — Session management, role-based access

### Integration Points:
- Listen for `proposal.closed` events to trigger SP reclaim
- Listen for `member.invited`, `meetup.organized` events for RP earning
- Listen for `decision.approved` events for exchange rate changes
- Emit `sp.allocated` events for proposal priority recalculation
- Emit `exchange.completed` events for fraud detection

---

## Implementation Roadmap

### Month 1: SP Wallet UI
- [ ] `SPWalletCard` component
- [ ] `AllocationHistory` component
- [ ] API integration with existing backend
- [ ] Websocket updates for real-time balance

### Month 2: SP Allocation Widget
- [ ] `ProposalAllocationWidget` component
- [ ] `AllocationSlider` with validation
- [ ] Embedded integration on proposal pages
- [ ] Allocation confirmation modal

### Month 3: RP Dashboard
- [ ] `RPWalletCard` component
- [ ] `RPEarningsTable` component
- [ ] `BadgeProgressCard` component
- [ ] Badge unlock notifications

### Month 4: Admin Panels
- [ ] Admin SP tracking panel
- [ ] Admin RP tracking panel
- [ ] RP earning breakdown visualization
- [ ] Export functionality (CSV/JSON)

---

## Success Metrics

### Engagement
- **SP allocation rate:** >60% of members allocate SP to at least 1 proposal per month
- **RP earning diversity:** >50% of RP earned through non-invitation actions
- **Proposal prioritization:** High-SP proposals 2x more likely to get implemented

### System Health
- **Badge unlock rate:** >40% of members unlock at least 1 badge
- **RP earnings consistency:** Stable earning patterns without spikes
- **SP reclaim rate:** >80% of allocated SP eventually reclaimed (proposals closing properly)

### Equity
- **SP distribution:** Gini coefficient <0.4 (fairly distributed)
- **RP earning diversity:** >50% of RP earned through non-invitation actions
- **Governance participation:** SP allocators demographically representative of community

---

## Future Enhancements

### Phase 6: Advanced Features
- Skill tree visualization (interactive graph)
- SP/RP prediction models (forecast earning potential)
- Proposal recommendation engine (based on past allocations)
- Batch allocation (allocate to multiple proposals at once)
- Mobile wallet app (iOS/Android)

### Phase 7: Federation
- Cross-instance SP/RP tracking (read-only, for reputation display)
- Reputation portability (export/import SP/RP balances between instances)
- Note: Each instance maintains strict SP/RP separation (anti-plutocracy invariant)

---

## Related Documentation

- Reputation Module (coming soon) — Backend (45% complete)
- [Gamification Module](./gamification.md) — RP earning system
- [Governance Module](./governance.md) — Proposal prioritization
- [Admin Accountability Module](./admin-accountability.md) — Exchange rate governance
- Social Economy (coming soon) — Economic principles
