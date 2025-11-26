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
  proposalId: string
  proposalTitle: string
  amount: number
  allocatedAt: Date
}

// Mock data for initial implementation
const MOCK_STATS: SPStats = {
  totalSPInCirculation: 15000,
  totalSPAllocated: 3500,
  totalSPAvailable: 11500,
  activeAllocations: 245,
  totalMembers: 150,
  avgSPPerMember: 100,
}

const MOCK_TOP_ALLOCATORS: TopAllocator[] = [
  { memberId: '1', displayName: 'alice_cooper', totalAllocated: 85, allocationCount: 12 },
  { memberId: '2', displayName: 'bob_builder', totalAllocated: 72, allocationCount: 9 },
  { memberId: '3', displayName: 'carol_singer', totalAllocated: 68, allocationCount: 11 },
  { memberId: '4', displayName: 'dave_coder', totalAllocated: 55, allocationCount: 7 },
  { memberId: '5', displayName: 'eve_designer', totalAllocated: 48, allocationCount: 6 },
]

const MOCK_RECENT_ALLOCATIONS: RecentAllocation[] = [
  { id: '1', memberId: '1', proposalId: 'p1', proposalTitle: 'Community Garden Initiative', amount: 8, allocatedAt: new Date(Date.now() - 3600000) },
  { id: '2', memberId: '2', proposalId: 'p2', proposalTitle: 'Open Source Education Program', amount: 10, allocatedAt: new Date(Date.now() - 7200000) },
  { id: '3', memberId: '3', proposalId: 'p3', proposalTitle: 'Local Food Cooperative', amount: 6, allocatedAt: new Date(Date.now() - 10800000) },
  { id: '4', memberId: '4', proposalId: 'p1', proposalTitle: 'Community Garden Initiative', amount: 7, allocatedAt: new Date(Date.now() - 14400000) },
  { id: '5', memberId: '5', proposalId: 'p4', proposalTitle: 'Repair Cafe Network', amount: 9, allocatedAt: new Date(Date.now() - 18000000) },
]

export default function AdminSupportPointsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<SPStats | null>(null)
  const [topAllocators, setTopAllocators] = useState<TopAllocator[]>([])
  const [recentAllocations, setRecentAllocations] = useState<RecentAllocation[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check admin authorization
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          // Load data (using mock for now)
          setStats(MOCK_STATS)
          setTopAllocators(MOCK_TOP_ALLOCATORS)
          setRecentAllocations(MOCK_RECENT_ALLOCATIONS)
        } else {
          router.push('/login?redirect=/admin/support-points')
        }
      })
      .catch(() => router.push('/login?redirect=/admin/support-points'))
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin
            </Link>
            <span>→</span>
            <span className="text-gray-900">Support Points</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Points Administration</h1>
          <p className="text-gray-600">Monitor SP circulation, allocations, and governance activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Total SP</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSPInCirculation.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Allocated</div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalSPAllocated.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Available</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalSPAvailable.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Active Allocs</div>
              <div className="text-2xl font-bold text-purple-600">{stats.activeAllocations}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Members</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Avg SP/Member</div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgSPPerMember}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Allocators */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top SP Allocators</h2>
              <p className="text-sm text-gray-500">Members with highest SP allocation activity</p>
            </div>
            <div className="divide-y divide-gray-200">
              {topAllocators.map((allocator, index) => (
                <div key={allocator.memberId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{allocator.displayName}</div>
                      <div className="text-xs text-gray-500">{allocator.allocationCount} allocations</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">{allocator.totalAllocated} SP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Allocations */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Allocations</h2>
              <p className="text-sm text-gray-500">Latest SP allocation activity</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAllocations.map((alloc) => (
                <div key={alloc.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/governance/${alloc.proposalId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {alloc.proposalTitle}
                    </Link>
                    <span className="text-sm font-semibold text-orange-600">+{alloc.amount} SP</span>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(alloc.allocatedAt)}</div>
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
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
