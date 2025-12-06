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
 * Generate avatar color from member name
 */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-purple-200 text-purple-800',
    'bg-pink-200 text-pink-800',
    'bg-yellow-200 text-yellow-800',
    'bg-indigo-200 text-indigo-800',
  ]

  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

export function MemberDirectory({ members, className = '' }: MemberDirectoryProps) {
  if (members.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No members yet</p>
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
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${avatarColor}`}
              >
                <span className="font-bold text-xl">{initials}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-center text-base truncate w-full">
                {member.displayName}
              </p>
              <p className="text-sm text-gray-500 truncate w-full text-center">
                @{member.handle}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
