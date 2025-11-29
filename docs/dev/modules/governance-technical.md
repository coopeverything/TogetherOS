# Governance Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/governance.md](../../modules/governance.md).

**Labels:** `module:governance`

---

## Implementation Status

### Completed (100%)

**Support Points Integration**
- ProposalAllocationWidget integrated in proposal view pages
- Members can allocate SP to prioritize proposals
- SP reclaim functionality for changing allocations
- All API parameters correctly mapped (targetType/targetId pattern)

**PostgreSQL Persistence Layer**
- 5 database modules in `packages/db/src/`:
  - `proposals.ts` — Core CRUD operations with type conversion (snake_case ↔ camelCase)
  - `proposal-evidence.ts` — Evidence attachment and listing
  - `proposal-options.ts` — Options with tradeoffs (JSONB storage)
  - `proposal-votes.ts` — Vote casting and tally calculation
  - `proposal-ratings.ts` — Quality ratings and aggregates
- Migration `026_add_proposal_votes_ratings.sql` — Creates votes/ratings tables with proper indexes
- 5 production repository implementations:
  - `PostgresProposalRepo` — Replaces in-memory repo
  - `PostgresEvidenceRepo` — Evidence persistence
  - `PostgresOptionRepo` — Options persistence
  - `PostgresVoteRepo` — Vote persistence
  - `PostgresProposalRatingRepo` — Rating persistence
- All handlers updated to use PostgreSQL repos (deployed to production)

**Types & Validators**
- Complete type definitions in `packages/types/src/governance.ts`
- Zod validation schemas in `packages/validators/src/governance.ts`
- Support for individual AND group proposals (polymorphic scoping)

**Domain Entities**
- Proposal, Evidence, Option, Vote, ProposalRating entities with business logic
- Aggregate calculations (vote tallies, rating averages)

**API Handlers**
- CRUD operations: create, list, view, update, delete proposals
- Evidence/Options: add, list, update, delete
- Voting: cast vote, get my vote, get tally
- Ratings: submit rating, get aggregate

**API Routes**
- All governance endpoints implemented and deployed

### Future Enhancements (Optional)

These features are documented for future iterations but not required for core governance functionality:
- Bridge AI integration (similarity detection, regulation conflict checking)
- Forum → Governance conversion mechanism
- Minority report UI and workflow
- Amendment process implementation
- Delivery tracking and review phase

---

## Data Models

### Proposal Entity

```typescript
interface Proposal {
  id: string

  // Polymorphic scoping: individual OR group proposals
  scopeType: 'individual' | 'group'
  scopeId: string               // user.id (if individual) OR group.id (if group)

  authorId: string              // Member who created (always individual)
  title: string                 // 3-200 chars
  summary: string               // 10-2000 chars

  // Governance workflow
  evidence: Evidence[]          // Research, links, data
  options: Option[]             // Alternatives with trade-offs
  positions: Position[]         // Member stances
  minorityReport?: string       // Objections codified
  status: ProposalStatus

  // Bridge AI integration fields (prepared for future use)
  bridgeSimilarityCheckDone: boolean
  bridgeSimilarProposals: Array<{id: string, similarity: number}>
  bridgeRegulationConflicts: Array<{regulationId: string, severity: string}>
  bridgeClarificationThreadId?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  decidedAt?: Date
  deletedAt?: Date              // Soft delete support
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

### Evidence

```typescript
interface Evidence {
  id: string
  proposalId: string
  type: 'research' | 'data' | 'expert' | 'precedent'
  title: string
  url?: string
  summary: string
  attachedBy: string            // Member ID
  attachedAt: Date
}
```

### Option

```typescript
interface Option {
  id: string
  proposalId: string
  title: string
  description: string
  tradeoffs: Tradeoff[]
  estimatedCost?: number
  estimatedTime?: string        // e.g., "3 months"
  proposedBy: string            // Member ID
  proposedAt: Date
}

interface Tradeoff {
  aspect: string                // e.g., "Cost", "Time", "Impact"
  pro: string
  con: string
}
```

### Position

```typescript
interface Position {
  id: string
  proposalId: string
  memberId: string
  stance: 'support' | 'oppose' | 'abstain' | 'block'
  reasoning: string
  isMinority: boolean           // Flagged for preservation
  recordedAt: Date
}
```

### Decision (Future)

```typescript
interface Decision {
  id: string
  proposalId: string
  method: 'approval' | 'ranked_choice' | 'consent'
  quorum: number                // Required participation
  threshold: number             // % needed to pass
  outcome: 'approved' | 'rejected' | 'amended'
  votes: Vote[]
  minorityReport?: string
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

### Regulation (For Bridge Integration)

```typescript
interface Regulation {
  id: string
  title: string                 // 3-200 chars
  description: string           // Full regulation text
  category: string              // e.g., 'governance', 'moderation', 'resource-allocation'

  // Originating proposal
  sourceProposalId?: string     // Which proposal created this regulation

  // Scope (global or group-specific)
  scopeType: 'global' | 'group'
  scopeId?: string              // NULL for global, group.id for group-specific

  // Full text for Bridge semantic search
  fullText: string              // Complete regulation text for AI analysis

  // Status & supersession
  status: 'active' | 'superseded' | 'repealed'
  supersededBy?: string         // Link to newer regulation

  // Timestamps
  implementedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## API Contracts

### POST /api/proposals

**Request:**

```typescript
{
  title: string          // 3-200 chars
  summary: string        // 10-2000 chars
  authorId: string       // UUID

  // Scoping: individual OR group
  scopeType: 'individual' | 'group'
  scopeId: string        // user.id (if individual) OR group.id (if group)
}
```

**Notes:**
- Individual proposals: `scopeType='individual'`, `scopeId=authorId`
- Group proposals: `scopeType='group'`, `scopeId={groupId}`
- Author must be member of group if scopeType='group'

**Response (Success):**

```typescript
201 Created
{
  id: string
  createdAt: string      // ISO 8601
}
```

**Response (Validation Error):**

```typescript
422 Unprocessable Entity
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Title must be at least 3 characters",
    details: { field: "title", value: "AB" }
  }
}
```

### GET /api/proposals

**Query Params:**

```typescript
{
  scopeType?: 'individual' | 'group'  // Filter by scope type
  scopeId?: string                    // Filter by specific scope
  status?: string                     // Filter by status
  authorId?: string                   // Filter by author
  limit?: number                      // Default 50, max 100
  offset?: number                     // Pagination
}
```

**Examples:**
- All individual proposals: `?scopeType=individual`
- All group proposals: `?scopeType=group`
- Specific group's proposals: `?scopeType=group&scopeId={groupId}`
- User's personal proposals: `?scopeType=individual&scopeId={userId}`

**Response:**

```typescript
200 OK
{
  proposals: Proposal[]
  total: number
  limit: number
  offset: number
}
```

### GET /api/proposals/:id

**Response (Success):**

```typescript
200 OK
{
  id: string
  groupId: string
  authorId: string
  title: string
  summary: string
  evidence: Evidence[]
  options: Option[]
  positions: Position[]
  minorityReport?: string
  status: string
  createdAt: string
  updatedAt: string
  decidedAt?: string
}
```

**Response (Not Found):**

```typescript
404 Not Found
{
  error: {
    code: "PROPOSAL_NOT_FOUND",
    message: "Proposal with id 'xyz' does not exist"
  }
}
```

---

## Support Points Integration

Proposals integrate with the existing Support Points (SP) system for prioritization and reward:

### Reward Events

Members earn SP for proposal-related activities:

```typescript
const proposalRewardEvents = [
  'proposal_created',      // +10 SP
  'proposal_researched',   // +5 SP (added evidence/options)
  'proposal_facilitated',  // +15 SP (moderated discussion)
  'proposal_voted',        // +2 SP (cast vote)
  'proposal_delivered',    // +20 SP (completed initiative)
]
```

### SP Allocations

Members can allocate SP to proposals to signal priority:

- **Target type:** `'proposal'`
- **Target ID:** Proposal UUID
- **Max allocation:** 10 SP per member per proposal
- **Reclaim:** When proposal closes (approved/rejected/archived)

**Example:**

```typescript
// Member allocates SP to proposal
await supportPointsRepo.allocate({
  memberId: 'user-123',
  targetType: 'proposal',
  targetId: 'proposal-abc',
  amount: 10
})

// When proposal closes, reclaim all allocations
await supportPointsRepo.reclaimAll({
  targetType: 'proposal',
  targetId: 'proposal-abc'
})
```

### Integration Points

1. **Proposal creation** → Trigger `proposal_created` reward event (+10 SP)
2. **Evidence/options added** → Trigger `proposal_researched` (+5 SP)
3. **Vote cast** → Trigger `proposal_voted` (+2 SP)
4. **Proposal approved** → Trigger `proposal_delivered` for author (+20 SP)
5. **Proposal list** → Show SP allocation totals per proposal
6. **Proposal detail** → Show "Allocate SP" button for members

**Note:** SP integration uses existing `support_points_allocations` and `reward_events` tables. No schema changes needed.

---

## Validation Schemas (Zod)

### Create Proposal

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

### Proposal Response

```typescript
export const proposalSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  evidence: z.array(evidenceSchema).default([]),
  options: z.array(optionSchema).default([]),
  positions: z.array(positionSchema).default([]),
  minorityReport: z.string().optional(),
  status: z.enum(['draft', 'research', 'deliberation', 'voting', 'decided', 'delivery', 'reviewed', 'archived']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  decidedAt: z.coerce.date().optional(),
})
```

---

## Repository Pattern

### Interface

```typescript
// packages/governance-domain/repos/ProposalRepo.ts
export interface ProposalRepo {
  create(input: CreateProposalInput): Promise<Proposal>
  findById(id: string): Promise<Proposal | null>
  list(filters: ProposalFilters): Promise<Proposal[]>
  update(id: string, updates: Partial<Proposal>): Promise<Proposal>
  delete(id: string): Promise<void>
}

export interface ProposalFilters {
  groupId?: string
  status?: ProposalStatus
  authorId?: string
  limit?: number
  offset?: number
}
```

### In-Memory Implementation (MVP)

```typescript
// packages/governance-domain/repos/InMemoryProposalRepo.ts
export class InMemoryProposalRepo implements ProposalRepo {
  private proposals: Map<string, Proposal> = new Map()

  async create(input: CreateProposalInput): Promise<Proposal> {
    const proposal: Proposal = {
      id: generateId(),
      groupId: input.groupId || 'default',
      authorId: input.authorId,
      title: input.title,
      summary: input.summary,
      evidence: [],
      options: [],
      positions: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.proposals.set(proposal.id, proposal)
    return proposal
  }

  async findById(id: string): Promise<Proposal | null> {
    return this.proposals.get(id) || null
  }

  async list(filters: ProposalFilters): Promise<Proposal[]> {
    let results = Array.from(this.proposals.values())

    if (filters.groupId) {
      results = results.filter(p => p.groupId === filters.groupId)
    }
    if (filters.status) {
      results = results.filter(p => p.status === filters.status)
    }
    if (filters.authorId) {
      results = results.filter(p => p.authorId === filters.authorId)
    }

    const offset = filters.offset || 0
    const limit = filters.limit || 50
    return results.slice(offset, offset + limit)
  }

  // ... update, delete methods
}
```

---

## UI Components

### ProposalList

```typescript
interface ProposalListProps {
  groupId?: string
  status?: ProposalStatus
  emptyMessage?: string
}

// States: loading | empty | error | success
```

### ProposalCard

```typescript
interface ProposalCardProps {
  proposal: Proposal
  onView?: (id: string) => void
  showAuthor?: boolean
  showStatus?: boolean
}
```

### ProposalView

```typescript
interface ProposalViewProps {
  proposalId: string
}

// Fetches proposal, handles loading/error/404
// Shows: title, summary, evidence, options, positions
```

### ProposalForm (Future)

```typescript
interface ProposalFormProps {
  initialValues?: Partial<Proposal>
  onSubmit: (data: CreateProposalInput) => Promise<void>
  onCancel?: () => void
}

// Uses React Hook Form + Zod validation
```

---

## Testing Strategy

### Unit Tests

```typescript
// packages/governance-domain/__tests__/Proposal.test.ts
import { describe, it, expect } from 'vitest'
import { Proposal } from '../entities/Proposal'

describe('Proposal entity', () => {
  it('validates title length', () => {
    expect(() => new Proposal({ title: 'AB' })).toThrow()
  })

  it('initializes with draft status', () => {
    const proposal = new Proposal({ title: 'Valid title', summary: 'Valid summary' })
    expect(proposal.status).toBe('draft')
  })
})
```

### Contract Tests

```typescript
// apps/api/src/modules/governance/__tests__/createProposal.test.ts
import { describe, it, expect } from 'vitest'
import { createProposalSchema } from '@togetheros/validators'

describe('POST /api/proposals', () => {
  it('rejects empty title', () => {
    const result = createProposalSchema.safeParse({ title: '', summary: 'Valid', authorId: 'abc' })
    expect(result.success).toBe(false)
  })

  it('accepts valid input', () => {
    const result = createProposalSchema.safeParse({
      title: 'Community garden',
      summary: 'Proposal to convert unused space...',
      authorId: '550e8400-e29b-41d4-a716-446655440000'
    })
    expect(result.success).toBe(true)
  })
})
```

---

## Bridge AI Integration

Bridge provides intelligent assistance during proposal creation and deliberation. The complete architecture is documented in:

**See:** `docs/architecture/bridge-proposals-integration.md`

### Key Capabilities (Prepared, Not Yet Implemented)

1. **Similarity Detection**
   - Semantic search against existing proposals and decisions
   - Threshold: 0.7 similarity triggers clarification dialogue
   - Prevents duplicate proposals

2. **Regulation Conflict Checking**
   - Compare proposals against implemented regulations
   - Severity levels: blocker / warning / info
   - Suggest amendments to resolve conflicts

3. **Conversational Clarification**
   - Bridge initiates dialogue if issues found
   - Member clarifies intent or modifies proposal
   - Non-blocking: member can proceed with explanation

4. **Phrasing Optimization**
   - Suggest improvements to title/summary
   - Non-imposing: member accepts or rejects
   - Improve clarity and actionability

### Database Fields (Prepared)

Proposal schema includes Bridge integration fields (currently unused):

```typescript
{
  bridgeSimilarityCheckDone: boolean
  bridgeSimilarProposals: Array<{id: string, similarity: number}>
  bridgeRegulationConflicts: Array<{regulationId: string, severity: string}>
  bridgeClarificationThreadId?: string
}
```

These fields are ready for when Bridge integration is implemented.

---

## Key Files

```
packages/types/src/governance.ts          # Type definitions
packages/validators/src/governance.ts     # Zod validation schemas
packages/db/src/proposals.ts              # PostgreSQL operations
packages/db/src/proposal-evidence.ts      # Evidence persistence
packages/db/src/proposal-options.ts       # Options persistence
packages/db/src/proposal-votes.ts         # Vote persistence
packages/db/src/proposal-ratings.ts       # Rating persistence
apps/web/app/(platform)/governance/       # UI routes
packages/ui/src/governance/               # UI components
db/migrations/026_add_proposal_votes_ratings.sql  # Database schema
```

---

## Related Documentation

- [Main KB](../../.claude/knowledge/togetheros-kb.md) — Core principles, workflow
- [Architecture](../../architecture.md) — Domain-driven design patterns
- [Support Points Module](./support-points-technical.md) — SP integration details
- [Forum Module](./forum-technical.md) — Forum → Governance flow
