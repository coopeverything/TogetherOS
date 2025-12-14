'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SERVICE_CATEGORIES, type ProviderBadge } from '@togetheros/types'
import { ServiceCard, ServiceForm, type ServiceFormData, type ServiceCardService } from '@togetheros/ui/economy'

interface MyService {
  id: string
  memberId: string
  serviceType: string
  title: string
  description: string | null
  imageUrl: string | null
  tbcPerHour: number
  availability: string | null
  locationPreference: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ProviderStats {
  avgRating: number
  totalReviews: number
  totalTransactions: number
  badges: ProviderBadge[]
}

type ViewMode = 'list' | 'create' | 'edit'

export default function MyServicesClient() {
  const router = useRouter()
  const [services, setServices] = useState<MyService[]>([])
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingService, setEditingService] = useState<MyService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadMyServices()
  }, [])

  async function loadMyServices() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/timebank/services?myServices=true')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=/economy/timebank/my-services')
          return
        }
        throw new Error('Failed to load services')
      }

      const data = await response.json()
      setServices(data.services || [])

      // Extract stats from first service provider info
      if (data.services?.[0]?.provider) {
        const provider = data.services[0].provider
        setStats({
          avgRating: provider.avgRating || 0,
          totalReviews: provider.totalReviews || 0,
          totalTransactions: provider.totalReviews * 2 || 0, // Estimate
          badges: (provider.badges || []) as ProviderBadge[],
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateService(data: ServiceFormData) {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/timebank/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: data.serviceType,
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          tbcPerHour: data.tbcPerHour,
          availability: data.availability || null,
          locationPreference: data.locationPreference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create service')
      }

      setSuccessMessage('Service created successfully!')
      setViewMode('list')
      await loadMyServices()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateService(data: ServiceFormData) {
    if (!editingService) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/timebank/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          tbcPerHour: data.tbcPerHour,
          availability: data.availability || null,
          locationPreference: data.locationPreference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update service')
      }

      setSuccessMessage('Service updated successfully!')
      setViewMode('list')
      setEditingService(null)
      await loadMyServices()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleActive(serviceId: string, currentActive: boolean) {
    try {
      setError(null)

      const response = await fetch(`/api/timebank/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      await loadMyServices()
      setSuccessMessage(currentActive ? 'Service paused' : 'Service activated')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
    }
  }

  async function handleDeleteService(serviceId: string) {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      setError(null)

      const response = await fetch(`/api/timebank/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      await loadMyServices()
      setSuccessMessage('Service deleted')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  function handleEdit(serviceId: string) {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setEditingService(service)
      setViewMode('edit')
    }
  }

  // Convert MyService to ServiceCardService for display
  function toServiceCardService(service: MyService): ServiceCardService {
    return {
      id: service.id,
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl,
      tbcPerHour: service.tbcPerHour,
      serviceType: service.serviceType,
      locationPreference: service.locationPreference,
      availability: service.availability,
      provider: {
        id: service.memberId,
        name: 'You',
        avatarUrl: null,
        avgRating: stats?.avgRating || 0,
        totalReviews: stats?.totalReviews || 0,
        badges: stats?.badges || [],
      },
    }
  }

  // Show login prompt if not authenticated
  if (!isLoading && services.length === 0 && error === 'Unauthorized') {
    return (
      <div className="min-h-screen bg-bg-2 flex items-center justify-center">
        <div className="bg-bg-1 rounded-xl p-8 text-center max-w-md">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-xl font-semibold text-ink-900 mb-2">
            Sign in required
          </h2>
          <p className="text-ink-500 mb-6">
            Please sign in to manage your services.
          </p>
          <Link
            href="/login?redirect=/economy/timebank/my-services"
            className="inline-flex px-6 py-2.5 bg-brand-600 text-bg-1 font-medium
              rounded-lg hover:bg-brand-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-2">
      {/* Header */}
      <div className="bg-bg-1 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/economy/timebank/marketplace"
                className="text-ink-400 hover:text-ink-700 transition-colors"
              >
                ← Back to Marketplace
              </Link>
            </div>
            {viewMode === 'list' && (
              <button
                onClick={() => setViewMode('create')}
                className="px-4 py-2 bg-brand-600 text-bg-1 font-medium rounded-lg
                  hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <span>+</span>
                Add New Service
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Card */}
        {viewMode === 'list' && stats && (
          <div className="mb-8 p-6 bg-bg-1 rounded-xl border border-border">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-ink-400">Average Rating</p>
                <p className="text-2xl font-bold text-ink-900">
                  {stats.avgRating > 0 ? (
                    <>⭐ {stats.avgRating.toFixed(1)}</>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-400">Reviews</p>
                <p className="text-2xl font-bold text-ink-900">{stats.totalReviews}</p>
              </div>
              <div>
                <p className="text-sm text-ink-400">Active Services</p>
                <p className="text-2xl font-bold text-ink-900">
                  {services.filter(s => s.active).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-400">Badges</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.badges.length > 0 ? (
                    stats.badges.map(badge => (
                      <span key={badge} className="text-xl" title={badge}>
                        {badge === 'verified' && '✓'}
                        {badge === 'helper' && '🏅'}
                        {badge === 'expert' && '🌟'}
                        {badge === 'top_provider' && '👑'}
                        {badge === 'quick_responder' && '⚡'}
                        {badge === 'five_star' && '⭐'}
                      </span>
                    ))
                  ) : (
                    <span className="text-ink-300">None yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {viewMode === 'create' && (
          <div className="bg-bg-1 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ink-900">
                Create a New Service
              </h2>
              <button
                onClick={() => setViewMode('list')}
                className="text-ink-400 hover:text-ink-700"
              >
                Cancel
              </button>
            </div>
            <ServiceForm
              onSubmit={handleCreateService}
              onCancel={() => setViewMode('list')}
              isLoading={isSubmitting}
              submitLabel="Create Service"
            />
          </div>
        )}

        {/* Edit Form */}
        {viewMode === 'edit' && editingService && (
          <div className="bg-bg-1 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ink-900">
                Edit Service
              </h2>
              <button
                onClick={() => {
                  setViewMode('list')
                  setEditingService(null)
                }}
                className="text-ink-400 hover:text-ink-700"
              >
                Cancel
              </button>
            </div>
            <ServiceForm
              initialData={{
                title: editingService.title,
                description: editingService.description || '',
                imageUrl: editingService.imageUrl || '',
                serviceType: editingService.serviceType,
                tbcPerHour: editingService.tbcPerHour,
                locationPreference: editingService.locationPreference as 'remote' | 'in_person' | 'both' || 'both',
                availability: editingService.availability || '',
              }}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setViewMode('list')
                setEditingService(null)
              }}
              isLoading={isSubmitting}
              submitLabel="Save Changes"
            />
          </div>
        )}

        {/* Services List */}
        {viewMode === 'list' && (
          <>
            <h2 className="text-xl font-semibold text-ink-900 mb-6">
              My Services
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-bg-1 rounded-xl border border-border overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-bg-2" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-bg-2 rounded w-3/4" />
                      <div className="h-4 bg-bg-2 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16 bg-bg-1 rounded-xl border border-border">
                <p className="text-4xl mb-4">🎯</p>
                <h3 className="text-lg font-medium text-ink-900 mb-2">
                  No services yet
                </h3>
                <p className="text-ink-500 mb-6">
                  Create your first service and start earning TBC!
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex px-6 py-2.5 bg-brand-600 text-bg-1 font-medium
                    rounded-lg hover:bg-brand-700 transition-colors"
                >
                  + Create Your First Service
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(service => (
                  <div
                    key={service.id}
                    className="bg-bg-1 rounded-xl border border-border overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-48 aspect-[4/3] md:aspect-square bg-bg-2 flex-shrink-0">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl opacity-50">
                              {SERVICE_CATEGORIES.find(c => c.type === service.serviceType)?.icon || '✨'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-ink-900">
                              {service.title}
                            </h3>
                            <p className="text-sm text-ink-500 mt-1">
                              {SERVICE_CATEGORIES.find(c => c.type === service.serviceType)?.label}
                              {' · '}
                              {service.tbcPerHour} TBC/hr
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              service.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-ink-100 text-ink-500'
                            }`}
                          >
                            {service.active ? '✓ Active' : 'Paused'}
                          </span>
                        </div>

                        {service.description && (
                          <p className="text-sm text-ink-500 mt-2 line-clamp-2">
                            {service.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                          <button
                            onClick={() => handleEdit(service.id)}
                            className="px-3 py-1.5 text-sm font-medium text-ink-700 bg-bg-2
                              hover:bg-bg-2/70 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(service.id, service.active)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              service.active
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                : 'text-green-700 bg-green-50 hover:bg-green-100'
                            }`}
                          >
                            {service.active ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50
                              hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
