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

// Import designs page sub-components
import { NeonNoir } from '../dashboard-designs/NeonNoir'
import { DesertBloom } from '../dashboard-designs/DesertBloom'
import { NordicVoid } from '../dashboard-designs/NordicVoid'
import { BaroqueMaximalist } from '../dashboard-designs/BaroqueMaximalist'
import { BrutalistRave } from '../dashboard-designs/BrutalistRave'

type MainTab = 'demos' | 'styles' | 'designs'
type StyleVariant = 'default' | 'compact'
type DesignVariant = 'neon' | 'desert' | 'nordic' | 'baroque' | 'brutalist'

const designVariants = {
  neon: {
    name: 'Neon Noir Tokyo',
    description: 'Cyberpunk aesthetic with electric colors',
    colors: ['#ff00ff', '#00ffff', '#0a0a14'],
    component: NeonNoir
  },
  desert: {
    name: 'Desert Bloom',
    description: 'Psychedelic southwest with terracotta',
    colors: ['#E07A5F', '#81B29A', '#F2CC8F'],
    component: DesertBloom
  },
  nordic: {
    name: 'Nordic Void',
    description: 'Inverted Scandinavian minimalism',
    colors: ['#000000', '#00ff9f', '#ffffff'],
    component: NordicVoid
  },
  baroque: {
    name: 'Baroque Maximalist',
    description: 'Digital rococo with vaporwave pastels',
    colors: ['#FFD700', '#FF6FD8', '#B4A7D6'],
    component: BaroqueMaximalist
  },
  brutalist: {
    name: 'Brutalist Rave',
    description: 'Post-Soviet techno with concrete',
    colors: ['#ff0000', '#00ff00', '#808080'],
    component: BrutalistRave
  }
}

export default function DashboardShowcase() {
  const [mainTab, setMainTab] = useState<MainTab>('demos')
  const [styleVariant, setStyleVariant] = useState<StyleVariant>('default')
  const [designVariant, setDesignVariant] = useState<DesignVariant>('neon')

  const CurrentDesign = designVariants[designVariant].component

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Header with Tabs */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 dark:text-white">
                Dashboard Showcase
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore different dashboard layouts, styles, and designs
              </p>
            </div>
            <a
              href="/admin"
              className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-white dark:text-white dark:text-gray-400 dark:hover:text-white"
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
              variant={mainTab === 'designs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMainTab('designs')}
            >
              Creative Designs
            </Button>
          </div>

          {/* Sub-tabs for Styles */}
          {mainTab === 'styles' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mr-2">Style:</span>
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

          {/* Sub-tabs for Designs */}
          {mainTab === 'designs' && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(designVariants) as DesignVariant[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setDesignVariant(key)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                    style={{
                      background: designVariant === key ? designVariants[key].colors[0] : '#e5e5e5',
                      color: designVariant === key ? '#000' : '#666',
                      border: '2px solid',
                      borderColor: designVariant === key ? designVariants[key].colors[0] : '#ccc'
                    }}
                  >
                    {designVariants[key].name}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {designVariants[designVariant].description}
                </div>
                <div className="flex gap-1">
                  {designVariants[designVariant].colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded"
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {mainTab === 'demos' && <DashboardDemos />}
        {mainTab === 'styles' && styleVariant === 'default' && <DashboardTest2 />}
        {mainTab === 'styles' && styleVariant === 'compact' && <DashboardTest3 />}
        {mainTab === 'designs' && <CurrentDesign />}
      </main>
    </div>
  )
}
