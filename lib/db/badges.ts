/**
 * Badge database operations
 * Handles badge definitions and member badge awards
 */

import { query } from '@togetheros/db';
import type { Badge, MemberBadge } from '@togetheros/types/rewards';

/**
 * Database row types
 */
interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'contribution' | 'milestone' | 'special';
  criteria: Record<string, unknown>;
  created_at: Date;
}

interface MemberBadgeRow {
  id: string;
  member_id: string;
  badge_id: string;
  earned_at: Date;
  event_id?: string;
}

/**
 * Get all badge definitions
 */
export async function getAllBadges(): Promise<Badge[]> {
  const result = await query<BadgeRow>(
    'SELECT * FROM badges ORDER BY category, name'
  );

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    category: row.category,
    criteria: JSON.stringify(row.criteria),
  }));
}

/**
 * Get a single badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<Badge | null> {
  const result = await query<BadgeRow>(
    'SELECT * FROM badges WHERE id = $1',
    [badgeId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    category: row.category,
    criteria: JSON.stringify(row.criteria),
  };
}

/**
 * Get all badges earned by a member
 */
export async function getMemberBadges(memberId: string): Promise<MemberBadge[]> {
  const result = await query<MemberBadgeRow>(
    `SELECT * FROM member_badges
     WHERE member_id = $1
     ORDER BY earned_at DESC`,
    [memberId]
  );

  return result.rows.map(row => ({
    memberId: row.member_id,
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
    eventId: row.event_id,
  }));
}

/**
 * Check if a member has a specific badge
 */
export async function memberHasBadge(memberId: string, badgeId: string): Promise<boolean> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM member_badges
     WHERE member_id = $1 AND badge_id = $2`,
    [memberId, badgeId]
  );

  return parseInt(result.rows[0]?.count || '0', 10) > 0;
}

/**
 * Award a badge to a member
 * Returns false if member already has the badge
 */
export async function awardBadge(
  memberId: string,
  badgeId: string,
  eventId?: string
): Promise<{ success: boolean; alreadyHad: boolean }> {
  // Check if already has badge
  const hasIt = await memberHasBadge(memberId, badgeId);
  if (hasIt) {
    return { success: false, alreadyHad: true };
  }

  try {
    await query(
      `INSERT INTO member_badges (member_id, badge_id, earned_at, event_id)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (member_id, badge_id) DO NOTHING`,
      [memberId, badgeId, eventId || null]
    );

    return { success: true, alreadyHad: false };
  } catch (error) {
    console.error('Award badge error:', error);
    return { success: false, alreadyHad: false };
  }
}

/**
 * Get badges with member's earned status
 */
export async function getBadgesWithMemberStatus(
  memberId: string
): Promise<{ badge: Badge; earned: boolean; earnedAt?: Date }[]> {
  const [badges, memberBadges] = await Promise.all([
    getAllBadges(),
    getMemberBadges(memberId),
  ]);

  const earnedMap = new Map(memberBadges.map(mb => [mb.badgeId, mb.earnedAt]));

  return badges.map(badge => ({
    badge,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id),
  }));
}

/**
 * Count members who have earned a specific badge
 */
export async function countBadgeHolders(badgeId: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM member_badges WHERE badge_id = $1',
    [badgeId]
  );

  return parseInt(result.rows[0]?.count || '0', 10);
}

/**
 * Get recent badge awards (for admin panel)
 */
export async function getRecentBadgeAwards(
  limit: number = 50
): Promise<(MemberBadge & { badgeName: string; badgeIcon: string })[]> {
  const result = await query<MemberBadgeRow & { badge_name: string; badge_icon: string }>(
    `SELECT mb.*, b.name as badge_name, b.icon as badge_icon
     FROM member_badges mb
     JOIN badges b ON b.id = mb.badge_id
     ORDER BY mb.earned_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    memberId: row.member_id,
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
    eventId: row.event_id,
    badgeName: row.badge_name,
    badgeIcon: row.badge_icon,
  }));
}

/**
 * Get badge statistics for admin panel
 */
export async function getBadgeStats(): Promise<{
  totalBadges: number;
  totalAwarded: number;
  byCategory: Record<string, number>;
  topBadges: { badgeId: string; name: string; count: number }[];
}> {
  // Total badges and awarded
  const [badgesResult, awardedResult] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM badges'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM member_badges'),
  ]);

  // By category
  const categoryResult = await query<{ category: string; count: string }>(
    `SELECT b.category, COUNT(mb.id) as count
     FROM badges b
     LEFT JOIN member_badges mb ON mb.badge_id = b.id
     GROUP BY b.category`
  );

  const byCategory: Record<string, number> = {};
  for (const row of categoryResult.rows) {
    byCategory[row.category] = parseInt(row.count, 10);
  }

  // Top badges
  const topResult = await query<{ badge_id: string; name: string; count: string }>(
    `SELECT b.id as badge_id, b.name, COUNT(mb.id) as count
     FROM badges b
     LEFT JOIN member_badges mb ON mb.badge_id = b.id
     GROUP BY b.id, b.name
     ORDER BY count DESC
     LIMIT 10`
  );

  return {
    totalBadges: parseInt(badgesResult.rows[0]?.count || '0', 10),
    totalAwarded: parseInt(awardedResult.rows[0]?.count || '0', 10),
    byCategory,
    topBadges: topResult.rows.map(row => ({
      badgeId: row.badge_id,
      name: row.name,
      count: parseInt(row.count, 10),
    })),
  };
}
