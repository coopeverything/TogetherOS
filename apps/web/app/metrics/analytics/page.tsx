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

export default function MetricsAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MetricsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const response = await fetch('/api/initiative-metrics/analytics')
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`)
        }
        const data = await response.json()
        setAnalytics(data.analytics)
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
          <p className="text-lg text-ink-700">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50/20 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-red-700">{error || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-ink-400">
          <li>
            <Link href="/metrics" className="hover:text-orange-600">
              Metrics
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink-900">Analytics</li>
        </ol>
      </nav>

      {/* Dashboard */}
      <MetricsDashboard analytics={analytics} />

      {/* Key Insights */}
      <div className="bg-bg-1 rounded-lg border border-border p-6 mt-8">
        <h2 className="text-lg font-semibold text-ink-900 mb-4">
          Key Insights
        </h2>
        <div className="space-y-4 text-ink-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100/30 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>
              <strong className="text-ink-900">Education initiatives</strong> have
              the highest success rate at 85%. Consider applying educational initiative patterns to
              other categories.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-100/30 rounded-full">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p>
              <strong className="text-ink-900">Platform features</strong> have a
              58% success rate, the lowest category. Review the failure patterns above for improvement
              opportunities.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-100/30 rounded-full">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>
              <strong className="text-ink-900">42% of minority reports</strong> have
              been validated, meaning dissenters were right nearly half the time. This highlights the
              importance of preserving and reviewing minority perspectives.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-100/30 rounded-full">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p>
              <strong className="text-ink-900">71% improvement success rate</strong>
              {' '}shows the feedback loop is working. Initiatives that fail and generate improvement
              proposals have a good chance of succeeding on the second attempt.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
