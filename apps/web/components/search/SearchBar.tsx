'use client';

/**
 * SearchBar Component
 * Main search input with debouncing and keyboard shortcuts
 */

import { useState, useEffect, useRef } from 'react';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search proposals, topics, and more...',
  autoFocus = false,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length < 2) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    debounceTimerRef.current = setTimeout(() => {
      onSearch(query.trim());
      setIsDebouncing(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, onSearch]);

  // Keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        className="w-full rounded-md border border-gray-300 px-4 py-2 pr-24 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isDebouncing && (
            <span className="text-xs text-gray-500">Searching...</span>
          )}
          <button
            onClick={handleClear}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            aria-label="Clear search"
          >
            Clear
          </button>
        </div>
      )}
      <div className="mt-1 text-xs text-gray-500">
        Press Cmd/Ctrl+K to focus search
      </div>
    </div>
  );
}
