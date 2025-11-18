/**
 * TopicCard Component
 *
 * Displays a single forum topic in a card format
 */

'use client'

import type { Topic } from '@togetheros/types/forum'

// Simple time formatting without external dependency
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export interface TopicCardProps {
  /** Topic to display */
  topic: Topic

  /** Author name (optional) */
  authorName?: string

  /** Callback when card is clicked */
  onClick?: () => void

  /** Optional CSS class name */
  className?: string
}

export function TopicCard({
  topic,
  authorName,
  onClick,
  className = '',
}: TopicCardProps) {
  const categoryIcons = {
    general: '💬',
    proposal: '💡',
    question: '❓',
    deliberation: '⚖️',
    announcement: '📢',
  }

  const categoryColors = {
    general: 'bg-gray-100 text-gray-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    question: 'bg-blue-100 text-blue-800',
    deliberation: 'bg-purple-100 text-purple-800',
    announcement: 'bg-green-100 text-green-800',
  }

  const statusColors = {
    open: 'text-green-600',
    resolved: 'text-blue-600',
    archived: 'text-gray-500',
    locked: 'text-red-600',
  }

  return (
    <div
      onClick={onClick}
      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Topic Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                categoryColors[topic.category]
              }`}
            >
              <span role="img" aria-label={topic.category}>
                {categoryIcons[topic.category]}
              </span>
              {topic.category}
            </span>

            {/* Pinned Badge */}
            {topic.isPinned && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                📌 Pinned
              </span>
            )}

            {/* Locked Badge */}
            {topic.isLocked && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                🔒 Locked
              </span>
            )}
          </div>

          {/* Topic Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {topic.title}
          </h3>

          {/* Topic Description */}
          {topic.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {topic.description}
            </p>
          )}
        </div>

        {/* Status */}
        <span className={`text-sm font-medium ${statusColors[topic.status]}`}>
          {topic.status}
        </span>
      </div>

      {/* Tags */}
      {topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-3">
          {/* Author */}
          <span>
            by <span className="font-medium">{authorName || 'Unknown'}</span>
          </span>

          {/* Post Count */}
          <span className="flex items-center gap-1">
            💬 {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
          </span>

          {/* Participant Count */}
          <span className="flex items-center gap-1">
            👥 {topic.participantCount}{' '}
            {topic.participantCount === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        {/* Last Activity */}
        <span>
          {formatTimeAgo(topic.lastActivityAt)}
        </span>
      </div>
    </div>
  )
}
