'use client'

/**
 * Service Browser Component
 * Browse and filter available timebank services
 */

import { useState } from 'react'

export interface TimebankServiceItem {
  id: string
  memberId: string
  serviceType: string
  title: string
  description?: string | null
  tbcPerHour: number
  availability?: string | null
  locationPreference?: string | null
  provider: {
    name?: string
    email?: string
  }
  createdAt: Date | string
}

export interface ServiceBrowserProps {
  services: TimebankServiceItem[]
  serviceTypes: string[]
  onRequestService: (serviceId: string) => void
  onFilterChange?: (filters: ServiceFilters) => void
  isLoading?: boolean
  className?: string
}

export interface ServiceFilters {
  type?: string
  location?: string
  maxPrice?: number
}

const LOCATION_OPTIONS = [
  { value: '', label: 'Any Location' },
  { value: 'remote', label: 'Remote' },
  { value: 'in_person', label: 'In Person' },
  { value: 'both', label: 'Both' },
]

export function ServiceBrowser({
  services,
  serviceTypes,
  onRequestService,
  onFilterChange,
  isLoading = false,
  className = ''
}: ServiceBrowserProps) {
  const [filters, setFilters] = useState<ServiceFilters>({})

  const handleFilterChange = (key: keyof ServiceFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const formatServiceType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Type */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Service Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Types</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>{formatServiceType(type)}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Location</label>
            <select
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {LOCATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max TBC/Hour</label>
            <input
              type="number"
              min="1"
              max="10"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Any"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No services found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4
                       hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900
                               text-teal-800 dark:text-teal-200 rounded">
                  {formatServiceType(service.serviceType)}
                </span>
                <span className="text-lg font-bold text-teal-600">
                  {service.tbcPerHour} TBC/hr
                </span>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {service.title}
              </h4>

              {service.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                {service.locationPreference && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {service.locationPreference === 'in_person' ? 'In Person' :
                     service.locationPreference === 'remote' ? 'Remote' : 'Remote/In Person'}
                  </span>
                )}
                {service.availability && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.availability}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  by {service.provider.name || 'Anonymous'}
                </span>
                <button
                  onClick={() => onRequestService(service.id)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium
                           rounded transition-colors"
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
