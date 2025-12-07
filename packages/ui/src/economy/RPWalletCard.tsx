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
    <div className={`bg-bg-1 rounded-lg shadow-sm border border-border p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-ink-900 mb-4">
        Reward Points Wallet
      </h2>

      <div className="space-y-2">
        {/* Current Balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-700">Current Balance</span>
          <span className="text-sm font-bold text-accent-3">{balance.available} RP</span>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          {/* Total Earned */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-700">Total Earned (All Time)</span>
            <span className="text-sm font-semibold text-ink-700">{balance.totalEarned} RP</span>
          </div>

          {/* Spent on TBC */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-700">Converted to TBC</span>
            <span className="text-sm font-semibold text-accent-1">{balance.spentOnTBC} RP</span>
          </div>

          {/* Spent on SH */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-700">Spent on SH</span>
            <span className="text-sm font-semibold text-success">{balance.spentOnSH} RP</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-xs text-ink-400">
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
