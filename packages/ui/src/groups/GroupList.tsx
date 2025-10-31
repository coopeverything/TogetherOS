/**
 * GroupList Component
 *
 * Filterable, sortable list of groups with pagination.
 */

'use client'

import { useState } from 'react'
import type { Group, GroupFilters } from '@togetheros/types/groups'
import { GroupCard } from './GroupCard'

export interface GroupListProps {
  /** Groups to display */
  groups: Group[]

  /** Show join buttons on cards */
  showJoinButtons?: boolean

  /** Callback when join button clicked */
  onJoin?: (groupId: string) => void

  /** Optional CSS class name */
  className?: string
}

export function GroupList({
  groups,
  showJoinButtons = false,
  onJoin,
  className = '',
}: GroupListProps) {
  const [filters, setFilters] = useState<Partial<GroupFilters>>({
    type: undefined,
    search: '',
    sortBy: 'newest',
  })

  // Apply client-side filters
  let filteredGroups = [...groups]

  // Type filter
  if (filters.type) {
    filteredGroups = filteredGroups.filter((g) => g.type === filters.type)
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase()
    filteredGroups = filteredGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchLower) ||
        g.handle.toLowerCase().includes(searchLower) ||
        g.description?.toLowerCase().includes(searchLower)
    )
  }

  // Sort
  filteredGroups.sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'most_members':
        return b.members.length - a.members.length
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search groups..."
              value={filters.search || ''}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All types</option>
              <option value="local">Local</option>
              <option value="thematic">Thematic</option>
              <option value="federated">Federated</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_members">Most members</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'} found
        </p>
      </div>

      {/* Groups grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              showJoinButton={showJoinButtons}
              onJoin={onJoin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No groups found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  )
}
