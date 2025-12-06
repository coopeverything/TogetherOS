/**
 * PostCard Component
 *
 * Display card for a single feed post (native or imported).
 * Shows content, reactions, discussion status.
 */

'use client'

import type { Post, ReactionType } from '@togetheros/types'
import { UrlPreviewCard } from './UrlPreviewCard'

export interface PostCardProps {
  /** Post data to display */
  post: Post

  /** Author name (from user data) */
  authorName: string

  /** Current user ID (for showing edit/delete buttons) */
  currentUserId?: string

  /** Reaction counts by type */
  reactionCounts?: {
    care: number
    insightful: number
    agree: number
    disagree: number
    act: number
    question: number
  }

  /** Current user's reaction (if any) */
  userReaction?: ReactionType

  /** Callback when reaction clicked */
  onReact?: (postId: string, type: ReactionType) => void

  /** Callback when discuss button clicked */
  onDiscuss?: (postId: string) => void

  /** Callback when topic clicked (Phase 3: topic filtering) */
  onTopicClick?: (topic: string) => void

  /** Callback when "Show related" clicked (Phase 3: Bridge intelligence) */
  onShowRelated?: (postId: string) => void

  /** Callback when delete button clicked */
  onDelete?: (postId: string) => void

  /** Callback when edit button clicked */
  onEdit?: (postId: string) => void

  /** Optional CSS class name */
  className?: string
}

/**
 * Format timestamp for display
 * Handles both Date objects and ISO date strings
 */
function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return dateObj.toLocaleDateString()
}

/**
 * Get platform badge color
 */
function getPlatformColor(type: string): string {
  switch (type) {
    case 'native':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    case 'instagram':
      return 'bg-pink-100 text-pink-800'
    case 'tiktok':
      return 'bg-black text-white'
    case 'twitter':
      return 'bg-blue-100 text-blue-800'
    case 'facebook':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

export function PostCard({
  post,
  authorName,
  currentUserId,
  reactionCounts = {
    care: 0,
    insightful: 0,
    agree: 0,
    disagree: 0,
    act: 0,
    question: 0,
  },
  userReaction,
  onReact,
  onDiscuss,
  onTopicClick,
  onShowRelated,
  onDelete,
  onEdit,
  className = '',
}: PostCardProps) {
  const platformColor = getPlatformColor(post.type)
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-orange-800 font-bold text-base">
            {authorName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">{authorName}</span>
            {post.type !== 'native' && (
              <span className={`px-3 py-0.5 rounded text-sm font-medium ${platformColor}`}>
                {post.type}
              </span>
            )}
            <span className="text-base text-gray-500">{formatTimeAgo(post.createdAt)}</span>
          </div>
          {/* Topics (Phase 3: clickable for filtering) */}
          <div className="flex gap-1 mt-1 flex-wrap items-center">
            {post.topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onTopicClick?.(topic)}
                className="text-sm text-orange-600 hover:underline cursor-pointer hover:text-orange-800 transition-colors"
                title={`Filter by ${topic}`}
              >
                #{topic.replace(/\s+/g, '')}
              </button>
            ))}
            {onShowRelated && post.topics.length > 0 && (
              <button
                type="button"
                onClick={() => onShowRelated(post.id)}
                className="ml-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                title="Show related posts"
              >
                🔗 Show related
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.type === 'native' ? (
        <div className="mb-4">
          {post.title && (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
          )}
          {post.content && (
            <p className="text-gray-700 whitespace-pre-line mb-3">{post.content}</p>
          )}
          {/* Embedded URL previews */}
          {post.embeddedUrls && post.embeddedUrls.length > 0 && (
            <div className="space-y-3">
              {post.embeddedUrls.map((embedded, idx) => (
                <UrlPreviewCard
                  key={idx}
                  url={embedded.url}
                  preview={embedded.preview}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Import preview
        post.sourcePreview && (
          <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {post.sourcePreview.thumbnailUrl && (
              <img
                src={post.sourcePreview.thumbnailUrl}
                alt={post.sourcePreview.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {post.sourcePreview.title}
              </h4>
              {post.sourcePreview.description && (
                <p className="text-base text-gray-600 mb-2">
                  {post.sourcePreview.description}
                </p>
              )}
              {post.sourcePreview.authorName && (
                <p className="text-sm text-gray-500">
                  by {post.sourcePreview.authorName}
                </p>
              )}
              {post.sourceUrl && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:underline mt-2 inline-block"
                >
                  View original →
                </a>
              )}
            </div>
          </div>
        )
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {/* Edit/Delete buttons (owner only) */}
        {currentUserId && currentUserId === post.authorId && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(post.id)}
                className="px-3 py-1.5 rounded-full text-base bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Edit post"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    onDelete(post.id)
                  }
                }}
                className="px-3 py-1.5 rounded-full text-base bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                title="Delete post"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}

        {/* Reaction buttons */}
        <div className="flex gap-1">
          {(['care', 'insightful', 'agree', 'act'] as ReactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => onReact?.(post.id, type)}
              className={`px-3 py-1.5 rounded-full text-base transition-colors ${
                userReaction === type
                  ? 'bg-orange-100 text-orange-800 font-medium'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
              }`}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              {type === 'care' && '❤️'}
              {type === 'insightful' && '💡'}
              {type === 'agree' && '✓'}
              {type === 'act' && '⚡'}
              {reactionCounts[type] > 0 && (
                <span className="ml-1">{reactionCounts[type]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Discuss button */}
        <button
          onClick={() => onDiscuss?.(post.id)}
          className="ml-auto px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-base font-medium text-gray-700 transition-colors"
        >
          💬 Discuss
          {post.discussionCount > 0 && (
            <span className="ml-1">({post.discussionCount})</span>
          )}
        </button>
      </div>

      {totalReactions > 0 && (
        <div className="text-sm text-gray-500 mt-2">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </div>
      )}
    </div>
  )
}
