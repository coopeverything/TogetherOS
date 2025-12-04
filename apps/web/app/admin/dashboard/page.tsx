'use client'

/**
 * Unified Dashboard Showcase
 *
 * Consolidates dashboard-styles, dashboard-designs, and dashboard-demos
 * into a single tabbed interface. Includes UX theme previews.
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

// Import theme CSS
import '@/styles/design-system/tokens.css'
import '@/styles/design-system/themes/base.css'

type MainTab = 'demos' | 'styles' | 'designs' | 'themes'
type ThemeVariant = 'arctic-minimal' | 'horizon-dawn' | 'ocean-depth' | 'forest-canvas' | 'cosmic-violet' | 'terracotta-earth'

const themeVariants: Record<ThemeVariant, { name: string; description: string; isDark: boolean }> = {
  'arctic-minimal': {
    name: 'Arctic Minimal',
    description: 'Clean, accessible, professional',
    isDark: false,
  },
  'horizon-dawn': {
    name: 'Horizon Dawn',
    description: 'Warm, optimistic, energizing',
    isDark: false,
  },
  'ocean-depth': {
    name: 'Ocean Depth',
    description: 'Calm, deep, professional dark',
    isDark: true,
  },
  'forest-canvas': {
    name: 'Forest Canvas',
    description: 'Organic, sustainable, grounded',
    isDark: false,
  },
  'cosmic-violet': {
    name: 'Cosmic Violet',
    description: 'Bold, futuristic, creative dark',
    isDark: true,
  },
  'terracotta-earth': {
    name: 'Terracotta Earth',
    description: 'Warm, authentic, handcrafted',
    isDark: false,
  },
}
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

// Themed demo content component that uses CSS custom properties
function ThemedDemoContent({ theme }: { theme: ThemeVariant }) {
  const themeInfo = themeVariants[theme]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {themeInfo.name} Theme Preview
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {themeInfo.description} — See how TogetherOS looks with this theme applied
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Members', value: '2,847', change: '+12%' },
          { label: 'Support Points', value: '45,230', change: '+8%' },
          { label: 'Active Groups', value: '156', change: '+5%' },
          { label: 'Proposals', value: '23', change: '+15%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {stat.label}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {stat.value}
            </div>
            <div
              className="text-sm mt-1"
              style={{ color: 'var(--color-success)' }}
            >
              {stat.change} this week
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Activity */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { user: 'Alice Chen', action: 'created a proposal', time: '2 min ago' },
                { user: 'Bob Martinez', action: 'joined Housing Co-op', time: '15 min ago' },
                { user: 'Carol Davis', action: 'earned 50 RP', time: '1 hour ago' },
                { user: 'David Kim', action: 'allocated 10 SP', time: '2 hours ago' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {item.user}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {' '}{item.action}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Form */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Quick Actions
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Search Members
                </label>
                <input
                  type="text"
                  placeholder="Enter name or email..."
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-md font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                >
                  Primary Action
                </button>
                <button
                  className="px-4 py-2 rounded-md font-medium border transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Color Palette */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Theme Palette
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Primary', var: '--color-primary' },
                { name: 'Accent', var: '--color-accent' },
                { name: 'Success', var: '--color-success' },
                { name: 'Warning', var: '--color-warning' },
                { name: 'Error', var: '--color-error' },
                { name: 'Info', var: '--color-info' },
              ].map((color) => (
                <div key={color.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{
                      backgroundColor: `var(${color.var})`,
                      borderColor: 'var(--color-border)',
                    }}
                  />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Status Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                }}
              >
                Active
              </span>
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-warning)',
                  color: 'white',
                }}
              >
                Pending
              </span>
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                }}
              >
                Urgent
              </span>
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'white',
                }}
              >
                Info
              </span>
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                Featured
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Your Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>SP Balance</span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  125
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>RP Earned</span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-accent)' }}
                >
                  2,450
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>Groups</span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardShowcase() {
  const [mainTab, setMainTab] = useState<MainTab>('demos')
  const [styleVariant, setStyleVariant] = useState<StyleVariant>('default')
  const [designVariant, setDesignVariant] = useState<DesignVariant>('neon')
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('arctic-minimal')

  const CurrentDesign = designVariants[designVariant].component

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Header with Tabs */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Dashboard Showcase
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore different dashboard layouts, styles, and designs
              </p>
            </div>
            <a
              href="/admin"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Admin
            </a>
          </div>

          {/* Main Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={mainTab === 'themes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMainTab('themes')}
            >
              UX Themes
            </Button>
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

          {/* Sub-tabs for UX Themes */}
          {mainTab === 'themes' && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(themeVariants) as ThemeVariant[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setThemeVariant(key)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all border-2 ${
                      themeVariant === key
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-400'
                    }`}
                  >
                    {themeVariants[key].name}
                    {themeVariants[key].isDark && (
                      <span className="ml-1 opacity-60">●</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {themeVariants[themeVariant].description}
                {themeVariants[themeVariant].isDark && (
                  <span className="ml-2 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">Dark Theme</span>
                )}
              </div>
            </div>
          )}

          {/* Sub-tabs for Styles */}
          {mainTab === 'styles' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Style:</span>
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
        {mainTab === 'themes' && (
          <div
            data-theme={themeVariant}
            className="min-h-full"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
            }}
          >
            <ThemedDemoContent theme={themeVariant} />
          </div>
        )}
        {mainTab === 'demos' && <DashboardDemos />}
        {mainTab === 'styles' && styleVariant === 'default' && <DashboardTest2 />}
        {mainTab === 'styles' && styleVariant === 'compact' && <DashboardTest3 />}
        {mainTab === 'designs' && <CurrentDesign />}
      </main>
    </div>
  )
}
