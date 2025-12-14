'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SERVICE_CATEGORIES, PROVIDER_BADGE_DISPLAY, type ProviderBadge } from '@togetheros/types'
import { ServiceCard, type ServiceCardService } from '@togetheros/ui/economy'

interface ProviderService {
  id: string
  serviceType: string
  title: string
  description: string | null
  imageUrl: string | null
  tbcPerHour: number
  availability: string | null
  locationPreference: string | null
  createdAt: string
}

interface ProviderReview {
  id: string
  rating: number
  reviewText: string | null
  createdAt: string
  reviewer: {
    name: string
    avatarUrl: string | null
  }
}

interface ProviderProfile {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  memberSince: string
  stats: {
    avgRating: number
    totalReviews: number
    totalTransactions: number
    responseTimeHours: number | null
    lastActiveAt: string | null
    badges: ProviderBadge[]
  }
  fairExchange: {
    givenHours: number
    receivedHours: number
    index: 'excellent' | 'good' | 'balanced' | 'needs_balance'
  }
  services: ProviderService[]
  recentReviews: ProviderReview[]
}

interface Props {
  providerId: string
}

const FAIR_EXCHANGE_LABELS = {
  excellent: { label: 'Excellent Balance', color: 'text-green-600 bg-green-50' },
  good: { label: 'Good Balance', color: 'text-blue-600 bg-blue-50' },
  balanced: { label: 'Balanced', color: 'text-amber-600 bg-amber-50' },
  needs_balance: { label: 'Needs Balance', color: 'text-red-600 bg-red-50' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-500' : 'text-ink-200'}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function ProviderProfileClient({ providerId }: Props) {
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProvider()
  }, [providerId])

  async function loadProvider() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/timebank/providers/${providerId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Provider not found')
        }
        throw new Error('Failed to load provider')
      }

      const data = await response.json()
      setProvider(data.provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleServiceRequest(serviceId: string) {
    window.location.href = `/economy/timebank/request/${serviceId}`
  }

  function toServiceCardService(service: ProviderService): ServiceCardService {
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
        id: providerId,
        name: provider?.name || '',
        avatarUrl: provider?.avatarUrl || null,
        avgRating: provider?.stats.avgRating || 0,
        totalReviews: provider?.stats.totalReviews || 0,
        badges: provider?.stats.badges || [],
      },
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-2">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-bg-1 rounded-full" />
              <div className="space-y-3">
                <div className="h-6 bg-bg-1 rounded w-48" />
                <div className="h-4 bg-bg-1 rounded w-32" />
              </div>
            </div>
            <div className="h-32 bg-bg-1 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-bg-1 rounded-xl" />
              <div className="h-48 bg-bg-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-bg-2 flex items-center justify-center">
        <div className="bg-bg-1 rounded-xl p-8 text-center max-w-md">
          <p className="text-4xl mb-4">😕</p>
          <h2 className="text-xl font-semibold text-ink-900 mb-2">
            {error || 'Provider not found'}
          </h2>
          <p className="text-ink-500 mb-6">
            This provider may not exist or has been removed.
          </p>
          <Link
            href="/economy/timebank/marketplace"
            className="inline-flex px-6 py-2.5 bg-brand-600 text-bg-1 font-medium
              rounded-lg hover:bg-brand-700 transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const fairExchange = FAIR_EXCHANGE_LABELS[provider.fairExchange.index]

  return (
    <div className="min-h-screen bg-bg-2">
      {/* Header */}
      <div className="bg-bg-1 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/economy/timebank/marketplace"
            className="text-ink-400 hover:text-ink-700 transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-bg-1 rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-accent-4/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {provider.avatarUrl ? (
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-accent-4">
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-ink-900">
                  {provider.name}
                </h1>
                {provider.stats.badges.map(badge => (
                  <span
                    key={badge}
                    className="text-lg"
                    title={PROVIDER_BADGE_DISPLAY[badge].label}
                  >
                    {PROVIDER_BADGE_DISPLAY[badge].icon}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-ink-500">
                <span>Member since {new Date(provider.memberSince).toLocaleDateString()}</span>
                {provider.stats.lastActiveAt && (
                  <span>
                    Last active{' '}
                    {new Date(provider.stats.lastActiveAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {provider.bio && (
                <p className="mt-3 text-ink-700">{provider.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="font-semibold text-ink-900">
                    {provider.stats.avgRating > 0
                      ? provider.stats.avgRating.toFixed(1)
                      : '—'}
                  </span>
                  <span className="text-ink-400">
                    ({provider.stats.totalReviews} reviews)
                  </span>
                </div>
                <span className="text-ink-300">•</span>
                <span className="text-ink-700">
                  🔄 {provider.stats.totalTransactions} exchanges
                </span>
                {provider.stats.responseTimeHours && (
                  <>
                    <span className="text-ink-300">•</span>
                    <span className="text-ink-700">
                      ⚡ Responds in ~{Math.round(provider.stats.responseTimeHours)}h
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fair Exchange Card */}
        <div className="bg-bg-1 rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">
            Fair Exchange Index
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 text-center">
                  <p className="text-sm text-ink-400">Given</p>
                  <p className="text-xl font-bold text-ink-900">
                    {provider.fairExchange.givenHours}h
                  </p>
                </div>
                <div className="text-2xl text-ink-300">⇄</div>
                <div className="flex-1 text-center">
                  <p className="text-sm text-ink-400">Received</p>
                  <p className="text-xl font-bold text-ink-900">
                    {provider.fairExchange.receivedHours}h
                  </p>
                </div>
              </div>
              <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-4"
                  style={{
                    width: `${
                      provider.fairExchange.givenHours +
                        provider.fairExchange.receivedHours >
                      0
                        ? (provider.fairExchange.givenHours /
                            (provider.fairExchange.givenHours +
                              provider.fairExchange.receivedHours)) *
                          100
                        : 50
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-ink-400 text-center mt-2">
                Last 6 months
              </p>
            </div>
            <div className="ml-6">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${fairExchange.color}`}
              >
                {fairExchange.label}
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">
            📋 Services Offered ({provider.services.length})
          </h2>
          {provider.services.length === 0 ? (
            <div className="bg-bg-1 rounded-xl border border-border p-8 text-center">
              <p className="text-ink-500">No active services</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={toServiceCardService(service)}
                  onRequest={handleServiceRequest}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-semibold text-ink-900 mb-4">
            💬 Reviews ({provider.recentReviews.length})
          </h2>
          {provider.recentReviews.length === 0 ? (
            <div className="bg-bg-1 rounded-xl border border-border p-8 text-center">
              <p className="text-ink-500">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {provider.recentReviews.map(review => (
                <div
                  key={review.id}
                  className="bg-bg-1 rounded-xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-4/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.reviewer.avatarUrl ? (
                        <img
                          src={review.reviewer.avatarUrl}
                          alt={review.reviewer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-accent-4">
                          {review.reviewer.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink-900">
                          {review.reviewer.name}
                        </span>
                        <span className="text-xs text-ink-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.reviewText && (
                        <p className="mt-2 text-ink-700 text-sm">
                          {review.reviewText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
