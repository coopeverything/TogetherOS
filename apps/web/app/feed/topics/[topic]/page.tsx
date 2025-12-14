// apps/web/app/feed/topics/[topic]/page.tsx
// Topic-based feed page (Phase 3: Bridge topic intelligence)

'use client'

import { useState, useEffect } from 'react'
import { PostCard, PostList } from '@togetheros/ui'
import type { Post, ReactionType, ReactionCounts } from '@togetheros/types'
import { useParams, useRouter } from 'next/navigation'

interface PostWithAuthor extends Post {
  authorInfo?: {
    id: string
    name: string
    city?: string
    avatar_url?: string
  } | null
}

export default function TopicFeedPage() {
  const params = useParams()
  const router = useRouter()
  const topic = decodeURIComponent(params.topic as string)

  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType[]>>({})
  const [reactionCounts, setReactionCounts] = useState<Record<string, ReactionCounts>>({})

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const response = await fetch(`/api/feed?topic=${encodeURIComponent(topic)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data.posts || [])

        // Fetch reactions for each post
        const reactionsPromises = (data.posts || []).map(async (post: Post) => {
          try {
            const reactRes = await fetch(`/api/feed/${post.id}/reactions`)
            if (reactRes.ok) {
              const reactData = await reactRes.json()
              return {
                postId: post.id,
                counts: {
                  care: reactData.care || 0,
                  insightful: reactData.insightful || 0,
                  agree: reactData.agree || 0,
                  disagree: reactData.disagree || 0,
                  act: reactData.act || 0,
                  question: reactData.question || 0,
                },
                userReactions: reactData.userReactions || [],
              }
            }
          } catch {
            // Ignore reaction fetch errors
          }
          return { postId: post.id, counts: null, userReactions: [] }
        })

        const reactionsResults = await Promise.all(reactionsPromises)
        const countsMap: Record<string, ReactionCounts> = {}
        const userReactMap: Record<string, ReactionType[]> = {}

        reactionsResults.forEach((r) => {
          if (r.counts) {
            countsMap[r.postId] = r.counts
          }
          userReactMap[r.postId] = r.userReactions
        })

        setReactionCounts(countsMap)
        setUserReactions(userReactMap)
      } catch (err: any) {
        setError(err.message || 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [topic])

  const handleReact = async (postId: string, type: ReactionType) => {
    try {
      const response = await fetch(`/api/feed/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (response.status === 401) {
        // Redirect to login or show message
        return
      }

      if (!response.ok) {
        console.error('Failed to toggle reaction')
        return
      }

      const result = await response.json()

      // Update user reactions
      setUserReactions(prev => {
        const current = prev[postId] || []
        if (result.added) {
          return { ...prev, [postId]: [...current, type] }
        } else {
          return { ...prev, [postId]: current.filter(t => t !== type) }
        }
      })

      // Refresh reaction counts
      const countsRes = await fetch(`/api/feed/${postId}/reactions`)
      if (countsRes.ok) {
        const countsData = await countsRes.json()
        setReactionCounts(prev => ({
          ...prev,
          [postId]: {
            care: countsData.care || 0,
            insightful: countsData.insightful || 0,
            agree: countsData.agree || 0,
            disagree: countsData.disagree || 0,
            act: countsData.act || 0,
            question: countsData.question || 0,
          },
        }))
      }
    } catch (err) {
      console.error('Error toggling reaction:', err)
    }
  }

  const handleDiscuss = (postId: string) => {
    alert(`Opening discussion for post ${postId}. Full implementation in Phase 3+`)
  }

  const handleTopicClick = (clickedTopic: string) => {
    router.push(`/feed/topics/${encodeURIComponent(clickedTopic)}`)
  }

  const handleShowRelated = (postId: string) => {
    alert(`Showing related posts for ${postId}. Bridge similarity search in Phase 3`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0">
        <header className="bg-bg-1 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => router.push('/feed')}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              ← Back to Feed
            </button>
            <div className="animate-pulse mt-4">
              <div className="h-6 bg-bg-2 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-bg-2 rounded w-1/3"></div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-bg-2 rounded"></div>
            <div className="h-32 bg-bg-2 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0">
        <header className="bg-bg-1 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => router.push('/feed')}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              ← Back to Feed
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-4">
          <div className="p-4 bg-danger-bg text-danger-700 rounded-lg">
            {error}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="bg-bg-1 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/feed')}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              ← Back to Feed
            </button>
          </div>
          <h1 className="text-sm font-bold text-ink-900">
            #{topic.replace(/\s+/g, '')}
          </h1>
          <p className="text-ink-700 mt-2">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} about {topic}
          </p>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                authorName={post.authorInfo?.name || 'Unknown'}
                reactionCounts={reactionCounts[post.id] || {
                  care: 0,
                  insightful: 0,
                  agree: 0,
                  disagree: 0,
                  act: 0,
                  question: 0,
                }}
                userReaction={userReactions[post.id]?.[0]}
                onReact={handleReact}
                onDiscuss={handleDiscuss}
                onTopicClick={handleTopicClick}
                onShowRelated={handleShowRelated}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bg-1 rounded-lg border border-border p-12 text-center">
            <p className="text-ink-700 text-sm">
              No posts found for topic "{topic}"
            </p>
            <button
              onClick={() => router.push('/feed')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse All Posts
            </button>
          </div>
        )}
      </main>

      {/* Phase 3 Info Panel */}
      <aside className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-ink-900 mb-2">
            🤖 Phase 3: Bridge Topic Intelligence
          </h3>
          <p className="text-sm text-ink-700">
            This topic feed uses Bridge's semantic understanding to group related posts.
            Future enhancements will include:
          </p>
          <ul className="text-sm text-ink-700 mt-2 space-y-1 list-disc list-inside">
            <li>Smart topic suggestions when creating posts</li>
            <li>Semantic similarity matching (not just keyword matching)</li>
            <li>Related post recommendations</li>
            <li>Topic sentiment analysis and trending topics</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
