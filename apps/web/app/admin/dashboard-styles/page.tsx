'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

// Import dashboard components
import DashboardTest2 from '@/app/admin/dashboard-test2/page'
import DashboardTest3 from '@/app/admin/dashboard-test3/page'

type DashboardStyle = 'default' | 'compact'

export default function DashboardStyles() {
  const [activeStyle, setActiveStyle] = useState<DashboardStyle>('default')

  const styles = [
    { id: 'default' as const, label: 'Default', description: 'Standard spacing and sizing' },
    { id: 'compact' as const, label: 'Compact', description: 'Smaller desktop styling' },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with style tabs */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 dark:text-white mb-3">
            Dashboard Styles
          </h1>
          <div className="flex items-center gap-2">
            {styles.map((style) => (
              <Button
                key={style.id}
                variant={activeStyle === style.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveStyle(style.id)}
                className="flex flex-col items-start h-auto py-2 px-3"
              >
                <span className="font-medium text-sm">{style.label}</span>
                <span className="text-xs font-normal opacity-80">{style.description}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Dashboard preview */}
      <main className="flex-1 overflow-hidden">
        {activeStyle === 'default' && <DashboardTest2 />}
        {activeStyle === 'compact' && <DashboardTest3 />}
      </main>
    </div>
  )
}
