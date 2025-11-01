# Feed Module (Social + Forum + Intelligence)

## Overview

The Feed module is TogetherOS's primary engagement surface, combining social media UX with structured deliberation and AI-powered intelligence. It transforms passive content consumption into active participation through a conversion funnel: scroll → react → discuss → prioritize → vote → act.

**Current Progress:** <!-- progress:feed=0 --> 0%

**Category:** Community Connection, Collective Governance, Cooperative Technology

---

## Core Vision

**The Problem:**
People consume social media passively, react emotionally, then forget. No meaningful action results from their engagement.

**The Solution:**
A feed that guides users from consumption to participation:

1. **Scroll** - See posts (imported from social media + native TogetherOS posts)
2. **React** - Multi-dimensional engagement (not just likes)
3. **Discuss** - Open forum threads directly from posts
4. **Prioritize** - Build personal list of what matters
5. **Vote** - Participate in collective decisions (when threshold met)
6. **Act** - Join initiatives, make real change

**Bridge's Role:**
- Cluster posts by topic ("Show me other posts on housing")
- Prevent duplicate discussions ("Join existing thread instead")
- Profile interests and recommend actions
- Create sentiment maps and demographic insights
- Suggest when issues are ready for formal votes

---

## What Users Will Experience

### For Casual Members (Scroll & React)

You open TogetherOS and land on the **Feed** - a familiar social media experience but radically different:

- **See posts from your community** mixed with content they've imported (Instagram, TikTok, X/Twitter, Facebook)
- **Instead of "like,"** you react with **meaning:**
  - ❤️ **Care** - This matters to me
  - 💡 **Insightful** - This changed my perspective
  - ✓ **Agree** - I agree with this
  - ⚡ **Act** - I want to take action on this
- **Filter by topics** you care about (Climate, Housing, Cooperative Economy, Common Wellbeing, etc.)
- **Bridge AI quietly learns** what matters to you (private, never shared with other members)

### For Engaged Members (Discuss & Prioritize)

When a post sparks something:

- Click **Discuss** → opens a structured thread with deliberation tools
- **Rate post quality** on four dimensions: language, originality, tone, argument strength
- **Add evidence** from credible sources to support or oppose viewpoints
- Bridge AI **surfaces related posts** and perspectives you might have missed
- **Minority opinions preserved** - dissenting voices are codified, not buried

### For Active Contributors (Deliberate & Act)

As issues gain traction:

- **Prioritize:** Drag topics into your personal ranking (top 5 visible only to you, used by Bridge to understand community priorities)
- Bridge uses aggregate priorities to show **anonymous community statistics:**
  - "67% of members care about housing this week"
  - "45% are actively discussing climate action"
  - "Housing support increased 12% since last month"
- **High-priority topics** automatically become **Proposals** in the Governance module when they hit thresholds
- **Conversion funnel in action:** scroll → react → discuss → prioritize → deliberate → propose → vote → act

### What Makes This Different

- **No algorithm gaming:** You see what your community shares and what they think matters - not what maximizes engagement or advertising revenue
- **Nuanced reactions:** Beyond binary like/dislike - express real human responses that convey meaning
- **Privacy-first profiling:** Your interests and priorities stay private to you and Bridge; only aggregate anonymous statistics are public
- **Action-oriented:** Everything flows toward **doing something together**, not just scrolling endlessly and feeling anxious
- **Empathy-first moderation:** AI-assisted de-escalation, red-team prompts for bias, structured compromise labs when disagreements heat up

---

## Key Entities

### Post

Primary content unit in the feed (native or imported).

```typescript
interface Post {
  id: string                    // UUID
  type: PostType
  authorId: string              // Member UUID
  groupId?: string              // Optional: scope to group

  // Native post fields
  title?: string                // For native posts (10-200 chars)
  content?: string              // Markdown content (for native posts)

  // Import fields
  sourceUrl?: string            // Social media URL (Instagram, TikTok, X, FB)
  sourcePreview?: MediaPreview  // Fetched embed data

  // Shared fields
  topics: string[]              // User-tagged topics (Housing, Climate, etc.)
  reactions: Reaction[]         // Multi-dimensional reactions
  discussionThreadId?: string   // If discussion opened
  discussionCount: number       // # of discussion participants

  createdAt: Date
  updatedAt: Date
}
```

### PostType

```typescript
type PostType =
  | 'native'                    // Created in TogetherOS
  | 'instagram'                 // Imported from Instagram
  | 'tiktok'                    // Imported from TikTok
  | 'twitter'                   // Imported from X/Twitter
  | 'facebook'                  // Imported from Facebook
  | 'other'                     // Other social media
```

### MediaPreview

Fetched metadata for imported posts (using oEmbed/Open Graph).

```typescript
interface MediaPreview {
  title: string                 // Post title from source
  description?: string          // Post description
  thumbnailUrl?: string         // Preview image
  authorName?: string           // Original author (social media handle)
  platform: string              // 'instagram', 'tiktok', etc.
  embedHtml?: string            // Optional embed code
  fetchedAt: Date
}
```

### Reaction

Multi-dimensional engagement (not just likes).

```typescript
interface Reaction {
  id: string                    // UUID
  postId: string
  userId: string
  type: ReactionType
  createdAt: Date
}

type ReactionType =
  | 'care'                      // This matters to me
  | 'insightful'                // This changed my perspective
  | 'agree'                     // I agree with this
  | 'disagree'                  // I respectfully disagree
  | 'act'                       // I want to take action on this
  | 'question'                  // I have questions about this
```

### DiscussionThread

Forum thread opened from a feed post.

```typescript
interface DiscussionThread {
  id: string                    // UUID
  postId: string                // Original feed post
  title: string                 // Auto-generated or user-provided
  topic: string                 // Primary topic tag
  posts: ThreadPost[]           // Discussion posts
  participantCount: number      // Unique participants
  createdAt: Date
  lastActivityAt: Date
}
```

### ThreadPost

Individual post within a discussion thread.

```typescript
interface ThreadPost {
  id: string                    // UUID
  threadId: string
  authorId: string
  content: string               // Markdown, 1-5000 chars
  parentId?: string             // For nested replies
  reactions: Reaction[]         // Same reaction types
  ratings: PostRating[]         // Multi-dimensional quality ratings
  createdAt: Date
  updatedAt: Date
}
```

### PostRating

Multi-dimensional quality assessment of discussion posts.

```typescript
interface PostRating {
  id: string                    // UUID
  postId: string
  raterId: string               // User who rated
  language: number              // 1-5: Clarity, grammar
  originality: number           // 1-5: Novel perspective
  tone: number                  // 1-5: Cooperation-conducive
  argument: number              // 1-5: Logical strength
  createdAt: Date
}
```

### Priority

User's personal prioritization of topics.

```typescript
interface Priority {
  id: string                    // UUID
  userId: string
  topic: string                 // Topic name
  rank: number                  // User's ranking (1 = highest)
  weight: number                // 1-10: How much do you care
  updatedAt: Date
}
```

### TopicSentiment

Aggregated community sentiment on a topic.

```typescript
interface TopicSentiment {
  topic: string                 // Topic name
  postCount: number             // Total posts on topic
  participantCount: number      // Unique participants

  // Reaction aggregation
  careCount: number
  agreeCount: number
  disagreeCount: number
  actCount: number

  // Calculated metrics
  engagementScore: number       // Weighted reaction total
  consensusScore: number        // Agree / (Agree + Disagree)
  actionReadiness: number       // Act reactions / participants

  // Priority aggregation
  averagePriority: number       // Avg user priority rank
  averageWeight: number         // Avg user care weight

  lastUpdated: Date
}
```

### Evidence

Supporting data/links attached to viewpoints in discussions.

```typescript
interface Evidence {
  id: string                    // UUID
  postId: string                // ThreadPost ID
  url: string                   // External link
  title: string                 // Link title
  snippet?: string              // Key excerpt
  viewpoint: 'support' | 'oppose' | 'neutral'
  verified: boolean             // Checked by Bridge/moderators
  addedBy: string               // User ID
  createdAt: Date
}
```

### UserReputation

Reputation earned through quality contributions.

```typescript
interface UserReputation {
  userId: string

  // Aggregate scores
  totalPosts: number
  averageLanguageRating: number
  averageOriginalityRating: number
  averageToneRating: number
  averageArgumentRating: number

  // Overall reputation
  reputationScore: number       // Weighted combination

  // Badges earned
  badges: Badge[]

  updatedAt: Date
}
```

### Badge

Recognition for contribution patterns.

```typescript
interface Badge {
  id: string
  type: BadgeType
  earnedAt: Date
}

type BadgeType =
  | 'insightful-contributor'    // High originality ratings
  | 'bridge-builder'            // High tone ratings
  | 'original-thinker'          // Unique perspectives
  | 'active-participant'        // High post count
  | 'evidence-supporter'        // Adds quality evidence
  | 'consensus-finder'          // Helps resolve disagreements
```

---

## User Journey (Conversion Funnel)

### Stage 1: Discovery (Scroll)

**User lands on `/feed`**
- Sees mix of native posts + imported social media
- Infinite scroll, engaging UX
- Visual variety (text, images, embedded videos)

**Bridge tracks:**
- What topics appear in their feed
- How long they view each post
- Scroll patterns

### Stage 2: Engagement (React)

**User reacts to posts**
- Not just "like" - meaningful reactions (Care, Insightful, Agree, Act)
- Reactions are public (build trust, show community sentiment)

**Bridge tracks:**
- Reaction patterns (what do they care about?)
- Builds interest profile

**Bridge shows:**
- "You've reacted to 5 posts about housing. See more?"

### Stage 3: Participation (Discuss)

**User clicks "Discuss" on a post**
- Bridge checks: Is this topic already being discussed?
- If yes: "12 people are discussing housing. Join them?"
- If no: Opens composer to start new thread

**Discussion features:**
- Threaded replies (1 level deep for MVP)
- Multi-dimensional ratings (language, originality, tone, argument)
- Evidence attachment (links, data)

**Bridge tracks:**
- Topics they engage with deeply
- Quality of contributions (via ratings)

### Stage 4: Prioritization (Signal Importance)

**User builds personal priority list** (`/priorities`)
- Drag to reorder topics
- Slider: "How much do you care?" (1-10)

**Bridge uses this to:**
- Personalize feed
- Recommend related content
- Suggest actions

**Community dashboard** (`/map`)
- Shows aggregate priorities
- "37% of community prioritizes housing"
- "Climate concern up 12% this week"

### Stage 5: Deliberation (Structure Discussion)

**When forum thread shows sustained interest:**
- Active participation (30+ participants)
- Multiple viewpoints emerging
- Need for structured exploration

**Bridge suggests:**
- "Ready for deliberation? Explore options systematically"
- Opens deliberation mode (structured format)

### Stage 6: Decision (Formal Proposal)

**When deliberation yields clear options:**
- Options identified and explored
- Trade-offs understood
- Evidence gathered
- Community ready to decide

**Bridge suggests:**
- "Create formal proposal for community vote"
- Pre-fills from deliberation content
- Links to Governance module (when ready)

### Stage 7: Action (Make Change)

**Bridge recommends:**
- "You care about housing → Join [Housing Initiative Group]"
- "3 active projects need volunteers"
- "Proposal #47 needs your vote"

**Goal:** Convert caring into tangible participation

---

## Bridge Intelligence Features

### Topic Clustering

**Auto-detect topics from content:**
- User posts about "rent crisis in Boston"
- Bridge tags: Housing, Economics, Urban Planning
- Suggests existing tags before creating new ones

**Show related posts:**
- "Other posts on Housing" button
- Filters feed to topic
- Shows diversity of viewpoints

### Duplicate Prevention

**Before creating discussion thread:**
1. Bridge analyzes post content
2. Searches existing threads
3. Finds semantic matches

**Suggests:**
- "Join 'Affordable Housing Solutions' discussion (23 participants)"
- "Or start new thread if this is different"

**Prevents:**
- Fragmentation
- Duplicate effort
- Lost conversations

### Interest Profiling

**Tracks user behavior:**
- Topics they react to
- Topics they discuss
- Topics they prioritize
- Time spent on content

**Calculates interest percentages:**
- Bridge calculates: "Housing: 45%, Climate: 28%, Education: 15%, Healthcare: 12%"
- Shows relative interest across topics
- **Private view only** (not public)
- User can drag and rearrange in personal dashboard

**Privacy:**
- Calculations visible to user only
- No public profile display
- No selling to advertisers
- Exportable/deletable
- Transparent algorithm

### Sentiment Mapping

**Aggregates community sentiment (ANONYMOUS):**
- Per topic: agree/disagree ratios
- Consensus scores
- Action readiness
- Demographic breakdowns (if opted in)

**Prominently displayed statistics:**
- "What our members care about" dashboard
- "What people discuss today" trending topics
- Real-time engagement metrics
- **These are crucial** - front and center in UI

**Visualizations:**
- Bubble chart (topic size = engagement)
- Trend lines (sentiment over time)
- Demographic heat maps (urban vs rural priorities)

**Privacy guarantee:**
- All statistics are anonymous aggregates
- No individual data exposed
- Minimum threshold (n > 20) for demographic breakdowns

**Uses:**
- Help community understand itself
- Identify polarizing vs consensus issues
- Guide resource allocation
- Show collective priorities to motivate participation

### Action Recommendations

**Matches interests to opportunities:**
- User cares about housing → Housing initiative needs volunteers
- User interested in education → Proposal on school funding open for vote
- User skilled in coding → Tech project needs contributors

**Smart timing:**
- Not spammy (max 1 recommendation/week)
- Relevant to recent activity
- Clear calls to action

---

## Implementation Plan (Sequential Steps)

### Phase 1: Feed Foundation
**Scope:** Basic social feed with native posts and imports

**Step 1.1: Feed scaffold**
- Route: `/feed` (primary landing)
- Post list (reverse chronological)
- Infinite scroll
- Empty state, loading skeleton

**Step 1.2: Native post composer**
- Modal: Create post
- Fields: Title (optional), Content (markdown), Topics (tags)
- Image upload (optional, future)
- Preview mode

**Step 1.3: Social media import**
- "Import" button
- Modal: Paste URL (Instagram, TikTok, X, FB, other)
- Fetch metadata (oEmbed/Open Graph)
- Store: sourceUrl, preview data, topics

**Step 1.4: Multi-dimensional reactions**
- Reaction buttons: Care, Insightful, Agree, Disagree, Act, Question
- Click to react/unreact
- Show counts
- Hover: See who reacted

**Step 1.5: Topic filtering**
- Filter bar: "All / Housing / Climate / Education / ..."
- Click topic tag on post → filter to that topic
- Clear filter button

**Deliverables:**
- Types: `packages/types/src/feed.ts`
- Validators: `packages/validators/src/feed.ts`
- Repos: `apps/api/src/modules/feed/repos/`
- Handlers: `apps/api/src/modules/feed/handlers/`
- UI: `packages/ui/src/feed/`, `apps/web/app/feed/`
- Fixtures: 20+ sample posts (mix of native + imports)

---

### Phase 2: Discussion Integration
**Scope:** Forum threads opened from feed posts

**Step 2.1: "Discuss" button**
- Button on each feed post
- Modal: "Start discussion on this topic?"
- Auto-fills thread title from post
- Creates DiscussionThread

**Step 2.2: Thread view**
- Route: `/feed/[postId]/discuss`
- Shows original post at top
- Threaded replies below
- Reply composer

**Step 2.3: Nested replies**
- Reply to reply (1 level deep)
- Indentation visual
- "Show more" for long threads

**Step 2.4: Cross-linking**
- Feed post shows: "12 people discussing" badge
- Links to thread
- Thread shows: "Started from [feed post link]"

**Step 2.5: Discussion reactions**
- Same reaction types on thread posts
- Reaction counts

---

### Phase 3: Bridge Topic Intelligence
**Scope:** Smart topic clustering and duplicate prevention

**Step 3.1: Topic detection**
- When user creates post/import, Bridge suggests topics
- "This seems related to: Housing, Economics"
- User accepts/edits

**Step 3.2: "Show related posts"**
- Button: "See other posts on Housing"
- Filters feed to topic
- Shows: "Showing 47 posts on Housing"

**Step 3.3: Duplicate thread detection**
- Before creating discussion, Bridge searches
- Semantic matching (not just keyword)
- Modal: "Similar discussions found"
- Shows: Existing threads with participant counts
- User choice: Join existing or create new

**Step 3.4: Topic-based feeds**
- Route: `/feed/topics/housing`
- Dedicated page per topic
- Shows: Posts + Discussions + Sentiment

---

### Phase 4: Prioritization
**Scope:** Personal and community priority tracking

**Step 4.1: Personal priority list**
- Route: `/priorities`
- Shows: Topics user has engaged with
- Drag to reorder
- Slider per topic: "How much do you care?" (1-10)

**Step 4.2: Priority UI in feed**
- "Add to priorities" button on posts
- Quick "bump priority" action

**Step 4.3: Community priorities dashboard (PROMINENT)**
- Route: `/map`
- **Prominently displayed:** "What our members care about"
- Bar chart: Topics ranked by aggregate priority
- Shows: % of community that cares
- Trend indicators (up/down this week)
- **Anonymous statistics only**
- Real-time updates

**Step 4.4: Priority-based feed sorting**
- Toggle: "For You" (personalized) vs "Recent" (chronological) vs "Trending" (community priorities)
- "For You" uses your personal interest percentages
- "Trending" shows: "What people discuss today" (anonymous aggregate)

---

### Phase 5: Multi-dimensional Rating
**Scope:** Quality assessment of discussion posts

**Step 5.1: Rating UI**
- Rate thread posts on 4 dimensions:
  - Language (clarity, grammar)
  - Originality (novel perspective)
  - Tone (cooperation-conducive)
  - Argument (logical strength)
- Each 1-5 scale
- Optional, encouraged

**Step 5.2: Aggregate ratings**
- Show average ratings on posts
- User profiles show: Average ratings received

**Step 5.3: Reputation score**
- Calculate: Weighted combination of ratings
- Display on profile

**Step 5.4: Badges**
- Auto-award badges based on patterns:
  - Insightful Contributor (high originality)
  - Bridge Builder (high tone)
  - Original Thinker
  - Active Participant (post count)

---

### Phase 6: Evidence Repository
**Scope:** Attach data/links to support viewpoints

**Step 6.1: Evidence attachment**
- In discussion posts: "Add evidence" button
- Fields: URL, Title, Snippet, Viewpoint (support/oppose/neutral)
- Attach to post

**Step 6.2: Evidence display**
- Section below post: "Supporting Evidence"
- Links grouped by viewpoint
- Click to view

**Step 6.3: Evidence verification**
- Bridge checks: Internal links (auto-verify)
- External links: Manual review or community flagging
- Verified badge

---

### Phase 7: Sentiment & Visualization
**Scope:** Aggregate community sentiment, demographic insights

**Step 7.1: Topic sentiment calculation**
- Per topic, aggregate:
  - Reaction counts
  - Priority weights
  - Engagement metrics
- Calculate: Consensus score, action readiness

**Step 7.2: Sentiment visualization**
- Route: `/map/sentiment`
- Bubble chart: Topic size = engagement
- Color: Consensus (green) vs polarized (red)
- Interactive: Click to drill down

**Step 7.3: Demographic opt-in**
- Profile settings: Share (optional):
  - Age range
  - Location (city/rural)
  - Profession category
  - Education level
- Privacy: Anonymous aggregation only

**Step 7.4: Demographic breakdowns**
- On `/map`: Toggle "Show demographics"
- Requires: n > 20 per segment (privacy threshold)
- Shows: "Urban: 45% prioritize housing, Rural: 28%"

---

### Phase 8: Action Recommendations
**Scope:** Bridge guides users from caring to acting

**Step 8.1: Interest profiling (PRIVATE)**
- Track: Reactions, discussions, priorities, time spent
- Calculate: Interest percentages per topic
- Display: Private dashboard with drag-to-rearrange
- **User view only** (not public, not shared)
- Store: Encrypted, exportable, deletable

**Step 8.2: Action matching**
- Match interests to:
  - Groups (needs members)
  - Initiatives (needs volunteers)
  - Proposals (needs votes)
  - Projects (needs skills)

**Step 8.3: Recommendation UI**
- Route: `/act`
- "Recommended for you" section
- Based on: Your interests + current opportunities
- Max: 3 recommendations at a time (not overwhelming)

**Step 8.4: Nudges**
- In feed: Occasional "You care about housing → [Join initiative]"
- Timing: After user shows repeated interest
- Not spammy (max 1/week)

---

### Phase 9: Deliberation Initiation (NOT Direct Voting)
**Scope:** Guide issues through discussion → deliberation → eventual governance

**The Funnel:**
```
Feed (interest signals)
  ↓ (high reactions, many comments)
Forum Post / Discussion Thread
  ↓ (sustained engagement, many participants)
Deliberation (structured exploration of options)
  ↓ (consensus emerging or clear divide)
Proposal (formal governance)
  ↓ (community vote)
Decision
```

**Step 9.1: Feed → Forum indicator**
- Bridge monitors feed posts for:
  - High reactions (50+ across types)
  - Comment engagement ("I want to discuss this")
  - Repeated imports on same topic
- Suggests: "This topic is attracting interest. Start a discussion?"
- Button: "Open forum thread"

**Step 9.2: Forum → Deliberation indicator**
- Bridge monitors forum threads for:
  - High participation (30+ unique participants)
  - Sustained activity (active for 3+ days)
  - Emerging viewpoints (multiple perspectives visible)
- Shows: "This discussion is ready for structured deliberation"
- Explains: "Deliberation helps explore options and trade-offs"

**Step 9.3: Deliberation → Proposal indicator**
- Bridge monitors deliberation for:
  - Clear options identified (2-5 viable paths)
  - Evidence gathered (supporting data attached)
  - Consensus forming OR clear need for decision
- Shows: "This deliberation is ready for a formal proposal"
- Pre-fills proposal template (doesn't auto-create)

**Step 9.4: Interest-based progression**
- **More interest in feed** = good indication topic will attract:
  - Discussion (forum engagement)
  - Deliberation (structured exploration)
  - Proposals (formal governance)
  - Voting (community decision)
- Bridge uses feed metrics to predict readiness
- Users control when to advance (not automatic)

**Step 9.5: Cross-module breadcrumbs**
- Feed post → shows if forum thread exists
- Forum thread → shows if deliberation opened
- Deliberation → shows if proposal created
- Proposal → links back to entire conversation history
- Unified narrative thread

---

## Storage Schema

### Database Tables (Future PostgreSQL)

```sql
-- Posts (feed content)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  author_id UUID NOT NULL REFERENCES members(id),
  group_id UUID REFERENCES groups(id),

  -- Native post fields
  title VARCHAR(200),
  content TEXT,

  -- Import fields
  source_url TEXT,
  source_preview JSONB,

  -- Shared
  topics JSONB DEFAULT '[]',
  discussion_thread_id UUID REFERENCES discussion_threads(id),
  discussion_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,             -- Can reference posts OR thread_posts
  user_id UUID NOT NULL REFERENCES members(id),
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

-- Discussion threads
CREATE TABLE discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thread posts
CREATE TABLE thread_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES members(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES thread_posts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post ratings
CREATE TABLE post_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES thread_posts(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES members(id),
  language INTEGER CHECK (language BETWEEN 1 AND 5),
  originality INTEGER CHECK (originality BETWEEN 1 AND 5),
  tone INTEGER CHECK (tone BETWEEN 1 AND 5),
  argument INTEGER CHECK (argument BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, rater_id)
);

-- Priorities
CREATE TABLE priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id),
  topic VARCHAR(100) NOT NULL,
  rank INTEGER NOT NULL,
  weight INTEGER CHECK (weight BETWEEN 1 AND 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Topic sentiment (aggregated)
CREATE TABLE topic_sentiment (
  topic VARCHAR(100) PRIMARY KEY,
  post_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  care_count INTEGER DEFAULT 0,
  agree_count INTEGER DEFAULT 0,
  disagree_count INTEGER DEFAULT 0,
  act_count INTEGER DEFAULT 0,
  engagement_score DECIMAL DEFAULT 0,
  consensus_score DECIMAL DEFAULT 0,
  action_readiness DECIMAL DEFAULT 0,
  average_priority DECIMAL DEFAULT 0,
  average_weight DECIMAL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES thread_posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title VARCHAR(200) NOT NULL,
  snippet TEXT,
  viewpoint VARCHAR(20) CHECK (viewpoint IN ('support', 'oppose', 'neutral')),
  verified BOOLEAN DEFAULT FALSE,
  added_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User reputation (calculated)
CREATE TABLE user_reputation (
  user_id UUID PRIMARY KEY REFERENCES members(id),
  total_posts INTEGER DEFAULT 0,
  average_language_rating DECIMAL DEFAULT 0,
  average_originality_rating DECIMAL DEFAULT 0,
  average_tone_rating DECIMAL DEFAULT 0,
  average_argument_rating DECIMAL DEFAULT 0,
  reputation_score DECIMAL DEFAULT 0,
  badges JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
-- Post indexes
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_group ON posts(group_id);
CREATE INDEX idx_posts_topics ON posts USING GIN(topics);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Reaction indexes
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_type ON reactions(type);

-- Thread indexes
CREATE INDEX idx_threads_post ON discussion_threads(post_id);
CREATE INDEX idx_threads_topic ON discussion_threads(topic);
CREATE INDEX idx_threads_activity ON discussion_threads(last_activity_at DESC);

-- Thread post indexes
CREATE INDEX idx_thread_posts_thread ON thread_posts(thread_id);
CREATE INDEX idx_thread_posts_parent ON thread_posts(parent_id);
CREATE INDEX idx_thread_posts_author ON thread_posts(author_id);

-- Priority indexes
CREATE INDEX idx_priorities_user ON priorities(user_id);
CREATE INDEX idx_priorities_topic ON priorities(topic);
CREATE INDEX idx_priorities_rank ON priorities(rank);
```

---

## Validation Rules

### Post Validation

```typescript
const createNativePostSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  content: z.string().min(1).max(5000),
  topics: z.array(z.string()).min(1).max(5),
  groupId: z.string().uuid().optional(),
})

const createImportPostSchema = z.object({
  sourceUrl: z.string().url(),
  topics: z.array(z.string()).min(1).max(5),
  groupId: z.string().uuid().optional(),
})
```

### Thread Post Validation

```typescript
const createThreadPostSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  parentId: z.string().uuid().optional(),
})
```

### Rating Validation

```typescript
const createRatingSchema = z.object({
  postId: z.string().uuid(),
  language: z.number().int().min(1).max(5),
  originality: z.number().int().min(1).max(5),
  tone: z.number().int().min(1).max(5),
  argument: z.number().int().min(1).max(5),
})
```

### Priority Validation

```typescript
const upsertPrioritySchema = z.object({
  topic: z.string().min(1).max(100),
  rank: z.number().int().min(1),
  weight: z.number().int().min(1).max(10),
})
```

---

## Success Metrics

### Engagement Funnel
- **Scroll:** Daily active users viewing feed
- **React:** % of viewers who react (target: >60%)
- **Discuss:** % of reactors who open forum threads (target: >20%)
- **Prioritize:** % of discussers who build priority list (target: >40%)
- **Deliberate:** % of active discussions that enter deliberation (target: >15%)
- **Propose:** % of deliberations that become formal proposals (target: >50%)
- **Vote:** % of proposals that get votes (target: >80%)
- **Act:** % of voters who join initiatives (target: >30%)

### Content Quality
- Average post ratings (language, originality, tone, argument)
- Evidence attachment rate (target: >30% of discussion posts)
- Duplicate thread prevention rate (Bridge success)

### Community Health
- Topic diversity (# of active topics)
- Sentiment balance (consensus vs polarization ratio)
- Demographic representation (are all voices heard?)

### Intelligence Effectiveness
- Recommendation click-through rate (target: >15%)
- Topic clustering accuracy (manual spot-checks)
- Action conversion rate (interest → joining initiative)

---

## Privacy & Safety

### What's Public
- All feed posts (unless in private group)
- Reactions (who reacted with what)
- Discussion content
- User reputation scores and badges
- Aggregate sentiment/priorities

### What's Private
- Interest profiles (used for recommendations only)
- Individual priority weights (only aggregates shown)
- Demographic data (anonymous aggregation, n > 20 threshold)
- Bridge profiling data (exportable/deletable)

### Safety Features
- Report/flag content (spam, harassment)
- Block users
- Mute topics
- Private groups (opt-in visibility)

### Data Rights
- Export all your data (GDPR compliance)
- Delete account (right to be forgotten)
- Opt out of profiling (manual curation only)
- Transparent algorithm (explain recommendations)

---

## Dependencies

**Required:**
- ✅ Auth (user identification)
- ✅ Profiles (author display)

**Integrated:**
- Groups (group-scoped posts, cross-posting)
- Governance (vote initiation from topics)
- Bridge (all intelligence features)

**Optional:**
- Notifications (mentions, replies, recommendations)
- Search (topic/post search)

---

## Migration Path

### MVP (Phases 1-2, ~1 week)
- Feed with native posts + imports
- Multi-dimensional reactions
- Basic discussions
- Topic filtering

**Goal:** Prove the scroll → react → discuss funnel works

### Enhanced (Phases 3-5, ~2 weeks)
- Bridge topic intelligence
- Personal + community priorities
- Multi-dimensional rating
- Reputation/badges

**Goal:** Show that prioritization drives focus

### Advanced (Phases 6-7, ~1-2 weeks)
- Evidence repository
- Sentiment mapping
- Demographic insights

**Goal:** Demonstrate sophisticated deliberation

### Integrated (Phases 8-9, ~1 week)
- Action recommendations
- Deliberation initiation (feed → forum → deliberation → governance)

**Goal:** Complete the full conversion funnel with proper progression stages

---

## Related Modules

- **Groups:** Group-scoped feeds, cross-posting
- **Governance:** Vote initiation when topics reach threshold
- **Bridge:** All AI intelligence (clustering, profiling, recommendations)
- **Profiles:** Reputation display, interest tags
- **Notifications:** Feed activity alerts

---

## File Structure

```
TogetherOS/
├── packages/
│   ├── types/src/
│   │   └── feed.ts                    # All type definitions
│   ├── validators/src/
│   │   └── feed.ts                    # Zod schemas
│   └── ui/src/feed/
│       ├── PostList.tsx
│       ├── PostCard.tsx
│       ├── PostComposer.tsx
│       ├── ImportModal.tsx
│       ├── ReactionButtons.tsx
│       ├── DiscussButton.tsx
│       ├── ThreadView.tsx
│       ├── ThreadPost.tsx
│       ├── ReplyComposer.tsx
│       ├── RatingUI.tsx
│       ├── PriorityList.tsx
│       ├── SentimentMap.tsx
│       └── ActionRecommendations.tsx
├── apps/
│   ├── api/src/modules/feed/
│   │   ├── entities/
│   │   │   ├── Post.ts
│   │   │   ├── DiscussionThread.ts
│   │   │   ├── ThreadPost.ts
│   │   │   ├── Priority.ts
│   │   │   └── TopicSentiment.ts
│   │   ├── repos/
│   │   │   ├── PostRepo.ts
│   │   │   ├── InMemoryPostRepo.ts
│   │   │   ├── ThreadRepo.ts
│   │   │   ├── InMemoryThreadRepo.ts
│   │   │   └── PriorityRepo.ts
│   │   └── handlers/
│   │       ├── createPost.ts
│   │       ├── listPosts.ts
│   │       ├── importPost.ts
│   │       ├── createReaction.ts
│   │       ├── createThread.ts
│   │       ├── createThreadPost.ts
│   │       ├── ratePost.ts
│   │       └── upsertPriority.ts
│   └── web/app/feed/
│       ├── page.tsx                   # Feed list
│       ├── layout.tsx
│       ├── [postId]/
│       │   └── discuss/
│       │       └── page.tsx           # Thread view
│       ├── topics/
│       │   └── [topic]/
│       │       └── page.tsx           # Topic feed
│       └── priorities/
│           └── page.tsx               # Personal priorities
│       └── map/
│           ├── page.tsx               # Community priorities
│           └── sentiment/
│               └── page.tsx           # Sentiment visualization
│       └── act/
│           └── page.tsx               # Action recommendations
└── fixtures/
    └── feed/
        ├── posts.json
        ├── threads.json
        └── priorities.json
```

---

## Next Steps

**Phase 1 first step:**
- Module: feed
- Slice: scaffold
- Scope: Feed route, native post composer, post list with infinite scroll, multi-dimensional reactions, topic filtering, fixture data

**Estimated time:** 3-4 hours (based on Groups 0% → 100% in 3 hours)

**Then iterate:** Ship one phase at a time, learn from real usage, adapt.

---

**Status:** Ready for implementation
**Next Milestone:** Feed MVP with native posts + imports + reactions (target: 30%)
**Owner:** @coopeverything-core

---
