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
 * Get all events for a group
 */
export async function getGroupEvents(
  groupId: string,
  options?: { upcoming?: boolean; limit?: number }
): Promise<GroupEvent[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!groupId || !uuidRegex.test(groupId)) {
    throw new Error('Invalid group ID format')
  }

  const group = await groupRepo.findById(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  let sql = `SELECT * FROM group_events WHERE group_id = $1`
  const params: any[] = [groupId]

  if (options?.upcoming) {
    sql += ` AND starts_at >= NOW()`
  }

  sql += ` ORDER BY starts_at ASC`

  if (options?.limit) {
    sql += ` LIMIT $2`
    params.push(options.limit)
  }

  const result = await query<any>(sql, params)
  return result.rows.map(mapRowToEvent)
}

/**
 * Get a single event
 */
export async function getGroupEventById(eventId: string): Promise<GroupEvent | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!eventId || !uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format')
  }

  const result = await query<any>(
    `SELECT * FROM group_events WHERE id = $1`,
    [eventId]
  )

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToEvent(result.rows[0])
}

/**
 * Create a new event
 */
export async function createGroupEvent(
  input: CreateGroupEventInput,
  createdBy: string
): Promise<GroupEvent> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!input.groupId || !uuidRegex.test(input.groupId)) {
    throw new Error('Invalid group ID format')
  }
  if (!createdBy || !uuidRegex.test(createdBy)) {
    throw new Error('Invalid creator ID format')
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

  const result = await query<any>(
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

  const existing = await query<any>(
    `SELECT * FROM group_events WHERE id = $1`,
    [eventId]
  )

  if (existing.rows.length === 0) {
    throw new Error('Event not found')
  }

  const result = await query<any>(
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
  const result = await query<any>(
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

  const result = await query<any>(
    `SELECT * FROM group_event_rsvps WHERE event_id = $1 ORDER BY responded_at DESC`,
    [eventId]
  )

  return result.rows.map(mapRowToRSVP)
}

function mapRowToEvent(row: any): GroupEvent {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    description: row.description,
    eventType: row.event_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone || 'UTC',
    recurrence: row.recurrence || 'none',
    recurrenceEndDate: row.recurrence_end_date,
    location: row.location,
    isVirtual: row.is_virtual,
    virtualLink: row.virtual_link,
    createdBy: row.created_by,
    maxAttendees: row.max_attendees,
    proposalId: row.proposal_id,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRowToRSVP(row: any): GroupEventRSVP {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    status: row.status,
    notes: row.notes,
    respondedAt: row.responded_at,
  }
}
