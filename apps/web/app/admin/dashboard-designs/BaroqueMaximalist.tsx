/**
 * Baroque Maximalist Dashboard Design
 * Digital rococo with vaporwave pastels and gold
 */

'use client'

export function BaroqueMaximalist() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        fontFamily: '"Playfair Display", Georgia, serif',
      }}
    >
      {/* Ornate Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 relative">
          {/* Decorative border */}
          <div
            className="absolute inset-0 border-4 rounded-3xl opacity-30"
            style={{ borderColor: '#FFD700' }}
          />
          <div className="relative p-8">
            <div className="text-6xl mb-2">👑</div>
            <h1
              className="text-6xl font-bold mb-3"
              style={{
                color: '#FFD700',
                textShadow:
                  '3px 3px 0 #FF6FD8, 6px 6px 0 #B4A7D6, 2px 2px 20px rgba(255, 215, 0, 0.5)',
                letterSpacing: '0.05em',
              }}
            >
              BAROQUE
            </h1>
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-px" style={{ background: '#FFD700' }} />
              <div className="text-3xl" style={{ color: '#FFD700' }}>
                ✦
              </div>
              <div className="w-16 h-px" style={{ background: '#FFD700' }} />
            </div>
            <p className="text-2xl italic" style={{ color: '#ffffff' }}>
              Versailles meets Vaporwave
            </p>
          </div>
        </div>

        {/* Ornate Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Noble Members', value: '1,247', icon: '💎', color: '#FF6FD8' },
            { label: 'Royal Decrees', value: '89', icon: '📜', color: '#FFD700' },
            { label: 'Treasury Points', value: '12,450', icon: '👑', color: '#B4A7D6' },
          ].map((stat, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl border-4 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderColor: stat.color,
                boxShadow: `0 10px 30px ${stat.color}40, inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Ornate corner decorations */}
              <div
                className="absolute top-2 left-2 text-sm"
                style={{ color: stat.color, opacity: 0.5 }}
              >
                ╔═
              </div>
              <div
                className="absolute top-2 right-2 text-sm"
                style={{ color: stat.color, opacity: 0.5 }}
              >
                ═╗
              </div>
              <div
                className="absolute bottom-2 left-2 text-sm"
                style={{ color: stat.color, opacity: 0.5 }}
              >
                ╚═
              </div>
              <div
                className="absolute bottom-2 right-2 text-sm"
                style={{ color: stat.color, opacity: 0.5 }}
              >
                ═╝
              </div>

              <div className="text-center relative z-10">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>
                  {stat.value}
                </div>
                <div className="text-base uppercase tracking-widest" style={{ color: '#ffffff' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Ornate Panel */}
        <div
          className="p-8 rounded-3xl border-4 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderColor: '#FFD700',
            boxShadow: '0 15px 50px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
          }}
        >
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 2px, transparent 2px, transparent 10px),
                repeating-linear-gradient(-45deg, #FF6FD8 0px, #FF6FD8 2px, transparent 2px, transparent 10px)
              `,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl">📋</div>
              <h2 className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                Royal Announcements
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { action: 'Lavish proposal submitted', time: '2 hours ago', icon: '✨' },
                { action: 'Grand ball scheduled', time: '5 hours ago', icon: '🎭' },
                { action: 'Treasures distributed', time: '1 day ago', icon: '💰' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl border-2 backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: i === 0 ? '#FFD700' : i === 1 ? '#FF6FD8' : '#B4A7D6',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{item.icon}</div>
                    <span className="font-semibold" style={{ color: '#ffffff' }}>
                      {item.action}
                    </span>
                  </div>
                  <span className="text-base italic" style={{ color: '#FFD700' }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote Banner - Maximum Ornate */}
        <div
          className="p-10 rounded-3xl border-4 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 111, 216, 0.2) 100%)',
            borderColor: '#FFD700',
            boxShadow: '0 20px 60px rgba(255, 215, 0, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Ornate corner flourishes */}
          <div className="absolute top-4 left-4 text-3xl" style={{ color: '#FFD700' }}>
            ❦
          </div>
          <div className="absolute top-4 right-4 text-3xl" style={{ color: '#FF6FD8' }}>
            ❦
          </div>
          <div className="absolute bottom-4 left-4 text-3xl" style={{ color: '#B4A7D6' }}>
            ❦
          </div>
          <div className="absolute bottom-4 right-4 text-3xl" style={{ color: '#FFD700' }}>
            ❦
          </div>

          <div className="relative z-10">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-3xl italic mb-4 font-bold" style={{ color: '#FFD700' }}>
              "More is more, and excess is just enough"
            </p>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-px" style={{ background: '#FF6FD8' }} />
              <div className="text-2xl" style={{ color: '#FFD700' }}>
                ❧
              </div>
              <div className="w-12 h-px" style={{ background: '#FF6FD8' }} />
            </div>
            <p className="text-base uppercase tracking-widest" style={{ color: '#ffffff' }}>
              — Rococo Manifesto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
