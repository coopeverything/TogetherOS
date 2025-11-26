'use client'

/**
 * Support Points Wallet Client Component
 * Fetches and displays SP balance using SPWalletCard
 * Includes real-time balance polling (30 second interval)
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { SPWalletCard } from '@togetheros/ui/economy'
import type { MemberRewardBalance } from '@togetheros/types/rewards'

export interface SPWalletClientProps {
  userId: string
}

// Polling interval for real-time updates (30 seconds)
const BALANCE_POLL_INTERVAL = 30000

export function SPWalletClient({ userId }: SPWalletClientProps) {
  const [balance, setBalance] = useState<MemberRewardBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBalance = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)

      const response = await fetch('/api/support-points/balance')

      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }

      const data = await response.json()
      setBalance(data.balance)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchBalance(true)
  }, [userId, fetchBalance])

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalance(false) // Don't show loading spinner for background updates
    }, BALANCE_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchBalance])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Points Wallet</h1>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Points Wallet</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Balance</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Points Wallet</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">No balance found</p>
          </div>
        </div>
      </div>
    )
  }

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/economy" className="hover:text-blue-600 transition-colors">
              Economy
            </Link>
            <span>→</span>
            <span className="text-gray-900">Support Points</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Points Wallet</h1>
              <p className="text-gray-600">
                Allocate Support Points to signal which proposals you prioritize
              </p>
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        <SPWalletCard balance={balance} className="mb-6" />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href="/economy/support-points/history"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            View Transaction History →
          </Link>
          <Link
            href="/governance"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Proposals to Allocate SP
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How Support Points Work</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Governance Power:</strong> Support Points (SP) help the community prioritize which proposals
              to work on first. Higher SP allocation = higher priority.
            </p>
            <p>
              <strong>Fair Distribution:</strong> Everyone starts with 100 SP. You earn more through governance participation
              (proposals, moderation quality, facilitation, deliberation).
            </p>
            <p>
              <strong>Anti-Plutocracy:</strong> SP can ONLY be earned through contributions, never purchased.
              This prevents buying governance influence.
            </p>
            <p>
              <strong>Allocation Limits:</strong> Maximum 10 SP per proposal. SP is reclaimed when proposals close.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
