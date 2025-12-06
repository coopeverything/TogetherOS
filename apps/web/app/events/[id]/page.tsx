'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import type { Event, EventType, RSVPStatus, AttendeeCounts } from '@togetheros/types'

const EVENT_COLORS: Record<EventType, string> = {
  deadline: 'bg-red-100 text-red-800',
  milestone: 'bg-purple-100 text-purple-800',
  'meeting.workgroup': 'bg-blue-100 text-blue-800',
  'meeting.assembly': 'bg-indigo-100 text-indigo-800',
  'meeting.deliberation': 'bg-amber-100 text-amber-800',
  'meeting.review': 'bg-teal-100 text-teal-800',
  'gathering.social': 'bg-green-100 text-green-800',
  'gathering.workshop': 'bg-orange-100 text-orange-800',
  'gathering.celebration': 'bg-pink-100 text-pink-800',
  'reminder.custom': 'bg-bg-2 text-ink-900',
}

const EVENT_LABELS: Record<EventType, string> = {
  deadline: 'Deadline',
  milestone: 'Milestone',
  'meeting.workgroup': 'Workgroup Meeting',
  'meeting.assembly': 'Assembly',
  'meeting.deliberation': 'Deliberation Session',
  'meeting.review': 'Review Meeting',
  'gathering.social': 'Social Gathering',
  'gathering.workshop': 'Workshop',
  'gathering.celebration': 'Celebration',
  'reminder.custom': 'Reminder',
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRsvp, setUserRsvp] = useState<RSVPStatus>('no_response')
  const [counts, setCounts] = useState<AttendeeCounts>({
    going: 0,
    maybe: 0,
    notGoing: 0,
    noResponse: 0,
    total: 0,
  })
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    fetchEvent()
    fetchRsvpStatus()
  }, [id])

  async function fetchEvent() {
    try {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) {
        throw new Error('Event not found')
      }
      const data = await res.json()
      setEvent(data.event)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRsvpStatus() {
    try {
      const res = await fetch(`/api/events/${id}/rsvp`)
      if (res.ok) {
        const data = await res.json()
        setUserRsvp(data.userStatus)
        setCounts(data.counts)
      }
    } catch (err) {
      console.error('Failed to fetch RSVP status:', err)
    }
  }

  async function handleRsvp(status: RSVPStatus) {
    if (rsvpLoading) return
    setRsvpLoading(true)
    try {
      const res = await fetch(`/api/events/${id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setUserRsvp(data.userStatus)
        setCounts(data.counts)
      }
    } catch (err) {
      console.error('Failed to update RSVP:', err)
    } finally {
      setRsvpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-ink-400">Loading event...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-8 text-center">
            <h1 className="text-xl font-semibold text-ink-900 mb-2">Event Not Found</h1>
            <p className="text-ink-700 mb-4">{error || 'This event does not exist.'}</p>
            <Link href="/events" className="text-blue-600 hover:underline">
              Back to Calendar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPast = new Date(event.startDate) < new Date()
  const isCanceled = event.status === 'canceled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Calendar
        </Link>

        {/* Event Card */}
        <div className="bg-bg-1 rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${EVENT_COLORS[event.type]}`}>
                    {EVENT_LABELS[event.type]}
                  </span>
                  {isCanceled && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Canceled
                    </span>
                  )}
                  {isPast && !isCanceled && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-bg-2 text-ink-700">
                      Past Event
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-ink-900">{event.title}</h1>
                {event.groupName && (
                  <p className="text-ink-700 mt-1">Hosted by {event.groupName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-ink-900">{formatDateTime(event.startDate)}</div>
                {event.endDate && (
                  <div className="text-ink-700">to {formatDateTime(event.endDate)}</div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-ink-900 capitalize">{event.location}</div>
                {event.physicalAddress && (
                  <div className="text-ink-700">{event.physicalAddress}</div>
                )}
                {event.virtualLink && (
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Virtual Meeting
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-ink-900 mb-2">About this Event</h3>
                <p className="text-ink-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* RSVP Section */}
            {!isCanceled && !isPast && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-ink-900 mb-4">RSVP</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleRsvp('going')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userRsvp === 'going'
                        ? 'bg-green-600 text-white'
                        : 'bg-bg-2 text-ink-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    Going ({counts.going})
                  </button>
                  <button
                    onClick={() => handleRsvp('maybe')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userRsvp === 'maybe'
                        ? 'bg-amber-500 text-white'
                        : 'bg-bg-2 text-ink-700 hover:bg-amber-100 hover:text-amber-700'
                    }`}
                  >
                    Maybe ({counts.maybe})
                  </button>
                  <button
                    onClick={() => handleRsvp('not_going')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userRsvp === 'not_going'
                        ? 'bg-red-600 text-white'
                        : 'bg-bg-2 text-ink-700 hover:bg-red-100 hover:text-red-700'
                    }`}
                  >
                    Can&apos;t Go ({counts.notGoing})
                  </button>
                </div>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-ink-900 mb-4">
                  Attendees ({event.attendees.filter((a) => a.rsvpStatus === 'going').length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.attendees
                    .filter((a) => a.rsvpStatus === 'going')
                    .map((attendee) => (
                      <div
                        key={attendee.id}
                        className="px-3 py-1.5 bg-bg-2 rounded-full text-sm text-ink-700"
                      >
                        {attendee.memberName || 'Member'}
                        {attendee.role === 'organizer' && (
                          <span className="ml-1 text-blue-600">(Organizer)</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Capacity */}
            {event.maxAttendees && (
              <div className="text-sm text-ink-400">
                Capacity: {counts.going} / {event.maxAttendees} spots filled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
