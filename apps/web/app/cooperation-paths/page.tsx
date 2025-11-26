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
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    number: 2,
    name: 'Social Economy',
    description: 'Mutual aid, time-banking, micro-funds, and Social Horizon crypto; finance the commons.',
    keywords: ['timebank', 'mutual-aid', 'microgrants', 'crowdfund', 'cooperative-finance', 'wallets', 'Social-Horizon', 'credits'],
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    number: 3,
    name: 'Common Wellbeing',
    description: 'Health, nutrition, movement, care networks; reduce isolation and improve daily life.',
    keywords: ['health', 'nutrition', 'movement', 'care-teams', 'accessibility', 'mental-health', 'support-groups'],
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    number: 4,
    name: 'Cooperative Technology',
    description: 'Open, privacy-respecting tools and infrastructure that communities own and operate.',
    keywords: ['open-source', 'privacy', 'self-host', 'dev-containers', 'CI/CD', 'infra', 'maps', 'identity', 'moderation-tools'],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    number: 5,
    name: 'Collective Governance',
    description: 'Open deliberation, direct legislation, empathy-first moderation, participation metrics.',
    keywords: ['proposals', 'voting', 'consensus', 'facilitation', 'moderation', 'restorative', 'metrics', 'support-points'],
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    number: 6,
    name: 'Community Connection',
    description: 'Local groups, events, co-ops, and city-level collaboration mapped to real people and places.',
    keywords: ['groups', 'events', 'meetups', 'chapters', 'city-hubs', 'geo-map', 'directories'],
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    number: 7,
    name: 'Collaborative Media & Culture',
    description: 'Stories, film, music, writing, and archives that celebrate cooperation and courage.',
    keywords: ['storytelling', 'film', 'music', 'writing', 'archives', 'media-library', 'licensing', 'remix'],
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    number: 8,
    name: 'Common Planet',
    description: 'Habitat repair, food forests, circular materials, climate-positive logistics.',
    keywords: ['regeneration', 'circularity', 'materials', 'food-forest', 'permaculture', 'repair-cafe', 'climate'],
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
]

export default function CooperationPathsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Eight Cooperation Paths
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pathways for building resilience, prosperity, and cooperation in communities. These are the canonical categories used across TogetherOS docs, issues, and UI.
          </p>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {cooperationPaths.map((path) => (
            <div
              key={path.number}
              className={`border ${path.borderColor} ${path.bgColor} rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${path.color} flex items-center justify-center text-white font-bold text-xl`}>
                  {path.number}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {path.name}
                  </h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {path.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {path.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Guidelines */}
        <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Guidelines</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Use these exact <strong>Path names</strong> across docs, issues, and UI</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Prefer existing keywords; add sparingly with a short rationale</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>When migrating older text, map content to one Path above and drop non-canonical labels</span>
            </li>
          </ul>
        </div>

        {/* Related Links */}
        <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Related Documentation</h3>
          <div className="space-y-2">
            <a
              href="/manifesto"
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              → Read the Manifesto
            </a>
            <a
              href="/admin/modules"
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              → Explore Modules
            </a>
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              → View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
