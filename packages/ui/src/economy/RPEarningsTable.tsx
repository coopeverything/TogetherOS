/**
 * RP Earnings Table Component
 * Displays history of Reward Points transactions with filtering
 */

import type { RewardPointsTransaction, RPTransactionType } from '@togetheros/types/rewards'

export interface RPEarningsTableProps {
  transactions: RewardPointsTransaction[]
  className?: string
}

const TYPE_LABELS: Record<RPTransactionType, string> = {
  earn_contribution: 'Contribution',
  earn_dues: 'Membership Dues',
  earn_donation: 'Donation',
  spend_tbc: 'Convert to TBC',
  spend_sh: 'Purchase SH',
  spend_perk: 'Perk Redemption',
}

const TYPE_COLORS: Record<RPTransactionType, string> = {
  earn_contribution: 'text-green-600',
  earn_dues: 'text-blue-600',
  earn_donation: 'text-purple-600',
  spend_tbc: 'text-orange-600',
  spend_sh: 'text-pink-600',
  spend_perk: 'text-gray-600',
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RPEarningsTable({ transactions, className = '' }: RPEarningsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">RP Transaction History</h2>
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">RP Transaction History</h2>
        <p className="text-sm text-gray-500 mt-1">{transactions.length} transactions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(tx.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${TYPE_COLORS[tx.type]}`}>
                    {TYPE_LABELS[tx.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.source || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={`text-sm font-semibold ${
                      tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}{tx.amount} RP
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
