/**
 * MemberDirectory Component
 *
 * Displays group members in a grid layout
 */

'use client'

export interface Member {
  id: string
  handle: string
  displayName: string
}

export interface MemberDirectoryProps {
  /** Array of members to display */
  members: Member[]

  /** Optional CSS class name */
  className?: string
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

export function MemberDirectory({ members, className = '' }: MemberDirectoryProps) {
  if (members.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-ink-400">No members yet</p>
      </div>
    )
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

          return (
            <div
              key={member.id}
              className="flex flex-col items-center p-3 bg-bg-1 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
