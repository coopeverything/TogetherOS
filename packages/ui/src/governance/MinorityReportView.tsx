/**
 * MinorityReportView Component
 *
 * Displays the minority report for a proposal
 * with generate/edit capabilities for authorized users
 */

'use client'

import { useState } from 'react'

export interface MinorityReportViewProps {
  /** The minority report content (Markdown) */
  report: string | null

  /** Whether there are minority positions that could generate a report */
  hasMinorityPositions: boolean

  /** Whether a report can be generated */
  canGenerate: boolean

  /** Whether current user can edit the report */
  canEdit?: boolean

  /** Callback to generate the report */
  onGenerate?: () => Promise<void>

  /** Callback to update the report */
  onUpdate?: (newReport: string) => Promise<void>

  /** Whether an action is in progress */
  isLoading?: boolean

  /** Optional CSS class name */
  className?: string
}

export function MinorityReportView({
  report,
  hasMinorityPositions,
  canGenerate,
  canEdit = false,
  onGenerate,
  onUpdate,
  isLoading = false,
  className = '',
}: MinorityReportViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedReport, setEditedReport] = useState(report || '')
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!onGenerate) return
    setError(null)

    try {
      await onGenerate()
    } catch (err: any) {
      setError(err.message || 'Failed to generate report')
    }
  }

  const handleSave = async () => {
    if (!onUpdate) return
    setError(null)

    try {
      await onUpdate(editedReport)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save report')
    }
  }

  // No report and no minority positions
  if (!report && !hasMinorityPositions) {
    return (
      <div className={`bg-bg-2 rounded-lg border border-border p-6 text-center ${className}`}>
        <div className="text-ink-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">No minority report available</p>
          <p className="text-xs mt-1">
            Minority reports are generated from dissenting positions after a decision
          </p>
        </div>
      </div>
    )
  }

  // Can generate a report
  if (!report && canGenerate) {
    return (
      <div className={`bg-info-bg rounded-lg border border-info/30 p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">
          Minority Positions Available
        </h3>
        <p className="text-sm text-ink-700 mb-4">
          There are minority positions that can be compiled into a formal minority
          report. This preserves dissenting views as part of the proposal record.
        </p>
        {error && (
          <div className="p-3 bg-danger-bg border border-danger/30 rounded-md text-danger text-sm mb-3">
            {error}
          </div>
        )}
        {onGenerate && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-brand-600 text-bg-1 rounded-md font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Minority Report'}
          </button>
        )}
      </div>
    )
  }

  // Display or edit the report
  return (
    <div className={`bg-warning-bg rounded-lg border border-warning/30 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-900">Minority Report</h3>
        {canEdit && !isEditing && onUpdate && (
          <button
            onClick={() => {
              setEditedReport(report || '')
              setIsEditing(true)
            }}
            disabled={isLoading}
            className="text-sm text-brand-600 hover:text-brand-500 disabled:opacity-50"
          >
            Edit Report
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-danger-bg border border-danger/30 rounded-md text-danger text-sm mb-3">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedReport}
            onChange={(e) => setEditedReport(e.target.value)}
            disabled={isLoading}
            rows={10}
            className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm resize-y"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-brand-600 text-bg-1 rounded-md font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-4 py-2 border border-border rounded-md text-ink-700 hover:bg-bg-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-ink-700">
          {/* Simple markdown rendering - converts ## headers and line breaks */}
          {report?.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="text-base font-semibold text-ink-900 mt-4 mb-2">
                  {line.replace('## ', '')}
                </h2>
              )
            }
            if (line.startsWith('### ')) {
              return (
                <h3 key={i} className="text-sm font-semibold text-ink-900 mt-3 mb-1">
                  {line.replace('### ', '')}
                </h3>
              )
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={i} className="font-semibold text-ink-900">
                  {line.replace(/\*\*/g, '')}
                </p>
              )
            }
            if (line.startsWith('---')) {
              return <hr key={i} className="my-3 border-border" />
            }
            if (line.startsWith('*') && line.endsWith('*')) {
              return (
                <p key={i} className="text-xs text-ink-400 italic">
                  {line.replace(/\*/g, '')}
                </p>
              )
            }
            if (line.trim() === '') {
              return <br key={i} />
            }
            return <p key={i}>{line}</p>
          })}
        </div>
      )}
    </div>
  )
}
