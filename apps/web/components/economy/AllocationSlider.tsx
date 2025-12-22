import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export interface AllocationSliderProps {
  proposalId: string
  proposalTitle: string
  availableSP: number
  currentAllocation?: number
  onAllocate: (amount: number) => Promise<void>
  onReclaim?: () => Promise<void>
  className?: string
  /** Compact mode: no Card wrapper, minimal styling for embedding in other components */
  compact?: boolean
}

export function AllocationSlider({
  proposalId,
  proposalTitle,
  availableSP,
  currentAllocation = 0,
  onAllocate,
  onReclaim,
  className = '',
  compact = false
}: AllocationSliderProps) {
  const [amount, setAmount] = useState(currentAllocation)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0])
    setError(null)
  }

  const handleAllocate = async () => {
    // Validation
    if (amount < 1 || amount > 10) {
      setError('Allocation must be between 1 and 10 SP')
      return
    }

    if (amount > availableSP) {
      setError(`Insufficient SP. You have ${availableSP} SP available`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onAllocate(amount)
      // Success handled by parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate SP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReclaim = async () => {
    if (!onReclaim) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onReclaim()
      setAmount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reclaim SP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasAllocation = currentAllocation > 0
  const isAmountChanged = amount !== currentAllocation

  const content = (
    <div className={compact ? 'space-y-3' : 'space-y-2'}>
      {/* Allocation Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-700">
            Support Points
          </span>
          <span className="text-sm font-bold text-brand-600">
            {amount} SP
          </span>
        </div>

        <Slider
          value={[amount]}
          onValueChange={handleSliderChange}
          min={0}
          max={10}
          step={1}
          disabled={isSubmitting}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-ink-400">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Available SP Info - Compact */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-400">
          Available: <span className="font-medium text-ink-700">{availableSP} SP</span>
        </span>
        {hasAllocation && (
          <span className="text-ink-400">
            Allocated: <span className="font-medium text-brand-600">{currentAllocation} SP</span>
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-danger-bg border border-danger/30 rounded p-2">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {hasAllocation && (
          <Button
            variant="joy"
            size="sm"
            onClick={handleReclaim}
            disabled={isSubmitting}
            className="flex-1 text-xs"
          >
            {isSubmitting ? '...' : 'Reclaim'}
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={handleAllocate}
          disabled={isSubmitting || amount === 0 || !isAmountChanged}
          className={`text-xs ${hasAllocation ? 'flex-1' : 'w-full'}`}
        >
          {isSubmitting
            ? '...'
            : hasAllocation
            ? 'Update'
            : 'Allocate SP'}
        </Button>
      </div>
    </div>
  )

  // Compact mode: no Card wrapper
  if (compact) {
    return <div className={className}>{content}</div>
  }

  // Full mode: with Card wrapper (for standalone use)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {hasAllocation ? 'Adjust Allocation' : 'Allocate Support Points'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Proposal Title */}
        <div className="bg-bg-2 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium text-ink-900">
            {proposalTitle}
          </p>
        </div>

        {content}

        {/* Anti-Plutocracy Notice - Only in full mode */}
        <div className="text-xs text-ink-400 pt-3 mt-3 border-t border-border">
          <p className="flex items-start gap-1">
            <span className="text-info">ℹ️</span>
            <span>
              Support Points signal priorities, not purchasing power. Each member can
              allocate 1-10 SP per proposal. SP is reclaimed when proposals close.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
