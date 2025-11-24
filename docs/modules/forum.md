# Community Discussions & Deliberation Module

## Overview

The Community Discussions module provides a versatile space for knowledge building, idea exploration, Q&A, and structured deliberation. Think of it as a multi-purpose forum for:
- **Knowledge Repository:** Best practices, how-tos, community wisdom
- **Idea Bank:** Explore ideas before formalizing as proposals
- **Q&A Hub:** Ask questions, share expertise, build collective knowledge
- **Deliberation Space:** Structured consensus-building when decisions loom
- **Announcements:** Share important updates with the community

**Current Progress:** <!-- progress:forum=100 --> 100%

**Category:** Community Connection, Collective Governance, Cooperative Technology

---

## Core Purpose

Enable members to:
- **Share knowledge:** Document best practices, lessons learned, how-to guides
- **Explore ideas:** Test concepts, gather feedback before formal proposals
- **Ask & answer questions:** Build searchable community knowledge base
- **Deliberate together:** Structured discussions for consensus-building (when needed)
- **Preserve diverse views:** Minority opinions and dissenting voices remain visible
- **Connect to governance:** Convert mature discussions into formal proposals

---

## Key Entities

### Topic

The primary entity representing a discussion thread.

```typescript
interface Topic {
  id: string                    // UUID
  title: string                 // 3-200 chars
  description?: string          // 10-2000 chars (optional intro)
  authorId: string              // Member UUID
  groupId?: string              // Optional: scope to group
  category: TopicCategory       // Type of discussion
  tags: string[]                // Cooperation Path keywords
  status: TopicStatus           // Lifecycle state
  isPinned: boolean             // Sticky at top of list
  isLocked: boolean             // No new posts allowed
  postCount: number             // Cached count
  participantCount: number      // Unique participants
  lastActivityAt: Date          // Last post/reply timestamp
  createdAt: Date
  updatedAt: Date
}
```

### TopicCategory

```typescript
type TopicCategory =
  | 'general'                   // Open discussion
  | 'proposal'                  // Pre-proposal exploration
  | 'question'                  // Q&A style
  | 'deliberation'              // Structured consensus-building
  | 'announcement'              // One-way info sharing
```

### TopicStatus

```typescript
type TopicStatus =
  | 'open'                      // Active discussion
  | 'resolved'                  // Consensus reached or question answered
  | 'archived'                  // Moved to archive
  | 'locked'                    // No new activity allowed
```

### Post

Top-level response to a topic.

```typescript
interface Post {
  id: string                    // UUID
  topicId: string
  authorId: string              // Member UUID
  content: string               // Markdown, 1-5000 chars
  position?: PostPosition       // Optional: for deliberation
  citations: Citation[]         // Evidence/references
  replyCount: number            // Cached count
  reactions: Reaction[]         // Empathy reactions (not just likes)
  editHistory: Edit[]           // Append-only edit log
  flags: Flag[]                 // Moderation flags
  createdAt: Date
  updatedAt: Date
}
```

### PostPosition

For structured deliberation topics.

```typescript
interface PostPosition {
  stance: 'support' | 'oppose' | 'neutral' | 'question'
  reasoning: string             // Why this stance
  tradeoffs: string[]           // Acknowledged downsides
  alternatives?: string[]       // Other options considered
}
```

### Reply

Nested response to a post.

```typescript
interface Reply {
  id: string                    // UUID
  postId: string                // Parent post
  authorId: string
  content: string               // Markdown, 1-2000 chars
  citations: Citation[]
  reactions: Reaction[]
  editHistory: Edit[]
  flags: Flag[]
  createdAt: Date
  updatedAt: Date
}
```

### Citation

Evidence or reference attached to post/reply.

```typescript
interface Citation {
  id: string                    // UUID
  url?: string                  // External link
  title: string                 // Readable title
  snippet?: string              // Key excerpt
  source?: string               // "TogetherOS Docs", "External", etc.
  verified: boolean             // Auto-verified if internal
}
```

### Reaction

Empathy-focused reactions (not just upvotes).

```typescript
interface Reaction {
  id: string                    // UUID
  userId: string
  type: ReactionType
  createdAt: Date
}

type ReactionType =
  | 'agree'                     // I agree with this
  | 'disagree'                  // I respectfully disagree
  | 'insightful'                // This changed my perspective
  | 'empathy'                   // I understand this feeling
  | 'question'                  // I have a clarifying question
  | 'concern'                   // I see a potential issue
```

### Flag

Moderation flag for community review.

```typescript
interface Flag {
  id: string                    // UUID
  contentId: string             // Post or Reply ID
  contentType: 'post' | 'reply'
  flaggerId: string             // Member UUID
  reason: FlagReason
  details?: string              // Additional context
  status: FlagStatus
  reviewedBy?: string           // Moderator ID
  reviewedAt?: Date
  createdAt: Date
}

type FlagReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'off-topic'
  | 'harmful'

type FlagStatus =
  | 'pending'                   // Awaiting review
  | 'dismissed'                 // No action needed
  | 'action-taken'              // Content hidden/removed
```

### Edit

Append-only edit history for transparency.

```typescript
interface Edit {
  id: string                    // UUID
  editedBy: string              // Member UUID (usually author)
  previousContent: string       // Content before edit
  editReason?: string           // Optional explanation
  editedAt: Date
}
```

---

## Topic Categories Explained

### General Discussion (Knowledge Building)
- **Primary use:** Document best practices, share lessons learned, build community wisdom
- **Examples:**
  - "How we improved our community gardens" (case study)
  - "Best practices for conflict resolution in cooperatives"
  - "Tips for organizing mutual aid networks"
- **Structure:** Open-ended, no formal requirements
- **Can evolve into:** Questions, proposals, or knowledge base entries

### Question (Q&A & Learning)
- **Primary use:** Ask questions, share expertise, build searchable knowledge
- **Examples:**
  - "How do I set up a timebank?"
  - "What's the difference between SP and RP?"
  - "Anyone tried participatory budgeting in their group?"
- **Features:**
  - Mark a reply as "answer"
  - Searchable knowledge base
  - Bridge can suggest related docs
- **Can evolve into:** Knowledge base articles, best practices docs

### Proposal (Idea Exploration)
- **Primary use:** Test ideas, gather feedback BEFORE formal proposals
- **Examples:**
  - "Thinking about a community tool library - thoughts?"
  - "Should we experiment with rotating facilitation?"
  - "Ideas for improving our meeting structure"
- **Structure:** Informal brainstorming, evidence gathering
- **Bridge feature:** "Convert to Proposal" button (when idea matures)
- **Can evolve into:** Formal governance proposal

### Deliberation (Structured Consensus-Building)
- **Primary use:** Serious discussions when decisions are imminent
- **Examples:**
  - "How should we handle moderation in our group?"
  - "Choosing between two mutual aid models"
  - "Deliberating on budget allocation approach"
- **Features:**
  - Posts include stance + reasoning + tradeoffs
  - Minority opinions preserved and highlighted
  - Bridge can summarize into decision framework
- **Can evolve into:** Formal vote, governance proposal with evidence

### Announcement (Information Sharing)
- **Primary use:** Important updates, news, event notices
- **Examples:**
  - "New members: Welcome!"
  - "Meeting schedule for next month"
  - "Platform update deployed"
- **Structure:** One-way info, comments optional
- **Used by:** Group coordinators, platform team

---

## Empathy & Moderation Features

### AI-Assisted De-escalation
- Bridge monitors tone and suggests rephrasing
- Non-blocking suggestions ("Would you like to rephrase for clarity?")
- Privacy-first: no content stored, only suggestions

### Empathy Reactions
- Move beyond simple "likes"
- Encourage understanding over agreement
- Visible reactions help others understand sentiment

### Minority Opinion Preservation
- Dissenting voices highlighted, not hidden
- "Concerns" reaction visible in summaries
- Bridge summaries include minority positions

### Community Flags
- Members can flag concerning content
- Moderation queue for group coordinators
- Transparent review process with audit log

---

## Bridge Integration

### Thread Tidy (Summarization)
Bridge can summarize long topics into structured format:

```markdown
## Summary
- **Problem:** What issue or question is being discussed
- **Options:** Main proposals or perspectives
- **Trade-offs:** Acknowledged pros/cons
- **Open Questions:** What remains unclear
- **Next Steps:** Suggested actions (e.g., create proposal)
```

### Auto-Tagging
Bridge suggests:
- Cooperation Path tags
- Related topics
- Whether discussion should become a proposal

### Citation Assistance
Bridge can:
- Find relevant docs citations
- Verify internal links
- Suggest external evidence

---

## MVP Slices (Implementation Order)

### 1. Topic Create (API + Domain)

**Acceptance Criteria:**
- `POST /api/forum/topics` validates with Zod (`title`, `description?`, `authorId`, `category`)
- Stores to in-memory/fixture repo
- Returns `201` with `{id}`
- Unit test covers happy path + validation errors

**Files:**
```
packages/types/src/forum.ts               # Topic, Post, Reply interfaces
packages/validators/src/forum.ts          # createTopicSchema, createPostSchema
apps/api/src/modules/forum/
  ├── entities/Topic.ts                   # Domain model
  ├── entities/Post.ts                    # Domain model
  ├── entities/Reply.ts                   # Domain model
  ├── repos/TopicRepo.ts                  # Interface
  ├── repos/InMemoryTopicRepo.ts          # Fixture implementation
  └── handlers/createTopic.ts             # API handler
```

**Example:**
```typescript
// Request
POST /api/forum/topics
{
  "title": "How should we approach community moderation?",
  "description": "Let's discuss empathy-first moderation practices...",
  "category": "deliberation",
  "tags": ["collective-governance", "community-connection"]
}

// Response
201 Created
{
  "id": "topic-abc",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### 2. Topic List (UI)

**Acceptance Criteria:**
- Route `/forum` lists topics with: `title`, `author`, `category`, `postCount`, `lastActivityAt`
- Filter by category
- Sort by recent activity (default) or creation date
- Empty state, loading skeleton, and error state present
- Storybook story for `<TopicList />` with empty/loaded states

**Files:**
```
apps/web/app/forum/
  ├── page.tsx                            # List route
  └── layout.tsx                          # Shared layout

packages/ui/src/forum/
  ├── TopicList.tsx                       # Main component
  ├── TopicCard.tsx                       # Individual topic
  ├── TopicListSkeleton.tsx               # Loading state
  └── EmptyTopics.tsx                     # Empty state
```

**UI States:**
```typescript
type TopicListState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: Topic[] }
```

---

### 3. Post Composer (UI)

**Acceptance Criteria:**
- Modal or inline form to create new topic
- Fields: `title`, `description`, `category`, `tags`
- Tag autocomplete from Cooperation Paths
- Client-side validation with helpful errors
- Preview mode for markdown description

**Files:**
```
packages/ui/src/forum/
  ├── TopicComposer.tsx                   # Main form
  ├── CategorySelect.tsx                  # Category picker
  ├── TagInput.tsx                        # Tag autocomplete
  └── MarkdownEditor.tsx                  # Rich text editor (or reuse if exists)
```

---

### 4. Topic Detail View (UI + API)

**Acceptance Criteria:**
- Route `/forum/[topicId]` shows topic + all posts
- Nested replies (1 level deep)
- Post composer for new posts
- Reply composer per post
- Reactions UI (hover to see who reacted)

**Files:**
```
apps/web/app/forum/[topicId]/
  └── page.tsx                            # Topic detail route

packages/ui/src/forum/
  ├── TopicDetail.tsx                     # Main component
  ├── PostList.tsx                        # Posts display
  ├── PostCard.tsx                        # Individual post
  ├── ReplyList.tsx                       # Nested replies
  ├── ReplyCard.tsx                       # Individual reply
  ├── PostComposer.tsx                    # Create post
  ├── ReplyComposer.tsx                   # Create reply
  └── ReactionPicker.tsx                  # Reaction UI
```

---

### 5. Post & Reply API

**Acceptance Criteria:**
- `POST /api/forum/topics/:topicId/posts` creates post
- `POST /api/forum/posts/:postId/replies` creates reply
- `POST /api/forum/posts/:postId/reactions` adds reaction
- All validate with Zod
- Unit tests

---

### 6. Moderation (Flag Content)

**Acceptance Criteria:**
- "Flag" button on posts/replies
- Modal with flag reason + optional details
- `POST /api/forum/flags` creates flag
- Coordinator view at `/forum/moderation` lists pending flags

**Files:**
```
packages/ui/src/forum/
  ├── FlagModal.tsx                       # Flag form
  └── ModerationQueue.tsx                 # Coordinator view

apps/web/app/forum/moderation/
  └── page.tsx                            # Moderation route (requires coordinator role)
```

---

### 7. Bridge Integration (Future)

**Not MVP, but planned:**
- Thread Tidy summarization button
- AI de-escalation suggestions
- Auto-tagging suggestions
- Citation assistance

---

## Storage Schema

### Database Tables (Future PostgreSQL)

```sql
-- Topics
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES members(id),
  group_id UUID REFERENCES groups(id),
  category VARCHAR(50) NOT NULL,
  tags JSONB DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  post_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES members(id),
  content TEXT NOT NULL,
  position JSONB,                         -- PostPosition if present
  citations JSONB DEFAULT '[]',
  reply_count INTEGER DEFAULT 0,
  flags JSONB DEFAULT '[]',
  edit_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Replies
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES members(id),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  flags JSONB DEFAULT '[]',
  edit_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id),
  content_id UUID NOT NULL,               -- Post or Reply ID
  content_type VARCHAR(10) NOT NULL,      -- 'post' | 'reply'
  type VARCHAR(50) NOT NULL,              -- ReactionType
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id, type)       -- One reaction type per user per content
);

-- Flags
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,               -- Post or Reply ID
  content_type VARCHAR(10) NOT NULL,      -- 'post' | 'reply'
  flagger_id UUID NOT NULL REFERENCES members(id),
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
-- Topic indexes
CREATE INDEX idx_topics_author ON topics(author_id);
CREATE INDEX idx_topics_group ON topics(group_id);
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_last_activity ON topics(last_activity_at DESC);
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_tags ON topics USING GIN(tags);

-- Post indexes
CREATE INDEX idx_posts_topic ON posts(topic_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Reply indexes
CREATE INDEX idx_replies_post ON replies(post_id);
CREATE INDEX idx_replies_author ON replies(author_id);

-- Reaction indexes
CREATE INDEX idx_reactions_content ON reactions(content_id, content_type);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Flag indexes
CREATE INDEX idx_flags_content ON flags(content_id, content_type);
CREATE INDEX idx_flags_status ON flags(status);
CREATE INDEX idx_flags_flagger ON flags(flagger_id);
```

---

## Validation Rules

### Topic Validation

```typescript
const createTopicSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000).optional(),
  category: z.enum(['general', 'proposal', 'question', 'deliberation', 'announcement']),
  tags: z.array(z.string()).max(5),
  groupId: z.string().uuid().optional(),
})
```

### Post Validation

```typescript
const createPostSchema = z.object({
  topicId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  position: z.object({
    stance: z.enum(['support', 'oppose', 'neutral', 'question']),
    reasoning: z.string().min(10).max(1000),
    tradeoffs: z.array(z.string()).max(5),
    alternatives: z.array(z.string()).max(5).optional(),
  }).optional(),
  citations: z.array(z.object({
    url: z.string().url().optional(),
    title: z.string(),
    snippet: z.string().optional(),
    source: z.string().optional(),
  })).max(10),
})
```

### Reply Validation

```typescript
const createReplySchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  citations: z.array(z.object({
    url: z.string().url().optional(),
    title: z.string(),
    snippet: z.string().optional(),
    source: z.string().optional(),
  })).max(5),
})
```

---

## Privacy & Transparency

### What's Public
- All topics, posts, replies (unless in private group)
- Participant names and timestamps
- Reactions (who reacted with what)
- Edit history (for transparency)

### What's Private
- Flag details (only visible to moderators)
- Deleted content (replaced with "[removed]", not fully deleted)
- IP addresses (hashed, not stored raw)

### Moderation Logs
- All moderation actions logged in append-only NDJSON
- Format: `{action, moderatorId, contentId, reason, timestamp}`
- Available to group coordinators

---

## Success Metrics

### Engagement
- Topics created per week
- Unique participants per month
- Reply depth (measure quality of discussion)

### Health
- Flag rate (lower is better, target <2% of posts)
- Time to flag resolution (target <24 hours)
- Ratio of empathy reactions to total reactions

### Quality
- Deliberation topics that become proposals (measure usefulness)
- Minority opinion preservation rate (are dissenting voices visible?)
- Topic resolution rate (questions answered, deliberations concluded)

---

## Dependencies

**Required Before MVP:**
- ✅ Auth (user identification)
- ✅ Profiles (author display)

**Optional Enhancements:**
- Groups (scoped discussions)
- Bridge (AI moderation & summarization)
- Notifications (mention alerts, reply notifications)
- Search (topic/post search)

---

## Migration Path

### Phase 1: MVP (Current)
- Topic list + create
- Post composer
- Basic threading
- In-memory storage

### Phase 2: Deliberation Tools
- Structured posts with positions
- Empathy reactions
- Citation support
- Bridge thread tidy

### Phase 3: Moderation
- Flag queue
- Moderator dashboard
- AI de-escalation suggestions

### Phase 4: Federation
- Cross-instance topics
- Shared deliberation across groups
- Federated moderation rules

---

## Related Modules

- **Governance:** Proposals & Decisions (deliberation topics → proposals)
- **Bridge:** AI assistant (thread tidy, moderation, citations)
- **Groups:** Group-scoped discussions
- **Notifications:** Mention alerts, reply notifications
- **Search:** Topic and post search

---

## File Structure Summary

```
TogetherOS/
├── packages/
│   ├── types/src/
│   │   └── forum.ts                    # Topic, Post, Reply, etc.
│   ├── validators/src/
│   │   └── forum.ts                    # Zod schemas
│   └── ui/src/forum/
│       ├── TopicList.tsx
│       ├── TopicCard.tsx
│       ├── TopicComposer.tsx
│       ├── TopicDetail.tsx
│       ├── PostCard.tsx
│       ├── PostComposer.tsx
│       ├── ReplyCard.tsx
│       ├── ReplyComposer.tsx
│       ├── ReactionPicker.tsx
│       └── FlagModal.tsx
├── apps/
│   ├── api/src/modules/forum/
│   │   ├── entities/
│   │   │   ├── Topic.ts
│   │   │   ├── Post.ts
│   │   │   └── Reply.ts
│   │   ├── repos/
│   │   │   ├── TopicRepo.ts
│   │   │   ├── InMemoryTopicRepo.ts
│   │   │   ├── PostRepo.ts
│   │   │   └── InMemoryPostRepo.ts
│   │   └── handlers/
│   │       ├── createTopic.ts
│   │       ├── listTopics.ts
│   │       ├── getTopic.ts
│   │       ├── createPost.ts
│   │       └── createReply.ts
│   └── web/app/forum/
│       ├── page.tsx                    # Topic list
│       ├── layout.tsx
│       ├── [topicId]/
│       │   └── page.tsx                # Topic detail
│       └── moderation/
│           └── page.tsx                # Moderation queue
└── fixtures/
    └── forum/
        ├── topics.json
        ├── posts.json
        └── replies.json
```

---

## Next Steps

**For MVP (5% → 30%):**
1. Create TypeScript types (`packages/types/src/forum.ts`)
2. Create Zod validators (`packages/validators/src/forum.ts`)
3. Implement domain models and repos
4. Create API handlers (create topic, list topics)
5. Build UI components (TopicList, TopicCard, TopicComposer)
6. Replace placeholder `/forum` page with real MVP
7. Add fixture data for testing

**For Phase 2 (30% → 60%):**
1. Add post and reply functionality
2. Implement reactions
3. Build topic detail view
4. Add moderation flags

**For Phase 3 (60% → 100%):**
1. Bridge integration (thread tidy)
2. AI de-escalation
3. Citation assistance
4. Full moderation dashboard

---

**Status:** Ready for implementation
**Next Milestone:** Topic list + post composer MVP (target: 30%)
**Owner:** @coopeverything-core

---
