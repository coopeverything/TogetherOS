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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Discussions</h1>
        {showCreateButton && onCreateTopic && (
          <button
            onClick={onCreateTopic}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            New Topic
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter - Clickable Buttons */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('general')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'general'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                💬 General
              </button>
              <button
                onClick={() => setCategoryFilter('proposal')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'proposal'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                💡 Ideas
              </button>
              <button
                onClick={() => setCategoryFilter('question')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'question'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ❓ Q&A
              </button>
              <button
                onClick={() => setCategoryFilter('deliberation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'deliberation'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⚖️ Deliberation
              </button>
              <button
                onClick={() => setCategoryFilter('announcement')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === 'announcement'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📢 Announcements
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TopicStatus | 'all')
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-2">No topics found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to start a discussion!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Showing {sortedTopics.length} of {topics.length} topics
      </div>
    </div>
  )
}
