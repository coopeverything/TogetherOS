# Events & Calendar Module

## Overview

The Events & Calendar module provides comprehensive event management, milestone tracking, and meeting scheduling for communities. It integrates with the Execution & Accountability module to auto-create events from initiatives, tracks attendance, and maintains a shared community calendar.

**Current Progress:** <!-- progress:events=100 --> 100%

**Category:** Community Connection, Collective Governance

---

## Core Purpose

Enable members to:
- **Track deadlines:** Visual calendar showing all initiative deadlines, community events
- **Schedule meetings:** Workgroup meetings, assemblies, deliberation sessions
- **Celebrate milestones:** Community notifications when initiatives reach key milestones
- **Coordinate activities:** Shared calendar for events, activities, gatherings
- **Maintain accountability:** Attendance tracking for workgroup meetings
- **Plan ahead:** See what's coming up, avoid scheduling conflicts

---

## Key Entities

### Event

```typescript
interface Event {
  id: string                           // UUID
  title: string                        // 3-200 chars
  description?: string                 // Optional details (10-2000 chars)
  type: EventType

  // Scheduling
  startDate: Date
  endDate?: Date                       // For multi-day events
  recurrence?: RecurrenceRule         // For recurring events

  // Location
  location: 'virtual' | 'physical' | 'hybrid'
  physicalAddress?: string             // If physical/hybrid
  virtualLink?: string                 // Zoom/Meet link if virtual/hybrid

  // Ownership
  creatorId: string                    // Member UUID
  groupId?: string                     // Optional: group-scoped event

  // Associations
  initiativeId?: string                // If auto-created from initiative
  proposalId?: string                  // If related to governance proposal

  // Attendance
  attendees: Attendee[]
  maxAttendees?: number                // Optional capacity limit
  rsvpRequired: boolean

  // Status
  status: EventStatus
  completedAt?: Date                   // When marked complete
  notes?: string                       // Post-event notes

  // Visibility
  visibility: 'public' | 'members_only' | 'group_only' | 'private'

  // Timestamps
  createdAt: Date
  updatedAt: Date
  canceledAt?: Date                    // Soft delete
}
```

### EventType

```typescript
type EventType =
  | 'deadline'                         // Initiative deadline
  | 'milestone'                        // Initiative milestone
  | 'meeting.workgroup'                // Workgroup meeting
  | 'meeting.assembly'                 // Group assembly/vote
  | 'meeting.deliberation'             // Deliberation session
  | 'meeting.review'                   // Post-initiative review
  | 'gathering.social'                 // Community social event
  | 'gathering.workshop'               // Educational workshop
  | 'gathering.celebration'            // Milestone celebration
  | 'reminder.custom'                  // Custom reminder
```

### Attendee

```typescript
interface Attendee {
  memberId: string
  rsvpStatus: 'going' | 'maybe' | 'not_going' | 'no_response'
  attended: boolean                    // Marked after event
  role?: 'organizer' | 'facilitator' | 'note_taker' | 'participant'
  rsvpAt?: Date
  attendedAt?: Date                    // Check-in timestamp
}
```

### RecurrenceRule

```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number                     // Every N days/weeks/months
  daysOfWeek?: number[]               // [0-6] for weekly (0 = Sunday)
  dayOfMonth?: number                  // 1-31 for monthly
  endDate?: Date                       // Stop recurrence after this date
  occurrences?: number                 // Or stop after N occurrences
}
```

### EventStatus

```typescript
type EventStatus =
  | 'scheduled'                        // Future event
  | 'in_progress'                      // Currently happening
  | 'completed'                        // Past event, marked complete
  | 'canceled'                         // Canceled event
  | 'postponed'                        // Rescheduled to later date
```

### MeetingNotes

```typescript
interface MeetingNotes {
  id: string                           // UUID
  eventId: string
  content: string                      // Markdown notes
  decisions: Decision[]                // Decisions made during meeting
  actionItems: ActionItem[]            // Tasks assigned
  attendees: string[]                  // Member IDs who attended
  takenBy: string                      // Note-taker member ID
  takenAt: Date
  approved: boolean                    // Approved by attendees
  approvedAt?: Date
}

interface Decision {
  summary: string
  votedBy: string[]
  outcome: 'approved' | 'rejected' | 'deferred'
}

interface ActionItem {
  description: string
  assignedTo: string
  dueDate: Date
  completed: boolean
}
```

---

## Integration with Other Modules

### Execution & Accountability Module

**Automatic event creation from initiatives:**

When an initiative is created, the system automatically generates events:

1. **Deadline Event**
   - Type: `deadline`
   - Date: Initiative `deadline` field
   - Title: "Initiative Deadline: [initiative title]"
   - Attendees: All assigned admins
   - RSVP: Not required (informational)

2. **Milestone Events** (configurable)
   - Type: `milestone`
   - Dates: Calculated from initiative timeline
   - Examples:
     - "Initiative Kickoff" (day 1)
     - "Design Complete" (25% timeline)
     - "Implementation Complete" (75% timeline)
     - "Delivery Review" (100% timeline)
   - Attendees: Assigned admins + community members (if public)

3. **Workgroup Meetings** (recurring)
   - Type: `meeting.workgroup`
   - Recurrence: Weekly (default) during initiative duration
   - Attendees: Assigned admins
   - RSVP: Required
   - Purpose: Status updates, coordination

4. **Review Meeting** (triggered by verification)
   - Type: `meeting.review`
   - Date: Auto-scheduled 7 days after initiative verified
   - Attendees: Admins + community members
   - Purpose: Discuss lessons learned, metrics evaluation

### Governance Module

**Events for governance processes:**

1. **Deliberation Sessions**
   - Type: `meeting.deliberation`
   - Created when proposal enters "deliberation" status
   - Attendees: All interested members (open attendance)

2. **Voting Period**
   - Type: `reminder.custom`
   - Title: "Voting closes for: [proposal title]"
   - Date: Voting deadline
   - Visibility: Public or members-only

3. **Assembly Meetings**
   - Type: `meeting.assembly`
   - Recurring (monthly or quarterly)
   - Purpose: Group-wide votes on major decisions

### Notifications Module

**Event reminders:**
- 1 week before event
- 1 day before event
- 1 hour before event (for meetings)
- Event starting now

---

## Core Features

### Phase 1: Event CRUD & Calendar View (0% - SPEC ONLY)

#### Features:
- Create events (manual or auto-generated)
- List events (filtered by date range, type, group)
- View event details
- RSVP to events
- Cancel/postpone events
- Calendar views: day, week, month, agenda

#### UI Routes:
- `/events` - Calendar view with all events
- `/events/new` - Create event form
- `/events/[id]` - Event detail + RSVP
- `/events/[id]/edit` - Edit event (creator only)

#### Implementation:
- [ ] Event entity with validation
- [ ] RecurrenceRule processing
- [ ] Event CRUD API endpoints
- [ ] RSVP management
- [ ] Calendar UI component (react-big-calendar or similar)
- [ ] Event detail page

---

### Phase 2: Attendance Tracking & Meeting Notes (0% - SPEC ONLY)

#### Features:
- Check-in system for meetings
- Attendance tracking (who actually attended)
- Meeting notes creation during/after event
- Action items and decision recording
- Notes approval by attendees
- Export notes (markdown, PDF)

#### UI Components:
- Check-in interface (QR code or manual)
- Meeting notes editor (markdown)
- Action items tracker
- Decision logger

#### Implementation:
- [ ] Attendee check-in API
- [ ] MeetingNotes entity and API
- [ ] Notes editor UI
- [ ] Action item integration with task systems

---

### Phase 3: Initiative Integration (0% - SPEC ONLY)

#### Features:
- Auto-create events from initiatives
- Milestone configuration per initiative
- Workgroup meeting scheduling
- Deadline reminders
- Review meeting auto-scheduling

#### Implementation:
- [ ] Listen for `initiative.created` events
- [ ] Generate events based on initiative timeline
- [ ] Calculate milestone dates
- [ ] Auto-assign attendees from initiative.assignedTo

---

### Phase 4: Recurring Events & Notifications (0% - SPEC ONLY)

#### Features:
- Recurring event creation (daily, weekly, monthly)
- Edit single occurrence vs entire series
- Notification integration (reminders)
- Email invites for events
- Calendar export (iCal format)

#### Implementation:
- [ ] Recurrence engine (rrule.js or similar)
- [ ] Event occurrence generation
- [ ] Notification integration
- [ ] iCal export endpoint

---

## Validation Rules

### Event Creation

```typescript
import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000).optional(),
  type: z.enum([
    'deadline', 'milestone', 'meeting.workgroup', 'meeting.assembly',
    'meeting.deliberation', 'meeting.review', 'gathering.social',
    'gathering.workshop', 'gathering.celebration', 'reminder.custom'
  ]),
  startDate: z.date().refine(date => date > new Date(), {
    message: "Start date must be in the future"
  }),
  endDate: z.date().optional(),
  location: z.enum(['virtual', 'physical', 'hybrid']),
  physicalAddress: z.string().optional(),
  virtualLink: z.string().url().optional(),
  groupId: z.string().uuid().optional(),
  initiativeId: z.string().uuid().optional(),
  proposalId: z.string().uuid().optional(),
  maxAttendees: z.number().int().positive().optional(),
  rsvpRequired: z.boolean().default(false),
  visibility: z.enum(['public', 'members_only', 'group_only', 'private']),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    endDate: z.date().optional(),
    occurrences: z.number().int().positive().optional(),
  }).optional(),
}).refine(data => {
  // If endDate provided, must be after startDate
  if (data.endDate && data.endDate <= data.startDate) {
    return false
  }
  // If virtual/hybrid, must have virtualLink
  if ((data.location === 'virtual' || data.location === 'hybrid') && !data.virtualLink) {
    return false
  }
  // If physical/hybrid, must have physicalAddress
  if ((data.location === 'physical' || data.location === 'hybrid') && !data.physicalAddress) {
    return false
  }
  return true
})
```

### RSVP

```typescript
export const rsvpSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['going', 'maybe', 'not_going'])
})
```

### Meeting Notes

```typescript
export const createMeetingNotesSchema = z.object({
  eventId: z.string().uuid(),
  content: z.string().min(10).max(10000),
  decisions: z.array(z.object({
    summary: z.string().min(3).max(500),
    votedBy: z.array(z.string().uuid()),
    outcome: z.enum(['approved', 'rejected', 'deferred'])
  })).optional(),
  actionItems: z.array(z.object({
    description: z.string().min(3).max(500),
    assignedTo: z.string().uuid(),
    dueDate: z.date(),
  })).optional(),
})
```

---

## UI Components

### Calendar Views

```typescript
interface CalendarProps {
  defaultView: 'day' | 'week' | 'month' | 'agenda'
  events: Event[]
  onEventClick: (event: Event) => void
  onDateClick: (date: Date) => void
  filters: {
    types: EventType[]
    groupId?: string
    showCanceled: boolean
  }
}
```

### Event Card

```typescript
interface EventCardProps {
  event: Event
  showRSVP: boolean
  compact?: boolean  // For calendar grid view
}
```

### RSVP Widget

```typescript
interface RSVPWidgetProps {
  eventId: string
  currentUserStatus: 'going' | 'maybe' | 'not_going' | 'no_response'
  attendeeCounts: {
    going: number
    maybe: number
    not_going: number
  }
  onRSVP: (status: 'going' | 'maybe' | 'not_going') => Promise<void>
}
```

---

## Success Metrics

### Engagement
- **Events created per month:** Target >10 per 100 active members
- **RSVP rate:** >60% of members RSVP to events they're invited to
- **Attendance rate:** >70% of "going" RSVPs actually attend
- **Meeting notes completion:** >80% of meetings have notes recorded

### Integration
- **Auto-created initiative events:** 100% of initiatives generate events
- **Deadline awareness:** >90% of admins aware of upcoming deadlines
- **Review meeting participation:** >50% of community attends post-initiative reviews

### Quality
- **Calendar adoption:** >70% of members check calendar at least weekly
- **Conflict avoidance:** <10% of events rescheduled due to conflicts
- **Notes approval rate:** >85% of meeting notes approved by attendees

---

## Dependencies

### Required Modules:
- **Auth** (100%) — User identification, permissions
- **Groups** (100%) — Group-scoped events
- **Notifications** (65%) — Event reminders

### Optional Integration:
- **Execution & Accountability** (0%) — Initiative event auto-creation
- **Governance** (60%) — Deliberation and voting event creation
- **Profiles** (100%) — Attendee display

---

## Privacy & Security

### Public Events
- Visible to anyone (including non-members)
- Examples: Community workshops, public gatherings

### Members-Only Events
- Visible to all logged-in members
- Examples: General assemblies, platform-wide meetings

### Group-Only Events
- Visible only to group members
- Examples: Workgroup meetings, group deliberations

### Private Events
- Visible only to invited attendees
- Examples: Admin meetings, sensitive discussions

### Data Retention
- Past events: Kept indefinitely (historical record)
- Canceled events: Soft delete (marked canceled, not removed)
- Meeting notes: Public for members (privacy setting per note)

---

## Future Enhancements

### Phase 5: Advanced Features
- Event templates (reusable event configurations)
- Polls for meeting time selection (Doodle-style)
- Waitlist for capacity-limited events
- Event series (multi-session workshops)
- Integration with external calendars (Google Calendar, Outlook)

### Phase 6: Analytics
- Event participation trends
- Member availability patterns (best meeting times)
- Recurring meeting optimization suggestions
- Attendance correlation with engagement

---

## Related Documentation

- [Execution & Accountability Module](./admin-accountability.md) — Initiative tracking
- [Governance Module](./governance.md) — Deliberation and voting
- [Notifications Module](./notifications.md) — Event reminders
- [Groups Module](./groups.md) — Group-scoped events

---

**Status:** Spec complete, implementation at 0%
**Next Milestone:** Event CRUD + calendar view MVP (target: 30%)
**Owner:** @coopeverything-core

---
