# Support Points & Reward Points UI Module

## Overview

The Support Points & Reward Points UI module provides member-facing interfaces for TogetherOS's dual points system: Support Points (SP) for signaling priorities on proposals, and Reward Points (RP) for gamification and community growth incentives. It also includes the RP → SP exchange mechanism and admin tracking panels.

**Current Progress:** <!-- progress:support-points-ui=0 --> 0%

**Category:** Social Economy, Cooperative Technology

**Note:** This module extends the existing **Reputation backend** (45% complete) which provides SP database, APIs, and types. This module focuses on UI/UX.

---

## Core Purpose

Enable members to:
- View SP and RP balances in dedicated wallet interfaces
- Allocate Support Points to proposals (max 10 per proposal)
- Track SP allocation history and reclaim from closed proposals
- View Reward Points earnings with action descriptions
- Convert Reward Points to Support Points at configurable rates
- Monitor badge unlock progress and skill tree advancement
- (Admin) Track SP/RP circulation and allocation patterns

---

## Key Concepts

### Support Points (SP) — Priority Signaling

**Purpose:** Non-transferable currency for signaling which proposals matter most to you

**Mechanics:**
- Every member starts with **100 SP**
- Earned through contributions (PRs, proposals, care work, moderation quality)
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

### RPExchangeTransaction

```typescript
interface RPExchangeTransaction {
  id: string                      // UUID
  memberId: string
  rp_amount: number               // RP deducted
  sp_amount: number               // SP credited
  exchange_rate: number           // Rate at time of conversion
  timestamp: Date
  reversible: false               // Always irreversible
}
```

### ExchangeRateHistory

```typescript
interface ExchangeRateHistory {
  id: string                      // UUID
  old_rate: number
  new_rate: number
  changedBy: string               // Admin member ID
  changedAt: Date
  decisionId: string              // Links to governance decision
  rationale: string               // Why rate changed
}
```

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

### Phase 3: RP → SP Exchange Interface (0% - SPEC ONLY)

#### Features:
- Exchange interface at `/economy/exchange`
- Shows current exchange rate (e.g., "10 RP = 1 SP")
- Input field: "Convert [X] RP → [X/10] SP"
- Real-time calculation display
- Conversion history table (past 30 days)
- Warning: "This conversion is irreversible"

#### Exchange Flow:
1. Member navigates to `/economy/exchange`
2. Sees current rate: "10:1 (last updated Jan 5 by assembly decision)"
3. Enters amount: "100 RP"
4. System calculates: "= 10 SP"
5. Confirms: "Are you sure? This cannot be undone."
6. Member clicks "Convert"
7. System:
   - Deducts 100 RP from RP balance
   - Credits 10 SP to SP balance
   - Creates `RPExchangeTransaction`
   - Logs to NDJSON audit trail
8. Success message: "Converted 100 RP → 10 SP"
9. New balances displayed

#### Conversion History Table:
- Columns: Date, RP Converted, SP Received, Rate
- Example:
  - "Jan 10 | 100 RP | 10 SP | 10:1"
  - "Dec 28 | 50 RP | 5 SP | 10:1"

#### UI Components:
- `ExchangeRateDisplay` — Current rate with last updated date
- `ConversionCalculator` — Input with real-time calculation
- `ConversionHistory` — Past exchanges table
- `ExchangeConfirmationModal` — Warning + confirm button

#### UI Routes:
- `/economy/exchange` — Exchange interface
- `/economy/exchange/history` — Full conversion history

#### Validation Rules:
- Member must have sufficient RP balance
- Minimum conversion: 10 RP (prevents spam)
- Maximum conversion per day: 1000 RP (fraud prevention)
- Rate-limiting: 1 conversion per 5 minutes

#### Implementation:
- [ ] `ExchangeRateDisplay` component
- [ ] `ConversionCalculator` with validation
- [ ] `ConversionHistory` table
- [ ] Confirmation modal with irreversibility warning
- [ ] Rate-limiting middleware
- [ ] Fraud detection alerts (for admins)

---

### Phase 4: Admin SP/RP Tracking Panels (0% - SPEC ONLY)

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

#### Admin Exchange Config (`/admin/economy`):

**Features:**
- Current exchange rate display
- "Change Exchange Rate" button → Opens proposal flow
  - Pre-fills proposal template
  - Links to governance module for voting
  - After approval → Admin implements via settings panel (see Admin Accountability module)
- Exchange rate history table:
  - Columns: Old Rate, New Rate, Changed By, Decision ID, Date
  - Example: "5:1 → 10:1 | Alice | Proposal #89 | Jan 1"
- Exchange activity chart (conversions per week)
- Fraud alerts dashboard:
  - Members exceeding daily limits
  - Suspicious rapid conversions
  - Coordinated exchange patterns (multi-account)

**UI Route:** `/admin/economy`

**Access Control:** Coordinators and admins only

#### Implementation:
- [ ] Admin SP panel with aggregate queries
- [ ] Top allocators ranking algorithm
- [ ] Admin RP panel with earning breakdown
- [ ] Exchange rate configuration UI
- [ ] Fraud detection algorithm
- [ ] Alert notification system
- [ ] Export functionality (CSV/JSON)

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

### Journey 2: Member Converts RP to SP

**Actor:** Bob, active community member (has 500 RP from organizing meetups)

**Steps:**
1. Navigate to `/economy/exchange`
2. See current rate: "10 RP = 1 SP (last updated Jan 5)"
3. See current balances:
   - RP: 500
   - SP: 100 (50 available, 50 allocated)
4. Enter conversion amount: "100 RP"
5. Calculator shows: "= 10 SP"
6. Click "Convert"
7. Warning modal: "This is irreversible. Convert 100 RP → 10 SP?"
8. Click "Confirm"
9. System:
   - Deducts 100 RP (500 → 400)
   - Credits 10 SP (100 → 110, available: 60)
   - Creates `RPExchangeTransaction`
   - Logs to audit trail
10. Success message: "Converted 100 RP → 10 SP"
11. New balances displayed

**Outcome:** Bob has more SP for proposal prioritization

---

### Journey 3: Admin Changes Exchange Rate

**Actor:** Carol, group admin (after assembly vote)

**Steps:**
1. Assembly voted (Proposal #120): "Change RP→SP rate from 10:1 to 20:1"
   - Rationale: "RP too easy to earn, devalues SP governance influence"
   - Result: 68% approval
2. Carol receives notification: "Implement decision: Change exchange rate"
3. Navigate to `/admin/economy`
4. Click "Change Exchange Rate"
5. See current rate: 10:1
6. Enter new rate: 20:1
7. Enter decision ID: "uuid-of-proposal-120"
8. Enter rationale (from proposal): "Rebalance governance influence"
9. Click "Apply Change"
10. System:
    - Updates exchange rate
    - Creates `ExchangeRateHistory` record
    - Logs to implementation audit trail (Admin Accountability module)
11. Success message: "Exchange rate updated to 20:1"
12. All members notified: "Exchange rate changed to 20:1 (effective immediately)"

**Outcome:** Future conversions use 20:1 rate, governance influence rebalanced

---

### Journey 4: Admin Detects Suspicious Conversion Pattern

**Actor:** Dave, platform admin (monitoring fraud alerts)

**Steps:**
1. Navigate to `/admin/economy`
2. See fraud alert: "⚠ User 'eve@example.com' converted 5000 RP → 250 SP in 24 hours"
3. Click alert → View details:
   - 10 conversions (maximum allowed per day: 1000 RP total)
   - Alert triggered because total > fraud threshold
4. Dave investigates:
   - Check Eve's RP earning history
   - See: 5000 RP earned in 2 days from "invitation_sent" (500 invitations!)
   - Likely bot or exploit
5. Dave takes action:
   - Navigate to `/admin/users/[eve-id]`
   - Click "Suspend Account"
   - Enter reason: "Suspicious RP earning pattern, possible exploit"
   - Click "Suspend"
6. System:
   - Revokes Eve's session
   - Freezes RP/SP balances
   - Creates audit log entry
7. Dave reviews invitation system for exploit

**Outcome:** Fraud detected and contained, system integrity maintained

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

### RP → SP Exchange

```typescript
export const exchangeRPSchema = z.object({
  rp_amount: z.number()
    .int()
    .min(10, 'Minimum conversion: 10 RP')
    .max(1000, 'Maximum conversion per day: 1000 RP'),
}).refine(async (data) => {
  // Check if member has sufficient RP balance
  const wallet = await getRPWallet(memberId)
  return wallet.balance >= data.rp_amount
}, {
  message: 'Insufficient RP balance',
}).refine(async (data) => {
  // Check daily conversion limit
  const today_conversions = await getTodayConversions(memberId)
  const total_today = today_conversions.reduce((sum, c) => sum + c.rp_amount, 0)
  return (total_today + data.rp_amount) <= 1000
}, {
  message: 'Daily conversion limit exceeded (1000 RP max)',
})
```

### Exchange Rate Change (Admin)

```typescript
export const changeExchangeRateSchema = z.object({
  new_rate: z.number()
    .positive()
    .min(1, 'Rate must be at least 1:1')
    .max(100, 'Rate cannot exceed 100:1'),
  decisionId: z.string().uuid({ message: 'Assembly decision required' }),
  rationale: z.string().min(10).max(500),
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

  // Convert RP to SP
  convertRPtoSP: protectedProcedure
    .input(exchangeRPSchema)
    .mutation(async ({ input, ctx }) => {
      const rate = await ctx.repos.exchangeRates.getCurrent()
      const sp_amount = Math.floor(input.rp_amount / rate.value)

      // Deduct RP
      await ctx.repos.rewardPoints.deduct({
        memberId: ctx.session.userId,
        amount: input.rp_amount,
        reason: 'exchange',
      })

      // Credit SP
      await ctx.repos.supportPoints.credit({
        memberId: ctx.session.userId,
        amount: sp_amount,
        sourceType: 'rp_exchange',
      })

      // Log exchange
      await ctx.repos.rpExchanges.create({
        memberId: ctx.session.userId,
        rp_amount: input.rp_amount,
        sp_amount,
        exchange_rate: rate.value,
        timestamp: new Date(),
      })

      return { rp_deducted: input.rp_amount, sp_credited: sp_amount }
    }),

  // Get conversion history
  getConversionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ input, ctx }) => {
      return await ctx.repos.rpExchanges.getHistory(ctx.session.userId, { limit: input.limit })
    }),
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

  // Change exchange rate (requires decision)
  changeExchangeRate: protectedProcedure
    .input(changeExchangeRateSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireRole(['admin'])

      const oldRate = await ctx.repos.exchangeRates.getCurrent()

      await ctx.repos.exchangeRates.update(input.new_rate)

      await ctx.repos.exchangeRateHistory.create({
        old_rate: oldRate.value,
        new_rate: input.new_rate,
        changedBy: ctx.session.userId,
        changedAt: new Date(),
        decisionId: input.decisionId,
        rationale: input.rationale,
      })

      return { success: true, new_rate: input.new_rate }
    }),

  // Get fraud alerts
  getFraudAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      await ctx.services.auth.requireRole(['admin'])

      return await ctx.services.fraudDetection.getAlerts({
        types: ['excessive_conversion', 'rapid_earning', 'coordinated_exchange'],
        status: 'unresolved',
      })
    }),
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

### Month 4: RP → SP Exchange
- [ ] `ExchangeRateDisplay` component
- [ ] `ConversionCalculator` with validation
- [ ] `ConversionHistory` table
- [ ] Rate-limiting middleware
- [ ] Fraud detection algorithm

### Month 5: Admin Panels
- [ ] Admin SP tracking panel
- [ ] Admin RP tracking panel
- [ ] Exchange rate configuration UI
- [ ] Fraud alerts dashboard
- [ ] Export functionality

---

## Success Metrics

### Engagement
- **SP allocation rate:** >60% of members allocate SP to at least 1 proposal per month
- **RP conversion rate:** 10-20% of earned RP converted to SP (indicates healthy exchange)
- **Proposal prioritization:** High-SP proposals 2x more likely to get implemented

### System Health
- **Fraud detection rate:** <1% of conversions flagged as suspicious
- **Exchange rate stability:** Changes <2x per year (indicates balanced system)
- **Badge unlock rate:** >40% of members unlock at least 1 badge

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
- Cross-instance SP/RP tracking
- Federated exchange rates (different rates per instance)
- Reputation portability (export/import SP/RP between instances)

---

## Related Documentation

- Reputation Module (coming soon) — Backend (45% complete)
- [Gamification Module](./gamification.md) — RP earning system
- [Governance Module](./governance.md) — Proposal prioritization
- [Admin Accountability Module](./admin-accountability.md) — Exchange rate governance
- Social Economy (coming soon) — Economic principles
