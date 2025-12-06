/**
 * MetricsEvaluationForm Component
 *
 * Form for entering actual measurements during evaluation
 */

'use client'

import { useState } from 'react'
import type { Metric, ConfidenceLevel, MetricValue } from '@togetheros/types'

export interface MetricMeasurement {
  metricId: string
  actual: MetricValue
  notes?: string
}

export interface MetricsEvaluationFormProps {
  /** Initiative title */
  initiativeTitle: string
  /** Metrics to evaluate */
  metrics: Metric[]
  /** Callback when form is submitted */
  onSubmit: (measurements: MetricMeasurement[]) => void
  /** Callback when cancelled */
  onCancel?: () => void
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Optional CSS class name */
  className?: string
}

export function MetricsEvaluationForm({
  initiativeTitle,
  metrics,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: MetricsEvaluationFormProps) {
  const [measurements, setMeasurements] = useState<Record<string, MetricMeasurement>>(
    Object.fromEntries(
      metrics.map((m) => [
        m.id,
        {
          metricId: m.id,
          actual: {
            value: typeof m.target.value === 'number' ? 0 : '',
            confidence: 'medium' as ConfidenceLevel,
          },
          notes: '',
        },
      ])
    )
  )

  const updateMeasurement = (metricId: string, field: keyof MetricMeasurement, value: unknown) => {
    setMeasurements((prev) => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: value,
      },
    }))
  }

  const updateActual = (metricId: string, field: keyof MetricValue, value: unknown) => {
    setMeasurements((prev) => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        actual: {
          ...prev[metricId].actual,
          [field]: value,
        },
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(Object.values(measurements))
  }

  const calculateVariance = (target: number | string | boolean, actual: number | string | boolean): string => {
    if (typeof target !== 'number' || typeof actual !== 'number') return 'N/A'
    if (target === 0) return actual === 0 ? '0%' : 'N/A'
    const variance = ((actual - target) / target) * 100
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Evaluate Metrics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Enter measured outcomes for: {initiativeTitle}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to Evaluate
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>Enter the actual measured value for each metric</li>
          <li>Indicate your confidence level in the measurement</li>
          <li>Add evidence URLs if available (helps validate results)</li>
          <li>Include notes explaining how you measured or any context</li>
        </ul>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {metrics.map((metric) => {
          const measurement = measurements[metric.id]
          const variance = calculateVariance(metric.target.value, measurement.actual.value)

          return (
            <div
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Metric Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
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
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                    Target
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {String(metric.target.value)} {metric.unit}
                  </div>
                </div>
              </div>

              {/* Measurement Inputs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actual Value *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={typeof metric.target.value === 'number' ? 'number' : 'text'}
                      value={measurement.actual.value as string | number}
                      onChange={(e) =>
                        updateActual(
                          metric.id,
                          'value',
                          typeof metric.target.value === 'number'
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500 dark:text-gray-400">{metric.unit}</span>
                  </div>
                  {typeof metric.target.value === 'number' && (
                    <div className={`text-sm mt-1 ${
                      variance.startsWith('+') || variance === '0%'
                        ? 'text-green-600 dark:text-green-400'
                        : variance === 'N/A'
                        ? 'text-gray-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Variance: {variance}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confidence
                  </label>
                  <select
                    value={measurement.actual.confidence || 'medium'}
                    onChange={(e) => updateActual(metric.id, 'confidence', e.target.value as ConfidenceLevel)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="high">High - Verified data</option>
                    <option value="medium">Medium - Reasonable estimate</option>
                    <option value="low">Low - Best guess</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Evidence URL
                  </label>
                  <input
                    type="url"
                    value={measurement.actual.evidenceUrls?.[0] || ''}
                    onChange={(e) =>
                      updateActual(metric.id, 'evidenceUrls', e.target.value ? [e.target.value] : undefined)
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={measurement.notes || ''}
                  onChange={(e) => updateMeasurement(metric.id, 'notes', e.target.value)}
                  rows={2}
                  placeholder="How did you measure this? Any relevant context?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </div>
    </form>
  )
}
