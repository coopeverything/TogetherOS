// packages/ui/src/profiles/ProfilePathBadges.tsx
// Display cooperation paths as badges

import React from 'react'
import type { CooperationPath, CooperationPathId } from '@togetheros/types/profiles'

interface ProfilePathBadgesProps {
  paths: CooperationPath[]
  selectedPaths: CooperationPathId[]
  maxDisplay?: number
  onPathClick?: (pathId: CooperationPathId) => void
  className?: string
  variant?: 'default' | 'compact'
}

/**
 * ProfilePathBadges Component
 * Displays selected cooperation paths as styled badges
 */
export function ProfilePathBadges({
  paths,
  selectedPaths,
  maxDisplay,
  onPathClick,
  className = '',
  variant = 'default'
}: ProfilePathBadgesProps) {
  const selectedPathObjects = paths.filter(p => selectedPaths.includes(p.id))

  if (selectedPathObjects.length === 0) {
    return null
  }

  const displayPaths = maxDisplay
    ? selectedPathObjects.slice(0, maxDisplay)
    : selectedPathObjects

  const remainingCount = maxDisplay && selectedPathObjects.length > maxDisplay
    ? selectedPathObjects.length - maxDisplay
    : 0

  const badgeClass = variant === 'compact'
    ? 'text-xs px-2 py-1'
    : 'text-sm px-3 py-1.5'

  const baseClass = `${badgeClass} bg-brand-50 text-brand-700 rounded-full font-medium`
  const clickableClass = onPathClick
    ? 'cursor-pointer hover:bg-brand-100 hover:text-brand-900 transition-colors'
    : ''

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayPaths.map((path) => (
        <button
          key={path.id}
          onClick={() => onPathClick?.(path.id)}
          disabled={!onPathClick}
          className={`${baseClass} ${onPathClick ? clickableClass : ''}`}
          type="button"
        >
          {path.emoji} {path.name}
        </button>
      ))}
      {remainingCount > 0 && (
        <span className={`${badgeClass} bg-ink-100 text-ink-700 rounded-full`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
