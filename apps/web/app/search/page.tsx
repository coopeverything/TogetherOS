'use client';

/**
 * Search Page
 * Main search interface with filters and results
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar, SearchFilters, SearchResults } from '@/components/search';
import type { SearchResponse, SearchContentType, CooperationPathSlug } from '@togetheros/types';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchContentType) || 'all';
  const initialPath = searchParams.get('path') as CooperationPathSlug | undefined;

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<{
    type?: SearchContentType;
    path?: CooperationPathSlug;
    keywords?: string[];
  }>({
    type: initialType,
    path: initialPath,
  });
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL when search params change
  const updateURL = useCallback(
    (q: string, f: typeof filters) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (f.type && f.type !== 'all') params.set('type', f.type);
      if (f.path) params.set('path', f.path);

      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: typeof filters) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('q', searchQuery);
        if (searchFilters.type && searchFilters.type !== 'all') {
          params.set('type', searchFilters.type);
        }
        if (searchFilters.path) {
          params.set('path', searchFilters.path);
        }

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: SearchResponse = await response.json();
        setResults(data);
      } catch (err) {
        setError('Failed to search. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle search query change
  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      updateURL(newQuery, filters);
      performSearch(newQuery, filters);
    },
    [filters, updateURL, performSearch]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      updateURL(query, newFilters);
      if (query) {
        performSearch(query, newFilters);
      }
    },
    [query, updateURL, performSearch]
  );

  // Initial search from URL params
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, { type: initialType, path: initialPath });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Find proposals, discussions, and community content
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          autoFocus={!initialQuery}
          initialValue={initialQuery}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      <SearchResults
        results={results?.results || []}
        isLoading={isLoading}
        query={query}
        total={results?.total || 0}
      />

      {/* Search Metadata (for debugging) */}
      {results && !isLoading && (
        <div className="mt-8 text-xs text-muted-foreground">
          Search completed in {results.took_ms}ms
        </div>
      )}
    </div>
  );
}
