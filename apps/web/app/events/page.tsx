'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Event, EventType, CalendarView, EVENT_TYPE_INFO } from '@togetheros/types'

const EVENT_COLORS: Record<EventType, string> = {
  deadline: 'bg-red-100 border-red-300 text-red-800',
  milestone: 'bg-purple-100 border-purple-300 text-purple-800',
  'meeting.workgroup': 'bg-blue-100 border-blue-300 text-blue-800',
  'meeting.assembly': 'bg-indigo-100 border-indigo-300 text-indigo-800',
  'meeting.deliberation': 'bg-amber-100 border-amber-300 text-amber-800',
  'meeting.review': 'bg-teal-100 border-teal-300 text-teal-800',
  'gathering.social': 'bg-green-100 border-green-300 text-green-800',
  'gathering.workshop': 'bg-orange-100 border-orange-300 text-orange-800',
  'gathering.celebration': 'bg-pink-100 border-pink-300 text-pink-800',
  'reminder.custom': 'bg-gray-100 border-gray-300 text-gray-800',
}

const EVENT_LABELS: Record<EventType, string> = {
  deadline: 'Deadline',
  milestone: 'Milestone',
  'meeting.workgroup': 'Workgroup',
  'meeting.assembly': 'Assembly',
  'meeting.deliberation': 'Deliberation',
  'meeting.review': 'Review',
  'gathering.social': 'Social',
  'gathering.workshop': 'Workshop',
  'gathering.celebration': 'Celebration',
  'reminder.custom': 'Reminder',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Add padding days from previous month
  const startPadding = firstDay.getDay()
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add padding days from next month
  const endPadding = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([])

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  async function fetchEvents() {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const params = new URLSearchParams({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      })

      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  function navigateMonth(delta: number) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
  }

  function getEventsForDay(date: Date): Event[] {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  const today = new Date()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const filteredEvents = selectedTypes.length > 0
    ? events.filter((e) => selectedTypes.includes(e.type))
    : events

  const upcomingEvents = filteredEvents
    .filter((e) => new Date(e.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events & Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              Community events, meetings, and milestones
            </p>
          </div>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-base">Loading...</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-base">No upcoming events</div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[50px]">
                          <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Date(event.startDate).getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{event.title}</div>
                          <div className="text-base text-gray-500 dark:text-gray-400 dark:text-gray-500">{formatTime(event.startDate)}</div>
                          <span className={`inline-block mt-1 text-sm px-3 py-0.5 rounded-full ${EVENT_COLORS[event.type]}`}>
                            {EVENT_LABELS[event.type]}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Event Type Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Filter by Type</h2>
              <div className="space-y-2">
                {(Object.keys(EVENT_LABELS) as EventType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type])
                        } else {
                          setSelectedTypes(selectedTypes.filter((t) => t !== type))
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-base px-3 py-0.5 rounded-full ${EVENT_COLORS[type]}`}>
                      {EVENT_LABELS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{monthName}</h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5.5 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-base font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    const isToday = isSameDay(date, today)
                    const dayEvents = getEventsForDay(date)
                    const filteredDayEvents = selectedTypes.length > 0
                      ? dayEvents.filter((e) => selectedTypes.includes(e.type))
                      : dayEvents

                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] p-1 border border-gray-100 rounded-lg ${
                          isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div
                          className={`text-base font-medium mb-1 ${
                            isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          } ${isToday ? 'text-blue-600' : ''}`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {filteredDayEvents.slice(0, 3).map((event) => (
                            <Link
                              key={event.id}
                              href={`/events/${event.id}`}
                              className={`block text-sm p-1 rounded truncate border ${EVENT_COLORS[event.type]} hover:opacity-80 transition-opacity`}
                            >
                              {event.title}
                            </Link>
                          ))}
                          {filteredDayEvents.length > 3 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 pl-1">
                              +{filteredDayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
