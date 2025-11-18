/**
 * Desert Bloom Dashboard Design
 * Psychedelic southwest aesthetic with terracotta and sage
 */

'use client'

export function DesertBloom() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #F4F1DE 0%, #E8DCC4 50%, #F4F1DE 100%)',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1
            className="text-5xl font-bold mb-3"
            style={{
              color: '#E07A5F',
              textShadow: '3px 3px 0 #81B29A',
              letterSpacing: '0.02em',
            }}
          >
            Desert Bloom
          </h1>
          <p className="text-xl" style={{ color: '#3D405B' }}>
            Warm earth tones meet psychedelic patterns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Active Members', value: '1,247', icon: '🌵' },
            { label: 'Proposals', value: '89', icon: '🏜️' },
            { label: 'Support Points', value: '12,450', icon: '🌻' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border-4 relative overflow-hidden"
              style={{
                background: '#FEF6E4',
                borderColor: i === 0 ? '#E07A5F' : i === 1 ? '#81B29A' : '#F2CC8F',
                boxShadow: '8px 8px 0 rgba(61, 64, 91, 0.1)',
              }}
            >
              <div className="relative z-10">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: '#3D405B' }}>
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-wide" style={{ color: '#81B29A' }}>
                  {stat.label}
                </div>
              </div>
              {/* Decorative pattern */}
              <div
                className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
                style={{
                  background: `radial-gradient(circle, ${i === 0 ? '#E07A5F' : i === 1 ? '#81B29A' : '#F2CC8F'} 0%, transparent 70%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div
          className="p-8 rounded-3xl border-4 mb-8"
          style={{
            background: 'linear-gradient(135deg, #FEF6E4 0%, #F8F0DC 100%)',
            borderColor: '#E07A5F',
            boxShadow: '12px 12px 0 rgba(129, 178, 154, 0.2)',
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#3D405B' }}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              { action: 'New proposal submitted', time: '2 hours ago', color: '#E07A5F' },
              { action: 'Community event scheduled', time: '5 hours ago', color: '#81B29A' },
              { action: 'Support points distributed', time: '1 day ago', color: '#F2CC8F' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border-2"
                style={{
                  background: '#FFFFFF',
                  borderColor: item.color,
                  transition: 'all 0.3s ease',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="font-medium" style={{ color: '#3D405B' }}>
                    {item.action}
                  </span>
                </div>
                <span className="text-sm" style={{ color: '#81B29A' }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote/Philosophy Section */}
        <div
          className="p-8 rounded-3xl border-4 text-center"
          style={{
            background: '#81B29A',
            borderColor: '#F2CC8F',
            boxShadow: '0 8px 30px rgba(129, 178, 154, 0.3)',
          }}
        >
          <div className="text-6xl mb-4">🌺</div>
          <p className="text-2xl italic mb-3" style={{ color: '#FEF6E4' }}>
            "Like desert flowers after rain, communities bloom through cooperation"
          </p>
          <p className="text-sm uppercase tracking-widest" style={{ color: '#F4F1DE' }}>
            — Southwest Wisdom
          </p>
        </div>
      </div>
    </div>
  )
}
