'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateGroupForm, type CreateGroupFormData } from '@togetheros/ui/groups/CreateGroupForm'
import { LocalStorageGroupRepo } from '../../../lib/repos/LocalStorageGroupRepo'
import { getFixtureGroups } from '../../../../api/src/modules/groups/fixtures'
import { NominatimService } from '../../../../api/src/modules/geo/services/NominatimService'

export default function NewGroupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize repo with fixtures (loads from localStorage if available)
  const repo = new LocalStorageGroupRepo(getFixtureGroups())

  const handleSubmit = async (data: CreateGroupFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Optionally geocode ZIP code if provided
      let geocodedLocation = null
      if (data.zipCode && data.type === 'local') {
        const nominatimService = new NominatimService()
        geocodedLocation = await nominatimService.geocodeZipCode(data.zipCode)

        if (geocodedLocation) {
          // Auto-fill location from geocoded data
          data.location = `${geocodedLocation.city}, ${geocodedLocation.state}`
          console.log('Geocoded ZIP:', geocodedLocation)
        }
      }

      // In production, this would be an API call
      // For now, we'll use the repo directly
      const group = await repo.create({
        ...data,
        creatorId: 'current-user-id', // Would come from auth context
      })

      // Redirect to new group page
      router.push(`/groups/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/groups')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <Link
          href="/groups"
          className="text-joy-600 hover:text-joy-700 text-sm font-medium mb-4 inline-block"
        >
          ← Back to Groups
        </Link>
        <h1 className="text-sm font-bold text-ink-900 mb-2">Create a Group</h1>
        <p className="text-sm text-ink-700">
          Start a new cooperative community with transparent governance and shared resources.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 bg-danger-bg border border-danger/30 rounded-lg p-4">
          <p className="text-danger font-medium">Error creating group</p>
          <p className="text-danger/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-bg-1 rounded-lg border border-border p-4">
        <CreateGroupForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Guidelines */}
      <div className="mt-4 bg-info-bg rounded-lg border border-info/30 p-4">
        <h2 className="text-sm font-semibold text-info mb-3">Group Guidelines</h2>
        <ul className="space-y-2 text-sm text-info/90">
          <li className="flex items-start">
            <span className="text-info mr-2">•</span>
            <span>
              <strong>Local groups</strong> are geography-based and require a location
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-info mr-2">•</span>
            <span>
              <strong>Thematic groups</strong> focus on specific topics or interests
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-info mr-2">•</span>
            <span>
              <strong>Federated groups</strong> coordinate across multiple TogetherOS instances
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-info mr-2">•</span>
            <span>Group handles must be unique and cannot be changed after creation</span>
          </li>
          <li className="flex items-start">
            <span className="text-info mr-2">•</span>
            <span>As the creator, you will automatically become the first admin</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
