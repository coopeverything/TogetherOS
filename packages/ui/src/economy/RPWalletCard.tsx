/**
 * Reward Points Wallet Card Component
 * Displays member's RP balance (current, total earned)
 */

import type { RewardPointsBalance } from '@togetheros/types/rewards'

export interface RPWalletCardProps {
  balance: RewardPointsBalance
  className?: string
}

export function RPWalletCard({ balance, className = '' }: RPWalletCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Reward Points Wallet
      </h2>

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Balance</span>
          <span className="text-2xl font-bold text-purple-600">{balance.available} RP</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          {/* Total Earned */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Earned (All Time)</span>
            <span className="text-lg font-semibold text-gray-600">{balance.totalEarned} RP</span>
          </div>

          {/* Spent on TBC */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Converted to TBC</span>
            <span className="text-lg font-semibold text-blue-600">{balance.spentOnTBC} RP</span>
          </div>

          {/* Spent on SH */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Spent on SH</span>
            <span className="text-lg font-semibold text-green-600">{balance.spentOnSH} RP</span>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500">
          <p>
            Reward Points (RP) are earned through contributions, dues, and gamification activities.
            Convert RP to Timebank Credits (TBC) or use for Social Horizon (SH) purchases.
          </p>
          <p className="mt-2">
            <strong>Note:</strong> RP cannot be converted to Support Points (anti-plutocracy rule).
          </p>
        </div>
      </div>
    </div>
  )
}
