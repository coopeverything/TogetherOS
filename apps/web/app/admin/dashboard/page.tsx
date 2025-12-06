'use client'

/**
 * Unified Dashboard Showcase
 *
 * Consolidates dashboard-styles, dashboard-designs, and dashboard-demos
 * into a single tabbed interface.
 *
 * Route: /admin/dashboard
 */

import { useState } from 'react'
import { Button } from "@/components/ui/button"

// Import demos page component
import DashboardDemos from '../dashboard-demos/page'

// Import styles page sub-components
import DashboardTest2 from '../dashboard-test2/page'
import DashboardTest3 from '../dashboard-test3/page'

// Import compact design
import { CompactZincSage } from '../dashboard-designs/CompactZincSage'

type MainTab = 'demos' | 'styles' | 'compact'
type StyleVariant = 'default' | 'compact'

export default function DashboardShowcase() {
  const [mainTab, setMainTab] = useState<MainTab>('demos')
  const [styleVariant, setStyleVariant] = useState<StyleVariant>('default')

  return (
    <div className="flex flex-col h-screen bg-bg-0">
      {/* Main Header with Tabs */}
      <header className="bg-bg-1 shadow-sm border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-ink-900">
                Dashboard Showcase
              </h1>
              <p className="text-base text-ink-700">
                Explore different dashboard layouts, styles, and designs
              </p>
            </div>
            <a
              href="/admin"
              className="text-base text-ink-400 hover:text-ink-700"
            >
              ← Back to Admin
            </a>
          </div>

          {/* Main Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={mainTab === 'demos' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMainTab('demos')}
            >
              Demos
            </Button>
            <Button
              variant={mainTab === 'styles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMainTab('styles')}
            >
              Styles
            </Button>
            <Button
              variant={mainTab === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMainTab('compact')}
            >
              Compact Design
            </Button>
          </div>

          {/* Sub-tabs for Styles */}
          {mainTab === 'styles' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-ink-400 mr-2">Style:</span>
              <Button
                variant={styleVariant === 'default' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStyleVariant('default')}
              >
                Default
              </Button>
              <Button
                variant={styleVariant === 'compact' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStyleVariant('compact')}
              >
                Compact
              </Button>
            </div>
          )}

        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {mainTab === 'demos' && <DashboardDemos />}
        {mainTab === 'styles' && styleVariant === 'default' && <DashboardTest2 />}
        {mainTab === 'styles' && styleVariant === 'compact' && <DashboardTest3 />}
        {mainTab === 'compact' && <CompactZincSage />}
      </main>
    </div>
  )
}
