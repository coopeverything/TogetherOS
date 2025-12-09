/**
 * MemberDirectory Component
 *
 * Displays group members in a grid layout with optional admin actions
 */

'use client'

import { useState } from 'react'

export interface Member {
  id: string
  handle: string
  displayName: string
  role?: 'admin' | 'coordinator' | 'member'
}

export interface MemberDirectoryProps {
  /** Array of members to display */
  members: Member[]

  /** Optional CSS class name */
  className?: string

  /** Whether current user is admin (enables member removal) */
  isAdmin?: boolean

  /** Current user's ID (to prevent self-removal) */
  currentUserId?: string

  /** Callback when a member is removed */
  onRemoveMember?: (memberId: string) => Promise<void>
}

/**
 * Generate avatar color from member name - uses theme-aware accent colors
 */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-accent-1-bg text-accent-1',
    'bg-accent-2-bg text-accent-2',
    'bg-accent-3-bg text-accent-3',
    'bg-accent-4-bg text-accent-4',
    'bg-joy-200 text-joy-800',
    'bg-brand-bg text-brand-600',
  ]

  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

export function MemberDirectory({
  members,
  className = '',
  isAdmin = false,
  currentUserId,
  onRemoveMember,
}: MemberDirectoryProps) {
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return
    if (!confirm('Are you sure you want to remove this member from the group?')) return

    setRemovingMemberId(memberId)
    try {
      await onRemoveMember(memberId)
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-ink-400">No members yet</p>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-danger-bg text-danger',
    coordinator: 'bg-joy-bg text-joy-700',
    member: 'bg-success-bg text-success',
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map((member) => {
          const initials = member.displayName
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          const avatarColor = getAvatarColor(member.displayName)
          const canRemove =
            isAdmin &&
            onRemoveMember &&
            member.id !== currentUserId &&
            member.role !== 'admin'

          return (
            <div
              key={member.id}
              className="flex flex-col items-center p-3 bg-bg-1 rounded-lg border border-border hover:shadow-md transition-shadow relative group"
            >
              {/* Role badge */}
              {member.role && (
                <span
                  className={`absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium rounded-full ${roleColors[member.role] || roleColors.member}`}
                >
                  {member.role === 'admin' ? '👑' : member.role === 'coordinator' ? '🎯' : ''}
                </span>
              )}

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${avatarColor}`}
              >
                <span className="font-bold text-sm">{initials}</span>
              </div>
              <p className="font-medium text-ink-900 text-center text-sm truncate w-full">
                {member.displayName}
              </p>
              <p className="text-xs text-ink-400 truncate w-full text-center">
                @{member.handle}
              </p>

              {/* Remove button for admins */}
              {canRemove && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                  className="mt-2 px-2 py-1 text-xs text-danger hover:bg-danger-bg rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {removingMemberId === member.id ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
