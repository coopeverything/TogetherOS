import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import type { RSVPStatus, AttendeeCounts } from '@togetheros/types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/events/[id]/rsvp - Get current user's RSVP status and counts
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // TODO: Get actual user ID from session
    const userId = 'a0000000-0000-0000-0000-000000000001'

    // Get user's RSVP status
    const userRsvp = await pool.query(
      `SELECT rsvp_status FROM events_attendees WHERE event_id = $1 AND member_id = $2`,
      [id, userId]
    )

    // Get attendee counts
    const counts = await pool.query(
      `SELECT
        rsvp_status,
        COUNT(*) as count
      FROM events_attendees
      WHERE event_id = $1
      GROUP BY rsvp_status`,
      [id]
    )

    const attendeeCounts: AttendeeCounts = {
      going: 0,
      maybe: 0,
      notGoing: 0,
      noResponse: 0,
      total: 0,
    }

    counts.rows.forEach((row) => {
      const count = parseInt(row.count, 10)
      attendeeCounts.total += count
      switch (row.rsvp_status) {
        case 'going':
          attendeeCounts.going = count
          break
        case 'maybe':
          attendeeCounts.maybe = count
          break
        case 'not_going':
          attendeeCounts.notGoing = count
          break
        case 'no_response':
          attendeeCounts.noResponse = count
          break
      }
    })

    return NextResponse.json({
      userStatus: userRsvp.rows[0]?.rsvp_status || 'no_response',
      counts: attendeeCounts,
    })
  } catch (error) {
    console.error('Error fetching RSVP status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RSVP status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[id]/rsvp - Update RSVP status
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: RSVPStatus }

    if (!['going', 'maybe', 'not_going'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status' },
        { status: 400 }
      )
    }

    // Check if event exists and is not canceled
    const eventCheck = await pool.query(
      `SELECT id, max_attendees, status FROM events WHERE id = $1`,
      [id]
    )

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (eventCheck.rows[0].status === 'canceled') {
      return NextResponse.json(
        { error: 'Cannot RSVP to a canceled event' },
        { status: 400 }
      )
    }

    // Check capacity if user is RSVPing as "going"
    if (status === 'going' && eventCheck.rows[0].max_attendees) {
      const goingCount = await pool.query(
        `SELECT COUNT(*) FROM events_attendees WHERE event_id = $1 AND rsvp_status = 'going'`,
        [id]
      )
      if (parseInt(goingCount.rows[0].count, 10) >= eventCheck.rows[0].max_attendees) {
        return NextResponse.json(
          { error: 'Event is at capacity' },
          { status: 400 }
        )
      }
    }

    // TODO: Get actual user ID from session
    const userId = 'a0000000-0000-0000-0000-000000000001'

    // Upsert RSVP
    await pool.query(
      `INSERT INTO events_attendees (event_id, member_id, rsvp_status, rsvp_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (event_id, member_id)
       DO UPDATE SET rsvp_status = $3, rsvp_at = NOW()`,
      [id, userId, status]
    )

    // Get updated counts
    const counts = await pool.query(
      `SELECT
        rsvp_status,
        COUNT(*) as count
      FROM events_attendees
      WHERE event_id = $1
      GROUP BY rsvp_status`,
      [id]
    )

    const attendeeCounts: AttendeeCounts = {
      going: 0,
      maybe: 0,
      notGoing: 0,
      noResponse: 0,
      total: 0,
    }

    counts.rows.forEach((row) => {
      const count = parseInt(row.count, 10)
      attendeeCounts.total += count
      switch (row.rsvp_status) {
        case 'going':
          attendeeCounts.going = count
          break
        case 'maybe':
          attendeeCounts.maybe = count
          break
        case 'not_going':
          attendeeCounts.notGoing = count
          break
        case 'no_response':
          attendeeCounts.noResponse = count
          break
      }
    })

    return NextResponse.json({
      success: true,
      userStatus: status,
      counts: attendeeCounts,
    })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to update RSVP' },
      { status: 500 }
    )
  }
}
