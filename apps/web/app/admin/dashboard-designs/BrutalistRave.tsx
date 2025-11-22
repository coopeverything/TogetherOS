/**
 * Brutalist Rave Dashboard Design
 * Post-Soviet techno with concrete and aggressive neon
 */

'use client'

export function BrutalistRave() {
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: '#808080',
        fontFamily: '"Arial Black", "Impact", sans-serif',
      }}
    >
      {/* Raw Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-6 bg-black border-4 border-red-600">
          <h1
            className="text-7xl font-black mb-2"
            style={{
              color: '#ff0000',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              textShadow: '4px 4px 0 #000000, 8px 8px 0 #00ff00',
            }}
          >
            BRUTALIST RAVE
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-2 flex-1 bg-red-600" />
            <div className="h-2 w-2 bg-lime-500" />
            <div className="h-2 flex-1 bg-red-600" />
          </div>
        </div>

        {/* Concrete Stats Blocks */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { value: '1247', label: 'MEMBERS', color: '#ff0000' },
            { value: '89', label: 'ACTIONS', color: '#00ff00' },
            { value: '12.4K', label: 'POINTS', color: '#ffff00' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-700 border-4 p-6 relative overflow-hidden"
              style={{
                borderColor: stat.color,
                boxShadow: `8px 8px 0 ${stat.color}40`,
              }}
            >
              {/* Aggressive stripe pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    ${stat.color} 10px,
                    ${stat.color} 20px
                  )`,
                }}
              />
              <div className="relative z-10">
                <div
                  className="text-6xl font-black mb-2"
                  style={{
                    color: stat.color,
                    textShadow: '3px 3px 0 #000000',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-black tracking-wider" style={{ color: '#ffffff' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Concrete Slab */}
        <div className="bg-gray-600 border-4 border-black mb-6">
          <div
            className="p-4 border-b-4 border-lime-500"
            style={{ background: '#000000' }}
          >
            <h2 className="text-3xl font-black" style={{ color: '#ff0000' }}>
              /// SYSTEM LOG
            </h2>
          </div>
          <div>
            {[
              { text: 'PROPOSAL SUBMITTED', time: '02:00', alert: true },
              { text: 'EVENT SCHEDULED', time: '05:00', alert: false },
              { text: 'POINTS DISTRIBUTED', time: '24:00', alert: false },
              { text: 'DECISION EXECUTED', time: '72:00', alert: false },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b-2 border-gray-700"
                style={{
                  background: item.alert ? '#1a0000' : '#4a4a4a',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 border-2"
                    style={{
                      borderColor: item.alert ? '#ff0000' : '#00ff00',
                      background: item.alert ? '#ff0000' : 'transparent',
                    }}
                  />
                  <span
                    className="font-black text-sm"
                    style={{ color: item.alert ? '#ff0000' : '#ffffff' }}
                  >
                    {item.text}
                  </span>
                </div>
                <div
                  className="font-mono text-xs font-bold"
                  style={{ color: '#00ff00' }}
                >
                  [{item.time}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Layout - Industrial */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black border-4 border-red-600 p-6">
            <div className="text-5xl font-black mb-3" style={{ color: '#ff0000' }}>
              ▲
            </div>
            <div className="text-sm font-black mb-2" style={{ color: '#ffffff' }}>
              ACTIVE ALERTS
            </div>
            <div className="text-3xl font-black" style={{ color: '#ff0000' }}>
              3
            </div>
          </div>
          <div className="bg-black border-4 border-lime-500 p-6">
            <div className="text-5xl font-black mb-3" style={{ color: '#00ff00' }}>
              ►
            </div>
            <div className="text-sm font-black mb-2" style={{ color: '#ffffff' }}>
              SYSTEM STATUS
            </div>
            <div className="text-2xl font-black" style={{ color: '#00ff00' }}>
              ONLINE
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div
          className="border-8 p-8 relative overflow-hidden"
          style={{
            borderColor: '#ffff00',
            background: '#000000',
          }}
        >
          {/* Hazard stripes */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `repeating-linear-gradient(
                -45deg,
                #ffff00,
                #ffff00 20px,
                #000000 20px,
                #000000 40px
              )`,
            }}
          />
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p
              className="text-3xl font-black mb-3"
              style={{
                color: '#ffff00',
                textShadow: '3px 3px 0 #000000',
              }}
            >
              RAW POWER / PURE FUNCTION
            </p>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-1 w-24 bg-red-600" />
              <div className="h-1 w-1 bg-lime-500" />
              <div className="h-1 w-24 bg-red-600" />
            </div>
            <p className="text-sm font-black tracking-widest" style={{ color: '#ffffff' }}>
              /// NO COMPROMISES /// NO DECORATIONS ///
            </p>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="mt-6 bg-black border-4 border-lime-500 p-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-lime-500 font-bold">$</span>
            <span className="text-white text-sm">system_running --mode=BRUTAL</span>
            <span className="text-lime-500 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  )
}
