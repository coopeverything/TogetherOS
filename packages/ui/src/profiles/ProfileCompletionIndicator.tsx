// packages/ui/src/profiles/ProfileCompletionIndicator.tsx
// Profile completion progress indicator

import React from 'react'
import type { Profile, ProfileCompletionStatus } from '@togetheros/types/profiles'

interface ProfileCompletionIndicatorProps {
  profile: Profile
  className?: string
}

/**
 * Calculate profile completion percentage and status
 */
export function calculateProfileCompletion(profile: Profile): ProfileCompletionStatus {
  const fields = {
    required: ['email', 'emailVerified'],
    important: ['name', 'username', 'bio', 'avatarUrl'],
    recommended: ['city', 'country', 'paths', 'skills'],
    optional: ['state', 'timezone', 'canOffer', 'seekingHelp']
  }

  const completedFields: string[] = []
  const missingFields: string[] = []

  // Check all field groups
  let totalWeight = 0
  let completedWeight = 0

  // Required fields (30% weight each)
  fields.required.forEach(field => {
    const key = field as keyof Profile
    if (profile[key]) {
      completedFields.push(field)
      completedWeight += 30
    } else {
      missingFields.push(field)
    }
    totalWeight += 30
  })

  // Important fields (10% weight each)
  fields.important.forEach(field => {
    const key = field as keyof Profile
    if (profile[key]) {
      completedFields.push(field)
      completedWeight += 10
    } else {
      missingFields.push(field)
    }
    totalWeight += 10
  })

  // Recommended fields (5% weight each)
  fields.recommended.forEach(field => {
    const key = field as keyof Profile
    const value = profile[key]
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields.push(field)
      completedWeight += 5
    } else {
      missingFields.push(field)
    }
    totalWeight += 5
  })

  // Optional fields (2.5% weight each)
  fields.optional.forEach(field => {
    const key = field as keyof Profile
    if (profile[key]) {
      completedFields.push(field)
      completedWeight += 2.5
    } else {
      missingFields.push(field)
    }
    totalWeight += 2.5
  })

  const percentage = Math.min(100, Math.round((completedWeight / totalWeight) * 100))

  return {
    percentage,
    completedFields,
    missingFields,
    isComplete: percentage >= 70
  }
}

/**
 * ProfileCompletionIndicator Component
 * Shows profile completion status with progress bar
 */
export function ProfileCompletionIndicator({
  profile,
  className = ''
}: ProfileCompletionIndicatorProps) {
  const completion = calculateProfileCompletion(profile)

  const getColorClass = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTextColorClass = (percentage: number) => {
    if (percentage >= 70) return 'text-green-700'
    if (percentage >= 40) return 'text-yellow-700'
    return 'text-red-700'
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ink-900">
          Profile Completion
        </span>
        <span className={`text-sm font-semibold ${getTextColorClass(completion.percentage)}`}>
          {completion.percentage}%
        </span>
      </div>

      <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColorClass(completion.percentage)}`}
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      {!completion.isComplete && (
        <p className="text-xs text-ink-700 mt-2">
          Complete your profile to unlock all features and connect with the community
        </p>
      )}

      {completion.isComplete && (
        <p className="text-xs text-green-700 mt-2">
          Your profile is complete! Great work.
        </p>
      )}
    </div>
  )
}
