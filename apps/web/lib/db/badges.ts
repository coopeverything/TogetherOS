/**
 * Badge database helpers
 * Used by admin badges API route
 */

import db from '@togetheros/db'

export interface BadgeStats {
  totalBadgeTypes: number
  totalAwarded: number
  uniqueRecipients: number
}

export interface RecentBadgeAward {
  id: string
  memberId: string
  memberName: string
  badgeId: string
  badgeName: string
  badgeIcon: string
  earnedAt: string
}

/**
 * Get aggregate badge statistics
 */
export async function getBadgeStats(): Promise<BadgeStats> {
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM badges)::int as total_badge_types,
      COUNT(*)::int as total_awarded,
      COUNT(DISTINCT member_id)::int as unique_recipients
    FROM member_badges
  `)

  const row = result.rows[0]
  return {
    totalBadgeTypes: row?.total_badge_types || 0,
    totalAwarded: row?.total_awarded || 0,
    uniqueRecipients: row?.unique_recipients || 0,
  }
}

/**
 * Get recent badge awards with member and badge details
 */
export async function getRecentBadgeAwards(limit: number = 50): Promise<RecentBadgeAward[]> {
  const result = await db.query(`
    SELECT
      mb.id,
      mb.member_id as "memberId",
      COALESCE(u.display_name, u.email, 'Anonymous') as "memberName",
      mb.badge_id as "badgeId",
      b.name as "badgeName",
      b.icon as "badgeIcon",
      mb.earned_at as "earnedAt"
    FROM member_badges mb
    LEFT JOIN users u ON mb.member_id = u.id
    LEFT JOIN badges b ON mb.badge_id = b.id
    ORDER BY mb.earned_at DESC
    LIMIT $1
  `, [limit])

  return result.rows
}
