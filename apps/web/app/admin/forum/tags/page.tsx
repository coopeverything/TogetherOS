'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TagWithCount {
  tag: string
  count: number
}

export default function AdminForumTagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [creatingTag, setCreatingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter existing tags that match input
  const suggestions = newTag.trim()
    ? tags.filter(t =>
        t.tag.toLowerCase().includes(newTag.toLowerCase()) &&
        t.tag !== newTag.trim()
      ).slice(0, 5)
    : []

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/forum/tags')

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch tags')
      }

      const data = await response.json()
      setTags(data.tags || [])
    } catch (err: any) {
      console.error('Error fetching tags:', err)
      setError(err.message || 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  function handleEditClick(tag: string) {
    setEditingTag(tag)
    setNewTagName(tag)
  }

  function handleCancelEdit() {
    setEditingTag(null)
    setNewTagName('')
  }

  async function handleRenameTag(oldTag: string) {
    if (!newTagName.trim() || newTagName.trim() === oldTag) {
      handleCancelEdit()
      return
    }

    if (!confirm(`Rename "${oldTag}" to "${newTagName.trim()}" across all topics?`)) {
      return
    }

    try {
      setRenaming(true)

      const response = await fetch('/api/admin/forum/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldTag,
          newTag: newTagName.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to rename tag' }))
        throw new Error(errorData.error || 'Failed to rename tag')
      }

      const result = await response.json()
      alert(result.message || 'Tag renamed successfully')

      // Refresh tags list
      handleCancelEdit()
      await fetchTags()
    } catch (err: any) {
      console.error('Error renaming tag:', err)
      alert(err.message || 'Failed to rename tag')
    } finally {
      setRenaming(false)
    }
  }

  async function handleDeleteTag(tag: string) {
    if (!confirm(`Delete "${tag}" from all topics? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(tag)

      const response = await fetch('/api/admin/forum/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete tag' }))
        throw new Error(errorData.error || 'Failed to delete tag')
      }

      const result = await response.json()
      alert(result.message || 'Tag deleted successfully')

      // Refresh tags list
      await fetchTags()
    } catch (err: any) {
      console.error('Error deleting tag:', err)
      alert(err.message || 'Failed to delete tag')
    } finally {
      setDeleting(null)
    }
  }

  async function handleCreateTag() {
    const trimmedTag = newTag.trim()

    if (!trimmedTag) {
      return
    }

    // Check if tag already exists
    if (tags.some(t => t.tag === trimmedTag)) {
      return
    }

    try {
      setCreatingTag(true)

      const response = await fetch('/api/admin/forum/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: trimmedTag }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create tag' }))
        throw new Error(errorData.error || 'Failed to create tag')
      }

      const result = await response.json()

      // Show success message and auto-dismiss after 1 second
      setSuccessMessage(result.message || `Tag "${trimmedTag}" created`)
      setTimeout(() => setSuccessMessage(null), 1000)

      // Clear input and refresh tags list
      setNewTag('')
      await fetchTags()
    } catch (err: any) {
      console.error('Error creating tag:', err)
      alert(err.message || 'Failed to create tag')
    } finally {
      setCreatingTag(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-bg-2 rounded w-64"></div>
          <div className="h-64 bg-bg-2 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button
            onClick={() => fetchTags()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="mb-3">
        <h1 className="text-sm font-bold text-ink-900">
          Forum Tag Management
        </h1>
        <p className="text-ink-400 mt-2">
          Manage and correct forum tags/keywords. Changes apply across all topics.
        </p>
      </div>

      {/* Success Message Toast */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-center font-medium">
          {successMessage}
        </div>
      )}

      {/* Create New Tag Form */}
      <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-green-900 mb-3">
          Create New Tag
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTag()
                if (e.key === 'Escape') setShowSuggestions(false)
              }}
              placeholder="Enter tag name (e.g., climate-action)"
              className="w-full px-3 py-2 border border-green-300 rounded-md bg-bg-1 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={creatingTag}
            />
            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-bg-1 border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                <div className="px-3 py-1 text-xs text-ink-400 border-b border-border">
                  Existing tags:
                </div>
                {suggestions.map(({ tag, count }) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setNewTag(tag)
                      setShowSuggestions(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-bg-2 flex justify-between items-center"
                  >
                    <span className="text-ink-900">#{tag}</span>
                    <span className="text-xs text-ink-400">{count} topics</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCreateTag}
            disabled={creatingTag || !newTag.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {creatingTag ? 'Creating...' : 'Create Tag'}
          </button>
        </div>
        <p className="text-xs text-green-800 mt-2">
          Creating a tag makes it available in autocomplete suggestions. Note: The tag will appear with count 0 until used by a topic.
        </p>
      </div>

      <div className="bg-bg-1 rounded-lg border border-border">
        {tags.length === 0 ? (
          <div className="p-4 text-center text-ink-400">
            No tags found in forum topics
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tags.map(({ tag, count }) => (
              <div
                key={tag}
                className="p-4 hover:bg-bg-2 transition-colors"
              >
                {editingTag === tag ? (
                  /* Edit Mode */
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameTag(tag)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="flex-1 px-3 py-1 border border-blue-500 rounded-md bg-bg-1 text-ink-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={renaming}
                      autoFocus
                    />
                    <span className="text-sm text-ink-400 min-w-[80px]">
                      {count} topic{count !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => handleRenameTag(tag)}
                      disabled={renaming}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {renaming ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={renaming}
                      className="px-3 py-1 bg-bg-2 text-ink-900 text-sm rounded-md hover:bg-bg-1 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        #{tag}
                      </span>
                      <span className="text-sm text-ink-400">
                        Used in {count} topic{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(tag)}
                        disabled={deleting === tag}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        disabled={deleting === tag}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                      >
                        {deleting === tag ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">
          About Tag Management
        </h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Renaming a tag updates it across ALL topics that use it</li>
          <li>• Corrected tags will appear in autocomplete suggestions when users create/edit topics</li>
          <li>• Tags are case-sensitive - "Climate" and "climate" are different</li>
          <li>• Consider using consistent capitalization for better discoverability</li>
        </ul>
      </div>
    </div>
  )
}
