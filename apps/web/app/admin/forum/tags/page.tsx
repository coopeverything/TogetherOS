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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Forum Tag Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage and correct forum tags/keywords. Changes apply across all topics.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No tags found in forum topics
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map(({ tag, count }) => (
              <div
                key={tag}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                      className="flex-1 px-3 py-1 border border-blue-500 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={renaming}
                      autoFocus
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
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
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                        #{tag}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Used in {count} topic{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditClick(tag)}
                      className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          About Tag Management
        </h2>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Renaming a tag updates it across ALL topics that use it</li>
          <li>• Corrected tags will appear in autocomplete suggestions when users create/edit topics</li>
          <li>• Tags are case-sensitive - "Climate" and "climate" are different</li>
          <li>• Consider using consistent capitalization for better discoverability</li>
        </ul>
      </div>
    </div>
  )
}
