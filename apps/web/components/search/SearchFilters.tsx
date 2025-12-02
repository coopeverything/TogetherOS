'use client';

/**
 * SearchFilters Component
 * Provides content type, path, and keyword filters
 */

import type { SearchContentType, CooperationPathSlug } from '@togetheros/types';

export interface SearchFiltersProps {
  filters: {
    type?: SearchContentType;
    path?: CooperationPathSlug;
    keywords?: string[];
  };
  onFilterChange: (filters: {
    type?: SearchContentType;
    path?: CooperationPathSlug;
    keywords?: string[];
  }) => void;
}

const COOPERATION_PATHS = [
  { value: 'collaborative-education', label: 'Collaborative Education' },
  { value: 'social-economy', label: 'Social Economy' },
  { value: 'common-wellbeing', label: 'Common Wellbeing' },
  { value: 'cooperative-technology', label: 'Cooperative Technology' },
  { value: 'collective-governance', label: 'Collective Governance' },
  { value: 'community-connection', label: 'Community Connection' },
  { value: 'collaborative-media-culture', label: 'Collaborative Media & Culture' },
  { value: 'common-planet', label: 'Common Planet' },
] as const;

const CONTENT_TYPES = [
  { value: 'all', label: 'All Content' },
  { value: 'proposal', label: 'Proposals' },
  { value: 'topic', label: 'Forum Topics' },
  { value: 'post', label: 'Forum Posts' },
  { value: 'profile', label: 'Profiles' },
] as const;

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value as SearchContentType,
    });
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      path: e.target.value === 'all' ? undefined : (e.target.value as CooperationPathSlug),
    });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.path !== undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Content Type Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="content-type" className="text-sm font-medium">
            Type:
          </label>
          <select
            id="content-type"
            value={filters.type || 'all'}
            onChange={handleTypeChange}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cooperation Path Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="cooperation-path" className="text-sm font-medium">
            Path:
          </label>
          <select
            id="cooperation-path"
            value={filters.path || 'all'}
            onChange={handlePathChange}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Paths</option>
            {COOPERATION_PATHS.map((path) => (
              <option key={path.value} value={path.value}>
                {path.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({ type: 'all' })}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-50 dark:bg-gray-900"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <span>Filtering by: </span>
          {filters.type && filters.type !== 'all' && (
            <span className="font-medium">{CONTENT_TYPES.find((t) => t.value === filters.type)?.label}</span>
          )}
          {filters.type && filters.type !== 'all' && filters.path && <span> + </span>}
          {filters.path && (
            <span className="font-medium">{COOPERATION_PATHS.find((p) => p.value === filters.path)?.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
