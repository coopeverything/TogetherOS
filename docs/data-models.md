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

## Feed Module Entities

The Feed module combines social media UX with structured deliberation. Entities support the conversion funnel: scroll → react → discuss → prioritize → vote → act.

### Post

Primary content unit in the feed (native or imported from social media).

```typescript
interface Post {
  id: string                    // UUID
  type: PostType                // 'native' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'other'
  authorId: string              // Member UUID
  groupId?: string              // Optional: scope to group

  // Native post fields
  title?: string                // 10-200 chars (optional for native posts)
  content?: string              // Markdown, 1-5000 chars (native posts only)

  // Import fields
  sourceUrl?: string            // Original social media URL
  sourcePreview?: MediaPreview  // Fetched metadata

  // Shared fields
  topics: string[]              // 1-5 Cooperation Path keywords
  status: PostStatus            // 'active' | 'archived' | 'flagged' | 'hidden'
  discussionThreadId?: string   // Link to forum thread if discussion opened
  discussionCount: number       // # of discussion participants

  createdAt: Date
  updatedAt: Date
}

type PostType = 'native' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'other'
type PostStatus = 'active' | 'archived' | 'flagged' | 'hidden'

interface MediaPreview {
  title: string                 // Post title from source
  description?: string          // Post description
  thumbnailUrl?: string         // Preview image
  authorName?: string           // Original author handle
  platform: string              // 'instagram', 'tiktok', etc.
  embedHtml?: string            // Optional embed code
  fetchedAt: Date
}
```

**Validation:**
- Native posts: `content` required (1-5000 chars), `title` optional (10-200 chars)
- Import posts: `sourceUrl` required (valid URL), `sourcePreview` required
- All posts: `topics` array (1-5 items), `status` valid enum

---

### Reaction

Multi-dimensional engagement beyond simple "likes".

```typescript
interface Reaction {
  id: string                    // UUID
  postId: string                // Can be Post or ThreadPost
  userId: string
  type: ReactionType
  createdAt: Date
}

type ReactionType =
  | 'care'        // This matters to me
  | 'insightful'  // This changed my perspective
  | 'agree'       // I agree with this
  | 'disagree'    // I respectfully disagree
  | 'act'         // I want to take action on this
  | 'question'    // I have questions about this

interface ReactionCounts {
  care: number
  insightful: number
  agree: number
  disagree: number
  act: number
  question: number
  total: number
}
```

---

### DiscussionThread

Forum thread opened from a feed post.

```typescript
interface DiscussionThread {
  id: string                    // UUID
  postId: string                // Original feed post
  title: string                 // Auto-generated or user-provided
  topic: string                 // Primary topic tag
  participantCount: number      // Unique participants
  postCount: number             // Total posts in thread
  createdAt: Date
  lastActivityAt: Date
}
```

---

### ThreadPost

Individual post within a discussion thread.

```typescript
interface ThreadPost {
  id: string                    // UUID
  threadId: string
  authorId: string
  content: string               // Markdown, 1-5000 chars
  parentId?: string             // For nested replies (1 level deep)
  createdAt: Date
  updatedAt: Date
}
```

---

### PostRating

Multi-dimensional quality rating for discussion posts.

```typescript
interface PostRating {
  id: string                    // UUID
  postId: string                // ThreadPost ID
  raterId: string               // User who rated
  language: number              // 1-5: Clarity, grammar
  originality: number           // 1-5: Novel perspective
  tone: number                  // 1-5: Cooperation-conducive
  argument: number              // 1-5: Logical strength
  createdAt: Date
}

interface AggregatedRating {
  postId: string
  ratingCount: number
  averageLanguage: number
  averageOriginality: number
  averageTone: number
  averageArgument: number
  overallScore: number          // Weighted combination
}
```

---

### Priority

User's personal prioritization of topics (private, used by Bridge AI).

```typescript
interface Priority {
  id: string                    // UUID
  userId: string
  topic: string                 // Topic name
  rank: number                  // User's ranking (1 = highest)
  weight: number                // 1-10: How much do you care
  updatedAt: Date
}
```

**Privacy:** Private to user and Bridge AI. Only aggregate statistics are public.

---

### TopicSentiment

Aggregated community sentiment on a topic (anonymous, public).

```typescript
interface TopicSentiment {
  topic: string                 // Topic name
  postCount: number             // Total posts on topic
  participantCount: number      // Unique participants

  // Reaction aggregation
  reactions: ReactionCounts

  // Calculated metrics
  engagementScore: number       // Weighted reaction total
  consensusScore: number        // Agree / (Agree + Disagree)
  actionReadiness: number       // Act reactions / participants

  // Priority aggregation (anonymous)
  averagePriority: number       // Avg user priority rank
  averageWeight: number         // Avg user care weight

  lastUpdated: Date
}
```

**Privacy:** Fully anonymous - no individual data exposed.

---

### Evidence

Supporting evidence attached to viewpoints in discussions.

```typescript
interface Evidence {
  id: string                    // UUID
  postId: string                // ThreadPost ID
  url: string                   // External link
  title: string                 // Link title
  snippet?: string              // Key excerpt
  viewpoint: 'support' | 'oppose' | 'neutral'
  verified: boolean             // Checked by Bridge/moderators
  addedBy: string               // User ID
  createdAt: Date
}
```

---

### UserReputation (Feed Module)

Reputation earned through feed contributions.

```typescript
interface UserReputation {
  userId: string

  // Aggregate scores
  totalPosts: number
  averageLanguageRating: number
  averageOriginalityRating: number
  averageToneRating: number
  averageArgumentRating: number

  // Overall reputation
  reputationScore: number       // Weighted combination

  // Badges earned
  badges: FeedBadge[]

  updatedAt: Date
}

type FeedBadgeType =
  | 'insightful-contributor'    // High originality ratings
  | 'bridge-builder'            // High tone ratings
  | 'original-thinker'          // Unique perspectives
  | 'active-participant'        // High post count
  | 'evidence-supporter'        // Adds quality evidence
  | 'consensus-finder'          // Helps resolve disagreements

interface FeedBadge {
  id: string
  type: FeedBadgeType
  earnedAt: Date
}
```

---

### InterestProfile (Private)

User's interest profile calculated by Bridge AI.

```typescript
interface InterestProfile {
  userId: string
  interests: TopicInterest[]    // Calculated percentages
  lastUpdated: Date
}

interface TopicInterest {
  topic: string
  percentage: number            // Relative interest 0-100
  activityCount: number         // # of interactions
}
```

**Privacy:** VIEW ONLY - users can see their own profile but cannot directly edit. Calculated by Bridge based on reactions, discussion participation, and priorities.

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
