# Onboarding Experience Module

**Status:** 100% (Production-ready)
**Category:** Community Connection, Collaborative Education
**Priority:** High (first-time user experience)

## Overview

The Onboarding Experience is a comprehensive learning system designed to welcome newcomers to Coopeverything, teach platform usage, develop essential cooperative skills, and establish daily engagement habits through gamified learning paths, quizzes, rewards, and badges.

## Core Vision

Transform new members from curious visitors into confident contributors through structured, rewarding learning experiences that teach both **how to use the platform** and **how to cooperate effectively**.

## Key Components

### 1. Learning Paths
- **Structured mini-lessons** covering:
  - Platform navigation and key features
  - Cooperation principles and values
  - How to participate in governance (proposals, decisions)
  - Using the 4-ledger economy (SP, RP, TBC, SH)
  - Finding and joining groups
  - Creating meaningful contributions

- **Progressive difficulty:**
  - Beginner: Platform basics, first contribution
  - Intermediate: Group participation, proposal creation
  - Advanced: Moderation, facilitation, treasury management

### 2. Quizzes & Assessments
- Knowledge checks after each lesson
- Scenario-based questions (e.g., "How would you respond to conflict?")
- Practical exercises (e.g., "Allocate 10 Support Points to proposals")
- Immediate feedback with explanations
- RP rewards for completion

### 3. Skill Development
Focus on **cooperative competencies:**
- **Self-moderation:** Recognizing and managing emotional reactions
- **Empathic communication:** Active listening, de-escalation
- **Consensus-building:** Finding common ground, minority reports
- **Contribution tracking:** Documenting work, requesting RP
- **Resource stewardship:** Fair allocation, anti-hoarding mindset

### 4. Reward Points (RP) & Badges
- **RP awards** for:
  - Completing lessons (5-10 RP each)
  - Passing quizzes (10-20 RP each)
  - Finishing learning paths (50-100 RP each)
  - First contributions (bonus 25 RP)

- **Badge system:**
  - Milestone badges (lessons completed, days active)
  - Skill badges (self-moderation certified, consensus builder)
  - Contribution badges (first post, first proposal, first facilitation)
  - Social badges (welcomed 5 newcomers, etc.)

### 5. Daily Engagement Mechanics
- **Streaks:** Consecutive days visiting (visual indicator)
- **Daily challenges:** Small tasks worth 5-10 RP (e.g., "React to 3 posts", "Allocate 5 SP")
- **Check-in rewards:** Bonus RP for consistency (7-day streak = 50 RP)
- **Community events:** Coordinated onboarding cohorts (weekly start dates)

### 6. Bridge Integration Throughout
- **Interactive Q&A:** Ask Bridge questions during lessons
- **Contextual help:** Bridge suggests related content based on progress
- **Personalized paths:** Bridge recommends lessons based on interests
- **Progress tracking:** Bridge tracks completed modules and suggests next steps
- **Encouragement:** Bridge celebrates milestones and streak achievements

## User Flow

### Week 1: Welcome & Basics
1. **First visit:** Bridge greeting, quick profile setup
2. **Lesson 1:** Platform tour (navigation, key features)
3. **Quiz 1:** Platform basics (earn 10 RP)
4. **Lesson 2:** Cooperation principles (anti-plutocracy, consent-based governance)
5. **First action:** React to 3 posts in Feed (earn 5 RP)
6. **Badge earned:** "First Steps" (awarded after 5 actions)

### Week 2: Participation
7. **Lesson 3:** How to create a post
8. **Exercise:** Write and publish first post (earn 25 RP bonus)
9. **Lesson 4:** Understanding Support Points
10. **Exercise:** Allocate 10 SP to proposals (earn 10 RP)
11. **Badge earned:** "Voice Heard" (first post published)

### Week 3: Cooperation Skills
12. **Lesson 5:** Self-moderation techniques
13. **Scenario quiz:** Responding to disagreement (earn 20 RP)
14. **Lesson 6:** Creating proposals
15. **Exercise:** Draft a proposal (doesn't need to publish, earn 15 RP)
16. **Badge earned:** "Peacekeeper" (self-moderation certified)

### Week 4: Advanced Features
17. **Lesson 7:** Joining and contributing to groups
18. **Lesson 8:** Using the 4-ledger economy (SP, RP, TBC, SH)
19. **Lesson 9:** Timebanking and mutual aid
20. **Final assessment:** Comprehensive quiz (earn 50 RP)
21. **Badge earned:** "Cooperator" (onboarding complete)

## Design Principles

### 1. Tiny, Rewarding Steps
- Each lesson: 3-5 minutes maximum
- Immediate RP feedback for completion
- Progress bar visible at all times
- No overwhelming information dumps

### 2. Learn by Doing
- Practical exercises over passive reading
- Real platform actions (with safety guardrails)
- Feedback loops (see impact of contributions)
- Undo/reset options for experimentation

### 3. Autonomy & Choice
- Optional learning paths (can skip to topics of interest)
- Multiple difficulty levels
- Self-paced progress (no time pressure)
- Can pause/resume anytime

### 4. Social Connection
- Cohort-based onboarding (start with others)
- Peer recognition (badge showcases)
- Mentorship pairing (experienced members help newcomers)
- Group celebrations (cohort milestones)

### 5. Anti-Addictive Design
- **No artificial scarcity or FOMO**
- **No dark patterns** (misleading CTAs, hidden unsubscribe)
- **No infinite scroll** in lessons
- **Healthy boundaries:** Suggest breaks, limit daily RP cap
- **Transparency:** Clear explanations of how RP/badges work

## Technical Architecture

### Data Models
```typescript
interface OnboardingProgress {
  user_id: string
  current_path: string
  lessons_completed: string[]
  quizzes_passed: string[]
  badges_earned: string[]
  total_rp_earned: number
  streak_days: number
  last_check_in: Date
  created_at: Date
  updated_at: Date
}

interface Lesson {
  id: string
  path_id: string
  title: string
  content: string  // Markdown or interactive content
  quiz_id?: string
  rp_reward: number
  prerequisites: string[]
  estimated_minutes: number
}

interface Quiz {
  id: string
  lesson_id: string
  questions: QuizQuestion[]
  passing_score: number
  rp_reward: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  criteria: BadgeCriteria
  rp_bonus?: number
}
```

### API Endpoints
- `GET /api/onboarding/progress` - Get user's onboarding state
- `POST /api/onboarding/lessons/:id/complete` - Mark lesson complete
- `POST /api/onboarding/quizzes/:id/submit` - Submit quiz answers
- `GET /api/onboarding/badges` - List available badges
- `POST /api/onboarding/check-in` - Record daily check-in
- `GET /api/onboarding/stats` - Aggregate onboarding metrics

### UI Components
- `<LearningPathCard>` - Displays path progress
- `<LessonViewer>` - Interactive lesson content
- `<QuizForm>` - Quiz interface with immediate feedback
- `<BadgeShowcase>` - User's earned badges
- `<StreakIndicator>` - Daily check-in streak display
- `<ProgressBar>` - Overall completion percentage

## Success Metrics

### Primary Goals
- **Time to first contribution:** < 7 days (median)
- **Completion rate:** ≥ 60% finish at least one learning path
- **Retention:** ≥ 70% of onboarded users active after 30 days
- **Skill acquisition:** ≥ 80% pass self-moderation quiz

### Secondary Goals
- Daily active users during onboarding (DAU)
- Average RP earned per week
- Badge collection rate
- Peer-to-peer mentorship participation

## Future Enhancements

### Phase 2 (After MVP)
- Personalized learning paths (AI-recommended)
- Video lessons (accessibility, visual learners)
- Interactive simulations (governance scenarios)
- Peer review of exercises (community feedback)
- Advanced certification paths (facilitator, moderator)

### Phase 3 (Long-term)
- Multilingual support (translate lessons)
- Offline mode (download lessons)
- Cohort leaderboards (cooperative, not competitive)
- Mentorship marketplace (connect experienced members)
- Custom paths (groups create their own onboarding)

## Related Modules

- **Bridge AI Assistant:** Q&A support during onboarding
- **Support Points & Reputation:** RP rewards backend
- **Gamification & Milestones:** Badge system, streak tracking
- **Groups & Organizations:** Cohort management
- **Governance & Proposals:** Proposal creation lessons

## Implementation Priority

**Not yet prioritized** - Full spec to be developed when ready to implement.

Key dependencies:
1. Bridge AI Q&A (for interactive help)
2. RP backend (for reward distribution)
3. Badge system (from Gamification module)
4. Content authoring workflow (lesson creation process)

---

**Last updated:** 2025-11-16
**Status:** High-level overview (awaiting full specification)
