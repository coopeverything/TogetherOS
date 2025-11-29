/**
 * Events & Calendar Module Types
 *
 * Comprehensive event management, milestone tracking, and meeting scheduling.
 */

// Event type enum
export type EventType =
  | 'deadline'
  | 'milestone'
  | 'meeting.workgroup'
  | 'meeting.assembly'
  | 'meeting.deliberation'
  | 'meeting.review'
  | 'gathering.social'
  | 'gathering.workshop'
  | 'gathering.celebration'
  | 'reminder.custom'

// Event status enum
export type EventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'postponed'

// Location type enum
export type EventLocationType = 'virtual' | 'physical' | 'hybrid'

// Visibility enum
export type EventVisibility = 'public' | 'members_only' | 'group_only' | 'private'

// RSVP status enum
export type RSVPStatus = 'going' | 'maybe' | 'not_going' | 'no_response'

// Attendee role enum
export type AttendeeRole = 'organizer' | 'facilitator' | 'note_taker' | 'participant'

// Meeting decision outcome enum (distinct from governance DecisionOutcome)
export type MeetingDecisionOutcome = 'approved' | 'rejected' | 'deferred'

// Recurrence frequency enum
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Recurrence rule for repeating events
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number // Every N days/weeks/months
  daysOfWeek?: number[] // [0-6] for weekly (0 = Sunday)
  dayOfMonth?: number // 1-31 for monthly
  endDate?: string // ISO date string
  occurrences?: number // Stop after N occurrences
}

/**
 * Event attendee
 */
export interface EventAttendee {
  id: string
  eventId: string
  memberId: string
  memberName?: string // Populated from join
  memberAvatar?: string
  rsvpStatus: RSVPStatus
  attended: boolean
  role: AttendeeRole
  rsvpAt?: string
  attendedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Main event entity
 */
export interface Event {
  id: string
  title: string
  description?: string
  type: EventType

  // Scheduling
  startDate: string // ISO date string
  endDate?: string
  allDay: boolean

  // Location
  location: EventLocationType
  physicalAddress?: string
  virtualLink?: string

  // Ownership
  creatorId: string
  creatorName?: string // Populated from join
  groupId?: string
  groupName?: string

  // Associations
  initiativeId?: string
  proposalId?: string

  // Attendance
  attendees?: EventAttendee[]
  attendeeCount?: number
  maxAttendees?: number
  rsvpRequired: boolean

  // Status
  status: EventStatus
  completedAt?: string
  notes?: string

  // Visibility
  visibility: EventVisibility

  // Recurrence
  recurrence?: RecurrenceRule

  // Timestamps
  createdAt: string
  updatedAt: string
  canceledAt?: string
}

/**
 * Decision made during a meeting
 */
export interface MeetingDecision {
  id: string
  notesId: string
  summary: string
  votedBy: string[]
  outcome: MeetingDecisionOutcome
  createdAt: string
}

/**
 * Action item from a meeting
 */
export interface ActionItem {
  id: string
  notesId: string
  description: string
  assignedTo: string
  assigneeName?: string
  dueDate: string
  completed: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Meeting notes for an event
 */
export interface MeetingNotes {
  id: string
  eventId: string
  content: string
  decisions?: MeetingDecision[]
  actionItems?: ActionItem[]
  takenBy: string
  takenByName?: string
  takenAt: string
  approved: boolean
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create event input
 */
export interface CreateEventInput {
  title: string
  description?: string
  type: EventType
  startDate: string
  endDate?: string
  allDay?: boolean
  location: EventLocationType
  physicalAddress?: string
  virtualLink?: string
  groupId?: string
  initiativeId?: string
  proposalId?: string
  maxAttendees?: number
  rsvpRequired?: boolean
  visibility: EventVisibility
  recurrence?: RecurrenceRule
}

/**
 * Update event input
 */
export interface UpdateEventInput {
  title?: string
  description?: string
  type?: EventType
  startDate?: string
  endDate?: string
  allDay?: boolean
  location?: EventLocationType
  physicalAddress?: string
  virtualLink?: string
  maxAttendees?: number
  rsvpRequired?: boolean
  visibility?: EventVisibility
  status?: EventStatus
  notes?: string
}

/**
 * RSVP input
 */
export interface RSVPInput {
  eventId: string
  status: Exclude<RSVPStatus, 'no_response'>
}

/**
 * Create meeting notes input
 */
export interface CreateMeetingNotesInput {
  eventId: string
  content: string
  decisions?: {
    summary: string
    votedBy: string[]
    outcome: MeetingDecisionOutcome
  }[]
  actionItems?: {
    description: string
    assignedTo: string
    dueDate: string
  }[]
}

/**
 * Event filters for listing
 */
export interface EventFilters {
  startDate?: string
  endDate?: string
  types?: EventType[]
  status?: EventStatus[]
  groupId?: string
  creatorId?: string
  visibility?: EventVisibility[]
  includeAttendees?: boolean
}

/**
 * Attendee counts for an event
 */
export interface AttendeeCounts {
  going: number
  maybe: number
  notGoing: number
  noResponse: number
  total: number
}

/**
 * Calendar view types
 */
export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

/**
 * Event type display info
 */
export const EVENT_TYPE_INFO: Record<EventType, { label: string; color: string; icon: string }> = {
  deadline: { label: 'Deadline', color: 'red', icon: 'clock' },
  milestone: { label: 'Milestone', color: 'purple', icon: 'flag' },
  'meeting.workgroup': { label: 'Workgroup Meeting', color: 'blue', icon: 'users' },
  'meeting.assembly': { label: 'Assembly', color: 'indigo', icon: 'building' },
  'meeting.deliberation': { label: 'Deliberation', color: 'amber', icon: 'message-square' },
  'meeting.review': { label: 'Review', color: 'teal', icon: 'check-circle' },
  'gathering.social': { label: 'Social Gathering', color: 'green', icon: 'heart' },
  'gathering.workshop': { label: 'Workshop', color: 'orange', icon: 'book-open' },
  'gathering.celebration': { label: 'Celebration', color: 'pink', icon: 'gift' },
  'reminder.custom': { label: 'Reminder', color: 'gray', icon: 'bell' },
}

/**
 * Event status display info
 */
export const EVENT_STATUS_INFO: Record<EventStatus, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'green' },
  completed: { label: 'Completed', color: 'gray' },
  canceled: { label: 'Canceled', color: 'red' },
  postponed: { label: 'Postponed', color: 'amber' },
}
