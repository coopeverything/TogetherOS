/**
 * SampleBadge Component
 *
 * Subtle visual indicator for placeholder/demo data in test pages.
 * Uses a minimal badge to mark fictional content.
 */

'use client'

export interface SampleBadgeProps {
  /** Position of the badge */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Optional label text (default: "SAMPLE") */
  label?: string
}

const positionClasses = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-4 py-1.5',
}

export function SampleBadge({
  position = 'top-right',
  size = 'sm',
  label = 'SAMPLE',
}: SampleBadgeProps) {
  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} font-medium tracking-wide z-10 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded opacity-60 border border-gray-300 dark:border-gray-600`}
    >
      {label}
    </div>
  )
}

/**
 * SampleContainer Component
 *
 * Wrapper that adds a SAMPLE badge to its children.
 * Useful for quickly marking sections as placeholder data.
 */
export interface SampleContainerProps {
  children: React.ReactNode
  badgePosition?: SampleBadgeProps['position']
  badgeSize?: SampleBadgeProps['size']
  label?: string
  className?: string
}

export function SampleContainer({
  children,
  badgePosition,
  badgeSize,
  label,
  className = '',
}: SampleContainerProps) {
  return (
    <div className={`relative ${className}`}>
      <SampleBadge position={badgePosition} size={badgeSize} label={label} />
      {children}
    </div>
  )
}
