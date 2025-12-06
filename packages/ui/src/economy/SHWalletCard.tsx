/**
 * Social Horizon Wallet Card Component
 * Displays member's SH balance and ownership percentage
 */

import type { SocialHorizonWallet } from '@togetheros/types/rewards'

export interface SHWalletCardProps {
  wallet: SocialHorizonWallet
  ownershipPercentage?: number
  totalCirculation?: number
  className?: string
}

export function SHWalletCard({ wallet, ownershipPercentage, totalCirculation, className = '' }: SHWalletCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Social Horizon
      </h2>

      <div className="space-y-2">
        {/* Current Balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Balance</span>
          <span className="text-sm font-bold text-emerald-600">{wallet.shBalance.toFixed(4)} SH</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          {/* Total Issued */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Total Received</span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{wallet.totalIssued.toFixed(4)} SH</span>
          </div>

          {/* Ownership Percentage */}
          {ownershipPercentage !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Ownership</span>
              <span className="text-sm font-semibold text-indigo-600">{ownershipPercentage.toFixed(4)}%</span>
            </div>
          )}

          {/* Total Circulation */}
          {totalCirculation !== undefined && totalCirculation > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Total in Circulation</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{totalCirculation.toFixed(2)} SH</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Social Horizon (SH) represents your long-term stake in the cooperative. It grows through sustained contribution.
          </p>
          <p className="mt-2">
            <strong>Benefits:</strong> Dividends from cooperative treasury surplus, long-term wealth tied to participation.
          </p>
          <p className="mt-1 text-amber-600 dark:text-amber-500">
            Non-tradable to prevent speculation.
          </p>
        </div>
      </div>
    </div>
  )
}
