// lib/db/milestones.ts
// Milestone database operations for gamification module

import db from '@togetheros/db'
import type {
  MilestoneRecord,
  MilestoneCelebrationRecord,
  PendingCelebration,
  GamificationUserSettings,
} from '@togetheros/types'
import { getMilestoneByThreshold, MILESTONES } from '@togetheros/types'

/**
 * Create a new milestone achievement
 */
export async function createMilestone(
  groupId: string,
  threshold: number,
  memberCount: number,
  triggeredByMemberId?: string
): Promise<MilestoneRecord> {
  const result = await db.query(
    `INSERT INTO gamification_milestones
       (group_id, threshold, member_count, triggered_by_member_id)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id,
       group_id as "groupId",
       threshold,
       achieved_at as "achievedAt",
       member_count as "memberCount",
       triggered_by_member_id as "triggeredByMemberId",
       created_at as "createdAt"`,
    [groupId, threshold, memberCount, triggeredByMemberId || null]
  )

  return result.rows[0]
}

/**
 * Get all milestones achieved by a group
 */
export async function getGroupMilestones(groupId: string): Promise<MilestoneRecord[]> {
  const result = await db.query(
    `SELECT
       id,
       group_id as "groupId",
       threshold,
       achieved_at as "achievedAt",
       member_count as "memberCount",
       triggered_by_member_id as "triggeredByMemberId",
       created_at as "createdAt"
     FROM gamification_milestones
     WHERE group_id = $1
     ORDER BY threshold ASC`,
    [groupId]
  )

  return result.rows
}

/**
 * Check if a milestone threshold has already been achieved
 */
export async function hasMilestoneBeenAchieved(
  groupId: string,
  threshold: number
): Promise<boolean> {
  const result = await db.query(
    `SELECT EXISTS(
       SELECT 1 FROM gamification_milestones
       WHERE group_id = $1 AND threshold = $2
     ) as exists`,
    [groupId, threshold]
  )

  return result.rows[0].exists
}

/**
 * Detect crossed milestones when member count changes
 * Returns array of newly crossed milestone thresholds
 */
export async function detectCrossedMilestones(
  groupId: string,
  newMemberCount: number
): Promise<number[]> {
  // Get already achieved milestones
  const achieved = await getGroupMilestones(groupId)
  const achievedThresholds = new Set(achieved.map(m => m.threshold))

  // Find milestones that are now crossed but not yet recorded
  const crossed = MILESTONES
    .filter(m => m.threshold <= newMemberCount && !achievedThresholds.has(m.threshold))
    .map(m => m.threshold)

  return crossed
}

/**
 * Mark celebration as shown for a user
 */
export async function markCelebrationShown(
  milestoneId: string,
  userId: string,
  actionTaken: boolean = false
): Promise<MilestoneCelebrationRecord> {
  const result = await db.query(
    `INSERT INTO gamification_milestone_celebrations
       (milestone_id, user_id, action_taken, action_taken_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (milestone_id, user_id) DO UPDATE SET
       shown_at = NOW(),
       action_taken = $3,
       action_taken_at = $4
     RETURNING
       id,
       milestone_id as "milestoneId",
       user_id as "userId",
       shown_at as "shownAt",
       action_taken as "actionTaken",
       action_taken_at as "actionTakenAt",
       created_at as "createdAt"`,
    [milestoneId, userId, actionTaken, actionTaken ? new Date() : null]
  )

  return result.rows[0]
}

/**
 * Get pending celebrations for a user (milestones they haven't seen yet)
 * Limited to 3 per session to prevent overwhelm
 */
export async function getPendingCelebrations(
  userId: string,
  limit: number = 3
): Promise<PendingCelebration[]> {
  const result = await db.query(
    `SELECT
       m.id as "milestoneId",
       m.group_id as "groupId",
       g.name as "groupName",
       m.threshold,
       m.achieved_at as "achievedAt",
       m.member_count as "memberCount"
     FROM gamification_milestones m
     INNER JOIN groups g ON g.id = m.group_id
     INNER JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = $1
     LEFT JOIN gamification_milestone_celebrations c
       ON c.milestone_id = m.id AND c.user_id = $1
     WHERE c.id IS NULL
     ORDER BY m.achieved_at ASC
     LIMIT $2`,
    [userId, limit]
  )

  // Enrich with milestone definitions
  return result.rows.map(row => ({
    ...row,
    milestone: getMilestoneByThreshold(row.threshold),
  }))
}

/**
 * Get user's gamification settings
 */
export async function getUserSettings(userId: string): Promise<GamificationUserSettings | null> {
  const result = await db.query(
    `SELECT
       user_id as "userId",
       quiet_mode as "quietMode",
       hide_rp_balance as "hideRpBalance",
       show_milestones as "showMilestones",
       created_at as "createdAt",
       updated_at as "updatedAt"
     FROM gamification_user_settings
     WHERE user_id = $1`,
    [userId]
  )

  return result.rows[0] || null
}

/**
 * Update user's gamification settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<GamificationUserSettings, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<GamificationUserSettings> {
  const result = await db.query(
    `INSERT INTO gamification_user_settings (user_id, quiet_mode, hide_rp_balance, show_milestones)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       quiet_mode = COALESCE($2, gamification_user_settings.quiet_mode),
       hide_rp_balance = COALESCE($3, gamification_user_settings.hide_rp_balance),
       show_milestones = COALESCE($4, gamification_user_settings.show_milestones),
       updated_at = NOW()
     RETURNING
       user_id as "userId",
       quiet_mode as "quietMode",
       hide_rp_balance as "hideRpBalance",
       show_milestones as "showMilestones",
       created_at as "createdAt",
       updated_at as "updatedAt"`,
    [
      userId,
      settings.quietMode ?? false,
      settings.hideRpBalance ?? false,
      settings.showMilestones ?? true,
    ]
  )

  return result.rows[0]
}

/**
 * Check and record milestones when group membership changes
 * Returns newly achieved milestones
 */
export async function checkAndRecordMilestones(
  groupId: string,
  newMemberCount: number,
  triggeredByMemberId?: string
): Promise<MilestoneRecord[]> {
  const crossed = await detectCrossedMilestones(groupId, newMemberCount)

  const newMilestones: MilestoneRecord[] = []

  for (const threshold of crossed) {
    const milestone = await createMilestone(
      groupId,
      threshold,
      newMemberCount,
      triggeredByMemberId
    )
    newMilestones.push(milestone)
  }

  return newMilestones
}
