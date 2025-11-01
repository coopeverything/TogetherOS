/**
 * Feed Page
 * Social media-style feed with native posts and imported content
 */

'use client'

import { useState, useEffect } from 'react'
import { PostList, PostComposer, type CreatePostData } from '@togetheros/ui'
import type { Post, ReactionType } from '@togetheros/types'
import { InMemoryPostRepo } from '../../../../apps/api/src/modules/feed/repos/InMemoryPostRepo'
import { samplePosts } from '../../../../apps/api/src/modules/feed/fixtures'

// Initialize repo with sample posts
const postRepo = new InMemoryPostRepo(samplePosts)

// Mock author names (matching UUIDs from fixtures)
const authorNames: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'Alice Cooper',
  '00000000-0000-0000-0000-000000000002': 'Bob Martinez',
  '00000000-0000-0000-0000-000000000003': 'Carol Chen',
  '00000000-0000-0000-0000-000000000004': 'Dave Wilson',
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  const [topics, setTopics] = useState<string[]>([])
  const [reactionCounts] = useState<Record<string, any>>({})
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})
  const [composerOpen, setComposerOpen] = useState(false)

  // Load posts
  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const loadedPosts = await postRepo.list({
          topic: selectedTopic,
          limit: 20,
        })
        setPosts(loadedPosts)

        // Load topics
        const loadedTopics = await postRepo.getTopics()
        setTopics(loadedTopics)
      } catch (error) {
        console.error('Failed to load posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
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
    try {
      if (data.type === 'native') {
        await postRepo.createNative({
          authorId: '00000000-0000-0000-0000-000000000001', // Alice
          content: data.content!,
          title: data.title,
          topics: data.topics,
        })
      } else {
        await postRepo.createImport({
          authorId: '00000000-0000-0000-0000-000000000001',
          sourceUrl: data.sourceUrl!,
          topics: data.topics,
          preview: {
            title: 'Imported content',
            platform: 'unknown',
            fetchedAt: new Date(),
          },
        })
      }
      // Reload posts
      const loadedPosts = await postRepo.list({ topic: selectedTopic, limit: 20 })
      setPosts(loadedPosts)
    } catch (error) {
      console.error('Failed to create post:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
              <p className="text-gray-600 mt-1">
                Community posts and imported content
              </p>
            </div>
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors font-medium"
              onClick={() => setComposerOpen(true)}
            >
              + Create Post
            </button>
          </div>

          {/* Topic filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTopic(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedTopic
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Topics
            </button>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTopic === topic
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <PostList
          posts={posts}
          authorNames={authorNames}
          reactionCounts={reactionCounts}
          userReactions={userReactions}
          loading={loading}
          onReact={handleReact}
          onDiscuss={handleDiscuss}
        />

        {/* Info banner */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-800">
              <strong>Phase 2:</strong> Post composer added (native + import). Discussion threads in Phase 3.
            </p>
          </div>
        )}

        {/* Post Composer Modal */}
        <PostComposer
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          onSubmit={handleCreatePost}
          topics={topics}
        />
      </div>
    </div>
  )
}
