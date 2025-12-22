'use client'

import { useState, useEffect } from 'react'
import { AllocationSlider } from './AllocationSlider'

export interface ProposalAllocationWidgetProps {
  proposalId: string
  proposalTitle: string
  className?: string
  /** Compact mode for embedding in rating panel */
  compact?: boolean
}

export function ProposalAllocationWidget({
  proposalId,
  proposalTitle,
  className = '',
  compact = false
}: ProposalAllocationWidgetProps) {
  const [availableSP, setAvailableSP] = useState(0)
  const [currentAllocation, setCurrentAllocation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch member's SP balance and current allocation for this proposal
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch SP balance
        const balanceRes = await fetch('/api/support-points/balance')
        if (!balanceRes.ok) throw new Error('Failed to fetch balance')
        const balanceData = await balanceRes.json()
        setAvailableSP(balanceData.balance?.available || 0)

        // Fetch current allocation for this proposal
        const allocRes = await fetch('/api/support-points/allocations')
        if (!allocRes.ok) throw new Error('Failed to fetch allocation')
        const allocData = await allocRes.json()

        // Find allocation for this proposal (target_type='proposal', target_id=proposalId)
        const allocation = allocData.allocations?.find(
          (a: any) => a.target_type === 'proposal' && a.target_id === proposalId && a.status === 'active'
        )
        setCurrentAllocation(allocation?.amount || 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [proposalId])

  const handleAllocate = async (amount: number) => {
    const res = await fetch('/api/support-points/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'proposal', targetId: proposalId, amount })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to allocate SP')
    }

    // Update local state
    const data = await res.json()
    setCurrentAllocation(amount)
    setAvailableSP(data.newBalance?.available || 0)
  }

  const handleReclaim = async () => {
    const res = await fetch('/api/support-points/reclaim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'proposal', targetId: proposalId })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to reclaim SP')
    }

    // Update local state
    const data = await res.json()
    setCurrentAllocation(0)
    setAvailableSP(data.newBalance?.available || 0)
  }

  if (loading) {
    return (
      <div className={`${compact ? '' : 'bg-bg-1 rounded-lg shadow-sm border border-border p-4'} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-bg-2 rounded w-1/3 mb-3"></div>
          <div className="h-6 bg-bg-2 rounded mb-3"></div>
          <div className="h-4 bg-bg-2 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-danger-bg border border-danger/30 rounded-lg p-3 ${className}`}>
        <p className="text-xs text-danger">{error}</p>
      </div>
    )
  }

  return (
    <AllocationSlider
      proposalId={proposalId}
      proposalTitle={proposalTitle}
      availableSP={availableSP}
      currentAllocation={currentAllocation}
      onAllocate={handleAllocate}
      onReclaim={handleReclaim}
      className={className}
      compact={compact}
    />
  )
}
