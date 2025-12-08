'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AllocationHistory } from '@/components/economy/AllocationHistory'
import type { SPTransaction, SPAllocation } from '@togetheros/types/rewards'

export interface SPTransactionHistoryClientProps {
  userId: string
}

export function SPTransactionHistoryClient({ userId }: SPTransactionHistoryClientProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<SPTransaction[]>([])
  const [allocations, setAllocations] = useState<SPAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch transactions
        const txRes = await fetch('/api/support-points/transactions')
        if (!txRes.ok) throw new Error('Failed to fetch transactions')
        const txData = await txRes.json()

        // Fetch allocations
        const allocRes = await fetch('/api/support-points/allocations')
        if (!allocRes.ok) throw new Error('Failed to fetch allocations')
        const allocData = await allocRes.json()

        setTransactions(txData.transactions || [])
        setAllocations(allocData.allocations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-ink-400 hover:text-ink-900"
            >
              ← Back to Wallet
            </button>
          </div>

          <h1 className="text-sm font-bold text-ink-900 mb-3">
            Transaction History
          </h1>

          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-bg-2 rounded w-1/4"></div>
              <div className="h-4 bg-bg-2 rounded w-1/3"></div>
              <div className="h-4 bg-bg-2 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-ink-400 hover:text-ink-900"
            >
              ← Back to Wallet
            </button>
          </div>

          <h1 className="text-sm font-bold text-ink-900 mb-3">
            Transaction History
          </h1>

          <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-ink-400 hover:text-ink-900"
          >
            ← Back to Wallet
          </button>
        </div>

        <h1 className="text-sm font-bold text-ink-900 mb-3">
          Transaction History
        </h1>

        <AllocationHistory
          transactions={transactions}
          allocations={allocations}
        />
      </div>
    </div>
  )
}
