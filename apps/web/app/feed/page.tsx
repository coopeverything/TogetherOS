/**
 * Feed Page
 * Social media-style feed with native posts and imported content
 */

'use client'

import { useState, useEffect } from 'react'
import { PostList, PostComposerUnified, GroupGrowthTracker, InvitationModal, type CreatePostData, type InvitationData } from '@togetheros/ui'
import { AVAILABLE_TOPICS } from '@togetheros/types'
import type { Post, ReactionType } from '@togetheros/types'

interface AuthorInfo {
  id: string
  name?: string
  city?: string
  avatar_url?: string
}

// Author info cache (populated from API responses)
const authorInfoCache = new Map<string, AuthorInfo>()

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  const [reactionCounts] = useState<Record<string, any>>({})
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})
  const [composerOpen, setComposerOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  // Load current user
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.user?.id)
        }
      } catch (err) {
        console.error('Failed to load current user:', err)
      }
    }
    loadUser()
  }, [])

  // Load posts
  useEffect(() => {
    const abortController = new AbortController()

    async function loadPosts() {
      setLoading(true)
      setError(null)
      try {
        // Build query params
        const params = new URLSearchParams({
          limit: '20',
          offset: '0',
        })
        if (selectedTopic) {
          params.set('topic', selectedTopic)
        }

        // Fetch from API with abort signal
        const response = await fetch(`/api/feed?${params.toString()}`, {
          signal: abortController.signal,
        })
        if (!response.ok) {
          throw new Error(`Failed to load posts: ${response.statusText}`)
        }

        const data = await response.json()

        // Only update state if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setPosts(data.posts || [])

          // Build author names map from author info in posts
          if (data.posts) {
            const names: Record<string, string> = {}
            data.posts.forEach((post: any) => {
              if (post.authorInfo) {
                // Cache author info
                authorInfoCache.set(post.authorId, post.authorInfo)

                // Build display name (name + city if available)
                let displayName = post.authorInfo.name || 'Anonymous'
                if (post.authorInfo.city) {
                  displayName += ` • ${post.authorInfo.city}`
                }
                names[post.authorId] = displayName
              }
            })
            setAuthorNames(names)
          }
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Failed to load posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadPosts()

    // Cleanup: abort pending request when selectedTopic changes
    return () => {
      abortController.abort()
    }
  }, [selectedTopic])

  // Handle reaction
  const handleReact = (postId: string, type: ReactionType) => {
    // Toggle reaction
    if (userReactions[postId] === type) {
      // Remove reaction
      const newReactions = { ...userReactions }
      delete newReactions[postId]
      setUserReactions(newReactions)
    } else {
      // Add/change reaction
      setUserReactions({
        ...userReactions,
        [postId]: type,
      })
    }
  }

  // Handle discuss (placeholder)
  const handleDiscuss = (postId: string) => {
    alert(`Discussion threads coming in Phase 3! Post ID: ${postId}`)
  }

  // Handle create post
  const handleCreatePost = async (data: CreatePostData) => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create post: ${response.statusText}`)
      }

      // Close composer on success
      setComposerOpen(false)

      // Reload posts to include the new post
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
      })
      if (selectedTopic) {
        params.set('topic', selectedTopic)
      }

      const listResponse = await fetch(`/api/feed?${params.toString()}`)
      if (listResponse.ok) {
        const listData = await listResponse.json()
        setPosts(listData.posts || [])

        // Update author names
        if (listData.posts) {
          const names: Record<string, string> = {}
          listData.posts.forEach((post: any) => {
            if (post.authorInfo) {
              authorInfoCache.set(post.authorId, post.authorInfo)
              let displayName = post.authorInfo.name || 'Anonymous'
              if (post.authorInfo.city) {
                displayName += ` • ${post.authorInfo.city}`
              }
              names[post.authorId] = displayName
            }
          })
          setAuthorNames(names)
        }
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post. Please try again.'
      setError(errorMessage)
      alert(errorMessage)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Handle invitation submission
  const handleInviteSubmit = async (data: InvitationData) => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Invitation sent:', data)
      // Success handled by modal (shows success state)
    } catch (err) {
      console.error('Failed to send invitation:', err)
      throw err // Modal will display error
    }
  }

  // Handle delete post
  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // Remove post from UI
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  // Handle edit post
  const handleEdit = async (postId: string) => {
    alert('Edit functionality coming soon!')
    // TODO: Open edit modal with post data
  }

  return (
    <div className="min-h-screen bg-bg-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
        {/* Two-column grid layout: Feed (left) + Sidebar (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main feed content - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-sm font-bold text-ink-900">Feed</h1>
                  <p className="text-ink-400 mt-1">
                    Community posts and imported content
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-joy-500 text-white rounded-full hover:bg-joy-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setComposerOpen(true)}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : '+ Create Post'}
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>

            {/* Feed */}
            <PostList
              posts={posts}
              authorNames={authorNames}
              reactionCounts={reactionCounts}
              userReactions={userReactions}
              loading={loading}
              currentUserId={currentUserId}
              onReact={handleReact}
              onDiscuss={handleDiscuss}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />

            {/* Info banner */}
            {!loading && posts.length > 0 && (
              <div className="mt-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800 p-4">
                <p className="text-sm text-brand-800 dark:text-brand-200">
                  <strong>Phase 2:</strong> Post composer added (native + import). Discussion threads in Phase 3.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width on large screens, hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <GroupGrowthTracker
                groupId="seattle-local"
                currentMemberCount={47}
                recentGrowth={3}
                location="Seattle"
                onInvite={() => setInviteModalOpen(true)}
              />
            </div>
          </aside>
        </div>

        {/* Post Composer Modal */}
        <PostComposerUnified
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          onSubmit={handleCreatePost}
          topics={AVAILABLE_TOPICS}
        />

        {/* Invitation Modal */}
        <InvitationModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSubmit={handleInviteSubmit}
          groupId="seattle-local"
          location="Seattle"
          rewardPoints={100}
        />
      </div>
    </div>
  )
}
