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
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editTopicData, setEditTopicData] = useState({ title: '', description: '', category: '', tags: [] as string[] })
  const [editPostContent, setEditPostContent] = useState('')
  const [showTopicControls] = useState(true) // TODO: Check actual user permissions
  const [showPostControls] = useState(true) // TODO: Check actual user permissions
  const [tagInput, setTagInput] = useState('') // For comma-separated tag input
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]) // Autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    params.then(({ topicId }) => setTopicId(topicId))
  }, [params])

  useEffect(() => {
    if (topicId) {
      fetchTopicAndPosts()
      fetchTagSuggestions()
    }
  }, [topicId])

  async function fetchTagSuggestions() {
    try {
      const response = await fetch('/api/admin/forum/tags')
      if (response.ok) {
        const data = await response.json()
        const allTags = data.tags.map((t: { tag: string }) => t.tag)
        setTagSuggestions(allTags)
      }
    } catch (err) {
      // Silently fail - autocomplete is optional
      console.log('Could not fetch tag suggestions:', err)
    }
  }

  // Defensive: Ensure edit data is populated when entering edit mode
  useEffect(() => {
    if (editingTopicId && topic && editingTopicId === topic.id) {
      setEditTopicData({
        title: topic.title,
        description: topic.description || '',
        category: topic.category,
        tags: topic.tags || [],
      })
      // Set tag input as comma-separated string
      setTagInput((topic.tags || []).join(', '))
    }
  }, [editingTopicId, topic])

  useEffect(() => {
    if (editingPostId) {
      const post = posts.find(p => p.id === editingPostId)
      if (post) {
        setEditPostContent(post.content)
      }
    }
  }, [editingPostId, posts])

  async function fetchTopicAndPosts() {
    if (!topicId) return

    try {
      setLoading(true)

      // Fetch topic
      const topicRes = await fetch(`/api/forum/topics/${topicId}`)
      if (!topicRes.ok) throw new Error('Failed to fetch topic')
      const topicData = await topicRes.json()
      setTopic(topicData.topic)

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
          content: newPostContent.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }))
        throw new Error(errorData.error || 'Failed to create post')
      }

      setNewPostContent('')
      await fetchTopicAndPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEditTopic() {
    if (!topic) return
    // Data will be populated by useEffect when editingTopicId changes
    // This prevents race conditions between manual state updates and useEffect
    setEditingTopicId(topic.id)
  }

  async function handleSaveTopicEdit() {
    if (!topicId || !editTopicData.title.trim()) return

    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTopicData.title.trim(),
          description: editTopicData.description.trim() || undefined,
          category: editTopicData.category,
          tags: editTopicData.tags,
        }),
      })

      if (!response.ok) throw new Error('Failed to update topic')

      setEditingTopicId(null)
      setTagInput('') // Clear tag input
      await fetchTopicAndPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to update topic')
    }
  }

  async function handleDeleteTopic() {
    if (!topicId || !confirm('Are you sure you want to delete this topic? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete topic')

      router.push('/forum')
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic')
    }
  }

  function handleEditPost(post: Post) {
    // Data will be populated by useEffect when editingPostId changes
    // This prevents race conditions between manual state updates and useEffect
    setEditingPostId(post.id)
  }

  async function handleSavePostEdit(postId: string) {
    if (!editPostContent.trim()) return

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editPostContent.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to update post')

      setEditingPostId(null)
      setEditPostContent('')
      await fetchTopicAndPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to update post')
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      await fetchTopicAndPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-2 rounded w-3/4"></div>
          <div className="h-20 bg-bg-2 rounded"></div>
          <div className="h-32 bg-bg-2 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-base mt-2">{error || 'Topic not found'}</p>
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
      <div className="bg-bg-1 rounded-lg border border-border p-6 mb-6">
        {editingTopicId === topic.id ? (
          /* Edit Topic Form */
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-ink-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTopicData.title}
                onChange={(e) => setEditTopicData({ ...editTopicData, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-ink-700 mb-2">
                Description
              </label>
              <textarea
                value={editTopicData.description}
                onChange={(e) => setEditTopicData({ ...editTopicData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-ink-700 mb-2">
                Category
              </label>
              <select
                value={editTopicData.category}
                onChange={(e) => setEditTopicData({ ...editTopicData, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              >
                <option value="general">General</option>
                <option value="proposal">Proposal</option>
                <option value="question">Question</option>
                <option value="deliberation">Deliberation</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-base font-medium text-ink-700 mb-2">
                Keywords / Tags
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const value = e.target.value
                  setTagInput(value)

                  // Parse comma-separated tags and update editTopicData
                  const tags = value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                  setEditTopicData({ ...editTopicData, tags })

                  // Show suggestions for the current tag being typed
                  const currentTag = value.split(',').pop()?.trim().toLowerCase() || ''
                  if (currentTag.length > 0) {
                    const filtered = tagSuggestions.filter(
                      tag => tag.toLowerCase().includes(currentTag) && !tags.includes(tag)
                    ).slice(0, 5)
                    setShowSuggestions(filtered.length > 0)
                  } else {
                    setShowSuggestions(false)
                  }
                }}
                onFocus={() => {
                  const currentTag = tagInput.split(',').pop()?.trim().toLowerCase() || ''
                  if (currentTag.length > 0) {
                    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
                    const filtered = tagSuggestions.filter(
                      tag => tag.toLowerCase().includes(currentTag) && !tags.includes(tag)
                    ).slice(0, 5)
                    setShowSuggestions(filtered.length > 0)
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter tags separated by commas (e.g., climate, sustainability, community)"
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
              {showSuggestions && (
                <div className="absolute z-10 mt-1 w-full bg-bg-1 border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {tagSuggestions
                    .filter(tag => {
                      const currentTag = tagInput.split(',').pop()?.trim().toLowerCase() || ''
                      const existingTags = tagInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
                      return tag.toLowerCase().includes(currentTag) && !existingTags.includes(tag)
                    })
                    .slice(0, 5)
                    .map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          const tags = tagInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
                          tags[tags.length - 1] = suggestion
                          const newValue = tags.join(', ')
                          setTagInput(newValue + ', ')
                          setEditTopicData({ ...editTopicData, tags: [...tags, suggestion] })
                          setShowSuggestions(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-bg-2 text-base text-ink-900"
                      >
                        #{suggestion}
                      </button>
                    ))}
                </div>
              )}
              <p className="mt-1 text-sm text-ink-400">
                Separate tags with commas. Start typing to see suggestions from existing tags.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTopicEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTopicId(null)}
                className="px-4 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Topic Display */
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">
                  {topic.title}
                </h1>
                <div className="flex items-center gap-4 text-base text-ink-700">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {topic.category}
                  </span>
                  <span>{topic.postCount} posts</span>
                </div>
              </div>
              {showTopicControls && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleEditTopic}
                    className="px-3 py-1.5 text-base bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTopic}
                    className="px-3 py-1.5 text-base bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {topic.description && (
              <div className="prose prose-sm max-w-none text-ink-700">
                {topic.description}
              </div>
            )}
            {topic.tags && topic.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-bg-2 text-ink-700 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold text-ink-900">
          Discussion ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <div className="bg-bg-0 border border-border rounded-lg p-8 text-center">
            <p className="text-ink-700">No posts yet. Be the first to contribute!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-bg-1 rounded-lg border border-border p-6"
            >
              {editingPostId === post.id ? (
                /* Edit Post Form */
                <div className="space-y-4">
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSavePostEdit(post.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPostId(null)
                        setEditPostContent('')
                      }}
                      className="px-4 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Post Display */
                <>
                  <div className="prose prose-sm max-w-none">
                    {post.content.split('\n').map((line, i) => (
                      <p key={i} className="text-ink-900">
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-base text-ink-700">
                      <span>Posted {new Date(post.createdAt).toLocaleString()}</span>
                      <div className="flex items-center gap-4">
                        {post.replyCount > 0 && <span>{post.replyCount} replies</span>}
                        {showPostControls && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Post Composer */}
      <div className="bg-bg-1 rounded-lg border border-border p-6">
        <h3 className="text-xl font-semibold text-ink-900 mb-4">
          Add Your Thoughts
        </h3>
        <form onSubmit={handleSubmitPost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your perspective, ask questions, or add insights..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            disabled={isSubmitting}
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-ink-400">
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
