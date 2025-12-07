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
    <div className={`bg-bg-1 rounded-lg shadow-sm border border-border p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-ink-900 mb-4">
        Support Points Wallet
      </h2>

      <div className="space-y-2">
        {/* Total Earned */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-700">Total Earned (All Time)</span>
          <span className="text-sm font-bold text-accent-1">{balance.total} SP</span>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          {/* Available */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-700">Available</span>
            <span className="text-sm font-semibold text-success">{balance.available} SP</span>
          </div>

          {/* Allocated */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-700">Allocated to Proposals</span>
            <span className="text-sm font-semibold text-joy-600">{balance.allocated} SP</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-xs text-ink-400">
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
