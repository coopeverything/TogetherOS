# Governance Module - Technical Debt & Architectural Decisions

**Module**: Governance (Proposals & Decisions)
**Status**: 50% Complete (MVP Phase)
**Date**: 2025-11-05
**Last Updated**: 2025-11-05

---

## Purpose

This document captures architectural decisions, known limitations, and technical debt in the Governance module. It serves as a reference for future refactoring and provides context for implementation choices made during the MVP phase.

---

## Executive Summary

The Governance module was built with intentional trade-offs to enable rapid MVP delivery while maintaining extensibility. Key decisions:

- **JSONB for complex relationships** - Fast to implement, but limits query capabilities
- **Polymorphic associations without constraints** - Flexible, but requires trigger-based validation
- **Bridge AI fields prepared but unused** - Future-proofing without immediate implementation
- **In-memory repositories first** - Rapid prototyping with PostgreSQL migration path

**Overall Risk**: Medium (suitable for MVP, requires attention at scale)

---

## Architectural Weaknesses

### 1. JSONB Overuse for Complex Relationships

**Status**: Shipped in MVP
**Severity**: Medium
**Impact Timeline**: Performance degradation at >1000 proposals

#### Current Implementation

```sql
-- proposals table (migration 013)
evidence JSONB DEFAULT '[]'::jsonb,
options JSONB DEFAULT '[]'::jsonb,
positions JSONB DEFAULT '[]'::jsonb,
```

Complex nested data (evidence, options, positions) stored in JSONB arrays instead of normalized tables.

#### Problems

- ❌ No foreign key constraints to validate nested data integrity
- ❌ Difficult to query individual evidence items (e.g., "find all proposals with expert evidence")
- ❌ Hard to enforce schema changes on nested objects
- ❌ Potential for data bloat (JSONB can grow unbounded)
- ❌ Cannot efficiently filter by evidence author or evidence type
- ❌ Full-text search across evidence requires custom functions

#### Recommended Future Fix (Phase 2)

Normalize evidence into separate table:

```sql
CREATE TABLE proposal_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- 'research', 'data', 'expert', 'precedent'
  title VARCHAR(200) NOT NULL,
  url TEXT,
  summary TEXT NOT NULL,
  attached_by UUID NOT NULL REFERENCES users(id),
  attached_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_evidence_proposal (proposal_id),
  INDEX idx_evidence_type (type),
  INDEX idx_evidence_author (attached_by)
);

-- Similarly for options and positions
CREATE TABLE proposal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  estimated_cost NUMERIC(12,2),
  estimated_time_weeks INTEGER,
  trade_offs JSONB,  -- Keep trade-offs as JSONB (flexible structure)
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_options_proposal (proposal_id)
);

CREATE TABLE proposal_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id),
  stance VARCHAR(20) NOT NULL,  -- 'support', 'oppose', 'abstain', 'block'
  reasoning TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_positions_proposal (proposal_id),
  INDEX idx_positions_member (member_id),
  UNIQUE(proposal_id, member_id)  -- One position per member per proposal
);
```

**Migration Strategy:**
1. Create new tables alongside existing JSONB columns
2. Write migration script to copy data from JSONB to new tables
3. Update application code to use new tables
4. Deprecate JSONB columns (keep for rollback safety)
5. After 30 days production stability, drop JSONB columns

**Benefits:**
- Referential integrity via foreign keys
- Efficient querying (find proposals by evidence author, type, etc.)
- Better performance at scale (indexed queries vs full JSONB scans)
- Clearer schema evolution path

---

### 2. Lack of Referential Integrity for Polymorphic scope_id

**Status**: ✅ **FIXED** (2025-11-05)
**Severity**: Medium → Low
**Fix Applied**: Trigger-based validation

#### Original Problem

`scope_id` can reference `users.id` OR `groups.id` but had no foreign key constraint.

**Impact:**
- ❌ Orphaned proposals if user/group deleted
- ❌ No database-level guarantee of valid scope_id

#### Solution Applied

Added trigger-based validation in migration 013:

```sql
CREATE OR REPLACE FUNCTION validate_proposal_scope()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate individual proposals reference valid users
  IF NEW.scope_type = 'individual' THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.scope_id) THEN
      RAISE EXCEPTION 'Invalid individual scope_id: % (user does not exist)', NEW.scope_id;
    END IF;
    -- Individual proposals must have scope_id = author_id
    IF NEW.scope_id != NEW.author_id THEN
      RAISE EXCEPTION 'Individual proposals must have scope_id equal to author_id';
    END IF;

  -- Validate group proposals reference valid groups
  ELSIF NEW.scope_type = 'group' THEN
    IF NOT EXISTS (SELECT 1 FROM groups WHERE id = NEW.scope_id AND deleted_at IS NULL) THEN
      RAISE EXCEPTION 'Invalid group scope_id: % (group does not exist or is deleted)', NEW.scope_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_proposal_scope_trigger
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION validate_proposal_scope();
```

**Status**: ✅ Production-ready

---

### 3. Bridge Integration Fields Prepared but Unused

**Status**: Accepted technical debt (intentional)
**Severity**: Low
**Impact**: Schema complexity without immediate value

#### Current State

```sql
-- proposals table (migration 013)
bridge_similarity_check_done BOOLEAN DEFAULT FALSE,
bridge_similar_proposals JSONB DEFAULT '[]'::jsonb,
bridge_regulation_conflicts JSONB DEFAULT '[]'::jsonb,
bridge_clarification_thread_id UUID,
```

Bridge AI integration fields exist but have no implementation yet.

#### Impact

- ✅ Good for future-proofing (no schema migration needed later)
- ⚠️ Adds complexity to initial schema without immediate value
- ⚠️ `bridge_clarification_thread_id` has no foreign key (conversation_threads table doesn't exist yet)
- ⚠️ JSONB fields will need indexing when Bridge is implemented

#### Future Implementation Path

See `docs/architecture/bridge-proposals-integration.md` for complete architecture.

**When to implement:**
- After Proposals module reaches 10% production usage
- When 50+ proposals exist in system
- When duplicate/similar proposals become a moderation issue

**Migration needed:**
```sql
-- Add conversation_threads table when Bridge messaging is implemented
CREATE TABLE conversation_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL,  -- 'active', 'resolved', 'abandoned'
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Add foreign key constraint to proposals
ALTER TABLE proposals
  ADD CONSTRAINT fk_bridge_clarification_thread
  FOREIGN KEY (bridge_clarification_thread_id)
  REFERENCES conversation_threads(id)
  ON DELETE SET NULL;
```

**Recommendation**: ✅ Keep fields as-is (low cost, high future value)

---

### 4. Missing Audit Trail for Proposal Changes

**Status**: Deferred to Phase 2
**Severity**: High (critical for governance transparency)
**Impact**: No rollback capability, transparency gap

#### Problem

No audit log for who changed what in proposals (title, summary, status transitions).

**Governance requirements:**
- Full accountability (who changed status to 'decided'?)
- Rollback capability for accidental changes
- Transparency (public record of all proposal edits)

#### Recommended Implementation (Phase 2)

```sql
CREATE TABLE proposal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,  -- 'title', 'status', 'summary', etc.
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,  -- Optional user-provided reason
  changed_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_audit_proposal (proposal_id, changed_at DESC),
  INDEX idx_audit_user (changed_by, changed_at DESC)
);

-- Trigger to log all proposal changes
CREATE OR REPLACE FUNCTION log_proposal_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log actual changes (not same values)
  IF OLD.title != NEW.title THEN
    INSERT INTO proposal_audit_log (proposal_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, current_setting('app.current_user_id')::uuid, 'title', OLD.title, NEW.title);
  END IF;

  IF OLD.status != NEW.status THEN
    INSERT INTO proposal_audit_log (proposal_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, current_setting('app.current_user_id')::uuid, 'status', OLD.status::text, NEW.status::text);
  END IF;

  -- Add more fields as needed

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_proposal_changes
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION log_proposal_changes();
```

**Note**: Requires setting `app.current_user_id` session variable in API handlers.

**Priority**: Implement before public launch (essential for governance credibility)

---

## Tight Coupling Issues

### 1. Support Points Allocations Depend on String Literal 'proposal'

**Status**: Verified safe (2025-11-05)
**Severity**: Low → Informational
**Impact**: None (implementation is intentionally flexible)

#### Current Implementation

```sql
-- support_points_allocations table
target_type VARCHAR(50) NOT NULL,  -- 'proposal', 'initiative', 'event'
target_id UUID NOT NULL
```

Support Points use string literal 'proposal' to reference proposals. No ENUM constraint.

#### Analysis

✅ **Support Points handlers FULLY support 'proposal' target_type:**
- `allocateSupportPoints(memberId, targetType, targetId, amount)` - accepts any targetType
- No validation on specific targetType values (intentionally flexible)
- Database queries use targetType directly: `WHERE target_type = $1`
- Tested with Support Points allocation/reclaim functions

**Verified functions:**
- `lib/db/support-points.ts::allocateSupportPoints()` - line 103
- `lib/db/support-points.ts::reclaimSupportPoints()` - line 182
- `lib/db/support-points.ts::getTargetAllocations()` - line 312
- `apps/web/app/api/support-points/allocate/route.ts` - line 19

#### Optional Future Enhancement

Convert to ENUM for type safety (not blocking):

```sql
CREATE TYPE allocation_target_type AS ENUM ('proposal', 'initiative', 'event');

ALTER TABLE support_points_allocations
  ALTER COLUMN target_type TYPE allocation_target_type
  USING target_type::allocation_target_type;

ALTER TABLE support_points_transactions
  ALTER COLUMN target_type TYPE allocation_target_type
  USING target_type::allocation_target_type;
```

**Recommendation**: ⚠️ Consider for Phase 3 (nice-to-have, not required)

---

### 2. GroupProposals UI Component Type Mismatch

**Status**: ✅ **FIXED** (PR #213)
**Severity**: High → Resolved
**Fix Applied**: Import governance types

#### Original Problem

`packages/ui/src/groups/GroupProposals.tsx` defined its own incomplete `Proposal` interface:

```typescript
// OLD (incomplete)
export interface Proposal {
  id: string
  title: string
  summary: string
  status: 'draft' | 'deliberation' | 'voting' | 'decided'  // Missing 4 status types!
  authorId: string
  authorName: string
  createdAt: Date
  voteCount?: number
}
```

Missing status types: 'research', 'delivery', 'reviewed', 'archived'

**Impact:**
- UI wouldn't display proposals in missing statuses
- Type mismatch between API responses and UI component
- Filter buttons missing for 4 status types

#### Solution Applied (PR #213)

```typescript
// NEW (imports governance types)
import type { Proposal, ProposalStatus } from '@togetheros/types'

export type GroupProposalDisplay = Proposal & {
  authorName: string
  voteCount?: number
}

// Updated getStatusColor() to handle all 8 status types
function getStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'research': return 'bg-yellow-100 text-yellow-800'
    case 'deliberation': return 'bg-blue-100 text-blue-800'
    case 'voting': return 'bg-purple-100 text-purple-800'
    case 'decided': return 'bg-green-100 text-green-800'
    case 'delivery': return 'bg-indigo-100 text-indigo-800'
    case 'reviewed': return 'bg-teal-100 text-teal-800'
    case 'archived': return 'bg-slate-100 text-slate-600'
  }
}

// Added filter buttons for all 8 status types
```

**Status**: ✅ Production-ready (depends on PR #209 types being merged)

---

## Database Design Notes

### Soft Delete Pattern

All core entities use `deleted_at TIMESTAMP` for soft deletes:
- ✅ `proposals.deleted_at`
- ❌ `regulations.deleted_at` - **MISSING**

**Inconsistency:** Regulations table has no soft delete column.

**Fix:**
```sql
ALTER TABLE regulations ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_regulations_deleted_at ON regulations(deleted_at);

-- Update queries to filter out soft-deleted
-- WHERE deleted_at IS NULL
```

**Priority**: Low (regulations use `status='repealed'` which serves similar purpose)

---

### Missing Indexes for Common Queries

JSONB fields have GIN indexes for full-text search, but not for specific queries.

**Example slow queries:**
- "Find proposals with evidence from a specific author" - requires full JSONB scan
- "Find proposals with options estimated under $1000" - no cost index

**Future optimization (after JSONB → normalized tables migration):**
```sql
-- Once evidence is normalized:
CREATE INDEX idx_proposal_evidence_author ON proposal_evidence(attached_by);
CREATE INDEX idx_proposal_evidence_type ON proposal_evidence(type);

-- Once options are normalized:
CREATE INDEX idx_proposal_options_cost ON proposal_options(estimated_cost);
```

**Priority**: Low (optimize after query patterns are known in production)

---

## Migration Strategy Recommendations

### For Future Modules

**1. Normalize Complex Relationships Early**

Instead of JSONB arrays for entities with lifecycle, create dedicated tables from the start.

**Benefits:**
- Referential integrity via foreign keys
- Easier to query and report on sub-entities
- Better performance at scale

**Pattern:**
```sql
-- INSTEAD OF: proposals.evidence JSONB
-- DO: proposal_evidence table with foreign key
```

---

**2. Use ENUMs for Fixed Value Sets**

All fields with fixed valid values should use PostgreSQL ENUMs, not VARCHAR checks.

**Benefits:**
- Database-level validation
- Auto-complete in tools
- Type safety in generated schemas

**Pattern:**
```sql
-- INSTEAD OF: target_type VARCHAR(50)
-- DO: target_type allocation_target_type (ENUM)
```

---

**3. Add Audit Logging from Day One**

For governance/transactional modules, include audit tables in initial migration.

**Pattern:**
```sql
CREATE TABLE {module}_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES {module}(id),
  changed_by UUID NOT NULL REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);
```

**Critical for:**
- Governance decisions
- Financial transactions
- Moderation actions
- Role changes

---

**4. Enforce Polymorphic Relationships with Triggers**

When using polymorphic associations (like `scope_id` referencing multiple tables), add trigger-based validation.

**Pattern:** See "Lack of Referential Integrity" section above for `validate_proposal_scope()` trigger.

---

**5. Plan for Federation Early**

If module will support cross-group or federated operations, design schema with `scope_type` and `scope_id` from start.

**Governance already does this correctly:**
```sql
scope_type proposal_scope_type NOT NULL,  -- 'individual' or 'group'
scope_id UUID NOT NULL,  -- user.id or group.id
```

**Benefits:**
- Single-table design (avoid per-group sharding)
- Easy to extend to federated groups
- Clear ownership boundaries

---

## Known Limitations (MVP Phase)

### 1. No Proposal Templates

**Impact**: Users must draft proposals from scratch
**Priority**: Phase 2 (nice-to-have)

**Future enhancement:**
- Pre-defined proposal templates (budget, policy, initiative, etc.)
- Auto-filled sections with guidance
- Examples and best practices

---

### 2. No Voting Implementation

**Impact**: Proposals can reach 'voting' status but no voting UI/logic exists
**Priority**: Phase 2 (critical for full governance workflow)

**Required:**
- Voting UI component
- Vote tallying logic
- Quorum calculations
- Voting rules (consensus, majority, supermajority, etc.)
- Anonymous voting option

---

### 3. No Delivery Tracking

**Impact**: Approved proposals have no implementation tracking
**Priority**: Phase 2 (important for accountability)

**Future enhancement:**
- Link proposals to GitHub issues/PRs
- Progress tracking UI
- Delivery milestones
- Completion verification

---

### 4. No Notification System Integration

**Impact**: Members don't get notified of proposal status changes
**Priority**: Phase 2 (user experience)

**Required:**
- Notification preferences
- Email/in-app notifications for:
  - New proposals in member's groups
  - Status changes on proposals member authored
  - Proposals entering voting phase
  - Decisions reached

---

## Performance Considerations

### Query Performance at Scale

**Current MVP performance (estimated):**
- < 1000 proposals: ✅ Good (JSONB queries acceptable)
- 1000-10,000 proposals: ⚠️ Monitor (JSONB full scans may slow down)
- > 10,000 proposals: ❌ Requires normalization (see "JSONB Overuse" section)

**Optimization triggers:**
- List page load time > 500ms (p95)
- Search/filter queries > 1s
- Evidence/options queries requiring full JSONB scans

**Mitigation:**
1. Add pagination (limit 50 proposals per page)
2. Add caching (Redis for frequently accessed proposals)
3. Migrate to normalized tables (see "Architectural Weaknesses #1")

---

### Database Connection Pooling

**Current**: TogetherOS uses pg connection pool (max 20 connections)

**Proposal module impact:**
- Read-heavy workload (list, view, search)
- Write-moderate (create, update proposal)
- Allocation operations require transactions (locks balances table)

**Recommendations:**
- Monitor connection pool usage in production
- Add read replica if list queries exceed 100 req/min
- Consider caching proposal lists (invalidate on create/update)

---

## Security Considerations

### Authorization Model

**Current implementation:**
- ✅ Author-only modification (enforced in API handlers)
- ✅ Authentication required for all write operations
- ✅ Read access: public (anyone can view proposals)

**Future enhancements:**
- Group-specific permissions (group admins can edit any group proposal)
- Role-based access (facilitators can transition proposal status)
- Private proposals (draft proposals not visible until published)

### Input Validation

**Current:**
- ✅ Zod validation on all API inputs
- ✅ Title length (3-200 chars)
- ✅ Summary length (10-2000 chars)
- ✅ Status transition validation (state machine)

**Risks:**
- ⚠️ No rate limiting on proposal creation (potential spam)
- ⚠️ No profanity filter on title/summary
- ⚠️ No URL validation in evidence links

**Recommended additions (Phase 2):**
```typescript
// Rate limiting (API middleware)
const createProposalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,  // Max 10 proposals per hour per user
})

// Content moderation (before save)
const moderationResult = await moderateContent({
  text: `${proposal.title} ${proposal.summary}`,
  userId: user.id
})
if (moderationResult.flagged) {
  throw new Error('Content violates community guidelines')
}

// URL validation (for evidence links)
const urlSchema = z.string().url().refine(
  (url) => {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  },
  { message: 'Only HTTP/HTTPS URLs allowed' }
)
```

---

## Testing Gaps (MVP Phase)

**Current test coverage:**
- ✅ Entity creation and updates (unit tests)
- ✅ Repository interface compliance (contract tests)
- ❌ **Missing**: Integration tests (API → DB flow)
- ❌ **Missing**: Authorization tests (author-only modification)
- ❌ **Missing**: State transition tests (invalid status changes)
- ❌ **Missing**: Support Points integration tests

**Recommended before public launch:**
```typescript
// Integration test example
describe('Proposals API', () => {
  it('should prevent non-authors from updating proposal', async () => {
    const author = await createTestUser()
    const otherUser = await createTestUser()

    const proposal = await createProposal({
      scopeType: 'individual',
      scopeId: author.id,
      authorId: author.id,
      title: 'Test Proposal',
      summary: 'Test summary'
    })

    const response = await request(app)
      .put(`/api/proposals/${proposal.id}`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send({ title: 'Hacked title' })

    expect(response.status).toBe(403)
    expect(response.body.error).toContain('author')
  })
})
```

---

## Deployment Checklist

Before deploying Governance module to production:

### Database Migrations
- [x] ✅ Migration 013 (proposals schema) - includes scope validation trigger
- [x] ✅ Migration 014 (regulations schema)
- [ ] ⚠️ Verify migrations run successfully on production database
- [ ] ⚠️ Backup database before running migrations

### API Endpoints
- [x] ✅ POST /api/proposals (create)
- [x] ✅ GET /api/proposals (list with filters)
- [x] ✅ GET /api/proposals/:id (retrieve)
- [x] ✅ PUT /api/proposals/:id (update)
- [x] ✅ DELETE /api/proposals/:id (soft delete)
- [ ] ⚠️ Verify all endpoints return correct status codes
- [ ] ⚠️ Test authentication on all write endpoints

### UI Components
- [x] ✅ GroupProposals component updated (PR #213)
- [ ] ⚠️ Create ProposalList page (individual proposals)
- [ ] ⚠️ Create ProposalView page (detail view)
- [ ] ⚠️ Create ProposalCreate page (form)

### Integration Tests
- [ ] ❌ Create → List → View flow
- [ ] ❌ Authorization (author-only modification)
- [ ] ❌ Support Points allocation to proposals
- [ ] ❌ Status transitions (valid/invalid)

### Monitoring
- [ ] ⚠️ Add Sentry error tracking for governance module
- [ ] ⚠️ Add metrics for proposal creation rate
- [ ] ⚠️ Monitor database query performance (proposal list queries)

---

## Related Documentation

- [Governance Module Spec](../modules/governance.md) - Complete requirements
- [Bridge-Proposals Integration](./bridge-proposals-integration.md) - Future AI features
- [TogetherOS Architecture](../TogetherOS_WhitePaper.md) - System-wide patterns
- [CI/CD Discipline](../.claude/knowledge/ci-cd-discipline.md) - Deployment workflows

---

## Changelog

### 2025-11-05
- **Initial version**: Documented MVP phase technical debt
- **Fixed CONCERN-001**: Added scope_id validation trigger (migration 013)
- **Fixed CONCERN-003**: Updated GroupProposals UI component types (PR #213)
- **Verified CONCERN-002**: Support Points integration confirmed working
- **Created**: Comprehensive conflict analysis report (Opus 4.1)

---

## Review Schedule

This document should be reviewed and updated:
- **After each major release** (when new features add technical debt)
- **Quarterly** (to reassess priority of deferred items)
- **Before refactoring sprints** (to guide improvement work)

**Next Review**: 2025-12-05 (30 days after initial version)
