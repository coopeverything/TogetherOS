'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  items,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter((item) => {
      const labelMatch = item.label.toLowerCase().includes(searchLower);
      const descMatch = item.description?.toLowerCase().includes(searchLower);
      const keywordMatch = item.keywords?.some((kw) => kw.toLowerCase().includes(searchLower));
      return labelMatch || descMatch || keywordMatch;
    });
  }, [items, search]);

  // Keyboard shortcut to open palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].onSelect();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Command palette */}
      <div
        className="relative bg-bg-1 rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[60vh] overflow-hidden"
        role="combobox"
        aria-expanded="true"
        aria-haspopup="listbox"
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-ink-400"
          >
            <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 12l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-0 outline-none px-4 py-4 text-ink-900 placeholder:text-ink-400"
            aria-autocomplete="list"
            aria-controls="command-list"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-bg-2 px-3 py-1.5 text-sm text-ink-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          id="command-list"
          role="listbox"
          className="overflow-y-auto max-h-[calc(60vh-65px)] p-2"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-base">
              {emptyMessage}
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors',
                  index === selectedIndex
                    ? 'bg-brand-100 text-brand-600'
                    : 'text-ink-900 hover:bg-bg-2'
                )}
              >
                {item.icon && (
                  <div className="flex-shrink-0 w-5 h-5">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className={cn(
                      'text-base truncate',
                      index === selectedIndex ? 'text-brand-600/70' : 'text-ink-700'
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, toggle, open, close };
}
