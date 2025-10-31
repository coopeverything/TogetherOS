/**
 * GroupCard Component
 *
 * Display card for a single group in list views.
 * Shows key info: name, handle, type, member count, location, description.
 */

'use client'

import type { Group } from '@togetheros/types/groups'

export interface GroupCardProps {
  /** Group data to display */
  group: Group

  /** Show join button */
  showJoinButton?: boolean

  /** Callback when join button clicked */
  onJoin?: (groupId: string) => void

  /** Optional CSS class name */
  className?: string
}

/**
 * Generate avatar color from group name
 */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-orange-200 text-orange-800',
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-purple-200 text-purple-800',
    'bg-pink-200 text-pink-800',
    'bg-yellow-200 text-yellow-800',
  ]

  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

/**
 * Get badge color for group type
 */
function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'local':
      return 'bg-green-100 text-green-800'
    case 'thematic':
      return 'bg-blue-100 text-blue-800'
    case 'federated':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Format group type for display
 */
function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function GroupCard({
  group,
  showJoinButton = false,
  onJoin,
  className = '',
}: GroupCardProps) {
  const avatarColor = getAvatarColor(group.name)
  const typeBadgeColor = getTypeBadgeColor(group.type)
  const initials = group.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header: Avatar + Name + Type Badge */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor}`}
        >
          <span className="font-bold text-sm">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
          <p className="text-sm text-gray-500">@{group.handle}</p>
        </div>

        <span
          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${typeBadgeColor}`}
        >
          {formatType(group.type)}
        </span>
      </div>

      {/* Member count and location */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <span>{group.members.length} members</span>
        {group.location && <span>📍 {group.location}</span>}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {group.description}
        </p>
      )}

      {/* Action button */}
      <div className="mt-4">
        {showJoinButton && onJoin ? (
          <button
            onClick={() => onJoin(group.id)}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Join Group
          </button>
        ) : (
          <a
            href={`/groups/${group.id}`}
            className="block w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium text-center"
          >
            View Group
          </a>
        )}
      </div>
    </div>
  )
}
