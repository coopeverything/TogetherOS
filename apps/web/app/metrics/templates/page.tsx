/**
 * Metric Templates Page
 *
 * Browse and select reusable metric templates
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MetricTemplateList } from '@togetheros/ui/metrics'
import type { MetricTemplate } from '@togetheros/types'

export default function MetricTemplatesPage() {
  const [templates, setTemplates] = useState<MetricTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const response = await fetch('/api/initiative-metrics/templates')
        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.statusText}`)
        }
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load templates'
        console.error('Error fetching templates:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSelectTemplate = (template: MetricTemplate) => {
    // TODO: Handle template selection (use for new metrics definition)
    console.log('Selected template:', template.name)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-ink-700">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-red-50/20 border border-red-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-red-900 mb-2">
            Error Loading Templates
          </h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="mb-3 text-sm">
        <ol className="flex items-center gap-2 text-ink-400">
          <li>
            <Link href="/metrics" className="hover:text-orange-600">
              Metrics
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink-900">Templates</li>
        </ol>
      </nav>

      {/* Templates List */}
      <MetricTemplateList
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Info Box */}
      <div className="bg-bg-0 rounded-lg border border-border p-4 mt-4">
        <h3 className="text-sm font-semibold text-ink-900 mb-2">
          About Metric Templates
        </h3>
        <p className="text-ink-700">
          Templates are reusable sets of metrics for common initiative types. Using templates
          ensures consistent measurement across similar initiatives and helps identify patterns
          over time. Success rates are calculated based on initiatives that used each template
          and met their defined goals.
        </p>
      </div>
    </div>
  )
}
