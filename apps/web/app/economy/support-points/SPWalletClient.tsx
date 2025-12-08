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
      <div className="min-h-screen bg-bg-0 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-sm font-bold text-ink-900 mb-4">Support Points Wallet</h1>
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
          <h1 className="text-sm font-bold text-ink-900 mb-4">Support Points Wallet</h1>
          <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-danger mb-2">Error Loading Balance</h2>
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
          <h1 className="text-sm font-bold text-ink-900 mb-4">Support Points Wallet</h1>
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <p className="text-ink-400">No balance found</p>
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
    <div className="min-h-screen bg-bg-0 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-ink-400 mb-4">
            <Link href="/economy" className="hover:text-joy-600 transition-colors">
              Economy
            </Link>
            <span>→</span>
            <span className="text-ink-900">Support Points</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-ink-900 mb-2">Support Points Wallet</h1>
              <p className="text-ink-400">
                Allocate Support Points to signal which proposals you prioritize
              </p>
            </div>
            {lastUpdated && (
              <div className="text-xs text-ink-400">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        <SPWalletCard balance={balance} className="mb-3" />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-3">
          <Link
            href="/economy/support-points/history"
            className="px-4 py-2 bg-bg-1 border border-border rounded-lg text-sm font-medium text-ink-700 hover:bg-bg-2 hover:border-border transition-colors"
          >
            View Transaction History →
          </Link>
          <Link
            href="/governance"
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-lg text-sm font-medium hover:bg-joy-700 transition-colors"
          >
            Browse Proposals to Allocate SP
          </Link>
        </div>

        <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">How Support Points Work</h2>
          <div className="space-y-3 text-sm text-ink-700">
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
