// GET /api/gamification/stats - Get user's gamification stats

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get RP balance from gamification_rp_balances
    const rpResult = await db.query(
      `SELECT rp_balance as "rpBalance", lifetime_rp as "lifetimeRP"
       FROM gamification_rp_balances
       WHERE member_id = $1`,
      [userId]
    )

    // Get SP balance
    const spResult = await db.query(
      `SELECT balance as "spBalance"
       FROM support_point_balances
       WHERE user_id = $1`,
      [userId]
    )

    // Get challenge streak
    const streakResult = await db.query(
      `WITH daily_completions AS (
        SELECT DISTINCT assigned_date as completion_date
        FROM gamification_user_challenges
        WHERE user_id = $1
          AND status = 'completed'
        ORDER BY assigned_date DESC
      ),
      streak AS (
        SELECT
          completion_date,
          completion_date - (ROW_NUMBER() OVER (ORDER BY completion_date DESC))::int AS streak_group
        FROM daily_completions
      )
      SELECT COUNT(*) as streak_length
      FROM streak
      WHERE streak_group = (
        SELECT streak_group FROM streak WHERE completion_date = CURRENT_DATE
        UNION ALL
        SELECT streak_group FROM streak WHERE completion_date = CURRENT_DATE - 1
        LIMIT 1
      )`,
      [userId]
    )

    // Get completed challenges count
    const challengeCountResult = await db.query(
      `SELECT COUNT(*) as count
       FROM gamification_user_challenges
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    )

    // Get recent RP transactions
    const transactionsResult = await db.query(
      `SELECT
        id,
        rp_amount as amount,
        event_type as type,
        source,
        created_at as "createdAt"
       FROM gamification_rp_transactions
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    )

    // Get badges (if table exists)
    let badges: any[] = []
    try {
      const badgesResult = await db.query(
        `SELECT
          b.id,
          bd.name,
          bd.description,
          bd.icon,
          b.earned_at as "earnedAt"
         FROM gamification_user_badges b
         JOIN gamification_badge_definitions bd ON b.badge_id = bd.id
         WHERE b.user_id = $1
         ORDER BY b.earned_at DESC`,
        [userId]
      )
      badges = badgesResult.rows
    } catch {
      // Badges table might not exist yet
    }

    const rpBalance = rpResult.rows[0]?.rpBalance || 0
    const totalRPEarned = rpResult.rows[0]?.lifetimeRP || 0
    const spBalance = spResult.rows[0]?.spBalance || 0
    const streak = streakResult.rows[0]?.streak_length || 0
    const completedChallenges = parseInt(challengeCountResult.rows[0]?.count || '0', 10)

    return NextResponse.json({
      rpBalance,
      spBalance,
      streak,
      longestStreak: streak, // TODO: Track separately
      completedChallenges,
      totalRPEarned,
      badges,
      recentTransactions: transactionsResult.rows,
    })
  } catch (error: any) {
    console.error('GET /api/gamification/stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    )
  }
}
