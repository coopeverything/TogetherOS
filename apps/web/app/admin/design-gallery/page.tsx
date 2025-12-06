'use client'

/**
 * Design Gallery - Central hub for TogetherOS design system
 * Route: /admin/design-gallery
 * Features: Theme previews, design tokens, component showcase
 */

import { useState } from 'react'

type TabId = 'tokens' | 'components'

const typographyScale = [
  { name: 'xs', size: '0.75rem - 0.875rem', use: 'Labels, captions' },
  { name: 'sm', size: '0.875rem - 1rem', use: 'Secondary text' },
  { name: 'base', size: '1rem - 1.125rem', use: 'Body text' },
  { name: 'lg', size: '1.125rem - 1.25rem', use: 'Subheadings' },
  { name: 'xl', size: '1.25rem - 1.5rem', use: 'Section titles' },
  { name: '2xl', size: '1.5rem - 1.875rem', use: 'Page titles' },
  { name: '3xl', size: '1.875rem - 2.25rem', use: 'Hero text' },
]

const spacingScale = [
  { name: '1', value: '0.25rem', px: '4px' },
  { name: '2', value: '0.5rem', px: '8px' },
  { name: '3', value: '0.75rem', px: '12px' },
  { name: '4', value: '1rem', px: '16px' },
  { name: '6', value: '1.5rem', px: '24px' },
  { name: '8', value: '2rem', px: '32px' },
  { name: '12', value: '3rem', px: '48px' },
  { name: '16', value: '4rem', px: '64px' },
]

export default function DesignGalleryPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tokens')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'components', label: 'Components' },
  ]

  return (
    <div className="min-h-screen bg-bg-0 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-900 mb-2">
            Design Gallery
          </h1>
          <p className="text-base text-ink-700">
            TogetherOS design system - themes, tokens, and components
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-2 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-base font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-bg-1 text-ink-900 shadow-sm'
                  : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            {/* Typography */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Typography Scale</h3>
              <div className="space-y-3">
                {typographyScale.map(item => (
                  <div key={item.name} className="flex items-baseline gap-4">
                    <code className="text-sm bg-bg-2 px-3 py-0.5 rounded w-16 text-center text-ink-700">
                      {item.name}
                    </code>
                    <span className="text-ink-700 text-base w-32">
                      {item.size}
                    </span>
                    <span className="text-ink-400 text-sm">
                      {item.use}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Spacing Scale</h3>
              <div className="flex flex-wrap gap-4">
                {spacingScale.map(item => (
                  <div key={item.name} className="flex flex-col items-center gap-1">
                    <div
                      className="bg-brand-500 rounded"
                      style={{ width: item.value, height: item.value }}
                    />
                    <code className="text-sm text-ink-700">
                      {item.name}
                    </code>
                    <span className="text-sm text-ink-400">
                      {item.px}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Shadows</h3>
              <div className="flex flex-wrap gap-6">
                {['sm', 'md', 'lg', 'xl', '2xl'].map(size => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-16 h-16 bg-bg-1 rounded-lg shadow-${size}`}
                    />
                    <code className="text-sm text-ink-700">
                      {size}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Border Radius</h3>
              <div className="flex flex-wrap gap-6">
                {[
                  { name: 'sm', class: 'rounded-sm' },
                  { name: 'md', class: 'rounded-md' },
                  { name: 'lg', class: 'rounded-lg' },
                  { name: 'xl', class: 'rounded-xl' },
                  { name: '2xl', class: 'rounded-2xl' },
                  { name: 'full', class: 'rounded-full' },
                ].map(item => (
                  <div key={item.name} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-16 h-16 bg-brand-500 ${item.class}`}
                    />
                    <code className="text-sm text-ink-700">
                      {item.name}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            {/* Buttons */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors text-base font-medium">
                  Primary
                </button>
                <button className="px-4 py-2 bg-bg-2 text-ink-900 rounded-lg hover:opacity-80 transition-colors text-base font-medium">
                  Secondary
                </button>
                <button className="px-4 py-2 border border-border text-ink-700 rounded-lg hover:bg-bg-2 transition-colors text-base font-medium">
                  Outline
                </button>
                <button className="px-4 py-2 text-brand-600 hover:opacity-80 transition-colors text-base font-medium">
                  Ghost
                </button>
                <button className="px-4 py-2 bg-joy-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors text-base font-medium">
                  Joy Accent
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-bg-0 rounded-lg border border-border">
                  <h4 className="font-medium text-ink-900 mb-1">Basic Card</h4>
                  <p className="text-base text-ink-700">Simple card with border</p>
                </div>
                <div className="p-4 bg-bg-1 rounded-lg shadow-md">
                  <h4 className="font-medium text-ink-900 mb-1">Elevated Card</h4>
                  <p className="text-base text-ink-700">Card with shadow</p>
                </div>
                <div className="p-4 bg-brand-600 rounded-lg text-bg-1">
                  <h4 className="font-medium mb-1">Brand Card</h4>
                  <p className="text-base opacity-90">Card with brand background</p>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-base font-medium text-ink-700 mb-1">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg-1 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-ink-700 mb-1">
                    Select
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-bg-1 text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-0.5 bg-bg-2 text-ink-700 rounded text-sm font-medium">
                  Default
                </span>
                <span className="px-3 py-0.5 bg-brand-100 text-brand-600 rounded text-sm font-medium">
                  Brand
                </span>
                <span className="px-3 py-0.5 bg-joy-100 text-joy-600 rounded text-sm font-medium">
                  Joy
                </span>
                <span className="px-3 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-sm font-medium">
                  Warning
                </span>
                <span className="px-3 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                  Error
                </span>
                <span className="px-3 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm font-medium">
                  Info
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 pt-4 border-t border-border">
          <a
            href="/admin"
            className="text-base text-ink-400 hover:text-ink-700"
          >
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
