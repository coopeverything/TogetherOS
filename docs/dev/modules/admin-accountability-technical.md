# Execution & Accountability Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/admin-accountability.md](../../modules/admin-accountability.md).

**Category:** Collective Governance, Cooperative Technology

---

## Implementation Status

### Phase 1: Decision → Initiative Conversion (0% - SPEC ONLY)

- [ ] `Initiative` entity with validation
- [ ] `Task` entity with status tracking
- [ ] Conversion logic from `Decision` (governance module)
- [ ] Priority calculation algorithm
- [ ] Admin assignment algorithm (round-robin, load-balanced)
- [ ] NDJSON audit log writer

### Phase 2: Admin Implementation Queue (0% - SPEC ONLY)

- [ ] Admin queue API endpoint (filtered by assignedTo)
- [ ] Initiative detail API endpoint
- [ ] Delivery report submission API
- [ ] UI components: QueueCard, TaskList, DeliveryReportForm
- [ ] File upload for proof artifacts

### Phase 3: Public Accountability Dashboard (0% - SPEC ONLY)

- [ ] Accountability dashboard API (aggregate queries)
- [ ] Admin performance metrics calculation
- [ ] UI components: AccountabilityDashboard, AdminPerformanceCard
- [ ] Pseudonymization logic

### Phase 4: Settings Management (0% - SPEC ONLY)

- [ ] `SettingMetadata` entity with validation
- [ ] Settings classification seeding
- [ ] Change authorization middleware (blocks requiresVote changes)
- [ ] Setting change API with audit logging
- [ ] UI components: SettingsBrowser, SettingEditor, ChangeHistory
- [ ] Proposal creation flow for requiresVote settings

### Phase 5: Recall Mechanism (0% - SPEC ONLY)

- [ ] Recall proposal template
- [ ] Automatic warning system (monitors metrics)
- [ ] Task reassignment algorithm (when admin recalled)
- [ ] Cooldown period enforcement (6 months)
- [ ] Recall audit logging

---

## Data Models

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

## Settings Categories

### Group-Level Settings

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

### Platform-Wide Settings (Super Admin Only)

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

## UI Routes

```
/admin/queue                     → My assigned initiatives
/admin/queue/[id]                → Initiative detail with task list
/admin/queue/[id]/deliver        → Submit delivery report
/admin/accountability            → Community accountability dashboard
/admin/accountability/[adminId]  → Admin performance history
/admin/accountability/[adminId]/recall → Initiate recall proposal
/admin/settings                  → Settings browser
/admin/settings/[category]       → Category detail
/admin/settings/history/[key]    → Change history for specific setting
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

## Integration with Other Modules

### Events Module Integration

When initiatives are created:
- **Deadline event:** Auto-create calendar event for initiative deadline
- **Milestone events:** Break initiative into milestone events
- **Workgroup meetings:** Auto-schedule recurring meetings for assigned admins
- **Review event:** Schedule post-completion review meeting

### Metrics Module Integration

Initiative metrics tracking:
1. **Initiative delivered** → Schedule evaluation based on schedule
2. **Evaluation date arrives** → Create evaluation task
3. **Metrics evaluated** → Update initiative status
4. **Metrics failed** → Trigger improvement proposal creation

---

## Dependencies

### Required Modules

- **Governance** (60%) — Decision entity, proposal system, amendment workflow
- **Auth** (100%) — Role-based access, session management
- **Groups** (100%) — Group membership, role assignments

### Optional But Recommended

- **Events** (0%) — Calendar, milestones, meeting scheduling
- **Metrics** (0%) — Success tracking, re-evaluation triggers, feedback loops
- **Notifications** (65%) — Alerts for deadlines, assignments, verifications

---

## Success Metrics

### Accountability

- **Initiative completion rate:** >80% delivered on time
- **Verification rate:** >90% of delivered initiatives verified by group
- **Recall rate:** <5% of admins recalled per year

### Transparency

- **Audit log completeness:** 100% of admin actions logged
- **Dashboard usage:** >50% of members view accountability page monthly
- **Setting authorization compliance:** 0 unauthorized changes to "requiresVote" settings

### Efficiency

- **Average implementation time:** <14 days from decision to verification
- **Admin workload balance:** Standard deviation <20% across admins
- **Decision backlog:** <10 pending initiatives per 100 active members

---

## Related Documentation

- [Governance Module](./governance-technical.md) — Proposal and decision system
- [Groups Module](./groups-technical.md) — Group membership and roles
- [Moderation Transparency Module](./moderation-transparency-technical.md) — Moderation accountability
