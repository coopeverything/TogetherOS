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
    general: 'bg-bg-2 text-ink-700',
    proposal: 'bg-joy-100 text-joy-600',
    question: 'bg-info-bg text-info',
    deliberation: 'bg-warn-bg text-warn',
    announcement: 'bg-success-bg text-success',
  }

  const statusColors = {
    open: 'text-success',
    resolved: 'text-info',
    archived: 'text-ink-400',
    locked: 'text-danger',
  }

  return (
    <div
      onClick={onClick}
      className={`bg-bg-1 border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Topic Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full ${
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
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-joy-100 text-joy-600 rounded-full">
                📌 Pinned
              </span>
            )}

            {/* Locked Badge */}
            {topic.isLocked && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-danger-bg text-danger rounded-full">
                🔒 Locked
              </span>
            )}
          </div>

          {/* Topic Title */}
          <h3 className="text-xl font-semibold text-ink-900 mb-1">
            {topic.title}
          </h3>

          {/* Topic Description */}
          {topic.description && (
            <p className="text-base text-ink-700 line-clamp-2 mb-2">
              {topic.description}
            </p>
          )}
        </div>

        {/* Status */}
        <span className={`text-base font-medium ${statusColors[topic.status]}`}>
          {topic.status}
        </span>
      </div>

      {/* Tags */}
      {topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-0.5 text-sm bg-bg-2 text-ink-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center justify-between text-base text-ink-400">
        <div className="flex items-center gap-4">
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
