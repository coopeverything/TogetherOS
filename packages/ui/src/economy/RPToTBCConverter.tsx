'use client'

/**
 * RP to TBC Converter Component
 * Allows users to convert Reward Points to Timebank Credits
 */

import { useState } from 'react'

export interface RPToTBCConverterProps {
  rpAvailable: number
  monthlyAllowance: number
  alreadyConverted: number
  rpPerTBC: number
  onConvert: (rpAmount: number) => Promise<void>
  className?: string
}

export function RPToTBCConverter({
  rpAvailable,
  monthlyAllowance,
  alreadyConverted,
  rpPerTBC,
  onConvert,
  className = ''
}: RPToTBCConverterProps) {
  const [rpAmount, setRpAmount] = useState<number>(rpPerTBC)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const remainingAllowance = monthlyAllowance - alreadyConverted
  const maxConvertible = Math.min(rpAvailable, remainingAllowance)
  const tbcToReceive = rpAmount / rpPerTBC

  const handleConvert = async () => {
    if (rpAmount <= 0 || rpAmount > maxConvertible) {
      setError(`Please enter a valid amount between ${rpPerTBC} and ${maxConvertible} RP`)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onConvert(rpAmount)
      setSuccess(`Successfully converted ${rpAmount} RP to ${tbcToReceive.toFixed(2)} TBC!`)
      setRpAmount(rpPerTBC)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setIsLoading(false)
    }
  }

  const canConvert = maxConvertible >= rpPerTBC

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Convert RP to TBC
      </h3>

      {/* Status Display */}
      <div className="mb-4 space-y-2 text-base">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">RP Available</span>
          <span className="font-medium text-purple-600">{rpAvailable} RP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Monthly Allowance</span>
          <span className="font-medium text-gray-600 dark:text-gray-300">{monthlyAllowance} RP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Already Converted</span>
          <span className="font-medium text-blue-600">{alreadyConverted} RP</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Can Convert</span>
          <span className={`font-bold ${maxConvertible > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {maxConvertible} RP
          </span>
        </div>
      </div>

      {/* Conversion Input */}
      {canConvert ? (
        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount to Convert
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={rpPerTBC}
                max={maxConvertible}
                step={rpPerTBC}
                value={rpAmount}
                onChange={(e) => setRpAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={isLoading}
              />
              <span className="text-gray-500 dark:text-gray-400">RP</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-600 dark:text-gray-400">You will receive</span>
              <span className="text-2xl font-bold text-teal-600">{tbcToReceive.toFixed(2)} TBC</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Rate: {rpPerTBC} RP = 1 TBC
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-base text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-base text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isLoading || rpAmount > maxConvertible || rpAmount < rpPerTBC}
            className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400
                     text-white font-medium rounded-md transition-colors
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {isLoading ? 'Converting...' : 'Convert to TBC'}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-base text-yellow-700 dark:text-yellow-400">
            {rpAvailable < rpPerTBC
              ? `You need at least ${rpPerTBC} RP to convert to 1 TBC.`
              : 'You have reached your monthly conversion limit. Come back next month!'}
          </p>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Monthly conversion limit: {monthlyAllowance / rpPerTBC} TBC per month
      </p>
    </div>
  )
}
