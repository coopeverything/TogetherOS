'use client'

/**
 * Reward Points Wallet Client Component
 * Fetches and displays RP balance, transactions, and badges
 * Includes real-time balance polling (30 second interval)
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { RPWalletCard, RPEarningsTable, BadgeProgressCard } from '@togetheros/ui/economy'
import type { RewardPointsBalance, RewardPointsTransaction, Badge, MemberBadge } from '@togetheros/types/rewards'

export interface RPWalletClientProps {
  userId: string
}

// Polling interval for real-time updates (30 seconds)
const BALANCE_POLL_INTERVAL = 30000

// Fallback badges (used when API unavailable)
const FALLBACK_BADGES: Badge[] = [
  { id: 'first-pr', name: 'First PR', description: 'Made your first contribution', icon: '1', criteria: 'Have a pull request merged', category: 'contribution' },
  { id: 'foundation-builder', name: 'Foundation Builder', description: 'Contributed to core infrastructure', icon: '2', criteria: 'Contribute to foundation code', category: 'contribution' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Fixed bugs in the codebase', icon: '3', criteria: 'Report and verify 5 bugs', category: 'contribution' },
  { id: 'docs-champion', name: 'Docs Champion', description: 'Contributed to documentation', icon: '4', criteria: 'Make 10 documentation contributions', category: 'contribution' },
  { id: 'code-reviewer', name: 'Code Reviewer', description: 'Reviewed pull requests', icon: '5', criteria: 'Complete 20 code reviews', category: 'contribution' },
]

export function RPWalletClient({ userId }: RPWalletClientProps) {
  const [balance, setBalance] = useState<RewardPointsBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardPointsTransaction[]>([])
  const [badges, setBadges] = useState<Badge[]>(FALLBACK_BADGES)
  const [memberBadges, setMemberBadges] = useState<MemberBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)

      // Fetch RP balance
      const balanceResponse = await fetch('/api/reward-points/balance')
      if (balanceResponse.ok) {
        const data = await balanceResponse.json()
        setBalance(data.balance)
      } else {
        // Use mock data if API not yet implemented
        setBalance({
          memberId: userId,
          totalEarned: 250,
          available: 200,
          spentOnTBC: 25,
          spentOnSH: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      // Fetch transactions
      const txResponse = await fetch('/api/reward-points/transactions')
      if (txResponse.ok) {
        const data = await txResponse.json()
        setTransactions(data.transactions)
      } else {
        // Use mock data if API not yet implemented
        setTransactions([
          { id: '1', memberId: userId, type: 'earn_contribution', amount: 50, source: 'pr_merged_medium', createdAt: new Date(Date.now() - 86400000) },
          { id: '2', memberId: userId, type: 'earn_dues', amount: 100, source: 'monthly_dues', createdAt: new Date(Date.now() - 172800000) },
          { id: '3', memberId: userId, type: 'earn_contribution', amount: 25, source: 'code_review', createdAt: new Date(Date.now() - 259200000) },
          { id: '4', memberId: userId, type: 'spend_tbc', amount: -25, source: 'tbc_conversion', createdAt: new Date(Date.now() - 345600000) },
        ])
      }

      // Fetch badges with member status from new API
      const badgesResponse = await fetch('/api/member-badges')
      if (badgesResponse.ok) {
        const data = await badgesResponse.json()
        // Transform the response to separate badges and memberBadges
        const allBadges: Badge[] = data.badges.map((b: { badge: Badge; earned: boolean; earnedAt?: Date }) => b.badge)
        const earnedBadges: MemberBadge[] = data.badges
          .filter((b: { badge: Badge; earned: boolean; earnedAt?: Date }) => b.earned)
          .map((b: { badge: Badge; earned: boolean; earnedAt?: Date }) => ({
            memberId: userId,
            badgeId: b.badge.id,
            earnedAt: b.earnedAt,
          }))
        setBadges(allBadges)
        setMemberBadges(earnedBadges)
      } else {
        // Fallback: Try the old API format
        const oldBadgesResponse = await fetch('/api/badges')
        if (oldBadgesResponse.ok) {
          const data = await oldBadgesResponse.json()
          if (data.badges) {
            setBadges(data.badges)
          }
        }
        // Keep member badges empty if can't fetch
        setMemberBadges([])
      }

      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    fetchData(true)
  }, [userId, fetchData])

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false)
    }, BALANCE_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchData])

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-sm font-bold text-ink-900 mb-4">Reward Points Wallet</h1>
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-bg-2 rounded w-48 mb-4"></div>
              <div className="h-8 bg-bg-2 rounded w-32 mb-2"></div>
              <div className="h-6 bg-bg-2 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-sm font-bold text-ink-900 mb-4">Reward Points Wallet</h1>
          <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-danger mb-2">Error Loading Data</h2>
            <p className="text-danger/80">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="min-h-screen bg-bg-0 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-sm font-bold text-ink-900 mb-4">Reward Points Wallet</h1>
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <p className="text-ink-400">No balance found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-ink-400 mb-4">
            <Link href="/economy" className="hover:text-accent-3 transition-colors">
              Economy
            </Link>
            <span>→</span>
            <span className="text-ink-900">Reward Points</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-ink-900 mb-2">Reward Points Wallet</h1>
              <p className="text-ink-400">
                Earn RP through contributions, convert to Timebank Credits or use for perks
              </p>
            </div>
            {lastUpdated && (
              <div className="text-xs text-ink-400">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <RPWalletCard balance={balance} className="mb-3" />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-3">
          <Link
            href="/economy/reward-points/history"
            className="px-4 py-2 bg-bg-1 border border-border rounded-lg text-sm font-medium text-ink-700 hover:bg-bg-2 hover:border-border transition-colors"
          >
            View Full History →
          </Link>
          <Link
            href="/economy/reward-points/convert"
            className="px-4 py-2 bg-accent-3 text-bg-1 rounded-lg text-sm font-medium hover:bg-accent-3/90 transition-colors"
          >
            Convert RP to TBC
          </Link>
        </div>

        {/* Badge Progress */}
        <BadgeProgressCard
          badges={badges}
          memberBadges={memberBadges}
          className="mb-3"
        />

        {/* Recent Transactions */}
        <RPEarningsTable
          transactions={transactions.slice(0, 10)}
          className="mb-3"
        />

        {/* How RP Works */}
        <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">How Reward Points Work</h2>
          <div className="space-y-3 text-sm text-ink-700">
            <p>
              <strong>Economic Claims:</strong> Reward Points (RP) represent your contributions to the cooperative.
              They can be converted to Timebank Credits or used for Social Horizon purchases.
            </p>
            <p>
              <strong>Earning RP:</strong> You earn RP through technical contributions (code, docs, reviews),
              paying membership dues, donations, and gamification activities.
            </p>
            <p>
              <strong>Converting RP:</strong> Convert RP to Timebank Credits (TBC) at the current exchange rate.
              TBC can be used to request services from other members.
            </p>
            <p>
              <strong>Important:</strong> RP cannot be converted to Support Points (anti-plutocracy rule).
              SP is earned only through governance participation.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex gap-3">
          <Link
            href="/economy"
            className="px-4 py-2 bg-bg-2 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:bg-gray-600 transition-colors font-medium inline-block"
          >
            ← Back to Economy
          </Link>
          <Link
            href="/economy/support-points"
            className="px-4 py-2 bg-joy-bg text-joy-700 rounded-md hover:bg-joy-bg/80 transition-colors font-medium inline-block"
          >
            View Support Points →
          </Link>
        </div>
      </div>
    </div>
  )
}
