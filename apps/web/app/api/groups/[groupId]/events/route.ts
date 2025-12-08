// apps/web/app/api/groups/[groupId]/events/route.ts
// Group events API - Event management for groups

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getGroupEvents,
  createGroupEvent,
  updateGroupEvent,
  deleteGroupEvent,
  rsvpToEvent,
  getEventRSVPs,
} from '../../../../../../api/src/modules/groups/handlers'
import type { CreateGroupEventInput } from '@togetheros/types/groups'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined

    const events = await getGroupEvents(groupId, { upcoming, limit })
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to get group events:', error)
    const message = error instanceof Error ? error.message : 'Failed to get events'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { groupId } = await params
    const body = await request.json()

    // Check if this is an RSVP action
    if (body.action === 'rsvp') {
      const rsvp = await rsvpToEvent(body.eventId, user.id, body.status, body.notes)
      return NextResponse.json({ rsvp })
    }

    // Check if getting RSVPs
    if (body.action === 'getRSVPs') {
      const rsvps = await getEventRSVPs(body.eventId)
      return NextResponse.json({ rsvps })
    }

    // Create new event
    const input: CreateGroupEventInput = {
      groupId,
      title: body.title,
      description: body.description,
      eventType: body.eventType,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      timezone: body.timezone,
      recurrence: body.recurrence,
      location: body.location,
      isVirtual: body.isVirtual,
      virtualLink: body.virtualLink,
      maxAttendees: body.maxAttendees,
      tags: body.tags || [],
    }

    const event = await createGroupEvent(input, user.id)
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Failed to create group event:', error)
    const message = error instanceof Error ? error.message : 'Failed to create event'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    await requireAuth(request)
    await params // verify groupId exists
    const body = await request.json()

    if (!body.eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const event = await updateGroupEvent(body.eventId, {
      title: body.title,
      description: body.description,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      location: body.location,
      isVirtual: body.isVirtual,
      virtualLink: body.virtualLink,
    })
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Failed to update group event:', error)
    const message = error instanceof Error ? error.message : 'Failed to update event'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    await requireAuth(request)
    await params // verify groupId exists
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    await deleteGroupEvent(eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete group event:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete event'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
