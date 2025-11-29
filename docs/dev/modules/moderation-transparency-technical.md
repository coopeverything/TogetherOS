# Moderation Transparency Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/moderation-transparency.md](../../modules/moderation-transparency.md).

**Category:** Collective Governance, Cooperative Technology

---

## Implementation Status

### Phase 1: Public Moderation Log (0% - SPEC ONLY)

- [ ] `ModerationLogTable` component with pagination
- [ ] Filter UI (group, action type, date range)
- [ ] Pseudonymization logic
- [ ] API endpoint: `getModerationLog(filters)`
- [ ] Privacy enforcement (no content text in response)

### Phase 2: Aggregate Statistics (0% - SPEC ONLY)

- [ ] `StatsOverview` component
- [ ] Chart components (pie, bar, line)
- [ ] API endpoint: `getModerationStats(filters)`
- [ ] Privacy threshold enforcement (≥5 actions)

### Phase 3: Coordinator Moderation Queue (0% - SPEC ONLY)

- [ ] `FlagQueueTable` component
- [ ] `FlagDetailCard` with AI integration
- [ ] `ActionButtonGroup` with justification form
- [ ] De-escalation template library
- [ ] Appeal queue UI
- [ ] API endpoints: `getPendingFlags()`, `takeAction()`, `getAppeals()`

### Phase 4: Member Rating Interface (0% - SPEC ONLY)

- [ ] `RatingPrompt` component with 4 criteria
- [ ] Rating submission API endpoint
- [ ] Privacy enforcement (≥5 threshold, anonymization)
- [ ] Notification integration (prompt users after action)
- [ ] One-time rating enforcement

### Phase 5: Rotating Moderator System (0% - SPEC ONLY)

- [ ] `ModeratorTerm` entity with expiration tracking
- [ ] Automatic term expiration job (daily cron)
- [ ] Rotation reminder notifications (7 days before)
- [ ] Performance review calculation
- [ ] Recall proposal integration
- [ ] Re-election cooldown enforcement

### Phase 6: Appeal System (0% - SPEC ONLY)

- [ ] `Appeal` entity with status tracking
- [ ] Appeal submission API endpoint
- [ ] Second moderator assignment (exclude original)
- [ ] Action reversal logic (restore content, lift ban)
- [ ] Performance metric updates (appeals upheld)
- [ ] Notification integration

---

## Data Models

### Flag

Content report submitted by community members.

```typescript
interface Flag {
  id: string                          // UUID
  contentType: 'post' | 'comment' | 'profile' | 'message'
  contentId: string                   // UUID of flagged content
  reporterId: string                  // Member who flagged (kept private)
  reason: 'spam' | 'harassment' | 'misinformation' | 'off_topic' |
          'harmful' | 'policy_violation' | 'other'
  details: string                     // Additional context (10-500 chars)
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string                 // Moderator member ID
}
```

### ModerationAction

Decision taken by moderator on flagged content.

```typescript
interface ModerationAction {
  id: string                          // UUID
  flagId: string                      // Links to Flag
  moderatorId: string                 // Moderator member ID
  decision: 'dismiss' | 'hide_content' | 'warn_user' | 'ban_user' | 'mediate'
  justification: string               // Required explanation (10-1000 chars)
  guidelineCited?: string             // Which community guideline violated
  aiSuggestion?: string               // What Bridge recommended
  followedAISuggestion: boolean       // Did moderator follow AI advice?
  timestamp: Date
  reversible: boolean                 // Can this be undone?
}
```

### ModerationRating

Member feedback on moderation action quality.

```typescript
interface ModerationRating {
  id: string                          // UUID
  actionId: string                    // Links to ModerationAction
  raterId: string                     // Member who rated (kept anonymous from moderator)
  scores: {
    fairness: number                  // 1-5 stars
    empathy: number                   // 1-5 stars
    speed: number                     // 1-5 stars
    communication: number             // 1-5 stars
  }
  average: number                     // Calculated (sum / 4)
  comment?: string                    // Optional qualitative feedback (10-500 chars)
  timestamp: Date
  anonymous: boolean                  // True = rater identity hidden from moderator
}
```

### ModeratorTerm

Tracks moderator service periods with performance metrics.

```typescript
interface ModeratorTerm {
  id: string                          // UUID
  groupId?: string                    // If group-level moderation, null for platform
  memberId: string                    // Moderator member ID
  startedAt: Date
  expiresAt: Date                     // startedAt + 1 month
  status: 'active' | 'completed' | 'recalled'
  recalledAt?: Date
  recallReason?: string               // Why recalled early
  performanceMetrics: ModeratorPerformance
}
```

### ModeratorPerformance

Aggregate performance stats for a moderator term.

```typescript
interface ModeratorPerformance {
  actionsCount: number                // Total moderation actions
  averageScore: number                // Average rating across all actions
  scoreBreakdown: {
    fairness: number
    empathy: number
    speed: number
    communication: number
  }
  rpEarned: number                    // Total RP from moderation
  actionsRated: number                // How many actions received ratings
  ratingRate: number                  // % of actions rated (actionsRated / actionsCount)
  dismissalRate: number               // % of flags dismissed (no action needed)
  averageResponseTime: number         // Hours from flag to action
  appealsReceived: number             // How many actions were appealed
  appealsUpheld: number               // How many appeals reversed decision
}
```

### Appeal

Contested moderation decision.

```typescript
interface Appeal {
  id: string                          // UUID
  actionId: string                    // Links to ModerationAction
  appellantId: string                 // Member appealing (could be flagged user or flagger)
  reason: string                      // Why appealing (10-1000 chars)
  evidence?: string                   // Additional context or evidence
  status: 'pending' | 'reviewing' | 'upheld' | 'overturned'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string                 // Second moderator member ID
  outcome?: string                    // Final decision explanation
}
```

---

## RP Earning System

### Quality Multipliers

```typescript
function calculateRPEarned(averageScore: number): number {
  const baseRP = 10
  let multiplier = 1.0

  if (averageScore >= 5) multiplier = 2.0      // +20 RP
  else if (averageScore >= 4) multiplier = 1.5 // +15 RP
  else if (averageScore >= 3) multiplier = 1.0 // +10 RP
  else if (averageScore >= 2) multiplier = 0.5 // +5 RP
  else multiplier = 0                          // +0 RP

  return Math.floor(baseRP * multiplier)
}
```

### Term Completion Bonuses

- Complete 1-month term with avg ≥4.0 stars: **+100 RP**
- Complete with avg 3.0-3.9 stars: **+50 RP**
- Below 3.0: No bonus
- Early recall (voted out): **-50 RP**

---

## Validation Rules

### Flag Submission

```typescript
import { z } from 'zod'

export const submitFlagSchema = z.object({
  contentType: z.enum(['post', 'comment', 'profile', 'message']),
  contentId: z.string().uuid(),
  reason: z.enum(['spam', 'harassment', 'misinformation', 'off_topic', 'harmful', 'policy_violation', 'other']),
  details: z.string().min(10).max(500),
})
```

### Moderation Action

```typescript
export const takeActionSchema = z.object({
  flagId: z.string().uuid(),
  decision: z.enum(['dismiss', 'hide_content', 'warn_user', 'ban_user', 'mediate']),
  justification: z.string().min(10).max(1000),
  guidelineCited: z.string().optional(),
})
```

### Moderation Rating

```typescript
export const rateModerationSchema = z.object({
  actionId: z.string().uuid(),
  scores: z.object({
    fairness: z.number().int().min(1).max(5),
    empathy: z.number().int().min(1).max(5),
    speed: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
  }),
  comment: z.string().min(10).max(500).optional(),
  anonymous: z.boolean().default(true),
})
```

### Appeal Submission

```typescript
export const submitAppealSchema = z.object({
  actionId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
  evidence: z.string().max(2000).optional(),
})
```

---

## API Endpoints (tRPC)

```typescript
// apps/api/src/trpc/routers/moderation.ts
export const moderationRouter = router({
  // Submit flag (any member)
  submitFlag: protectedProcedure
    .input(submitFlagSchema)
    .mutation(async ({ input, ctx }) => {
      const flag = await ctx.repos.flags.create({
        ...input,
        reporterId: ctx.session.userId,
        status: 'pending',
        createdAt: new Date(),
      })

      // Notify on-duty moderators
      await ctx.services.notifications.notifyModerators({
        type: 'new_flag',
        flagId: flag.id,
      })

      return { flagId: flag.id }
    }),

  // Get moderation log (members only)
  getModerationLog: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid().optional(),
      actionType: z.enum(['dismiss', 'hide_content', 'warn_user', 'ban_user', 'mediate']).optional(),
      dateRange: z.enum(['7d', '30d', '90d']).default('30d'),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const actions = await ctx.repos.moderationActions.list({
        groupId: input.groupId,
        decision: input.actionType,
        dateRange: input.dateRange,
        limit: input.limit,
      })

      // Pseudonymize moderators (unless opt-in)
      return actions.map(action => ({
        ...action,
        moderatorId: action.moderatorOptedIn ? action.moderatorId : `moderator-${hashId(action.moderatorId)}`,
        contentText: undefined, // Never expose content text in public log
      }))
    }),

  // Get pending flags (coordinators only)
  getPendingFlags: protectedProcedure
    .query(async ({ ctx }) => {
      await ctx.services.auth.requireRole(['coordinator', 'moderator'])

      return await ctx.repos.flags.list({
        status: 'pending',
        sortBy: 'createdAt',
      })
    }),

  // Take moderation action (coordinators only)
  takeAction: protectedProcedure
    .input(takeActionSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireRole(['coordinator', 'moderator'])

      const flag = await ctx.repos.flags.findById(input.flagId)
      if (!flag) throw new TRPCError({ code: 'NOT_FOUND' })

      const action = await ctx.repos.moderationActions.create({
        ...input,
        moderatorId: ctx.session.userId,
        timestamp: new Date(),
        reversible: input.decision !== 'ban_user',
      })

      // Update flag status
      await ctx.repos.flags.update(input.flagId, {
        status: input.decision === 'dismiss' ? 'dismissed' : 'action_taken',
        reviewedAt: new Date(),
        reviewedBy: ctx.session.userId,
      })

      // Execute action (hide content, send warning, etc.)
      await ctx.services.moderation.executeAction(input.decision, flag.contentId)

      // Log to NDJSON audit trail
      await ctx.services.auditLog.write({
        event_type: 'moderation.action_taken',
        actor: { user_id: ctx.session.userId, role: 'moderator' },
        target: { type: flag.contentType, id: flag.contentId },
        action: { decision: input.decision, reversible: action.reversible },
      })

      return { actionId: action.id }
    }),

  // Rate moderation action (any member)
  rateAction: protectedProcedure
    .input(rateModerationSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if already rated
      const existing = await ctx.repos.moderationRatings.findByRater(input.actionId, ctx.session.userId)
      if (existing) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already rated this action' })

      const average = (input.scores.fairness + input.scores.empathy + input.scores.speed + input.scores.communication) / 4

      const rating = await ctx.repos.moderationRatings.create({
        ...input,
        raterId: ctx.session.userId,
        average,
        timestamp: new Date(),
      })

      // Update moderator performance metrics
      const action = await ctx.repos.moderationActions.findById(input.actionId)
      await ctx.services.moderatorPerformance.updateMetrics(action.moderatorId, rating)

      // Award RP based on score
      const rpEarned = calculateRPEarned(average)
      if (rpEarned > 0) {
        await ctx.repos.rewardPoints.credit({
          memberId: action.moderatorId,
          amount: rpEarned,
          actionType: 'moderation_quality',
          actionId: input.actionId,
        })
      }

      return { ratingId: rating.id, rpEarned }
    }),

  // Submit appeal (any member)
  submitAppeal: protectedProcedure
    .input(submitAppealSchema)
    .mutation(async ({ input, ctx }) => {
      const action = await ctx.repos.moderationActions.findById(input.actionId)
      if (!action) throw new TRPCError({ code: 'NOT_FOUND' })

      // Check if appeal window still open (7 days)
      const appealDeadline = new Date(action.timestamp.getTime() + 7 * 24 * 60 * 60 * 1000)
      if (new Date() > appealDeadline) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Appeal window closed (7 days)' })
      }

      const appeal = await ctx.repos.appeals.create({
        ...input,
        appellantId: ctx.session.userId,
        status: 'pending',
        submittedAt: new Date(),
      })

      // Notify different moderator for second review
      await ctx.services.notifications.notifyModeratorsExcluding(action.moderatorId, {
        type: 'appeal_submitted',
        appealId: appeal.id,
      })

      return { appealId: appeal.id }
    }),

  // Get moderation stats (members only)
  getModerationStats: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid().optional(),
      dateRange: z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ input, ctx }) => {
      const stats = await ctx.repos.moderationActions.getStats({
        groupId: input.groupId,
        dateRange: input.dateRange,
      })

      return stats
    }),
})
```

---

## UI Routes

```
/moderation/logs                 → Public moderation log (members-only)
/moderation/stats                → Statistics dashboard
/moderation/terms                → Active moderators with term expiration dates
/moderation/terms/[id]           → Term details and performance
/moderation/nominate             → Nomination form
/moderation/appeal/[actionId]    → Submit appeal
/moderation/rate/[actionId]      → Rate moderation action
/admin/moderation                → Coordinator moderation queue
/admin/moderation/appeals        → Appeal queue (coordinators)
```

---

## De-escalation Templates

```typescript
const templates = {
  minor_violation: `Hey [user], we noticed [issue]. Could you please [corrective action]? Thanks for being part of our community!`,

  repeated_issue: `[User], we've discussed [issue] before. This violates [guideline]. Please review and adjust. Next step would be [consequence].`,

  serious_violation: `[User], your [action] violates [guideline] and causes harm. We're [consequence]. You can appeal via [link].`,
}
```

---

## Privacy & Security

### Public Information (Members-Only)

- Moderation log (pseudonymized moderators, no content text)
- Aggregate statistics (flags per category, average scores)
- Moderator performance metrics (if ≥5 rated actions)

### Private Information (Coordinators Only)

- Flagger identity
- Content preview (full text/image)
- Individual moderator real names
- Appeal details

### Anonymized

- Rating submitter identity (hidden from rated moderator)
- Moderator pseudonyms (unless opt-in)

### Audit Logging

- All moderation actions logged to NDJSON
- Flag submissions logged (with flagger ID for audits)
- Appeal submissions and outcomes logged
- Log location: `/logs/moderation/actions-YYYY-MM-DD.ndjson`

---

## Recall Triggers

Automatic triggers that create warnings:

- Average quality score <2.5 stars (after ≥10 rated actions)
- >5 appeals upheld (reversals indicate poor decisions)
- Average response time >48 hours
- Community petition signed by 20+ members

---

## Dependencies

### Required Modules

- **Forum** (0%) — Content entities (posts, comments)
- **Auth** (100%) — Role-based access, session management
- **Gamification** (15%) — RP earning system
- **Bridge** (partial) — AI-assisted moderation suggestions
- **Governance** (0%) — Recall proposal system

### Integration Points

- Listen for `content.created` events to enable flagging
- Emit `moderation.action_taken` events for content hiding
- Emit `rp.earned` events for moderator incentives
- Listen for `term.expired` events to revoke moderator role
- Emit `moderator.recalled` events for audit logs

---

## Success Metrics

### Quality

- **Average moderation score:** >3.8 stars community-wide
- **Appeal overturn rate:** <15% (indicates good initial decisions)
- **Response time:** <12 hours average (timely action)

### Equity

- **Moderator diversity:** Demographics match community
- **Load distribution:** Standard deviation <30% across moderators
- **Rating participation:** >40% of actions rated

### Transparency

- **Log visibility:** >50% of members view `/moderation/logs` monthly
- **Trust score:** >70% of members trust moderation process
- **Opt-in visibility:** >60% of moderators opt-in to real names

---

## Related Documentation

- [Forum Module](./forum-technical.md) — Content entities (posts, comments)
- [Gamification Module](./gamification-technical.md) — RP earning system
- [Admin Accountability Module](./admin-accountability-technical.md) — Parallel accountability for admins
- [Bridge Module](./bridge-technical.md) — AI-assisted suggestions
