/**
 * Metrics Analytics Page
 *
 * Platform-wide metrics dashboard and insights
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MetricsDashboard } from '@togetheros/ui/metrics'
import type { MetricsAnalytics } from '@togetheros/types'

// Fixture data for development
const fixtureAnalytics: MetricsAnalytics = {
  totalInitiatives: 47,
  evaluatedCount: 32,
  overallSuccessRate: 68,
  successByCategory: {
    community_project: 72,
    platform_feature: 58,
    event: 81,
    policy: 55,
    infrastructure: 70,
    education: 85,
    custom: 50,
  },
  failurePatterns: [
    {
      description: 'Unrealistic timelines set during planning phase',
      frequency: 8,
      affectedCategories: ['platform_feature', 'infrastructure'],
      preventiveMeasures: [
        'Add buffer time (20-30%) to initial estimates',
        'Break initiatives into smaller phases',
        'Include risk assessment in planning',
      ],
    },
    {
      description: 'Insufficient community engagement before launch',
      frequency: 6,
      affectedCategories: ['community_project', 'policy'],
      preventiveMeasures: [
        'Conduct stakeholder interviews during research phase',
        'Create feedback loops during implementation',
        'Set engagement metrics as mandatory success criteria',
      ],
    },
    {
      description: 'Metrics defined too late in project lifecycle',
      frequency: 5,
      affectedCategories: ['community_project', 'platform_feature', 'event'],
      preventiveMeasures: [
        'Define metrics during proposal phase (not delivery)',
        'Use metric templates for common initiative types',
        'Review metrics definition before voting phase',
      ],
    },
  ],
  minorityValidationRate: 0.42,
  improvementSuccessRate: 0.71,
}

export default function MetricsAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MetricsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // TODO: Replace with actual API call when implemented
        // const response = await fetch('/api/metrics/analytics')
        // if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.statusText}`)
        // const data = await response.json()
        // setAnalytics(data)

        // Using fixture data for now
        await new Promise(resolve => setTimeout(resolve, 500))
        setAnalytics(fixtureAnalytics)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
        console.error('Error fetching analytics:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-red-700 dark:text-red-300">{error || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/metrics" className="hover:text-orange-600 dark:hover:text-orange-400">
              Metrics
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white">Analytics</li>
        </ol>
      </nav>

      {/* Dashboard */}
      <MetricsDashboard analytics={analytics} />

      {/* Key Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Insights
        </h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>
              <strong className="text-gray-900 dark:text-white">Education initiatives</strong> have
              the highest success rate at 85%. Consider applying educational initiative patterns to
              other categories.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p>
              <strong className="text-gray-900 dark:text-white">Platform features</strong> have a
              58% success rate, the lowest category. Review the failure patterns above for improvement
              opportunities.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>
              <strong className="text-gray-900 dark:text-white">42% of minority reports</strong> have
              been validated, meaning dissenters were right nearly half the time. This highlights the
              importance of preserving and reviewing minority perspectives.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p>
              <strong className="text-gray-900 dark:text-white">71% improvement success rate</strong>
              {' '}shows the feedback loop is working. Initiatives that fail and generate improvement
              proposals have a good chance of succeeding on the second attempt.
            </p>
          </div>
        </div>
      </div>

      {/* Data Note */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <strong>Note:</strong> Analytics are displayed using sample data for demonstration.
          Production data will be aggregated from actual initiative metrics once the module is
          fully integrated with the database.
        </p>
      </div>
    </div>
  )
}
