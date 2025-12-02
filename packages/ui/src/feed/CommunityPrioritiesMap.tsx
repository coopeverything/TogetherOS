// packages/ui/src/feed/CommunityPrioritiesMap.tsx
// Community priorities dashboard (Phase 4) - PROMINENT display of what members care about

'use client'

// Type definition for community priority statistics
export interface CommunityPriorityStats {
  topic: string
  userCount: number
  percentageOfCommunity: number
  averageWeight: number
  averageRank: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface CommunityPrioritiesMapProps {
  stats: CommunityPriorityStats[]
  totalUsers: number
}

export function CommunityPrioritiesMap({ stats, totalUsers }: CommunityPrioritiesMapProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    if (direction === 'up') return '↑'
    if (direction === 'down') return '↓'
    return '→'
  }

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    if (direction === 'up') return 'text-green-600'
    if (direction === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-orange-600'
    if (percentage >= 30) return 'bg-orange-500'
    if (percentage >= 15) return 'bg-orange-400'
    return 'bg-orange-300'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          What Our Members Care About
        </h1>
        <p className="text-gray-600">
          Anonymous aggregate priorities from {totalUsers} community members
        </p>
      </div>

      {/* Statistics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.length}</div>
          <div className="text-sm text-gray-600 mt-1">Active Topics</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{totalUsers}</div>
          <div className="text-sm text-gray-600 mt-1">Contributing Members</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {stats.length > 0 ? Math.round(stats[0].percentageOfCommunity) : 0}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Top Priority ({stats.length > 0 ? stats[0].topic : 'N/A'})
          </div>
        </div>
      </div>

      {/* Priority bars */}
      {stats.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600">
            No community priorities yet. Be the first to prioritize topics!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community Priorities</h2>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={stat.topic} className="space-y-2">
                {/* Topic header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {stat.topic}
                    </div>
                    {stat.trendDirection !== 'stable' && (
                      <div className={`text-sm font-medium ${getTrendColor(stat.trendDirection)}`}>
                        {getTrendIcon(stat.trendDirection)} {stat.trendPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.round(stat.percentageOfCommunity)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.userCount} {stat.userCount === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${getBarColor(stat.percentageOfCommunity)} transition-all duration-500`}
                    style={{ width: `${Math.min(stat.percentageOfCommunity, 100)}%` }}
                  />
                </div>

                {/* Additional stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Avg Care:</span> {stat.averageWeight.toFixed(1)}/10
                  </div>
                  <div>
                    <span className="font-medium">Avg Rank:</span> #{stat.averageRank.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          📊 How priorities work
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            <strong>Percentage:</strong> Shows what % of members have prioritized this topic
          </li>
          <li>
            <strong>Avg Care:</strong> Average "care weight" (1-10) members assigned to this topic
          </li>
          <li>
            <strong>Avg Rank:</strong> Average ranking position members gave this topic
          </li>
          <li>
            <strong>Trends:</strong> Shows whether interest is increasing ↑, decreasing ↓, or stable →
          </li>
        </ul>
        <p className="text-sm text-gray-700 mt-3">
          <strong>Privacy:</strong> All statistics are anonymous aggregates.
          Individual priorities remain private to each member.
        </p>
      </div>

      {/* Week-over-week trends */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trending This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rising topics */}
          <div>
            <h3 className="text-sm font-semibold text-green-800 mb-2">↑ Rising Interest</h3>
            <div className="space-y-2">
              {stats
                .filter(s => s.trendDirection === 'up')
                .slice(0, 5)
                .map(stat => (
                  <div
                    key={stat.topic}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{stat.topic}</span>
                    <span className="text-sm text-green-700">+{stat.trendPercentage}%</span>
                  </div>
                ))}
              {stats.filter(s => s.trendDirection === 'up').length === 0 && (
                <p className="text-sm text-gray-500">No rising trends this week</p>
              )}
            </div>
          </div>

          {/* Declining topics */}
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-2">↓ Declining Interest</h3>
            <div className="space-y-2">
              {stats
                .filter(s => s.trendDirection === 'down')
                .slice(0, 5)
                .map(stat => (
                  <div
                    key={stat.topic}
                    className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{stat.topic}</span>
                    <span className="text-sm text-red-700">-{stat.trendPercentage}%</span>
                  </div>
                ))}
              {stats.filter(s => s.trendDirection === 'down').length === 0 && (
                <p className="text-sm text-gray-500">No declining trends this week</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
