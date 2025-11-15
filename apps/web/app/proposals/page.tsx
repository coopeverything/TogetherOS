export default function ProposalsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Proposals & Decisions</h1>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            In Development
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Consent-based decision making with transparent processes, minority reports, and traceable delivery.
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
                Create and submit proposals
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Consent-based voting (not majority rule)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Minority report documentation
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Trade-off analysis tools
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Delivery tracking and accountability
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Collective Governance
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
          {[
            { title: 'Implement timebanking system', status: 'Active', votes: '12 consent, 2 concerns' },
            { title: 'Update community guidelines', status: 'Under Review', votes: '8 consent, 1 concern' },
            { title: 'Allocate budget for shared tools', status: 'Draft', votes: 'Not yet voted' },
          ].map((proposal, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-300 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{proposal.title}</h3>
                  <p className="text-sm text-gray-600">
                    Proposed by Community Member • 2 days ago
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  proposal.status === 'Active' ? 'bg-green-100 text-green-800' :
                  proposal.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{proposal.votes}</span>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  View Details →
                </button>
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
            href="https://github.com/coopeverything/TogetherOS/blob/main/docs/modules/governance.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-medium hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Governance & Proposals
          </a>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented (spec only)</p>
          <p><strong>Priority:</strong> Phase 2 (core governance module)</p>
          <p><strong>Dependencies:</strong> Auth, Groups, Notifications, Audit logs</p>
        </div>
      </div>
    </div>
  )
}
