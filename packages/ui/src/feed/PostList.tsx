/**
 * PostList Component
 *
 * Display list of feed posts with infinite scroll support.
 */

'use client'

import { PostCard } from './PostCard'
import type { Post, ReactionType } from '@togetheros/types'

export interface PostListProps {
  /** Array of posts to display */
  posts: Post[]

  /** Map of author IDs to names */
  authorNames: Record<string, string>

  /** Reaction counts by post ID */
  reactionCounts?: Record<string, {
    care: number
    insightful: number
    agree: number
    disagree: number
    act: number
    question: number
  }>

  /** Current user's reactions by post ID */
  userReactions?: Record<string, ReactionType>

  /** Current user ID (for showing edit/delete buttons) */
  currentUserId?: string

  /** Loading state */
  loading?: boolean

  /** Callback when reaction clicked */
  onReact?: (postId: string, type: ReactionType) => void

  /** Callback when discuss button clicked */
  onDiscuss?: (postId: string) => void

  /** Callback when delete button clicked */
  onDelete?: (postId: string) => void

  /** Callback when edit button clicked */
  onEdit?: (postId: string) => void

  /** Callback to load more (for infinite scroll) */
  onLoadMore?: () => void

  /** Has more posts to load */
  hasMore?: boolean

  /** Optional CSS class name */
  className?: string
}

export function PostList({
  posts,
  authorNames,
  reactionCounts = {},
  userReactions = {},
  currentUserId,
  loading = false,
  onReact,
  onDiscuss,
  onDelete,
  onEdit,
  onLoadMore,
  hasMore = false,
  className = '',
}: PostListProps) {
  // Empty state
  if (posts.length === 0 && !loading) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="text-ink-400 text-sm mb-4">📭</div>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">No posts yet</h3>
        <p className="text-ink-700">Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Posts */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          authorName={authorNames[post.authorId] || 'Unknown'}
          reactionCounts={reactionCounts[post.id]}
          userReaction={userReactions[post.id]}
          currentUserId={currentUserId}
          onReact={onReact}
          onDiscuss={onDiscuss}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-bg-2 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-bg-2 rounded w-24 mb-2" />
                  <div className="h-3 bg-bg-2 rounded w-32" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-bg-2 rounded w-full" />
                <div className="h-3 bg-bg-2 rounded w-5/6" />
                <div className="h-3 bg-bg-2 rounded w-4/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-bg-2 rounded-full w-16" />
                <div className="h-8 bg-bg-2 rounded-full w-16" />
                <div className="h-8 bg-bg-2 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-brand-600 text-bg-1 rounded-full hover:bg-brand-500 transition-colors font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
