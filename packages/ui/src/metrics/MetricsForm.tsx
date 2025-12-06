/**
 * MetricsForm Component
 *
 * Form for defining metrics for an initiative
 */

'use client'

import { useState } from 'react'
import type { Metric, EvaluationSchedule, MeasurementMethod, ConfidenceLevel } from '@togetheros/types'

export interface MetricsFormData {
  initiativeId: string
  evaluationSchedule: EvaluationSchedule
  customEvaluationDate?: string
  metrics: Omit<Metric, 'id' | 'actual' | 'status' | 'variance' | 'notes'>[]
}

export interface MetricsFormProps {
  /** Initiative ID to define metrics for */
  initiativeId: string
  /** Initiative title for display */
  initiativeTitle: string
  /** Callback when form is submitted */
  onSubmit: (data: MetricsFormData) => void
  /** Callback when cancelled */
  onCancel?: () => void
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Optional CSS class name */
  className?: string
}

const scheduleOptions: { value: EvaluationSchedule; label: string }[] = [
  { value: 'immediate', label: 'Immediately after delivery' },
  { value: '30-days', label: '30 days after delivery' },
  { value: '90-days', label: '90 days after delivery' },
  { value: '6-months', label: '6 months after delivery' },
  { value: '1-year', label: '1 year after delivery' },
  { value: 'custom', label: 'Custom date' },
]

const measurementOptions: { value: MeasurementMethod; label: string }[] = [
  { value: 'database_query', label: 'Database Query (automatic)' },
  { value: 'survey', label: 'Community Survey' },
  { value: 'manual_count', label: 'Manual Count/Observation' },
  { value: 'external_data', label: 'External Data Source' },
  { value: 'qualitative', label: 'Qualitative Assessment' },
]

const emptyMetric = (): Omit<Metric, 'id' | 'actual' | 'status' | 'variance' | 'notes'> => ({
  name: '',
  description: '',
  target: { value: 0, confidence: 'medium' },
  unit: '',
  measurementMethod: 'manual_count',
  weight: 5,
  mandatory: false,
})

export function MetricsForm({
  initiativeId,
  initiativeTitle,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: MetricsFormProps) {
  const [evaluationSchedule, setEvaluationSchedule] = useState<EvaluationSchedule>('30-days')
  const [customDate, setCustomDate] = useState('')
  const [metrics, setMetrics] = useState<Omit<Metric, 'id' | 'actual' | 'status' | 'variance' | 'notes'>[]>([emptyMetric()])

  const addMetric = () => {
    if (metrics.length < 10) {
      setMetrics([...metrics, emptyMetric()])
    }
  }

  const removeMetric = (index: number) => {
    if (metrics.length > 1) {
      setMetrics(metrics.filter((_, i) => i !== index))
    }
  }

  const updateMetric = <K extends keyof Omit<Metric, 'id' | 'actual' | 'status' | 'variance' | 'notes'>>(
    index: number,
    field: K,
    value: Omit<Metric, 'id' | 'actual' | 'status' | 'variance' | 'notes'>[K]
  ) => {
    const updated = [...metrics]
    updated[index] = { ...updated[index], [field]: value }
    setMetrics(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      initiativeId,
      evaluationSchedule,
      customEvaluationDate: evaluationSchedule === 'custom' ? customDate : undefined,
      metrics,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Define Success Metrics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          For: {initiativeTitle}
        </p>
      </div>

      {/* Evaluation Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Evaluation Schedule
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          When should we measure whether this initiative achieved its goals?
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule
            </label>
            <select
              value={evaluationSchedule}
              onChange={(e) => setEvaluationSchedule(e.target.value as EvaluationSchedule)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {scheduleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {evaluationSchedule === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                required={evaluationSchedule === 'custom'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Success Metrics ({metrics.length}/10)
          </h3>
          <button
            type="button"
            onClick={addMetric}
            disabled={metrics.length >= 10}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Metric
          </button>
        </div>

        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Metric {index + 1}
              </h4>
              {metrics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMetric(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric Name *
                </label>
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) => updateMetric(index, 'name', e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="e.g., Active Participants"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={metric.description}
                  onChange={(e) => updateMetric(index, 'description', e.target.value)}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={2}
                  placeholder="What exactly will be measured?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Target Value Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    value={typeof metric.target.value === 'number' ? metric.target.value : 0}
                    onChange={(e) => updateMetric(index, 'target', { ...metric.target, value: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={metric.unit}
                    onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                    required
                    placeholder="members, %, hours"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confidence
                  </label>
                  <select
                    value={metric.target.confidence || 'medium'}
                    onChange={(e) => updateMetric(index, 'target', { ...metric.target, confidence: e.target.value as ConfidenceLevel })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Measurement Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Measurement Method
                  </label>
                  <select
                    value={metric.measurementMethod}
                    onChange={(e) => updateMetric(index, 'measurementMethod', e.target.value as MeasurementMethod)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {measurementOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Source
                  </label>
                  <input
                    type="text"
                    value={metric.dataSource || ''}
                    onChange={(e) => updateMetric(index, 'dataSource', e.target.value)}
                    placeholder="Where to get the data"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Weight and Mandatory */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight (1-10)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={metric.weight}
                    onChange={(e) => updateMetric(index, 'weight', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {metric.weight}
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metric.mandatory}
                      onChange={(e) => updateMetric(index, 'mandatory', e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Required for success
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
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
          {isSubmitting ? 'Saving...' : 'Save Metrics'}
        </button>
      </div>
    </form>
  )
}
