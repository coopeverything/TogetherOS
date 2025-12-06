'use client'

import { useState } from 'react'

interface ModuleCardProps {
  title: string
  description: string
  progress: number
  status: 'complete' | 'in-progress' | 'planned'
  repoPath?: string
  docsPath?: string
  category?: string
}

export function ModuleCard({
  title,
  description,
  progress,
  status,
  repoPath,
  docsPath,
  category,
}: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const statusColors = {
    complete: 'bg-green-100 text-green-800 border-green-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    planned: 'bg-gray-100 dark:bg-gray-700 text-gray-600 border-gray-200 dark:border-gray-700',
  }

  const statusLabels = {
    complete: 'Production',
    'in-progress': 'In Development',
    planned: 'Planned',
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="text-gray-400 text-sm">
            {isOpen ? '▼' : '▶'}
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h3>
            {category && (
              <p className="text-sm text-gray-500 mt-0.5">{category}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">
              {progress}% complete
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${statusColors[status]}`}
            >
              {statusLabels[status]}
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Overview
              </h4>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Progress Bar */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Progress
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-3 pt-2">
              {docsPath && (
                <a
                  href={docsPath}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📄 Learn More
                </a>
              )}
              {repoPath && (
                <a
                  href={repoPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-500"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View Source
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
