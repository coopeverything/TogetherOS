import Link from 'next/link'

export default function NotificationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Notifications & Inbox</h1>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            In Development
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Unified notification center for proposals, discussions, group updates, and system messages with smart filtering.
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
                Unified notification inbox
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Filter by type and priority
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Mark as read/unread, archive
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Configurable preferences
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Real-time updates via WebSocket
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
            </div>
          </div>
        </div>
      </div>

      {/* UI Sketch */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">UI Sketch (Placeholder)</h2>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Unread', 'Proposals', 'Discussions', 'Groups', 'System'].map((filter, i) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                i === 0
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled
            >
              {filter}
              {i === 1 && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">3</span>}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {[
            {
              title: 'New proposal: Implement timebanking system',
              desc: 'A proposal requiring your input has been submitted',
              time: '2h ago',
              unread: true,
              icon: '📋'
            },
            {
              title: 'Reply to your discussion',
              desc: 'Someone replied to "Privacy vs transparency trade-offs"',
              time: '5h ago',
              unread: true,
              icon: '💬'
            },
            {
              title: 'Group update: Local Food Cooperative',
              desc: 'New members joined and posted introduction',
              time: '1d ago',
              unread: false,
              icon: '👥'
            },
            {
              title: 'Support Points allocation reminder',
              desc: 'You have 87 points available to allocate this month',
              time: '2d ago',
              unread: false,
              icon: '⭐'
            },
          ].map((notif, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                notif.unread
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{notif.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    notif.unread ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{notif.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{notif.time}</span>
                    {notif.unread && (
                      <button className="text-orange-600 hover:text-orange-700 font-medium">
                        Mark as read
                      </button>
                    )}
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
          Module spec: <Link href="/docs/modules/notifications" className="underline font-medium">docs/modules/notifications.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 0% implemented</p>
          <p><strong>Priority:</strong> Phase 2 (needed by most modules)</p>
          <p><strong>Dependencies:</strong> Auth, WebSocket server, PostgreSQL triggers, All content modules</p>
        </div>
      </div>
    </div>
  )
}
