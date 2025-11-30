'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Topic } from '@togetheros/types/forum'
import { TopicList, TopicComposer, type CreateTopicData } from '@togetheros/ui/forum'

export default function ForumPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState<Topic[]>([])
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill values from URL params (for wiki/article discussion links)
  const initialTitle = searchParams.get('title') || ''
  const initialDescription = searchParams.get('description') || ''

  useEffect(() => {
    fetchTopics()
    fetchCurrentUser()

    // Auto-open composer if title is provided in URL
    if (searchParams.get('newTopic') === 'true' || searchParams.get('title')) {
      setIsComposerOpen(true)
    }
  }, [searchParams])

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.user?.id || null)
      }
    } catch {
      // Not logged in, that's fine
    }
  }

  async function fetchTopics() {
    try {
      setLoading(true)
      const response = await fetch('/api/forum/topics')

      if (!response.ok) {
        throw new Error('Failed to fetch topics')
      }

      const data = await response.json()
      setTopics(data.topics || [])

      // Extract unique author IDs and fetch names
      const authorIds: string[] = Array.from(new Set<string>(data.topics.map((t: Topic) => t.authorId)))
      const names: Record<string, string> = {}

      // For now, use placeholder names (in real implementation, fetch from user API)
      authorIds.forEach((id) => {
        names[id] = `User ${id.slice(0, 8)}`
      })

      setAuthorNames(names)
    } catch (err: any) {
      console.error('Error fetching topics:', err)
      setError(err.message || 'Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  function handleCreateTopic() {
    setIsComposerOpen(true)
  }

  async function handleSubmitTopic(data: CreateTopicData) {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create topic' }))
        throw new Error(errorData.error || 'Failed to create topic')
      }

      const result = await response.json()

      // Close modal and refresh topics
      setIsComposerOpen(false)
      await fetchTopics()

      // Navigate to new topic using slug
      if (result.topic?.slug) {
        router.push(`/forum/${result.topic.slug}`)
      } else if (result.id) {
        // Fallback to ID if slug not available
        router.push(`/forum/${result.id}`)
      }
    } catch (err: any) {
      console.error('Error creating topic:', err)
      alert(err.message || 'Failed to create topic. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleTopicClick(topicId: string) {
    // Find topic to get slug
    const topic = topics.find(t => t.id === topicId)
    if (topic?.slug) {
      router.push(`/forum/${topic.slug}`)
    } else {
      // Fallback to ID
      router.push(`/forum/${topicId}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading topics</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button
            onClick={fetchTopics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats for sidebar
  const hotTopics = topics
    .filter(t => t.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5)

  const trendingTopics = topics
    .filter(t => t.isPinned || t.postCount > 1)
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .slice(0, 5)

  const myTopics = currentUserId
    ? topics
        .filter(t => t.authorId === currentUserId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : []

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div>
            <TopicList
              topics={topics}
              authorNames={authorNames}
              showCreateButton={true}
              onCreateTopic={handleCreateTopic}
              onTopicClick={handleTopicClick}
            />
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-orange-600">🔥</span>
                Trending
              </h3>
              {trendingTopics.length === 0 ? (
                <p className="text-sm text-gray-500">No trending topics yet</p>
              ) : (
                <div className="space-y-2">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {topic.postCount} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hot Topics (Most Comments) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-red-600">💬</span>
                Hot Topics
              </h3>
              {hotTopics.length === 0 ? (
                <p className="text-sm text-gray-500">No active discussions yet</p>
              ) : (
                <div className="space-y-2">
                  {hotTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {topic.postCount} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* My Posts */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                My Posts
              </h3>
              {!currentUserId ? (
                <p className="text-sm text-gray-500">
                  <a href="/login" className="text-blue-600 hover:underline">Sign in</a> to see your posts
                </p>
              ) : myTopics.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You haven't created any topics yet
                </p>
              ) : (
                <div className="space-y-2">
                  {myTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {topic.postCount} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <TopicComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleSubmitTopic}
        isSubmitting={isSubmitting}
        initialTitle={initialTitle}
        initialDescription={initialDescription}
      />
    </>
  )
}
