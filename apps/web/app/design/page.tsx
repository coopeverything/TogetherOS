'use client';

import { useState } from 'react';

export default function DesignShowcase() {
  const [darkMode, setDarkMode] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<'calm' | 'compact'>('calm');

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style jsx global>{`
        :root {
          --bg-0: #FAFAF9;
          --bg-1: #FFFFFF;
          --bg-2: #F5F5F4;
          --ink-900: #0F172A;
          --ink-700: #334155;
          --ink-400: #94A3B8;
          --border: #E5E7EB;
          --brand-600: #059669;
          --brand-500: #10B981;
          --brand-100: #D1FAE5;
          --joy-600: #F59E0B;
          --joy-500: #FDBA74;
          --joy-100: #FFF7ED;
          --success: #16A34A;
          --success-bg: #DCFCE7;
          --info: #0EA5E9;
          --info-bg: #E0F2FE;
          --warn: #D97706;
          --warn-bg: #FEF3C7;
          --danger: #DC2626;
          --danger-bg: #FEE2E2;
        }

        .dark {
          --bg-0: #0B0F14;
          --bg-1: #0F141A;
          --bg-2: #121922;
          --ink-900: #E5E7EB;
          --ink-700: #CBD5E1;
          --ink-400: #94A3B8;
          --border: #1F2937;
          --brand-500: #22C55E;
          --joy-500: #FBBF24;
        }

        body {
          background: var(--bg-0);
          color: var(--ink-900);
          font-family: Inter, -apple-system, sans-serif;
          line-height: 1.6;
        }
      `}</style>

      <div style={{ background: 'var(--bg-0)', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              TogetherOS Design System
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'var(--bg-2)',
                color: 'var(--ink-700)',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>

          {/* Philosophy */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
              Warm Minimalism
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--ink-700)', maxWidth: '68ch', lineHeight: 1.7 }}>
              Clean, joyful, and restful. Lots of white space, soft neutrals, one lively accent,
              and a gentle warm companion. Text stays dark and readable; accents do the emotional work.
            </p>
          </section>

          {/* Color Palette */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Color Palette
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Backgrounds */}
              <ColorGroup title="Backgrounds" colors={[
                { name: 'bg-0 (page)', value: darkMode ? '#0B0F14' : '#FAFAF9' },
                { name: 'bg-1 (cards)', value: darkMode ? '#0F141A' : '#FFFFFF' },
                { name: 'bg-2 (panels)', value: darkMode ? '#121922' : '#F5F5F4' },
              ]} />

              {/* Text */}
              <ColorGroup title="Text & Neutrals" colors={[
                { name: 'ink-900 (primary)', value: darkMode ? '#E5E7EB' : '#0F172A' },
                { name: 'ink-700 (secondary)', value: darkMode ? '#CBD5E1' : '#334155' },
                { name: 'ink-400 (muted)', value: '#94A3B8' },
                { name: 'border', value: darkMode ? '#1F2937' : '#E5E7EB' },
              ]} />

              {/* Brand */}
              <ColorGroup title="Brand (Cooperative Green)" colors={[
                { name: 'brand-600', value: '#059669' },
                { name: 'brand-500', value: darkMode ? '#22C55E' : '#10B981' },
                { name: 'brand-100', value: '#D1FAE5' },
              ]} />

              {/* Joy */}
              <ColorGroup title="Joy (Apricot)" colors={[
                { name: 'joy-600', value: '#F59E0B' },
                { name: 'joy-500', value: darkMode ? '#FBBF24' : '#FDBA74' },
                { name: 'joy-100', value: '#FFF7ED' },
              ]} />

              {/* Semantic */}
              <ColorGroup title="Semantic" colors={[
                { name: 'Success', value: '#16A34A', bg: '#DCFCE7' },
                { name: 'Info', value: '#0EA5E9', bg: '#E0F2FE' },
                { name: 'Warning', value: '#D97706', bg: '#FEF3C7' },
                { name: 'Danger', value: '#DC2626', bg: '#FEE2E2' },
              ]} />
            </div>
          </section>

          {/* Typography */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Typography
            </h2>
            <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Heading 1 (36px, Bold)
              </h1>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Heading 2 (28px, Bold)
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--ink-700)', marginBottom: '1rem', maxWidth: '68ch' }}>
                Body text (18px, Regular). Maximum line length of 68-72 characters keeps reading
                comfortable. Line height of 1.6+ gives the text room to breathe.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--ink-400)', maxWidth: '68ch' }}>
                Muted text (16px, Regular) for secondary information and captions.
              </p>
            </div>
          </section>

          {/* Buttons */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Buttons
            </h2>
            <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={{
                background: 'var(--brand-600)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Primary Action
              </button>
              <button style={{
                background: 'var(--bg-1)',
                color: 'var(--ink-700)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Secondary Action
              </button>
              <button style={{
                background: 'transparent',
                color: 'var(--ink-700)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '1rem'
              }}>
                Tertiary Link
              </button>
              <button style={{
                background: 'var(--joy-600)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Joy Accent
              </button>
            </div>
          </section>

          {/* Dashboard Mockup */}
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                Dashboard Example
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setDashboardMode('calm')}
                  style={{
                    background: dashboardMode === 'calm' ? 'var(--brand-100)' : 'var(--bg-2)',
                    color: dashboardMode === 'calm' ? 'var(--brand-600)' : 'var(--ink-700)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid ' + (dashboardMode === 'calm' ? 'var(--brand-500)' : 'var(--border)'),
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Calm
                </button>
                <button
                  onClick={() => setDashboardMode('compact')}
                  style={{
                    background: dashboardMode === 'compact' ? 'var(--brand-100)' : 'var(--bg-2)',
                    color: dashboardMode === 'compact' ? 'var(--brand-600)' : 'var(--ink-700)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid ' + (dashboardMode === 'compact' ? 'var(--brand-500)' : 'var(--border)'),
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Compact
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: dashboardMode === 'calm' ? 'repeat(auto-fit, minmax(400px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <DashboardTile
                title="Active Members"
                value="147"
                change="+12 this week"
                trend="up"
                accent="brand"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Open Proposals"
                value="8"
                change="3 need your vote"
                trend="neutral"
                accent="joy"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Mutual Aid Requests"
                value="23"
                change="5 unfulfilled"
                trend="down"
                accent="warn"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Treasury Balance"
                value="$12,450"
                change="+8% this month"
                trend="up"
                accent="success"
                mode={dashboardMode}
              />
            </div>
          </section>

          {/* Cards */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Cards & Panels
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                background: 'var(--bg-1)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                  Standard Card
                </h3>
                <p style={{ color: 'var(--ink-700)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Roomy padding (2rem), clean typography, and gentle borders. One action per card.
                </p>
                <button style={{
                  background: 'var(--brand-600)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Take Action
                </button>
              </div>

              <div style={{
                background: 'var(--joy-100)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid var(--joy-500)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--joy-600)', marginBottom: '1rem' }}>
                  Highlighted Card
                </h3>
                <p style={{ color: 'var(--ink-700)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Soft accent background draws attention to "what matters now" without overwhelming.
                </p>
                <button style={{
                  background: 'var(--joy-600)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Review Now
                </button>
              </div>

              <div style={{
                background: 'var(--bg-2)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-700)', marginBottom: '1rem' }}>
                  Subtle Panel
                </h3>
                <p style={{ color: 'var(--ink-400)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Background panels for secondary content. Lower contrast keeps visual hierarchy clear.
                </p>
                <button style={{
                  background: 'var(--bg-1)',
                  color: 'var(--ink-700)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* Usage Rules */}
          <section>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Design Principles
            </h2>
            <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <ul style={{ color: 'var(--ink-700)', lineHeight: 2, paddingLeft: '1.5rem' }}>
                <li><strong>One accent per screen</strong> — Choose either brand or joy as the hero, not both</li>
                <li><strong>Big, breathable panels</strong> — Default padding ≥ 2rem, line height 1.6+</li>
                <li><strong>Space first, borders second</strong> — Separate sections with whitespace</li>
                <li><strong>Typography cap</strong> — Max 68-72 characters per line for readability</li>
                <li><strong>Micro transitions</strong> — 150-200ms ease-out, no parallax or looping animations</li>
                <li><strong>Accessibility</strong> — Body text ≥ WCAG AA (aim 7:1 contrast)</li>
              </ul>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: Array<{ name: string; value: string; bg?: string }> }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {colors.map((color) => (
          <div key={color.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: color.value,
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              flexShrink: 0
            }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)' }}>{color.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-400)', fontFamily: 'monospace' }}>{color.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardTile({
  title,
  value,
  change,
  trend,
  accent,
  mode
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  accent: 'brand' | 'joy' | 'success' | 'warn';
  mode: 'calm' | 'compact';
}) {
  const accentColors = {
    brand: 'var(--brand-500)',
    joy: 'var(--joy-500)',
    success: 'var(--success)',
    warn: 'var(--warn)'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div style={{
      background: 'var(--bg-1)',
      padding: mode === 'calm' ? '2rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: mode === 'calm' ? '1.5rem' : '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{
          fontSize: mode === 'calm' ? '1rem' : '0.875rem',
          fontWeight: 600,
          color: 'var(--ink-700)',
          margin: 0
        }}>
          {title}
        </h3>
        <span style={{ fontSize: '1.5rem' }}>{trendIcons[trend]}</span>
      </div>

      <div style={{
        fontSize: mode === 'calm' ? '3rem' : '2.25rem',
        fontWeight: 700,
        color: accentColors[accent],
        lineHeight: 1
      }}>
        {value}
      </div>

      <div style={{
        fontSize: mode === 'calm' ? '0.875rem' : '0.75rem',
        color: 'var(--ink-400)'
      }}>
        {change}
      </div>

      {mode === 'calm' && (
        <button style={{
          background: 'transparent',
          color: accentColors[accent],
          padding: '0.5rem 0',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.875rem'
        }}>
          View details →
        </button>
      )}
    </div>
  );
}
