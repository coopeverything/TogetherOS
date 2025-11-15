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
    planned: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  const statusLabels = {
    complete: 'Production',
    'in-progress': 'In Development',
    planned: 'Planned',
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="text-gray-400 text-xl">
            {isOpen ? '▼' : '▶'}
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-4">
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
                  📄 View Documentation
                </a>
              )}
              {repoPath && (
                <a
                  href={repoPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  🔗 View Source
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
