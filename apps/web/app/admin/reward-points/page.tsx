'use client'

/**
 * Admin Reward Points Panel
 * View RP stats, top earners, earning breakdown by category
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RPStats {
  totalRPInCirculation: number
  totalRPEarned: number
  totalRPSpent: number
  avgRPPerMember: number
  totalMembers: number
  spentOnTBC: number
  spentOnSH: number
}

interface TopEarner {
  memberId: string
  displayName: string
  totalEarned: number
  primarySource: string
}

interface EarningBreakdown {
  category: string
  label: string
  amount: number
  percentage: number
  color: string
}

// Mock data for initial implementation
const MOCK_STATS: RPStats = {
  totalRPInCirculation: 45000,
  totalRPEarned: 52000,
  totalRPSpent: 7000,
  avgRPPerMember: 300,
  totalMembers: 150,
  spentOnTBC: 4500,
  spentOnSH: 2500,
}

const MOCK_TOP_EARNERS: TopEarner[] = [
  { memberId: '1', displayName: 'alice_coder', totalEarned: 1250, primarySource: 'PR merges' },
  { memberId: '2', displayName: 'bob_reviewer', totalEarned: 980, primarySource: 'Code reviews' },
  { memberId: '3', displayName: 'carol_docs', totalEarned: 850, primarySource: 'Documentation' },
  { memberId: '4', displayName: 'dave_organizer', totalEarned: 720, primarySource: 'Meetup organizing' },
  { memberId: '5', displayName: 'eve_mentor', totalEarned: 650, primarySource: 'Group mentoring' },
]

const MOCK_BREAKDOWN: EarningBreakdown[] = [
  { category: 'contributions', label: 'Technical Contributions', amount: 28000, percentage: 54, color: 'bg-green-500' },
  { category: 'dues', label: 'Membership Dues', amount: 15000, percentage: 29, color: 'bg-blue-500' },
  { category: 'gamification', label: 'Gamification', amount: 6000, percentage: 11, color: 'bg-purple-500' },
  { category: 'donations', label: 'Donations', amount: 3000, percentage: 6, color: 'bg-amber-500' },
]

export default function AdminRewardPointsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<RPStats | null>(null)
  const [topEarners, setTopEarners] = useState<TopEarner[]>([])
  const [breakdown, setBreakdown] = useState<EarningBreakdown[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check admin authorization
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          // Load data (using mock for now)
          setStats(MOCK_STATS)
          setTopEarners(MOCK_TOP_EARNERS)
          setBreakdown(MOCK_BREAKDOWN)
        } else {
          router.push('/login?redirect=/admin/reward-points')
        }
      })
      .catch(() => router.push('/login?redirect=/admin/reward-points'))
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/admin" className="hover:text-purple-600 transition-colors">
              Admin
            </Link>
            <span>→</span>
            <span className="text-gray-900">Reward Points</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reward Points Administration</h1>
          <p className="text-gray-600">Monitor RP circulation, earnings, and conversion activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Total RP Earned</div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalRPEarned.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">In Circulation</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalRPInCirculation.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Converted to TBC</div>
              <div className="text-2xl font-bold text-blue-600">{stats.spentOnTBC.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Used for SH</div>
              <div className="text-2xl font-bold text-amber-600">{stats.spentOnSH.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earning Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Earning Sources</h2>
              <p className="text-sm text-gray-500">How RP is being earned</p>
            </div>
            <div className="p-4">
              {/* Progress bars */}
              <div className="space-y-4">
                {breakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-500">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.amount.toLocaleString()} RP</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Earners */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top RP Earners</h2>
              <p className="text-sm text-gray-500">Members with highest RP earnings</p>
            </div>
            <div className="divide-y divide-gray-200">
              {topEarners.map((earner, index) => (
                <div key={earner.memberId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{earner.displayName}</div>
                      <div className="text-xs text-gray-500">{earner.primarySource}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-purple-600">{earner.totalEarned.toLocaleString()} RP</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RP → TBC Conversions</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats?.spentOnTBC.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total RP converted</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-700">{stats ? Math.round(stats.spentOnTBC / 100) : 0}</div>
                <div className="text-sm text-gray-500">TBC issued</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Current rate: 100 RP = 1 TBC
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RP → SH Purchases</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600">{stats?.spentOnSH.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total RP spent</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-700">{stats ? Math.round(stats.spentOnSH / 50) : 0}</div>
                <div className="text-sm text-gray-500">SH purchased</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Rate varies by purchase event
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">About Reward Points</h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p><strong>Purpose:</strong> RP represents economic claims from contributions to the cooperative.</p>
            <p><strong>Earning:</strong> Technical contributions, membership dues, donations, and gamification activities.</p>
            <p><strong>Spending:</strong> Convert to Timebank Credits (TBC) or purchase Social Horizon (SH) in events.</p>
            <p><strong>Anti-Plutocracy:</strong> RP cannot be converted to Support Points. SP is governance-only.</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
