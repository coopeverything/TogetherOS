/**
 * CompactMetrics Component
 *
 * Small oval badges showing key metrics.
 * Much more compact than large stat cards (75% smaller).
 */

'use client'

export interface MetricProps {
  /** Icon or emoji */
  icon: string

  /** Metric value */
  value: number | string

  /** Label shown on hover */
  label: string

  /** Optional click handler */
  onClick?: () => void
}

export function CompactMetric({ icon, value, label, onClick }: MetricProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full transition-colors text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
    >
      <span className="text-sm">{icon}</span>
      <span>{value}</span>
    </button>
  )
}

export interface CompactMetricsProps {
  metrics: MetricProps[]
  className?: string
}

export function CompactMetrics({ metrics, className = '' }: CompactMetricsProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {metrics.map((metric, index) => (
        <CompactMetric key={index} {...metric} />
      ))}
    </div>
  )
}
