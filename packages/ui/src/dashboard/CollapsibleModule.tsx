/**
 * CollapsibleModule Component
 *
 * Reusable wrapper for dashboard sidebar modules.
 * Supports expand/collapse with state persistence.
 */

'use client'

import { useState } from 'react'

export interface CollapsibleModuleProps {
  /** Module title */
  title: string

  /** Module content */
  children: React.ReactNode

  /** Initial collapsed state */
  defaultCollapsed?: boolean

  /** Optional CSS class */
  className?: string
}

export function CollapsibleModule({
  title,
  children,
  defaultCollapsed = false,
  className = '',
}: CollapsibleModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-gray-500">{isCollapsed ? '▽' : '△'}</span>
      </button>

      {/* Content */}
      {!isCollapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
