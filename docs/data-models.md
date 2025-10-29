# TogetherOS Data Models

## Overview

This document consolidates all **core entity specifications** for TogetherOS. Each entity follows domain-driven design principles with clear interfaces and validation rules.

**Current Phase:** All models are conceptual. Implementation uses **fixture repos** (in-memory) for MVP.

---

## Core Entities

### Group
```typescript
interface Group {
  id: string                    // UUID
  name: string                  // Display name
  handle: string                // Unique, federation-ready (@group@domain.tld)
  type: 'local' | 'thematic' | 'federated'
  description?: string
  location?: string             // City, region
  members: string[]             // Member IDs
  createdAt: Date
  updatedAt: Date
}
```

**Validation:**
- `name`: 3-100 chars
- `handle`: Unique, lowercase, alphanumeric + hyphens, 3-50 chars
- `type`: Required enum

**Repository Interface:**
```typescript
interface GroupRepo {
  create(input: CreateGroupInput): Promise<Group>
  findById(id: string): Promise<Group | null>
  findByHandle(handle: string): Promise<Group | null>
  list(filters: GroupFilters): Promise<Group[]>
  update(id: string, updates: Partial<Group>): Promise<Group>
  delete(id: string): Promise<void>
}
```

---

### Member
```typescript
interface Member {
  id: string                    // UUID
  email: string                 // Private, unique
  handle: string                // Public, unique
  displayName?: string
  bio?: string
  archetypes: Archetype[]       // ['builder', 'community_heart', etc.]
  capabilities: string[]        // Unlocked features
  reputation: MemberReputation
  supportPoints: SupportPointsWallet
  createdAt: Date
  updatedAt: Date
  lastActiveAt?: Date
}

type Archetype = 'builder' | 'community_heart' | 'guided_contributor' | 'steady_cultivator'
```

**Validation:**
- `email`: Valid email format, unique
- `handle`: 3-30 chars, alphanumeric + underscores, unique
- `archetypes`: At least one required

**Privacy:**
- **Public:** `handle`, `displayName`, `bio`, `archetypes`, `reputation`
- **Private:** `email`, `lastActiveAt` (unless member opts in)

---

### Proposal
```typescript
interface Proposal {
  id: string                    // UUID
  groupId: string               // Which group owns this
  authorId: string              // Member who created
  title: string                 // 3-200 chars
  summary: string               // 10-2000 chars
  evidence: Evidence[]          // Research, links, data
  options: Option[]             // Alternatives with trade-offs
  positions: Position[]         // Member stances
  minorityReport?: string       // Objections codified
  status: ProposalStatus
  createdAt: Date
  updatedAt: Date
  decidedAt?: Date
}

type ProposalStatus =
  | 'draft'                     // Being written
  | 'research'                  // Gathering evidence/options
  | 'deliberation'              // Discussion phase
  | 'voting'                    // Decision in progress
  | 'decided'                   // Outcome reached
  | 'delivery'                  // Being implemented
  | 'reviewed'                  // Post-implementation review
  | 'archived'                  // Closed/historical
```

**Validation:**
- `title`: 3-200 chars, required
- `summary`: 10-2000 chars, required
- `status`: Valid enum value
- `evidence`: Array (can be empty)
- `options`: Array (can be empty)

---

### Evidence
```typescript
interface Evidence {
  id: string                    // UUID
  proposalId: string
  type: 'research' | 'data' | 'expert' | 'precedent'
  title: string                 // 3-100 chars
  url?: string                  // Valid URL or null
  summary: string               // 10-500 chars
  attachedBy: string            // Member ID
  attachedAt: Date
}
```

---

### Option
```typescript
interface Option {
  id: string                    // UUID
  proposalId: string
  title: string                 // 3-100 chars
  description: string           // 10-1000 chars
  tradeoffs: Tradeoff[]
  estimatedCost?: number        // In local currency or SP
  estimatedTime?: string        // e.g., "3 months"
  proposedBy: string            // Member ID
  proposedAt: Date
}

interface Tradeoff {
  aspect: string                // e.g., "Cost", "Time", "Impact"
  pro: string                   // What's good
  con: string                   // What's challenging
}
```

---

### Position
```typescript
interface Position {
  id: string                    // UUID
  proposalId: string
  memberId: string
  stance: 'support' | 'oppose' | 'abstain' | 'block'
  reasoning: string             // 10-500 chars
  isMinority: boolean           // Flagged for preservation
  recordedAt: Date
}
```

**Validation:**
- `stance`: Required enum
- `reasoning`: Required if `stance` is 'oppose' or 'block'
- `isMinority`: Auto-computed based on vote outcome

---

### Decision
```typescript
interface Decision {
  id: string                    // UUID
  proposalId: string
  method: 'approval' | 'ranked_choice' | 'consent'
  quorum: number                // Required participation (%)
  threshold: number             // % needed to pass
  outcome: 'approved' | 'rejected' | 'amended'
  votes: Vote[]
  minorityReport?: string       // Preserved objections
  challengeWindow: Date         // Appeals deadline
  decidedAt: Date
}

interface Vote {
  memberId: string
  choice: string | string[]     // Depends on method
  weight: number                // Usually 1, could be role-based
  castAt: Date
}
```

---

### Initiative
```typescript
interface Initiative {
  id: string                    // UUID
  decisionId: string            // Links to approved proposal
  title: string
  tasks: Task[]
  owners: string[]              // Member IDs
  milestones: Milestone[]
  proofs: Proof[]               // Delivery artifacts
  status: 'planned' | 'in_progress' | 'delivered' | 'reviewed'
  createdAt: Date
  completedAt?: Date
}

interface Task {
  id: string
  title: string
  description: string
  assignee?: string             // Member ID
  status: 'todo' | 'in_progress' | 'done'
  dueDate?: Date
}

interface Milestone {
  id: string
  title: string
  targetDate: Date
  completed: boolean
  completedAt?: Date
}

interface Proof {
  id: string
  type: 'pr_link' | 'commit_id' | 'report' | 'metric'
  url?: string
  description: string
  timestamp: Date
}
```

---

## Social Economy Models

### SupportPointsWallet
```typescript
interface SupportPointsWallet {
  memberId: string
  total: number                 // Current balance
  allocated: number             // Locked in active proposals
  earned: number                // From contributions
  history: SPTransaction[]
}

interface SPTransaction {
  id: string                    // UUID
  memberId: string
  type: 'allocate' | 'reclaim' | 'earn' | 'initial'
  amount: number                // Positive or negative
  targetId?: string             // Proposal/initiative ID
  timestamp: Date
  reason?: string
}
```

**Rules:**
- All members start with 100 SP
- Max 10 SP per idea
- Allocated SP locked until proposal closes
- Earning SP: Complete initiatives, helpful actions

---

### MutualAidRequest
```typescript
interface MutualAidRequest {
  id: string                    // UUID
  groupId: string
  requesterId: string           // Member ID
  category: 'material' | 'time' | 'skill' | 'space'
  title: string                 // 3-100 chars
  description: string           // 10-500 chars
  urgency: 'low' | 'medium' | 'high'
  location?: string
  neededBy?: Date
  status: 'open' | 'matched' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

---

### MutualAidOffer
```typescript
interface MutualAidOffer {
  id: string                    // UUID
  requestId: string
  offererId: string             // Member ID
  message: string               // 10-500 chars
  availability: string          // e.g., "Saturday 2-4pm"
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: Date
}
```

---

### MutualAidTransaction
```typescript
interface MutualAidTransaction {
  id: string                    // UUID
  requestId: string
  offererId: string
  requesterId: string
  confirmedBy: string[]         // Both IDs when complete
  completedAt?: Date
  rating?: number               // 1-5 stars
  feedback?: string             // Optional text
}
```

---

### TimeBankAccount
```typescript
interface TimeBankAccount {
  memberId: string
  balance: number               // Current time credits
  earned: number                // Total earned (all time)
  spent: number                 // Total spent (all time)
  transactions: TimeBankTransaction[]
}

interface TimeBankTransaction {
  id: string                    // UUID
  fromId: string                // Service provider
  toId: string                  // Service receiver
  hours: number                 // Decimal (e.g., 2.5)
  service: string               // Description (e.g., "Car repair")
  confirmedBy: string[]         // Both parties
  timestamp: Date
}
```

---

### FairExchangeIndex
```typescript
interface FairExchangeIndex {
  memberId: string
  balance: number               // Current time credits
  earnedLast6Mo: number         // Hours provided
  spentLast6Mo: number          // Hours received
  ratio: number                 // spent / earned
  alert: boolean                // True if ratio > 2.0
  message?: string              // Nudge message if imbalanced
}
```

**Rules:**
- Alert triggered if `ratio > 2.0` (taking 2x more than giving)
- Nudge: "Consider offering a service to balance your exchange"
- Not punitive, just informational

---

### CollectivePurchase
```typescript
interface CollectivePurchase {
  id: string                    // UUID
  groupId: string
  coordinatorId: string         // Organizer
  item: string                  // What's being purchased
  supplier?: string             // Vendor name
  quantity: number              // Total needed
  unit: string                  // lbs, units, etc.
  pricePerUnit: number
  threshold: number             // Min participants to proceed
  deadline: Date
  status: 'open' | 'threshold_met' | 'ordered' | 'delivered' | 'cancelled'
  participants: PurchaseParticipant[]
  createdAt: Date
}

interface PurchaseParticipant {
  memberId: string
  quantity: number              // Amount they want
  price: number                 // May vary (solidarity pricing)
  paid: boolean
  pickedUp: boolean
}
```

---

### SocialHorizonWallet (Placeholder)
```typescript
interface SocialHorizonWallet {
  memberId: string
  balance: number               // SH tokens
  staked: number                // Long-term locked
  earned: number                // From verified contributions
  spent: number                 // Total spent
  transactions: SHTransaction[]
}

interface SHTransaction {
  id: string                    // UUID
  fromId: string
  toId: string
  amount: number
  type: 'contribution_reward' | 'purchase' | 'grant' | 'treasury_distribution'
  metadata: Record<string, any>
  timestamp: Date
}
```

**Status:** Conceptual design only. Implementation TBD.

---

## Bridge AI Models

### BridgeQuery
```typescript
interface BridgeQuery {
  id: string                    // UUID
  question: string              // User's question
  questionHash: string          // SHA-256 for privacy
  answer: string                // Generated response
  sources: Source[]             // Citations
  disclaimer: string            // Standard warning
  ipHash: string                // Anonymized
  timestamp: Date
}

interface Source {
  path: string                  // Relative to repo root
  lines: number[]               // Line ranges cited
}
```

---

### BridgeSummary
```typescript
interface BridgeSummary {
  id: string                    // UUID
  threadId: string              // Forum topic or discussion
  summary: string               // Structured markdown
  tags: string[]                // e.g., ["type:increment", "size:S"]
  links: string[]               // Relevant URLs
  sources: Source[]             // Citations
  disclaimer: string            // Standard warning
  generatedAt: Date
}
```

---

### BridgeLogEntry (NDJSON)
```typescript
interface BridgeLogEntry {
  id: string                    // UUID
  timestamp: string             // ISO 8601
  event_type: 'qa' | 'tidy' | 'moderation'
  metadata: {
    question_hash?: string      // SHA-256
    answer_length?: number
    sources?: Source[]
    ip_hash?: string            // SHA-256
    [key: string]: any
  }
  content_hash?: string         // SHA-256 for integrity
}
```

**Storage:** `logs/bridge/actions-YYYY-MM-DD.ndjson`

**Validation:** Last line must parse as valid JSON with required fields

---

## Reputation & Gamification

### MemberReputation
```typescript
interface MemberReputation {
  memberId: string
  badges: Badge[]
  contributions: Contribution[]
  mutualAidScore: number        // 0-100
  governanceScore: number       // 0-100
  overallScore: number          // Composite
}
```

---

### Badge
```typescript
interface Badge {
  id: string                    // UUID
  name: string                  // "Gardener", "Code Contributor"
  description: string
  icon: string                  // URL or emoji
  earnedAt: Date
  criteria: string              // How it's earned
}
```

---

### Contribution
```typescript
interface Contribution {
  id: string                    // UUID
  memberId: string
  type: 'code' | 'docs' | 'organizing' | 'mutual_aid' | 'proposal'
  title: string
  description: string
  verifiedBy?: string[]         // Member IDs who verified
  timestamp: Date
}
```

---

### MemberPath
```typescript
interface MemberPath {
  memberId: string
  primaryPath: 'builder' | 'community_heart' | 'guided_contributor' | 'steady_cultivator'
  secondaryPaths: string[]      // Additional paths
  skillTree: SkillNode[]
  level: number                 // Based on contributions
  visualState: 'seed' | 'seedling' | 'young_tree' | 'majestic_tree'
}

interface SkillNode {
  id: string                    // UUID
  name: string                  // "First PR Merged"
  description: string
  path: string                  // Which archetype path
  unlocked: boolean
  unlockedAt?: Date
  requirements: string[]        // Prerequisites
}
```

---

## Events & Community

### Event
```typescript
interface Event {
  id: string                    // UUID
  groupId: string
  organizerId: string           // Member ID
  title: string                 // 3-100 chars
  description: string           // 10-2000 chars
  location: string              // Address or "Virtual"
  startDate: Date
  endDate: Date
  attendees: string[]           // Member IDs
  skills: string[]              // Skill exchange tags
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
}
```

---

### Transaction (Universal)
```typescript
interface Transaction {
  id: string                    // UUID
  type: 'support_points' | 'timebank' | 'treasury' | 'mutual_aid'
  fromId: string                // Member or Group ID
  toId: string                  // Member or Group ID
  amount: number
  currency: 'SP' | 'time' | 'SH' | 'USD'
  metadata: Record<string, any>
  timestamp: Date
}
```

**Purpose:** Unified transaction log across all economic activities

---

## Federation Models (Future)

### FederatedGroup
```typescript
interface FederatedGroup {
  handle: string                // @groupname@domain.tld
  homeInstance: string          // Domain
  publicKey: string             // For signatures
  protocols: string[]           // Supported federation features
  lastSyncedAt?: Date
}
```

---

### FederatedProposal
```typescript
interface FederatedProposal {
  localId: string               // Local proposal ID
  remoteId: string              // Remote proposal ID
  remoteInstance: string        // Domain
  syncedAt: Date
  status: 'synced' | 'diverged' | 'conflict'
}
```

---

## Validation Schemas (Zod Examples)

### Proposal Creation
```typescript
import { z } from 'zod'

export const createProposalSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(2000),
  authorId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
})

export type CreateProposalInput = z.infer<typeof createProposalSchema>
```

### Member Profile Update
```typescript
export const updateMemberSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  archetypes: z.array(z.enum(['builder', 'community_heart', 'guided_contributor', 'steady_cultivator'])).optional(),
})

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
```

---

## Fixture Examples

### Proposal Fixtures
```json
{
  "proposals": [
    {
      "id": "prop-1",
      "groupId": "group-boston",
      "authorId": "member-alice",
      "title": "Community garden in Central Park",
      "summary": "Convert unused northeast corner into shared garden space with raised beds, tool shed, and composting area.",
      "evidence": [],
      "options": [],
      "positions": [],
      "status": "draft",
      "createdAt": "2025-01-10T09:00:00Z",
      "updatedAt": "2025-01-10T09:00:00Z"
    }
  ]
}
```

### Member Fixtures
```json
{
  "members": [
    {
      "id": "member-alice",
      "email": "alice@example.com",
      "handle": "alice_organizer",
      "displayName": "Alice",
      "bio": "Community organizer passionate about local food systems",
      "archetypes": ["community_heart"],
      "capabilities": ["create_proposal", "organize_events"],
      "reputation": {
        "memberId": "member-alice",
        "badges": [],
        "contributions": [],
        "mutualAidScore": 75,
        "governanceScore": 60,
        "overallScore": 68
      },
      "supportPoints": {
        "memberId": "member-alice",
        "total": 100,
        "allocated": 0,
        "earned": 0,
        "history": []
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core principles, workflow
- [Architecture](architecture.md) — Repository pattern, domain-driven design
- [Bridge Module](modules/bridge.md) — Bridge-specific entities
- [Governance Module](modules/governance.md) — Proposal/decision flow
- [Social Economy](modules/social-economy.md) — Economic primitives
