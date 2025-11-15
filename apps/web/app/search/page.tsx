export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Search & Discovery</h1>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            In Development
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Unified search across groups, proposals, discussions, knowledge, and people with smart filtering and recommendations.
        </p>
      </div>

      {/* What This Module Will Do */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What This Module Will Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Core Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Full-text search across all content
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Smart filters (by type, path, date)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Semantic search powered by AI
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                People and skill discovery
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Personalized recommendations
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                Cooperative Technology
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                Collaborative Education
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UI Sketch */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">UI Sketch (Placeholder)</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for groups, proposals, discussions, people..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Groups', 'Proposals', 'Discussions', 'People', 'Knowledge'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'All'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sample Results */}
        <div className="space-y-3">
          {[
            { type: 'Group', title: 'Local Food Cooperative', desc: 'Community-supported agriculture and food sharing' },
            { type: 'Proposal', title: 'Implement timebanking system', desc: 'Active proposal with 12 consent votes' },
            { type: 'Discussion', title: 'Privacy vs transparency trade-offs', desc: 'Forum thread with 18 replies' },
          ].map((result, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-300 p-4">
              <div className="flex items-start gap-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {result.type}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
                  <p className="text-sm text-gray-600">{result.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">For Developers</h2>
        <p className="text-blue-800 mb-3">
          Module spec: <a
            href="https://github.com/coopeverything/TogetherOS/blob/yolo/docs/modules/search.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-medium hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Search & Discovery
          </a>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented (spec only)</p>
          <p><strong>Priority:</strong> Phase 3 (requires core modules first)</p>
          <p><strong>Dependencies:</strong> All content modules, Bridge AI (semantic search), PostgreSQL full-text search</p>
        </div>
      </div>
    </div>
  )
}
