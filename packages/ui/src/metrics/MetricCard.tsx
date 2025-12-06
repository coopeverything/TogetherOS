/**
 * MetricCard Component
 *
 * Displays a single metric with target vs actual values
 */

'use client'

import type { Metric, MetricResultStatus } from '@togetheros/types'

export interface MetricCardProps {
  /** The metric to display */
  metric: Metric
  /** Whether to show edit controls */
  editable?: boolean
  /** Callback when edit is clicked */
  onEdit?: (metric: Metric) => void
  /** Optional CSS class name */
  className?: string
}

const statusColors: Record<MetricResultStatus, string> = {
  exceeded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  met: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  partially_met: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  not_met: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  not_measured: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const statusLabels: Record<MetricResultStatus, string> = {
  exceeded: 'Exceeded',
  met: 'Met',
  partially_met: 'Partially Met',
  not_met: 'Not Met',
  not_measured: 'Not Measured',
}

export function MetricCard({
  metric,
  editable = false,
  onEdit,
  className = '',
}: MetricCardProps) {
  const hasActual = metric.actual !== undefined
  const varianceDisplay = metric.variance !== undefined
    ? `${metric.variance > 0 ? '+' : ''}${metric.variance.toFixed(1)}%`
    : null

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {metric.name}
            </h3>
            {metric.mandatory && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {metric.description}
          </p>
        </div>
        {editable && onEdit && (
          <button
            onClick={() => onEdit(metric)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">
            Target
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {String(metric.target.value)} {metric.unit}
          </div>
          {metric.target.confidence && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {metric.target.confidence} confidence
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">
            Actual
          </div>
          {hasActual ? (
            <>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {String(metric.actual!.value)} {metric.unit}
              </div>
              {varianceDisplay && (
                <div className={`text-xs ${metric.variance! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {varianceDisplay} from target
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-600">
              Pending
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>Weight: {metric.weight}/10</span>
          <span className="capitalize">{metric.measurementMethod.replace('_', ' ')}</span>
        </div>
        {metric.status && (
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[metric.status]}`}>
            {statusLabels[metric.status]}
          </span>
        )}
      </div>

      {/* Notes */}
      {metric.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">
            Evaluator Notes
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{metric.notes}</p>
        </div>
      )}
    </div>
  )
}
