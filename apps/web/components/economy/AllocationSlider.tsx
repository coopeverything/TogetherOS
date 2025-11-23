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
}

export function AllocationSlider({
  proposalId,
  proposalTitle,
  availableSP,
  currentAllocation = 0,
  onAllocate,
  onReclaim,
  className = ''
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {hasAllocation ? 'Adjust Allocation' : 'Allocate Support Points'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Proposal Title */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {proposalTitle}
          </p>
        </div>

        {/* Allocation Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Amount to allocate
            </span>
            <span className="text-lg font-bold text-blue-600">
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

          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Available SP Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Available SP
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {availableSP} SP
            </span>
          </div>
          {hasAllocation && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Currently Allocated
              </span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                {currentAllocation} SP
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
              className="flex-1"
            >
              {isSubmitting ? 'Processing...' : 'Reclaim All'}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleAllocate}
            disabled={isSubmitting || amount === 0 || !isAmountChanged}
            className={hasAllocation ? 'flex-1' : 'w-full'}
          >
            {isSubmitting
              ? 'Processing...'
              : hasAllocation
              ? 'Update Allocation'
              : 'Allocate SP'}
          </Button>
        </div>

        {/* Anti-Plutocracy Notice */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="flex items-start gap-1">
            <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
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
