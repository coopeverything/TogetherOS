'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ContentType = 'microlesson' | 'bias_challenge' | 'micro_challenge' | 'quiz' | 'challenge';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  status: 'draft' | 'published';
  updatedAt: Date;
  // Challenge-specific fields for First Week view
  isFirstWeek?: boolean;
  dayNumber?: number;
}

interface ContentListProps {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: (type: ContentType) => void;
  onDelete?: (id: string) => void;
}

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; icon: string; color: string }> = {
  microlesson: { label: 'Microlesson', icon: '📖', color: 'bg-blue-100 text-blue-700' },
  challenge: { label: 'Challenge', icon: '⭐', color: 'bg-orange-100 text-orange-700' },
  bias_challenge: { label: 'Bias Challenge', icon: '🧠', color: 'bg-purple-100 text-purple-700' },
  micro_challenge: { label: 'Micro-Challenge', icon: '🎯', color: 'bg-green-100 text-green-700' },
  quiz: { label: 'Quiz', icon: '❓', color: 'bg-yellow-100 text-yellow-700' },
};

export function ContentList({ items, selectedId, onSelect, onNew, onDelete }: ContentListProps) {
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<ContentType, ContentItem[]>);

  return (
    <div className="flex flex-col h-full bg-bg-1 border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="w-full"
          >
            + New Content
          </Button>

          {showNewMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-1 border border-border rounded-lg shadow-lg z-10">
              {(Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]).map(type => {
                const config = CONTENT_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onNew(type);
                      setShowNewMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-bg-2 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="text-sm">{config.icon}</span>
                    <span className="text-ink-900">{config.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'text-ink-700 hover:bg-bg-2'
          )}
        >
          All ({items.length})
        </button>
        {(Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]).map(type => {
          const count = items.filter(i => i.type === type).length;
          const config = CONTENT_TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
                filter === type
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-700 hover:bg-bg-2'
              )}
            >
              {config.icon} {count}
            </button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-ink-500">
            <p className="text-sm mb-2">No content yet</p>
            <p className="text-sm">Click &quot;+ New Content&quot; to get started</p>
          </div>
        ) : filter === 'all' ? (
          // Grouped view
          Object.entries(groupedItems).map(([type, typeItems]) => {
            const config = CONTENT_TYPE_CONFIG[type as ContentType];
            return (
              <div key={type} className="border-b border-border last:border-b-0">
                <div className="px-4 py-2 bg-bg-2 text-xs font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.label}s</span>
                  <span className="ml-auto text-ink-500">{typeItems.length}</span>
                </div>
                {typeItems.map(item => (
                  <ContentListItem
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            );
          })
        ) : (
          // Flat view for filtered
          filteredItems.map(item => (
            <ContentListItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ContentListItemProps {
  item: ContentItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

function ContentListItem({ item, isSelected, onSelect, onDelete }: ContentListItemProps) {
  const config = CONTENT_TYPE_CONFIG[item.type];

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        'px-4 py-2 cursor-pointer border-l-4 transition-colors group',
        isSelected
          ? 'bg-brand-50 border-brand-600'
          : 'border-transparent hover:bg-bg-2'
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn('text-xs px-2 py-0.5 rounded font-medium', config.color)}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium truncate',
            isSelected ? 'text-brand-700' : 'text-ink-900'
          )}>
            {item.title || 'Untitled'}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              item.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            )}>
              {item.status}
            </span>
            <span className="text-xs text-ink-500">
              {formatDate(item.updatedAt)}
            </span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this content?')) {
                onDelete(item.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-ink-500 hover:text-danger transition-opacity"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default ContentList;
