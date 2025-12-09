'use client'

import Link from 'next/link'
import { GroupList } from '@togetheros/ui/groups'
import { LocalStorageGroupRepo } from '../../lib/repos/LocalStorageGroupRepo'
import { getFixtureGroups } from '../../../api/src/modules/groups/fixtures'

export default function GroupsPage() {
  // Load groups from localStorage (includes fixtures + user-created groups)
  const repo = new LocalStorageGroupRepo(getFixtureGroups())
  const groups = repo.getAll()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-bold text-ink-900">Groups & Organizations</h1>
          <Link
            href="/groups/new"
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors font-medium"
          >
            Create Group
          </Link>
        </div>
        <p className="text-sm text-ink-700 max-w-3xl">
          Create and manage cooperative groups, organizations, and communities with transparent governance and shared resources.
        </p>
      </div>

      {/* What This Module Will Do */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">What This Module Will Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-ink-900 mb-2">Core Features</h3>
            <ul className="space-y-2 text-ink-700">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Create and join cooperative groups
              </li>
              <li className="flex items-start">
                <span className="text-joy-600 mr-2">•</span>
                Transparent membership management
              </li>
              <li className="flex items-start">
                <span className="text-joy-600 mr-2">•</span>
                Role rotation and accountability
              </li>
              <li className="flex items-start">
                <span className="text-joy-600 mr-2">•</span>
                Shared resource pools
              </li>
              <li className="flex items-start">
                <span className="text-joy-600 mr-2">•</span>
                Group-level decision making
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-accent-3-bg text-accent-3 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-accent-1-bg text-accent-1 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-success-bg text-success text-sm rounded-full">
                Social Economy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Group List */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Browse Groups</h2>
        <GroupList groups={groups} />
      </div>

    </div>
  )
}
