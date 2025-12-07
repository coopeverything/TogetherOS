import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cooperation Paths | TogetherOS',
  description: 'Eight pathways for building resilience, prosperity, and cooperation in communities.',
}

const cooperationPaths = [
  {
    number: 1,
    name: 'Collaborative Education',
    description: 'Learn, co-teach, certify; patterns for knowledge capture and reuse.',
    keywords: ['learning', 'curriculum', 'tutorials', 'workshops', 'certification', 'docs', 'open-edu', 'mentorship', 'research-notes'],
    accentLevel: 1, // cycles through accent-1 to accent-4
  },
  {
    number: 2,
    name: 'Social Economy',
    description: 'Mutual aid, time-banking, micro-funds, and Social Horizon crypto; finance the commons.',
    keywords: ['timebank', 'mutual-aid', 'microgrants', 'crowdfund', 'cooperative-finance', 'wallets', 'Social-Horizon', 'credits'],
    accentLevel: 2,
  },
  {
    number: 3,
    name: 'Common Wellbeing',
    description: 'Health, nutrition, movement, care networks; reduce isolation and improve daily life.',
    keywords: ['health', 'nutrition', 'movement', 'care-teams', 'accessibility', 'mental-health', 'support-groups'],
    accentLevel: 3,
  },
  {
    number: 4,
    name: 'Cooperative Technology',
    description: 'Open, privacy-respecting tools and infrastructure that communities own and operate.',
    keywords: ['open-source', 'privacy', 'self-host', 'dev-containers', 'CI/CD', 'infra', 'maps', 'identity', 'moderation-tools'],
    accentLevel: 4,
  },
  {
    number: 5,
    name: 'Collective Governance',
    description: 'Open deliberation, direct legislation, empathy-first moderation, participation metrics.',
    keywords: ['proposals', 'voting', 'consensus', 'facilitation', 'moderation', 'restorative', 'metrics', 'support-points'],
    accentLevel: 1, // cycle restarts
  },
  {
    number: 6,
    name: 'Community Connection',
    description: 'Local groups, events, co-ops, and city-level collaboration mapped to real people and places.',
    keywords: ['groups', 'events', 'meetups', 'chapters', 'city-hubs', 'geo-map', 'directories'],
    accentLevel: 2,
  },
  {
    number: 7,
    name: 'Collaborative Media & Culture',
    description: 'Stories, film, music, writing, and archives that celebrate cooperation and courage.',
    keywords: ['storytelling', 'film', 'music', 'writing', 'archives', 'media-library', 'licensing', 'remix'],
    accentLevel: 3,
  },
  {
    number: 8,
    name: 'Common Planet',
    description: 'Habitat repair, food forests, circular materials, climate-positive logistics.',
    keywords: ['regeneration', 'circularity', 'materials', 'food-forest', 'permaculture', 'repair-cafe', 'climate'],
    accentLevel: 4,
  },
]

// Get Tailwind classes based on accent level (1-4)
function getAccentClasses(level: number) {
  switch (level) {
    case 1: return { bg: 'bg-accent-1-bg', border: 'border-accent-1/30', text: 'text-accent-1', badge: 'bg-accent-1 text-bg-1' }
    case 2: return { bg: 'bg-accent-2-bg', border: 'border-accent-2/30', text: 'text-accent-2', badge: 'bg-accent-2 text-bg-1' }
    case 3: return { bg: 'bg-accent-3-bg', border: 'border-accent-3/30', text: 'text-accent-3', badge: 'bg-accent-3 text-bg-1' }
    case 4: return { bg: 'bg-accent-4-bg', border: 'border-accent-4/30', text: 'text-accent-4', badge: 'bg-accent-4 text-bg-1' }
    default: return { bg: 'bg-bg-2', border: 'border-border', text: 'text-ink-700', badge: 'bg-brand-600 text-bg-1' }
  }
}

export default function CooperationPathsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-0 via-bg-1 to-bg-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-xl font-bold text-ink-900 mb-4">
            Eight Cooperation Paths
          </h1>
          <p className="text-sm text-ink-700 max-w-3xl mx-auto">
            Pathways for building resilience, prosperity, and cooperation in communities. These are the canonical categories used across TogetherOS docs, issues, and UI.
          </p>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {cooperationPaths.map((path) => {
            const accent = getAccentClasses(path.accentLevel)
            return (
              <div
                key={path.number}
                className={`border ${accent.border} ${accent.bg} rounded-lg p-4 hover:shadow-lg transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-4">
                  {/* 3D-style number badge with emboss effect */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full ${accent.badge} flex items-center justify-center font-bold text-lg shadow-lg`}
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {path.number}
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-base font-bold ${accent.text} mb-2`}>
                      {path.name}
                    </h2>
                    <p className="text-ink-700 mb-4 leading-relaxed text-sm">
                      {path.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {path.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-0.5 bg-bg-1 border border-border rounded-full text-xs text-ink-400"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Usage Guidelines */}
        <div className="mt-12 p-4 bg-bg-2 border border-border rounded-lg">
          <h2 className="text-sm font-bold text-ink-900 mb-4">Usage Guidelines</h2>
          <ul className="space-y-2 text-ink-700">
            <li className="flex items-start">
              <span className="text-success mr-2">✓</span>
              <span>Use these exact <strong>Path names</strong> across docs, issues, and UI</span>
            </li>
            <li className="flex items-start">
              <span className="text-success mr-2">✓</span>
              <span>Prefer existing keywords; add sparingly with a short rationale</span>
            </li>
            <li className="flex items-start">
              <span className="text-success mr-2">✓</span>
              <span>When migrating older text, map content to one Path above and drop non-canonical labels</span>
            </li>
          </ul>
        </div>

        {/* Related Links */}
        <div className="mt-4 p-4 bg-accent-1-bg border-l-4 border-accent-1 rounded-r-lg">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">Related Documentation</h3>
          <div className="space-y-2">
            <a
              href="/manifesto"
              className="block text-brand-600 hover:text-brand-500 font-medium transition-colors"
            >
              → Read the Manifesto
            </a>
            <a
              href="/admin/modules"
              className="block text-brand-600 hover:text-brand-500 font-medium transition-colors"
            >
              → Explore Modules
            </a>
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-brand-600 hover:text-brand-500 font-medium transition-colors"
            >
              → View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
