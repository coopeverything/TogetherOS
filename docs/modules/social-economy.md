# Social Economy — Cooperative Economic Primitives

## Overview

TogetherOS enables a **fair social economy** that redirects surplus back to communities through:
- **Support Points** — Non-transferable points to signal priorities
- **Mutual Aid** — Request/offer boards with escrowed confirmations
- **Time-Banking** — Fair-exchange ledger to prevent exploitation
- **Collective Purchasing** — Group buys with transparent bids
- **Social Horizon Currency** — Equitable distribution, anti-whale controls

---

## Support Points

### Mechanics

**Allocation:**
- Every member starts with **100 Support Points (SP)**
- **Max 10 SP per idea/proposal**
- Non-transferable (cannot gift or sell)
- Participation unlocks more points

**Purpose:**
- Signal community priorities
- Unlock capabilities (e.g., create proposals, start initiatives)
- Drive gamification (badges, skill trees)

**Anti-Abuse:**
- Max 10/idea prevents whale behavior
- Allocation history is public
- Reclaim points when proposals close

###Example Flow
```
Alice (100 SP) →
  Allocates 10 SP to "Community Garden"
  Allocates 5 SP to "Farmers Market"
  Allocates 8 SP to "Repair Cafe"
  → Remaining: 77 SP

Community Garden reaches 150 SP threshold → prioritized
Alice's 10 SP locked until delivery or cancellation
```

### Data Model
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

### API Endpoints (Planned)
```typescript
// GET /api/members/:id/support-points
// POST /api/support-points/allocate
// POST /api/support-points/reclaim
```

---

## Mutual Aid

### Mechanics

**Request/Offer Flow:**
1. Member posts **request** (e.g., "Need help moving on Saturday")
2. Other members post **offers** (e.g., "I can help 2-4pm")
3. Requester **accepts** an offer
4. System **escrows** confirmation (both parties confirm completion)
5. **Reputation** updated for both parties

**Categories:**
- Material aid (food, supplies, equipment)
- Time/labor (moving, childcare, repairs)
- Skills/knowledge (tutoring, consulting)
- Space (temporary housing, workspace)

**Safeguards:**
- Escrow prevents one-sided claims
- Reputation visible on profiles
- Abuse reports to moderators
- Fair-exchange index (track imbalances)

### Data Model
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

interface MutualAidOffer {
  id: string
  requestId: string
  offererId: string
  message: string
  availability: string          // e.g., "Saturday 2-4pm"
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: Date
}

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

---

## Time-Banking

### Mechanics

**How It Works:**
- 1 hour of service = 1 time credit
- All hours valued equally (plumber = tutor = gardener)
- Credits stored in member's timebank ledger
- **Fair-exchange index** tracks imbalances to prevent exploitation

**Example:**
```
Bob provides 3 hours of car repair to Alice → Earns 3 credits
Bob uses 2 credits for tutoring from Carol
Bob's balance: 1 credit
```

**Anti-Exploitation:**
- Fair-exchange index: warns if member consistently takes without giving
- Group norms: e.g., "aim for ±10 credits balance over 6 months"
- Transparency: full ledger visible (privacy-aware)

### Data Model
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

interface FairExchangeIndex {
  memberId: string
  balance: number               // Current credits
  earnedLast6Mo: number
  spentLast6Mo: number
  ratio: number                 // spent / earned
  alert: boolean                // True if ratio > 2.0 (taking 2x giving)
}
```

### API Endpoints (Planned)
```typescript
// GET /api/timebank/:memberId
// POST /api/timebank/transactions
// GET /api/timebank/fair-exchange-index/:memberId
```

---

## Collective Purchasing

### Mechanics

**Group Buying Power:**
1. Member proposes bulk purchase (e.g., "100 lbs organic flour")
2. Others commit (e.g., "I'll take 10 lbs")
3. Once threshold met, purchase is made
4. Distribution coordinated
5. Savings shared

**Benefits:**
- Lower prices through bulk discounts
- Support local/ethical producers
- Reduce packaging waste
- Build community connections

**Features:**
- **Transparent bidding:** Suppliers compete openly
- **Solidarity pricing:** Those who can pay more subsidize those who can't
- **Recurring essentials:** Monthly staples (rice, beans, etc.)

### Data Model
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

---

## Social Horizon Currency (SH)

### High-Level Goals

- **Equitable distribution** — Issued based on verified contributions
- **Anti-whale** — Prevent large holders from dominating
- **Pro-contribution** — Reward steady, long-term support
- **Long-term resilience** — Treasury rebalancing toward underserved groups

### Mechanics (Conceptual)

**Issuance:**
- Tied to **verified contributions** (code, organizing, mutual aid)
- Not tradable on speculation markets (by design)
- Staking favors long-term steady support (vs. pump-and-dump)

**Velocity Dampers:**
- Circuit-breakers on abnormal flows
- Stake decay for short-term speculation
- Treasury rebalancing algorithms

**On/Off-Ramps:**
- Transparent with compliance modules
- Communities adopt per jurisdiction
- KYC/AML where legally required (otherwise off by default)

**Cooperative Treasury:**
- Pooled funds invest in member-led projects
- Returns flow to public goods, safety nets, long-term security
- Transparent allocation via governance proposals

### Data Model (Placeholder)
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

interface CooperativeTreasury {
  groupId: string
  totalSH: number
  reserves: number
  allocated: number
  investments: Investment[]
  distributionHistory: Distribution[]
}
```

### Status
**Current:** Conceptual design only
**Phase 1:** Testnet with mock wallet
**Phase 2:** Real integration with compliance modules

---

## Investment Pools & Relief Funds

### Mechanics

**Community Investment Pools:**
- Members contribute to shared fund
- Projects apply for funding
- Governance votes on allocation
- Returns flow back to pool or public goods

**Emergency Relief Funds:**
- Pre-funded safety net
- Fast approval for urgent needs (e.g., medical, housing)
- Transparent beneficiary disclosure
- Risk limits (max % of pool per person)

### Data Model
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

---

## Reputation & Badges

### Reputation System

**How It's Earned:**
- Completing mutual aid transactions
- Delivering on proposals/initiatives
- Contributing code, docs, organizing
- Consistent positive feedback

**How It's Displayed:**
- Profile badge count
- Contribution history (public)
- Skill tags (verified by community)

**NOT Like Traditional "Credit Scores":**
- No single number
- Context-rich (what did they contribute?)
- Focus on positive contributions, not punishments

### Data Model
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

---

## Gamification & Skill Trees

### Archetype Paths

Members choose starting path (fluid, can blend):
1. **Builder** — Code, design, infrastructure
2. **Community Heart** — Organizing, care, connection
3. **Guided Contributor** — Learning, following structured tasks
4. **Steady Cultivator** — Long-term, reliable support

### Skill Trees

Each path has skill tree with badges:
```
Builder Path:
├── First PR Merged
├── 10 PRs Merged
├── Maintainer Status
├── Architecture Contributor
└── Code Reviewer

Community Heart Path:
├── First Mutual Aid
├── 10 Mutual Aids Completed
├── Event Organizer
├── Moderator
└── Steward
```

### Immersive Experience

**Visual Progression:**
- Seed → Seedling → Young Tree → Majestic Tree animations
- 3D globe visualizing live projects and achievements
- **Global-scale RPG aesthetic** — Every node = real people and contactable projects

### Data Model
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

---

## Transparency & Metrics

### Public Dashboards

**What Gets Tracked:**
- Support Points allocation trends
- Mutual aid completion rates
- Timebank balance distribution
- Collective purchase savings
- Treasury flows and investments
- Local value retained

**Privacy Balance:**
- Aggregate data public
- Individual transactions anonymized
- Opt-in for detailed sharing

### Data Model
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

## API Endpoints (Future)

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

## Related KB Files

- [Main KB](./togetheros-kb.md) — Core principles, workflow
- [Architecture](./architecture.md) — Domain-driven design, data patterns
- [Data Models](./data-models.md) — Complete entity specifications
- [Governance Module](./governance-module.md) — How proposals/decisions work
