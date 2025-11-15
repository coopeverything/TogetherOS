# Bridge-Proposals Integration Architecture

**Status:** Architecture Defined, Implementation Pending
**Last Updated:** 2025-01-15
**Owner:** @coopeverything-core

---

## Overview

This document defines the architecture for integrating Bridge AI with the Governance (Proposals & Decisions) module. Bridge will provide intelligent assistance during proposal creation and deliberation to:

1. **Prevent Duplicates:** Detect similar existing proposals
2. **Ensure Compliance:** Check for conflicts with implemented regulations
3. **Facilitate Clarity:** Initiate conversational clarification when needed
4. **Optimize Communication:** Suggest phrasing improvements

**Important:** This is an architecture document only. The interfaces and contracts are defined here, but implementation is deferred to future phases.

---

## Design Principles

1. **Non-Blocking:** Bridge assistance never prevents proposal submission
2. **Conversational:** Dialogue over automated rejection
3. **Transparent:** Show Bridge reasoning to members
4. **Opt-Out Friendly:** Power users can skip checks with clear warnings
5. **Learning System:** Improve through feedback loops

---

## Core Components

### 1. ProposalIntelligenceService

Central service orchestrating all Bridge-proposal interactions.

**Location:** `apps/api/src/services/bridge/ProposalIntelligenceService.ts`

**Interface:**

```typescript
export interface ProposalIntelligenceService {
  /**
   * Step 1: Similarity Detection
   * Check if proposal is similar to existing proposals or decisions
   *
   * @param draft - Proposal draft to check
   * @returns List of similar proposals above threshold
   */
  checkSimilarity(
    draft: ProposalDraft
  ): Promise<SimilarityCheckResult>

  /**
   * Step 2: Regulation Conflict Check
   * Compare proposal against implemented regulations
   *
   * @param draft - Proposal draft to check
   * @returns List of conflicting regulations
   */
  checkRegulations(
    draft: ProposalDraft
  ): Promise<RegulationCheckResult>

  /**
   * Step 3: Conversational Clarification
   * Initiate dialogue with member if issues found
   *
   * @param proposalId - Proposal ID
   * @param issues - List of similarity matches or regulation conflicts
   * @returns Conversation thread ID for tracking
   */
  initiateClarification(
    proposalId: string,
    issues: Array<SimilarityMatch | RegulationConflict>
  ): Promise<ConversationThread>

  /**
   * Step 4: Phrasing Optimization
   * Suggest improvements to title/summary (non-imposing)
   *
   * @param draft - Proposal draft to analyze
   * @returns List of optional suggestions
   */
  suggestImprovements(
    draft: ProposalDraft
  ): Promise<PhrasingSuggestion[]>
}

interface ProposalDraft {
  title: string
  summary: string
  scopeType: 'individual' | 'group'
  scopeId: string
  authorId: string
}

interface SimilarityCheckResult {
  similarProposals: SimilarityMatch[]
  threshold: number               // e.g., 0.7
  requiresClarification: boolean  // If any match exceeds threshold
}

interface SimilarityMatch {
  id: string
  title: string
  status: string
  similarity: number              // 0.0 to 1.0
  scopeType: string
  scopeId: string
  summary?: string                // For context in dialogue
}

interface RegulationCheckResult {
  conflicts: RegulationConflict[]
  requiresResolution: boolean     // If any blocker-level conflicts
}

interface RegulationConflict {
  regulationId: string
  regulationTitle: string
  conflictDescription: string     // AI-generated explanation
  severity: 'blocker' | 'warning' | 'info'
  suggestedAmendment?: string     // Optional fix suggestion
}

interface ConversationThread {
  id: string
  proposalId: string
  messages: ConversationMessage[]
  status: 'active' | 'resolved' | 'abandoned'
  resolution?: 'modified' | 'proceeded_anyway' | 'withdrawn'
}

interface ConversationMessage {
  role: 'bridge' | 'user'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface PhrasingSuggestion {
  field: 'title' | 'summary'
  originalText: string
  suggestedText: string
  reasoning: string               // Why this is better
  confidence: number              // 0.0 to 1.0
  accepted?: boolean              // Track user response
}
```

---

## Workflow Integration

### Standard Proposal Creation Flow (With Bridge)

```
User submits proposal draft
       ↓
1. Bridge.checkSimilarity()
   ├─ No similar proposals → Continue to step 2
   └─ Similar proposals found (>0.7 threshold) → Initiate clarification
       ├─ Bridge: "I found a similar proposal: [link]. Is this the same idea?"
       ├─ User: "No, mine is different because..."
       └─ Bridge: "Got it. Proceeding with your proposal."
       ↓
2. Bridge.checkRegulations()
   ├─ No conflicts → Continue to step 3
   └─ Conflicts found
       ├─ Severity: blocker → Must address or request exception
       ├─ Severity: warning → Should consider, can proceed
       └─ Severity: info → Informational only
       ↓
3. Bridge.suggestImprovements() (optional)
   ├─ User reviews suggestions
   ├─ Accepts/rejects each
   └─ Final draft prepared
       ↓
4. Proposal status → 'draft' (saved)
   ↓
5. Member transitions → 'research' when ready
   ↓
Community discussion begins
```

### Clarification Dialogue Example

**Scenario:** User proposes "Community garden in Central Park"

**Bridge Detection:**
- Similarity score: 0.82 with existing proposal "Urban garden initiative"
- Status: deliberation

**Dialogue:**

```
Bridge: I found a proposal with 82% similarity:
        "Urban garden initiative" (currently in deliberation)
        https://coopeverything.org/proposals/prop-123

        Key similarities:
        - Both propose community garden spaces
        - Both mention Central Park area
        - Both discuss local food production

        Questions:
        1. Is your proposal the same as this one?
        2. If different, what makes it distinct?

User: Thanks for checking! Mine is different because it focuses
      specifically on the northeast corner, and includes a partnership
      with the school for educational programs. The existing proposal
      is about the southern area.

Bridge: Got it! Your proposal adds:
        - Specific location (NE corner vs. south area)
        - Educational partnership with school

        Would you like me to help refine your title to make this
        distinction clearer? For example:
        "Community garden with school partnership - Central Park NE"

User: Yes, that's better.

Bridge: Great! Proceeding with your refined proposal. No regulation
        conflicts detected. Your proposal is ready to submit.
```

---

## Data Storage

### Proposal Table Fields (Already Prepared)

```sql
-- apps/api/src/modules/governance/entities/Proposal.ts

interface Proposal {
  // ... other fields ...

  // Bridge integration fields
  bridge_similarity_check_done BOOLEAN DEFAULT FALSE
  bridge_similar_proposals JSONB DEFAULT '[]'::jsonb
    -- Stores: [{id, title, similarity, status}]

  bridge_regulation_conflicts JSONB DEFAULT '[]'::jsonb
    -- Stores: [{regulationId, title, severity, description}]

  bridge_clarification_thread_id UUID
    -- Links to conversation thread (future: separate table)
}
```

### Regulations Table (New)

```sql
-- Migration 014: Add regulations schema

CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Regulation metadata
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),          -- 'governance', 'moderation', etc.

  -- Originating proposal
  source_proposal_id UUID REFERENCES proposals(id),
  implemented_at TIMESTAMP NOT NULL,

  -- Full text for semantic search
  full_text TEXT NOT NULL,
  full_text_vector tsvector,      -- PostgreSQL full-text search index

  -- Scope (global or group-specific)
  scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('global', 'group')),
  scope_id UUID,                  -- NULL for global, group.id for group

  -- Status & supersession
  status VARCHAR(50) DEFAULT 'active',
    -- active, superseded, repealed
  superseded_by UUID REFERENCES regulations(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_regulations_scope ON regulations(scope_type, scope_id);
CREATE INDEX idx_regulations_status ON regulations(status);
CREATE INDEX idx_regulations_vector ON regulations USING GIN(full_text_vector);

-- Trigger for full-text search vector
CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE
  ON regulations FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(full_text_vector, 'pg_catalog.english', full_text);
```

---

## Similarity Detection Implementation

### Approach: Semantic Embeddings

**Technology Options:**

1. **OpenAI Embeddings** (Recommended for MVP)
   - Model: `text-embedding-3-small`
   - Dimension: 1536
   - Store embeddings in PostgreSQL with pgvector extension
   - Cosine similarity for matching

2. **Local Embeddings** (Future: Privacy-focused)
   - Model: Sentence Transformers (e.g., `all-MiniLM-L6-v2`)
   - Self-hosted, no external API calls
   - Lower accuracy but better privacy

### Algorithm (Conceptual)

```typescript
// apps/api/src/services/bridge/SimilarityDetector.ts

export class SimilarityDetector {
  /**
   * Check similarity against existing proposals
   */
  async findSimilar(
    draft: ProposalDraft,
    threshold: number = 0.7
  ): Promise<SimilarityMatch[]> {
    // 1. Generate embedding for draft proposal
    const draftEmbedding = await this.generateEmbedding(
      `${draft.title} ${draft.summary}`
    )

    // 2. Query proposals table for similar embeddings
    //    (Exclude archived proposals)
    const query = `
      SELECT
        p.id,
        p.title,
        p.summary,
        p.status,
        p.scope_type,
        p.scope_id,
        1 - (p.embedding <=> $1) AS similarity
      FROM proposals p
      WHERE p.status NOT IN ('archived', 'rejected')
        AND p.deleted_at IS NULL
        AND 1 - (p.embedding <=> $1) > $2
      ORDER BY similarity DESC
      LIMIT 10
    `

    const results = await db.query(query, [draftEmbedding, threshold])

    // 3. Return matches above threshold
    return results.map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      similarity: row.similarity,
      scopeType: row.scope_type,
      scopeId: row.scope_id,
      summary: row.summary.substring(0, 200) + '...'
    }))
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Call OpenAI API or local model
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })
    return response.data[0].embedding
  }
}
```

### Database Schema Addition

```sql
-- Add embedding column to proposals table
ALTER TABLE proposals ADD COLUMN embedding vector(1536);

-- Create index for similarity search
CREATE INDEX idx_proposals_embedding ON proposals
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Trigger to generate embedding on insert/update
CREATE OR REPLACE FUNCTION generate_proposal_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Call external function or service to generate embedding
  -- This is a placeholder - actual implementation depends on setup
  NEW.embedding := generate_embedding_vector(NEW.title || ' ' || NEW.summary);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposal_embedding_trigger
  BEFORE INSERT OR UPDATE OF title, summary ON proposals
  FOR EACH ROW EXECUTE FUNCTION generate_proposal_embedding();
```

**Note:** Requires `pgvector` extension. Installation:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Regulation Conflict Checking

### Approach: Hybrid Search

Combine PostgreSQL full-text search (tsvector) with semantic embeddings for best results.

```typescript
// apps/api/src/services/bridge/RegulationChecker.ts

export class RegulationChecker {
  /**
   * Check proposal against regulations
   */
  async checkConflicts(
    draft: ProposalDraft
  ): Promise<RegulationConflict[]> {
    // 1. Get relevant regulations (scope match)
    const regulations = await this.getRelevantRegulations(
      draft.scopeType,
      draft.scopeId
    )

    if (regulations.length === 0) {
      return []
    }

    // 2. Full-text search (fast initial filter)
    const textMatches = await this.fullTextSearch(
      `${draft.title} ${draft.summary}`,
      regulations
    )

    // 3. Semantic analysis (detailed conflict detection)
    const conflicts: RegulationConflict[] = []

    for (const reg of textMatches) {
      const conflict = await this.analyzeConflict(draft, reg)
      if (conflict) {
        conflicts.push(conflict)
      }
    }

    // 4. Sort by severity
    return conflicts.sort((a, b) => {
      const severityOrder = { blocker: 0, warning: 1, info: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  private async fullTextSearch(
    proposalText: string,
    regulations: Regulation[]
  ): Promise<Regulation[]> {
    // Use PostgreSQL tsvector for keyword matching
    const query = `
      SELECT r.*, ts_rank(r.full_text_vector, plainto_tsquery($1)) AS rank
      FROM regulations r
      WHERE r.status = 'active'
        AND r.full_text_vector @@ plainto_tsquery($1)
        AND ts_rank(r.full_text_vector, plainto_tsquery($1)) > 0.1
      ORDER BY rank DESC
      LIMIT 20
    `

    return await db.query(query, [proposalText])
  }

  private async analyzeConflict(
    draft: ProposalDraft,
    regulation: Regulation
  ): Promise<RegulationConflict | null> {
    // Use LLM to determine if there's a real conflict
    const prompt = `
      Proposal:
      Title: ${draft.title}
      Summary: ${draft.summary}

      Regulation:
      Title: ${regulation.title}
      Text: ${regulation.fullText}

      Question: Does this proposal conflict with the regulation?
      If yes, explain the conflict and suggest severity:
      - blocker: Direct contradiction, cannot proceed
      - warning: Potential issue, should address
      - info: Related but not conflicting

      Respond in JSON format:
      {
        "conflicts": true/false,
        "severity": "blocker"|"warning"|"info",
        "description": "...",
        "suggestedAmendment": "..." (optional)
      }
    `

    const response = await this.llm.analyze(prompt)

    if (!response.conflicts) {
      return null
    }

    return {
      regulationId: regulation.id,
      regulationTitle: regulation.title,
      conflictDescription: response.description,
      severity: response.severity,
      suggestedAmendment: response.suggestedAmendment
    }
  }

  private async getRelevantRegulations(
    scopeType: string,
    scopeId: string
  ): Promise<Regulation[]> {
    // Get global regulations + scope-specific regulations
    const query = `
      SELECT * FROM regulations
      WHERE status = 'active'
        AND (
          scope_type = 'global'
          OR (scope_type = $1 AND scope_id = $2)
        )
      ORDER BY implemented_at DESC
    `

    return await db.query(query, [scopeType, scopeId])
  }
}
```

---

## Conversational Clarification

### UI Flow

**Step 1: Detection**
- Bridge finds similar proposals or regulation conflicts
- Show modal: "Bridge has some questions about your proposal"

**Step 2: Dialogue**
- Chat interface with Bridge
- Bridge asks clarifying questions
- User responds
- Bridge summarizes understanding

**Step 3: Resolution**
- User options:
  - Modify proposal based on feedback
  - Proceed anyway (with explanation recorded)
  - Withdraw proposal

**Component Structure:**

```typescript
// packages/ui/src/governance/BridgeClarificationModal.tsx

interface BridgeClarificationModalProps {
  proposalId: string
  issues: Array<SimilarityMatch | RegulationConflict>
  onResolved: (resolution: 'modified' | 'proceeded' | 'withdrawn') => void
  onCancel: () => void
}

export function BridgeClarificationModal(props: BridgeClarificationModalProps) {
  // Chat interface
  // Message history
  // Input field
  // Action buttons: Modify / Proceed Anyway / Withdraw
}
```

### API Endpoints

```typescript
// POST /api/bridge/proposals/:id/clarify
{
  userMessage: string
}

// Response
{
  bridgeMessage: string
  suggestedActions: Array<{
    type: 'modify' | 'proceed' | 'withdraw'
    label: string
    description: string
  }>
  threadId: string
  status: 'active' | 'resolved'
}

// POST /api/bridge/proposals/:id/resolve
{
  resolution: 'modified' | 'proceeded_anyway' | 'withdrawn'
  finalExplanation?: string
}

// Response
{
  status: 'resolved'
  updatedProposal?: Proposal  // If modified
}
```

---

## Phrasing Optimization

### Non-Imposing Suggestions

Bridge offers suggestions but never forces changes.

**Example:**

```
Bridge: I noticed your proposal title could be more specific.
        Current: "Fix the park"
        Suggestion: "Repair Central Park playground equipment"

        This helps community members understand exactly what you're
        proposing without reading the full summary.

        [Accept Suggestion]  [Keep Original]  [Edit Manually]
```

### Implementation

```typescript
// apps/api/src/services/bridge/PhrasingOptimizer.ts

export class PhrasingOptimizer {
  async suggestImprovements(
    draft: ProposalDraft
  ): Promise<PhrasingSuggestion[]> {
    const suggestions: PhrasingSuggestion[] = []

    // Title analysis
    const titleSuggestion = await this.analyzeTitle(draft.title)
    if (titleSuggestion) {
      suggestions.push(titleSuggestion)
    }

    // Summary analysis
    const summarySuggestion = await this.analyzeSummary(draft.summary)
    if (summarySuggestion) {
      suggestions.push(summarySuggestion)
    }

    return suggestions
  }

  private async analyzeTitle(title: string): Promise<PhrasingSuggestion | null> {
    // Check for common issues:
    // - Too vague ("Fix things")
    // - Too long (>100 chars)
    // - Missing action verb
    // - All caps or excessive punctuation

    const prompt = `
      Proposal title: "${title}"

      Evaluate this title for clarity and actionability.
      If it could be improved, suggest a better version.

      Criteria:
      - Specific and concrete
      - Action-oriented
      - Appropriate length (10-80 chars)
      - Professional tone

      Respond in JSON:
      {
        "needsImprovement": true/false,
        "suggestedTitle": "...",
        "reasoning": "...",
        "confidence": 0.0-1.0
      }
    `

    const response = await this.llm.analyze(prompt)

    if (!response.needsImprovement || response.confidence < 0.7) {
      return null
    }

    return {
      field: 'title',
      originalText: title,
      suggestedText: response.suggestedTitle,
      reasoning: response.reasoning,
      confidence: response.confidence
    }
  }

  private async analyzeSummary(summary: string): Promise<PhrasingSuggestion | null> {
    // Similar analysis for summary
    // Check for: clarity, structure, actionability
  }
}
```

---

## API Routes

All Bridge-proposal integration endpoints:

```
POST   /api/bridge/proposals/check-similarity
POST   /api/bridge/proposals/check-regulations
POST   /api/bridge/proposals/clarify/:proposalId
POST   /api/bridge/proposals/resolve/:proposalId
POST   /api/bridge/proposals/improve-phrasing
GET    /api/bridge/proposals/:proposalId/clarification-thread
```

---

## Configuration & Feature Flags

Bridge integration should be toggleable:

```typescript
// apps/api/src/config/features.ts

export const FEATURE_FLAGS = {
  BRIDGE_PROPOSALS_SIMILARITY: process.env.BRIDGE_PROPOSALS_SIMILARITY === 'true',
  BRIDGE_PROPOSALS_REGULATIONS: process.env.BRIDGE_PROPOSALS_REGULATIONS === 'true',
  BRIDGE_PROPOSALS_PHRASING: process.env.BRIDGE_PROPOSALS_PHRASING === 'true',
}

// Usage in handlers
if (FEATURE_FLAGS.BRIDGE_PROPOSALS_SIMILARITY) {
  const similarProposals = await proposalIntelligence.checkSimilarity(draft)
  // ...
}
```

**Environment Variables:**

```bash
# .env.local
BRIDGE_PROPOSALS_SIMILARITY=false  # MVP: Disabled
BRIDGE_PROPOSALS_REGULATIONS=false # MVP: Disabled
BRIDGE_PROPOSALS_PHRASING=false    # MVP: Disabled
```

---

## Testing Strategy

### Unit Tests

```typescript
// apps/api/src/services/bridge/__tests__/SimilarityDetector.test.ts

describe('SimilarityDetector', () => {
  it('detects identical proposals', async () => {
    const draft = { title: 'Community garden', summary: '...' }
    const existing = { title: 'Community garden', summary: '...' }

    const result = await detector.findSimilar(draft, 0.7)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].similarity).toBeGreaterThan(0.9)
  })

  it('ignores low-similarity proposals', async () => {
    const draft = { title: 'Community garden', summary: '...' }
    const existing = { title: 'Software deployment', summary: '...' }

    const result = await detector.findSimilar(draft, 0.7)

    expect(result.length).toBe(0)
  })
})
```

### Integration Tests

```typescript
// apps/api/src/modules/governance/__tests__/bridge-integration.test.ts

describe('Bridge-Proposals Integration', () => {
  it('workflow: similarity check → clarification → resolution', async () => {
    // 1. Create draft proposal
    const draft = await proposalRepo.create({ title: 'Garden', summary: '...' })

    // 2. Check similarity
    const similar = await bridge.checkSimilarity(draft)
    expect(similar.requiresClarification).toBe(true)

    // 3. Initiate clarification
    const thread = await bridge.initiateClarification(draft.id, similar.similarProposals)
    expect(thread.status).toBe('active')

    // 4. User responds
    await bridge.addMessage(thread.id, 'Mine is different because...')

    // 5. Resolve
    await bridge.resolve(thread.id, 'proceeded_anyway', 'Explained difference')
    expect(thread.status).toBe('resolved')
  })
})
```

---

## Performance Considerations

### Caching

- **Embeddings:** Cache generated embeddings (avoid regenerating for unchanged text)
- **Regulations:** Cache active regulations list (refresh hourly)
- **Similarity results:** Cache for 5 minutes (proposals change slowly)

### Async Processing

- **Similarity checks:** Run in background (show "Checking..." UI)
- **Regulation checks:** Queue-based processing for heavy analysis
- **Timeouts:** 30-second max for Bridge operations (fail gracefully)

### Rate Limiting

- **Per user:** Max 10 Bridge clarification sessions per hour
- **Per proposal:** Max 3 similarity checks per proposal (prevent abuse)

---

## Privacy & Security

### Data Handling

- **No raw prompts stored:** Only structured results saved
- **Conversation threads:** Encrypted at rest, user-deletable
- **Embeddings:** Not reverse-engineerable to original text
- **Regulation data:** Public by default (community transparency)

### Access Control

- **Clarification threads:** Only proposal author can access
- **Regulation conflicts:** Visible to all members (transparency)
- **Bridge suggestions:** Non-binding, always user's choice

---

## Migration Path

### Phase 1: Schema Preparation (MVP)
- ✅ Add Bridge fields to proposals table (unused)
- ✅ Create regulations table
- ✅ Document architecture (this file)

### Phase 2: Similarity Detection (Post-MVP)
- Install pgvector extension
- Implement SimilarityDetector service
- Create similarity check API endpoint
- Build clarification modal UI
- Feature flag: BRIDGE_PROPOSALS_SIMILARITY=true

### Phase 3: Regulation Checking
- Seed initial regulations
- Implement RegulationChecker service
- Create regulation conflict API endpoint
- Update clarification UI for conflicts
- Feature flag: BRIDGE_PROPOSALS_REGULATIONS=true

### Phase 4: Phrasing Optimization
- Implement PhrasingOptimizer service
- Create suggestion API endpoint
- Build suggestion UI component
- Feature flag: BRIDGE_PROPOSALS_PHRASING=true

### Phase 5: Learning & Improvement
- Collect feedback on Bridge suggestions
- Track acceptance rates
- Fine-tune similarity thresholds
- Improve conflict detection accuracy

---

## Implementation Checklist

When implementing Bridge integration:

- [ ] Install pgvector extension on PostgreSQL
- [ ] Create ProposalIntelligenceService interface
- [ ] Implement SimilarityDetector
- [ ] Implement RegulationChecker
- [ ] Implement PhrasingOptimizer
- [ ] Create API routes for Bridge endpoints
- [ ] Build clarification modal UI component
- [ ] Build suggestion UI component
- [ ] Add feature flags to config
- [ ] Write unit tests for all services
- [ ] Write integration tests for workflows
- [ ] Document API endpoints in OpenAPI spec
- [ ] Add Bridge usage to user documentation
- [ ] Monitor performance metrics
- [ ] Set up error tracking (Sentry)

---

## Related Documentation

- [Governance Module Spec](../modules/governance.md)
- [Bridge Module Spec](../modules/bridge.md)
- Support Points Integration (coming soon)
- [Data Models](../data-models.md)
- API Conventions (coming soon)

---

**END OF ARCHITECTURE DOCUMENT**

**Implementation Status:** Not yet started (architecture only)
**Next Step:** Implement Phase 1 (Schema Preparation) as part of Governance MVP
