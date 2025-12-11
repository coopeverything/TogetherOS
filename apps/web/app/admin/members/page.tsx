'use client'

/**
 * Members Admin - User account management
 * Route: /admin/members
 * Auth: Admin only
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  email_verified: boolean
  name?: string
  username?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  last_seen_at?: string
  deleted_at?: string
  paths?: string[]
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  suspendedUsers: number
  newThisWeek: number
  newThisMonth: number
}

interface ActivityEntry {
  id: string
  user_id: string
  action: string
  metadata: any
  created_at: string
}

interface UserDetail extends User {
  bio?: string
  city?: string
  state?: string
  country?: string
  timezone?: string
  skills?: string[]
  updated_at: string
  onboarding_step?: string
  onboarding_completed_at?: string
}

type FilterType = 'all' | 'active' | 'suspended' | 'admins'

export default function MembersAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false })

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'email'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [userActivity, setUserActivity] = useState<ActivityEntry[]>([])
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          setCurrentUserId(data.user.id)
        } else {
          router.push('/login?redirect=/admin/members')
        }
      })
      .catch(() => router.push('/login?redirect=/admin/members'))
      .finally(() => setIsLoading(false))
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async (offset = 0) => {
    setIsFetching(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '20', offset: offset.toString(), sortBy, sortDir, filter })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/members?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch members')

      setUsers(data.users)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members')
    } finally {
      setIsFetching(false)
    }
  }, [debouncedSearch, filter, sortBy, sortDir])

  useEffect(() => {
    if (isAuthorized) fetchUsers(0)
  }, [isAuthorized, fetchUsers])

  const openUserDetail = async (userId: string) => {
    setIsModalLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${userId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
      setSelectedUser(data.user)
      setUserActivity(data.activity || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setIsModalLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, newStatus: boolean) => {
    if (userId === currentUserId && !newStatus) { setError('Cannot remove your own admin status'); return }
    setActionInProgress(`admin-${userId}`)
    try {
      const res = await fetch(`/api/admin/members/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_admin: newStatus }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update')
      await fetchUsers(pagination.offset)
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, is_admin: newStatus })
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update') }
    finally { setActionInProgress(null) }
  }

  const suspendUser = async (userId: string) => {
    if (userId === currentUserId) { setError('Cannot suspend your own account'); return }
    const reason = prompt('Enter reason for suspension (optional):')
    if (reason === null) return
    setActionInProgress(`suspend-${userId}`)
    try {
      const res = await fetch(`/api/admin/members/${userId}/suspend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reason || 'No reason provided' }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to suspend')
      await fetchUsers(pagination.offset)
      setSelectedUser(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to suspend') }
    finally { setActionInProgress(null) }
  }

  const restoreUser = async (userId: string) => {
    setActionInProgress(`restore-${userId}`)
    try {
      const res = await fetch(`/api/admin/members/${userId}/restore`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to restore')
      await fetchUsers(pagination.offset)
      setSelectedUser(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to restore') }
    finally { setActionInProgress(null) }
  }

  const handleSort = (column: 'created_at' | 'name' | 'email') => {
    if (sortBy === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(column); setSortDir('desc') }
  }

  const formatDate = (dateStr?: string) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formatDateTime = (dateStr?: string) => !dateStr ? '-' : new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-bg-0"><div className="text-ink-700">Loading...</div></div>
  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-bg-0 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-ink-700 mb-2">
            <Link href="/admin" className="hover:text-brand-500">Admin</Link>
            <span>→</span>
            <span className="text-ink-900">Members</span>
          </div>
          <h1 className="text-3xl font-bold text-ink-900">Members Admin</h1>
          <p className="text-ink-700 mt-1">Manage user accounts, roles, and permissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-red-700 dark:text-red-400">{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-1 border border-border rounded-lg p-4">
              <div className="text-sm text-ink-400">Total Users</div>
              <div className="text-2xl font-bold text-brand-500">{stats.totalUsers}</div>
            </div>
            <div className="bg-bg-1 border border-border rounded-lg p-4">
              <div className="text-sm text-ink-400">Active</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeUsers}</div>
            </div>
            <div className="bg-bg-1 border border-border rounded-lg p-4">
              <div className="text-sm text-ink-400">Admins</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.adminUsers}</div>
            </div>
            <div className="bg-bg-1 border border-border rounded-lg p-4">
              <div className="text-sm text-ink-400">New This Week</div>
              <div className="text-2xl font-bold text-joy-500">{stats.newThisWeek}</div>
            </div>
          </div>
        )}

        <div className="bg-bg-1 border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input type="text" placeholder="Search by email, name, or username..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-0 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'suspended', 'admins'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-brand-500 text-white' : 'bg-bg-2 text-ink-700 hover:bg-bg-1'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-bg-1 border border-border rounded-lg overflow-hidden">
          {isFetching && users.length === 0 ? (
            <div className="p-8 text-center text-ink-400">Loading members...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-ink-400">No members found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-2">
                    <tr>
                      <th onClick={() => handleSort('email')} className="px-4 py-3 text-left text-xs font-medium text-ink-400 uppercase tracking-wider cursor-pointer hover:bg-bg-1">
                        Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-xs font-medium text-ink-400 uppercase tracking-wider cursor-pointer hover:bg-bg-1">
                        Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-400 uppercase tracking-wider">Status</th>
                      <th onClick={() => handleSort('created_at')} className="px-4 py-3 text-left text-xs font-medium text-ink-400 uppercase tracking-wider cursor-pointer hover:bg-bg-1">
                        Joined {sortBy === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-ink-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-bg-2 cursor-pointer" onClick={() => openUserDetail(user.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" /> : (
                              <div className="w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center">
                                <span className="text-ink-400 text-sm">{(user.name || user.email)[0].toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-ink-900">{user.email}</div>
                              {user.username && <div className="text-xs text-ink-400">@{user.username}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-900">{user.name || '-'}</td>
                        <td className="px-4 py-3">
                          {user.is_admin ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">Admin</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bg-2 text-ink-400">Member</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.deleted_at ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Suspended</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Active</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-400">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={(e) => { e.stopPropagation(); openUserDetail(user.id) }} className="text-brand-500 hover:text-brand-600 text-sm font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <div className="text-sm text-ink-400">Showing {pagination.offset + 1} to {Math.min(pagination.offset + users.length, pagination.total)} of {pagination.total} members</div>
                <div className="flex gap-2">
                  <button onClick={() => fetchUsers(Math.max(0, pagination.offset - pagination.limit))} disabled={pagination.offset === 0 || isFetching}
                    className="px-3 py-1 text-sm rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-2">Previous</button>
                  <button onClick={() => fetchUsers(pagination.offset + pagination.limit)} disabled={!pagination.hasMore || isFetching}
                    className="px-3 py-1 text-sm rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-2">Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {(selectedUser || isModalLoading) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bg-1 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {isModalLoading ? <div className="p-8 text-center text-ink-400">Loading user details...</div> : selectedUser && (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full" /> : (
                          <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center">
                            <span className="text-ink-400 text-2xl">{(selectedUser.name || selectedUser.email)[0].toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-ink-900">{selectedUser.name || 'No name'}</h2>
                          <p className="text-ink-400">{selectedUser.email}</p>
                          {selectedUser.username && <p className="text-sm text-ink-400">@{selectedUser.username}</p>}
                        </div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="text-ink-400 hover:text-ink-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-6">
                      {selectedUser.is_admin && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">Admin</span>}
                      {selectedUser.deleted_at ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Suspended</span>
                        : <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Active</span>}
                      {selectedUser.email_verified && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Email Verified</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><div className="text-xs text-ink-400 uppercase">Joined</div><div className="text-sm text-ink-900">{formatDateTime(selectedUser.created_at)}</div></div>
                      <div><div className="text-xs text-ink-400 uppercase">Last Seen</div><div className="text-sm text-ink-900">{formatDateTime(selectedUser.last_seen_at)}</div></div>
                      {selectedUser.city && <div><div className="text-xs text-ink-400 uppercase">Location</div><div className="text-sm text-ink-900">{[selectedUser.city, selectedUser.state, selectedUser.country].filter(Boolean).join(', ')}</div></div>}
                      {selectedUser.onboarding_step && <div><div className="text-xs text-ink-400 uppercase">Onboarding</div><div className="text-sm text-ink-900 capitalize">{selectedUser.onboarding_step}</div></div>}
                    </div>
                    {selectedUser.bio && <div className="mb-6"><div className="text-xs text-ink-400 uppercase mb-1">Bio</div><div className="text-sm text-ink-900">{selectedUser.bio}</div></div>}
                    {selectedUser.paths && selectedUser.paths.length > 0 && (
                      <div className="mb-6">
                        <div className="text-xs text-ink-400 uppercase mb-2">Cooperation Paths</div>
                        <div className="flex flex-wrap gap-2">{selectedUser.paths.map((path) => <span key={path} className="px-2 py-1 text-xs rounded bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300">{path}</span>)}</div>
                      </div>
                    )}
                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                      <div className="mb-6">
                        <div className="text-xs text-ink-400 uppercase mb-2">Skills</div>
                        <div className="flex flex-wrap gap-2">{selectedUser.skills.map((skill) => <span key={skill} className="px-2 py-1 text-xs rounded bg-bg-2 text-ink-700">{skill}</span>)}</div>
                      </div>
                    )}
                    {userActivity.length > 0 && (
                      <div className="mb-6">
                        <div className="text-xs text-ink-400 uppercase mb-2">Recent Activity</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {userActivity.slice(0, 10).map((activity) => (
                            <div key={activity.id} className="text-sm flex items-center justify-between py-1 border-b border-border">
                              <span className="text-ink-700">{activity.action}</span>
                              <span className="text-xs text-ink-400">{formatDateTime(activity.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <button onClick={() => toggleAdmin(selectedUser.id, !selectedUser.is_admin)} disabled={actionInProgress !== null || selectedUser.id === currentUserId}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedUser.is_admin ? 'bg-bg-2 text-ink-700 hover:bg-bg-1' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                        {actionInProgress === `admin-${selectedUser.id}` ? 'Updating...' : selectedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      {selectedUser.deleted_at ? (
                        <button onClick={() => restoreUser(selectedUser.id)} disabled={actionInProgress !== null}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          {actionInProgress === `restore-${selectedUser.id}` ? 'Restoring...' : 'Restore Account'}
                        </button>
                      ) : (
                        <button onClick={() => suspendUser(selectedUser.id)} disabled={actionInProgress !== null || selectedUser.id === currentUserId}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          {actionInProgress === `suspend-${selectedUser.id}` ? 'Suspending...' : 'Suspend Account'}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
