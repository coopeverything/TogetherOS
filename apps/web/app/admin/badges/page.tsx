'use client'

/**
 * Admin Badge Management Page
 * View badge statistics, recent awards, and manage badges
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'contribution' | 'milestone' | 'special'
  criteria: string
}

interface BadgeStats {
  totalBadges: number
  totalAwarded: number
  byCategory: Record<string, number>
  topBadges: { badgeId: string; name: string; count: number }[]
}

interface RecentAward {
  memberId: string
  badgeId: string
  earnedAt: Date
  badgeName: string
  badgeIcon: string
}

const CATEGORY_COLORS = {
  contribution: 'bg-green-100 text-green-800 border-green-200',
  milestone: 'bg-purple-100 text-purple-800 border-purple-200',
  special: 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<BadgeStats | null>(null)
  const [recentAwards, setRecentAwards] = useState<RecentAward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch badges with stats
        const badgesResponse = await fetch('/api/badges?stats=true')
        if (badgesResponse.ok) {
          const data = await badgesResponse.json()
          setBadges(data.badges || [])
          setStats(data.stats || null)
        }

        // Fetch admin data (recent awards)
        const adminResponse = await fetch('/api/admin/badges')
        if (adminResponse.ok) {
          const data = await adminResponse.json()
          setRecentAwards(data.recentAwards || [])
          if (data.stats) setStats(data.stats)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">Badge Management</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-bg-2 rounded-lg"></div>
            <div className="h-64 bg-bg-2 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">Badge Management</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-base text-ink-400 mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span>/</span>
            <span>Badges</span>
          </div>
          <h1 className="text-3xl font-bold text-ink-900">Badge Management</h1>
          <p className="text-ink-400 mt-1">View and manage member badges and achievements</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.totalBadges}</div>
              <div className="text-base text-ink-400">Total Badges</div>
            </div>
            <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
              <div className="text-3xl font-bold text-green-600">{stats.totalAwarded}</div>
              <div className="text-base text-ink-400">Total Awarded</div>
            </div>
            <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
              <div className="text-3xl font-bold text-purple-600">
                {stats.byCategory.contribution || 0}
              </div>
              <div className="text-base text-ink-400">Contribution Awards</div>
            </div>
            <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
              <div className="text-3xl font-bold text-amber-600">
                {stats.byCategory.special || 0}
              </div>
              <div className="text-base text-ink-400">Special Awards</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* All Badges */}
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-ink-900 mb-4">All Badges</h2>
            <div className="space-y-3">
              {badges.length === 0 ? (
                <p className="text-ink-400 text-base">No badges defined yet.</p>
              ) : (
                badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-4 p-4 bg-bg-2 rounded-lg border border-border"
                  >
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-ink-900">{badge.name}</div>
                      <div className="text-sm text-ink-400">{badge.description}</div>
                    </div>
                    <span
                      className={`text-sm px-3 py-1.5 rounded border ${CATEGORY_COLORS[badge.category]}`}
                    >
                      {badge.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Badges */}
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-ink-900 mb-4">Most Awarded</h2>
            {stats?.topBadges && stats.topBadges.length > 0 ? (
              <div className="space-y-3">
                {stats.topBadges.map((badge, index) => (
                  <div
                    key={badge.badgeId}
                    className="flex items-center gap-4 p-4 bg-bg-2 rounded-lg"
                  >
                    <div className="text-xl font-bold text-ink-400 w-6">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium text-ink-900">{badge.name}</div>
                    </div>
                    <div className="text-base font-semibold text-blue-600">
                      {badge.count} awarded
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-400 text-base">No badges awarded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Awards */}
        <div className="mt-6 bg-bg-1 rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold text-ink-900 mb-4">Recent Awards</h2>
          {recentAwards.length === 0 ? (
            <p className="text-ink-400 text-base">No recent awards.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-ink-700">Badge</th>
                    <th className="text-left py-2 px-3 font-medium text-ink-700">Member ID</th>
                    <th className="text-left py-2 px-3 font-medium text-ink-700">Earned At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAwards.slice(0, 10).map((award, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-2 px-3">
                        <span className="mr-2">{award.badgeIcon}</span>
                        {award.badgeName}
                      </td>
                      <td className="py-2 px-3 font-mono text-sm text-ink-400">
                        {award.memberId.substring(0, 8)}...
                      </td>
                      <td className="py-2 px-3 text-ink-400">
                        {new Date(award.earnedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-700 text-base font-medium"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
