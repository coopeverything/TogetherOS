'use client'

/**
 * Compact Dashboard with Enhanced Zinc + Sage Theme
 *
 * Features:
 * - Smaller, denser card layout
 * - 4-color palette: Zinc, Sage, Dusty Rose, Slate Blue
 * - Bento grid design with micro-interactions
 */

import '@/styles/design-system/themes/minimalistic.css'

const COOPERATION_PATHS = [
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'economy', name: 'Economy', emoji: '💰' },
  { id: 'wellbeing', name: 'Wellbeing', emoji: '🫶' },
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'governance', name: 'Governance', emoji: '🏛️' },
  { id: 'community', name: 'Community', emoji: '🤝' },
  { id: 'media', name: 'Media', emoji: '🎨' },
  { id: 'planet', name: 'Planet', emoji: '🌍' },
]

const RECENT_ACTIVITY = [
  { user: 'Alice', action: 'created proposal', time: '2m' },
  { user: 'Bob', action: 'joined group', time: '5m' },
  { user: 'Carol', action: 'earned 50 RP', time: '12m' },
  { user: 'David', action: 'allocated SP', time: '1h' },
]

export function CompactZincSage() {
  return (
    <div
      data-theme="zinc-sage-ext"
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Compact Dashboard
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Zinc + Sage Extended with dusty rose & slate blue
            </p>
          </div>
          <a
            href="/admin/dashboard"
            className="text-xs px-3 py-1.5 rounded-md border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ← Back
          </a>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Stats - Small Cards */}
          {[
            { label: 'Members', value: '2,847', color: 'var(--color-primary)' },
            { label: 'SP Total', value: '45.2K', color: 'var(--color-accent)' },
            { label: 'Groups', value: '156', color: 'var(--color-complement-warm)' },
            { label: 'Proposals', value: '23', color: 'var(--color-complement-cool)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {stat.label}
              </div>
              <div
                className="text-xl font-bold mt-0.5"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}

          {/* Cooperation Paths - 2 columns wide */}
          <div
            className="col-span-2 row-span-2 p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Cooperation Paths
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {COOPERATION_PATHS.map((path) => (
                <div
                  key={path.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span>{path.emoji}</span>
                  <span className="truncate">{path.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="col-span-2 sm:col-span-2 row-span-2 p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Recent Activity
            </h3>
            <div className="space-y-1.5">
              {RECENT_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1 border-b last:border-b-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span>
                    <span style={{ color: 'var(--color-accent)' }}>{item.user}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}> {item.action}</span>
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="col-span-2 p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                className="px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                New Proposal
              </button>
              <button
                className="px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                Allocate SP
              </button>
              <button
                className="px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-complement-warm)',
                  color: 'white',
                }}
              >
                Join Group
              </button>
              <button
                className="px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-complement-cool)',
                  color: 'white',
                }}
              >
                Bridge AI
              </button>
            </div>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3
            className="text-xs font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Extended 4-Color Palette
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Zinc', var: '--color-primary', hex: '#3F3F46' },
              { name: 'Sage', var: '--color-accent', hex: '#6B7C6B' },
              { name: 'Dusty Rose', var: '--color-complement-warm', hex: '#8B7878' },
              { name: 'Slate Blue', var: '--color-complement-cool', hex: '#6B7282' },
            ].map((color) => (
              <div key={color.name} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{
                    backgroundColor: `var(${color.var})`,
                    borderColor: 'var(--color-border)',
                  }}
                />
                <div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {color.name}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {color.hex}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompactZincSage
