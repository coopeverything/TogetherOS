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

export default function AdminRewardPointsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<RPStats | null>(null)
  const [topEarners, setTopEarners] = useState<TopEarner[]>([])
  const [breakdown, setBreakdown] = useState<EarningBreakdown[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check admin authorization and fetch data
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()

        if (!authData.user || !authData.user.is_admin) {
          router.push('/login?redirect=/admin/reward-points')
          return
        }

        setIsAuthorized(true)

        // Fetch admin RP stats
        const statsRes = await fetch('/api/admin/reward-points')
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats)
          setTopEarners(data.topEarners || [])
          setBreakdown(data.breakdown || [])
        }
      } catch {
        router.push('/login?redirect=/admin/reward-points')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-bg-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-bg-2 rounded w-64 mb-6"></div>
            <div className="h-32 bg-bg-2 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-ink-400 mb-4">
            <Link href="/admin" className="hover:text-purple-600 transition-colors">
              Admin
            </Link>
            <span>→</span>
            <span className="text-ink-900">Reward Points</span>
          </div>
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Reward Points Administration</h1>
          <p className="text-ink-400">Monitor RP circulation, earnings, and conversion activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Total RP Earned</div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalRPEarned.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">In Circulation</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalRPInCirculation.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Converted to TBC</div>
              <div className="text-2xl font-bold text-blue-600">{stats.spentOnTBC.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Used for SH</div>
              <div className="text-2xl font-bold text-amber-600">{stats.spentOnSH.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earning Breakdown */}
          <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-ink-900">Earning Sources</h2>
              <p className="text-sm text-ink-400">How RP is being earned</p>
            </div>
            <div className="p-4">
              {/* Progress bars */}
              <div className="space-y-4">
                {breakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-700">{item.label}</span>
                      <span className="text-sm text-ink-400">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-bg-2 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-ink-400 mt-1">{item.amount.toLocaleString()} RP</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Earners */}
          <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-ink-900">Top RP Earners</h2>
              <p className="text-sm text-ink-400">Members with highest RP earnings</p>
            </div>
            <div className="divide-y divide-border">
              {topEarners.map((earner, index) => (
                <div key={earner.memberId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-ink-900">{earner.displayName}</div>
                      <div className="text-xs text-ink-400">{earner.primarySource}</div>
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
          <div className="bg-bg-0 rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-ink-900 mb-4">RP → TBC Conversions</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats?.spentOnTBC.toLocaleString()}</div>
                <div className="text-sm text-ink-400">Total RP converted</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-ink-700">{stats ? Math.round(stats.spentOnTBC / 100) : 0}</div>
                <div className="text-sm text-ink-400">TBC issued</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-ink-400">
              Current rate: 100 RP = 1 TBC
            </div>
          </div>

          <div className="bg-bg-0 rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-ink-900 mb-4">RP → SH Purchases</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600">{stats?.spentOnSH.toLocaleString()}</div>
                <div className="text-sm text-ink-400">Total RP spent</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-ink-700">{stats ? Math.round(stats.spentOnSH / 50) : 0}</div>
                <div className="text-sm text-ink-400">SH purchased</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-ink-400">
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
            className="px-6 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-bg-1 transition-colors font-medium inline-block"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
