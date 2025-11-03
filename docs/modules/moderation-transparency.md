# Moderation Transparency Module

## Overview

The Moderation Transparency module provides members-only visibility into moderation actions with a quality-driven incentive system. Moderators earn Reward Points (RP) based on member ratings of their actions, creating accountability through peer review while maintaining empathy-first practices.

**Current Progress:** <!-- progress:moderation-transparency=0 --> 0%

**Category:** Collective Governance, Cooperative Technology

---

## Core Purpose

Enable communities to:
- Track all moderation actions transparently (members-only access)
- Rate moderation quality through 1-5 star member feedback
- Incentivize high-quality moderation through RP earnings tied to scores
- Rotate moderators on 1-month terms with performance tracking
- Maintain empathy-first approach with AI-assisted de-escalation
- Protect privacy (flagger identity hidden, moderator pseudonymized)
- Enable democratic accountability through recall mechanism

---

## Key Concepts

### Empathy-First Moderation

TogetherOS prioritizes **de-escalation and education** over punishment:

- **AI-Assisted:** Bridge suggests context-aware responses before moderator acts
- **De-escalation Templates:** Pre-written empathetic messages for common situations
- **Mediation First:** Offer conflict resolution before content removal
- **Warnings Before Bans:** Graduated response system
- **Restorative Justice:** Focus on harm repair, not retribution

---

### Quality-Driven RP Incentives

Moderators earn RP based on **member ratings** of their actions:

**Rating Criteria (1-5 stars each):**
1. **Fairness:** Was the decision justified and consistent with guidelines?
2. **Empathy:** Did the moderator de-escalate appropriately?
3. **Speed:** Was the response timely?
4. **Communication:** Was the explanation clear and respectful?

**RP Earning Formula:**
- Base RP per action: **+10 RP**
- Quality multiplier based on average score:
  - 5 stars (exceptional): **2.0x** → +20 RP
  - 4 stars (good): **1.5x** → +15 RP
  - 3 stars (adequate): **1.0x** → +10 RP
  - 2 stars (poor): **0.5x** → +5 RP
  - 1 star (harmful): **0x** → +0 RP

**Term Completion Bonuses:**
- Complete 1-month term with avg **≥4.0 stars:** +100 RP
- Complete with avg **3.0-3.9 stars:** +50 RP
- Below 3.0: No bonus

**Penalties:**
- Early recall (voted out): **-50 RP**

---

### Rotating Moderator System

**Default term:** 1 month (not 6 months like admins)

**Why shorter terms?**
- Moderation is emotionally taxing (prevent burnout)
- Broader participation (more members experience role)
- Faster feedback cycles (poor performers removed quickly)
- Reduces concentrated power

**Re-election Rules:**
- Must wait 1 month after term ends before reapplying
- Can serve unlimited terms (with breaks)
- Encourages distributed moderation across community

---

## Key Entities

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

## Core Features

### Phase 1: Public Moderation Log (0% - SPEC ONLY)

#### Features:
- Members-only log at `/moderation/logs`
- Recent 30 days of moderation actions
- Columns: Date/time, Action type, Reason category, Content ID, Score
- Moderator names pseudonymized (e.g., "Moderator #42") unless opt-in
- Content snippets NOT shown (privacy protection)
- Flagger identity always hidden
- Filter by: Group, action type, date range, score range

#### Example Log Entry:
```
Jan 10, 2:30pm | Content Hidden | Spam | Post #xyz123 | 4.2 stars | Moderator #42
Justification: "Repeated commercial links violating no-spam policy"
Community Guideline: Section 3.2 (No Commercial Spam)
```

#### Access Control:
- **Members-only** — Must be logged in
- Moderator real names hidden unless they opt-in via settings
- Content text hidden (only IDs shown)

#### UI Components:
- `ModerationLogTable` — Sortable, filterable table
- `LogEntryDetail` — Expandable row with full justification
- `ModeratorPseudonym` — Display logic (real name if opted-in, else "Moderator #N")
- `ScoreBadge` — Star rating display

#### UI Route: `/moderation/logs`

#### Implementation:
- [ ] `ModerationLogTable` component with pagination
- [ ] Filter UI (group, action type, date range)
- [ ] Pseudonymization logic
- [ ] API endpoint: `getModerationLog(filters)`
- [ ] Privacy enforcement (no content text in response)

---

### Phase 2: Aggregate Statistics (0% - SPEC ONLY)

#### Features:
- Statistics dashboard at `/moderation/stats`
- Aggregate metrics (community-wide or per-group):
  - Total flags submitted (30/90 days)
  - Flags per category (pie chart: spam 35%, harassment 20%, etc.)
  - Average resolution time (hours from flag to action)
  - Average quality score per moderator (bar chart)
  - % dismissed vs action-taken
  - Distribution of actions (pie chart: dismissed 60%, hidden 25%, warned 10%, banned 5%)
- Trend charts (last 30/90 days):
  - Flags per week
  - Average quality score over time
  - Resolution time trend

#### Privacy Threshold:
- Moderator-level scores only shown if **≥5 rated actions** (privacy protection)
- Aggregate stats always public (members-only)

#### UI Components:
- `StatsOverview` — Top-level metrics cards
- `CategoryPieChart` — Flag reasons breakdown
- `ModeratorPerformanceChart` — Bar chart with anonymized moderators
- `TrendLineChart` — Time-series data

#### UI Route: `/moderation/stats`

#### Implementation:
- [ ] `StatsOverview` component
- [ ] Chart components (pie, bar, line)
- [ ] API endpoint: `getModerationStats(filters)`
- [ ] Privacy threshold enforcement (≥5 actions)

---

### Phase 3: Coordinator Moderation Queue (0% - SPEC ONLY)

#### Features:
- Coordinator-only queue at `/admin/moderation`
- **Pending flags:** Content awaiting review
- **Content preview:** See full text/image (coordinators only)
- **Flagger details:** Who flagged, when, why (visible to coordinators only)
- **AI assistance:** Bridge suggests response + guideline citation
- **Action buttons:** Dismiss, Hide Content, Warn User, Ban User (all require justification)
- **De-escalation templates:** Pre-written empathetic responses
- **Appeal queue:** Contested decisions needing second review

#### Flag Detail View:
```
Flag #123 | Submitted Jan 10, 2:15pm

Content Type: Comment
Content ID: comment-xyz789
Content Preview: [full text shown to coordinator]

Flagger: alice@example.com (visible to coordinators only)
Reason: Harassment
Details: "This user repeatedly insults and attacks my posts"

AI Suggestion (Bridge):
"Consider mediation first. Review conversation history for context.
If pattern of harassment confirmed, warn user per Section 2.1.
Cite: Community Guideline Section 2.1 (Respectful Communication)"

Action Buttons:
[Dismiss Flag] [Hide Content] [Warn User] [Ban User] [Request Mediation]
```

#### De-escalation Templates:
- **Minor violation:** "Hey [user], we noticed [issue]. Could you please [corrective action]? Thanks for being part of our community!"
- **Repeated issue:** "[User], we've discussed [issue] before. This violates [guideline]. Please review and adjust. Next step would be [consequence]."
- **Serious violation:** "[User], your [action] violates [guideline] and causes harm. We're [consequence]. You can appeal via [link]."

#### UI Components:
- `FlagQueueTable` — Pending flags sorted by priority
- `FlagDetailCard` — Full context with AI suggestion
- `ActionButtonGroup` — Dismiss/Hide/Warn/Ban with justification modal
- `DeescalationTemplateSelector` — Pre-written messages
- `AppealQueue` — Contested decisions for second review

#### UI Route: `/admin/moderation`

#### Access Control:
- **Coordinators and moderators only**
- Platform-level coordinators see all flags
- Group coordinators see only their group's flags

#### Implementation:
- [ ] `FlagQueueTable` component
- [ ] `FlagDetailCard` with AI integration
- [ ] `ActionButtonGroup` with justification form
- [ ] De-escalation template library
- [ ] Appeal queue UI
- [ ] API endpoints: `getPendingFlags()`, `takeAction()`, `getAppeals()`

---

### Phase 4: Member Rating Interface (0% - SPEC ONLY)

#### Features:
- After moderation action, affected users see rating prompt (optional)
- Rating interface appears:
  - On content page if hidden/removed
  - Via notification after warn/ban
  - In moderation log for other members
- 5-star scale with criteria explained:
  - Fairness: "Was the decision justified?"
  - Empathy: "Was the moderator respectful?"
  - Speed: "Was the response timely?"
  - Communication: "Was the explanation clear?"
- Optional comment field (10-500 chars)
- Anonymous submission (rater identity hidden from moderator)
- One-time rating (cannot re-rate same action)

#### Example Rating Prompt:
```
A moderator reviewed your flagged content and took action.
Please rate this moderation decision (optional):

Fairness: ⭐⭐⭐⭐⭐ (5/5)
Empathy: ⭐⭐⭐⭐☆ (4/5)
Speed: ⭐⭐⭐⭐⭐ (5/5)
Communication: ⭐⭐⭐⭐☆ (4/5)

Optional Comment:
[Text area: "Moderator was respectful but could have explained the guideline better"]

☑ Submit rating anonymously
[Submit Rating] [Skip]
```

#### Aggregate Score Display:
- Shown after **≥5 ratings** (privacy threshold)
- Displayed in moderation log: "4.2 stars (based on 12 ratings)"
- Moderator sees aggregate only (cannot identify individual raters)

#### UI Components:
- `RatingPrompt` — 5-star input per criterion
- `RatingAggregateDisplay` — Average score badge in logs
- `RatingHistogram` — Distribution (for moderator performance view)

#### UI Route: Inline on affected content pages + `/moderation/rate/[actionId]`

#### Implementation:
- [ ] `RatingPrompt` component with 4 criteria
- [ ] Rating submission API endpoint
- [ ] Privacy enforcement (≥5 threshold, anonymization)
- [ ] Notification integration (prompt users after action)
- [ ] One-time rating enforcement

---

### Phase 5: Rotating Moderator System (0% - SPEC ONLY)

#### Features:
- **1-month default term** (configurable per group)
- Rotation reminders at 3 weeks (7 days before expiration)
- Automatic term expiration (role revoked at end date)
- Re-election flow:
  - Nomination proposal (self or peer-nominated)
  - 1-week deliberation
  - Vote (simple majority)
  - If approved → New term starts after 1-month break
- Recall mechanism (community vote if performance poor)
- Load balancing (ensure distributed moderation across community)

#### Term Lifecycle:
1. **Nomination:** Member nominated for moderator role
2. **Vote:** Group/assembly votes (deliberation + voting period)
3. **Activation:** If approved, term starts immediately
4. **Active Service:** 1 month of moderation with performance tracking
5. **Completion:** Term ends, performance reviewed
6. **Cooldown:** 1-month break before re-election eligible
7. **Re-nomination:** Can run for new term after cooldown

#### Performance Review (End of Term):
- Aggregate metrics calculated
- Average quality score displayed
- RP bonus awarded (if avg ≥3.0 stars)
- Public summary posted (if moderator opts-in)
- Recommendations for improvement (private feedback)

#### Recall Triggers (Automatic Warnings):
- Average quality score <2.5 stars (after ≥10 rated actions)
- >5 appeals upheld (reversals indicate poor decisions)
- Average response time >48 hours
- Community petition signed by 20+ members

#### UI Components:
- `ModeratorTermCard` — Current term with countdown
- `PerformanceReview` — End-of-term summary
- `RecallProposal` — Template for initiating recall
- `NominationForm` — Self or peer nomination
- `TermRotationCalendar` — Upcoming expirations

#### UI Routes:
- `/moderation/terms` — Active moderators with term expiration dates
- `/moderation/terms/[id]` — Term details and performance
- `/moderation/nominate` — Nomination form

#### Implementation:
- [ ] `ModeratorTerm` entity with expiration tracking
- [ ] Automatic term expiration job (daily cron)
- [ ] Rotation reminder notifications (7 days before)
- [ ] Performance review calculation
- [ ] Recall proposal integration
- [ ] Re-election cooldown enforcement

---

### Phase 6: Appeal System (0% - SPEC ONLY)

#### Features:
- Members can appeal moderation decisions within 7 days
- Appeal creates second review by different moderator
- Original moderator notified but cannot review own appeal
- Appeal outcomes: Upheld (original decision stands) or Overturned (decision reversed)
- If overturned → Original action undone (content restored, ban lifted)
- Appeal history tracked for moderator performance

#### Appeal Flow:
1. User receives moderation action (content hidden, warning, ban)
2. Clicks "Appeal Decision" link (within 7 days)
3. Fills appeal form:
   - Reason for appeal (10-1000 chars)
   - Additional evidence/context
4. Submit → Appeal enters queue
5. Different moderator reviews:
   - Sees original flag, action, justification
   - Sees appellant's reason
   - Reviews evidence
6. Makes decision: Uphold or Overturn
7. If Overturned:
   - Undo original action (restore content, lift ban)
   - Original moderator notified (performance metric updated)
   - Appellant notified: "Your appeal was successful"
8. If Upheld:
   - Original action stands
   - Appellant notified: "Your appeal was reviewed but decision stands"

#### UI Components:
- `AppealForm` — Reason + evidence submission
- `AppealQueue` — Pending appeals (coordinators only)
- `AppealReview` — Second moderator review interface
- `AppealHistory` — Past appeals per action

#### UI Routes:
- `/moderation/appeal/[actionId]` — Submit appeal
- `/admin/moderation/appeals` — Appeal queue (coordinators)

#### Implementation:
- [ ] `Appeal` entity with status tracking
- [ ] Appeal submission API endpoint
- [ ] Second moderator assignment (exclude original)
- [ ] Action reversal logic (restore content, lift ban)
- [ ] Performance metric updates (appeals upheld)
- [ ] Notification integration

---

## User Journeys

### Journey 1: Member Flags Content

**Actor:** Alice, community member

**Steps:**
1. Sees spam post in `/feed` (commercial links, repeated 5 times)
2. Clicks "⚑ Flag" button
3. Selects reason: "Spam"
4. Enters details: "User posted same commercial link 5 times today"
5. Clicks "Submit Flag"
6. System:
   - Creates `Flag` entity (status: pending)
   - Notifies on-duty moderators
   - Hides flagger identity (Alice) from public
7. Confirmation message: "Thank you for reporting. Moderators will review within 24 hours."

**Outcome:** Flag submitted, moderators notified, Alice's identity protected

---

### Journey 2: Moderator Reviews Flag with AI Assistance

**Actor:** Bob, moderator (on 1-month term)

**Steps:**
1. Receives notification: "New flag submitted"
2. Navigates to `/admin/moderation` (coordinator queue)
3. Sees pending flag at top (sorted by time)
4. Clicks flag → Sees details:
   - Content preview: [spam post with commercial links]
   - Flagger: alice@example.com (visible to Bob only)
   - Reason: Spam
   - Details: "User posted same commercial link 5 times today"
5. Bridge AI suggests:
   - "Likely spam. Check user's post history for pattern."
   - "Action: Hide content, warn user per Section 3.2"
   - "Guideline: No Commercial Spam (Section 3.2)"
6. Bob clicks "View Post History" → Confirms 5 identical posts
7. Bob selects "Hide Content" button
8. Enters justification: "Repeated commercial links violate no-spam policy (Section 3.2)"
9. Selects de-escalation template: "Minor violation" warning
10. Clicks "Take Action"
11. System:
    - Hides post from feed
    - Sends warning message to user
    - Updates flag status: action_taken
    - Creates `ModerationAction` entity
    - Logs to NDJSON audit trail
12. User receives warning: "Your post was hidden for violating Section 3.2..."

**Outcome:** Spam removed, user warned, action logged

---

### Journey 3: Member Rates Moderation Action

**Actor:** Carol, community member (saw the hidden spam post in logs)

**Steps:**
1. Browses `/moderation/logs` (members-only)
2. Sees recent action: "Content Hidden | Spam | 2 hours ago | Moderator #5"
3. Clicks "Rate This Action" (optional)
4. Sees rating prompt:
   - Fairness: How fair was this decision?
   - Empathy: Was moderator respectful?
   - Speed: Was response timely?
   - Communication: Was explanation clear?
5. Carol rates:
   - Fairness: ⭐⭐⭐⭐⭐ (5/5 — clearly spam)
   - Empathy: ⭐⭐⭐⭐☆ (4/5 — warning was polite)
   - Speed: ⭐⭐⭐⭐⭐ (5/5 — 2 hours is fast)
   - Communication: ⭐⭐⭐⭐⭐ (5/5 — guideline cited)
6. Average: 4.75 stars
7. Optional comment: "Good job catching this quickly"
8. Checks "Submit anonymously" (default)
9. Clicks "Submit Rating"
10. System:
    - Creates `ModerationRating` entity
    - Keeps Carol's identity anonymous from Bob
    - Updates Bob's performance metrics (average score)
    - Calculates RP: 10 base × 1.5 multiplier (4-5 star range) = **+15 RP**

**Outcome:** Bob earns 15 RP for quality moderation, Carol's feedback recorded

---

### Journey 4: Moderator Completes Term with Bonus

**Actor:** Bob, moderator (end of 1-month term)

**Steps:**
1. Bob's term expires after 30 days
2. System calculates performance metrics:
   - Actions: 42
   - Average score: 4.2 stars (based on 35 ratings)
   - RP earned: 600 RP (base + quality multipliers)
   - Response time: 3.5 hours avg
   - Appeals: 2 received, 0 upheld
3. System awards term completion bonus: **+100 RP** (avg ≥4.0 stars)
4. Total RP for term: 700 RP
5. Performance review posted to `/moderation/terms/[bob-term-id]`:
   - "Bob completed term with 4.2-star average"
   - "Consistently fair and timely responses"
   - "Recommendation: Eligible for re-election after 1-month break"
6. Bob receives notification: "Term completed! You earned 700 RP. Thanks for your service."
7. Role revoked (no longer moderator)
8. Cooldown period starts (1 month)

**Outcome:** Bob's term complete, 700 RP earned, performance publicly recognized

---

### Journey 5: Member Appeals Moderation Decision

**Actor:** Dave, user whose content was hidden

**Steps:**
1. Dave receives warning: "Your comment was hidden for harassment (Section 2.1)"
2. Dave believes decision was wrong (comment was sarcastic, not harassment)
3. Clicks "Appeal Decision" link
4. Fills appeal form:
   - Reason: "My comment was sarcastic, not harassing. I was joking with a friend."
   - Evidence: "Check my post history with @frienduser — we joke like this often"
5. Submits appeal
6. System:
   - Creates `Appeal` entity (status: pending)
   - Assigns to different moderator (not Bob)
   - Notifies second moderator: Eve
7. Eve reviews:
   - Original flag, Bob's action, Dave's appeal
   - Checks Dave's post history with @frienduser
   - Confirms: pattern of friendly banter, no malice
8. Eve decides: **Overturn**
9. Enters outcome: "Upon review, comment appears to be friendly banter, not harassment. Restoring content."
10. System:
    - Restores Dave's comment
    - Updates appeal status: overturned
    - Updates Bob's performance: appeals_upheld +1
    - Notifies Dave: "Your appeal was successful. Content restored."
    - Notifies Bob: "Your decision on [action] was overturned on appeal."

**Outcome:** Dave's content restored, Bob's performance metrics updated, accountability maintained

---

### Journey 6: Community Recalls Underperforming Moderator

**Actor:** Frank, community member (concerned about moderator Gina's performance)

**Steps:**
1. Frank reviews `/moderation/stats`
2. Sees Moderator #8 (Gina):
   - Average score: 2.2 stars (after 15 rated actions)
   - 6 appeals, 4 upheld (67% reversal rate)
   - Average response time: 52 hours
3. Frank clicks "View Moderator #8 Details"
4. Sees pattern: Harsh decisions, poor communication, slow response
5. Frank clicks "Initiate Recall"
6. System checks: ≥20 members must sign petition
7. Frank creates recall proposal:
   - Reason: "Consistently poor performance, harsh decisions, slow response"
   - Evidence: Links to 4 overturned appeals, low ratings
8. Shares petition link with community
9. 23 members sign petition within 3 days
10. Governance module creates recall vote:
    - 7-day deliberation
    - 3-day voting
11. Result: 71% vote to recall Gina
12. System:
    - Revokes Gina's moderator role immediately
    - Deducts 50 RP penalty (recall penalty)
    - Updates term status: recalled
    - Logs recall reason publicly
    - Notifies Gina: "Your moderator role was recalled by community vote"
13. Pending flags reassigned to other moderators

**Outcome:** Underperforming moderator removed, community accountability maintained

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
        reversible: input.decision !== 'ban_user', // Bans require special reversal
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
      const baseRP = 10
      let multiplier = 1.0
      if (average >= 5) multiplier = 2.0
      else if (average >= 4) multiplier = 1.5
      else if (average >= 3) multiplier = 1.0
      else if (average >= 2) multiplier = 0.5
      else multiplier = 0

      const rpEarned = Math.floor(baseRP * multiplier)
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

## Dependencies

### Required Modules:
- **Forum** (0%) — Content entities (posts, comments)
- **Auth** (100%) — Role-based access, session management
- **Gamification** (15%) — RP earning system
- **Bridge** (partial) — AI-assisted moderation suggestions
- **Governance** (0%) — Recall proposal system

### Integration Points:
- Listen for `content.created` events to enable flagging
- Emit `moderation.action_taken` events for content hiding
- Emit `rp.earned` events for moderator incentives
- Listen for `term.expired` events to revoke moderator role
- Emit `moderator.recalled` events for audit logs

---

## Implementation Roadmap

### Month 1: Flag System & Queue
- [ ] `Flag` entity with validation
- [ ] Flag submission API endpoint
- [ ] Coordinator queue UI
- [ ] Content preview (coordinators only)

### Month 2: Moderation Actions & AI
- [ ] `ModerationAction` entity
- [ ] Action execution (hide content, warn, ban)
- [ ] Bridge AI integration (suggestion engine)
- [ ] De-escalation templates

### Month 3: Rating System
- [ ] `ModerationRating` entity
- [ ] Rating UI (4 criteria, 5 stars each)
- [ ] RP earning calculation
- [ ] Privacy enforcement (≥5 threshold, anonymization)

### Month 4: Public Transparency
- [ ] Moderation log UI (members-only)
- [ ] Aggregate statistics dashboard
- [ ] Pseudonymization logic
- [ ] Trend charts

### Month 5: Terms & Appeals
- [ ] `ModeratorTerm` entity with expiration
- [ ] Rotation system (automatic expiration)
- [ ] Performance review calculation
- [ ] Appeal system UI and logic

---

## Success Metrics

### Quality
- **Average moderation score:** >3.8 stars community-wide
- **Appeal overturn rate:** <15% (indicates good initial decisions)
- **Response time:** <12 hours average (timely action)

### Equity
- **Moderator diversity:** Demographics match community (age, gender, experience)
- **Load distribution:** Standard deviation <30% across moderators (balanced work)
- **Rating participation:** >40% of actions rated (sufficient feedback)

### Transparency
- **Log visibility:** >50% of members view `/moderation/logs` monthly
- **Trust score:** >70% of members trust moderation process (survey)
- **Opt-in visibility:** >60% of moderators opt-in to real names (transparency confidence)

---

## Future Enhancements

### Phase 7: Advanced Features
- Predictive flagging (AI detects likely violations before flagged)
- Multi-moderator consensus (require 2+ moderators for bans)
- Restorative justice circles (mediated conflict resolution)
- Moderator training program (onboarding with AI coaching)

### Phase 8: Federation
- Cross-instance moderation coordination
- Shared ban lists (opt-in, for severe violations)
- Federated moderator reputation

---

## Related Documentation

- [Forum Module](./forum.md) — Content entities (posts, comments)
- [Gamification Module](./gamification.md) — RP earning system
- [Admin Accountability Module](./admin-accountability.md) — Parallel accountability for admins
- [Bridge Module](./bridge.md) — AI-assisted suggestions
- [Governance Module](./governance.md) — Recall proposals
