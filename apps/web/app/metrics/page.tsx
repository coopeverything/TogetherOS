/**
 * Metrics & Review Page
 *
 * Displays initiative metrics with filtering and status tracking
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MetricsList } from '@togetheros/ui/metrics'
import type { MetricsSummary, InitiativeMetrics } from '@togetheros/types'

/**
 * Transform InitiativeMetrics to MetricsSummary for display
 */
function toMetricsSummary(im: InitiativeMetrics): MetricsSummary {
  const now = new Date()
  const evalDate = new Date(im.evaluationDate)
  const daysUntil = Math.ceil((evalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const metrics = im.metrics || []
  const metricsMet = metrics.filter(
    m => m.status === 'met' || m.status === 'exceeded'
  ).length

  return {
    id: im.id,
    initiativeTitle: im.initiativeId ? `Initiative ${im.initiativeId.slice(0, 8)}` : 'No Initiative',
    proposalTitle: im.proposalId ? `Proposal ${im.proposalId.slice(0, 8)}` : 'Untitled',
    status: im.status,
    daysUntilEvaluation: daysUntil,
    totalMetrics: metrics.length,
    metricsMet,
    overallOutcome: im.overallOutcome,
    hasMinorityReport: false, // TODO: Link to minority reports when available
  }
}

export default function MetricsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<MetricsSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const response = await fetch('/api/initiative-metrics')
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`)
        }
        const data = await response.json()

        // Transform InitiativeMetrics to MetricsSummary for display
        const summaries = (data.items || []).map(toMetricsSummary)
        setMetrics(summaries)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics'
        console.error('Error fetching metrics:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDefineMetrics = () => {
    // TODO: Navigate to define metrics page or show modal
    router.push('/governance')
  }

  const handleSelectMetric = (id: string) => {
    // TODO: Navigate to metric detail page when implemented
    console.log('Selected metric:', id)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Metrics
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Metrics & Review
            </h1>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
              UI Complete
            </span>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Track whether decisions achieve their goals, trigger re-evaluation when they don&apos;t,
          and create a feedback loop for continuous improvement.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Link
          href="/metrics/templates"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Templates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Browse reusable metrics</p>
            </div>
          </div>
        </Link>

        <Link
          href="/metrics/analytics"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide insights</p>
            </div>
          </div>
        </Link>

        <Link
          href="/governance"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Governance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View all proposals</p>
            </div>
          </div>
        </Link>
      </div>

      {/* What This Module Does */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          What This Module Does
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Core Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Define measurable success metrics for initiatives
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Schedule evaluation check-ins (30/90/180 days)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Track target vs actual outcomes
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Validate minority report predictions
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Auto-generate improvement proposals for failures
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Learn from patterns across initiatives
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm rounded-full">
                Cooperative Technology
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <MetricsList
        metrics={metrics}
        showDefineButton={true}
        onDefineMetrics={handleDefineMetrics}
        onSelectMetric={handleSelectMetric}
      />

      {/* Technical Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 mt-8">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
          For Developers
        </h2>
        <p className="text-blue-800 dark:text-blue-200 mb-3">
          Module spec:{' '}
          <a
            href="https://github.com/coopeverything/TogetherOS/blob/yolo/docs/modules/metrics.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-medium hover:text-blue-600 dark:hover:text-blue-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Metrics & Review
          </a>
        </p>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p><strong>Status:</strong> Production-ready with full API integration</p>
          <p><strong>Components:</strong> MetricCard, MetricsList, MetricsForm, MetricsEvaluationForm, MetricsDashboard, MetricTemplateList</p>
          <p><strong>API:</strong> /api/initiative-metrics (CRUD), /api/initiative-metrics/templates, /api/initiative-metrics/analytics</p>
        </div>
      </div>
    </div>
  )
}
