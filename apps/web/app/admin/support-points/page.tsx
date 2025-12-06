'use client'

/**
 * Admin Support Points Panel
 * View SP circulation stats, top allocators, allocation patterns
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SPStats {
  totalSPInCirculation: number
  totalSPAllocated: number
  totalSPAvailable: number
  activeAllocations: number
  totalMembers: number
  avgSPPerMember: number
}

interface TopAllocator {
  memberId: string
  displayName: string
  totalAllocated: number
  allocationCount: number
}

interface RecentAllocation {
  id: string
  memberId: string
  memberName: string
  proposalId: string
  proposalTitle: string
  amount: number
  allocatedAt: string
}

export default function AdminSupportPointsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<SPStats | null>(null)
  const [topAllocators, setTopAllocators] = useState<TopAllocator[]>([])
  const [recentAllocations, setRecentAllocations] = useState<RecentAllocation[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check admin authorization and fetch data
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()

        if (!authData.user || !authData.user.is_admin) {
          router.push('/login?redirect=/admin/support-points')
          return
        }

        setIsAuthorized(true)

        // Fetch admin SP stats
        const statsRes = await fetch('/api/admin/support-points')
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats)
          setTopAllocators(data.topAllocators || [])
          setRecentAllocations(data.recentAllocations || [])
        }
      } catch {
        router.push('/login?redirect=/admin/support-points')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin
            </Link>
            <span>→</span>
            <span className="text-gray-900 dark:text-white">Support Points</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Support Points Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Monitor SP circulation, allocations, and governance activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Total SP</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSPInCirculation.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Allocated</div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalSPAllocated.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Available</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalSPAvailable.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Active Allocs</div>
              <div className="text-2xl font-bold text-purple-600">{stats.activeAllocations}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Members</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg SP/Member</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSPPerMember}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Allocators */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top SP Allocators</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Members with highest SP allocation activity</p>
            </div>
            <div className="divide-y divide-gray-200">
              {topAllocators.map((allocator, index) => (
                <div key={allocator.memberId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{allocator.displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{allocator.allocationCount} allocations</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">{allocator.totalAllocated} SP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Allocations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Allocations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Latest SP allocation activity</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAllocations.map((alloc) => (
                <div key={alloc.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/governance/${alloc.proposalId}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                    >
                      {alloc.proposalTitle}
                    </Link>
                    <span className="text-sm font-semibold text-orange-600">+{alloc.amount} SP</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{formatDate(alloc.allocatedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">About Support Points</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Purpose:</strong> SP signals proposal priority. Higher allocation = higher community priority.</p>
            <p><strong>Distribution:</strong> All members start with 100 SP. More earned through governance participation.</p>
            <p><strong>Anti-Plutocracy:</strong> SP cannot be purchased. Only earned through contributions.</p>
            <p><strong>Limits:</strong> Maximum 10 SP per proposal per member. SP reclaimed when proposals close.</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:bg-gray-600 transition-colors font-medium inline-block"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
