# TogetherOS Architecture

## Monorepo Structure

### Directory Layout
```
TogetherOS/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth routes group
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (platform)/     # Main app routes
│   │   │   │   ├── governance/
│   │   │   │   ├── bridge/
│   │   │   │   ├── forum/
│   │   │   │   ├── profiles/
│   │   │   │   └── groups/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── public/
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── api/                    # Backend services
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── governance/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repos/
│   │   │   │   │   ├── handlers/
│   │   │   │   │   └── fixtures/
│   │   │   │   ├── bridge/
│   │   │   │   ├── profiles/
│   │   │   │   └── groups/
│   │   │   ├── lib/
│   │   │   │   ├── ndjson.ts
│   │   │   │   ├── privacy.ts
│   │   │   │   └── validators.ts
│   │   │   ├── trpc/
│   │   │   │   ├── router.ts
│   │   │   │   └── context.ts
│   │   │   └── server.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── docs-site/              # Documentation site (future)
│
├── packages/
│   ├── ui/                     # Shared components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── index.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── governance.ts
│   │   │   ├── profiles.ts
│   │   │   ├── bridge.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── fixtures/               # Test data
│   │   ├── src/
│   │   │   ├── proposals.ts
│   │   │   ├── members.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/             # Zod schemas
│   │   ├── src/
│   │   │   ├── governance.ts
│   │   │   ├── bridge.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared configs
│       ├── eslint-config/
│       ├── tsconfig/
│       └── tailwind-config/
│
├── docs/                       # Specs & playbooks
├── codex/                      # Knowledge base
├── scripts/                    # Validation scripts
├── .github/workflows/          # CI/CD
├── .devcontainer/              # Dev environment
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .env.example
```

---

## Domain-Driven Design Pattern

### Standard Module Structure

Every module follows this consistent pattern:

```
Module: governance
├── apps/api/src/modules/governance/
│   ├── entities/              # Domain models (pure TypeScript)
│   │   ├── Proposal.ts
│   │   ├── Decision.ts
│   │   └── index.ts
│   │
│   ├── repos/                 # Data access interfaces
│   │   ├── ProposalRepo.ts   # Interface
│   │   ├── InMemoryProposalRepo.ts
│   │   └── index.ts
│   │
│   ├── handlers/              # API handlers
│   │   ├── createProposal.ts
│   │   ├── listProposals.ts
│   │   ├── getProposal.ts
│   │   └── index.ts
│   │
│   └── fixtures/              # Test data
│       ├── proposals.json
│       ├── seed.ts
│       └── index.ts
│
├── apps/web/app/(platform)/governance/
│   ├── page.tsx              # List view
│   ├── [id]/
│   │   └── page.tsx          # Detail view
│   └── layout.tsx            # Shared layout
│
├── packages/types/src/governance.ts
├── packages/validators/src/governance.ts
└── packages/ui/src/governance/
    ├── ProposalList.tsx
    ├── ProposalCard.tsx
    └── ProposalView.tsx
```

### Entities
- **Pure domain models** — No framework dependencies
- **Business logic** — Validation, state transitions
- **Immutable patterns** — Return new instances on changes

### Repositories
- **Interface-based** — Define contracts, swap implementations
- **Fixture-first** — Start with in-memory/JSON
- **Future-proof** — Easy database migration path

### Handlers
- **Thin controllers** — Orchestrate entities + repos
- **Zod validation** — All inputs validated
- **Error taxonomy:** 401 (unauth), 403 (forbidden), 422 (validation), 500 (unexpected)

---

## API Architecture

### tRPC Pattern (Preferred)

```typescript
// packages/types/src/governance.ts
export interface Proposal {
  id: string
  title: string
  summary: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

// packages/validators/src/governance.ts
import { z } from 'zod'

export const createProposalSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(2000),
  authorId: z.string().uuid(),
})

// apps/api/src/modules/governance/handlers/createProposal.ts
import { createProposalSchema } from '@togetheros/validators'
import { ProposalRepo } from '../repos'

export async function createProposal(
  input: unknown,
  repo: ProposalRepo
) {
  const data = createProposalSchema.parse(input)
  const proposal = await repo.create(data)
  return { id: proposal.id }
}

// apps/api/src/trpc/routers/governance.ts
import { createProposal } from '../../modules/governance/handlers'

export const governanceRouter = router({
  createProposal: publicProcedure
    .input(createProposalSchema)
    .mutation(({ input }) => createProposal(input, proposalRepo)),
})
```

### REST Alternative

```typescript
// apps/api/src/modules/governance/handlers/createProposal.ts
export async function POST(request: Request) {
  const body = await request.json()
  const data = createProposalSchema.parse(body)
  const proposal = await proposalRepo.create(data)
  return Response.json({ id: proposal.id }, { status: 201 })
}
```

### Error Responses

```typescript
// Standard error shape
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 3 characters",
    "details": { "field": "title" }
  }
}

// HTTP status codes
401 — Unauthorized (missing/invalid auth)
403 — Forbidden (insufficient permissions/feature disabled)
422 — Unprocessable (validation failed, contract breach)
204 — No Content (empty result, valid but nothing to return)
500 — Internal Server Error (unexpected failure)
```

---

## Data Models (Core Entities)

### Group
```typescript
interface Group {
  id: string
  name: string
  handle: string              // Unique, federation-ready
  type: 'local' | 'thematic' | 'federated'
  createdAt: Date
  members: Member[]
}
```

### Member
```typescript
interface Member {
  id: string
  email: string               // Private
  handle: string              // Public
  archetypes: Archetype[]     // Builder, Community Heart, etc.
  capabilities: string[]      // Unlocked features
  reputation: number          // Earned contributions
  supportPoints: number       // 100 start, max 10/idea
  createdAt: Date
}
```

### Proposal
```typescript
interface Proposal {
  id: string
  groupId: string
  authorId: string
  title: string
  summary: string
  evidence: Evidence[]        // Research, links, data
  options: Option[]           // Alternatives with trade-offs
  positions: Position[]       // Member stances
  minorityReport?: string     // Objections codified
  status: 'draft' | 'deliberation' | 'voting' | 'decided'
  createdAt: Date
  updatedAt: Date
}
```

### Decision
```typescript
interface Decision {
  id: string
  proposalId: string
  method: 'approval' | 'ranked' | 'consent'
  quorum: number
  outcome: 'approved' | 'rejected' | 'amended'
  votes: Vote[]
  minorityReport?: string
  challengeWindow: Date       // Appeals deadline
  decidedAt: Date
}
```

### Initiative
```typescript
interface Initiative {
  id: string
  decisionId: string
  title: string
  tasks: Task[]
  owners: string[]            // Member IDs
  milestones: Milestone[]
  proofs: Proof[]             // Delivery artifacts
  status: 'planned' | 'in_progress' | 'delivered' | 'reviewed'
  createdAt: Date
  completedAt?: Date
}
```

### Transaction
```typescript
interface Transaction {
  id: string
  type: 'support_points' | 'timebank' | 'treasury'
  from: string                // Member or Group ID
  to: string
  amount: number
  currency: 'SP' | 'time' | 'SH'  // Support Points, hours, Social Horizon
  metadata: Record<string, any>
  timestamp: Date
}
```

### Event
```typescript
interface Event {
  id: string
  groupId: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  attendees: string[]         // Member IDs
  skills: string[]            // Skill exchange tags
  createdAt: Date
}
```

---

## NDJSON Logging Pattern

### Log Structure
```typescript
interface LogEntry {
  id: string                  // UUID
  timestamp: string           // ISO 8601
  event_type: 'qa' | 'tidy' | 'moderation' | 'transaction'
  metadata: {
    // Event-specific data
    [key: string]: any
  }
  content_hash?: string       // SHA-256 for integrity
}
```

### Bridge Q&A Log Example
```json
{"id":"uuid","timestamp":"2025-01-15T10:30:00Z","event_type":"qa","metadata":{"question_hash":"sha256","answer_length":245,"sources":[{"path":"docs/Manifesto.md","lines":[12,28]}],"ip_hash":"sha256"}}
```

### Validation Script
```bash
# scripts/validate.sh checks:
# 1. File exists
# 2. Last non-empty line is valid JSON
# 3. Required fields present (id, timestamp, event_type)
# 4. Prints: VALIDATORS=GREEN
```

---

## Privacy & Security Patterns

### PII Redaction
```typescript
function redactPII(text: string): string {
  // Remove emails
  text = text.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi, '[REDACTED_EMAIL]')

  // Remove phone numbers
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')

  // Remove handles (context-aware)
  text = text.replace(/@[\w-]+/g, '[REDACTED_HANDLE]')

  return text
}
```

### IP Hashing
```typescript
import { createHash } from 'crypto'

function hashIP(ip: string, salt: string): string {
  return createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 16)  // Shortened for storage
}
```

### Session Privacy
```typescript
interface Session {
  id: string
  memberId: string
  expiresAt: Date
  // NO: ip, user-agent, location
}
```

---

## Federation Architecture

### Group Handles
```typescript
// Format: @groupname@domain.tld
const handle = '@boston-mutual-aid@together.os'

interface FederatedGroup {
  handle: string
  homeInstance: string        // Domain
  publicKey: string           // For signatures
  protocols: string[]         // Supported federation features
}
```

### Proposal Sync
```typescript
interface FederatedProposal {
  localId: string
  remoteId: string
  remoteInstance: string
  syncedAt: Date
  status: 'synced' | 'diverged' | 'conflict'
}
```

### Local Autonomy Rules
- **Data silos:** Each group owns its data
- **Opt-in sharing:** Explicit consent for federation
- **Local decisions stand:** No central authority overrides

---

## State Management

### Client State (Planned)
- **React Context** — Global state (auth, theme)
- **Server State** — tRPC queries (cached, reactive)
- **Local State** — Component-level with useState
- **Form State** — React Hook Form + Zod

### Server State
- **In-memory** — Fixture repos (MVP)
- **Future database** — Repository pattern enables swap

---

## UI Component Patterns

### Required States
Every component must handle:
```typescript
type ComponentState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }
```

### Example: ProposalList
```typescript
export function ProposalList() {
  const { data, isLoading, error } = trpc.governance.list.useQuery()

  if (isLoading) return <ProposalListSkeleton />
  if (error) return <ErrorState error={error} />
  if (!data || data.length === 0) return <EmptyProposals />

  return <ProposalGrid proposals={data} />
}
```

### Accessibility Requirements
- **Keyboard navigation:** Tab order, Enter/Space actions
- **Screen readers:** ARIA labels, roles, live regions
- **Focus management:** Visible focus indicators
- **Color contrast:** WCAG AA minimum

---

## Route Conventions

### Next.js App Router

```
app/
├── (auth)/                    # Layout group (no route segment)
│   ├── login/
│   │   └── page.tsx          # /login
│   └── signup/
│       └── page.tsx          # /signup
│
├── (platform)/               # Layout group (authenticated)
│   ├── governance/
│   │   ├── page.tsx          # /governance (list)
│   │   ├── [id]/
│   │   │   └── page.tsx      # /governance/[id] (detail)
│   │   └── layout.tsx
│   │
│   ├── bridge/
│   │   └── page.tsx          # /bridge (Q&A interface)
│   │
│   └── profiles/
│       ├── page.tsx          # /profiles (directory)
│       └── [handle]/
│           └── page.tsx      # /profiles/[handle]
│
├── api/                      # API routes
│   ├── trpc/
│   │   └── [trpc]/
│   │       └── route.ts
│   └── bridge/
│       ├── qa/
│       │   └── route.ts      # POST /api/bridge/qa
│       └── tidy/
│           └── route.ts      # POST /api/bridge/tidy
│
├── layout.tsx                # Root layout
└── page.tsx                  # Home page
```

---

## Environment & Config

### Environment Variables
```bash
# .env.local (never commit)
DATABASE_URL=...
LLM_API_KEY=...
BRIDGE_LOG_KEY=...

# .env.example (committed)
DATABASE_URL=postgresql://...
LLM_API_KEY=your_key_here
BRIDGE_ENABLED=true
```

### Config Files
- **next.config.js** — Next.js settings
- **tailwind.config.ts** — Design tokens
- **tsconfig.base.json** — Shared TS config
- **pnpm-workspace.yaml** — Monorepo packages

---

## Testing Strategy

### Unit Tests
```typescript
// packages/governance-domain/__tests__/Proposal.test.ts
import { describe, it, expect } from 'vitest'
import { Proposal } from '../entities/Proposal'

describe('Proposal', () => {
  it('validates title length', () => {
    expect(() => new Proposal({ title: 'AB' })).toThrow()
  })
})
```

### Contract Tests
```typescript
// apps/api/src/modules/governance/__tests__/createProposal.test.ts
import { describe, it, expect } from 'vitest'
import { createProposalSchema } from '@togetheros/validators'

describe('POST /api/proposals', () => {
  it('rejects invalid input', () => {
    const result = createProposalSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
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

export const Default: StoryObj = {
  args: {
    proposal: {
      id: '1',
      title: 'Add community garden',
      summary: 'Proposal to create...',
    }
  }
}

export const Loading: StoryObj = {
  args: { loading: true }
}

export const Error: StoryObj = {
  args: { error: new Error('Failed to load') }
}
```

---

## Related KB Files

- [Main KB](./togetheros-kb.md) — Core identity and workflow
- [Tech Stack](./tech-stack.md) — Frameworks, tools, versions
- [Data Models](./data-models.md) — Complete entity specifications
- [CI/CD Discipline](./ci-cd-discipline.md) — Validation and proofs
