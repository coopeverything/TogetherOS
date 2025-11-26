/**
 * Badge Progress Card Component
 * Displays member's earned badges and progress toward next badges
 */

import type { Badge, MemberBadge } from '@togetheros/types/rewards'

export interface BadgeProgressCardProps {
  badges: Badge[]
  memberBadges: MemberBadge[]
  className?: string
}

const CATEGORY_COLORS: Record<Badge['category'], { bg: string; text: string; border: string }> = {
  contribution: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  milestone: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  special: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BadgeProgressCard({ badges, memberBadges, className = '' }: BadgeProgressCardProps) {
  const earnedBadgeIds = new Set(memberBadges.map((mb) => mb.badgeId))
  const earnedBadges = badges.filter((b) => earnedBadgeIds.has(b.id))
  const unearnedBadges = badges.filter((b) => !earnedBadgeIds.has(b.id))

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges</h2>

      {/* Earned Badges */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Earned ({earnedBadges.length})
        </h3>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-gray-500">No badges earned yet. Keep contributing!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map((badge) => {
              const memberBadge = memberBadges.find((mb) => mb.badgeId === badge.id)
              const colors = CATEGORY_COLORS[badge.category]
              return (
                <div
                  key={badge.id}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-3 text-center`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className={`text-sm font-medium ${colors.text}`}>{badge.name}</div>
                  {memberBadge && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(memberBadge.earnedAt)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming Badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Available ({unearnedBadges.length})
          </h3>
          <div className="space-y-3">
            {unearnedBadges.slice(0, 5).map((badge) => {
              const colors = CATEGORY_COLORS[badge.category]
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="text-xl opacity-50">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600">{badge.name}</div>
                    <div className="text-xs text-gray-500">{badge.criteria}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}
                  >
                    {badge.category}
                  </span>
                </div>
              )
            })}
            {unearnedBadges.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{unearnedBadges.length - 5} more badges available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
