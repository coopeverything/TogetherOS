/**
 * MetricsDashboard Component
 *
 * Platform-wide metrics analytics dashboard
 */

'use client'

import type { MetricsAnalytics, MetricTemplateCategory } from '@togetheros/types'

export interface MetricsDashboardProps {
  /** Analytics data */
  analytics: MetricsAnalytics
  /** Optional CSS class name */
  className?: string
}

const categoryLabels: Record<MetricTemplateCategory, string> = {
  community_project: 'Community Projects',
  platform_feature: 'Platform Features',
  event: 'Events',
  policy: 'Policies',
  infrastructure: 'Infrastructure',
  education: 'Education',
  custom: 'Custom',
}

export function MetricsDashboard({ analytics, className = '' }: MetricsDashboardProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white">
          Metrics Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Platform-wide initiative success tracking
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Initiatives
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
            {analytics.totalInitiatives}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            With defined metrics
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Evaluated
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
            {analytics.evaluatedCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {analytics.totalInitiatives > 0
              ? `${((analytics.evaluatedCount / analytics.totalInitiatives) * 100).toFixed(0)}% completion rate`
              : 'No initiatives yet'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Success Rate
          </div>
          <div className={`text-sm font-bold mt-1 ${
            analytics.overallSuccessRate >= 70
              ? 'text-green-600 dark:text-green-400'
              : analytics.overallSuccessRate >= 50
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {analytics.overallSuccessRate.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overall success
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Minority Validation
          </div>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
            {(analytics.minorityValidationRate * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Minority reports validated
          </div>
        </div>
      </div>

      {/* Success by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Success Rate by Category
        </h2>
        <div className="space-y-2">
          {(Object.entries(analytics.successByCategory) as [MetricTemplateCategory, number][]).map(
            ([category, rate]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {categoryLabels[category]}
                  </span>
                  <span className={`text-sm font-medium ${
                    rate >= 70
                      ? 'text-green-600 dark:text-green-400'
                      : rate >= 50
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {rate.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rate >= 70
                        ? 'bg-green-500'
                        : rate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Failure Patterns */}
      {analytics.failurePatterns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Common Failure Patterns
          </h2>
          <div className="space-y-2">
            {analytics.failurePatterns.map((pattern, index) => (
              <div
                key={index}
                className="border-l-4 border-red-400 pl-4 py-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {pattern.description}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Affects: {pattern.affectedCategories.map(c => categoryLabels[c]).join(', ')}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {pattern.frequency}x
                  </span>
                </div>
                {pattern.preventiveMeasures.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      Prevention
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside">
                      {pattern.preventiveMeasures.map((measure, i) => (
                        <li key={i}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Loop Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Feedback Loop Effectiveness
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {(analytics.improvementSuccessRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Improvement proposals succeed on re-evaluation
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {(analytics.minorityValidationRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Minority reports validated (dissenters were right)
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 text-center">
          The feedback loop converts failures into learning opportunities
        </p>
      </div>
    </div>
  )
}
