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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Wallet
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Wallet
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h1>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Wallet
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
