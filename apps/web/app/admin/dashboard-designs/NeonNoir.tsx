'use client'

/**
 * Neon Noir Tokyo - Cyberpunk Aesthetic
 *
 * Colors: Electric magenta, cyan, deep midnight
 * Vibe: Blade Runner meets Japanese street culture
 * Features: Neon glows, glitch effects, sharp angles
 */

import { useState } from 'react'

export function NeonNoir() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom, #0a0a14 0%, #1a0a28 100%)',
      fontFamily: '"Rajdhani", "Orbitron", monospace',
      color: '#00ffff'
    }}>
      {/* Glitch Effect Header */}
      <header className="border-b-2" style={{
        borderColor: '#ff00ff',
        background: 'rgba(10, 10, 20, 0.95)',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-4xl font-black mb-2" style={{
            color: '#ff00ff',
            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 2px 2px 0 #00ffff',
            letterSpacing: '0.1em'
          }}>
            NEON DASHBOARD//
          </h1>
          <div className="flex gap-2 text-xs" style={{ color: '#00ffff', fontFamily: 'monospace' }}>
            <span>USERS: 1,247</span>
            <span style={{ color: '#ff00ff' }}>||</span>
            <span>VOTES: 23</span>
            <span style={{ color: '#ff00ff' }}>||</span>
            <span>ACTIONS: 89</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* LEFT SIDEBAR */}
          <aside className="space-y-4">
            <div className="border-2 p-4" style={{
              borderColor: '#ff00ff',
              background: 'rgba(255, 0, 255, 0.05)',
              boxShadow: 'inset 0 0 20px rgba(255, 0, 255, 0.1)'
            }}>
              <h2 className="text-sm font-black mb-3" style={{
                color: '#00ffff',
                letterSpacing: '0.2em'
              }}>
                &gt;&gt; YOUR_GROUPS
              </h2>
              {['Seattle Local', 'Tech Co-op', 'Climate PDX'].map((group, i) => (
                <div key={i} className="mb-2 p-2 border" style={{
                  borderColor: '#00ffff',
                  background: 'rgba(0, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.6)'
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{group}</div>
                  <div className="text-xs" style={{ color: '#ff00ff' }}>3 NEW</div>
                </div>
              ))}
            </div>

            <div className="border-2 p-4" style={{
              borderColor: '#00ffff',
              background: 'rgba(0, 255, 255, 0.05)'
            }}>
              <h2 className="text-sm font-black mb-3" style={{
                color: '#ff00ff',
                letterSpacing: '0.2em'
              }}>
                &gt;&gt; PRIORITY_SCAN
              </h2>
              {[
                { topic: 'HOUSING', level: 90 },
                { topic: 'CLIMATE', level: 80 },
                { topic: 'TECH', level: 60 }
              ].map((p, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#ffffff' }}>{p.topic}</span>
                    <span style={{ color: '#ff00ff' }}>{p.level}%</span>
                  </div>
                  <div className="h-2" style={{ background: '#1a0a28' }}>
                    <div className="h-full" style={{
                      width: `${p.level}%`,
                      background: 'linear-gradient(to right, #ff00ff, #00ffff)',
                      boxShadow: `0 0 10px ${p.level > 70 ? '#ff00ff' : '#00ffff'}`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* CENTRAL FEED */}
          <main className="lg:col-span-2 space-y-4">
            <div className="border-2 p-4" style={{
              borderColor: '#ff00ff',
              background: 'rgba(10, 10, 20, 0.8)'
            }}>
              <div className="flex gap-2 mb-4">
                {['ALL', 'TRENDING', 'VOTES'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f.toLowerCase())}
                    className="px-4 py-2 text-xs font-black"
                    style={{
                      background: filter === f.toLowerCase() ? '#ff00ff' : 'transparent',
                      color: filter === f.toLowerCase() ? '#000000' : '#00ffff',
                      border: '2px solid',
                      borderColor: filter === f.toLowerCase() ? '#ff00ff' : '#00ffff',
                      boxShadow: filter === f.toLowerCase() ? '0 0 15px #ff00ff' : 'none',
                      letterSpacing: '0.15em'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            {[
              { title: 'HOUSING CRISIS ALERT', type: 'URGENT', color: '#ff0055' },
              { title: 'COMMUNITY VOTE LIVE', type: 'VOTE', color: '#00ffff' },
              { title: 'CLIMATE ACTION NOW', type: 'EVENT', color: '#00ff88' }
            ].map((post, i) => (
              <div key={i} className="border-2 p-6" style={{
                borderColor: post.color,
                background: `rgba(${post.color === '#ff0055' ? '255,0,85' : post.color === '#00ffff' ? '0,255,255' : '0,255,136'}, 0.05)`,
                boxShadow: `0 0 20px ${post.color}40`,
                cursor: 'pointer',
                transform: 'skew(-0.5deg)',
                transition: 'all 0.3s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'skew(-0.5deg) scale(1.02)'
                e.currentTarget.style.boxShadow = `0 0 30px ${post.color}`
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'skew(-0.5deg) scale(1)'
                e.currentTarget.style.boxShadow = `0 0 20px ${post.color}40`
              }}>
                <div className="text-xs font-black mb-2" style={{
                  color: post.color,
                  letterSpacing: '0.2em'
                }}>
                  [{post.type}]
                </div>
                <h3 className="text-xl font-black mb-3" style={{
                  color: '#ffffff',
                  textShadow: `0 0 10px ${post.color}`
                }}>
                  {post.title}
                </h3>
                <div className="flex gap-4 text-xs" style={{ fontFamily: 'monospace' }}>
                  <span style={{ color: '#00ffff' }}>LIKES: 234</span>
                  <span style={{ color: '#ff00ff' }}>REPLIES: 45</span>
                  <span style={{ color: '#00ff88' }}>SHARES: 12</span>
                </div>
              </div>
            ))}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-4">
            <div className="border-2 p-4" style={{
              borderColor: '#00ff88',
              background: 'rgba(0, 255, 136, 0.05)',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)'
            }}>
              <h2 className="text-sm font-black mb-3" style={{
                color: '#00ff88',
                letterSpacing: '0.2em'
              }}>
                &gt;&gt; ACTION_REQUIRED
              </h2>
              {['5 VOTES PENDING', '3 REPLIES NEEDED', '12 TASKS OVERDUE'].map((action, i) => (
                <div key={i} className="mb-2 p-2 text-xs border" style={{
                  borderColor: '#ff0055',
                  background: 'rgba(255, 0, 85, 0.1)',
                  color: '#ffffff'
                }}>
                  ⚠ {action}
                </div>
              ))}
            </div>

            <div className="border-2 p-4" style={{
              borderColor: '#ff00ff',
              background: 'rgba(255, 0, 255, 0.05)'
            }}>
              <h2 className="text-sm font-black mb-3" style={{
                color: '#00ffff',
                letterSpacing: '0.2em'
              }}>
                &gt;&gt; EVENTS_STREAM
              </h2>
              {['Garden Meeting', 'Tech Gathering', 'Climate March'].map((event, i) => (
                <div key={i} className="mb-3 p-3 border" style={{
                  borderColor: '#00ffff',
                  background: 'rgba(0, 255, 255, 0.05)'
                }}>
                  <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{event}</div>
                  <div className="text-xs mt-1" style={{ color: '#ff00ff' }}>TOMORROW • 18:00</div>
                  <button className="mt-2 px-3 py-1 text-xs font-black" style={{
                    background: '#00ffff',
                    color: '#000000',
                    border: 'none',
                    boxShadow: '0 0 10px #00ffff'
                  }}>
                    RSVP
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Scan lines effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.03) 2px, rgba(255, 0, 255, 0.03) 4px)',
        zIndex: 9999
      }} />
    </div>
  )
}
