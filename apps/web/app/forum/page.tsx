import Link from 'next/link'

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
          Module spec: <Link href="/docs/modules/forum" className="underline font-medium">docs/modules/forum.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented</p>
          <p><strong>Priority:</strong> Phase 2 (requires Bridge for moderation)</p>
          <p><strong>Dependencies:</strong> Auth, Groups, Bridge AI, Notifications</p>
        </div>
      </div>
    </div>
  )
}
