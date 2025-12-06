'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { EventType, EventLocationType, EventVisibility, CreateEventInput } from '@togetheros/types'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'meeting.workgroup', label: 'Workgroup Meeting' },
  { value: 'meeting.assembly', label: 'Assembly' },
  { value: 'meeting.deliberation', label: 'Deliberation Session' },
  { value: 'meeting.review', label: 'Review Meeting' },
  { value: 'gathering.social', label: 'Social Gathering' },
  { value: 'gathering.workshop', label: 'Workshop' },
  { value: 'gathering.celebration', label: 'Celebration' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'reminder.custom', label: 'Custom Reminder' },
]

const LOCATION_TYPES: { value: EventLocationType; label: string }[] = [
  { value: 'virtual', label: 'Virtual (Online)' },
  { value: 'physical', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid (Both)' },
]

const VISIBILITY_OPTIONS: { value: EventVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'members_only', label: 'Members Only', description: 'Visible to logged-in members' },
  { value: 'group_only', label: 'Group Only', description: 'Visible only to group members' },
  { value: 'private', label: 'Private', description: 'Visible only to invited attendees' },
]

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting.workgroup' as EventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: 'virtual' as EventLocationType,
    physicalAddress: '',
    virtualLink: '',
    maxAttendees: '',
    rsvpRequired: false,
    visibility: 'members_only' as EventVisibility,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || formData.title.length < 3) {
        throw new Error('Title must be at least 3 characters')
      }
      if (!formData.startDate) {
        throw new Error('Start date is required')
      }

      // Build start/end dates
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime || '09:00'}`).toISOString()

      let endDateTime: string | undefined
      if (formData.endDate) {
        endDateTime = formData.allDay
          ? new Date(formData.endDate).toISOString()
          : new Date(`${formData.endDate}T${formData.endTime || '10:00'}`).toISOString()
      }

      // Validate location requirements
      if ((formData.location === 'virtual' || formData.location === 'hybrid') && !formData.virtualLink) {
        throw new Error('Virtual link is required for virtual/hybrid events')
      }
      if ((formData.location === 'physical' || formData.location === 'hybrid') && !formData.physicalAddress) {
        throw new Error('Physical address is required for in-person/hybrid events')
      }

      const input: CreateEventInput = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
        location: formData.location,
        physicalAddress: formData.physicalAddress || undefined,
        virtualLink: formData.virtualLink || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : undefined,
        rsvpRequired: formData.rsvpRequired,
        visibility: formData.visibility,
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const data = await res.json()
      router.push(`/events/${data.event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
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

        <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-6">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">Create New Event</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Event Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-ink-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-base font-medium text-ink-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-ink-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-base font-medium text-ink-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-ink-700">All-day event</span>
            </label>

            {/* Location */}
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Location Type *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {LOCATION_TYPES.map((loc) => (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: loc.value })}
                    className={`px-4 py-2 rounded-lg border text-base font-medium transition-colors ${
                      formData.location === loc.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-bg-1 text-ink-700 border-border hover:border-blue-300'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Link */}
            {(formData.location === 'virtual' || formData.location === 'hybrid') && (
              <div>
                <label className="block text-base font-medium text-ink-700 mb-1">
                  Virtual Meeting Link *
                </label>
                <input
                  type="url"
                  value={formData.virtualLink}
                  onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            {/* Physical Address */}
            {(formData.location === 'physical' || formData.location === 'hybrid') && (
              <div>
                <label className="block text-base font-medium text-ink-700 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  value={formData.physicalAddress}
                  onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, State"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your event..."
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as EventVisibility })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} - {opt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity & RSVP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-ink-700 mb-1">
                  Max Attendees (optional)
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.rsvpRequired}
                    onChange={(e) => setFormData({ ...formData, rsvpRequired: e.target.checked })}
                    className="rounded border-border text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-base text-ink-700">Require RSVP</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <Link
                href="/events"
                className="px-6 py-3 bg-bg-2 text-ink-700 rounded-lg hover:bg-bg-2 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
