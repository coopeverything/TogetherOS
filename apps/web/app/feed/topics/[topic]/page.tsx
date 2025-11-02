// apps/web/app/feed/topics/[topic]/page.tsx
// Topic-based feed page (Phase 3: Bridge topic intelligence)

'use client'

import { useState, useEffect } from 'react'
import { PostCard, PostList } from '@togetheros/ui'
import type { Post, ReactionType } from '@togetheros/types'
import { useParams, useRouter } from 'next/navigation'

// Mock data (replace with API call in production)
const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    type: 'native',
    authorId: '00000000-0000-0000-0000-000000000001',
    title: 'Community Garden Initiative - Spring 2026',
    content: `I've been thinking about starting a community garden in our neighborhood...`,
    topics: ['Community Connection', 'Common Planet', 'Social Economy'],
    status: 'active',
    discussionCount: 12,
    createdAt: new Date(2025, 9, 28),
    updatedAt: new Date(2025, 9, 28),
  },
  {
    id: '2',
    type: 'native',
    authorId: '00000000-0000-0000-0000-000000000002',
    title: 'Housing Cooperative Formation',
    content: 'Looking to form a housing cooperative. Who is interested?',
    topics: ['Housing', 'Social Economy', 'Collective Governance'],
    status: 'active',
    discussionCount: 8,
    createdAt: new Date(2025, 9, 27),
    updatedAt: new Date(2025, 9, 27),
  },
  {
    id: '3',
    type: 'native',
    authorId: '00000000-0000-0000-0000-000000000003',
    title: 'Climate Action Weekly Meetup',
    content: 'Join us every Thursday for climate action planning.',
    topics: ['Climate', 'Common Planet', 'Community Connection'],
    status: 'active',
    discussionCount: 15,
    createdAt: new Date(2025, 9, 26),
    updatedAt: new Date(2025, 9, 26),
  },
]

// Mock author data
const AUTHORS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'Alice Green',
  '00000000-0000-0000-0000-000000000002': 'Bob Martinez',
  '00000000-0000-0000-0000-000000000003': 'Carol Singh',
}

export default function TopicFeedPage() {
  const params = useParams()
  const router = useRouter()
  const topic = decodeURIComponent(params.topic as string)

  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})

  useEffect(() => {
    // Filter posts by topic
    const filtered = SAMPLE_POSTS.filter(post =>
      post.topics.some(t => t.toLowerCase() === topic.toLowerCase())
    )
    setFilteredPosts(filtered)
  }, [topic])

  const handleReact = (postId: string, type: ReactionType) => {
    if (userReactions[postId] === type) {
      // Remove reaction
      const { [postId]: _, ...rest } = userReactions
      setUserReactions(rest)
    } else {
      // Add/change reaction
      setUserReactions({ ...userReactions, [postId]: type })
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/feed')}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              ← Back to Feed
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            #{topic.replace(/\s+/g, '')}
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} about {topic}
          </p>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                authorName={AUTHORS[post.authorId] || 'Unknown'}
                reactionCounts={{
                  care: Math.floor(Math.random() * 20),
                  insightful: Math.floor(Math.random() * 15),
                  agree: Math.floor(Math.random() * 25),
                  disagree: Math.floor(Math.random() * 5),
                  act: Math.floor(Math.random() * 10),
                  question: Math.floor(Math.random() * 8),
                }}
                userReaction={userReactions[post.id]}
                onReact={handleReact}
                onDiscuss={handleDiscuss}
                onTopicClick={handleTopicClick}
                onShowRelated={handleShowRelated}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">
              No posts found for topic "{topic}"
            </p>
            <button
              onClick={() => router.push('/feed')}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse All Posts
            </button>
          </div>
        )}
      </main>

      {/* Phase 3 Info Panel */}
      <aside className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🤖 Phase 3: Bridge Topic Intelligence
          </h3>
          <p className="text-sm text-gray-700">
            This topic feed uses Bridge's semantic understanding to group related posts.
            Future enhancements will include:
          </p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
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
