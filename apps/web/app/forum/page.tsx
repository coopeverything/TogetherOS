'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Topic } from '@togetheros/types/forum'
import { TopicList, TopicComposer, type CreateTopicData } from '@togetheros/ui/forum'

export default function ForumPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

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

      // Navigate to new topic
      if (result.id) {
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
    router.push(`/forum/${topicId}`)
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

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TopicList
          topics={topics}
          authorNames={authorNames}
          showCreateButton={true}
          onCreateTopic={handleCreateTopic}
          onTopicClick={handleTopicClick}
        />
      </div>

      <TopicComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleSubmitTopic}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
