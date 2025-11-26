# Gamification Module — Local Community Growth & Engagement

## Overview

The Gamification module provides ethical, research-backed mechanics to encourage local community formation through milestone-based progress tracking, celebration moments, and invitation rewards. It helps members visualize collective progress and unlock meaningful capabilities as communities grow.

**Current Progress:** <!-- progress:gamification=75 --> 75% (Phases 1-5 complete: DB schema, invitation flow, 8-step onboarding with RP, daily challenges, first-week journey, admin settings, dashboard integration)

**Category:** Community Connection, Cooperative Technology

---

## Core Purpose

Enable communities to:
- Track growth toward research-backed membership milestones
- Celebrate achievements with delightful animations
- Invite local members with transparent reward structures
- Unlock real capabilities (not cosmetic benefits) as communities scale
- Visualize collective progress toward sustainable community size

---

## Why Gamification Exists

### The Problem
- Communities struggle to reach critical mass for in-person coordination
- Members don't know "what comes next" or when to organize meetups
- Invitation mechanics feel transactional or manipulative
- Growth feels invisible without progress indicators
- No guidance on optimal community sizes for different activities

### The Solution
Gamification **makes community growth transparent and rewarding**:
- Research-backed milestone thresholds (Dunbar numbers, longevity studies)
- Visual progress bars showing path to next capability unlock
- Dual-sided invitation rewards (inviter + invitee both benefit)
- Beautiful 3D celebration animations for milestone achievements
- Ethical design without dark patterns (FOMO, loss aversion, social pressure)

### North-Star Outcomes
- Local groups reach 15 members and organize first public meetup
- 80%+ of milestones trigger meaningful action (not just point accumulation)
- Invitation acceptance rate >40% (high-quality, local connections)
- Communities reach 50+ members (sustainable Dunbar threshold) within 6 months
- Zero dark patterns, 100% transparent reward calculations

---

## Core Principles

1. **Research-backed thresholds** — Milestones align with proven community sizes
2. **Unlock capabilities, not cosmetics** — Every threshold enables new coordination
3. **Transparency over manipulation** — No hidden algorithms or FOMO tactics
4. **Dual-sided rewards** — Both inviter and invitee benefit from connections
5. **Accessible celebrations** — Respect `prefers-reduced-motion`, always skippable
6. **Opt-out available** — "Quiet mode" for users who prefer minimal gamification

---

## Research Foundation

### Dunbar Numbers & Community Longevity

**Academic Basis:**
- Research by Robin Dunbar on optimal social group sizes
- Longevity studies showing communities of 50, 150, and 500 are "disproportionately more common and have greater longevity"
- **Problematic range:** 12-15 members ("no one feels they get a fair share of time")

**Key Thresholds:**
- **5 members:** Intimate support network (core circle)
- **15 members:** Close community threshold (ready for public events)
- **25 members:** Past the awkward phase (resource sharing activates)
- **50 members:** Non-exclusive Dunbar number (sustainable community)
- **150 members:** Classic Dunbar number (peak cohesion, full autonomy)

**Source:**
- Dunbar, R. (1992). "Neocortex size as a constraint on group size in primates"
- Community longevity research (2015-2020 cohort studies)
- Avoiding the 12-15 problematic range by jumping directly from 5 → 15

---

## Milestone Progression

### Tier 1: Core Circle Formed (5 members)

**Unlocks:**
- Private group chat
- Schedule first planning call
- Draft shared purpose statement

**Celebration Message:**
> "You've formed a core support network! Five people ready to build something together."

**Action Nudge:**
> "Will you be the first to suggest a shared goal?" → **+50 RP**

---

### Tier 2: Community Ready (15 members)

**Unlocks:**
- **Host public meetups** (primary unlock)
- Create subgroups for focused work
- Run local proposals (lightweight governance)

**Celebration Message:**
> "You've built a close community! Time to meet in person and strengthen bonds."

**Action Nudge:**
> "We're 15 now, will you be the first to organize a meetup?" → **+100 RP**

**Why 15:** Past the core circle, ready for public events without feeling cliquey.

---

### Tier 3: Active Network (25 members)

**Unlocks:**
- Federated partnerships with other local groups
- Resource sharing board (tools, spaces, skills)
- Event calendar integration

**Celebration Message:**
> "Your community is thriving! You've passed the awkward phase where coordination gets tricky."

**Action Nudge:**
> "Ready to connect with other TogetherOS groups in your region?" → **+75 RP**

**Why 25:** Beyond the problematic 12-15 range, network effects activate.

---

### Tier 4: Sustainable Community (50 members)

**Unlocks:**
- Working groups (focused initiatives)
- Collective purchasing (bulk buying power)
- Time bank activation (skill exchange)

**Celebration Message:**
> "You've reached sustainable size! This is a proven community scale for long-term coordination."

**Action Nudge:**
> "Will you launch the first working group or mutual aid project?" → **+150 RP**

**Why 50:** Non-exclusive Dunbar number, research shows high longevity.

---

### Tier 5: Strong Coalition (100 members)

**Unlocks:**
- Multi-group initiatives (coordinate with other communities)
- Regional influence (voice in federated decisions)
- Mentorship program (help new groups form)

**Celebration Message:**
> "100 strong! You're a model for other communities building cooperative power."

**Action Nudge:**
> "Ready to mentor a new local group?" → **+200 RP**

**Why 100:** Double sustainable size, ready for complex coordination.

---

### Tier 6: Dunbar Community (150 members)

**Unlocks:**
- Full governance autonomy (complete decision-making independence)
- Chapter recognition (official TogetherOS chapter status)
- Grant eligibility (access to cooperative funding)

**Celebration Message:**
> "You've reached the classic Dunbar number! This is peak community cohesion—everyone can know everyone."

**Action Nudge:**
> "Will you draft your community's first formal governance proposal?" → **+250 RP**

**Why 150:** Classic Dunbar limit, maximum cohesive community size.

---

## Invitation Reward Mechanics

### Three-Stage Reward System

**Stage 1: Invitation Sent**
- **Action:** Member sends invite to someone in their city
- **Reward:** **+25 RP** (immediate gratification for effort)
- **Rationale:** Reward the action itself, not just the outcome

**Stage 2: Invitation Accepted**
- **Action:** Invitee joins and completes profile to 50%+
- **Reward (Inviter):** **+50 RP** (75 RP total)
- **Reward (Invitee):** **+100 RP** starting balance
- **Database:** Set `invitations.invitee_member_id` when account created (enables Stage 3 tracking)
- **Rationale:** Dual-sided reward, both parties benefit; durable link for quality tracking

**Stage 3: First Contribution**
- **Action:** Invitee makes first meaningful contribution (post, proposal, event attendance)
- **Reward (Inviter):** **+25 RP bonus** (100 RP total possible)
- **Rationale:** Reward quality (inviter vouched for engaged member)

### Anti-Abuse Safeguards

**Invitation Limits:**
- Max 5 invitations per week (prevent spam)
- Invitee must be in same city (enforce local focus)
- Invitee must complete profile to 50%+ within 7 days (prevent fake accounts)

**Quality Tracking:**
- Track "invite quality score" (% of invites that become active members)
- **Implementation:** Join `invitations` on `invitee_member_id` to check activity (posts, events, contributions)
- Active member = made ≥1 contribution in past 30 days
- Low quality score (<30%) triggers warning, then temp suspension of invite privileges
- Transparent scoring visible to member ("Your invite quality: 65%")
- **Why member ID matters:** Email-based tracking breaks when users change email or sign up via OAuth

**Geographic Validation:**
- Inviter and invitee must share same city/region tag
- Prevent long-distance "invite farms"

---

## Reward Points (RP) System

### What are Reward Points?

**Reward Points (RP)** are earned through specific actions that build local community:
- Inviting members
- Organizing meetups
- Launching working groups
- Mentoring new groups

**Distinct from Support Points (SP):**
- **Support Points (SP):** Allocated to proposals to signal priorities (max 10 per idea, reclaimed when proposals close)
- **Reward Points (RP):** Earned through gamified actions, used to unlock badges and progression

### RP Earning Opportunities

| Action | RP Reward | Tier Required |
|--------|-----------|---------------|
| Send invitation | +25 RP | Any |
| Invitee joins | +50 RP | Any |
| Invitee contributes | +25 RP | Any |
| Organize first meetup | +100 RP | 15+ members |
| Connect federated groups | +75 RP | 25+ members |
| Launch working group | +150 RP | 50+ members |
| Mentor new group | +200 RP | 100+ members |
| Draft governance proposal | +250 RP | 150+ members |

### RP Integration with Badges

RP unlock progression in badge skill trees:
- **Community Builder** badges (invite-focused)
- **Organizer** badges (event-focused)
- **Facilitator** badges (governance-focused)

See `rewards.md` for complete badge system.

---

## Progress Visualization

### Sidebar Component: GroupGrowthTracker

**Visual Elements:**
- Current member count with growth indicator (`47 members (+3 ↗)`)
- Achieved milestone badge (`✓ Community Ready (15)`)
- Progress bar to next milestone (88% visual + "3 to go" text)
- Next unlock preview ("Unlocks: Federated partnerships")
- Invitation CTA button (`[Invite someone in Seattle (+25 RP)]`)

**Example UI:**

```
📍 YOUR AREA [Seattle]
47 members (+3 ↗)

Community Growth
✓ Community Ready (15)

Next: Active Network
━━━━━━━━━━━━━━━━━━━━○○○ 88%
3 members to go
Unlocks: Federated partnerships

[Invite someone in Seattle (+25 RP)]

Milestone History ▼
  ✓ Core Circle Formed (5)
  ✓ Community Ready (15)
```

### Progress Calculation

```typescript
// Calculate progress between milestones
const currentCount = 22  // Current member count
const previousMilestone = 15  // Last achieved
const nextMilestone = 25      // Next target

const progress = ((currentCount - previousMilestone) /
                  (nextMilestone - previousMilestone)) * 100
// Result: ((22 - 15) / (25 - 15)) * 100 = 70%
```

---

## Celebration Animations

### Animation Framework: Framer Motion

**Why Framer Motion:**
- Lightweight (~30KB, already in TogetherOS)
- Excellent performance (CSS transforms)
- Built-in accessibility (`prefers-reduced-motion` support)
- Simple to implement, beautiful results

**NOT using React Three Fiber:**
- Too heavy (~600KB bundle)
- Overkill for celebration moments
- Performance concerns on mobile

**Future upgrade path:** Add Lottie for designer-created animations if needed (~60KB runtime).

---

### Animation State Machine

**Four States:**

1. **Entering** (0.8s)
   - Scale from 0.8 → 1.0
   - Fade in from 0 → 1
   - Spring animation with bounce

2. **Active** (2s)
   - Display celebration message
   - Animated emoji (rotate + scale pulse)
   - Confetti particles (optional)

3. **Action Prompt** (user-controlled or 5s timeout)
   - Slide in action nudge card
   - Display RP reward
   - Wait for user interaction

4. **Exiting** (0.5s)
   - Fade out
   - Scale down
   - Mark celebration as shown

---

### Sequential Animation Queue

**When user offline:**
- Milestones achieved while offline are queued
- On first login, show celebrations sequentially (one after another)
- Max 3 celebrations per session (prevent overwhelm)
- Remaining celebrations show on subsequent logins

**Example Flow:**
```
User offline → Group grows 15 → 25 → 50
User logs in → See celebration #1 (15 members)
             → User clicks "Continue"
             → See celebration #2 (25 members)
             → User clicks "Continue"
             → See celebration #3 (50 members)
             → All caught up!
```

---

### Accessibility & User Control

**Always Skippable:**
- "Skip" button visible at all times
- ESC key dismisses animation
- Click outside modal to close

**Respect Reduced Motion:**
```typescript
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

if (prefersReducedMotion) {
  // Show static card, no animations
  return <StaticMilestonCard milestone={milestone} />
}
```

**Screen Reader Support:**
```html
<div role="status" aria-live="polite" class="sr-only">
  Milestone achieved: Community Ready.
  You've built a close community! Time to meet in person.
</div>
```

---

### Example Animation Component

```typescript
// packages/ui/src/milestones/MilestoneCelebration.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type AnimationState = 'idle' | 'entering' | 'active' | 'actionPrompt' | 'exiting'

interface MilestoneCelebrationProps {
  milestone: {
    id: string
    threshold: number
    label: string
    celebration: string
    actionNudge?: { text: string; reward: number }
  }
  onComplete: (milestoneId: string) => void
}

export function MilestoneCelebration({ milestone, onComplete }: MilestoneCelebrationProps) {
  const [state, setState] = useState<AnimationState>('entering')
  const prefersReducedMotion = usePrefersReducedMotion()

  // State timing
  useEffect(() => {
    if (prefersReducedMotion) {
      setState('actionPrompt')
      return
    }

    const timings = { entering: 800, active: 2000 }
    const timer = setTimeout(() => {
      if (state === 'entering') setState('active')
      else if (state === 'active') setState('actionPrompt')
    }, timings[state])

    return () => clearTimeout(timer)
  }, [state, prefersReducedMotion])

  return (
    <AnimatePresence>
      {state !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            {/* Celebration content */}
            <motion.div
              className="text-6xl mb-4 text-center"
              animate={prefersReducedMotion ? {} : {
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
            >
              🎉
            </motion.div>

            <h2 className="text-2xl font-bold text-center mb-2">
              {milestone.label}
            </h2>

            <p className="text-center text-ink-700 mb-6">
              {milestone.celebration}
            </p>

            {state === 'actionPrompt' && milestone.actionNudge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-50 border border-brand-200 rounded-lg p-4"
              >
                <p className="text-sm font-medium mb-3">
                  {milestone.actionNudge.text}
                </p>
                <button
                  onClick={() => onComplete(milestone.id)}
                  className="bg-brand-500 text-white px-6 py-2 rounded-lg"
                >
                  Yes, I'll do it! (+{milestone.actionNudge.reward} RP)
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Ethical Gamification Framework

### ETHIC Principles

**E - Empowerment**
- ✅ Milestones unlock real capabilities (meetups, proposals, resource sharing)
- ✅ Users pursue cooperation goals they genuinely want
- ❌ NOT anxiety relief or compulsion

**T - Transparency**
- ✅ Public RP weights, visible calculations
- ✅ Document "why these thresholds" (link to Dunbar research)
- ✅ No hidden algorithms

**H - Honesty**
- ✅ Rewards intrinsic goals (organize, connect, coordinate)
- ❌ NO dark patterns (FOMO, loss aversion, infinite scrolling)

**I - Intrinsic Motivation**
- ✅ Autonomy: Members choose which milestones to pursue
- ✅ Competence: Progress bars show growing capability
- ✅ Relatedness: Shared community goals (not individual competition)

**C - Customization**
- ✅ Opt-out: "Quiet mode" disables all gamification
- ✅ Privacy: Hide progress from public leaderboards
- ✅ Accessibility: Reduced motion, screen reader support

---

### Self-Determination Theory in Practice

**Research Finding:** "Gamification exerted a positive effect on autonomy and relatedness, but minimal impact on competence"

**TogetherOS Application:**
- **Autonomy** ✅: Members control participation, no forced milestones
- **Competence** ⚠️: Tie RP to LEARNING (e.g., "Attended conflict resolution workshop +50 RP")
- **Relatedness** ✅: Shared community milestones foster connection

---

### Dark Pattern Avoidance

**Research Warning:** "If users are taking action to relieve anxiety rather than pursue something they genuinely want, you've created a dark pattern"

**TogetherOS Safeguards:**
- ✅ No countdown timers ("Only 2 hours left!")
- ✅ No manipulative scarcity ("Limited spots remaining!")
- ✅ No loss aversion ("You'll lose your streak!")
- ✅ No social pressure ("12 friends already joined!")
- ✅ Celebration animations always skippable
- ✅ Achievement-focused, not deficit-focused

**Quiet Mode:**
- Toggle in user settings: "Disable gamification notifications"
- Hides RP rewards, milestone celebrations, invitation nudges
- Progress still tracked (can re-enable later)

---

## Technical Architecture

### Database Schema

```sql
-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  threshold INT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  member_count INT NOT NULL,
  celebration_shown BOOLEAN DEFAULT FALSE,
  triggered_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_group ON milestones(group_id);
CREATE INDEX idx_milestones_celebration ON milestones(group_id, celebration_shown);

-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES members(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_member_id UUID REFERENCES members(id) ON DELETE SET NULL,  -- Set when invitation accepted
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'declined')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  rp_awarded_stage_1 BOOLEAN DEFAULT FALSE,  -- +25 RP on send
  rp_awarded_stage_2 BOOLEAN DEFAULT FALSE,  -- +50 RP on accept
  rp_awarded_stage_3 BOOLEAN DEFAULT FALSE,  -- +25 RP on first contribution
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX idx_invitations_invitee ON invitations(invitee_member_id);  -- For tracking invite quality
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_group ON invitations(group_id);

-- Reward points ledger
CREATE TABLE reward_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'invitation_sent', 'invitation_accepted', 'meetup_organized', etc.
  event_id UUID,  -- Reference to invitation, milestone, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rp_transactions_member ON reward_points_transactions(member_id);
CREATE INDEX idx_rp_transactions_event ON reward_points_transactions(event_type, event_id);

-- Reward points balances (materialized view)
CREATE TABLE reward_points_balances (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### API Endpoints

**Milestone Detection:**
```typescript
POST /api/groups/:id/join
// After adding member, check if milestone crossed
// If yes: create milestone event, notify online members

GET /api/groups/:id/milestones
// Fetch milestone history for group

GET /api/groups/:id/pending-milestones
// Fetch celebrations not yet shown to current user

POST /api/milestones/:id/mark-shown
// Mark celebration as shown for current user
```

**Invitation Flow:**
```typescript
POST /api/invitations/send
// Send invitation, award +25 RP immediately

POST /api/invitations/:id/accept
// Accept invitation, award inviter +50 RP, invitee +100 RP

GET /api/invitations/stats
// Get invite quality score for current user
```

**Reward Points:**
```typescript
GET /api/members/:id/reward-points
// Get RP balance and recent transactions

POST /api/reward-points/award
// Internal: Award RP for specific event
```

---

### Offline Milestone Tracking

**Client-Side Hook:**
```typescript
// apps/web/hooks/useMilestoneCelebrations.ts

export function useMilestoneCelebrations(groupId: string) {
  const [queue, setQueue] = useState<PendingCelebration[]>([])
  const [current, setCurrent] = useState<PendingCelebration | null>(null)

  // On mount: fetch pending celebrations
  useEffect(() => {
    async function loadPending() {
      const response = await fetch(`/api/groups/${groupId}/pending-milestones`)
      const pending = await response.json()
      setQueue(pending.slice(0, 3)) // Max 3 per session
    }
    loadPending()
  }, [groupId])

  // Sequential playback
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrent(next)
      setQueue(rest)
    }
  }, [current, queue])

  const onComplete = useCallback(async (milestoneId: string) => {
    await fetch(`/api/milestones/${milestoneId}/mark-shown`, { method: 'POST' })
    setCurrent(null) // Trigger next animation
  }, [])

  return { current, onComplete }
}
```

---

### Real-Time Milestone Detection

```typescript
// apps/web/app/api/groups/[id]/join/route.ts

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { memberId } = await req.json()

  // Add member to group
  await db.groups.addMember(params.id, memberId)

  // Check if milestone crossed
  const group = await db.groups.findById(params.id)
  const newCount = group.members.length

  const crossedMilestone = MILESTONES.find(m => m.threshold === newCount)

  if (crossedMilestone) {
    // Create milestone event
    const event = await db.milestones.create({
      groupId: params.id,
      threshold: crossedMilestone.threshold,
      memberCount: newCount,
      celebrationShown: false,
      triggeredByMemberId: memberId
    })

    // Notify online members (WebSocket/SSE)
    await notifyGroupMembers(params.id, {
      type: 'milestone_achieved',
      milestoneId: event.id,
      threshold: crossedMilestone.threshold
    })
  }

  return NextResponse.json({ success: true })
}
```

---

## Component Structure

### Files to Create

**Milestone Components:**
- `packages/ui/src/milestones/MilestoneCelebration.tsx` - Animation component
- `packages/ui/src/milestones/MilestoneDefinitions.ts` - Threshold constants
- `packages/ui/src/groups/GroupGrowthTracker.tsx` - Sidebar progress widget
- `apps/web/hooks/useMilestoneCelebrations.ts` - Celebration queue hook

**Invitation Components:**
- `packages/ui/src/groups/InviteModal.tsx` - Invitation form
- `packages/ui/src/groups/InviteButton.tsx` - CTA button
- `packages/ui/src/groups/InviteStats.tsx` - Quality score display

**API Routes:**
- `apps/web/app/api/groups/[id]/join/route.ts` - Modify for milestone detection
- `apps/web/app/api/groups/[id]/milestones/route.ts` - Milestone history
- `apps/web/app/api/groups/[id]/pending-milestones/route.ts` - Pending celebrations
- `apps/web/app/api/milestones/[id]/mark-shown/route.ts` - Mark shown
- `apps/web/app/api/invitations/send/route.ts` - Send invitation
- `apps/web/app/api/invitations/[id]/accept/route.ts` - Accept invitation
- `apps/web/app/api/invitations/stats/route.ts` - Invite quality stats

**Database:**
- `lib/db/milestones.ts` - Milestone CRUD operations
- `lib/db/invitations.ts` - Invitation CRUD operations
- `lib/db/reward-points.ts` - RP ledger operations
- `db/migrations/003_add_gamification_schema.sql` - Schema migration

**Types:**
- `packages/types/src/milestones.ts` - Milestone interfaces
- `packages/types/src/invitations.ts` - Invitation interfaces
- `packages/types/src/rewards.ts` - Update with RP event types

---

### Files to Modify

**Feed Sidebar:**
- `apps/web/app/feed/page.tsx` - Add `<GroupGrowthTracker>` to sidebar

**Group Pages:**
- `apps/web/app/groups/[id]/page.tsx` - Add growth tracker, celebration provider

**Layout:**
- `apps/web/app/layout.tsx` - Add celebration provider to root

**Existing Modules:**
- `lib/db/groups.ts` - Add `addMember()` hook for milestone detection

---

## Integration with Existing Modules

### Groups Module
- Growth tracker displays on group pages
- Milestone events stored in group context
- Member join triggers milestone check

### Rewards Module
- RP transactions logged alongside SP transactions
- Badge unlocks based on RP thresholds
- "Community Builder" badge tree for invitation rewards

### Feed Module
- Growth tracker widget in feed sidebar
- Trending local events pulled from group calendars
- Bridge challenges surface in right sidebar

### Social Economy Module
- RP can be converted to SP at 10:1 ratio (optional)
- Meetup organization earns both RP (gamification) and SP (contribution)

---

## Privacy & Transparency

### What's Tracked
- Member count growth over time
- Milestone achievement timestamps
- Invitation send/accept rates (per member)
- RP transaction history

### What's NOT Tracked
- Individual member activity (only aggregate group stats)
- Personal conversation content
- Private group discussions

### User Controls
- Opt-out via "Quiet mode" (disable all gamification)
- Hide RP balance from public profile
- Export invitation history (GDPR compliance)
- Delete RP transaction history on account closure

### Transparency Features
- Link to Dunbar research in milestone descriptions
- RP calculation formulas visible in settings
- Invite quality score methodology documented

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Status:** Pending
**Files:** Database schema, type definitions, milestone constants

**Deliverables:**
- `packages/types/src/milestones.ts`
- `packages/types/src/invitations.ts`
- `lib/db/milestones.ts`
- `lib/db/invitations.ts`
- `lib/db/reward-points.ts`
- `db/migrations/003_add_gamification_schema.sql`

**Success Criteria:**
- Schema migration runs successfully
- Type definitions compile
- Database operations testable with fixtures

---

### Phase 2: Progress Tracking (Week 2)
**Status:** Pending
**Files:** Sidebar component, milestone detection

**Deliverables:**
- `packages/ui/src/groups/GroupGrowthTracker.tsx`
- `apps/web/hooks/useMilestoneCelebrations.ts`
- Modify `apps/web/app/feed/page.tsx`
- Modify `apps/web/app/api/groups/[id]/join/route.ts`

**Success Criteria:**
- Growth tracker visible in feed sidebar
- Progress bar accurately shows % to next milestone
- Member join triggers milestone detection

---

### Phase 3: Celebrations (Week 3)
**Status:** Pending
**Files:** Animation component, celebration provider

**Deliverables:**
- `packages/ui/src/milestones/MilestoneCelebration.tsx`
- `apps/web/app/api/milestones/[id]/mark-shown/route.ts`
- Modify `apps/web/app/layout.tsx`

**Success Criteria:**
- Celebration animation plays on milestone achievement
- Offline milestones queue and play sequentially
- Animations respect `prefers-reduced-motion`
- Always skippable via button or ESC key

---

### Phase 4: Invitations (Week 4)
**Status:** Pending
**Files:** Invitation form, reward logic

**Deliverables:**
- `packages/ui/src/groups/InviteModal.tsx`
- `packages/ui/src/groups/InviteButton.tsx`
- `apps/web/app/api/invitations/send/route.ts`
- `apps/web/app/api/invitations/[id]/accept/route.ts`

**Success Criteria:**
- Invitation form validates email + geographic match
- +25 RP awarded on send, +50 RP on accept
- Invite quality score visible to member
- Anti-abuse limits enforced (5/week max)

---

## Testing Strategy

### Unit Tests
- Milestone threshold calculations
- RP reward logic (3-stage invitation flow)
- Progress percentage calculations
- Invite quality score calculations

### Integration Tests
- Member join → milestone detection → celebration queue
- Invitation send → accept → RP award → badge unlock
- Offline milestone catchup (queue multiple celebrations)

### E2E Tests
- User invites friend → friend joins → inviter sees +75 RP
- Group reaches 15 members → celebration plays → user organizes meetup → +100 RP
- User disables "Quiet mode" → no celebrations shown

---

## Success Metrics

### Engagement Metrics
- **Milestone trigger rate:** % of groups that reach each threshold
- **Action completion rate:** % of users who complete action nudges (target: >80%)
- **Invitation acceptance rate:** % of invites that convert to members (target: >40%)

### Quality Metrics
- **Invite quality score:** Average % of invites that become active members (target: >60%)
- **Meetup organization rate:** % of 15+ member groups that organize meetup within 30 days (target: >70%)
- **Celebration engagement:** % of users who interact with action nudges vs skip (target: >50%)

### Ethical Metrics
- **Opt-out rate:** % of users who enable "Quiet mode" (acceptable: <10%)
- **Completion anxiety:** User survey: "Do you feel pressured?" (target: <5% "yes")
- **Intrinsic motivation:** User survey: "Are you pursuing goals you genuinely want?" (target: >85% "yes")

---

## Future Enhancements

### Planned Features
- **Lottie animations:** Designer-created celebration moments (upgrade from Framer Motion)
- **Regional leaderboards:** Friendly competition between cities (opt-in only)
- **Milestone retrospectives:** "Remember when we hit 15? Here's what we've done since"
- **Custom milestones:** Groups can define their own thresholds (e.g., "100 hours of timebanking")

### Research Areas
- Optimal RP → SP conversion ratios
- Impact of different celebration animation styles on engagement
- Long-term retention effects of milestone-based progression
- Cross-group coordination mechanics (federated milestones)

---

## References

**Academic Research:**
- Dunbar, R. (1992). "Neocortex size as a constraint on group size in primates"
- Community longevity studies (2015-2020 cohorts)
- Self-Determination Theory (Deci & Ryan, 2000)
- ETHIC framework for ethical gamification (2018)

**Design Patterns:**
- Fediverse local/federated timelines (Mastodon, Lemmy)
- Discord server growth mechanics
- Reddit community stats displays
- Duolingo streak celebrations (skippable, accessible)

**Related TogetherOS Modules:**
- `docs/modules/groups.md` - Group types and membership
- `docs/modules/rewards.md` - SP system and badge definitions
- `docs/modules/feed.md` - Sidebar component integration
- `docs/modules/social-economy.md` - Timebanking and collective purchasing

---

**Last Updated:** 2025-11-01
**Status:** Spec complete, ready for Phase 1 implementation
**Contributors:** @coopeverything-core
