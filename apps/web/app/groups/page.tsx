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
          Module spec: <a
            href="https://github.com/coopeverything/TogetherOS/blob/yolo/docs/modules/groups.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-medium hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Groups & Organizations
          </a>
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
