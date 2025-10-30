import Link from 'next/link'

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
          Module spec: <Link href="/docs/modules/governance" className="underline font-medium">docs/modules/governance.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented</p>
          <p><strong>Priority:</strong> Phase 2 (core governance module)</p>
          <p><strong>Dependencies:</strong> Auth, Groups, Notifications, Audit logs</p>
        </div>
      </div>
    </div>
  )
}
