'use client'

/**
 * ServiceCard Component - Simbi-style service display
 * Beautiful card with image, rating, provider info, and TBC pricing
 */

import { SERVICE_CATEGORIES, PROVIDER_BADGE_DISPLAY, type ProviderBadge } from '@togetheros/types'

export interface ServiceCardService {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  tbcPerHour: number
  serviceType: string
  locationPreference?: string | null
  availability?: string | null
  provider: {
    id: string
    name: string
    avatarUrl?: string | null
    avgRating: number
    totalReviews: number
    badges: ProviderBadge[]
  }
}

export interface ServiceCardProps {
  service: ServiceCardService
  onRequest?: (serviceId: string) => void
  onProviderClick?: (providerId: string) => void
  showActions?: boolean
  isOwner?: boolean
  onEdit?: (serviceId: string) => void
  onDelete?: (serviceId: string) => void
  onToggleActive?: (serviceId: string, active: boolean) => void
  className?: string
}

function getCategoryIcon(serviceType: string): { icon: string; label: string; color: string } {
  const category = SERVICE_CATEGORIES.find(c => c.type === serviceType)
  return category || { icon: '✨', label: 'Other', color: 'gray' }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-yellow-500">★</span>
      <span className="font-medium text-ink-900">{rating.toFixed(1)}</span>
      <span className="text-ink-400">({count})</span>
    </div>
  )
}

function ProviderBadges({ badges }: { badges: ProviderBadge[] }) {
  if (!badges || badges.length === 0) return null

  // Show first 2 badges only to save space
  const displayBadges = badges.slice(0, 2)

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map(badge => {
        const config = PROVIDER_BADGE_DISPLAY[badge]
        return (
          <span
            key={badge}
            className="text-xs"
            title={config.label}
          >
            {config.icon}
          </span>
        )
      })}
    </div>
  )
}

export function ServiceCard({
  service,
  onRequest,
  onProviderClick,
  showActions = true,
  isOwner = false,
  onEdit,
  onDelete,
  onToggleActive,
  className = '',
}: ServiceCardProps) {
  const category = getCategoryIcon(service.serviceType)
  const hasImage = service.imageUrl && service.imageUrl.length > 0

  return (
    <div
      className={`bg-bg-1 rounded-xl shadow-sm border border-border overflow-hidden
        hover:shadow-md hover:border-accent-4/30 transition-all duration-200 ${className}`}
    >
      {/* Image or Category Icon */}
      <div className="aspect-[4/3] bg-bg-2 relative overflow-hidden">
        {hasImage ? (
          <img
            src={service.imageUrl!}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-50">{category.icon}</span>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full
            bg-bg-1/90 backdrop-blur-sm text-xs font-medium text-ink-700">
            <span>{category.icon}</span>
            {category.label}
          </span>
        </div>

        {/* TBC price overlay */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full
            bg-accent-4 text-bg-1 text-sm font-bold shadow-lg">
            {service.tbcPerHour} TBC/hr
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-ink-900 mb-1 line-clamp-1">
          {service.title}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-ink-500 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Location & Availability */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs text-ink-400">
          {service.locationPreference && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {service.locationPreference === 'in_person' ? 'In Person' :
               service.locationPreference === 'remote' ? 'Remote' : 'Remote / In Person'}
            </span>
          )}
          {service.availability && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {service.availability}
            </span>
          )}
        </div>

        {/* Provider row */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={() => onProviderClick?.(service.provider.id)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent-4/20 flex items-center justify-center overflow-hidden">
              {service.provider.avatarUrl ? (
                <img
                  src={service.provider.avatarUrl}
                  alt={service.provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-accent-4">
                  {service.provider.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-ink-700">
                  {service.provider.name}
                </span>
                <ProviderBadges badges={service.provider.badges} />
              </div>
              {service.provider.totalReviews > 0 && (
                <StarRating
                  rating={service.provider.avgRating}
                  count={service.provider.totalReviews}
                />
              )}
            </div>
          </button>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <button
                    onClick={() => onEdit?.(service.id)}
                    className="px-3 py-1.5 text-sm font-medium text-ink-700 bg-bg-2
                      hover:bg-bg-2/70 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(service.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50
                      hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onRequest?.(service.id)}
                  className="px-4 py-1.5 text-sm font-semibold text-bg-1 bg-brand-600
                    hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
                >
                  Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
