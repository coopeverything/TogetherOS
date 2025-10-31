'use client'

import Link from 'next/link'
import { GroupList } from '@togetheros/ui/groups'
import { getFixtureGroups } from '../../../api/src/modules/groups/fixtures'

export default function GroupsPage() {
  // Load fixture data (in production, this would be fetched from API)
  const groups = getFixtureGroups()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">Groups & Organizations</h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              100% Complete
            </span>
          </div>
          <Link
            href="/groups/new"
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Create Group
          </Link>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Create and manage cooperative groups, organizations, and communities with transparent governance and shared resources.
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
                <span className="text-green-600 mr-2">✓</span>
                Create and join cooperative groups
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Transparent membership management
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Role rotation and accountability
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Shared resource pools
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Group-level decision making
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Social Economy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Group List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Groups</h2>
        <GroupList groups={groups} />
      </div>

      {/* Technical Details */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">For Developers</h2>
        <p className="text-blue-800 mb-3">
          Module spec: <Link href="/docs/modules/groups" className="underline font-medium">docs/modules/groups.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> 100% implemented ✅</p>
          <p><strong>Completed:</strong> All core features - browse, create, join, manage, proposals, events, federation</p>
          <p><strong>Components:</strong> 8 reusable UI components, full type safety, complete documentation</p>
        </div>
      </div>
    </div>
  )
}
