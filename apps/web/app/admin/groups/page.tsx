'use client'

/**
 * Admin Groups Page - Group oversight and management
 * Route: /admin/groups
 * Auth: Admin only
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Group } from '@togetheros/types/groups'

interface GroupStats {
  totalGroups: number
  totalMembers: number
  activeGroups: number
  cityGroups: number
  localGroups: number
  nationalGroups: number
  globalGroups: number
}

export default function AdminGroupsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<GroupStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'city' | 'local' | 'national' | 'global'>('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          fetchGroups()
        } else {
          router.push('/login?redirect=/admin/groups')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/groups')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  async function fetchGroups() {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        const groupList = data.groups || []
        setGroups(groupList)

        // Calculate stats
        const cityGroups = groupList.filter((g: Group) => g.isCityGroup)
        const localGroups = groupList.filter((g: Group) => g.type === 'local' && !g.isCityGroup)
        const nationalGroups = groupList.filter((g: Group) => g.type === 'national')
        const globalGroups = groupList.filter((g: Group) => g.type === 'global')

        setStats({
          totalGroups: groupList.length,
          totalMembers: groupList.reduce((sum: number, g: Group) => sum + g.members.length, 0),
          activeGroups: groupList.filter((g: Group) => g.members.length > 0).length,
          cityGroups: cityGroups.length,
          localGroups: localGroups.length,
          nationalGroups: nationalGroups.length,
          globalGroups: globalGroups.length,
        })
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-1">
        <div className="text-ink-700 text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  // Filter and search groups
  const filteredGroups = groups.filter((group) => {
    // Apply type filter
    if (filter === 'city' && !group.isCityGroup) return false
    if (filter === 'local' && (group.type !== 'local' || group.isCityGroup)) return false
    if (filter === 'national' && group.type !== 'national') return false
    if (filter === 'global' && group.type !== 'global') return false

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.handle.toLowerCase().includes(searchLower) ||
        group.location?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  return (
    <div className="min-h-screen bg-bg-1 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="text-joy-600 hover:text-joy-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-sm font-semibold text-ink-900 mb-2">Group Oversight</h1>
          <p className="text-sm text-ink-700">Monitor groups, membership, and coordination</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-bg-0 rounded-lg border border-border p-3">
              <div className="text-sm text-ink-400">Total Groups</div>
              <div className="text-lg font-semibold text-ink-900">{stats.totalGroups}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-3">
              <div className="text-sm text-ink-400">Total Members</div>
              <div className="text-lg font-semibold text-ink-900">{stats.totalMembers}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-3">
              <div className="text-sm text-ink-400">Active Groups</div>
              <div className="text-lg font-semibold text-success">{stats.activeGroups}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-3">
              <div className="text-sm text-ink-400">City Groups</div>
              <div className="text-lg font-semibold text-joy-600">{stats.cityGroups}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900 text-sm"
          />
          <div className="flex gap-2">
            {(['all', 'city', 'local', 'national', 'global'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f
                    ? 'bg-joy-600 text-bg-1'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-2'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-2">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-ink-400 text-sm">
                      No groups found
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-bg-1">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-joy-bg rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-joy-700 font-medium text-xs">
                              {group.name
                                .split(' ')
                                .map((w) => w[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-ink-900 text-sm">{group.name}</div>
                            <div className="text-xs text-ink-400">@{group.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            group.isCityGroup
                              ? 'bg-joy-bg text-joy-700'
                              : group.type === 'local'
                                ? 'bg-success-bg text-success'
                                : group.type === 'national'
                                  ? 'bg-info-bg text-info'
                                  : 'bg-accent-3-bg text-accent-3'
                          }`}
                        >
                          {group.isCityGroup ? 'City' : group.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-700">{group.members.length}</td>
                      <td className="px-4 py-3 text-sm text-ink-700">{group.location || '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink-400">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/groups/${group.id}`}
                            className="text-sm text-joy-600 hover:text-joy-700"
                          >
                            View
                          </Link>
                          <Link
                            href={`/groups/${group.id}/settings`}
                            className="text-sm text-ink-400 hover:text-ink-700"
                          >
                            Settings
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Group Type Distribution */}
        {stats && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-3">Group Type Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-700">City Groups</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-bg-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-joy-600 rounded-full"
                        style={{
                          width: `${stats.totalGroups ? (stats.cityGroups / stats.totalGroups) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-ink-400 w-8 text-right">{stats.cityGroups}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-700">Local Groups</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-bg-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{
                          width: `${stats.totalGroups ? (stats.localGroups / stats.totalGroups) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-ink-400 w-8 text-right">{stats.localGroups}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-700">National Groups</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-bg-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-info rounded-full"
                        style={{
                          width: `${stats.totalGroups ? (stats.nationalGroups / stats.totalGroups) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-ink-400 w-8 text-right">
                      {stats.nationalGroups}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-700">Global Groups</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-bg-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-3 rounded-full"
                        style={{
                          width: `${stats.totalGroups ? (stats.globalGroups / stats.totalGroups) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-ink-400 w-8 text-right">{stats.globalGroups}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <h3 className="font-medium text-ink-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/groups/new"
                  className="block w-full px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium text-center"
                >
                  Create New Group
                </Link>
                <Link
                  href="/groups"
                  className="block w-full px-4 py-2 bg-bg-2 text-ink-700 rounded-md hover:bg-bg-2 transition-colors text-sm font-medium text-center"
                >
                  View All Groups
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
