/**
 * CreateGroupForm Component
 *
 * Form for creating a new group with validation
 */

'use client'

import { useState } from 'react'
import type { GroupType } from '@togetheros/types/groups'

export interface CreateGroupFormProps {
  /** Callback when form is submitted */
  onSubmit: (data: CreateGroupFormData) => Promise<void>

  /** Callback when form is cancelled */
  onCancel?: () => void

  /** Whether form is submitting */
  isSubmitting?: boolean

  /** Optional CSS class name */
  className?: string
}

export interface CreateGroupFormData {
  name: string
  handle: string
  type: GroupType
  description?: string
  location?: string
}

export function CreateGroupForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: CreateGroupFormProps) {
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    handle: '',
    type: 'local',
    description: '',
    location: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateGroupFormData, string>>>({})

  // Auto-generate handle from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      handle: name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50),
    }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGroupFormData, string>> = {}

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name cannot exceed 100 characters'
    }

    if (!formData.handle || formData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters'
    } else if (formData.handle.length > 50) {
      newErrors.handle = 'Handle cannot exceed 50 characters'
    } else if (!/^[a-z0-9-]+$/.test(formData.handle)) {
      newErrors.handle = 'Handle must be lowercase alphanumeric with hyphens only'
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters'
    }

    if (formData.type === 'local' && !formData.location) {
      newErrors.location = 'Location is required for local groups'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      // Error handling done by parent
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Group Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Group Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          placeholder="e.g., Boston Cooperative Network"
          required
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Handle */}
      <div>
        <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
          Handle *
        </label>
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">@</span>
          <input
            type="text"
            id="handle"
            value={formData.handle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, handle: e.target.value.toLowerCase() }))
            }
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="boston-coop"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Lowercase letters, numbers, and hyphens only
        </p>
        {errors.handle && <p className="mt-1 text-sm text-red-600">{errors.handle}</p>}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Group Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, type: e.target.value as GroupType }))
          }
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          required
        >
          <option value="local">Local - Geography-based community</option>
          <option value="thematic">Thematic - Interest or topic-based</option>
          <option value="federated">Federated - Cross-instance coordination</option>
        </select>
      </div>

      {/* Location (conditional) */}
      {formData.type === 'local' && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="e.g., Boston, MA"
            required
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          placeholder="Describe your group's purpose and activities..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.description?.length || 0} / 500 characters
        </p>
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
