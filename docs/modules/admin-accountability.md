# Admin Accountability Module

## Overview

The Admin Accountability module provides transparent tracking of the decision → implementation → verification pipeline in TogetherOS's cooperative governance model. Admins execute decisions made democratically by workgroups and assemblies, with full traceability and accountability mechanisms.

**Current Progress:** <!-- progress:admin-accountability=0 --> 0%

**Category:** Cooperative Technology, Collective Governance

---

## Core Purpose

Enable communities to:
- Track decisions from proposal to implementation to verification
- Assign implementation tasks to admins/stewards with clear accountability
- Classify settings by authorization level (assembly vote vs admin discretion)
- Maintain public audit logs of all admin actions (NDJSON format)
- Recall underperforming admins through democratic process
- Ensure admins execute decisions rather than make them unilaterally

---

## Key Concepts

### Cooperative Admin Model

TogetherOS redefines "admin" as a **rotating, recallable role** that **executes group decisions** rather than wielding unilateral power:

- **Rotating:** Admin terms have expiration dates (configurable per group)
- **Recallable:** Groups can vote to remove admins before term ends
- **Executors:** Admins implement decisions made through proposals
- **Accountable:** Every action logged with authorizing decision ID
- **Transparent:** Public accountability dashboard shows pending/completed work

This contrasts with traditional platforms where admins have centralized, unchecked power.

---

## Key Entities

### Initiative

Represents an approved decision requiring implementation.

```typescript
interface Initiative {
  id: string                          // UUID
  decisionId: string                  // Links to Decision from governance module
  title: string                       // Short description (3-100 chars)
  description: string                 // Full context (10-2000 chars)
  tasks: Task[]                       // Breakdown of work items
  status: 'pending_assignment' | 'in_progress' | 'delivered' | 'verified'
  assignedTo: string[]                // Admin/steward member IDs
  priority: number                    // Derived from Support Points allocation
  deadline?: Date                     // Expected completion date
  createdAt: Date
  startedAt?: Date                    // When admin began work
  deliveredAt?: Date                  // When admin submitted delivery report
  verifiedAt?: Date                   // When group verified completion
  deliveryReport?: DeliveryReport     // Proof of completion
}
```

### Task

Individual work item within an initiative.

```typescript
interface Task {
  id: string                          // UUID
  initiativeId: string
  description: string                 // What needs to be done
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: string                 // Member ID
  completedAt?: Date
  proofArtifact?: string              // URL to PR, document, screenshot, etc.
}
```

### DeliveryReport

Proof that an initiative was completed.

```typescript
interface DeliveryReport {
  id: string                          // UUID
  initiativeId: string
  summary: string                     // What was accomplished (10-1000 chars)
  proofs: Proof[]                     // Concrete artifacts
  metricsAchieved?: Record<string, any> // Quantitative outcomes
  challengesFaced?: string            // Optional: What went wrong
  lessonsLearned?: string             // Optional: What to do differently
  submittedBy: string                 // Admin member ID
  submittedAt: Date
}
```

### Proof

Concrete artifact demonstrating completion.

```typescript
interface Proof {
  type: 'pr' | 'document' | 'screenshot' | 'url' | 'file'
  url: string                         // Link to artifact
  description: string                 // What this proves
  timestamp: Date                     // When artifact created
}
```

### ImplementationAudit

NDJSON log entry for every admin action (append-only).

```typescript
interface ImplementationAudit {
  id: string                          // UUID
  timestamp: Date                     // ISO 8601
  event_type: 'initiative.assigned' | 'initiative.started' |
              'initiative.delivered' | 'initiative.verified' |
              'setting.changed' | 'admin.recalled'
  actor: {
    user_id: string                   // Admin member ID
    role: 'admin' | 'super_admin' | 'coordinator'
    ip_hash: string                   // SHA-256 hash (privacy-preserving)
  }
  target?: {
    type: 'initiative' | 'setting' | 'user'
    id: string
  }
  action: {
    decision: string                  // What was done
    reason?: string                   // Why (if discretionary)
    reversible: boolean               // Can this be undone?
  }
  metadata: Record<string, any>       // Additional context
  authorization: {
    source: 'decision' | 'discretion' | 'emergency'
    decisionId?: string               // If authorized by proposal
    justification?: string            // If discretionary
  }
}
```

### SettingMetadata

Classification of platform/group settings.

```typescript
interface SettingMetadata {
  key: string                         // Dot-notation path (e.g., "membership.max_members")
  value: any                          // Current value
  requiresVote: boolean               // True = assembly must approve changes
  scope: 'platform' | 'group'         // Platform-wide or per-group
  category: 'governance' | 'financial' | 'membership' |
            'moderation' | 'technical' | 'federation'
  description: string                 // Human-readable explanation
  lastModifiedBy: string              // Admin member ID
  lastModifiedAt: Date
  associatedDecisionId?: string       // If requiresVote=true
  changeHistory: SettingChange[]      // Audit trail
}
```

### SettingChange

History entry for setting modifications.

```typescript
interface SettingChange {
  id: string                          // UUID
  settingKey: string
  oldValue: any
  newValue: any
  changedBy: string                   // Admin member ID
  changedAt: Date
  decisionId?: string                 // If authorized by proposal
  justification?: string              // If discretionary
}
```

### AdminTerm

Tracks admin role assignments with term limits.

```typescript
interface AdminTerm {
  id: string                          // UUID
  groupId?: string                    // If group-level admin, null for platform
  memberId: string
  role: 'admin' | 'super_admin' | 'coordinator'
  startedAt: Date
  expiresAt?: Date                    // Optional term limit
  recalled: boolean                   // True if removed early
  recalledAt?: Date
  recallReason?: string               // Why recalled
  performanceMetrics: {
    initiativesAssigned: number
    initiativesCompleted: number
    averageCompletionTime: number     // Days
    onTimeCompletionRate: number      // Percentage
  }
}
```

---

## Core Features

### Phase 1: Decision → Initiative Conversion (0% - SPEC ONLY)

#### Features:
- Convert approved decisions to initiatives automatically
- Extract tasks from proposal text or allow manual breakdown
- Calculate priority from Support Points allocation
- Assign to admins based on workload balancing
- Create audit log entry

#### Implementation:
- [ ] `Initiative` entity with validation
- [ ] `Task` entity with status tracking
- [ ] Conversion logic from `Decision` (governance module)
- [ ] Priority calculation algorithm
- [ ] Admin assignment algorithm (round-robin, load-balanced)
- [ ] NDJSON audit log writer

---

### Phase 2: Admin Implementation Queue (0% - SPEC ONLY)

#### Features:
- Dashboard showing initiatives assigned to current admin
- Filter by status, priority, deadline
- Task breakdown view with completion tracking
- Delivery report submission form
- Proof artifact upload (links to PRs, documents, screenshots)

#### UI Routes:
- `/admin/queue` - My assigned initiatives
- `/admin/queue/[id]` - Initiative detail with task list
- `/admin/queue/[id]/deliver` - Submit delivery report

#### Implementation:
- [ ] Admin queue API endpoint (filtered by assignedTo)
- [ ] Initiative detail API endpoint
- [ ] Delivery report submission API
- [ ] UI components: QueueCard, TaskList, DeliveryReportForm
- [ ] File upload for proof artifacts

---

### Phase 3: Public Accountability Dashboard (0% - SPEC ONLY)

#### Features:
- View all pending initiatives (decisions waiting for implementation)
- View recently completed initiatives with delivery reports
- Admin performance metrics (% completed on time, average time)
- Recall history (if admins were removed for poor performance)
- Filter by group, date range, admin

#### Access Control:
- **Members-only** - Must be logged in
- All data pseudonymized for privacy
- Admin names shown only if they opt-in

#### UI Routes:
- `/admin/accountability` - Community accountability dashboard
- `/admin/accountability/[adminId]` - Admin performance history

#### Implementation:
- [ ] Accountability dashboard API (aggregate queries)
- [ ] Admin performance metrics calculation
- [ ] UI components: AccountabilityDashboard, AdminPerformanceCard
- [ ] Pseudonymization logic

---

### Phase 4: Settings Management (0% - SPEC ONLY)

#### Features:
- Two-tier system:
  - **Requires Assembly Vote:** Financial decisions, governance rules, membership criteria, resource allocation, federation
  - **Admin Discretion:** Technical configurations, routine maintenance, emergency fixes
- Attempt to change "requiresVote" setting → prompts to create proposal
- All changes logged with authorization source (decisionId or justification)
- Setting change history per key

#### Settings Categories:

**Group-Level Settings:**
```typescript
interface GroupSettings {
  governance: {
    quorum_threshold: number          // % of members for valid vote
    voting_method: 'approval' | 'ranked' | 'consent'
    cooling_off_period_days: number   // Before vote starts
    challenge_window_days: number     // For appeals
    minority_report_required: boolean
  }
  moderation: {
    style: 'reactive' | 'proactive'
    auto_hide_threshold: number       // # of flags before content hidden
    moderator_rotation_months: number // Default: 1
    require_diversity: boolean        // Multiple viewpoints
  }
  gamification: {
    milestone_animations: boolean
    invitation_rewards_enabled: boolean
    rp_earning_multiplier: number     // 1.0 = default
    quiet_mode_available: boolean
  }
  social_economy: {
    sp_allocation_cap: number         // Max SP per proposal (default: 10)
    timebank_exchange_rate: number    // SP → timebank credits
    mutual_aid_visibility: 'public' | 'members_only'
  }
}
```

**Platform-Wide Settings (Super Admin Only):**
```typescript
interface PlatformSettings {
  trust_safety: {
    global_content_rules: string[]
    moderator_training_required: boolean
    ban_duration_options: number[]    // Days
    cross_group_coordination: boolean
  }
  federation: {
    enabled: boolean
    federated_handles_allowed: boolean
    cross_instance_proposals: boolean
  }
  privacy: {
    aggregate_stats_min_n: number     // Min sample size for demographics
    data_retention_days: number       // How long logs kept
    export_formats: string[]          // CSV, JSON, NDJSON
  }
  reward_weights: {
    sp_earning_rates: Record<string, number> // Event type → SP amount
    rp_earning_rates: Record<string, number> // Action → RP amount
    badge_criteria: Record<string, any>
  }
}
```

#### UI Routes:
- `/admin/settings` - Settings browser
- `/admin/settings/[category]` - Category detail
- `/admin/settings/history/[key]` - Change history for specific setting

#### Implementation:
- [ ] `SettingMetadata` entity with validation
- [ ] Settings classification seeding
- [ ] Change authorization middleware (blocks requiresVote changes)
- [ ] Setting change API with audit logging
- [ ] UI components: SettingsBrowser, SettingEditor, ChangeHistory
- [ ] Proposal creation flow for requiresVote settings

---

### Phase 5: Recall Mechanism (0% - SPEC ONLY)

#### Features:
- Member initiates recall proposal for underperforming admin
- Proposal includes evidence (missed deadlines, poor delivery reports)
- Vote conducted via governance module
- If approved → Admin role revoked, tasks reassigned
- Audit log entry created
- Recalled admin cannot reapply for same role for 6 months

#### Recall Triggers (Automatic Warnings):
- 3+ initiatives past deadline without delivery report
- Average completion time >2x group average
- 2+ delivery reports rejected by group verification
- Negative feedback from 5+ members

#### UI Routes:
- `/admin/accountability/[adminId]/recall` - Initiate recall proposal

#### Implementation:
- [ ] Recall proposal template
- [ ] Automatic warning system (monitors metrics)
- [ ] Task reassignment algorithm (when admin recalled)
- [ ] Cooldown period enforcement (6 months)
- [ ] Recall audit logging

---

## User Journeys

### Journey 1: Decision Approved → Initiative Created

**Actor:** System (automated conversion after governance vote)

**Steps:**
1. Governance module emits event: `decision.approved`
2. Admin accountability module listens for event
3. Check if decision requires implementation (flag set in proposal)
4. If yes:
   - Create `Initiative` entity
   - Extract tasks from proposal (manual or AI-assisted)
   - Calculate priority from SP allocation
   - Assign to admin (lowest current workload)
   - Create audit log entry: `initiative.assigned`
5. Admin receives notification: "New initiative assigned: [title]"

**Outcome:** Initiative appears in admin's queue at `/admin/queue`

---

### Journey 2: Admin Implements Decision

**Actor:** Alice, group admin

**Steps:**
1. Navigate to `/admin/queue`
2. See initiative: "Update membership cap to 1000" (Priority: High, Deadline: Jan 15)
3. Click initiative → View details:
   - Authorizing decision: Proposal #42 (passed Dec 15, 85% approval)
   - Tasks:
     - Update `SettingMetadata` for `membership.max_members`
     - Update validation schema
     - Deploy change
     - Update documentation
4. Mark first task "in progress"
5. Complete implementation:
   - Change setting: `membership.max_members` from 500 to 1000
   - System logs change with `decisionId: "uuid-of-proposal-42"`
6. Mark tasks complete (upload proof: PR #123)
7. Navigate to `/admin/queue/[id]/deliver`
8. Submit delivery report:
   - Summary: "Updated membership cap to 1000 as approved by group"
   - Proofs: [PR #123, Documentation update, Settings screenshot]
   - Metrics: "Deployment completed successfully, no downtime"
9. Submit → Status changes to `delivered`

**Outcome:** Initiative appears in `/admin/accountability` as "Recently Completed"

---

### Journey 3: Group Verifies Implementation

**Actor:** Bob, group member

**Steps:**
1. Navigate to `/admin/accountability`
2. See recently delivered initiative: "Update membership cap to 1000"
3. Click → View delivery report:
   - Admin: Alice
   - Completed: Jan 12 (3 days early)
   - Proofs: PR #123, docs, screenshot
4. Bob clicks "Verify Settings"
5. Navigate to `/groups/[id]/settings` → See max members = 1000 ✓
6. Return to accountability page → Click "Confirm Completion"
7. System updates status to `verified`
8. Alice receives notification: "Initiative verified by group"

**Outcome:** Initiative marked complete, Alice's performance metrics updated

---

### Journey 4: Member Initiates Recall

**Actor:** Carol, group member (concerned about admin performance)

**Steps:**
1. Navigate to `/admin/accountability/[admin-dave-id]`
2. See performance metrics:
   - Initiatives assigned: 8
   - Initiatives completed: 3
   - On-time completion rate: 25% (2/8)
   - 5 initiatives past deadline
3. Click "Initiate Recall"
4. Fill recall proposal:
   - Reason: "Chronic delays, poor communication, missed deadlines"
   - Evidence: Links to 5 overdue initiatives
5. Submit → Governance module creates recall proposal
6. Group votes (7 days deliberation, 3 days voting)
7. Result: 72% approve recall
8. System:
   - Revokes Dave's admin role
   - Reassigns 5 pending initiatives to other admins
   - Creates audit log: `admin.recalled`
   - Sets cooldown: Dave cannot reapply until July 15
9. Dave receives notification: "Admin role recalled by group vote"

**Outcome:** Dave removed, tasks redistributed, accountability maintained

---

## Validation Rules

### Initiative Creation

```typescript
import { z } from 'zod'

export const createInitiativeSchema = z.object({
  decisionId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  tasks: z.array(z.object({
    description: z.string().min(3).max(500),
  })).min(1).max(20),
  assignedTo: z.array(z.string().uuid()).min(1),
  deadline: z.date().optional(),
})
```

### Delivery Report Submission

```typescript
export const deliveryReportSchema = z.object({
  initiativeId: z.string().uuid(),
  summary: z.string().min(10).max(1000),
  proofs: z.array(z.object({
    type: z.enum(['pr', 'document', 'screenshot', 'url', 'file']),
    url: z.string().url(),
    description: z.string().min(3).max(200),
  })).min(1),
  metricsAchieved: z.record(z.any()).optional(),
  challengesFaced: z.string().max(1000).optional(),
  lessonsLearned: z.string().max(1000).optional(),
})
```

### Setting Change Authorization

```typescript
export const changeSettingSchema = z.object({
  key: z.string().regex(/^[a-z_]+\.[a-z_]+$/), // e.g., "membership.max_members"
  newValue: z.any(),
  decisionId: z.string().uuid().optional(),    // Required if requiresVote=true
  justification: z.string().min(10).max(500).optional(), // Required if discretion
})
```

---

## API Endpoints (tRPC)

```typescript
// apps/api/src/trpc/routers/admin.ts
export const adminRouter = router({
  // Get initiatives assigned to current admin
  getMyQueue: protectedProcedure
    .input(z.object({
      status: z.enum(['pending_assignment', 'in_progress', 'delivered', 'verified']).optional(),
      sortBy: z.enum(['priority', 'deadline', 'createdAt']).default('priority'),
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.repos.initiatives.list({
        assignedTo: ctx.session.userId,
        status: input.status,
        sortBy: input.sortBy,
      })
    }),

  // Get initiative details
  getInitiativeById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const initiative = await ctx.repos.initiatives.findById(input.id)
      if (!initiative) throw new TRPCError({ code: 'NOT_FOUND' })
      return initiative
    }),

  // Submit delivery report
  submitDeliveryReport: protectedProcedure
    .input(deliveryReportSchema)
    .mutation(async ({ input, ctx }) => {
      const initiative = await ctx.repos.initiatives.findById(input.initiativeId)
      if (!initiative) throw new TRPCError({ code: 'NOT_FOUND' })
      if (!initiative.assignedTo.includes(ctx.session.userId)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const report = await ctx.repos.deliveryReports.create({
        ...input,
        submittedBy: ctx.session.userId,
        submittedAt: new Date(),
      })

      await ctx.repos.initiatives.update(input.initiativeId, {
        status: 'delivered',
        deliveredAt: new Date(),
      })

      await ctx.services.auditLog.write({
        event_type: 'initiative.delivered',
        actor: { user_id: ctx.session.userId, role: 'admin' },
        target: { type: 'initiative', id: input.initiativeId },
        action: { decision: 'submitted_delivery_report', reversible: false },
        authorization: { source: 'decision', decisionId: initiative.decisionId },
      })

      return { reportId: report.id }
    }),

  // Verify initiative completion (group members)
  verifyInitiative: protectedProcedure
    .input(z.object({ initiativeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const initiative = await ctx.repos.initiatives.findById(input.initiativeId)
      if (!initiative || initiative.status !== 'delivered') {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      await ctx.repos.initiatives.update(input.initiativeId, {
        status: 'verified',
        verifiedAt: new Date(),
      })

      await ctx.services.auditLog.write({
        event_type: 'initiative.verified',
        actor: { user_id: ctx.session.userId, role: 'member' },
        target: { type: 'initiative', id: input.initiativeId },
        action: { decision: 'verified_completion', reversible: false },
      })

      return { success: true }
    }),

  // Get public accountability dashboard data
  getAccountabilityDashboard: publicProcedure
    .input(z.object({
      groupId: z.string().uuid().optional(),
      dateRange: z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ input, ctx }) => {
      const initiatives = await ctx.repos.initiatives.list({
        groupId: input.groupId,
        dateRange: input.dateRange,
      })

      const metrics = {
        pending: initiatives.filter(i => i.status === 'pending_assignment').length,
        in_progress: initiatives.filter(i => i.status === 'in_progress').length,
        delivered: initiatives.filter(i => i.status === 'delivered').length,
        verified: initiatives.filter(i => i.status === 'verified').length,
      }

      return { initiatives, metrics }
    }),

  // Get admin performance metrics
  getAdminPerformance: publicProcedure
    .input(z.object({ adminId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const term = await ctx.repos.adminTerms.findByMemberId(input.adminId)
      if (!term) throw new TRPCError({ code: 'NOT_FOUND' })

      return term.performanceMetrics
    }),

  // Change setting (with authorization check)
  changeSetting: protectedProcedure
    .input(changeSettingSchema)
    .mutation(async ({ input, ctx }) => {
      const setting = await ctx.repos.settings.findByKey(input.key)
      if (!setting) throw new TRPCError({ code: 'NOT_FOUND' })

      // Check authorization
      if (setting.requiresVote && !input.decisionId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This setting requires assembly approval. Please create a proposal first.',
        })
      }

      if (!setting.requiresVote && !input.justification) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Justification required for discretionary changes.',
        })
      }

      // Record change
      const oldValue = setting.value
      await ctx.repos.settings.update(input.key, input.newValue)

      await ctx.repos.settingChanges.create({
        settingKey: input.key,
        oldValue,
        newValue: input.newValue,
        changedBy: ctx.session.userId,
        changedAt: new Date(),
        decisionId: input.decisionId,
        justification: input.justification,
      })

      await ctx.services.auditLog.write({
        event_type: 'setting.changed',
        actor: { user_id: ctx.session.userId, role: 'admin' },
        target: { type: 'setting', id: input.key },
        action: {
          decision: `changed_from_${oldValue}_to_${input.newValue}`,
          reversible: true
        },
        authorization: {
          source: input.decisionId ? 'decision' : 'discretion',
          decisionId: input.decisionId,
          justification: input.justification,
        },
      })

      return { success: true }
    }),
})
```

---

## Privacy & Security

### Public Information (Members-Only)
- Initiative titles and descriptions
- Admin performance metrics (pseudonymized by default)
- Delivery reports (after submission)
- Accountability dashboard aggregate stats

### Private Information (Admins Only)
- Detailed audit logs with IP addresses
- Individual admin real names (unless opt-in)
- Internal deliberation on recalls
- Super admin platform-wide settings

### Audit Log Privacy
- IP addresses hashed with SHA-256
- PII redacted from metadata fields
- Logs written to NDJSON format (append-only)
- Log location: `/logs/admin/actions-YYYY-MM-DD.ndjson`
- Integrity: SHA-256 chain validation

### Access Control
- **Super Admin:** Platform-wide settings, all groups
- **Group Admin:** Group-specific settings, assigned initiatives
- **Coordinator:** View accountability, initiate recalls
- **Member:** View accountability dashboard, verify initiatives

---

## Dependencies

### Required Modules:
- **Governance** (0%) — Decision entity, proposal system
- **Auth** (100%) — Role-based access, session management
- **Groups** (100%) — Group membership, role assignments

### Integration Points:
- Listen for `decision.approved` events from governance module
- Emit `initiative.delivered` events for metrics/notifications
- Query Support Points allocation for priority calculation
- Use Auth middleware for role-based endpoint protection

---

## Implementation Roadmap

### Month 1: Core Infrastructure
- [ ] Entity definitions and Zod validators
- [ ] NDJSON audit log writer with integrity checks
- [ ] Decision → Initiative conversion logic
- [ ] Admin assignment algorithm

### Month 2: Admin Queue
- [ ] Admin queue API endpoints
- [ ] Initiative detail and task management
- [ ] Delivery report submission
- [ ] UI components: QueueCard, TaskList

### Month 3: Accountability Dashboard
- [ ] Public accountability API
- [ ] Performance metrics calculation
- [ ] UI components: AccountabilityDashboard
- [ ] Pseudonymization logic

### Month 4: Settings Management
- [ ] Settings classification and seeding
- [ ] Authorization middleware
- [ ] Settings browser UI
- [ ] Change history tracking

### Month 5: Recall System
- [ ] Recall proposal integration
- [ ] Automatic warning system
- [ ] Task reassignment algorithm
- [ ] Cooldown enforcement

---

## Success Metrics

### Accountability
- **Initiative completion rate:** >80% delivered on time
- **Verification rate:** >90% of delivered initiatives verified by group
- **Recall rate:** <5% of admins recalled per year (indicates good selection/support)

### Transparency
- **Audit log completeness:** 100% of admin actions logged
- **Dashboard usage:** >50% of members view accountability page monthly
- **Setting authorization compliance:** 0 unauthorized changes to "requiresVote" settings

### Efficiency
- **Average implementation time:** <14 days from decision to verification
- **Admin workload balance:** Standard deviation <20% across admins
- **Decision backlog:** <10 pending initiatives per 100 active members

---

## Future Enhancements

### Phase 6: Advanced Features
- AI-assisted task extraction from proposals
- Predictive analytics for admin workload
- Cross-group initiative coordination
- Automated delivery report quality scoring
- Integration with external project management tools (Notion, Linear, GitHub Projects)

### Phase 7: Federation
- Inter-instance initiative coordination
- Federated accountability dashboards
- Cross-instance admin reputation system

---

## Related Documentation

- [Governance Module](./governance.md) — Proposal and decision system
- [Groups Module](./groups.md) — Group membership and roles
- [Moderation Transparency Module](./moderation-transparency.md) — Moderation accountability
- [Decision Implementation Pipeline](../architecture/decision-implementation-pipeline.md) — Technical architecture
