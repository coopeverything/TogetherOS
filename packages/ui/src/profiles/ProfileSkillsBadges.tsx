// packages/ui/src/profiles/ProfileSkillsBadges.tsx
// Display skills as interactive badges

import React from 'react'

interface ProfileSkillsBadgesProps {
  skills: string[]
  maxDisplay?: number
  onSkillClick?: (skill: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

/**
 * ProfileSkillsBadges Component
 * Displays user skills as styled badges
 */
export function ProfileSkillsBadges({
  skills,
  maxDisplay,
  onSkillClick,
  className = '',
  variant = 'default'
}: ProfileSkillsBadgesProps) {
  if (skills.length === 0) {
    return null
  }

  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills
  const remainingCount = maxDisplay && skills.length > maxDisplay
    ? skills.length - maxDisplay
    : 0

  const badgeClass = variant === 'compact'
    ? 'text-xs px-2 py-1'
    : 'text-sm px-3 py-1.5'

  const baseClass = `${badgeClass} bg-ink-100 text-ink-900 rounded-full font-medium`
  const clickableClass = onSkillClick
    ? 'cursor-pointer hover:bg-brand-100 hover:text-brand-900 transition-colors'
    : ''

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displaySkills.map((skill, index) => (
        <button
          key={index}
          onClick={() => onSkillClick?.(skill)}
          disabled={!onSkillClick}
          className={`${baseClass} ${onSkillClick ? clickableClass : ''}`}
          type="button"
        >
          {skill}
        </button>
      ))}
      {remainingCount > 0 && (
        <span className={`${badgeClass} bg-brand-50 text-brand-700 rounded-full`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
