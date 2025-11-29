import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import type { Event, UpdateEventInput, EventAttendee } from '@togetheros/types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/events/[id] - Get event details with attendees
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const eventResult = await pool.query(
      `SELECT
        e.*,
        u.name as creator_name,
        g.name as group_name,
        r.frequency as recurrence_frequency,
        r.interval_count as recurrence_interval,
        r.days_of_week as recurrence_days_of_week,
        r.day_of_month as recurrence_day_of_month,
        r.end_date as recurrence_end_date,
        r.occurrences as recurrence_occurrences
      FROM events e
      LEFT JOIN users u ON e.creator_id = u.id
      LEFT JOIN groups g ON e.group_id = g.id
      LEFT JOIN events_recurrence r ON r.event_id = e.id
      WHERE e.id = $1`,
      [id]
    )

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const row = eventResult.rows[0]

    // Fetch attendees
    const attendeesResult = await pool.query(
      `SELECT
        ea.*,
        u.name as member_name
      FROM events_attendees ea
      LEFT JOIN users u ON ea.member_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.role, ea.rsvp_at`,
      [id]
    )

    const attendees: EventAttendee[] = attendeesResult.rows.map((a) => ({
      id: a.id,
      eventId: a.event_id,
      memberId: a.member_id,
      memberName: a.member_name,
      rsvpStatus: a.rsvp_status,
      attended: a.attended,
      role: a.role,
      rsvpAt: a.rsvp_at?.toISOString(),
      attendedAt: a.attended_at?.toISOString(),
      createdAt: a.created_at?.toISOString(),
      updatedAt: a.updated_at?.toISOString(),
    }))

    const event: Event = {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      allDay: row.all_day,
      location: row.location,
      physicalAddress: row.physical_address,
      virtualLink: row.virtual_link,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      groupId: row.group_id,
      groupName: row.group_name,
      initiativeId: row.initiative_id,
      proposalId: row.proposal_id,
      attendees,
      attendeeCount: attendees.length,
      maxAttendees: row.max_attendees,
      rsvpRequired: row.rsvp_required,
      status: row.status,
      completedAt: row.completed_at?.toISOString(),
      notes: row.notes,
      visibility: row.visibility,
      recurrence: row.recurrence_frequency
        ? {
            frequency: row.recurrence_frequency,
            interval: row.recurrence_interval,
            daysOfWeek: row.recurrence_days_of_week,
            dayOfMonth: row.recurrence_day_of_month,
            endDate: row.recurrence_end_date?.toISOString(),
            occurrences: row.recurrence_occurrences,
          }
        : undefined,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      canceledAt: row.canceled_at?.toISOString(),
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/events/[id] - Update an event
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body: UpdateEventInput = await request.json()

    // Build dynamic update query
    const updates: string[] = []
    const values: (string | number | boolean | null)[] = []
    let paramIndex = 1

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(body.title)
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(body.description)
    }
    if (body.type !== undefined) {
      updates.push(`type = $${paramIndex++}`)
      values.push(body.type)
    }
    if (body.startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`)
      values.push(body.startDate)
    }
    if (body.endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`)
      values.push(body.endDate)
    }
    if (body.allDay !== undefined) {
      updates.push(`all_day = $${paramIndex++}`)
      values.push(body.allDay)
    }
    if (body.location !== undefined) {
      updates.push(`location = $${paramIndex++}`)
      values.push(body.location)
    }
    if (body.physicalAddress !== undefined) {
      updates.push(`physical_address = $${paramIndex++}`)
      values.push(body.physicalAddress)
    }
    if (body.virtualLink !== undefined) {
      updates.push(`virtual_link = $${paramIndex++}`)
      values.push(body.virtualLink)
    }
    if (body.maxAttendees !== undefined) {
      updates.push(`max_attendees = $${paramIndex++}`)
      values.push(body.maxAttendees)
    }
    if (body.rsvpRequired !== undefined) {
      updates.push(`rsvp_required = $${paramIndex++}`)
      values.push(body.rsvpRequired)
    }
    if (body.visibility !== undefined) {
      updates.push(`visibility = $${paramIndex++}`)
      values.push(body.visibility)
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      values.push(body.status)
      if (body.status === 'completed') {
        updates.push(`completed_at = NOW()`)
      }
      if (body.status === 'canceled') {
        updates.push(`canceled_at = NOW()`)
      }
    }
    if (body.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`)
      values.push(body.notes)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)
    const result = await pool.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const row = result.rows[0]
    const event: Event = {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      allDay: row.all_day,
      location: row.location,
      physicalAddress: row.physical_address,
      virtualLink: row.virtual_link,
      creatorId: row.creator_id,
      groupId: row.group_id,
      maxAttendees: row.max_attendees,
      rsvpRequired: row.rsvp_required,
      status: row.status,
      completedAt: row.completed_at?.toISOString(),
      notes: row.notes,
      visibility: row.visibility,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      canceledAt: row.canceled_at?.toISOString(),
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id] - Cancel (soft delete) an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const result = await pool.query(
      `UPDATE events SET status = 'canceled', canceled_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Event canceled' })
  } catch (error) {
    console.error('Error canceling event:', error)
    return NextResponse.json(
      { error: 'Failed to cancel event' },
      { status: 500 }
    )
  }
}
