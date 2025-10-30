# Governance Module — Proposals & Decisions

## Overview

**Scope:** Create, deliberate, and decide on proposals with transparent rules and lightweight, testable flows

**Status:** 0% implementation
**Owner:** @coopeverything-core
**Labels:** `module:governance`
**Next milestone:** Submit a minimal proposal and see it in a list

---

## Why This Exists

Members must be able to:
- Turn ideas into formal proposals
- Discuss with evidence and trade-offs
- Make consent-based decisions
- Track delivery and review outcomes

We ship a **thin vertical slice first** so contributors can see end-to-end value quickly:
**Submit → List → View details** (voting comes later)

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

## Data Models

### Proposal Entity
```typescript
interface Proposal {
  id: string
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

---

## API Contracts

### POST /api/proposals

**Request:**
```typescript
{
  title: string          // 3-200 chars
  summary: string        // 10-2000 chars
  authorId: string       // UUID
  groupId?: string       // Optional, defaults to member's primary group
}
```

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
  groupId?: string       // Filter by group
  status?: string        // Filter by status
  authorId?: string      // Filter by author
  limit?: number         // Default 50, max 100
  offset?: number        // Pagination
}
```

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
