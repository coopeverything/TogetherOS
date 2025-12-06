/**
 * MetricsList Component
 *
 * Displays a filterable list of initiative metrics
 */

'use client'

import { useState } from 'react'
import type { MetricsSummary, MetricStatus, MetricOutcome } from '@togetheros/types'

export interface MetricsListProps {
  /** List of metrics summaries to display */
  metrics: MetricsSummary[]
  /** Show define metrics button */
  showDefineButton?: boolean
  /** Callback when define button clicked */
  onDefineMetrics?: () => void
  /** Callback when a metric row is clicked */
  onSelectMetric?: (id: string) => void
  /** Optional CSS class name */
  className?: string
}

const statusColors: Record<MetricStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  ready_for_evaluation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_evaluation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  evaluated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  improvement_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

const statusLabels: Record<MetricStatus, string> = {
  pending: 'Pending',
  ready_for_evaluation: 'Ready to Evaluate',
  in_evaluation: 'In Evaluation',
  evaluated: 'Evaluated',
  improvement_pending: 'Needs Improvement',
}

const outcomeColors: Record<MetricOutcome, string> = {
  succeeded: 'text-green-600 dark:text-green-400',
  failed: 'text-red-600 dark:text-red-400',
  mixed: 'text-yellow-600 dark:text-yellow-400',
  inconclusive: 'text-gray-600 dark:text-gray-400',
}

export function MetricsList({
  metrics,
  showDefineButton = true,
  onDefineMetrics,
  onSelectMetric,
  className = '',
}: MetricsListProps) {
  const [statusFilter, setStatusFilter] = useState<MetricStatus | 'all'>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<MetricOutcome | 'all'>('all')

  const filteredMetrics = metrics.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (outcomeFilter !== 'all' && m.overallOutcome !== outcomeFilter) return false
    return true
  })

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metrics & Review</h1>
        {showDefineButton && onDefineMetrics && (
          <button
            onClick={onDefineMetrics}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Define Metrics
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MetricStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="ready_for_evaluation">Ready to Evaluate</option>
              <option value="in_evaluation">In Evaluation</option>
              <option value="evaluated">Evaluated</option>
              <option value="improvement_pending">Needs Improvement</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Outcome
            </label>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as MetricOutcome | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Outcomes</option>
              <option value="succeeded">Succeeded</option>
              <option value="mixed">Mixed</option>
              <option value="failed">Failed</option>
              <option value="inconclusive">Inconclusive</option>
            </select>
          </div>
        </div>
        <div className="text-base text-gray-600 dark:text-gray-400">
          Showing {filteredMetrics.length} of {metrics.length} initiatives
        </div>
      </div>

      {/* Metrics List */}
      {filteredMetrics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xl mb-2">No metrics found</p>
          <p className="text-gray-400 dark:text-gray-500 text-base">
            {metrics.length === 0
              ? 'Define metrics for initiatives to track their success'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMetrics.map((metric) => (
            <div
              key={metric.id}
              onClick={() => onSelectMetric?.(metric.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                onSelectMetric ? 'cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {metric.initiativeTitle}
                  </h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                    From: {metric.proposalTitle}
                  </p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-medium rounded ${statusColors[metric.status]}`}>
                  {statusLabels[metric.status]}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-6 text-base">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {metric.metricsMet}/{metric.totalMetrics} metrics met
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`${metric.daysUntilEvaluation < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {metric.daysUntilEvaluation < 0
                      ? `${Math.abs(metric.daysUntilEvaluation)} days overdue`
                      : metric.daysUntilEvaluation === 0
                      ? 'Due today'
                      : `${metric.daysUntilEvaluation} days until evaluation`}
                  </span>
                </div>

                {metric.hasMinorityReport && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={metric.minorityValidated ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}>
                      Minority Report {metric.minorityValidated && '(Validated)'}
                    </span>
                  </div>
                )}

                {metric.overallOutcome && (
                  <span className={`font-medium capitalize ${outcomeColors[metric.overallOutcome]}`}>
                    {metric.overallOutcome}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
