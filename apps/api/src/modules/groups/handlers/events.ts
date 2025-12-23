// apps/api/src/modules/groups/handlers/events.ts
// Event management handlers for groups

import { query } from '@togetheros/db'
import type {
  GroupEvent,
  GroupEventType,
  EventRecurrence,
  GroupRSVPStatus,
  GroupEventRSVP,
  CreateGroupEventInput,
} from '@togetheros/types/groups'
import { groupRepo } from '../repos/PostgresGroupRepo'

/**
 * Database row type for group_events table
 */
interface GroupEventRow {
  id: string
  group_id: string
  title: string
  description: string | null
  event_type: GroupEventType
  starts_at: Date
  ends_at: Date | null
  timezone: string
  recurrence: EventRecurrence
  recurrence_end_date: Date | null
  location: string | null
  is_virtual: boolean
  virtual_link: string | null
  created_by: string
  max_attendees: number | null
  proposal_id: string | null
  tags: string | string[]
  created_at: Date
  updated_at: Date
}

/**
 * Database row type for group_event_rsvps table
 */
interface GroupEventRSVPRow {
  id: string
  event_id: string
  user_id: string
  status: GroupRSVPStatus
  notes: string | null
  responded_at: Date
}

/**
 * Get all events for a group (supports both UUIDs and handles)
 */
export async function getGroupEvents(
  groupId: string,
  options?: { upcoming?: boolean; limit?: number }
): Promise<GroupEvent[]> {
  if (!groupId || groupId.trim().length === 0) {
    throw new Error('Group ID is required')
  }

  // UUID pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  // Check group exists - lookup by ID or handle
  const group = uuidRegex.test(groupId)
    ? await groupRepo.findById(groupId)
    : await groupRepo.findByHandle(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  // Use the actual UUID for database queries
  const actualGroupId = group.id

  let sql = `SELECT * FROM group_events WHERE group_id = $1`
  const params: (string | number)[] = [actualGroupId]

  if (options?.upcoming) {
    sql += ` AND starts_at >= NOW()`
  }

  sql += ` ORDER BY starts_at ASC`

  if (options?.limit) {
    sql += ` LIMIT $2`
    params.push(options.limit)
  }

  const result = await query<GroupEventRow>(sql, params)
  return result.rows.map((row: GroupEventRow) => mapRowToEvent(row))
}

/**
 * Get a single event
 */
export async function getGroupEventById(eventId: string): Promise<GroupEvent | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }

  const result = await query<GroupEventRow>(
    `SELECT * FROM group_events WHERE id = $1`,
    [eventId]
  )

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToEvent(result.rows[0])
}

/**
 * Create a new event (supports both UUIDs and slug-style IDs)
 */
export async function createGroupEvent(
  input: CreateGroupEventInput,
  createdBy: string
): Promise<GroupEvent> {
  if (!input.groupId || input.groupId.trim().length === 0) {
    throw new Error('Group ID is required')
  }
  if (!createdBy || createdBy.trim().length === 0) {
    throw new Error('Creator ID is required')
  }

  const group = await groupRepo.findById(input.groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  if (!input.title || input.title.length < 3 || input.title.length > 200) {
    throw new Error('Event title must be between 3 and 200 characters')
  }

  if (!input.startsAt) {
    throw new Error('Event start time is required')
  }

  const validTypes: GroupEventType[] = ['meeting', 'workshop', 'social', 'action', 'assembly', 'deliberation', 'other']
  if (!validTypes.includes(input.eventType)) {
    throw new Error('Invalid event type')
  }

  const result = await query<GroupEventRow>(
    `INSERT INTO group_events (
      group_id, title, description, event_type, starts_at, ends_at,
      timezone, recurrence, location, is_virtual, virtual_link,
      created_by, max_attendees, tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      input.groupId,
      input.title,
      input.description || null,
      input.eventType,
      input.startsAt,
      input.endsAt || null,
      input.timezone || 'UTC',
      input.recurrence || 'none',
      input.location || null,
      input.isVirtual ?? false,
      input.virtualLink || null,
      createdBy,
      input.maxAttendees || null,
      JSON.stringify(input.tags || []),
    ]
  )

  return mapRowToEvent(result.rows[0])
}

/**
 * Update an event
 */
export async function updateGroupEvent(
  eventId: string,
  updates: Partial<CreateGroupEventInput>
): Promise<GroupEvent> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }

  const existing = await query<GroupEventRow>(
    `SELECT * FROM group_events WHERE id = $1`,
    [eventId]
  )

  if (existing.rows.length === 0) {
    throw new Error('Event not found')
  }

  const result = await query<GroupEventRow>(
    `UPDATE group_events SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      starts_at = COALESCE($3, starts_at),
      ends_at = COALESCE($4, ends_at),
      location = COALESCE($5, location),
      is_virtual = COALESCE($6, is_virtual),
      virtual_link = COALESCE($7, virtual_link),
      updated_at = NOW()
    WHERE id = $8 RETURNING *`,
    [
      updates.title || null,
      updates.description || null,
      updates.startsAt || null,
      updates.endsAt || null,
      updates.location || null,
      updates.isVirtual ?? null,
      updates.virtualLink || null,
      eventId,
    ]
  )

  return mapRowToEvent(result.rows[0])
}

/**
 * Delete an event
 */
export async function deleteGroupEvent(eventId: string): Promise<void> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }

  await query(`DELETE FROM group_events WHERE id = $1`, [eventId])
}

/**
 * RSVP to an event
 */
export async function rsvpToEvent(
  eventId: string,
  userId: string,
  status: GroupRSVPStatus,
  notes?: string
): Promise<GroupEventRSVP> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }
  if (!userId || !uuidRegex.test(userId)) {
    throw new Error('Invalid user ID format')
  }

  const validStatuses: GroupRSVPStatus[] = ['going', 'maybe', 'not_going']
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid RSVP status')
  }

  // Check event exists
  const event = await getGroupEventById(eventId)
  if (!event) {
    throw new Error('Event not found')
  }

  // Upsert RSVP
  const result = await query<GroupEventRSVPRow>(
    `INSERT INTO group_event_rsvps (event_id, user_id, status, notes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (event_id, user_id) DO UPDATE SET
       status = EXCLUDED.status,
       notes = EXCLUDED.notes,
       responded_at = NOW()
     RETURNING *`,
    [eventId, userId, status, notes || null]
  )

  return mapRowToRSVP(result.rows[0])
}

/**
 * Get RSVPs for an event
 */
export async function getEventRSVPs(eventId: string): Promise<GroupEventRSVP[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }

  const result = await query<GroupEventRSVPRow>(
    `SELECT * FROM group_event_rsvps WHERE event_id = $1 ORDER BY responded_at DESC`,
    [eventId]
  )

  return result.rows.map((row: GroupEventRSVPRow) => mapRowToRSVP(row))
}

function mapRowToEvent(row: GroupEventRow): GroupEvent {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    description: row.description ?? undefined,
    eventType: row.event_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    timezone: row.timezone || 'UTC',
    recurrence: row.recurrence || 'none',
    recurrenceEndDate: row.recurrence_end_date ?? undefined,
    location: row.location ?? undefined,
    isVirtual: row.is_virtual,
    virtualLink: row.virtual_link ?? undefined,
    createdBy: row.created_by,
    maxAttendees: row.max_attendees ?? undefined,
    proposalId: row.proposal_id ?? undefined,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRowToRSVP(row: GroupEventRSVPRow): GroupEventRSVP {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    status: row.status,
    notes: row.notes ?? undefined,
    respondedAt: row.responded_at,
  }
}
