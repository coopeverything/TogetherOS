# Notifications & Inbox Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/notifications.md](../../modules/notifications.md).

**Category:** Community Connection, Cooperative Technology

---

## Implementation Status

### Current Progress: 100% (Production Ready)

- [x] PostgreSQL database schema (2 tables)
- [x] Notification entity with validation
- [x] CRUD API endpoints
- [x] Preferences API with per-type toggles
- [x] Mark-as-read/mark-all-read actions
- [x] Filtering by type, status, priority
- [x] Notification Bell UI component
- [x] Notification Inbox page
- [x] Settings/preferences page
- [x] In-memory repo for development

---

## Data Models

### Notification

```typescript
interface Notification {
  id: string                           // UUID
  userId: string                       // User receiving notification
  type: NotificationType               // Category of notification
  title: string                        // Short notification title
  message: string                      // Full notification message
  icon?: string                        // Emoji icon (optional)
  priority: 'normal' | 'high'          // Priority level
  status: 'unread' | 'read' | 'archived'
  reference?: NotificationReference    // Link to source entity
  actorId?: string                     // Who triggered it (optional)
  metadata?: Record<string, any>       // Additional context
  createdAt: Date
  readAt?: Date
  archivedAt?: Date
}

type NotificationType =
  | 'mention'              // Someone mentioned you
  | 'proposal_update'      // Proposal status changed
  | 'discussion_reply'     // Reply to your post
  | 'group_update'         // Group activity
  | 'system_message'       // System notifications
  | 'support_points'       // SP/RP transactions
  | 'badge_earned'         // Badge unlocked
  | 'reaction'             // Reaction to your content

interface NotificationReference {
  type: 'post' | 'proposal' | 'discussion' | 'group' | 'user' | 'badge'
  id: string
  url?: string
}
```

### NotificationPreferences

```typescript
interface NotificationPreferences {
  userId: string                       // Primary key

  // Per-type toggles
  enableMention: boolean               // Default: true
  enableProposalUpdate: boolean        // Default: true
  enableDiscussionReply: boolean       // Default: true
  enableGroupUpdate: boolean           // Default: true
  enableSystemMessage: boolean         // Default: true
  enableSupportPoints: boolean         // Default: true
  enableBadgeEarned: boolean           // Default: true
  enableReaction: boolean              // Default: true

  // Delivery preferences
  emailDigest: 'realtime' | 'daily' | 'weekly' | 'disabled'
  pushEnabled: boolean                 // Default: false

  createdAt: Date
  updatedAt: Date
}
```

---

## Database Schema

### Tables

```sql
-- notifications_notifications
CREATE TABLE notifications_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10),
  priority notification_priority NOT NULL DEFAULT 'normal',
  status notification_status NOT NULL DEFAULT 'unread',
  reference_type VARCHAR(50),
  reference_id UUID,
  reference_url VARCHAR(500),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- notifications_preferences
CREATE TABLE notifications_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enable_mention BOOLEAN NOT NULL DEFAULT TRUE,
  enable_proposal_update BOOLEAN NOT NULL DEFAULT TRUE,
  enable_discussion_reply BOOLEAN NOT NULL DEFAULT TRUE,
  enable_group_update BOOLEAN NOT NULL DEFAULT TRUE,
  enable_system_message BOOLEAN NOT NULL DEFAULT TRUE,
  enable_support_points BOOLEAN NOT NULL DEFAULT TRUE,
  enable_badge_earned BOOLEAN NOT NULL DEFAULT TRUE,
  enable_reaction BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest email_digest_frequency NOT NULL DEFAULT 'daily',
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE notification_type AS ENUM (
  'mention', 'proposal_update', 'discussion_reply', 'group_update',
  'system_message', 'support_points', 'badge_earned', 'reaction'
);

CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE notification_priority AS ENUM ('normal', 'high');
CREATE TYPE email_digest_frequency AS ENUM ('realtime', 'daily', 'weekly', 'disabled');
```

### Indexes

```sql
CREATE INDEX idx_notifications_user_id ON notifications_notifications(user_id);
CREATE INDEX idx_notifications_user_status ON notifications_notifications(user_id, status);
CREATE INDEX idx_notifications_user_created ON notifications_notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications_notifications(user_id) WHERE status = 'unread';
CREATE INDEX idx_notifications_type ON notifications_notifications(type);
```

---

## API Endpoints

### List Notifications

```typescript
GET /api/notifications
  ?status=unread|read|archived
  &type=mention|proposal_update|...
  &priority=normal|high
  &unreadOnly=true|false
  &limit=20
  &offset=0

Response: {
  notifications: Notification[]
  total: number
  unreadCount: number
}
```

### Get Notification

```typescript
GET /api/notifications/:id
Response: Notification
```

### Create Notification

```typescript
POST /api/notifications
Body: CreateNotificationInput
Response: { notification: Notification }
```

### Get Unread Count

```typescript
GET /api/notifications/count
Response: { count: number }
```

### Mark as Read

```typescript
POST /api/notifications/actions/mark-as-read
Body: { notificationIds: string[] }
Response: { updated: number }
```

### Mark as Unread

```typescript
POST /api/notifications/actions/mark-as-unread
Body: { notificationIds: string[] }
Response: { updated: number }
```

### Mark All as Read

```typescript
POST /api/notifications/actions/mark-all-read
Response: { updated: number }
```

### Get Preferences

```typescript
GET /api/notifications/preferences
Response: NotificationPreferences
```

### Update Preferences

```typescript
PATCH /api/notifications/preferences
Body: Partial<NotificationPreferences>
Response: NotificationPreferences
```

---

## UI Components

### NotificationBell

Location: `packages/ui/src/notifications/NotificationBell.tsx`

- Shows unread count badge
- Opens inbox on click
- Polls for new notifications

### NotificationInbox

Location: `packages/ui/src/notifications/NotificationInbox.tsx`

- Lists notifications with filters
- Mark as read on click
- Batch actions (mark all read)

### NotificationToast

Location: `packages/ui/src/notifications/NotificationToast.tsx`

- Real-time toast notifications
- Auto-dismiss with configurable duration

---

## UI Routes

```
/notifications           → Notification inbox page
/notifications/settings  → Preferences management
/admin/notifications     → Admin notification dashboard
```

---

## Domain Entity

Location: `apps/api/src/modules/notifications/entities/Notification.ts`

The Notification entity is immutable and provides:
- `create()` — Factory for new notifications
- `fromPersistence()` — Reconstitute from database
- `markAsRead()` — Returns new read notification
- `markAsUnread()` — Returns new unread notification
- `archive()` — Returns new archived notification
- `toJSON()` — Serialize for API response
- `isUnread()` — Status check
- `isHighPriority()` — Priority check

---

## Repository Pattern

### Interface

```typescript
interface INotificationRepo {
  findById(id: string): Promise<Notification | null>
  findByUser(userId: string, filters?: NotificationFilters): Promise<Notification[]>
  countUnread(userId: string): Promise<number>
  save(notification: Notification): Promise<void>
  markAsRead(ids: string[]): Promise<number>
  markAsUnread(ids: string[]): Promise<number>
  markAllAsRead(userId: string): Promise<number>
  delete(id: string): Promise<void>
}
```

### Implementations

- `InMemoryNotificationRepo` — For development/testing
- `PostgresNotificationRepo` — Production database (via lib/db)

---

## Integration Points

### Triggers for Creating Notifications

- **Mention:** When `@username` detected in post/comment
- **Proposal Update:** Proposal status changes
- **Discussion Reply:** Reply to user's post
- **Group Update:** Group membership/settings changes
- **Support Points:** SP allocation or RP transaction
- **Badge Earned:** Badge awarded to user
- **Reaction:** Someone reacts to user's content

### Related Modules

- **Feed** — Creates mention/reaction notifications
- **Forum** — Creates reply notifications
- **Governance** — Creates proposal update notifications
- **Gamification** — Creates badge earned notifications
- **Social Economy** — Creates support points notifications

---

## Privacy & Security

- Notifications are user-scoped (can only see your own)
- Actor IDs allow showing "who" triggered notification
- GDPR: Full export/delete support via user data APIs
- No tracking of notification interactions for profiling

---

## Dependencies

### Required Modules

- **Auth** (100%) — User sessions, user IDs
- **Database** (100%) — PostgreSQL persistence

### Optional Integration

- **Email Service** — For digest emails (not yet implemented)
- **Push Service** — For browser push (not yet implemented)

---

## Related Documentation

- [Feed Module](./feed-technical.md) — Creates mention notifications
- [Forum Module](./forum-technical.md) — Creates reply notifications
- [Governance Module](./governance-technical.md) — Creates proposal notifications
- [Gamification Module](./gamification-technical.md) — Creates badge notifications
