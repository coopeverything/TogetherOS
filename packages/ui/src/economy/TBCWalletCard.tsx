/**
 * Timebank Credits Wallet Card Component
 * Displays member's TBC balance and fair exchange status
 */

import type { TimebankAccount } from '@togetheros/types/rewards'

export interface TBCWalletCardProps {
  account: TimebankAccount
  fairExchangeIndex?: {
    value: number
    status: 'excellent' | 'good' | 'balanced' | 'warning' | 'critical'
  }
  className?: string
}

export function TBCWalletCard({ account, fairExchangeIndex, className = '' }: TBCWalletCardProps) {
  const getFairExchangeColor = (status?: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-green-500'
      case 'balanced': return 'text-blue-500'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getFairExchangeLabel = (status?: string) => {
    switch (status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'balanced': return 'Balanced'
      case 'warning': return 'Low'
      case 'critical': return 'Very Low'
      default: return 'N/A'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Timebank Credits
      </h2>

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-600 dark:text-gray-400">Available Balance</span>
          <span className="text-3xl font-bold text-teal-600">{account.balance.toFixed(1)} TBC</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          {/* Total Earned */}
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700 dark:text-gray-300">Total Earned</span>
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">{account.totalEarned.toFixed(1)} TBC</span>
          </div>

          {/* Total Spent */}
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700 dark:text-gray-300">Total Spent</span>
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">{account.totalSpent.toFixed(1)} TBC</span>
          </div>

          {/* Fair Exchange Index */}
          {fairExchangeIndex && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-base text-gray-700 dark:text-gray-300">Fair Exchange Index</span>
              <div className="text-right">
                <span className={`text-xl font-semibold ${getFairExchangeColor(fairExchangeIndex.status)}`}>
                  {fairExchangeIndex.value >= 999 ? '∞' : fairExchangeIndex.value.toFixed(2)}
                </span>
                <span className={`ml-2 text-sm ${getFairExchangeColor(fairExchangeIndex.status)}`}>
                  ({getFairExchangeLabel(fairExchangeIndex.status)})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Timebank Credits (TBC) enable time-based service exchange. 1 TBC = 1 hour of standard service.
          </p>
          <p className="mt-2">
            <strong>Exchange rate:</strong> 100 RP = 1 TBC (monthly cap: 1 TBC)
          </p>
        </div>
      </div>
    </div>
  )
}
