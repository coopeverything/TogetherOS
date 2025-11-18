'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Topic } from '@togetheros/types/forum'

interface Post {
  id: string
  topicId: string
  authorId: string
  content: string
  replyCount: number
  createdAt: string
  updatedAt: string
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const router = useRouter()
  const [topicId, setTopicId] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    params.then(({ topicId }) => setTopicId(topicId))
  }, [params])

  useEffect(() => {
    if (topicId) {
      fetchTopicAndPosts()
    }
  }, [topicId])

  async function fetchTopicAndPosts() {
    if (!topicId) return

    try {
      setLoading(true)

      // Fetch topic
      const topicRes = await fetch(`/api/forum/topics/${topicId}`)
      if (!topicRes.ok) throw new Error('Failed to fetch topic')
      const topicData = await topicRes.json()
      setTopic(topicData)

      // Fetch posts
      const postsRes = await fetch(`/api/forum/topics/${topicId}/posts`)
      if (!postsRes.ok) throw new Error('Failed to fetch posts')
      const postsData = await postsRes.json()
      setPosts(postsData.posts || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() || !topicId) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/forum/topics/${topicId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: 'temp-user-id', // TODO: Get from auth
          content: newPostContent.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to create post')

      setNewPostContent('')
      await fetchTopicAndPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-2">{error || 'Topic not found'}</p>
          <button
            onClick={() => router.push('/forum')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Forum
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Topic Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {topic.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                {topic.category}
              </span>
              <span>{topic.postCount} posts</span>
            </div>
          </div>
        </div>
        {topic.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            {topic.description}
          </div>
        )}
        {topic.tags && topic.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Discussion ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No posts yet. Be the first to contribute!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {post.content.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-900 dark:text-gray-100">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Posted {new Date(post.createdAt).toLocaleString()}</span>
                  {post.replyCount > 0 && <span>{post.replyCount} replies</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Composer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Add Your Thoughts
        </h3>
        <form onSubmit={handleSubmitPost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your perspective, ask questions, or add insights..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            disabled={isSubmitting}
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {newPostContent.length} / 5000 characters
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !newPostContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
