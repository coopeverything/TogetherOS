import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import type { Event, CreateEventInput, EventFilters } from '@togetheros/types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * GET /api/events - List events with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const types = searchParams.get('types')?.split(',')
    const groupId = searchParams.get('groupId')
    const visibility = searchParams.get('visibility')
    const includeAttendees = searchParams.get('includeAttendees') === 'true'

    let query = `
      SELECT
        e.*,
        u.name as creator_name,
        g.name as group_name,
        (SELECT COUNT(*) FROM events_attendees WHERE event_id = e.id) as attendee_count
      FROM events e
      LEFT JOIN users u ON e.creator_id = u.id
      LEFT JOIN groups g ON e.group_id = g.id
      WHERE e.status != 'canceled'
    `
    const params: (string | Date)[] = []
    let paramIndex = 1

    if (startDate) {
      query += ` AND e.start_date >= $${paramIndex++}`
      params.push(startDate)
    }

    if (endDate) {
      query += ` AND e.start_date <= $${paramIndex++}`
      params.push(endDate)
    }

    if (types && types.length > 0) {
      query += ` AND e.type = ANY($${paramIndex++}::event_type[])`
      params.push(types as unknown as string)
    }

    if (groupId) {
      query += ` AND e.group_id = $${paramIndex++}`
      params.push(groupId)
    }

    if (visibility) {
      query += ` AND e.visibility = $${paramIndex++}`
      params.push(visibility)
    }

    query += ' ORDER BY e.start_date ASC'

    const result = await pool.query(query, params)

    const events: Event[] = result.rows.map((row) => ({
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
      attendeeCount: parseInt(row.attendee_count, 10),
      maxAttendees: row.max_attendees,
      rsvpRequired: row.rsvp_required,
      status: row.status,
      completedAt: row.completed_at?.toISOString(),
      notes: row.notes,
      visibility: row.visibility,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      canceledAt: row.canceled_at?.toISOString(),
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events - Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateEventInput = await request.json()

    // Validate required fields
    if (!body.title || body.title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (!body.startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      )
    }

    if (!body.type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Validate location requirements
    if ((body.location === 'virtual' || body.location === 'hybrid') && !body.virtualLink) {
      return NextResponse.json(
        { error: 'Virtual link is required for virtual/hybrid events' },
        { status: 400 }
      )
    }

    if ((body.location === 'physical' || body.location === 'hybrid') && !body.physicalAddress) {
      return NextResponse.json(
        { error: 'Physical address is required for physical/hybrid events' },
        { status: 400 }
      )
    }

    // TODO: Get actual user ID from session
    const creatorId = 'a0000000-0000-0000-0000-000000000001' // Placeholder

    const result = await pool.query(
      `INSERT INTO events (
        title, description, type, start_date, end_date, all_day,
        location, physical_address, virtual_link,
        creator_id, group_id, initiative_id, proposal_id,
        max_attendees, rsvp_required, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        body.title,
        body.description || null,
        body.type,
        body.startDate,
        body.endDate || null,
        body.allDay || false,
        body.location,
        body.physicalAddress || null,
        body.virtualLink || null,
        creatorId,
        body.groupId || null,
        body.initiativeId || null,
        body.proposalId || null,
        body.maxAttendees || null,
        body.rsvpRequired || false,
        body.visibility,
      ]
    )

    const row = result.rows[0]

    // Handle recurrence if provided
    if (body.recurrence) {
      await pool.query(
        `INSERT INTO events_recurrence (
          event_id, frequency, interval_count, days_of_week, day_of_month, end_date, occurrences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          row.id,
          body.recurrence.frequency,
          body.recurrence.interval,
          body.recurrence.daysOfWeek || null,
          body.recurrence.dayOfMonth || null,
          body.recurrence.endDate || null,
          body.recurrence.occurrences || null,
        ]
      )
    }

    // Add creator as organizer
    await pool.query(
      `INSERT INTO events_attendees (event_id, member_id, rsvp_status, role)
       VALUES ($1, $2, 'going', 'organizer')`,
      [row.id, creatorId]
    )

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
      initiativeId: row.initiative_id,
      proposalId: row.proposal_id,
      attendeeCount: 1,
      maxAttendees: row.max_attendees,
      rsvpRequired: row.rsvp_required,
      status: row.status,
      visibility: row.visibility,
      recurrence: body.recurrence,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
