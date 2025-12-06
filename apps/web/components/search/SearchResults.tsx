'use client';

/**
 * SearchResults Component
 * Displays search results with highlighting and pagination
 */

import Link from 'next/link';
import type { SearchResult } from '@togetheros/types';

export interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  total: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function highlightText(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function ResultCard({ result, query }: { result: SearchResult; query: string }) {
  const pathLabels: Record<string, string> = {
    'collaborative-education': 'Collaborative Education',
    'social-economy': 'Social Economy',
    'common-wellbeing': 'Common Wellbeing',
    'cooperative-technology': 'Cooperative Technology',
    'collective-governance': 'Collective Governance',
    'community-connection': 'Community Connection',
    'collaborative-media-culture': 'Collaborative Media & Culture',
    'common-planet': 'Common Planet',
  };

  return (
    <Link href={result.url} className="block">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:shadow-md hover:border-blue-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3
              className="text-xl font-semibold"
              dangerouslySetInnerHTML={{ __html: highlightText(result.title, query) }}
            />
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              <span>{formatDate(result.metadata.created_at)}</span>
              {result.metadata.path && (
                <>
                  <span>•</span>
                  <span className="rounded border border-gray-300 dark:border-gray-600 px-3 py-0.5 text-sm">
                    {pathLabels[result.metadata.path] || result.metadata.path}
                  </span>
                </>
              )}
            </div>
          </div>
          <span className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm">
            {result.type}
          </span>
        </div>
        <p
          className="mt-2 text-base text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightText(result.excerpt, query) }}
        />
        {result.metadata.engagement && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
            {result.metadata.engagement.comments !== undefined && (
              <span>{result.metadata.engagement.comments} comments</span>
            )}
            {result.metadata.engagement.support_points !== undefined && (
              <span>{result.metadata.engagement.support_points} SP</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function SearchResults({ results, isLoading, query, total }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-base text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Enter a search query to find proposals, topics, and more.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl font-medium">No results found</p>
        <p className="mt-2 text-base text-muted-foreground">
          Try different keywords or remove some filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">
          Found {total} result{total !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} query={query} />
        ))}
      </div>
    </div>
  );
}
