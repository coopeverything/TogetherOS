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
      <div className="min-h-screen bg-bg-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-bg-2 rounded w-64 mb-3"></div>
            <div className="h-32 bg-bg-2 rounded mb-3"></div>
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
    <div className="min-h-screen bg-bg-1 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-ink-700 mb-4">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin
            </Link>
            <span>→</span>
            <span className="text-ink-900">Support Points</span>
          </div>
          <h1 className="text-sm font-bold text-ink-900 mb-2">Support Points Administration</h1>
          <p className="text-ink-700">Monitor SP circulation, allocations, and governance activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Total SP</div>
              <div className="text-sm font-bold text-blue-600">{stats.totalSPInCirculation.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Allocated</div>
              <div className="text-sm font-bold text-orange-600">{stats.totalSPAllocated.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Available</div>
              <div className="text-sm font-bold text-green-600">{stats.totalSPAvailable.toLocaleString()}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Active Allocs</div>
              <div className="text-sm font-bold text-purple-600">{stats.activeAllocations}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Members</div>
              <div className="text-sm font-bold text-ink-900">{stats.totalMembers}</div>
            </div>
            <div className="bg-bg-0 rounded-lg border border-border p-4">
              <div className="text-sm text-ink-400">Avg SP/Member</div>
              <div className="text-sm font-bold text-ink-900">{stats.avgSPPerMember}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Allocators */}
          <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-ink-900">Top SP Allocators</h2>
              <p className="text-sm text-ink-400">Members with highest SP allocation activity</p>
            </div>
            <div className="divide-y divide-border">
              {topAllocators.map((allocator, index) => (
                <div key={allocator.memberId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-ink-900">{allocator.displayName}</div>
                      <div className="text-xs text-ink-400">{allocator.allocationCount} allocations</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{allocator.totalAllocated} SP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Allocations */}
          <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-ink-900">Recent Allocations</h2>
              <p className="text-sm text-ink-400">Latest SP allocation activity</p>
            </div>
            <div className="divide-y divide-border">
              {recentAllocations.map((alloc) => (
                <div key={alloc.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/governance/${alloc.proposalId}`}
                      className="font-medium text-ink-900 hover:text-blue-600 transition-colors"
                    >
                      {alloc.proposalTitle}
                    </Link>
                    <span className="text-sm font-semibold text-orange-600">+{alloc.amount} SP</span>
                  </div>
                  <div className="text-xs text-ink-400">{formatDate(alloc.allocatedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">About Support Points</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Purpose:</strong> SP signals proposal priority. Higher allocation = higher community priority.</p>
            <p><strong>Distribution:</strong> All members start with 100 SP. More earned through governance participation.</p>
            <p><strong>Anti-Plutocracy:</strong> SP cannot be purchased. Only earned through contributions.</p>
            <p><strong>Limits:</strong> Maximum 10 SP per proposal per member. SP reclaimed when proposals close.</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4">
          <Link
            href="/admin"
            className="px-4 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-bg-1 transition-colors font-medium inline-block"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
