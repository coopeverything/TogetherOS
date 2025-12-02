# Group Dashboard & Forum Design

## Overview

This spec defines the design for:
1. **Group Dashboard** - A unified view for group members with feed and forum
2. **Group Forum Page** - Dedicated forum for group discussions
3. **Forum Sidebar Enhancement** - "My Groups" section showing latest posts from user's groups

---

## 1. Group Dashboard (`/groups/[id]`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Groups                                        [Join/Leave]  │
├─────────────────────────────────────────────────────────────────────────┤
│  [Avatar]  Group Name                                                   │
│            @handle · 123 members · 📍 Location                         │
│            ─────────────────────────────────────────────────────────────│
│            About: Brief description of the group...                     │
├─────────────────────────────────────────────────────────────────────────┤
│  [Feed] [Forum] [Members] [Events] [Proposals] [Settings*]             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────┐   │
│  │                                 │ │  📊 Group Stats             │   │
│  │       TAB CONTENT               │ │  • 12 posts this week       │   │
│  │       (Feed/Forum/etc)          │ │  • 5 active discussions     │   │
│  │                                 │ │  • 3 pending proposals      │   │
│  │                                 │ ├─────────────────────────────┤   │
│  │                                 │ │  🔥 Trending in Group       │   │
│  │                                 │ │  • Topic 1                  │   │
│  │                                 │ │  • Topic 2                  │   │
│  │                                 │ ├─────────────────────────────┤   │
│  │                                 │ │  👥 Active Members          │   │
│  │                                 │ │  [avatar] [avatar] [avatar] │   │
│  │                                 │ │  +15 more                   │   │
│  └─────────────────────────────────┘ └─────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tab Navigation

| Tab | Description | Content |
|-----|-------------|---------|
| **Feed** | Group activity stream | Posts scoped to this group, reactions, discussions |
| **Forum** | Group discussions | Topics created in this group, trending threads |
| **Members** | Member directory | Current member list, roles, join dates |
| **Events** | Group events | Upcoming events, RSVPs, past events |
| **Proposals** | Governance | Group-specific proposals, voting |
| **Settings*** | Admin only | Group settings, role management |

### Feed Tab Content

```
┌─────────────────────────────────────────────────────────────────┐
│  [+ New Post]                              Sort: [Recent ▼]    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] User Name · 2 hours ago                        │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ Post content here. This is a native post with markdown  │   │
│  │ support and optional media attachments...               │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ 💚 12  💡 5  ✅ 8  ❌ 1  🎯 3  ❓ 2        [💬 Discuss]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] Another User · 5 hours ago                     │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ 📸 [Instagram Embed]                                    │   │
│  │ Imported from Instagram with preview...                 │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ 💚 24  💡 8  ✅ 15                          [💬 Discuss]  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Forum Tab Content

```
┌─────────────────────────────────────────────────────────────────┐
│  Group Discussions                         [+ New Topic]        │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All ▼]  [General] [Proposals] [Questions] [Announce] │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📌 [PINNED] Monthly Planning - December 2025            │   │
│  │     general · 12 replies · Last: 2 hours ago            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💬 Should we expand to neighboring cities?              │   │
│  │     proposal · 34 replies · Last: 30 min ago    🔥 HOT  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ❓ How do I participate in timebanking?                 │   │
│  │     question · 5 replies · Last: 1 hour ago             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Group Forum Page (`/groups/[id]/forum`)

Full-page forum view for deeper discussions.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Group                                      [+ New Topic]    │
├─────────────────────────────────────────────────────────────────────────┤
│  [Group Avatar] Group Name Forum                                        │
│  Active discussions in this community                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────┐   │
│  │                                     │ │  📊 Forum Stats         │   │
│  │  [Category Tabs]                    │ │  • 45 topics            │   │
│  │  All | General | Proposals | Q&A    │ │  • 234 posts            │   │
│  │                                     │ │  • 12 active today      │   │
│  │  ┌─────────────────────────────┐   │ ├─────────────────────────┤   │
│  │  │ Topic Title                 │   │ │  🔥 Hot Topics          │   │
│  │  │ category · replies · date   │   │ │  • Topic with most      │   │
│  │  └─────────────────────────────┘   │ │    activity this week   │   │
│  │  ┌─────────────────────────────┐   │ │  • Topic 2              │   │
│  │  │ Topic Title                 │   │ │  • Topic 3              │   │
│  │  │ category · replies · date   │   │ ├─────────────────────────┤   │
│  │  └─────────────────────────────┘   │ │  📌 Pinned              │   │
│  │  ┌─────────────────────────────┐   │ │  • Community Guidelines │   │
│  │  │ Topic Title                 │   │ │  • Welcome Thread       │   │
│  │  │ category · replies · date   │   │ └─────────────────────────┘   │
│  │  └─────────────────────────────┘   │                               │
│  └─────────────────────────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Forum Page Enhancement (`/forum`)

Add "My Groups" section to sidebar showing latest posts from groups the user is a member of.

### Updated Sidebar Layout

```
┌─────────────────────────────────────────┐
│  🔥 Trending                            │
│  • Topic 1 (5 posts)                    │
│  • Topic 2 (3 posts)                    │
│  • Topic 3 (2 posts)                    │
├─────────────────────────────────────────┤
│  💬 Hot Topics                          │
│  • Most active discussion               │
│  • Second most active                   │
├─────────────────────────────────────────┤
│  👥 My Groups                    [NEW]  │
│  ─────────────────────────────────────  │
│  📍 Brooklyn Food Coop                  │
│     └─ "Monthly meeting agenda" (2h)    │
│     └─ "New supplier proposal" (5h)     │
│  ─────────────────────────────────────  │
│  🌍 Climate Action Network              │
│     └─ "Solar panel initiative" (1d)    │
│     └─ "Volunteer signup" (2d)          │
│  ─────────────────────────────────────  │
│  [View all groups →]                    │
├─────────────────────────────────────────┤
│  📝 My Posts                            │
│  • Your topic 1                         │
│  • Your topic 2                         │
└─────────────────────────────────────────┘
```

### "My Groups" Section Behavior

1. **Collapsed by default** on mobile
2. **Shows 3 most active groups** user is member of
3. **2 latest topics per group** with relative timestamps
4. **Click group name** → goes to `/groups/[id]/forum`
5. **Click topic** → goes to `/forum/[topicId]`
6. **"View all groups"** → goes to `/groups`

---

## 4. Data Model Changes

### Post Entity Extension

```typescript
// packages/types/src/feed.ts
interface Post {
  // ... existing fields
  groupId?: string      // Optional: scope post to a group
  groupName?: string    // Denormalized for display
}
```

### Topic Entity Extension

```typescript
// packages/types/src/forum.ts
interface Topic {
  // ... existing fields
  groupId?: string      // Optional: scope topic to a group
  groupName?: string    // Denormalized for display
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/groups/[id]/feed` | GET | Get posts for a specific group |
| `/api/groups/[id]/feed` | POST | Create post in a group |
| `/api/groups/[id]/forum` | GET | Get topics for a specific group |
| `/api/groups/[id]/forum` | POST | Create topic in a group |
| `/api/forum/my-groups` | GET | Get latest topics from user's groups |

---

## 5. Component Breakdown

### New Components Needed

| Component | Location | Purpose |
|-----------|----------|---------|
| `GroupDashboard` | `packages/ui/src/groups/` | Main dashboard container with tabs |
| `GroupFeed` | `packages/ui/src/groups/` | Group-scoped feed view |
| `GroupForum` | `packages/ui/src/groups/` | Group-scoped forum view |
| `GroupStats` | `packages/ui/src/groups/` | Stats widget for sidebar |
| `GroupTrending` | `packages/ui/src/groups/` | Trending topics widget |
| `MyGroupsForumSection` | `packages/ui/src/forum/` | Sidebar section for forum page |

### Reused Components

| Component | From | Usage |
|-----------|------|-------|
| `PostList` | `@togetheros/ui` | Display group feed posts |
| `PostComposerUnified` | `@togetheros/ui` | Create posts in group |
| `TopicList` | `@togetheros/ui/forum` | Display group forum topics |
| `TopicComposer` | `@togetheros/ui/forum` | Create topics in group |
| `MemberDirectory` | `@togetheros/ui/groups` | Show group members |

---

## 6. Page Structure

### New/Modified Pages

```
apps/web/app/groups/[id]/
├── page.tsx              # Modified: Add tabbed dashboard
├── forum/
│   └── page.tsx          # NEW: Full group forum page
├── feed/
│   └── page.tsx          # NEW: Full group feed page (optional)
└── settings/
    └── page.tsx          # Existing: Group settings

apps/web/app/forum/
└── page.tsx              # Modified: Add "My Groups" to sidebar
```

---

## 7. Implementation Phases

### Phase 1: Group Dashboard Tabs
- Add tab navigation to group detail page
- Implement Feed tab with group-scoped posts
- Implement Forum tab with group-scoped topics
- Add sidebar with stats and trending

### Phase 2: Full Group Forum Page
- Create `/groups/[id]/forum` page
- Full forum experience within group context
- Category filtering, search, pinned topics

### Phase 3: Forum Sidebar Enhancement
- Add "My Groups" section to `/forum` sidebar
- Fetch user's groups and latest topics
- Link navigation between main forum and group forums

### Phase 4: API Integration
- Create group-scoped feed/forum endpoints
- Add groupId to Post and Topic creation
- Implement `/api/forum/my-groups` endpoint

---

## 8. UI/UX Considerations

### Mobile Responsiveness
- Tabs become dropdown on mobile
- Sidebar collapses to bottom sheet
- "My Groups" section is collapsible

### Empty States
- "No posts yet. Be the first to share!" (Feed)
- "No discussions started. Create a topic!" (Forum)
- "Join groups to see their posts here" (My Groups)

### Loading States
- Skeleton loaders for tabs
- Shimmer effect for topic/post lists

### Permissions
- Only members can post in group feed/forum
- Admins can pin/unpin topics
- Settings tab only visible to admins

---

## 9. Color Coding (Category Badges)

| Category | Color | Icon |
|----------|-------|------|
| General | Gray | 💬 |
| Proposal | Orange | 📋 |
| Question | Blue | ❓ |
| Deliberation | Purple | 🤔 |
| Announcement | Green | 📢 |

---

## 10. Success Metrics

- **Group engagement**: Posts per group per week
- **Cross-pollination**: Users visiting multiple group forums
- **Retention**: Return visits to group dashboard
- **Discovery**: Clicks from "My Groups" to group content
