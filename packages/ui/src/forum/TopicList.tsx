/**
 * TopicList Component
 *
 * Displays a filterable list of forum topics
 */

'use client'

import { useState } from 'react'
import type { Topic, TopicCategory, TopicStatus } from '@togetheros/types/forum'
import { TopicCard } from './TopicCard'

export interface TopicListProps {
  /** List of topics to display */
  topics: Topic[]

  /** Author names mapped by user ID */
  authorNames?: Record<string, string>

  /** Show create button */
  showCreateButton?: boolean

  /** Callback when create button clicked */
  onCreateTopic?: () => void

  /** Callback when topic card is clicked */
  onTopicClick?: (topicId: string) => void

  /** Optional CSS class name */
  className?: string
}

export function TopicList({
  topics,
  authorNames = {},
  showCreateButton = true,
  onCreateTopic,
  onTopicClick,
  className = '',
}: TopicListProps) {
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all')

  const filteredTopics = topics.filter((topic) => {
    if (categoryFilter !== 'all' && topic.category !== categoryFilter) {
      return false
    }
    if (statusFilter !== 'all' && topic.status !== statusFilter) {
      return false
    }
    return true
  })

  // Sort: pinned first, then by last activity
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    )
  })

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-sm font-bold text-ink-900">Community Discussions</h1>
        {showCreateButton && onCreateTopic && (
          <button
            onClick={onCreateTopic}
            className="px-4 py-2 bg-joy-600 text-white rounded-md hover:bg-joy-500 transition-colors font-medium"
          >
            New Topic
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter - Clickable Buttons */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('general')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'general'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                💬 General
              </button>
              <button
                onClick={() => setCategoryFilter('proposal')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'proposal'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                💡 Ideas
              </button>
              <button
                onClick={() => setCategoryFilter('question')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'question'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                ❓ Q&A
              </button>
              <button
                onClick={() => setCategoryFilter('deliberation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'deliberation'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                ⚖️ Deliberation
              </button>
              <button
                onClick={() => setCategoryFilter('announcement')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'announcement'
                    ? 'bg-joy-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-1'
                }`}
              >
                📢 Announcements
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TopicStatus | 'all')
              }
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-joy-500 bg-bg-1 text-ink-900"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topic List */}
      {sortedTopics.length === 0 ? (
        <div className="text-center py-6 bg-bg-2 rounded-lg border border-border">
          <p className="text-ink-700 mb-2">No topics found</p>
          <p className="text-sm text-ink-400">
            {categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to start a discussion!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              authorName={authorNames[topic.authorId]}
              onClick={onTopicClick ? () => onTopicClick(topic.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 text-sm text-ink-400 text-center">
        Showing {sortedTopics.length} of {topics.length} topics
      </div>
    </div>
  )
}
