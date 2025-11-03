# Decision Implementation Pipeline Architecture

## Overview

This document describes the technical architecture for TogetherOS's decision → implementation → verification pipeline, ensuring democratic decisions are executed with full accountability and traceability.

**Last Updated:** 2025-01-11
**Status:** Specification (0% implemented)

---

## Core Workflow

```
┌─────────────┐
│  Proposal   │  Member creates proposal
│  Created    │  (e.g., "Increase membership cap to 1000")
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Governance  │  Community deliberates & votes
│   Module    │  (7-day deliberation, 3-day voting)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Decision   │  Result: Approved (68% yes)
│  Approved   │  Emits event: decision.approved
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Initiative  │  System converts to Initiative
│  Created    │  Assigns to admin, calculates priority
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Admin     │  Admin implements (change setting)
│ Implements  │  Logs action with decisionId
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Delivery   │  Admin submits proof (PR, screenshot)
│   Report    │  Status: delivered
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Group     │  Member verifies completion
│  Verifies   │  Status: verified
└─────────────┘
```

---

## Event-Driven Architecture

### Key Events

#### 1. `decision.approved`
**Emitted by:** Governance module
**Payload:**
```typescript
{
  decisionId: string
  proposalId: string
  outcome: 'approved'
  requiresImplementation: boolean
  priority: number  // Derived from SP allocation
  deadline?: Date
}
```

**Listeners:**
- Admin Accountability module (create Initiative)
- Notifications module (notify admins)

---

#### 2. `initiative.assigned`
**Emitted by:** Admin Accountability module
**Payload:**
```typescript
{
  initiativeId: string
  assignedTo: string[]  // Admin member IDs
  priority: number
  deadline?: Date
}
```

**Listeners:**
- Notifications module (notify assigned admins)

---

#### 3. `initiative.delivered`
**Emitted by:** Admin Accountability module
**Payload:**
```typescript
{
  initiativeId: string
  deliveredBy: string
  deliveryReportId: string
  proofs: Proof[]
}
```

**Listeners:**
- Notifications module (notify group members for verification)
- Metrics module (update admin performance)

---

#### 4. `initiative.verified`
**Emitted by:** Admin Accountability module
**Payload:**
```typescript
{
  initiativeId: string
  verifiedBy: string
  verifiedAt: Date
}
```

**Listeners:**
- Metrics module (update completion stats)
- Admin performance tracker (update metrics)

---

## Decision → Initiative Conversion

### Automatic Conversion Logic

```typescript
// Triggered by decision.approved event
async function convertDecisionToInitiative(decision: Decision) {
  // 1. Check if implementation required
  if (!decision.requiresImplementation) {
    return // No action needed
  }

  // 2. Extract tasks from proposal
  const tasks = await extractTasks(decision.proposalId)

  // 3. Calculate priority from SP allocation
  const priority = await calculatePriority(decision.proposalId)

  // 4. Assign to admin(s)
  const assignedTo = await assignAdmins(decision, priority)

  // 5. Calculate deadline (if specified in proposal)
  const deadline = decision.deadline || calculateDefaultDeadline(priority)

  // 6. Create Initiative
  const initiative = await repos.initiatives.create({
    decisionId: decision.id,
    title: extractTitle(decision),
    description: extractDescription(decision),
    tasks,
    status: 'pending_assignment',
    assignedTo,
    priority,
    deadline,
    createdAt: new Date(),
  })

  // 7. Log audit trail
  await auditLog.write({
    event_type: 'initiative.assigned',
    target: { type: 'initiative', id: initiative.id },
    authorization: { source: 'decision', decisionId: decision.id },
  })

  // 8. Emit event
  await events.emit('initiative.assigned', {
    initiativeId: initiative.id,
    assignedTo,
    priority,
    deadline,
  })

  return initiative
}
```

---

### Task Extraction Algorithm

#### Option 1: Manual Task Breakdown (MVP)
- Admin manually creates tasks after initiative created
- UI provides task editor in implementation queue

#### Option 2: AI-Assisted Extraction (Phase 2)
```typescript
async function extractTasks(proposalId: string): Promise<Task[]> {
  const proposal = await repos.proposals.findById(proposalId)

  // Send proposal text to Bridge AI
  const aiResponse = await bridge.extractTasks({
    proposalText: proposal.description,
    proposalType: proposal.category,
  })

  // Parse AI response into task structure
  return aiResponse.tasks.map(task => ({
    description: task.description,
    status: 'pending',
    estimatedHours: task.estimatedHours,
  }))
}
```

---

### Priority Calculation

Priority derived from **Support Points allocation** during proposal phase:

```typescript
function calculatePriority(proposalId: string): number {
  const spAllocations = await repos.supportPoints.getAllocations({
    proposalId,
    status: 'active',
  })

  const totalSP = spAllocations.reduce((sum, alloc) => sum + alloc.amount, 0)
  const allocatorCount = spAllocations.length

  // Priority = weighted combination of SP and allocator count
  // More SP = higher priority
  // More allocators = broader support
  const spScore = Math.min(totalSP / 100, 100) // Normalize to 0-100
  const countScore = Math.min(allocatorCount / 20, 100) // Normalize to 0-100

  return (spScore * 0.7) + (countScore * 0.3) // 70% SP, 30% count
}
```

**Example:**
- Proposal A: 450 SP from 65 members → Priority: 63
- Proposal B: 200 SP from 80 members → Priority: 38
- Proposal C: 800 SP from 120 members → Priority: 92

---

## Admin Assignment Algorithm

### Load-Balanced Round-Robin

```typescript
async function assignAdmins(decision: Decision, priority: number): Promise<string[]> {
  // 1. Get active admins for relevant scope
  const admins = await repos.adminTerms.getActive({
    groupId: decision.groupId,
    role: ['admin', 'super_admin'],
  })

  if (admins.length === 0) {
    throw new Error('No active admins available')
  }

  // 2. Calculate current workload for each admin
  const workloads = await Promise.all(
    admins.map(async (admin) => {
      const pending = await repos.initiatives.count({
        assignedTo: admin.memberId,
        status: ['pending_assignment', 'in_progress'],
      })

      return {
        memberId: admin.memberId,
        pendingInitiatives: pending,
      }
    })
  )

  // 3. Sort by workload (ascending)
  workloads.sort((a, b) => a.pendingInitiatives - b.pendingInitiatives)

  // 4. Assign to admin(s) with lowest workload
  if (priority >= 80) {
    // High priority: Assign to 2 admins for redundancy
    return [workloads[0].memberId, workloads[1].memberId]
  } else {
    // Normal priority: Assign to 1 admin
    return [workloads[0].memberId]
  }
}
```

---

## Settings Classification System

### Two-Tier Authorization

#### Tier 1: Requires Assembly Vote
Settings that impact community governance, finances, or membership:

```typescript
const REQUIRES_VOTE = [
  'membership.max_members',
  'membership.approval_required',
  'membership.dues_amount',
  'governance.quorum_threshold',
  'governance.voting_method',
  'governance.cooling_off_period_days',
  'financial.budget_allocation',
  'financial.expense_limit',
  'federation.enabled',
  'federation.cross_instance_proposals',
]
```

#### Tier 2: Admin Discretion
Settings that are technical or operational:

```typescript
const ADMIN_DISCRETION = [
  'technical.session_timeout',
  'technical.max_upload_size',
  'technical.rate_limit_per_hour',
  'moderation.auto_hide_threshold',
  'notifications.email_batch_frequency',
  'ui.theme',
  'ui.default_language',
]
```

---

### Authorization Middleware

```typescript
async function changeSetting(key: string, newValue: any, ctx: Context) {
  const setting = await repos.settings.findByKey(key)

  if (setting.requiresVote) {
    // Check for associated decisionId
    if (!ctx.decisionId) {
      throw new Error('This setting requires assembly approval. Please create a proposal first.')
    }

    // Verify decision exists and was approved
    const decision = await repos.decisions.findById(ctx.decisionId)
    if (!decision || decision.outcome !== 'approved') {
      throw new Error('Invalid or unapproved decision')
    }
  } else {
    // Admin discretion — require justification
    if (!ctx.justification || ctx.justification.length < 10) {
      throw new Error('Justification required for discretionary changes (min 10 chars)')
    }
  }

  // Record change
  const oldValue = setting.value
  await repos.settings.update(key, newValue)

  await repos.settingChanges.create({
    settingKey: key,
    oldValue,
    newValue,
    changedBy: ctx.session.userId,
    changedAt: new Date(),
    decisionId: ctx.decisionId,
    justification: ctx.justification,
  })

  // Audit log
  await auditLog.write({
    event_type: 'setting.changed',
    actor: { user_id: ctx.session.userId, role: 'admin' },
    target: { type: 'setting', id: key },
    action: { decision: `changed_from_${oldValue}_to_${newValue}`, reversible: true },
    authorization: {
      source: ctx.decisionId ? 'decision' : 'discretion',
      decisionId: ctx.decisionId,
      justification: ctx.justification,
    },
  })
}
```

---

## Delivery Report Requirements

### Minimum Proof Standards

Every delivery report must include:

1. **Summary** (10-1000 chars): What was accomplished
2. **Proofs** (≥1): Concrete artifacts
   - Type: PR, document, screenshot, URL, file
   - Each proof has description
3. **Metrics Achieved** (optional): Quantitative outcomes
4. **Challenges Faced** (optional): What went wrong
5. **Lessons Learned** (optional): What to do differently

### Proof Validation

```typescript
async function validateDeliveryReport(report: DeliveryReport) {
  // 1. Check summary length
  if (report.summary.length < 10 || report.summary.length > 1000) {
    throw new Error('Summary must be 10-1000 characters')
  }

  // 2. Require at least 1 proof
  if (report.proofs.length === 0) {
    throw new Error('At least 1 proof artifact required')
  }

  // 3. Validate proof URLs
  for (const proof of report.proofs) {
    try {
      new URL(proof.url) // Throws if invalid URL
    } catch {
      throw new Error(`Invalid proof URL: ${proof.url}`)
    }
  }

  // 4. Verify initiative exists and admin is assigned
  const initiative = await repos.initiatives.findById(report.initiativeId)
  if (!initiative) {
    throw new Error('Initiative not found')
  }

  if (!initiative.assignedTo.includes(report.submittedBy)) {
    throw new Error('Only assigned admins can submit delivery reports')
  }

  return true
}
```

---

## Verification Workflow

### Member Verification

After delivery report submitted:

1. **Notification sent** to group members
2. **Verification period** (7 days default)
3. **Any member can verify** (not just coordinators)
4. **Threshold:** 1 verification = sufficient (trust-first model)
5. **Objection period:** 3 days after first verification
6. **If objections:** Governance creates dispute resolution proposal

### Auto-Verification

For low-impact initiatives:

```typescript
async function maybeAutoVerify(initiative: Initiative) {
  // Auto-verify if:
  // 1. Priority < 50 (low impact)
  // 2. No objections after 7 days
  // 3. Delivery report includes PR link (code verified by CI)

  if (initiative.priority >= 50) return false

  const objections = await repos.initiativeObjections.count({
    initiativeId: initiative.id,
  })

  if (objections > 0) return false

  const report = await repos.deliveryReports.findByInitiative(initiative.id)
  const hasPRProof = report.proofs.some(p => p.type === 'pr')

  if (!hasPRProof) return false

  const daysSinceDelivery = (Date.now() - report.submittedAt.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceDelivery >= 7) {
    // Auto-verify
    await repos.initiatives.update(initiative.id, {
      status: 'verified',
      verifiedAt: new Date(),
    })

    await auditLog.write({
      event_type: 'initiative.verified',
      target: { type: 'initiative', id: initiative.id },
      action: { decision: 'auto_verified', reversible: false },
    })

    return true
  }

  return false
}
```

---

## Recall Mechanism

### Automatic Warning Triggers

```typescript
async function checkRecallTriggers(adminId: string) {
  const term = await repos.adminTerms.findActive(adminId)
  if (!term) return

  const metrics = term.performanceMetrics

  const triggers = []

  // Trigger 1: 3+ initiatives past deadline
  if (metrics.initiativesPastDeadline >= 3) {
    triggers.push('chronic_delays')
  }

  // Trigger 2: On-time completion rate < 50%
  if (metrics.onTimeCompletionRate < 0.5 && metrics.initiativesCompleted >= 5) {
    triggers.push('low_completion_rate')
  }

  // Trigger 3: Average completion time > 2x group average
  const groupAvg = await repos.initiatives.getAverageCompletionTime(term.groupId)
  if (metrics.averageCompletionTime > groupAvg * 2) {
    triggers.push('slow_completion')
  }

  // Trigger 4: 2+ delivery reports rejected
  if (metrics.deliveryReportsRejected >= 2) {
    triggers.push('poor_quality_reports')
  }

  // Trigger 5: Negative feedback from 5+ members
  const negativeFeedback = await repos.adminFeedback.count({
    adminId,
    rating: ['poor', 'very_poor'],
  })
  if (negativeFeedback >= 5) {
    triggers.push('negative_feedback')
  }

  // If triggers exist, notify coordinators
  if (triggers.length > 0) {
    await notifications.notifyCoordinators({
      type: 'admin_performance_warning',
      adminId,
      triggers,
      message: `Admin ${adminId} has triggered ${triggers.length} recall warnings`,
    })
  }
}
```

### Recall Proposal Creation

```typescript
async function initiateRecall(adminId: string, initiator: string, evidence: string[]) {
  // 1. Verify initiator is group member
  const membership = await repos.groupMemberships.findByMember(initiator)
  if (!membership) {
    throw new Error('Only group members can initiate recall')
  }

  // 2. Create recall proposal
  const proposal = await repos.proposals.create({
    type: 'recall',
    title: `Recall Admin: ${adminId}`,
    description: `Proposal to recall admin for poor performance`,
    evidence,
    createdBy: initiator,
  })

  // 3. Collect petition signatures (≥20 required)
  const petition = await repos.petitions.create({
    proposalId: proposal.id,
    targetSignatures: 20,
    deadline: addDays(new Date(), 7), // 7 days to collect
  })

  return { proposalId: proposal.id, petitionId: petition.id }
}
```

---

## Performance Metrics Calculation

### Admin Performance Metrics

```typescript
async function calculateAdminMetrics(adminId: string): Promise<AdminPerformance> {
  const initiatives = await repos.initiatives.list({
    assignedTo: adminId,
    status: ['in_progress', 'delivered', 'verified'],
  })

  const assigned = initiatives.length
  const completed = initiatives.filter(i => i.status === 'verified').length

  // Calculate average completion time (in days)
  const completedInitiatives = initiatives.filter(i => i.status === 'verified')
  const totalDays = completedInitiatives.reduce((sum, i) => {
    const days = (i.verifiedAt.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return sum + days
  }, 0)
  const averageCompletionTime = completed > 0 ? totalDays / completed : 0

  // Calculate on-time completion rate
  const onTime = completedInitiatives.filter(i =>
    i.verifiedAt <= i.deadline
  ).length
  const onTimeCompletionRate = completed > 0 ? onTime / completed : 0

  return {
    initiativesAssigned: assigned,
    initiativesCompleted: completed,
    averageCompletionTime,
    onTimeCompletionRate,
  }
}
```

---

## NDJSON Audit Log Format

### Log Entry Structure

```json
{
  "id": "01JGXY9K2TQWER7Y8N3M4P5Q6R",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "event_type": "initiative.delivered",
  "actor": {
    "user_id": "uuid-admin-alice",
    "role": "admin",
    "ip_hash": "sha256:abc123..."
  },
  "target": {
    "type": "initiative",
    "id": "uuid-initiative-42"
  },
  "action": {
    "decision": "submitted_delivery_report",
    "reversible": false
  },
  "metadata": {
    "delivery_report_id": "uuid-report-123",
    "proof_count": 3,
    "metrics_achieved": {"uptime": "100%", "zero_downtime": true}
  },
  "authorization": {
    "source": "decision",
    "decisionId": "uuid-decision-89"
  }
}
```

### Log Integrity Validation

```typescript
async function validateLogIntegrity(logPath: string) {
  const lines = await fs.readFile(logPath, 'utf-8').then(f => f.split('\n'))

  let previousHash = null

  for (const line of lines) {
    if (!line.trim()) continue

    const entry = JSON.parse(line)

    // 1. Validate JSON structure
    if (!entry.id || !entry.timestamp || !entry.event_type) {
      throw new Error(`Invalid log entry: ${line}`)
    }

    // 2. Validate timestamp order (monotonically increasing)
    const timestamp = new Date(entry.timestamp).getTime()
    if (previousHash && timestamp < previousHash) {
      throw new Error('Log timestamps out of order')
    }

    // 3. Calculate SHA-256 hash of entry
    const hash = crypto.createHash('sha256').update(line).digest('hex')

    previousHash = timestamp
  }

  return true // Integrity verified
}
```

---

## Related Documentation

- [Admin Accountability Module](../modules/admin-accountability.md) — User-facing features
- [Governance Module](../modules/governance.md) — Proposal and decision system
- [Support Points UI Module](../modules/support-points-ui.md) — Priority calculation
- [TogetherOS Architecture](../TogetherOS_WhitePaper.md) — Overall system design
