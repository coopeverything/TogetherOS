# Governance Module — Proposals & Decisions

## Overview

**Scope:** Complete governance pipeline from proposal creation through decision-making, implementation tracking, and iterative improvement. Consolidates "Proposals" and "Governance" into one unified system.

**Status:** 75% implementation
**Owner:** @coopeverything-core
**Labels:** `module:governance`
**Next milestone:** Support Points integration and test coverage

**Key Features:**
- **Individual AND Group Proposals:** Members can create personal proposals OR group-scoped proposals
- **Forum Integration:** Convert deliberation threads into formal proposals
- **Bridge AI Integration:** Similarity detection, regulation conflict checking, conversational clarification (architecture prepared, implementation future)
- **Support Points Integration:** Proposals earn RP, accept SP allocations for prioritization
- **Consent-Based Decisions:** Transparent voting with minority report preservation
- **Amendment Process:** Iterative improvements through feedback loop
- **Delivery Tracking:** Convert approved proposals into initiatives

---

## Why This Exists

Members must be able to:
- Turn ideas (from Forum discussions) into formal proposals
- Gather evidence and explore trade-offs
- Make consent-based decisions (not majority-rule)
- Preserve minority reports and dissenting views
- Track delivery and review outcomes
- Iterate and improve through amendments

**Note:** This is part of the unified governance pipeline: **Forum → Governance → Initiatives**

We ship a **thin vertical slice first** so contributors can see end-to-end value quickly:
**Submit → List → View details** (voting comes later)

---

## Implementation Status

### Completed (75%)

**PostgreSQL Persistence Layer** ✅
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

**Types & Validators** ✅
- Complete type definitions in `packages/types/src/governance.ts`
- Zod validation schemas in `packages/validators/src/governance.ts`
- Support for individual AND group proposals (polymorphic scoping)

**Domain Entities** ✅
- Proposal, Evidence, Option, Vote, ProposalRating entities with business logic
- Aggregate calculations (vote tallies, rating averages)

**API Handlers** ✅
- CRUD operations: create, list, view, update, delete proposals
- Evidence/Options: add, list, update, delete
- Voting: cast vote, get my vote, get tally
- Ratings: submit rating, get aggregate

**API Routes** ✅
- All governance endpoints implemented and deployed

### In Progress (Next 25%)

- UI components and pages (ProposalList, ProposalView, ProposalForm)
- Support Points integration (reward events, allocations)
- Test coverage (unit tests, contract tests, Storybook stories)

### Not Started

- Bridge AI integration (similarity detection, regulation conflict checking)
- Forum → Governance conversion mechanism
- Minority report UI and workflow
- Amendment process implementation
- Delivery tracking and review phase

---

## MVP Slices (Implementation Order)

### 1. Proposal Create (API + Domain)

**Acceptance Criteria:**
- `POST /api/proposals` validates with Zod (`title`, `summary`, `authorId`, `createdAt`)
- Stores to in-memory/fixture repo
- Returns `201` with `{id}`
- Unit test covers happy path + validation errors

**Files:**
```
packages/types/src/governance.ts          # Proposal interface
packages/validators/src/governance.ts     # createProposalSchema
apps/api/src/modules/governance/
  ├── entities/Proposal.ts                # Domain model
  ├── repos/ProposalRepo.ts               # Interface
  ├── repos/InMemoryProposalRepo.ts       # Fixture implementation
  └── handlers/createProposal.ts          # API handler
```

**Example:**
```typescript
// Request
POST /api/proposals
{
  "title": "Add community garden to park",
  "summary": "Proposal to convert unused space...",
  "authorId": "user-123"
}

// Response
201 Created
{
  "id": "proposal-abc",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### 2. Proposal List (UI)

**Acceptance Criteria:**
- Route `/governance` lists proposals with: `title`, `author`, `createdAt`
- Empty state, loading skeleton, and error state present
- Storybook story for `<ProposalList />` with empty/loaded states

**Files:**
```
apps/web/app/(platform)/governance/
  ├── page.tsx                            # List route
  └── layout.tsx                          # Shared layout

packages/ui/src/governance/
  ├── ProposalList.tsx                    # Main component
  ├── ProposalCard.tsx                    # Individual proposal
  ├── ProposalListSkeleton.tsx            # Loading state
  └── EmptyProposals.tsx                  # Empty state
```

**UI States:**
```typescript
type ProposalListState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: Proposal[] }
```

---

### 3. Proposal Details (UI + API)

**Acceptance Criteria:**
- `/governance/[id]` shows `title`, `summary`, timestamps
- 404 guarded (invalid id)
- Contract test for `GET /api/proposals/:id` with Zod parsing

**Files:**
```
apps/web/app/(platform)/governance/
  └── [id]/
      └── page.tsx                        # Detail route

packages/ui/src/governance/
  ├── ProposalView.tsx                    # Detail component
  ├── ProposalViewSkeleton.tsx            # Loading state
  └── ProposalNotFound.tsx                # 404 state

apps/api/src/modules/governance/handlers/
  └── getProposal.ts                      # GET handler
```

**Example:**
```typescript
// Request
GET /api/proposals/proposal-abc

// Response (Success)
200 OK
{
  "id": "proposal-abc",
  "title": "Add community garden",
  "summary": "Proposal to convert...",
  "authorId": "user-123",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "status": "draft"
}

// Response (Not Found)
404 Not Found
{
  "error": {
    "code": "PROPOSAL_NOT_FOUND",
    "message": "Proposal with id 'proposal-xyz' does not exist"
  }
}
```

---

### 4. Seed & Fixtures (Ops)

**Acceptance Criteria:**
- `packages/governance-fixtures/seed.ts` adds 3 demo proposals
- `pnpm -w seed:governance` runs and logs inserted ids
- Proof-line in `scripts/validate.sh` confirms seeds runnable

**Files:**
```
packages/governance-fixtures/
  ├── proposals.json                      # Demo data
  ├── seed.ts                             # Seed script
  └── index.ts                            # Exports

scripts/validate.sh                       # Add seed check
```

**Example Fixture:**
```json
{
  "proposals": [
    {
      "id": "prop-1",
      "title": "Community garden in Central Park",
      "summary": "Convert unused northeast corner...",
      "authorId": "member-alice",
      "status": "draft",
      "createdAt": "2025-01-10T09:00:00Z"
    },
    {
      "id": "prop-2",
      "title": "Weekly farmers market",
      "summary": "Partner with local farms...",
      "authorId": "member-bob",
      "status": "deliberation",
      "createdAt": "2025-01-12T14:30:00Z"
    }
  ]
}
```

---

## Full Governance Pipeline (Future Phases)

### Complete Flow
1. **Present** — Submit proposal with evidence
2. **Prioritize** — Community allocates Support Points
3. **Research** — Stewards produce options + trade-offs
4. **Positions** — Members record stances (including minority)
5. **Deliberate** — Structured discussion with empathy rules
6. **Vote** — Configurable methods (approval, ranked, consent)
7. **Act** — Convert to Initiative with tasks/owners
8. **Review** — Delivery report, metrics, learnings
9. **Legislate/Amend** — Revisit via feedback loop

### Safeguards
- **Minority reports:** Codified and preserved
- **Cooling-off periods:** Prevent rushed decisions
- **Challenge windows:** Appeals deadline
- **Civic jury:** Dispute resolution
- **Conflict of interest:** Declarations and recusal
- **Delivery reports:** Tied to proposals, public audit

---

## Forum → Governance Bridge

Ideas begin as informal discussions in the **Forum module** before becoming formal proposals in Governance.

### Conversion Flow

1. **Forum Discussion Phase**
   - Member starts a discussion with `topicCategory: 'proposal'` or `'deliberation'`
   - Community explores problem, brainstorms solutions
   - Evidence and viewpoints emerge organically

2. **Readiness Signals**
   - Discussion reaches natural conclusion
   - Consensus forms around a direction
   - Author (or community) decides to formalize

3. **Convert to Proposal** (Planned Feature)
   - "Convert to Proposal" button on forum threads
   - Auto-populate proposal fields:
     - Title from thread title
     - Summary from first post + discussion highlights
     - Evidence from links shared in thread
   - Link back to original forum discussion

4. **Formal Governance Phase**
   - Proposal enters governance workflow
   - Voting, minority reports, decision tracking
   - Forum thread remains as historical context

**Current Status:** Forum module at 0%, conversion mechanism not yet implemented. Proposals can be created manually via `/governance/new`.

---

## Minority Reports & Dissent Preservation

**Philosophy:** Consent-based decision-making is NOT majority-rule. Dissenting views must be codified, preserved, and given equal visibility to the majority decision.

### How It Works

1. **During Voting**
   - Members can select: `support`, `oppose`, `abstain`, or `block`
   - Members selecting `oppose` or `block` are prompted to explain reasoning
   - System auto-flags these as minority positions (`isMinority: true`)

2. **Minority Report Creation**
   - If ≥10% of voters oppose or ≥1 member blocks, minority report is REQUIRED
   - Minority members collaborate to write report (separate document)
   - Report answers:
     - What concerns remain unaddressed?
     - What risks does the majority overlook?
     - What alternative would you propose?
     - Under what conditions would you consent?

3. **Report Preservation**
   - Stored in `proposal.minorityReport` field (markdown text)
   - Displayed prominently on proposal detail page
   - Included in decision announcement
   - Linked from initiative/delivery tracking

4. **Review & Amendment**
   - If minority predictions prove correct (during review phase), proposal can be amended
   - Minority report informs improvement proposals
   - Creates feedback loop for better future decisions

**Current Status:** Data model supports minority reports (field exists). Voting logic and report creation UI not yet implemented.

---

## Amendment & Iteration Process

Decisions are NOT permanent. The commons can revisit and improve any decision through the amendment process.

### When to Amend

Triggers for creating an amendment proposal:
- **Delivery phase issues:** Implementation reveals unforeseen problems
- **Metric failures:** Success metrics not met (see Metrics module)
- **Minority report validation:** Dissenting predictions prove correct
- **Changed circumstances:** External factors require adjustment
- **Community feedback:** Members request improvements

### Amendment Workflow

1. **Trigger Event**
   - Review phase identifies issues (automated or manual)
   - Member creates amendment proposal (references original)

2. **Amendment Proposal**
   - Type: `amendment` (vs `new`)
   - Linked to original proposal (`amendedProposalId` field)
   - Shows diff of changes (what's modified vs original)
   - Includes rationale: "Why amend instead of new proposal?"

3. **Deliberation**
   - Lower approval threshold (e.g., 60% vs 75%)
   - Original supporters auto-notified
   - Minority report authors invited to weigh in

4. **Decision**
   - If approved: Original proposal marked `status: 'superseded'`
   - Amendment becomes new active regulation
   - Link preserved: Original ← Amendment (bidirectional)

5. **History Tracking**
   - All versions preserved (append-only)
   - Proposal detail page shows version history
   - Members can view evolution of decision over time

**Example Amendment Flow:**
```
Original Proposal (2024-01): "Community garden at Central Park"
  ↓ (approved, implemented)
Delivery Report (2024-06): Water access insufficient (minority report predicted this)
  ↓ (review phase triggered)
Amendment Proposal (2024-07): "Add irrigation system to community garden"
  ↓ (approved)
Updated Regulation: Garden now includes irrigation
```

**Current Status:** Amendment workflow not implemented. Proposal schema supports `status: 'superseded'` but no amendment linking or versioning.

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

**Purpose:** Store implemented regulations for Bridge to check against new proposals. Bridge uses semantic search to detect conflicts between proposals and existing regulations.

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

---

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

---

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

### Storybook Stories
```typescript
// packages/ui/src/governance/ProposalCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ProposalCard } from './ProposalCard'

export default {
  component: ProposalCard,
} satisfies Meta<typeof ProposalCard>

export const Draft: StoryObj = {
  args: {
    proposal: {
      id: 'prop-1',
      title: 'Community garden',
      summary: 'Convert unused space...',
      status: 'draft',
      authorId: 'alice',
      createdAt: new Date(),
    }
  }
}

export const Deliberation: StoryObj = {
  args: {
    proposal: { ...Draft.args.proposal, status: 'deliberation' }
  }
}
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

These fields are ready for when Bridge integration is implemented. They do not affect MVP functionality.

---

## Definition of Done (DoD)

When MVP slices are complete:

✅ Tests or manual steps verified (list loads, details render, create works)
✅ Docs updated (this page + `docs/modules/INDEX.md` link present)
✅ Proofs in PR body:
```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```
✅ Storybook stories for all UI components (empty, loading, error, success states)
✅ Contract tests for API endpoints pass
✅ Fixtures seed successfully with `pnpm -w seed:governance`

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core principles, workflow
- [Architecture](architecture.md) — Domain-driven design patterns
- [Data Models](data-models.md) — Complete entity specifications
- [CI/CD Discipline](../contributors/WORKFLOW.md) — Proof lines, validation

---

## Next Steps

### To Do
- [ ] Write tests and complete polish
- [ ] Create UI components and pages
- [ ] Integrate Support Points (reward events, allocations)
- [ ] Build API handlers and routes (CRUD endpoints)
- [ ] Implement domain layer (types, validators, entities, repos)
- [ ] Create database migrations (proposals and regulations tables)
- [ ] Add tasks here as development progresses

### In Progress
- Currently being worked on

### Done
- Completed items move here

---

*Last updated: Auto-generated by update-module-next-steps.sh*
