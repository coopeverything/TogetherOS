import Link from 'next/link'

export default function EconomyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Social Economy</h1>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            In Development
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Fair resource allocation through Support Points, timebanking, and Social Horizon currency for cooperative value exchange.
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
                Support Points allocation (max 10/idea)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Timebank hour tracking and exchange
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Social Horizon currency (local value)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Cooperative treasury management
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Transparent transaction logs
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Social Economy
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Common Wellbeing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UI Sketch */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">UI Sketch (Placeholder)</h2>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-1">Support Points</h3>
            <p className="text-4xl font-bold mb-2">87</p>
            <p className="text-sm opacity-75">Available to allocate</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-1">Timebank Balance</h3>
            <p className="text-4xl font-bold mb-2">12.5h</p>
            <p className="text-sm opacity-75">Hours earned</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-1">Social Horizon</h3>
            <p className="text-4xl font-bold mb-2">$245</p>
            <p className="text-sm opacity-75">Local currency</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {[
              { type: 'Support', desc: 'Allocated 5 points to Climate Action', amount: '-5 SP' },
              { type: 'Timebank', desc: 'Earned time for mentoring session', amount: '+2h' },
              { type: 'Social Horizon', desc: 'Received payment for workshop', amount: '+$45' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tx.desc}</p>
                  <p className="text-xs text-gray-500">{tx.type} • 2 days ago</p>
                </div>
                <span className="font-semibold text-sm text-gray-900">{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">For Developers</h2>
        <p className="text-blue-800 mb-3">
          Module spec: <Link href="/docs/modules/social-economy" className="underline font-medium">docs/modules/social-economy.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented</p>
          <p><strong>Priority:</strong> Phase 3 (requires Groups & Proposals first)</p>
          <p><strong>Dependencies:</strong> Auth, Groups, Proposals, Audit logs, Transaction history</p>
        </div>
      </div>
    </div>
  )
}
