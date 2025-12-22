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

  // Pre-fill values from URL params (for wiki/article discussion links or proposals)
  const initialTitle = searchParams.get('title') || ''
  const initialDescription = searchParams.get('description') || ''
  const initialCategory = searchParams.get('category') || 'general'
  const proposalId = searchParams.get('proposalId') || ''

  useEffect(() => {
    fetchTopics()
    fetchCurrentUser()

    // Auto-open composer if new=true or title is provided in URL
    if (searchParams.get('new') === 'true' || searchParams.get('newTopic') === 'true' || searchParams.get('title')) {
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
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-10 bg-bg-2 rounded w-64 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-bg-2 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="bg-danger-bg border border-danger rounded-lg p-4 text-center">
          <p className="text-danger font-medium">Error loading topics</p>
          <p className="text-danger text-sm mt-2">{error}</p>
          <button
            onClick={fetchTopics}
            className="mt-4 px-4 py-2 bg-danger text-white rounded-md hover:opacity-90 transition-colors"
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
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
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
          <aside className="space-y-2">
            {/* Trending Topics */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                <span className="text-joy-600">🔥</span>
                Trending
              </h3>
              {trendingTopics.length === 0 ? (
                <p className="text-sm text-ink-400">No trending topics yet</p>
              ) : (
                <div className="space-y-2">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-bg-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="text-sm font-medium text-ink-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-ink-400 mt-1">
                        {topic.postCount} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hot Topics (Most Comments) */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                <span className="text-danger">💬</span>
                Hot Topics
              </h3>
              {hotTopics.length === 0 ? (
                <p className="text-sm text-ink-400">No active discussions yet</p>
              ) : (
                <div className="space-y-2">
                  {hotTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-bg-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="text-sm font-medium text-ink-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-ink-400 mt-1">
                        {topic.postCount} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* My Posts */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                <span className="text-brand-600">📝</span>
                My Posts
              </h3>
              {!currentUserId ? (
                <p className="text-sm text-ink-400">
                  <a href="/login" className="text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">Sign in</a> to see your posts
                </p>
              ) : myTopics.length === 0 ? (
                <p className="text-sm text-ink-400">
                  You haven't created any topics yet
                </p>
              ) : (
                <div className="space-y-2">
                  {myTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="block w-full text-left p-2 rounded hover:bg-bg-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="text-sm font-medium text-ink-900 line-clamp-2">
                        {topic.title}
                      </div>
                      <div className="text-xs text-ink-400 mt-1">
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
        initialCategory={initialCategory as any}
      />
    </>
  )
}
