/**
 * Nordic Void Dashboard Design
 * Inverted Scandinavian minimalism with aurora accents
 */

'use client'

export function NordicVoid() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: '#000000',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1
            className="text-6xl mb-2"
            style={{
              fontWeight: 100,
              letterSpacing: '0.15em',
              color: '#ffffff',
            }}
          >
            NORDIC VOID
          </h1>
          <div
            className="h-px w-32 mb-4"
            style={{ background: 'linear-gradient(90deg, #00ff9f 0%, transparent 100%)' }}
          />
          <p className="text-base uppercase tracking-widest" style={{ color: '#666666' }}>
            Extreme minimalism meets northern lights
          </p>
        </div>

        {/* Stats - Ultra Minimal */}
        <div className="grid grid-cols-3 gap-1 mb-12">
          {[
            { value: '1247', label: 'Members' },
            { value: '89', label: 'Proposals' },
            { value: '12.4k', label: 'Points' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-8 border relative group"
              style={{
                borderColor: i === 1 ? '#00ff9f' : '#222222',
                background: i === 1 ? '#001a0f' : '#000000',
                transition: 'all 0.3s ease',
              }}
            >
              <div className="text-5xl font-thin mb-2" style={{ color: '#ffffff' }}>
                {stat.value}
              </div>
              <div
                className="text-sm uppercase tracking-widest"
                style={{ color: i === 1 ? '#00ff9f' : '#666666' }}
              >
                {stat.label}
              </div>
              {/* Aurora glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, #00ff9f 0%, transparent 70%)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Content - Void Space */}
        <div className="mb-12 border" style={{ borderColor: '#222222' }}>
          <div className="p-8 border-b" style={{ borderColor: '#222222' }}>
            <h2 className="text-3xl font-thin tracking-wide mb-1">Recent Activity</h2>
            <div className="h-px w-16" style={{ background: '#00ff9f' }} />
          </div>
          <div>
            {[
              { text: 'New proposal submitted', accent: true },
              { text: 'Community event scheduled', accent: false },
              { text: 'Support points distributed', accent: false },
              { text: 'Governance decision finalized', accent: false },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 border-b group hover:bg-opacity-5"
                style={{
                  borderColor: '#222222',
                  background: item.accent ? '#001a0f' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: item.accent ? '#00ff9f' : '#666666' }}
                    />
                    <span
                      className="font-light"
                      style={{ color: item.accent ? '#00ff9f' : '#ffffff' }}
                    >
                      {item.text}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: '#666666' }}>
                    {i === 0 ? '2h' : i === 1 ? '5h' : i === 2 ? '1d' : '3d'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aurora Banner */}
        <div
          className="relative p-12 border overflow-hidden"
          style={{
            borderColor: '#00ff9f',
            background: '#000000',
          }}
        >
          {/* Animated aurora effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'linear-gradient(45deg, transparent 30%, #00ff9f 50%, transparent 70%)',
              animation: 'aurora 8s ease-in-out infinite',
            }}
          />
          <div className="relative z-10 text-center">
            <div className="text-4xl font-thin mb-4 tracking-widest">∞</div>
            <p className="text-2xl font-light mb-2" style={{ color: '#ffffff' }}>
              Less is more. Silence is golden.
            </p>
            <p className="text-base uppercase tracking-widest" style={{ color: '#00ff9f' }}>
              Nordic Philosophy
            </p>
          </div>
        </div>
      </div>

      {/* Aurora animation keyframes */}
      <style jsx>{`
        @keyframes aurora {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
