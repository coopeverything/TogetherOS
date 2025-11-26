/**
 * Admin Support Points API
 * GET /api/admin/support-points - Get aggregate SP stats for admin dashboard
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import db from '@togetheros/db'

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

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const user = await getCurrentUser(request)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get aggregate SP stats
    const statsResult = await db.query(`
      SELECT
        COALESCE(SUM(total_earned), 0)::int as total_sp,
        COALESCE(SUM(allocated), 0)::int as total_allocated,
        COALESCE(SUM(available), 0)::int as total_available,
        COUNT(*)::int as total_members,
        COALESCE(AVG(total_earned), 0)::int as avg_per_member
      FROM support_points_balances
    `)

    // Get count of active allocations
    const activeAllocResult = await db.query(`
      SELECT COUNT(*)::int as count
      FROM support_points_allocations
      WHERE status = 'active'
    `)

    // Get top allocators (members with most SP allocated)
    const topAllocatorsResult = await db.query(`
      SELECT
        spa.member_id as "memberId",
        COALESCE(u.display_name, u.email, 'Anonymous') as "displayName",
        SUM(spa.amount)::int as "totalAllocated",
        COUNT(*)::int as "allocationCount"
      FROM support_points_allocations spa
      JOIN users u ON spa.member_id = u.id
      WHERE spa.status = 'active'
      GROUP BY spa.member_id, u.display_name, u.email
      ORDER BY "totalAllocated" DESC
      LIMIT 5
    `)

    // Get recent allocations with proposal info
    const recentAllocResult = await db.query(`
      SELECT
        spa.id,
        spa.member_id as "memberId",
        COALESCE(u.display_name, u.email, 'Anonymous') as "memberName",
        spa.target_id as "proposalId",
        COALESCE(p.title, 'Unknown Proposal') as "proposalTitle",
        spa.amount,
        spa.allocated_at as "allocatedAt"
      FROM support_points_allocations spa
      LEFT JOIN users u ON spa.member_id = u.id
      LEFT JOIN proposals p ON spa.target_id = p.id
      WHERE spa.status = 'active'
      ORDER BY spa.allocated_at DESC
      LIMIT 10
    `)

    const stats: SPStats = {
      totalSPInCirculation: statsResult.rows[0]?.total_sp || 0,
      totalSPAllocated: statsResult.rows[0]?.total_allocated || 0,
      totalSPAvailable: statsResult.rows[0]?.total_available || 0,
      activeAllocations: activeAllocResult.rows[0]?.count || 0,
      totalMembers: statsResult.rows[0]?.total_members || 0,
      avgSPPerMember: statsResult.rows[0]?.avg_per_member || 0,
    }

    const topAllocators: TopAllocator[] = topAllocatorsResult.rows
    const recentAllocations: RecentAllocation[] = recentAllocResult.rows

    return NextResponse.json({
      stats,
      topAllocators,
      recentAllocations,
    })
  } catch (error: unknown) {
    console.error('Admin SP stats error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get SP stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
