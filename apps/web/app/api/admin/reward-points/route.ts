/**
 * Admin Reward Points API
 * GET /api/admin/reward-points - Get aggregate RP stats for admin dashboard
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import db from '@togetheros/db'

interface RPStats {
  totalRPInCirculation: number
  totalRPEarned: number
  totalRPSpent: number
  avgRPPerMember: number
  totalMembers: number
  spentOnTBC: number
  spentOnSH: number
}

interface TopEarner {
  memberId: string
  displayName: string
  totalEarned: number
  primarySource: string
}

interface EarningBreakdown {
  category: string
  label: string
  amount: number
  percentage: number
  color: string
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const user = await getCurrentUser(request)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get aggregate RP stats from gamification_rp_balances
    const statsResult = await db.query(`
      SELECT
        COALESCE(SUM(rp_balance), 0)::int as total_in_circulation,
        COALESCE(SUM(lifetime_rp), 0)::int as total_earned,
        COUNT(*)::int as total_members,
        COALESCE(AVG(lifetime_rp), 0)::int as avg_per_member
      FROM gamification_rp_balances
    `)

    // Calculate spent (earned - in circulation)
    const totalEarned = statsResult.rows[0]?.total_earned || 0
    const totalInCirculation = statsResult.rows[0]?.total_in_circulation || 0
    const totalSpent = totalEarned - totalInCirculation

    // Get top earners
    const topEarnersResult = await db.query(`
      SELECT
        grb.member_id as "memberId",
        COALESCE(u.display_name, u.email, 'Anonymous') as "displayName",
        grb.lifetime_rp as "totalEarned",
        COALESCE(
          (
            SELECT source FROM gamification_rp_transactions
            WHERE member_id = grb.member_id
            GROUP BY source
            ORDER BY SUM(rp_amount) DESC
            LIMIT 1
          ),
          'Various'
        ) as "primarySource"
      FROM gamification_rp_balances grb
      JOIN users u ON grb.member_id = u.id
      ORDER BY grb.lifetime_rp DESC
      LIMIT 5
    `)

    // Get earning breakdown by source
    const breakdownResult = await db.query(`
      SELECT
        source as category,
        SUM(rp_amount)::int as amount
      FROM gamification_rp_transactions
      WHERE rp_amount > 0
      GROUP BY source
      ORDER BY amount DESC
    `)

    // Calculate total for percentages
    const totalFromSources = breakdownResult.rows.reduce((sum: number, row: { amount: number }) => sum + row.amount, 0)

    // Map sources to friendly labels and colors
    const sourceLabels: Record<string, { label: string; color: string }> = {
      'onboarding': { label: 'Onboarding Progress', color: 'bg-green-500' },
      'daily_challenge': { label: 'Daily Challenges', color: 'bg-blue-500' },
      'first_week': { label: 'First Week Journey', color: 'bg-purple-500' },
      'invitation': { label: 'Invitations', color: 'bg-amber-500' },
      'contribution': { label: 'Contributions', color: 'bg-teal-500' },
      'manual': { label: 'Manual Awards', color: 'bg-pink-500' },
    }

    const breakdown: EarningBreakdown[] = breakdownResult.rows.map((row: { category: string; amount: number }) => {
      const config = sourceLabels[row.category] || { label: row.category, color: 'bg-gray-500' }
      return {
        category: row.category,
        label: config.label,
        amount: row.amount,
        percentage: totalFromSources > 0 ? Math.round((row.amount / totalFromSources) * 100) : 0,
        color: config.color,
      }
    })

    // Get TBC and SH conversion stats (if tables exist)
    // Note: These tables may not exist yet - return 0 if not available
    let spentOnTBC = 0
    let spentOnSH = 0

    try {
      const tbcResult = await db.query(`
        SELECT COALESCE(SUM(rp_amount), 0)::int as amount
        FROM gamification_rp_transactions
        WHERE event_type = 'tbc_conversion'
      `)
      spentOnTBC = Math.abs(tbcResult.rows[0]?.amount || 0)
    } catch {
      // Table or column might not exist
    }

    try {
      const shResult = await db.query(`
        SELECT COALESCE(SUM(rp_amount), 0)::int as amount
        FROM gamification_rp_transactions
        WHERE event_type = 'sh_purchase'
      `)
      spentOnSH = Math.abs(shResult.rows[0]?.amount || 0)
    } catch {
      // Table or column might not exist
    }

    const stats: RPStats = {
      totalRPInCirculation: totalInCirculation,
      totalRPEarned: totalEarned,
      totalRPSpent: totalSpent,
      avgRPPerMember: statsResult.rows[0]?.avg_per_member || 0,
      totalMembers: statsResult.rows[0]?.total_members || 0,
      spentOnTBC,
      spentOnSH,
    }

    const topEarners: TopEarner[] = topEarnersResult.rows

    return NextResponse.json({
      stats,
      topEarners,
      breakdown,
    })
  } catch (error: unknown) {
    console.error('Admin RP stats error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get RP stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
