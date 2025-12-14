'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SERVICE_CATEGORIES, type ProviderBadge } from '@togetheros/types'
import { ServiceCard, type ServiceCardService } from '@togetheros/ui/economy'

interface ServiceFromAPI {
  id: string
  memberId: string
  serviceType: string
  title: string
  description: string | null
  imageUrl: string | null
  tbcPerHour: number
  availability: string | null
  locationPreference: string | null
  provider: {
    id: string
    name: string
    avatarUrl: string | null
    avgRating: number
    totalReviews: number
    badges: string[]
  }
}

interface TopProvider {
  id: string
  name: string
  avatarUrl: string | null
  totalTransactions: number
  avgRating: number
  badges: ProviderBadge[]
}

export default function MarketplaceClient() {
  const [services, setServices] = useState<ServiceFromAPI[]>([])
  const [topProviders, setTopProviders] = useState<TopProvider[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [selectedCategory])

  async function loadServices() {
    try {
      setIsLoading(true)
      setError(null)

      const url = new URL('/api/timebank/services', window.location.origin)
      url.searchParams.set('limit', '12')
      if (selectedCategory) {
        url.searchParams.set('type', selectedCategory)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Failed to load services')
      }

      const data = await response.json()
      setServices(data.services || [])

      // Load top providers (simulated from service data for now)
      // In production, this would come from a dedicated endpoint
      const providerMap = new Map<string, TopProvider>()
      for (const service of data.services || []) {
        if (!providerMap.has(service.provider.id)) {
          providerMap.set(service.provider.id, {
            id: service.provider.id,
            name: service.provider.name,
            avatarUrl: service.provider.avatarUrl,
            totalTransactions: service.provider.totalReviews * 2, // Estimate
            avgRating: service.provider.avgRating,
            badges: service.provider.badges as ProviderBadge[],
          })
        }
      }
      const providers = Array.from(providerMap.values())
        .sort((a, b) => b.totalTransactions - a.totalTransactions)
        .slice(0, 5)
      setTopProviders(providers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleServiceRequest(serviceId: string) {
    // Navigate to transaction request page
    window.location.href = `/economy/timebank/request/${serviceId}`
  }

  function handleProviderClick(providerId: string) {
    window.location.href = `/economy/timebank/provider/${providerId}`
  }

  // Convert API service to ServiceCardService
  function toServiceCardService(service: ServiceFromAPI): ServiceCardService {
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
        id: service.provider.id,
        name: service.provider.name,
        avatarUrl: service.provider.avatarUrl,
        avgRating: service.provider.avgRating,
        totalReviews: service.provider.totalReviews,
        badges: service.provider.badges as ProviderBadge[],
      },
    }
  }

  return (
    <div className="min-h-screen bg-bg-2">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600 to-accent-4 text-bg-1">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              🤝 Exchange Skills, Build Community
            </h1>
            <p className="mt-4 text-xl opacity-90">
              &ldquo;1 hour of your time = 1 hour of mine&rdquo;
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="#services"
                className="px-6 py-3 bg-bg-1 text-brand-600 font-semibold rounded-lg
                  hover:bg-bg-2 transition-colors shadow-lg"
              >
                Browse Services
              </Link>
              <Link
                href="/economy/timebank/my-services"
                className="px-6 py-3 bg-transparent border-2 border-bg-1 text-bg-1
                  font-semibold rounded-lg hover:bg-bg-1/10 transition-colors"
              >
                Offer Your Skills
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-ink-900 mb-6">
          📂 Browse by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl
              border transition-all ${
                selectedCategory === null
                  ? 'bg-accent-4 border-accent-4 text-bg-1'
                  : 'bg-bg-1 border-border text-ink-700 hover:border-accent-4/50'
              }`}
          >
            <span className="text-2xl mb-1">✨</span>
            <span className="text-xs font-medium">All</span>
          </button>
          {SERVICE_CATEGORIES.slice(0, 13).map(cat => (
            <button
              key={cat.type}
              onClick={() => setSelectedCategory(cat.type)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl
                border transition-all ${
                  selectedCategory === cat.type
                    ? 'bg-accent-4 border-accent-4 text-bg-1'
                    : 'bg-bg-1 border-border text-ink-700 hover:border-accent-4/50'
                }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div id="services" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-ink-900">
            {selectedCategory
              ? `${SERVICE_CATEGORIES.find(c => c.type === selectedCategory)?.label || 'Services'}`
              : '⭐ Featured Services'}
          </h2>
          <Link
            href="/economy/timebank"
            className="text-sm font-medium text-accent-4 hover:text-accent-4/80"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-1 rounded-xl border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-bg-2" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-bg-2 rounded w-3/4" />
                  <div className="h-4 bg-bg-2 rounded w-full" />
                  <div className="h-4 bg-bg-2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadServices}
              className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-bg-1 rounded-xl border border-border">
            <p className="text-4xl mb-4">🌱</p>
            <h3 className="text-lg font-medium text-ink-900 mb-2">
              No services yet
            </h3>
            <p className="text-ink-500 mb-6">
              Be the first to offer your skills to the community!
            </p>
            <Link
              href="/economy/timebank/my-services"
              className="inline-flex px-4 py-2 bg-brand-600 text-bg-1 rounded-lg
                hover:bg-brand-700 transition-colors"
            >
              + Create a Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={toServiceCardService(service)}
                onRequest={handleServiceRequest}
                onProviderClick={handleProviderClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Providers Section */}
      {topProviders.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-ink-900 mb-6">
            🏆 Top Providers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProviders.map((provider, index) => (
              <Link
                key={provider.id}
                href={`/economy/timebank/provider/${provider.id}`}
                className="flex items-center gap-3 p-4 bg-bg-1 rounded-xl border border-border
                  hover:border-accent-4/30 hover:shadow-md transition-all"
              >
                <span className="text-2xl font-bold text-ink-300">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-accent-4/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {provider.avatarUrl ? (
                    <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-accent-4">
                      {provider.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-ink-900 truncate">
                      {provider.name}
                    </span>
                    {provider.badges.includes('expert') && (
                      <span title="Expert">🌟</span>
                    )}
                    {provider.badges.includes('verified') && (
                      <span title="Verified">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-400">
                    {provider.totalTransactions} exchanges
                    {provider.avgRating > 0 && (
                      <span className="ml-2">
                        ★ {provider.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="bg-bg-1 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-ink-900 text-center mb-12">
            How Timebanking Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">1. Offer Your Skills</h3>
              <p className="text-ink-500 text-sm">
                List what you can do - tutoring, repairs, cooking, whatever you&apos;re good at.
                Set your TBC rate (1-3 per hour).
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">2. Exchange Services</h3>
              <p className="text-ink-500 text-sm">
                Help others and earn TBC. Spend TBC to get help from the community.
                Everyone&apos;s time is valued equally.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-joy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">3. Build Community</h3>
              <p className="text-ink-500 text-sm">
                Get badges, build your reputation, and strengthen local connections.
                The more you give, the more you receive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-accent-4 rounded-2xl p-8 text-center text-bg-1">
          <h2 className="text-2xl font-bold mb-4">
            Ready to share your skills?
          </h2>
          <p className="opacity-90 mb-6">
            Join our community of helpers and start earning TBC today.
          </p>
          <Link
            href="/economy/timebank/my-services"
            className="inline-flex px-8 py-3 bg-bg-1 text-brand-600 font-semibold
              rounded-lg hover:bg-bg-2 transition-colors shadow-lg"
          >
            Create Your First Service
          </Link>
        </div>
      </div>
    </div>
  )
}
