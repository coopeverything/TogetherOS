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

// Mock badges for now (will be fetched from API later)
const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'First Contribution', description: 'Made your first contribution', icon: '🌟', criteria: 'Make your first contribution to the community', category: 'contribution' },
  { id: '2', name: 'Code Warrior', description: 'Merged 10 PRs', icon: '⚔️', criteria: 'Have 10 pull requests merged', category: 'contribution' },
  { id: '3', name: 'Docs Hero', description: 'Contributed to documentation', icon: '📚', criteria: 'Contribute to documentation', category: 'contribution' },
  { id: '4', name: 'Bug Hunter', description: 'Fixed 5 bugs', icon: '🐛', criteria: 'Fix 5 bugs', category: 'contribution' },
  { id: '5', name: '100 RP Club', description: 'Earned 100 RP', icon: '💯', criteria: 'Earn 100 Reward Points', category: 'milestone' },
  { id: '6', name: '500 RP Club', description: 'Earned 500 RP', icon: '🏆', criteria: 'Earn 500 Reward Points', category: 'milestone' },
  { id: '7', name: 'Founding Member', description: 'Early adopter', icon: '🚀', criteria: 'Join during launch phase', category: 'special' },
]

export function RPWalletClient({ userId }: RPWalletClientProps) {
  const [balance, setBalance] = useState<RewardPointsBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardPointsTransaction[]>([])
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

      // Fetch member badges
      const badgesResponse = await fetch('/api/reward-points/badges')
      if (badgesResponse.ok) {
        const data = await badgesResponse.json()
        setMemberBadges(data.badges)
      } else {
        // Use mock data if API not yet implemented
        setMemberBadges([
          { memberId: userId, badgeId: '1', earnedAt: new Date(Date.now() - 604800000) },
          { memberId: userId, badgeId: '5', earnedAt: new Date(Date.now() - 432000000) },
          { memberId: userId, badgeId: '7', earnedAt: new Date(Date.now() - 2592000000) },
        ])
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reward Points Wallet</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reward Points Wallet</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reward Points Wallet</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">No balance found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/economy" className="hover:text-purple-600 transition-colors">
              Economy
            </Link>
            <span>→</span>
            <span className="text-gray-900">Reward Points</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reward Points Wallet</h1>
              <p className="text-gray-600">
                Earn RP through contributions, convert to Timebank Credits or use for perks
              </p>
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <RPWalletCard balance={balance} className="mb-6" />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href="/economy/reward-points/history"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            View Full History →
          </Link>
          <Link
            href="/economy/reward-points/convert"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Convert RP to TBC
          </Link>
        </div>

        {/* Badge Progress */}
        <BadgeProgressCard
          badges={MOCK_BADGES}
          memberBadges={memberBadges}
          className="mb-6"
        />

        {/* Recent Transactions */}
        <RPEarningsTable
          transactions={transactions.slice(0, 10)}
          className="mb-6"
        />

        {/* How RP Works */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How Reward Points Work</h2>
          <div className="space-y-3 text-sm text-gray-700">
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
        <div className="mt-8 flex gap-3">
          <Link
            href="/economy"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block"
          >
            ← Back to Economy
          </Link>
          <Link
            href="/economy/support-points"
            className="px-6 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors font-medium inline-block"
          >
            View Support Points →
          </Link>
        </div>
      </div>
    </div>
  )
}
