# Social Economy Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/social-economy.md](../../modules/social-economy.md).

**Category:** Social Economy, Cooperative Technology

---

## Implementation Status

### Current Progress: 0% (Specification Only)

- [ ] Support Points wallet and allocation
- [ ] Mutual Aid request/offer system
- [ ] Time-Banking ledger
- [ ] Collective Purchasing coordination
- [ ] Investment Pools and Relief Funds
- [ ] Social Horizon Currency (future)

---

## Data Models

### Support Points

#### SupportPointsWallet

```typescript
interface SupportPointsWallet {
  memberId: string
  total: number                 // Current balance
  allocated: number             // Locked in active proposals
  earned: number                // From contributions
  history: SPTransaction[]
}

interface SPTransaction {
  id: string
  memberId: string
  type: 'allocate' | 'reclaim' | 'earn' | 'initial'
  amount: number
  targetId?: string             // Proposal/initiative ID
  timestamp: Date
  reason?: string
}
```

### Mutual Aid

#### MutualAidRequest

```typescript
interface MutualAidRequest {
  id: string
  groupId: string
  requesterId: string
  category: 'material' | 'time' | 'skill' | 'space'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  location?: string
  needed_by?: Date
  status: 'open' | 'matched' | 'completed' | 'cancelled'
  createdAt: Date
}
```

#### MutualAidOffer

```typescript
interface MutualAidOffer {
  id: string
  requestId: string
  offererId: string
  message: string
  availability: string          // e.g., "Saturday 2-4pm"
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: Date
}
```

#### MutualAidTransaction

```typescript
interface MutualAidTransaction {
  id: string
  requestId: string
  offererId: string
  requesterId: string
  confirmedBy: string[]         // Both IDs when complete
  completedAt?: Date
  rating?: number               // 1-5 stars
  feedback?: string
}
```

### Time-Banking

#### TimeBankAccount

```typescript
interface TimeBankAccount {
  memberId: string
  balance: number               // Current time credits
  earned: number                // Total earned
  spent: number                 // Total spent
  transactions: TimeBankTransaction[]
}

interface TimeBankTransaction {
  id: string
  fromId: string                // Service provider
  toId: string                  // Service receiver
  hours: number
  service: string               // Description
  confirmedBy: string[]         // Both parties
  timestamp: Date
}
```

#### FairExchangeIndex

```typescript
interface FairExchangeIndex {
  memberId: string
  balance: number               // Current credits
  earnedLast6Mo: number
  spentLast6Mo: number
  ratio: number                 // spent / earned
  alert: boolean                // True if ratio > 2.0 (taking 2x giving)
}
```

### Collective Purchasing

#### CollectivePurchase

```typescript
interface CollectivePurchase {
  id: string
  groupId: string
  coordinatorId: string
  item: string
  supplier?: string
  quantity: number              // Total needed
  unit: string                  // lbs, units, etc.
  pricePerUnit: number
  threshold: number             // Min participants
  deadline: Date
  status: 'open' | 'threshold_met' | 'ordered' | 'delivered' | 'cancelled'
  participants: PurchaseParticipant[]
  createdAt: Date
}

interface PurchaseParticipant {
  memberId: string
  quantity: number
  price: number                 // May vary (solidarity pricing)
  paid: boolean
  picked_up: boolean
}
```

### Social Horizon Currency (Future)

#### SocialHorizonWallet

```typescript
interface SocialHorizonWallet {
  memberId: string
  balance: number
  staked: number
  earned: number
  spent: number
  transactions: SHTransaction[]
}

interface SHTransaction {
  id: string
  fromId: string
  toId: string
  amount: number
  type: 'contribution_reward' | 'purchase' | 'grant' | 'treasury_distribution'
  metadata: Record<string, any>
  timestamp: Date
}
```

#### CooperativeTreasury

```typescript
interface CooperativeTreasury {
  groupId: string
  totalSH: number
  reserves: number
  allocated: number
  investments: Investment[]
  distributionHistory: Distribution[]
}
```

### Investment Pools & Relief Funds

#### InvestmentPool

```typescript
interface InvestmentPool {
  id: string
  groupId: string
  name: string
  totalFunds: number
  allocated: number
  available: number
  contributors: PoolContributor[]
  investments: Investment[]
  returnPolicy: 'reinvest' | 'distribute' | 'hybrid'
}

interface PoolContributor {
  memberId: string
  amount: number
  share: number                 // % of pool
  joinedAt: Date
}

interface Investment {
  id: string
  poolId: string
  projectId: string
  amount: number
  terms: string                 // Interest rate, timeline
  status: 'pending' | 'active' | 'repaid' | 'defaulted'
  approvedAt: Date
  dueDate?: Date
}
```

#### ReliefFund

```typescript
interface ReliefFund {
  id: string
  groupId: string
  balance: number
  maxPerPerson: number          // e.g., $500
  requests: ReliefRequest[]
}

interface ReliefRequest {
  id: string
  fundId: string
  memberId: string
  amount: number
  reason: string
  urgency: 'critical' | 'high' | 'medium'
  status: 'pending' | 'approved' | 'disbursed' | 'rejected'
  approvedBy?: string[]         // Steward IDs
  submittedAt: Date
}
```

### Reputation & Badges

#### MemberReputation

```typescript
interface MemberReputation {
  memberId: string
  badges: Badge[]
  contributions: Contribution[]
  mutualAidScore: number        // 0-100
  governanceScore: number       // 0-100
  overallScore: number          // Composite
}

interface Badge {
  id: string
  name: string                  // "Gardener", "Code Contributor", "Organizer"
  description: string
  icon: string
  earnedAt: Date
  criteria: string              // How it's earned
}

interface Contribution {
  id: string
  memberId: string
  type: 'code' | 'docs' | 'organizing' | 'mutual_aid' | 'proposal'
  title: string
  description: string
  verifiedBy?: string[]         // Community verification
  timestamp: Date
}
```

### Gamification & Skill Trees

#### MemberPath

```typescript
interface MemberPath {
  memberId: string
  primaryPath: 'builder' | 'community_heart' | 'guided_contributor' | 'steady_cultivator'
  secondaryPaths: string[]
  skillTree: SkillNode[]
  level: number                 // Based on contributions
  visualState: 'seed' | 'seedling' | 'young_tree' | 'majestic_tree'
}

interface SkillNode {
  id: string
  name: string
  description: string
  path: string
  unlocked: boolean
  unlockedAt?: Date
  requirements: string[]        // What's needed to unlock
}
```

### Transparency Metrics

#### EconomyMetrics

```typescript
interface EconomyMetrics {
  groupId: string
  period: string                // e.g., "2025-01"
  supportPointsAllocated: number
  mutualAidTransactions: number
  timeBankHours: number
  collectivePurchaseSavings: number
  socialHorizonCirculation: number
  localValueRetained: number    // $ or %
  memberParticipation: number   // % active
}
```

---

## API Endpoints (Planned)

### Support Points

```typescript
GET    /api/members/:id/support-points
POST   /api/support-points/allocate
POST   /api/support-points/reclaim
GET    /api/proposals/:id/support-points
```

### Mutual Aid

```typescript
GET    /api/mutual-aid/requests
POST   /api/mutual-aid/requests
POST   /api/mutual-aid/offers
POST   /api/mutual-aid/confirm
GET    /api/members/:id/mutual-aid-history
```

### Time-Banking

```typescript
GET    /api/timebank/:memberId
POST   /api/timebank/transactions
GET    /api/timebank/fair-exchange-index/:memberId
POST   /api/timebank/confirm
```

### Collective Purchasing

```typescript
GET    /api/collective-purchases
POST   /api/collective-purchases
POST   /api/collective-purchases/:id/join
POST   /api/collective-purchases/:id/confirm-payment
```

### Social Horizon

```typescript
GET    /api/social-horizon/:memberId/balance
POST   /api/social-horizon/transfer
GET    /api/treasury/balance
GET    /api/treasury/investments
```

---

## Support Points Mechanics

### Allocation Rules

- Every member starts with **100 SP**
- **Max 10 SP per idea/proposal** (prevents whale behavior)
- Non-transferable (cannot gift or sell)
- Participation unlocks more points

### Reclaim Logic

```typescript
// When proposal closes (approved, rejected, or expired)
function reclaimSP(proposalId: string) {
  const allocations = await getAllocations(proposalId)

  for (const allocation of allocations) {
    await updateWallet(allocation.memberId, {
      allocated: wallet.allocated - allocation.amount,
      total: wallet.total + allocation.amount, // Return to available
    })

    await createTransaction({
      memberId: allocation.memberId,
      type: 'reclaim',
      amount: allocation.amount,
      targetId: proposalId,
      reason: `Reclaimed from closed proposal`,
    })
  }
}
```

---

## Fair Exchange Index Calculation

```typescript
function calculateFairExchangeIndex(memberId: string): FairExchangeIndex {
  const sixMonthsAgo = subMonths(new Date(), 6)
  const transactions = await getTransactions(memberId, sixMonthsAgo)

  const earned = transactions
    .filter(t => t.toId !== memberId) // Services provided
    .reduce((sum, t) => sum + t.hours, 0)

  const spent = transactions
    .filter(t => t.toId === memberId) // Services received
    .reduce((sum, t) => sum + t.hours, 0)

  const ratio = earned > 0 ? spent / earned : spent > 0 ? Infinity : 1

  return {
    memberId,
    balance: await getCurrentBalance(memberId),
    earnedLast6Mo: earned,
    spentLast6Mo: spent,
    ratio,
    alert: ratio > 2.0, // Taking 2x what they give
  }
}
```

---

## Anti-Whale Protections

### Support Points

- Max 10 SP per proposal
- Non-transferable
- Allocation history public
- Can only allocate from earned balance

### Social Horizon (Future)

- Circuit-breakers on abnormal flows
- Stake decay for short-term speculation
- Treasury rebalancing algorithms
- Velocity dampers

---

## Privacy Considerations

### Public Information

- Aggregate economic activity
- Community-wide trends
- Anonymous transaction patterns
- SP allocation to proposals (who supported what)

### Private Information

- Individual balances (user controls visibility)
- Specific request/offer details (group members only)
- Individual transaction history (opt-in to share)
- Relief fund request reasons

---

## Integration Points

### Governance Module

- SP allocation to proposals
- Proposal prioritization based on SP totals
- SP reclaim on proposal close

### Gamification Module

- Badges for economic participation
- Skill tree progression from contributions
- Milestone celebrations

### Rewards Module

- RP earning from mutual aid completion
- RP from timebank transactions
- Badge unlocks from economic activity

---

## Skill Trees (Archetype Paths)

### Builder Path

```
├── First PR Merged
├── 10 PRs Merged
├── Maintainer Status
├── Architecture Contributor
└── Code Reviewer
```

### Community Heart Path

```
├── First Mutual Aid
├── 10 Mutual Aids Completed
├── Event Organizer
├── Moderator
└── Steward
```

### Visual Progression

- Seed → Seedling → Young Tree → Majestic Tree animations
- 3D globe visualizing live projects and achievements
- Global-scale RPG aesthetic

---

## Dependencies

### Required Modules

- **Auth** (100%) — User sessions, member IDs
- **Groups** (100%) — Group-scoped economic activity
- **Governance** (60%) — SP allocation to proposals

### Optional Integration

- **Gamification** (15%) — Badges, skill trees
- **Rewards** (100%) — RP earning integration
- **Events** (0%) — Collective purchasing coordination

---

## Related Documentation

- [Support Points UI Module](./support-points-technical.md) — Wallet interfaces
- [Governance Module](./governance-technical.md) — SP allocation to proposals
- [Rewards Module](./rewards-technical.md) — RP earning system
- [Gamification Module](./gamification-technical.md) — Badge and milestone systems
