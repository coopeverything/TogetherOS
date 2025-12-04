'use client'

/**
 * Design Gallery - Central hub for TogetherOS design system
 * Route: /admin/design-gallery
 * Features: Theme previews, design tokens, component showcase
 */

import { useState } from 'react'

type TabId = 'themes' | 'tokens' | 'components'

interface Theme {
  id: string
  name: string
  personality: string
  mode: 'light' | 'dark'
  colors: {
    primary: string
    accent: string
    bg: string
    text: string
  }
}

const themes: Theme[] = [
  {
    id: 'arctic-minimal',
    name: 'Arctic Minimal',
    personality: 'Clean, accessible',
    mode: 'light',
    colors: { primary: '#4A6FA5', accent: '#F0F4F8', bg: '#FFFFFF', text: '#1A1A1A' }
  },
  {
    id: 'horizon-dawn',
    name: 'Horizon Dawn',
    personality: 'Optimistic, energizing',
    mode: 'light',
    colors: { primary: '#FF6B6B', accent: '#FFE66D', bg: '#FFF9E6', text: '#2D2A26' }
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    personality: 'Calm, professional',
    mode: 'dark',
    colors: { primary: '#0A8F8F', accent: '#7FDBDA', bg: '#0F1419', text: '#E8F1F2' }
  },
  {
    id: 'forest-canvas',
    name: 'Forest Canvas',
    personality: 'Organic, sustainable',
    mode: 'light',
    colors: { primary: '#4A7C59', accent: '#A3C9A8', bg: '#F5F5F5', text: '#1A1A2E' }
  },
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    personality: 'Bold, futuristic',
    mode: 'dark',
    colors: { primary: '#7B2CBF', accent: '#00D9FF', bg: '#0D0D0D', text: '#E0AAFF' }
  },
  {
    id: 'terracotta-earth',
    name: 'Terracotta Earth',
    personality: 'Grounded, authentic',
    mode: 'light',
    colors: { primary: '#CC5500', accent: '#E6D5AC', bg: '#FAF7F2', text: '#2C2C2C' }
  }
]

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
  const [activeTab, setActiveTab] = useState<TabId>('themes')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(text)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'themes', label: 'Themes' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'components', label: 'Components' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Design Gallery
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            TogetherOS design system - themes, tokens, and components
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                  className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    selectedTheme === theme.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Theme Preview */}
                  <div
                    className="p-4 h-32"
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-md"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.primary + '40' }}
                      />
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme.colors.text }}
                    >
                      Sample text
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: theme.colors.text + '99' }}
                    >
                      Secondary text example
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {theme.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        theme.mode === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {theme.mode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {theme.personality}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Theme Details */}
            {selectedTheme && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {themes.find(t => t.id === selectedTheme)?.name} - Color Palette
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(themes.find(t => t.id === selectedTheme)?.colors || {}).map(([name, value]) => (
                    <button
                      key={name}
                      onClick={() => copyToClipboard(value)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: value }}
                      />
                      <div className="text-left">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {copiedColor === value ? 'Copied!' : value}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Click a color to copy its hex value
                </p>
              </div>
            )}

            {/* Usage Instructions */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">How to use themes</h3>
              <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                {'<div data-theme="ocean-depth">...</div>'}
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Apply data-theme attribute to any container to switch themes. CSS variables update automatically.
              </p>
            </div>
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            {/* Typography */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Typography Scale</h3>
              <div className="space-y-3">
                {typographyScale.map(item => (
                  <div key={item.name} className="flex items-baseline gap-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded w-16 text-center text-gray-700 dark:text-gray-300">
                      {item.name}
                    </code>
                    <span className="text-gray-600 dark:text-gray-400 text-sm w-32">
                      {item.size}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 text-xs">
                      {item.use}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Spacing Scale</h3>
              <div className="flex flex-wrap gap-4">
                {spacingScale.map(item => (
                  <div key={item.name} className="flex flex-col items-center gap-1">
                    <div
                      className="bg-emerald-500 rounded"
                      style={{ width: item.value, height: item.value }}
                    />
                    <code className="text-xs text-gray-600 dark:text-gray-400">
                      {item.name}
                    </code>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {item.px}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Shadows</h3>
              <div className="flex flex-wrap gap-6">
                {['sm', 'md', 'lg', 'xl', '2xl'].map(size => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-16 h-16 bg-white dark:bg-gray-700 rounded-lg shadow-${size}`}
                    />
                    <code className="text-xs text-gray-600 dark:text-gray-400">
                      {size}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Border Radius</h3>
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
                      className={`w-16 h-16 bg-emerald-500 ${item.class}`}
                    />
                    <code className="text-xs text-gray-600 dark:text-gray-400">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                  Primary
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                  Secondary
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Outline
                </button>
                <button className="px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-sm font-medium">
                  Ghost
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Destructive
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Basic Card</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Simple card with border</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Elevated Card</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Card with shadow</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg text-white">
                  <h4 className="font-medium mb-1">Gradient Card</h4>
                  <p className="text-sm text-emerald-100">Card with gradient background</p>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                  Default
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                  Success
                </span>
                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                  Warning
                </span>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                  Error
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                  Info
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/admin"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
