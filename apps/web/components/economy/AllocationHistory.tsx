import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SPTransaction, SPAllocation } from '@togetheros/types/rewards'

export interface AllocationHistoryProps {
  transactions: SPTransaction[]
  allocations: SPAllocation[]
  className?: string
}

type FilterType = 'all' | 'active' | 'reclaimed'

export function AllocationHistory({ transactions, allocations, className = '' }: AllocationHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d')

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(tx => {
    // Date range filter
    const now = new Date()
    const txDate = new Date(tx.timestamp)
    const daysDiff = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dateRange === '7d' && daysDiff > 7) return false
    if (dateRange === '30d' && daysDiff > 30) return false

    // Type filter
    if (filter === 'active' && tx.type !== 'allocated') return false
    if (filter === 'reclaimed' && tx.type !== 'reclaimed') return false

    return true
  })

  // Sort by timestamp (most recent first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Get badge variant based on transaction type
  const getTypeVariant = (type: SPTransaction['type']): 'default' | 'joy' | 'info' | 'success' | 'warning' | 'danger' | 'brand' => {
    switch (type) {
      case 'earned':
        return 'success'
      case 'allocated':
        return 'info'
      case 'reclaimed':
        return 'default'
      default:
        return 'default'
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Allocation History</CardTitle>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-7 text-xs px-2"
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('active')}
              className="h-7 text-xs px-2"
            >
              Active
            </Button>
            <Button
              variant={filter === 'reclaimed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('reclaimed')}
              className="h-7 text-xs px-2"
            >
              Reclaimed
            </Button>
          </div>

          <div className="flex gap-1 ml-auto">
            <Button
              variant={dateRange === '7d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('7d')}
              className="h-7 text-xs px-2"
            >
              7 days
            </Button>
            <Button
              variant={dateRange === '30d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('30d')}
              className="h-7 text-xs px-2"
            >
              30 days
            </Button>
            <Button
              variant={dateRange === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('all')}
              className="h-7 text-xs px-2"
            >
              All time
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            No transactions found for the selected filters
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={getTypeVariant(tx.type)}
                        className="text-xs py-0 px-2 capitalize"
                      >
                        {tx.type}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {formatDate(tx.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-1">
                      {tx.description}
                    </p>
                    {tx.sourceType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        Source: {tx.sourceType}
                        {tx.sourceId && ` • ID: ${tx.sourceId.slice(0, 8)}...`}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        tx.amount > 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}{tx.amount} SP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
