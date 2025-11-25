/**
 * Database operations for daily challenges
 */

import db from '@togetheros/db'
import type {
  ChallengeDefinition,
  UserChallenge,
  FirstWeekProgress,
  ChallengeProgress,
  ChallengeCompletionResult,
} from '@togetheros/types'
import { FIRST_WEEK_COMPLETION_BONUS } from '@togetheros/types'
import { earnRewardPoints } from './reward-points'

/**
 * Get all active challenge definitions
 */
export async function getActiveChallenges(): Promise<ChallengeDefinition[]> {
  const result = await db.query(
    `SELECT
      id,
      name,
      description,
      category,
      difficulty,
      rp_reward as "rpReward",
      action_type as "actionType",
      action_target as "actionTarget",
      is_active as "isActive",
      is_first_week as "isFirstWeek",
      day_number as "dayNumber",
      icon,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM gamification_challenge_definitions
    WHERE is_active = true
    ORDER BY is_first_week DESC, day_number ASC, category, name`
  )
  return result.rows as ChallengeDefinition[]
}

/**
 * Get first-week challenges
 */
export async function getFirstWeekChallenges(): Promise<ChallengeDefinition[]> {
  const result = await db.query(
    `SELECT
      id,
      name,
      description,
      category,
      difficulty,
      rp_reward as "rpReward",
      action_type as "actionType",
      action_target as "actionTarget",
      is_active as "isActive",
      is_first_week as "isFirstWeek",
      day_number as "dayNumber",
      icon,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM gamification_challenge_definitions
    WHERE is_first_week = true AND is_active = true
    ORDER BY day_number ASC`
  )
  return result.rows as ChallengeDefinition[]
}

/**
 * Get user's daily challenges for today
 */
export async function getUserDailyChallenges(userId: string): Promise<UserChallenge[]> {
  const result = await db.query(
    `SELECT
      uc.id,
      uc.user_id as "userId",
      uc.challenge_id as "challengeId",
      uc.assigned_date as "assignedDate",
      uc.status,
      uc.completed_at as "completedAt",
      uc.progress,
      uc.rp_awarded as "rpAwarded",
      uc.created_at as "createdAt",
      uc.updated_at as "updatedAt",
      json_build_object(
        'id', cd.id,
        'name', cd.name,
        'description', cd.description,
        'category', cd.category,
        'difficulty', cd.difficulty,
        'rpReward', cd.rp_reward,
        'actionType', cd.action_type,
        'actionTarget', cd.action_target,
        'icon', cd.icon
      ) as challenge
    FROM gamification_user_challenges uc
    JOIN gamification_challenge_definitions cd ON uc.challenge_id = cd.id
    WHERE uc.user_id = $1
      AND uc.assigned_date = CURRENT_DATE
    ORDER BY uc.status ASC, cd.difficulty ASC`,
    [userId]
  )
  return result.rows as UserChallenge[]
}

/**
 * Get user's first-week progress
 */
export async function getFirstWeekProgress(userId: string): Promise<FirstWeekProgress | null> {
  const result = await db.query(
    `SELECT
      id,
      user_id as "userId",
      start_date as "startDate",
      current_day as "currentDay",
      completed_days as "completedDays",
      total_rp_earned as "totalRPEarned",
      streak_bonus_rp as "streakBonusRP",
      completed_at as "completedAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM gamification_first_week_progress
    WHERE user_id = $1`,
    [userId]
  )
  return result.rows.length > 0 ? (result.rows[0] as FirstWeekProgress) : null
}

/**
 * Initialize first-week journey for a new user
 */
export async function initializeFirstWeekJourney(userId: string): Promise<FirstWeekProgress> {
  const result = await db.query(
    `INSERT INTO gamification_first_week_progress (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING
      id,
      user_id as "userId",
      start_date as "startDate",
      current_day as "currentDay",
      completed_days as "completedDays",
      total_rp_earned as "totalRPEarned",
      streak_bonus_rp as "streakBonusRP",
      completed_at as "completedAt",
      created_at as "createdAt",
      updated_at as "updatedAt"`,
    [userId]
  )

  if (result.rows.length === 0) {
    const existing = await getFirstWeekProgress(userId)
    if (!existing) throw new Error('Failed to initialize first-week journey')
    return existing
  }

  const firstWeekChallenges = await getFirstWeekChallenges()
  const day1Challenge = firstWeekChallenges.find(c => c.dayNumber === 1)
  if (day1Challenge) {
    await assignChallengeToUser(userId, day1Challenge.id)
  }

  return result.rows[0] as FirstWeekProgress
}

/**
 * Assign a challenge to a user
 */
export async function assignChallengeToUser(
  userId: string,
  challengeId: string
): Promise<UserChallenge> {
  const result = await db.query(
    `INSERT INTO gamification_user_challenges (user_id, challenge_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, challenge_id, assigned_date) DO UPDATE
      SET updated_at = NOW()
    RETURNING
      id,
      user_id as "userId",
      challenge_id as "challengeId",
      assigned_date as "assignedDate",
      status,
      completed_at as "completedAt",
      progress,
      rp_awarded as "rpAwarded",
      created_at as "createdAt",
      updated_at as "updatedAt"`,
    [userId, challengeId]
  )
  return result.rows[0] as UserChallenge
}

/**
 * Assign random daily challenges to a user
 */
export async function assignDailyChallenges(
  userId: string,
  count: number = 3,
  excludeFirstWeek: boolean = true
): Promise<UserChallenge[]> {
  const availableChallenges = await db.query(
    `SELECT id
    FROM gamification_challenge_definitions
    WHERE is_active = true
      AND ($1 = false OR is_first_week = false)
      AND id NOT IN (
        SELECT challenge_id
        FROM gamification_user_challenges
        WHERE user_id = $2
          AND assigned_date = CURRENT_DATE
      )
    ORDER BY RANDOM()
    LIMIT $3`,
    [excludeFirstWeek, userId, count]
  )

  const assigned: UserChallenge[] = []
  for (const challenge of availableChallenges.rows) {
    const userChallenge = await assignChallengeToUser(userId, challenge.id)
    assigned.push(userChallenge)
  }

  return assigned
}

/**
 * Complete a challenge
 */
export async function completeChallenge(
  userId: string,
  challengeId: string,
  streakDays: number = 0
): Promise<ChallengeCompletionResult> {
  const userChallenges = await db.query(
    `SELECT
      uc.id,
      uc.status,
      cd.rp_reward as "rpReward",
      cd.name,
      cd.is_first_week as "isFirstWeek",
      cd.day_number as "dayNumber"
    FROM gamification_user_challenges uc
    JOIN gamification_challenge_definitions cd ON uc.challenge_id = cd.id
    WHERE uc.user_id = $1
      AND uc.challenge_id = $2
      AND uc.assigned_date = CURRENT_DATE`,
    [userId, challengeId]
  )

  if (userChallenges.rows.length === 0) {
    return {
      success: false,
      challengeId,
      rpAwarded: 0,
      message: 'Challenge not found or not assigned today',
    }
  }

  const userChallenge = userChallenges.rows[0]
  if (userChallenge.status === 'completed') {
    return {
      success: false,
      challengeId,
      rpAwarded: 0,
      message: 'Challenge already completed',
    }
  }

  const baseRP = userChallenge.rpReward
  const streakBonus = streakDays >= 3 ? Math.round(baseRP * (getStreakMultiplier(streakDays) - 1)) : 0
  const totalRP = baseRP + streakBonus

  await db.query(
    `UPDATE gamification_user_challenges
    SET
      status = 'completed',
      completed_at = NOW(),
      rp_awarded = $1
    WHERE id = $2`,
    [totalRP, userChallenge.id]
  )

  await earnRewardPoints({
    memberId: userId,
    eventType: 'daily_challenge_completed',
    rpAmount: totalRP,
    source: `challenge:${challengeId}`,
    metadata: {
      challengeName: userChallenge.name,
      streakBonus,
      streakDays,
    },
  })

  if (userChallenge.isFirstWeek && userChallenge.dayNumber) {
    await updateFirstWeekProgress(userId, userChallenge.dayNumber, totalRP)
  }

  return {
    success: true,
    challengeId,
    rpAwarded: totalRP,
    streakBonus,
    message: `Challenge completed! Earned ${totalRP} RP${streakBonus > 0 ? ` (includes ${streakBonus} streak bonus)` : ''}`,
  }
}

/**
 * Update first-week progress when a day is completed
 */
async function updateFirstWeekProgress(
  userId: string,
  dayNumber: number,
  rpEarned: number
): Promise<void> {
  const progress = await getFirstWeekProgress(userId)
  if (!progress) return

  const completedDays = [...progress.completedDays]
  if (!completedDays.includes(dayNumber)) {
    completedDays.push(dayNumber)
  }

  const isComplete = completedDays.length === 7
  let totalRP = progress.totalRPEarned + rpEarned
  let streakBonus = progress.streakBonusRP

  if (isComplete && !progress.completedAt) {
    streakBonus += FIRST_WEEK_COMPLETION_BONUS
    totalRP += FIRST_WEEK_COMPLETION_BONUS

    await earnRewardPoints({
      memberId: userId,
      eventType: 'first_week_completed',
      rpAmount: FIRST_WEEK_COMPLETION_BONUS,
      source: `first_week_journey:${progress.id}`,
      metadata: {
        completedDays,
      },
    })
  }

  const nextDay = dayNumber + 1

  await db.query(
    `UPDATE gamification_first_week_progress
    SET
      completed_days = $1,
      total_rp_earned = $2,
      streak_bonus_rp = $3,
      current_day = GREATEST(current_day, $4),
      completed_at = CASE WHEN $5 THEN NOW() ELSE completed_at END
    WHERE user_id = $6`,
    [JSON.stringify(completedDays), totalRP, streakBonus, nextDay, isComplete, userId]
  )

  if (!isComplete) {
    const firstWeekChallenges = await getFirstWeekChallenges()
    const nextChallenge = firstWeekChallenges.find(c => c.dayNumber === nextDay)
    if (nextChallenge) {
      await assignChallengeToUser(userId, nextChallenge.id)
    }
  }
}

/**
 * Update challenge progress (for multi-step challenges)
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: ChallengeProgress
): Promise<void> {
  await db.query(
    `UPDATE gamification_user_challenges
    SET progress = $1
    WHERE user_id = $2
      AND challenge_id = $3
      AND assigned_date = CURRENT_DATE
      AND status = 'pending'`,
    [JSON.stringify(progress), userId, challengeId]
  )
}

/**
 * Get user's challenge streak
 */
export async function getUserChallengeStreak(userId: string): Promise<number> {
  const result = await db.query(
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

  return result.rows[0]?.streak_length || 0
}

/**
 * Expire old pending challenges
 */
export async function expireOldChallenges(): Promise<number> {
  const result = await db.query(
    `UPDATE gamification_user_challenges
    SET status = 'expired'
    WHERE status = 'pending'
      AND assigned_date < CURRENT_DATE
    RETURNING id`
  )
  return result.rows.length
}

/**
 * Helper function to get streak multiplier
 */
function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0
  if (streakDays >= 14) return 1.5
  if (streakDays >= 7) return 1.25
  if (streakDays >= 3) return 1.1
  return 1
}
