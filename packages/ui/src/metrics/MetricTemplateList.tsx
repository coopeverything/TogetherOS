/**
 * MetricTemplateList Component
 *
 * Browse and select reusable metric templates
 */

'use client'

import { useState } from 'react'
import type { MetricTemplate, MetricTemplateCategory } from '@togetheros/types'

export interface MetricTemplateListProps {
  /** List of templates */
  templates: MetricTemplate[]
  /** Callback when a template is selected */
  onSelectTemplate?: (template: MetricTemplate) => void
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

const categoryIcons: Record<MetricTemplateCategory, string> = {
  community_project: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  platform_feature: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  event: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  policy: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  infrastructure: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  education: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  custom: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
}

export function MetricTemplateList({
  templates,
  onSelectTemplate,
  className = '',
}: MetricTemplateListProps) {
  const [categoryFilter, setCategoryFilter] = useState<MetricTemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-sm font-bold text-gray-900 dark:text-white">
          Metric Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Reusable metric definitions for common initiative types
        </p>
      </div>

      {/* Filters */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as MetricTemplateCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No templates found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {templates.length === 0
              ? 'Templates will be added as initiatives are tracked'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate?.(template)}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                onSelectTemplate ? 'cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors' : ''
              }`}
            >
              {/* Icon and Category */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={categoryIcons[template.category]}
                    />
                  </svg>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {categoryLabels[template.category]}
                </span>
              </div>

              {/* Name and Description */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {template.metrics.length} metrics
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    Used {template.timesUsed}x
                  </span>
                  <span className={`font-medium ${
                    template.successRate >= 70
                      ? 'text-green-600 dark:text-green-400'
                      : template.successRate >= 50
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {template.successRate.toFixed(0)}% success
                  </span>
                </div>
              </div>

              {/* Metric Preview */}
              {template.metrics.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-2">
                    Included Metrics
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {template.metrics.slice(0, 3).map((metric, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {metric.name}
                        {metric.mandatory && (
                          <span className="text-xs text-orange-500">*</span>
                        )}
                      </li>
                    ))}
                    {template.metrics.length > 3 && (
                      <li className="text-gray-400 dark:text-gray-500">
                        +{template.metrics.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
