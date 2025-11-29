# Feed Module — Social Engagement

**Purpose:** Transform passive content consumption into active participation through a conversion funnel: scroll → react → discuss → prioritize → vote → act.

**Status:** 100% — Production Ready

---

## Overview

The Feed is TogetherOS's primary engagement surface, combining social media UX with structured deliberation:

1. **Scroll** — See posts from your community (native + imported from social media)
2. **React** — Multi-dimensional engagement (not just likes)
3. **Discuss** — Open forum threads directly from posts
4. **Prioritize** — Build your personal list of what matters
5. **Vote** — Participate in collective decisions
6. **Act** — Join initiatives and make real change

### What Makes This Different

- **No algorithm gaming:** You see what your community shares, not what maximizes ad revenue
- **Nuanced reactions:** Beyond like/dislike — express meaningful human responses
- **Privacy-first profiling:** Your interests stay private; only anonymous aggregates are public
- **Action-oriented:** Everything flows toward doing something together

### Design Principles

- **From caring to acting:** Every feature guides toward participation
- **Empathy-first moderation:** De-escalation rules, not punishment
- **Minority voice preservation:** Dissenting views are visible
- **Transparent statistics:** Community sees anonymous aggregates of what matters

---

## Our Values in Action

### Transparency

How the feed works is fully visible:

- **No hidden algorithms:** Posts appear chronologically or by community priority
- **Public reactions:** See who cared about, agreed with, or wants to act on content
- **Anonymous aggregates:** Community statistics show what members prioritize
- **Open ranking:** How posts are surfaced is documented and auditable

### Open Source

The entire feed system is open:

- **Inspect the code:** See exactly how content is displayed and organized
- **Import feature:** Bring content from other platforms (Instagram, TikTok, X)
- **No vendor lock-in:** Export your data and priorities anytime

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Reaction types:** Community decides what reactions mean
- **Moderation rules:** Members vote on content guidelines
- **Priority display:** How community priorities are shown is a community choice
- **Feature requests:** Propose new feed features through governance

---

## Features

### Multi-Dimensional Reactions

Instead of just "like," express what you really feel:

- ❤️ **Care** — This matters to me
- 💡 **Insightful** — This changed my perspective
- ✓ **Agree** — I agree with this
- ✗ **Disagree** — I respectfully disagree
- ⚡ **Act** — I want to take action on this
- ❓ **Question** — I have questions about this

### Topic Filtering

Filter your feed by what matters:

- **Cooperation Paths:** Climate, Housing, Education, Health, etc.
- **Groups:** See content from specific communities
- **Trending:** What your community is discussing today

### Personal Priorities

Build your list of what matters most:

- Drag to reorder topics by importance
- Set how much you care (1-10 scale)
- Private to you — only aggregates are shared

### Community Dashboard

See what your community cares about (anonymous):

- "67% of members care about housing this week"
- "Climate concern up 12% since last month"
- Topic trends and engagement patterns

### Discussion Integration

Turn any post into a discussion:

- Click "Discuss" to open a forum thread
- Bridge prevents duplicate discussions
- See how many people are already talking about it

---

## How to Use

### Browsing the Feed

1. Navigate to `/feed`
2. Scroll through native posts and imported content
3. Filter by topic or cooperation path
4. Toggle between "Recent" and "Trending" views

### Importing Content

1. Click "Import" in the feed
2. Paste a URL from Instagram, TikTok, X, or Facebook
3. Add topic tags
4. Content appears in your community's feed

### Building Your Priorities

1. Navigate to `/priorities`
2. See topics you've engaged with
3. Drag to reorder by importance
4. Adjust how much you care (1-10)

### Taking Action

1. Navigate to `/act`
2. See recommendations based on your interests
3. Join initiatives, vote on proposals, contribute to projects

---

## Technical Implementation

For developers interested in the database schemas, API endpoints, TypeScript interfaces, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/feed-technical.md)

---

## Related Modules

- [Forum](./forum.md) — Discussions opened from feed posts
- [Governance](./governance.md) — Proposals emerge from feed engagement
- [Groups](./groups.md) — Group-scoped feeds
- [Bridge](./bridge.md) — Topic intelligence and recommendations

---

<!-- progress:feed=100 -->
