'use client'

/**
 * ServiceForm Component - Create/Edit service offerings
 * Form for members to post their skills and services to the marketplace
 */

import { useState } from 'react'
import { SERVICE_CATEGORIES } from '@togetheros/types'

export interface ServiceFormData {
  title: string
  description: string
  imageUrl: string
  serviceType: string
  tbcPerHour: number
  locationPreference: 'remote' | 'in_person' | 'both'
  availability: string
}

export interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

const TBC_OPTIONS = [1, 2, 3] as const
const TBC_LABELS = {
  1: 'Basic',
  2: 'Skilled',
  3: 'Professional',
} as const

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Service',
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    serviceType: initialData?.serviceType || '',
    tbcPerHour: initialData?.tbcPerHour || 1,
    locationPreference: initialData?.locationPreference || 'remote',
    availability: initialData?.availability || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a category'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(formData)
  }

  const handleChange = (
    field: keyof ServiceFormData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Photo URL <span className="text-ink-400 font-normal">(optional but recommended)</span>
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={formData.imageUrl}
            onChange={e => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/your-image.jpg"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-bg-1
              text-ink-900 placeholder:text-ink-400
              focus:outline-none focus:ring-2 focus:ring-accent-4/50 focus:border-accent-4
              transition-colors"
          />
          {formData.imageUrl && isValidUrl(formData.imageUrl) && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-2 flex-shrink-0">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
        {errors.imageUrl && (
          <p className="mt-1.5 text-sm text-red-500">{errors.imageUrl}</p>
        )}
        <p className="mt-1.5 text-xs text-ink-400">
          Use a direct image link from Imgur, Unsplash, or similar services
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.serviceType}
          onChange={e => handleChange('serviceType', e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg border bg-bg-1
            text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-4/50 focus:border-accent-4
            transition-colors ${errors.serviceType ? 'border-red-500' : 'border-border'}`}
        >
          <option value="">Select a category...</option>
          {SERVICE_CATEGORIES.map(cat => (
            <option key={cat.type} value={cat.type}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <p className="mt-1.5 text-sm text-red-500">{errors.serviceType}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Service Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="e.g., Math Tutoring for High School Students"
          className={`w-full px-4 py-2.5 rounded-lg border bg-bg-1
            text-ink-900 placeholder:text-ink-400
            focus:outline-none focus:ring-2 focus:ring-accent-4/50 focus:border-accent-4
            transition-colors ${errors.title ? 'border-red-500' : 'border-border'}`}
        />
        {errors.title && (
          <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>
        )}
        <p className="mt-1.5 text-xs text-ink-400">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Description <span className="text-ink-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Describe what you offer, your experience, and what clients can expect..."
          rows={4}
          className={`w-full px-4 py-2.5 rounded-lg border bg-bg-1
            text-ink-900 placeholder:text-ink-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-accent-4/50 focus:border-accent-4
            transition-colors ${errors.description ? 'border-red-500' : 'border-border'}`}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
        )}
        <p className="mt-1.5 text-xs text-ink-400">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* TBC Per Hour & Location - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TBC Per Hour */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            TBC per Hour <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {TBC_OPTIONS.map(value => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange('tbcPerHour', value)}
                className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium
                  transition-all ${
                    formData.tbcPerHour === value
                      ? 'bg-accent-4 text-bg-1 border-accent-4'
                      : 'bg-bg-1 text-ink-700 border-border hover:border-accent-4/50'
                  }`}
              >
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs opacity-80">{TBC_LABELS[value]}</div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            1 TBC = 1 hour of community time
          </p>
        </div>

        {/* Location Preference */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Location
          </label>
          <div className="space-y-2">
            {[
              { value: 'remote', label: 'Remote Only', icon: '💻' },
              { value: 'in_person', label: 'In Person Only', icon: '🏠' },
              { value: 'both', label: 'Either Works', icon: '✨' },
            ].map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer
                  transition-all ${
                    formData.locationPreference === option.value
                      ? 'bg-accent-4/10 border-accent-4'
                      : 'bg-bg-1 border-border hover:border-accent-4/50'
                  }`}
              >
                <input
                  type="radio"
                  name="locationPreference"
                  value={option.value}
                  checked={formData.locationPreference === option.value}
                  onChange={e =>
                    handleChange(
                      'locationPreference',
                      e.target.value as 'remote' | 'in_person' | 'both'
                    )
                  }
                  className="sr-only"
                />
                <span>{option.icon}</span>
                <span className="text-sm text-ink-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Availability <span className="text-ink-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.availability}
          onChange={e => handleChange('availability', e.target.value)}
          placeholder="e.g., Weekday evenings, weekends"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-1
            text-ink-900 placeholder:text-ink-400
            focus:outline-none focus:ring-2 focus:ring-accent-4/50 focus:border-accent-4
            transition-colors"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Let others know when you&apos;re typically available
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-ink-700 bg-bg-2
              hover:bg-bg-2/70 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-semibold text-bg-1 bg-brand-600
            hover:bg-brand-700 rounded-lg transition-colors shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
