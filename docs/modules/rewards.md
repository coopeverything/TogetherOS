# Rewards Module — Recognition & Reputation

## Overview

**Rewards** is TogetherOS's system for recording meaningful contributions and converting participation into visible recognition through Support Points, badges, and cooperative currency flows.

**Status:** 0% implementation (🎯 **First contributor module**)
**Owner:** @coopeverything-core
**Labels:** `module:rewards`, `good-first-issue`
**Priority:** Foundation for community engagement

---

## Why Rewards Exists

### The Problem
- Contributions go unrecognized → people disengage
- No visible path from participation to impact
- Trust and reputation built on word-of-mouth only
- Early contributors deserve credit for building foundation

### The Solution
Rewards **makes cooperation visible and rewarding**:
- Every action (code, docs, governance, care) generates verifiable events
- Support Points quantify contribution across all domains
- Badges tell the story of what each person has done
- Recognition naturally enhances trust and opportunity

### North-Star Outcomes
- Early code/infrastructure contributors get lasting recognition
- First-time contributors see clear progression paths
- Reputation becomes portable proof of cooperative skill
- Recognition system scales to all 8 Cooperation Paths

---

## Core Principles

1. **Recognition is nourishment** — Humans thrive when peers acknowledge contributions
2. **Transparency and fairness** — Every reward derives from recorded, verifiable action
3. **Scalable cooperation** — Same logic applies across all participation domains
4. **Proof of cooperation** — Actions, not titles/possessions, define contribution

---

## Domains of Contribution

All contribution domains will eventually generate reward events:

| Domain | Examples |
|--------|----------|
| **Technology & Infrastructure** 🎯 | Code, docs, automation, systems design, maintenance |
| **Governance & Civic Life** | Facilitating deliberations, drafting proposals, mediation |
| **Education & Mentorship** | Teaching, translating, mentoring, documenting |
| **Social Economy** | Launching co-ops, mutual aid, timebanking |
| **Community Care** | Emotional support, accessibility, crisis management |
| **Culture & Media** | Films, music, writing, art uplifting cooperation |
| **Environment & Planet** | Regenerative projects, ecological restoration |
| **Design & UX** | Usability, accessibility, aesthetics improvements |

**🎯 Phase A Focus:** Technology & Infrastructure (code contributors first)

---

## Reward Mechanics

### 1. Support Points (SP)
**Purpose:** Governance energy - determines which proposals reach the decision pipeline

**How They Work:**
- Earned ONLY through political/governance activities (proposals, moderation quality, facilitation, deliberation)
- **NEVER from code contributions** (code earns RP, not SP - this separation prevents plutocracy)
- Allocated to proposals to signal priority (max 10 SP per proposal per person)
- Enable agenda-setting (not voting weight - votes remain one person = one vote)
- **NEVER convertible** to RP, TBC, SH, or money (strict anti-plutocracy invariant)

**Example Weights (Phase A):**
```typescript
const SP_WEIGHTS = {
  proposal_created: 10,              // Created governance proposal
  proposal_quality_rating: 5,        // Submitted detailed proposal rating
  moderation_quality_high: 15,       // Community-rated moderation (4-5 stars)
  moderation_quality_medium: 8,      // Community-rated moderation (3 stars)
  deliberation_facilitated: 12,      // Facilitated group deliberation
  consensus_achieved: 20,            // Helped achieve consensus
  minority_report_authored: 12,      // Documented minority position
}
```

**Note:** Code contributions (PRs, docs, reviews) earn **Reward Points (RP)** instead. This separation ensures governance power cannot be purchased through economic contributions.

### 2. Badges & Skill Trees
**Purpose:** Represent milestones in contribution or mastery

**Badge Examples:**
- 🔧 **First PR** — Merged your first contribution
- 🏗️ **Foundation Builder** — 10+ PRs in pre-MVP phase
- 📚 **Documentation Champion** — 5+ doc improvements
- 🐛 **Bug Hunter** — Fixed 5+ critical bugs
- 🎨 **UI Craftsperson** — 3+ UI/UX improvements
- 🔍 **Code Reviewer** — 10+ helpful reviews
- 🚀 **Module Launcher** — Shipped a complete module

**Visibility:** Publicly displayed on profiles, portable across projects

### 3. Reward Points (RP)
**Purpose:** "The commons owes you something" - real-world claims from contributions and financial support

**How They Work:**
- Earned through **code contributions** (PRs, documentation, reviews, bug fixes)
- Earned through **engagement activities** (profile completion, microlessons, forum participation, research)
- Earned through **membership dues** (fixed RP per paid month)
- Earned through **one-off donations** (minimum grants enough RP for 1 Timebank Credit)
- **Moderation earns both**: performing moderation earns RP (labor), quality ratings from community earn SP (political)
- Convertible to Timebank Credits (TBC) under monthly throttling rules
- Can be used in occasional Social Horizon (SH) purchase events (with strict caps)
- Unlock perks and benefits (priority event seats, raffles, retreat slots)

**Distinction from Support Points:**

| Aspect | Support Points (SP) | Reward Points (RP) |
|--------|---------------------|-------------------|
| **Purpose** | Governance energy - prioritize proposals | Economic claims - real-world benefits |
| **Sources** | ONLY political/governance activities | Code + engagement + financial support |
| **How Used** | Allocate to proposals (agenda-setting) | Convert to TBC, SH purchase events, perks |
| **Reclaimed** | Yes, when proposals close | No, consumed when spent |
| **Convertible To** | NEVER converts to RP or money | Converts to TBC (throttled), SH (rare events) |
| **Governance Power** | Controls agenda (what gets voted on) | NEVER grants voting power (one person = one vote) |
| **Anti-Plutocracy** | Cannot be bought with money/RP | Can be earned from dues/donations (tangible benefit) |

**Key Invariant:** Money, RP, and code contributions are **never** Support Points. SP comes only from political/governance activities.

**Example SP Sources (Political/Governance):**
- Proposal created: +10 SP
- Moderation quality (4-5 stars): +15 SP
- Facilitation session: +12 SP
- Consensus achieved: +20 SP

**Example RP Sources (Code + Engagement + Financial):**
- PR merged (medium): +50 RP (grants 0 SP - code is not political)
- Profile completion: +50 RP
- Microlesson completed: +10 RP
- Forum quality post: +20 RP
- Research contribution: +30 RP
- Monthly dues paid ($10): +100 RP
- Donation ($20): +200 RP
- Moderation action performed: +10 RP (labor compensation)

**Example RP Uses:**
- Convert 100 RP → 1 TBC (once per month, throttled)
- Purchase 1 SH for 100 RP during special event (rare, capped)
- Unlock priority seat at cooperative retreat

**See:** `docs/guides/4-ledger-system.md` for complete economic system specification.

### 4. Timebank Credits (TBC)
**Purpose:** Time-based service exchange currency with flexible specialist pricing

**How They Work:**
- 1 TBC = 1 hour of standard service (default reference)
- Specialists can price services at 1, 2, or 3 TBC per hour based on expertise
- Earned by providing services to other members
- Earned by converting RP (monthly throttling: e.g., 100 RP → 1 TBC per month)
- Spent to request services (massage, tutoring, medical consult, child care, etc.)

**Pricing Flexibility:**
| Service Type | TBC per Hour | Example |
|--------------|--------------|---------|
| Basic task | 1 TBC | Tutoring, errands, basic repair |
| Skilled service | 2 TBC | Massage therapy, specialized repair |
| Professional | 3 TBC | Medical consult, advanced therapy |

**Key Properties:**
- Transferable via service exchange (not direct P2P transfer)
- RP→TBC conversion rate is fixed and universal
- Service pricing is flexible by provider agreement
- Monthly conversion throttling prevents point farming

**See:** `docs/guides/4-ledger-system.md` for complete TBC specification.

### 5. Social Horizon (SH) Fractions
**Purpose:** Long-term cooperative asset shares in the commons' future surplus

**How They Work:**
- Allocated primarily through periodic issuance cycles (based on contribution/timebank activity)
- Occasionally available for purchase via RP or money (tightly controlled events)
- Generate dividends from cooperative treasury and social economy profits
- Anti-whale safeguards prevent concentration

**Anti-Whale Rules:**
- Only fiscally regular members (dues up-to-date) can participate in purchase events
- Per-person cap on SH acquired per event (e.g., max 5 SH or 2% of cycle issuance)
- Global cap on SH distributed via RP/money per cycle (e.g., 10-20% of issuance)
- RP spent on SH is burned (cannot also convert to TBC)
- Velocity dampers limit acquisition speed

**Distribution:**
- 80% of each issuance cycle → contribution-based allocation (formulas)
- 20% of each issuance cycle → optional purchase events (capped)

**See:** `docs/guides/4-ledger-system.md` for complete SH specification and anti-plutocracy safeguards.

---

## Implementation Sequence

### Phase A: Foundation (Now) 🎯
**Goal:** Store early contributor actions (coders, designers)

**Deliverables:**
- [ ] Event ledger schema + NDJSON storage
- [ ] GitHub webhook integration (PR events)
- [ ] Event collector API endpoint
- [ ] Basic event validation + deduplication
- [ ] Fixture data for testing

**Outcome:** PR merges automatically recorded in event ledger

---

### Phase B: Reward Logic (Next)
**Goal:** Calculate points and award badges

**Deliverables:**
- [ ] Reward engine (event → SP calculation)
- [ ] Badge ruleset (YAML config)
- [ ] Member profile API (balances, badges, history)
- [ ] Anti-gaming safeguards (cooldowns, diversity checks)

**Outcome:** Members see earned Support Points and badges

---

### Phase C: Community Integration (Later)
**Goal:** Expand to all participation domains

**Deliverables:**
- [ ] Bridge integration (Q&A, tidy contributions)
- [ ] Forum integration (facilitation, quality posts)
- [ ] Governance integration (proposals, votes, facilitation)

**Outcome:** All 8 Cooperation Paths generating rewards

---

### Phase D: Exchange Layer (Later)
**Goal:** Points convertible into cooperative currency

**Deliverables:**
- [ ] Timebank integration
- [ ] Social Horizon integration
- [ ] Conversion rules and limits

**Outcome:** SP → timebank credits → real cooperative value

---

### Phase E: Analytics & Growth (Later)
**Goal:** Transparent, motivational data loops

**Deliverables:**
- [ ] Public leaderboards (opt-in)
- [ ] Contribution reports
- [ ] Analytics dashboard

**Outcome:** Community sees cooperative progress

---

## Data Models

### Event (Core Entity)
```typescript
interface RewardEvent {
  id: string                    // UUID
  actor_id: string              // Member who performed action
  event_type: RewardEventType
  timestamp: Date
  context: EventContext         // Domain-specific metadata
  source: string                // Origin (github, forum, bridge)
  weight: number                // SP value (calculated)
  status: 'pending' | 'processed' | 'rejected'
  processed_at?: Date
}

type RewardEventType =
  // Code & Infrastructure
  | 'pr_merged'
  | 'pr_reviewed'
  | 'issue_created'
  | 'issue_triaged'
  | 'bug_fixed'
  | 'docs_contribution'
  // Governance (future)
  | 'proposal_submitted'
  | 'proposal_facilitated'
  | 'vote_cast'
  // Community (future)
  | 'moderation_action'
  | 'community_event_hosted'
  | 'bridge_qa_helpful'
  | 'thread_tidied'

interface EventContext {
  // GitHub events
  pr_number?: number
  pr_size?: 'small' | 'medium' | 'large'
  files_changed?: number
  lines_changed?: number
  repository?: string
  
  // Forum events (future)
  thread_id?: string
  post_quality?: number
  
  // Governance events (future)
  proposal_id?: string
  decision_id?: string
  
  // Generic
  [key: string]: any
}
```

### Member Balance
```typescript
interface MemberRewardBalance {
  member_id: string
  support_points_total: number      // All-time earned
  support_points_available: number  // Current balance
  support_points_allocated: number  // Locked in proposals
  badges: Badge[]
  level: number                     // Derived from total SP
  created_at: Date
  updated_at: Date
}
```

### Badge
```typescript
interface Badge {
  id: string                    // UUID
  name: string                  // Display name
  description: string
  icon: string                  // Emoji or URL
  criteria: BadgeCriteria
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  earned_at?: Date
}

interface BadgeCriteria {
  event_types: RewardEventType[]
  threshold: number             // How many events required
  conditions?: Record<string, any>
}
```

### Transaction Log
```typescript
interface RewardTransaction {
  id: string                    // UUID
  member_id: string
  type: 'earn' | 'allocate' | 'reclaim' | 'convert'
  amount: number
  source_event_id?: string      // Link to RewardEvent
  target_id?: string            // Proposal/initiative receiving allocation
  timestamp: Date
  metadata: Record<string, any>
}
```

---

## API Contracts

### POST /api/rewards/events

**Purpose:** Receive contribution events from external systems

**Request:**
```typescript
{
  actor_id: string              // Member UUID
  event_type: string            // From RewardEventType
  source: string                // 'github' | 'forum' | 'bridge'
  context: {
    // Event-specific data
    pr_number?: number
    files_changed?: number
    // ...
  }
}
```

**Response (Success):**
```typescript
201 Created
{
  id: string                    // Event UUID
  weight: number                // Calculated SP
  processed: boolean
}
```

**Response (Duplicate):**
```typescript
409 Conflict
{
  error: {
    code: "EVENT_ALREADY_PROCESSED",
    message: "Event with this source and context already exists"
  }
}
```

---

### GET /api/rewards/members/:id/balance

**Purpose:** Retrieve member's reward balance and badges

**Response:**
```typescript
200 OK
{
  member_id: string
  support_points: {
    total: number
    available: number
    allocated: number
  }
  badges: Badge[]
  level: number
  rank_percentile?: number      // Optional: where they stand
  recent_events: RewardEvent[]  // Last 10
}
```

---

### GET /api/rewards/leaderboard

**Purpose:** Public leaderboard (opt-in members only)

**Query Params:**
```typescript
{
  period?: 'week' | 'month' | 'all-time'
  domain?: CooperationPath      // Filter by contribution domain
  limit?: number                // Default 50, max 100
}
```

**Response:**
```typescript
200 OK
{
  period: string
  updated_at: Date
  leaders: Array<{
    member_id: string
    handle: string              // Public identifier
    support_points: number
    badges_count: number
    rank: number
  }>
}
```

---

## GitHub Integration (Phase A)

### Webhook Configuration

**Events to Listen:**
- `pull_request` (opened, closed, merged)
- `pull_request_review` (submitted)
- `issues` (opened, labeled)
- `push` (to main/release branches)

**Webhook Handler Flow:**
```typescript
async function handleGitHubWebhook(payload: WebhookPayload) {
  // 1. Verify signature
  if (!verifyGitHubSignature(payload)) {
    return 401
  }
  
  // 2. Extract event data
  const event = extractRewardEvent(payload)
  
  // 3. Map GitHub user to TogetherOS member
  const member = await mapGitHubToMember(payload.sender)
  
  // 4. Create reward event
  const rewardEvent = await createRewardEvent({
    actor_id: member.id,
    event_type: determineEventType(payload),
    source: 'github',
    context: extractContext(payload)
  })
  
  // 5. Process immediately or queue
  await processRewardEvent(rewardEvent)
  
  return 200
}
```

### Event Mapping Examples

**PR Merged:**
```typescript
{
  event_type: 'pr_merged',
  context: {
    pr_number: 42,
    pr_size: 'medium',        // Based on files/lines changed
    files_changed: 8,
    lines_changed: 156,
    repository: 'coopeverything/TogetherOS'
  }
}
```

**Code Review:**
```typescript
{
  event_type: 'pr_reviewed',
  context: {
    pr_number: 42,
    review_quality: 'helpful', // Determined by PR author reaction
    comments_count: 3
  }
}
```

---

## Event Storage (NDJSON)

### Log Format
```typescript
// logs/rewards/events-YYYY-MM-DD.ndjson
{
  "id": "uuid",
  "timestamp": "2025-01-15T10:30:00Z",
  "event_type": "pr_merged",
  "actor_id": "member-uuid",
  "source": "github",
  "context": {
    "pr_number": 42,
    "pr_size": "medium",
    "files_changed": 8,
    "lines_changed": 156
  },
  "weight": 10,
  "status": "processed",
  "content_hash": "sha256..."
}
```

### Validation Rules
- File must be valid NDJSON (each line = JSON object)
- Required fields: `id`, `timestamp`, `event_type`, `actor_id`
- Integrity: SHA-256 chain validation
- Rotation: Daily log files

### CI Validation
```bash
# scripts/validate.sh checks:
# - NDJSON format valid
# - Last line parses successfully
# - Required fields present
# - No duplicate event IDs

# Expected output:
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

---

## Anti-Gaming Safeguards

### Cooldowns
- Same event type: 1 hour minimum between similar actions
- PR spam: Max 5 PRs per day counted
- Review spam: Max 10 reviews per day

### Diversity Checks
- Bonus for contributing across multiple domains
- Penalty for only single-type contributions

### Multi-Review Validation
- Large SP awards (>50) require admin approval
- Suspicious patterns flagged for review
- Appeal process for rejected events

### Public Audit
- All rules and weights published in versioned docs
- Monthly review of reward distribution
- Community proposals can adjust weights

---

## Badge Ruleset (YAML Config)

### Example Configuration
```yaml
badges:
  - id: first-pr
    name: First PR
    description: Merged your first pull request
    icon: 🔧
    rarity: common
    criteria:
      event_types: [pr_merged]
      threshold: 1
  
  - id: foundation-builder
    name: Foundation Builder
    description: Merged 10+ PRs in pre-MVP phase
    icon: 🏗️
    rarity: uncommon
    criteria:
      event_types: [pr_merged]
      threshold: 10
      conditions:
        phase: pre-mvp
  
  - id: bug-hunter
    name: Bug Hunter
    description: Fixed 5+ critical bugs
    icon: 🐛
    rarity: rare
    criteria:
      event_types: [bug_fixed]
      threshold: 5
      conditions:
        severity: critical
  
  - id: module-launcher
    name: Module Launcher
    description: Shipped a complete module to production
    icon: 🚀
    rarity: legendary
    criteria:
      event_types: [pr_merged]
      threshold: 1
      conditions:
        module_complete: true
```

---

## UI Components (Phase B)

### RewardBalance Widget
```typescript
interface RewardBalanceProps {
  memberId: string
}

// Display on member profile sidebar
// Shows: SP total, available, allocated
// Visual: Progress bar toward next level
```

### BadgeCollection
```typescript
interface BadgeCollectionProps {
  badges: Badge[]
  layout: 'grid' | 'list'
}

// Display earned badges with tooltips
// Click to see criteria and progress
```

### RewardHistory
```typescript
interface RewardHistoryProps {
  memberId: string
  limit?: number
}

// Timeline of reward events
// Filter by event type, domain
// Export capability
```

### Leaderboard
```typescript
interface LeaderboardProps {
  period: 'week' | 'month' | 'all-time'
  domain?: CooperationPath
}

// Opt-in only (privacy default)
// Anonymized handles for non-opted-in
// Motivational, not competitive
```

---

## Repository Pattern

### Interface
```typescript
// packages/rewards-domain/repos/RewardEventRepo.ts
export interface RewardEventRepo {
  create(event: CreateRewardEventInput): Promise<RewardEvent>
  findById(id: string): Promise<RewardEvent | null>
  findByMember(memberId: string, filters?: EventFilters): Promise<RewardEvent[]>
  findPending(): Promise<RewardEvent[]>
  markProcessed(id: string): Promise<void>
  checkDuplicate(source: string, context: EventContext): Promise<boolean>
}

export interface EventFilters {
  event_types?: RewardEventType[]
  date_range?: { start: Date; end: Date }
  status?: 'pending' | 'processed' | 'rejected'
  limit?: number
}
```

### In-Memory Implementation (MVP)
```typescript
// packages/rewards-domain/repos/InMemoryRewardEventRepo.ts
export class InMemoryRewardEventRepo implements RewardEventRepo {
  private events: Map<string, RewardEvent> = new Map()

  async create(input: CreateRewardEventInput): Promise<RewardEvent> {
    const event: RewardEvent = {
      id: generateId(),
      actor_id: input.actor_id,
      event_type: input.event_type,
      timestamp: new Date(),
      context: input.context,
      source: input.source,
      weight: calculateWeight(input.event_type, input.context),
      status: 'pending',
    }
    this.events.set(event.id, event)
    return event
  }

  async findByMember(memberId: string, filters?: EventFilters): Promise<RewardEvent[]> {
    let results = Array.from(this.events.values())
      .filter(e => e.actor_id === memberId)

    if (filters?.event_types) {
      results = results.filter(e => filters.event_types!.includes(e.event_type))
    }

    if (filters?.date_range) {
      results = results.filter(e => 
        e.timestamp >= filters.date_range!.start &&
        e.timestamp <= filters.date_range!.end
      )
    }

    return results.slice(0, filters?.limit || 100)
  }

  // ... other methods
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// packages/rewards-domain/__tests__/RewardEvent.test.ts
describe('RewardEvent', () => {
  it('calculates weight for small PR', () => {
    const event = createPREvent({ size: 'small' })
    expect(event.weight).toBe(5)
  })

  it('prevents duplicate events', async () => {
    await repo.create({ source: 'github', context: { pr_number: 42 } })
    const isDupe = await repo.checkDuplicate('github', { pr_number: 42 })
    expect(isDupe).toBe(true)
  })
})
```

### Contract Tests
```typescript
// apps/api/src/modules/rewards/__tests__/createEvent.test.ts
describe('POST /api/rewards/events', () => {
  it('accepts valid event', async () => {
    const response = await request(app)
      .post('/api/rewards/events')
      .send({
        actor_id: 'member-123',
        event_type: 'pr_merged',
        source: 'github',
        context: { pr_number: 42 }
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
  })

  it('rejects duplicate event', async () => {
    // Create first time
    await createEvent({ pr_number: 42 })
    
    // Try duplicate
    const response = await request(app)
      .post('/api/rewards/events')
      .send({ pr_number: 42 })
    
    expect(response.status).toBe(409)
  })
})
```

### Integration Tests
```typescript
// Full flow: GitHub webhook → Event → SP calculation → Badge award
describe('GitHub webhook integration', () => {
  it('awards badge for first PR merge', async () => {
    const payload = createPRMergedPayload({ user: 'alice' })
    await handleWebhook(payload)
    
    const member = await getMember('alice')
    expect(member.badges).toContainBadge('first-pr')
    expect(member.support_points_total).toBe(10)
  })
})
```

---

## Governance & Ethics

### Transparency Commitments
- **Public weights:** All SP calculations documented
- **Versioned rules:** Changes tracked in git with rationale
- **Monthly audits:** Distribution reports published
- **Community proposals:** Weight adjustments via governance

### Consent & Privacy
- **Opt-in leaderboards:** Public display requires consent
- **Anonymized aggregates:** Community stats don't expose individuals
- **Export capability:** Members download their complete history
- **Deletion rights:** Remove from public view anytime

### Fairness Principles
- **Quality over quantity:** Emphasize meaningful contributions
- **Collaboration bonuses:** Reward helping others succeed
- **Empathy weight:** Facilitation and care work valued equally
- **Anti-whale:** Prevent gaming through cooldowns and review

---

## Definition of Done (Phase A)

When Phase A is complete:

✅ Event ledger schema defined and documented
✅ NDJSON storage with daily rotation working
✅ GitHub webhook handler receives PR events
✅ Events mapped to reward events correctly
✅ Deduplication prevents double-counting
✅ Fixture data seeds test events
✅ Validation script checks NDJSON integrity
✅ Unit tests pass for event creation
✅ Contract tests pass for API endpoints
✅ Proof lines in CI: `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`

---

## Contributing (For Developers)

### 🎯 This is the FIRST module open to contributors!

We've designed the Reward System to be accessible with clear, small issues perfect for first-time TogetherOS contributors.

**Why Start Here:**
- Foundation for all future contribution tracking
- Well-scoped tasks with clear acceptance criteria
- Your work directly benefits YOU (you'll earn the first badges!)
- Pattern you establish will be used across all modules

### Getting Started

1. **Read this spec** — Understand the full picture
2. **Check Issues** — Look for `good-first-issue` labels
3. **Join Discussions** — Ask questions in Discussions #88
4. **Small PRs** — One change per PR, well-tested
5. **Follow workflow** — Branch from `Claude-1st-build`, target back to it

### Issue Breakdown Strategy

We've broken Phase A into ~15 small issues, each completable in 2-4 hours:

**Category: Schema & Models**
- Define RewardEvent entity
- Define MemberRewardBalance entity
- Define Badge entity
- Create Zod validation schemas

**Category: Repository Layer**
- Create RewardEventRepo interface
- Implement InMemoryRewardEventRepo
- Add deduplication logic
- Create fixture seed data

**Category: API Layer**
- Create POST /api/rewards/events endpoint
- Create GET /api/rewards/members/:id/balance endpoint
- Add event validation middleware
- Error handling and status codes

**Category: GitHub Integration**
- Setup webhook receiver
- Map PR events to RewardEvent
- Calculate SP weights
- Handle edge cases (bot PRs, etc.)

**Category: Infrastructure**
- NDJSON log writer
- Log rotation (daily)
- Validation script
- CI integration

See detailed issues in GitHub with `module:rewards` label.

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core principles, workflow
- [Architecture](architecture.md) — Domain-driven design, repository pattern
- [Data Models](data-models.md) — Complete entity specifications
- [Social Economy](modules/social-economy.md) — Support Points allocation, timebanking
- [Cooperation Paths](cooperation-paths.md) — All 8 domains that generate rewards
- [CI/CD Discipline](../contributors/WORKFLOW.md) — Proof lines, validation workflows
