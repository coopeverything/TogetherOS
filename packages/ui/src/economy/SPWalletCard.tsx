/**
 * Support Points Wallet Card Component
 * Displays member's SP balance (total earned, available, allocated)
 */

import type { MemberRewardBalance } from '@togetheros/types/rewards'

export interface SPWalletCardProps {
  balance: MemberRewardBalance
  className?: string
}

export function SPWalletCard({ balance, className = '' }: SPWalletCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Support Points Wallet
      </h2>

      <div className="space-y-4">
        {/* Total Earned */}
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-600">Total Earned (All Time)</span>
          <span className="text-3xl font-bold text-blue-600">{balance.total} SP</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          {/* Available */}
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700">Available</span>
            <span className="text-xl font-semibold text-green-600">{balance.available} SP</span>
          </div>

          {/* Allocated */}
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700">Allocated to Proposals</span>
            <span className="text-xl font-semibold text-orange-600">{balance.allocated} SP</span>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500">
          <p>
            Support Points (SP) signal which proposals you prioritize.
            Allocate SP to proposals to help the community prioritize work.
          </p>
          <p className="mt-2">
            <strong>Max 10 SP per proposal.</strong> SP is reclaimed when proposals close.
          </p>
        </div>
      </div>
    </div>
  )
}
