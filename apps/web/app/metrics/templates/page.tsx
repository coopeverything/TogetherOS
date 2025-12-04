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

// Fixture data for development
const fixtureTemplates: MetricTemplate[] = [
  {
    id: 'template-1',
    name: 'Community Project Metrics',
    category: 'community_project',
    description: 'Standard metrics for community-driven projects including participation, satisfaction, and resource utilization.',
    metrics: [
      {
        name: 'Active Participants',
        description: 'Number of members actively participating (visited 2+ times/month)',
        unit: 'members',
        measurementMethod: 'database_query',
        weight: 10,
        mandatory: true,
      },
      {
        name: 'Member Satisfaction',
        description: 'Percentage of participants who rate experience 4+ stars',
        unit: 'percentage',
        measurementMethod: 'survey',
        weight: 8,
        mandatory: true,
      },
      {
        name: 'Resource Utilization',
        description: 'Percentage of allocated resources actually used',
        unit: 'percentage',
        measurementMethod: 'manual_count',
        weight: 6,
        mandatory: false,
      },
    ],
    timesUsed: 12,
    successRate: 75,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'template-2',
    name: 'Platform Feature Metrics',
    category: 'platform_feature',
    description: 'Track adoption, bugs, and user satisfaction for new platform features.',
    metrics: [
      {
        name: 'User Adoption',
        description: 'Percentage of active members using feature at least once',
        unit: 'percentage',
        measurementMethod: 'database_query',
        weight: 10,
        mandatory: true,
      },
      {
        name: 'Bug Reports',
        description: 'Number of P1/P2 bugs reported in first 30 days',
        unit: 'bugs',
        measurementMethod: 'external_data',
        weight: 8,
        mandatory: true,
      },
      {
        name: 'Net Promoter Score',
        description: 'NPS score for feature (would you recommend?)',
        unit: 'nps_score',
        measurementMethod: 'survey',
        weight: 7,
        mandatory: false,
      },
      {
        name: 'Task Completion Rate',
        description: 'Percentage of users who complete intended workflow',
        unit: 'percentage',
        measurementMethod: 'database_query',
        weight: 9,
        mandatory: false,
      },
    ],
    timesUsed: 8,
    successRate: 62,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'template-3',
    name: 'Event Success Metrics',
    category: 'event',
    description: 'Measure event success through attendance, feedback, and follow-up engagement.',
    metrics: [
      {
        name: 'Attendance Rate',
        description: 'Percentage of registered attendees who showed up',
        unit: 'percentage',
        measurementMethod: 'manual_count',
        weight: 8,
        mandatory: true,
      },
      {
        name: 'Post-Event Rating',
        description: 'Average rating from post-event feedback survey',
        unit: 'stars',
        measurementMethod: 'survey',
        weight: 9,
        mandatory: true,
      },
      {
        name: 'Follow-up Engagement',
        description: 'Percentage of attendees who engage with follow-up content/actions',
        unit: 'percentage',
        measurementMethod: 'database_query',
        weight: 7,
        mandatory: false,
      },
    ],
    timesUsed: 15,
    successRate: 80,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: 'template-4',
    name: 'Policy Implementation Metrics',
    category: 'policy',
    description: 'Track policy adoption, compliance, and impact on community behavior.',
    metrics: [
      {
        name: 'Awareness Rate',
        description: 'Percentage of members aware of the new policy',
        unit: 'percentage',
        measurementMethod: 'survey',
        weight: 7,
        mandatory: false,
      },
      {
        name: 'Compliance Rate',
        description: 'Percentage of interactions following new policy guidelines',
        unit: 'percentage',
        measurementMethod: 'manual_count',
        weight: 10,
        mandatory: true,
      },
      {
        name: 'Intended Outcome Achievement',
        description: 'Whether the policy achieved its stated goal',
        unit: 'yes/no',
        measurementMethod: 'qualitative',
        weight: 10,
        mandatory: true,
      },
    ],
    timesUsed: 5,
    successRate: 60,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'template-5',
    name: 'Educational Initiative Metrics',
    category: 'education',
    description: 'Measure learning outcomes, engagement, and skill application for educational programs.',
    metrics: [
      {
        name: 'Completion Rate',
        description: 'Percentage of enrolled participants who complete the program',
        unit: 'percentage',
        measurementMethod: 'database_query',
        weight: 9,
        mandatory: true,
      },
      {
        name: 'Knowledge Assessment',
        description: 'Average score improvement from pre to post assessment',
        unit: 'percentage',
        measurementMethod: 'database_query',
        weight: 10,
        mandatory: true,
      },
      {
        name: 'Skill Application',
        description: 'Percentage of graduates who apply skills within 30 days',
        unit: 'percentage',
        measurementMethod: 'survey',
        weight: 8,
        mandatory: false,
      },
      {
        name: 'Peer Teaching',
        description: 'Number of graduates who teach others what they learned',
        unit: 'members',
        measurementMethod: 'manual_count',
        weight: 6,
        mandatory: false,
      },
    ],
    timesUsed: 7,
    successRate: 85,
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-09-30'),
  },
]

export default function MetricTemplatesPage() {
  const [templates, setTemplates] = useState<MetricTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // TODO: Replace with actual API call when implemented
        // const response = await fetch('/api/metrics/templates')
        // if (!response.ok) throw new Error(`Failed to fetch templates: ${response.statusText}`)
        // const data = await response.json()
        // setTemplates(data.templates || [])

        // Using fixture data for now
        await new Promise(resolve => setTimeout(resolve, 500))
        setTemplates(fixtureTemplates)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Templates
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
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
          <li className="text-gray-900 dark:text-white">Templates</li>
        </ol>
      </nav>

      {/* Templates List */}
      <MetricTemplateList
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          About Metric Templates
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Templates are reusable sets of metrics for common initiative types. Using templates
          ensures consistent measurement across similar initiatives and helps identify patterns
          over time. Success rates are calculated based on initiatives that used each template
          and met their defined goals.
        </p>
      </div>
    </div>
  )
}
