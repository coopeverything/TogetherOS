// packages/ui/src/feed/UrlPreviewCard.tsx
// Inline preview card for embedded social media URLs

'use client'

import type { MediaPreview } from '@togetheros/types'

export interface UrlPreviewCardProps {
  url: string
  preview: MediaPreview
  className?: string
}

export function UrlPreviewCard({ url, preview, className = '' }: UrlPreviewCardProps) {
  const platformColors: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    tiktok: 'bg-black',
    twitter: 'bg-blue-500',
    facebook: 'bg-blue-600',
    youtube: 'bg-red-600',
    linkedin: 'bg-blue-700',
    other: 'bg-gray-600',
  }

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    tiktok: '🎵',
    twitter: '𝕏',
    facebook: '👥',
    youtube: '▶️',
    linkedin: '💼',
    other: '🔗',
  }

  const bgColor = platformColors[preview.platform] || platformColors.other
  const icon = platformIcons[preview.platform] || platformIcons.other

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Thumbnail */}
        {preview.thumbnailUrl && (
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
            <img
              src={preview.thumbnailUrl}
              alt={preview.title}
              className="w-full h-full object-cover"
            />
            {/* Platform badge */}
            <div className={`absolute top-2 right-2 ${bgColor} text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg`}>
              <span>{icon}</span>
              <span className="capitalize">{preview.platform}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {preview.title}
          </h3>

          {/* Description */}
          {preview.description && (
            <p className="text-base text-gray-600 line-clamp-3 mb-2">
              {preview.description}
            </p>
          )}

          {/* Author */}
          {preview.authorName && (
            <p className="text-sm text-gray-500">
              by {preview.authorName}
            </p>
          )}

          {/* URL */}
          <p className="text-sm text-gray-400 mt-2 truncate">
            {url}
          </p>
        </div>
      </a>
    </div>
  )
}
