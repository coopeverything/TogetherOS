/**
 * GroupEvents Component
 *
 * Displays and manages events for a group
 */

'use client'

export interface GroupEvent {
  id: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  attendeeCount: number
  maxAttendees?: number
  organizerId: string
  organizerName: string
}

export interface GroupEventsProps {
  /** Group ID */
  groupId: string

  /** List of events */
  events: GroupEvent[]

  /** Callback when creating new event */
  onCreateEvent?: () => void

  /** Callback when joining event */
  onJoinEvent?: (eventId: string) => void

  /** Optional CSS class name */
  className?: string
}

export function GroupEvents({
  groupId,
  events,
  onCreateEvent,
  onJoinEvent,
  className = '',
}: GroupEventsProps) {
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= now)
  const pastEvents = events.filter((e) => new Date(e.startDate) < now)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const EventCard = ({ event }: { event: GroupEvent }) => {
    const isPast = new Date(event.startDate) < now
    const isFull = event.maxAttendees && event.attendeeCount >= event.maxAttendees

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
            <p className="text-sm text-gray-500">
              Organized by {event.organizerName}
            </p>
          </div>
          {!isPast && onJoinEvent && !isFull && (
            <button
              onClick={() => onJoinEvent(event.id)}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Join
            </button>
          )}
          {isFull && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 text-sm font-medium rounded-full">
              Full
            </span>
          )}
        </div>

        <p className="text-gray-700 mb-4">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>
              {event.attendeeCount}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attending
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Group Events</h2>
        {onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Create Event
          </button>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming ({upcomingEvents.length})
        </h3>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Past ({pastEvents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
