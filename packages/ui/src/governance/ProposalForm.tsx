/**
 * ProposalForm Component
 *
 * Form for creating or editing a proposal
 */

'use client'

import { useState } from 'react'
import type { ProposalScopeType } from '@togetheros/types/governance'

export interface ProposalFormData {
  scopeType: ProposalScopeType
  scopeId: string
  title: string
  summary: string
}

export interface ProposalFormProps {
  /** Initial form data (for editing) */
  initialData?: Partial<ProposalFormData>

  /** Current user ID (for individual proposals) */
  currentUserId: string

  /** Available groups for group proposals */
  groups?: Array<{ id: string; name: string }>

  /** Submit callback */
  onSubmit: (data: ProposalFormData) => void | Promise<void>

  /** Cancel callback */
  onCancel?: () => void

  /** Whether form is submitting */
  isSubmitting?: boolean

  /** Optional CSS class name */
  className?: string
}

export function ProposalForm({
  initialData,
  currentUserId,
  groups = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: ProposalFormProps) {
  const [scopeType, setScopeType] = useState<ProposalScopeType>(
    initialData?.scopeType || 'individual'
  )
  const [scopeId, setScopeId] = useState(
    initialData?.scopeId || currentUserId
  )
  const [title, setTitle] = useState(initialData?.title || '')
  const [summary, setSummary] = useState(initialData?.summary || '')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters'
    }

    if (!summary.trim()) {
      newErrors.summary = 'Summary is required'
    } else if (summary.length < 10) {
      newErrors.summary = 'Summary must be at least 10 characters'
    } else if (summary.length > 2000) {
      newErrors.summary = 'Summary cannot exceed 2000 characters'
    }

    if (scopeType === 'group' && !scopeId) {
      newErrors.scopeId = 'Please select a group'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const finalScopeId = scopeType === 'individual' ? currentUserId : scopeId

    await onSubmit({
      scopeType,
      scopeId: finalScopeId,
      title: title.trim(),
      summary: summary.trim(),
    })
  }

  const handleScopeTypeChange = (newScopeType: ProposalScopeType) => {
    setScopeType(newScopeType)
    if (newScopeType === 'individual') {
      setScopeId(currentUserId)
    } else if (groups.length > 0) {
      setScopeId(groups[0].id)
    } else {
      setScopeId('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      {/* Scope Type */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Proposal Type <span className="text-danger">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="individual"
              checked={scopeType === 'individual'}
              onChange={(e) =>
                handleScopeTypeChange(e.target.value as ProposalScopeType)
              }
              className="mr-2"
              disabled={isSubmitting}
            />
            <span>Individual Proposal</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="group"
              checked={scopeType === 'group'}
              onChange={(e) =>
                handleScopeTypeChange(e.target.value as ProposalScopeType)
              }
              className="mr-2"
              disabled={isSubmitting || groups.length === 0}
            />
            <span>Group Proposal</span>
          </label>
        </div>
        <p className="mt-1 text-sm text-ink-400">
          {scopeType === 'individual'
            ? 'This proposal is for your own consideration'
            : 'This proposal will be shared with a specific group'}
        </p>
      </div>

      {/* Group Selection (only for group proposals) */}
      {scopeType === 'group' && (
        <div>
          <label
            htmlFor="group-select"
            className="block text-sm font-medium text-ink-700 mb-2"
          >
            Select Group <span className="text-danger">*</span>
          </label>
          {groups.length === 0 ? (
            <p className="text-sm text-ink-400 italic">
              You are not a member of any groups. Create or join a group first to make
              group proposals.
            </p>
          ) : (
            <>
              <select
                id="group-select"
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.scopeId ? 'border-danger' : 'border-border'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a group...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.scopeId && (
                <p className="mt-1 text-sm text-danger">{errors.scopeId}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-ink-700 mb-2"
        >
          Title <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a clear, concise title for your proposal"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            errors.title ? 'border-danger' : 'border-border'
          }`}
          disabled={isSubmitting}
          maxLength={200}
        />
        <div className="mt-1 flex justify-between">
          {errors.title ? (
            <p className="text-sm text-danger">{errors.title}</p>
          ) : (
            <p className="text-sm text-ink-400">3-200 characters</p>
          )}
          <p className="text-sm text-ink-400">{title.length}/200</p>
        </div>
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-ink-700 mb-2"
        >
          Summary <span className="text-danger">*</span>
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Describe your proposal in detail. What problem does it solve? What are the benefits?"
          rows={8}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            errors.summary ? 'border-danger' : 'border-border'
          }`}
          disabled={isSubmitting}
          maxLength={2000}
        />
        <div className="mt-1 flex justify-between">
          {errors.summary ? (
            <p className="text-sm text-danger">{errors.summary}</p>
          ) : (
            <p className="text-sm text-ink-400">10-2000 characters</p>
          )}
          <p className="text-sm text-ink-400">{summary.length}/2000</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (initialData?.title ? 'Updating...' : 'Creating...')
            : (initialData?.title ? 'Update Proposal' : 'Create Proposal')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-bg-3 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
