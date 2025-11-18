'use client'

/**
 * Support Points Wallet Client Component
 * Fetches and displays SP balance using SPWalletCard
 */

import { useEffect, useState } from 'react'
import { SPWalletCard } from '@togetheros/ui/economy'
import type { MemberRewardBalance } from '@togetheros/types/rewards'

export interface SPWalletClientProps {
  userId: string
}

export function SPWalletClient({ userId }: SPWalletClientProps) {
  const [balance, setBalance] = useState<MemberRewardBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch('/api/support-points/balance')

        if (!response.ok) {
          throw new Error('Failed to fetch balance')
        }

        const data = await response.json()
        setBalance(data.balance)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [userId])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Points Wallet</h1>
          <p className="text-gray-600">
            Allocate Support Points to signal which proposals you prioritize
          </p>
        </div>

        <SPWalletCard balance={balance} className="mb-6" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How Support Points Work</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Governance Power:</strong> Support Points (SP) help the community prioritize which proposals
              to work on first. Higher SP allocation = higher priority.
            </p>
            <p>
              <strong>Fair Distribution:</strong> Everyone starts with 100 SP. You earn more through contributions
              (code, docs, facilitation, mutual aid).
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
