// packages/ui/src/profiles/ProfileCard.tsx
// Reusable profile display card component

import React from 'react'
import type { Profile, CooperationPath } from '@togetheros/types/profiles'

interface ProfileCardProps {
  profile: Profile
  paths: CooperationPath[]
  variant?: 'default' | 'compact'
  className?: string
  onEdit?: () => void
}

/**
 * ProfileCard Component
 * Displays user profile information in a card format
 */
export function ProfileCard({
  profile,
  paths,
  variant = 'default',
  className = '',
  onEdit
}: ProfileCardProps) {
  const selectedPaths = paths.filter(p => profile.paths.includes(p.id))

  const locationParts = [profile.city, profile.state, profile.country].filter(Boolean)
  const location = locationParts.length > 0 ? locationParts.join(', ') : null

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink-900 truncate">
                {profile.name || 'Anonymous User'}
              </h3>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            {profile.username && (
              <p className="text-sm text-ink-700">@{profile.username}</p>
            )}
            {location && (
              <p className="text-sm text-ink-600 mt-1">{location}</p>
            )}
            {selectedPaths.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedPaths.slice(0, 3).map(path => (
                  <span
                    key={path.id}
                    className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded-full"
                  >
                    {path.emoji} {path.name}
                  </span>
                ))}
                {selectedPaths.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-ink-100 text-ink-700 rounded-full">
                    +{selectedPaths.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant - full card
  return (
    <div className={`bg-white border border-border rounded-lg p-6 ${className}`}>
      {profile.avatarUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={profile.avatarUrl}
            alt={profile.name || 'User'}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      )}

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-ink-900">
          {profile.name || 'Anonymous User'}
        </h2>
        {profile.username && (
          <p className="text-ink-700 mt-1">@{profile.username}</p>
        )}
        {location && (
          <p className="text-ink-600 mt-1">{location}</p>
        )}
      </div>

      {profile.bio && (
        <div className="mb-4">
          <p className="text-ink-900">{profile.bio}</p>
        </div>
      )}

      {selectedPaths.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink-700 mb-2">
            Cooperation Paths
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedPaths.map(path => (
              <span
                key={path.id}
                className="text-sm px-3 py-1 bg-brand-50 text-brand-700 rounded-full"
              >
                {path.emoji} {path.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.skills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink-700 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span
                key={i}
                className="text-sm px-3 py-1 bg-ink-100 text-ink-900 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.canOffer && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink-700 mb-2">
            What I Can Offer
          </h3>
          <p className="text-ink-900">{profile.canOffer}</p>
        </div>
      )}

      {profile.seekingHelp && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink-700 mb-2">
            What I'm Seeking
          </h3>
          <p className="text-ink-900">{profile.seekingHelp}</p>
        </div>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="w-full mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
        >
          Edit Profile
        </button>
      )}
    </div>
  )
}
