export default function ForumPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Forum & Deliberation</h1>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            In Development
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Structured, empathy-first discussions with AI-assisted moderation and deliberative tools for finding common ground.
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
                Threaded discussions with context
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                AI-assisted de-escalation
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Deliberation tools (pro/con weighing)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Minority opinion preservation
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Topic clustering and summaries
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                Cooperative Technology
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UI Sketch */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">UI Sketch (Placeholder)</h2>
        <div className="space-y-4">
          {['How should we approach community moderation?', 'Proposal: Implement timebanking system', 'Discussion: Privacy vs transparency trade-offs'].map((topic, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-300 p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-800 font-bold text-sm">U{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{topic}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Exploring different perspectives on this important community question...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{12 + i * 3} replies</span>
                    <span>{5 + i} participants</span>
                    <span className="ml-auto">{i + 1}h ago</span>
                  </div>
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
            href="https://github.com/coopeverything/TogetherOS/blob/main/docs/modules/forum.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-medium hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Forum & Deliberation
          </a>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented (spec only)</p>
          <p><strong>Priority:</strong> Phase 2 (requires Bridge for moderation)</p>
          <p><strong>Dependencies:</strong> Auth, Groups, Bridge AI, Notifications</p>
        </div>
      </div>
    </div>
  )
}
