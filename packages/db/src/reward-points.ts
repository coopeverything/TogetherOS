// lib/db/reward-points.ts
// Reward Points (RP) database functions

import db from './index'
import type {
  RewardPointsBalance,
  RewardPointsTransaction,
  RPTransactionType,
  RPEarningRule,
  RPToTBCConversion,
  EarnRPFromContributionInput,
  ConvertRPToTBCInput,
} from '@togetheros/types'

/**
 * Get member's RP balance
 */
export async function getRewardPointsBalance(
  memberId: string
): Promise<RewardPointsBalance | null> {
  const result = await db.query(
    `SELECT member_id as "memberId", total_earned as "totalEarned",
            available, spent_on_tbc as "spentOnTBC", spent_on_sh as "spentOnSH",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM reward_points_balances
     WHERE member_id = $1`,
    [memberId]
  )

  return result.rows[0] || null
}

/**
 * Earn RP from contribution event
 */
export async function earnRewardPoints(
  input: EarnRPFromContributionInput
): Promise<RewardPointsTransaction> {
  const { memberId, eventType, rpAmount, source, metadata } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Update balance
    await client.query(
      `INSERT INTO reward_points_balances (member_id, total_earned, available)
       VALUES ($1, $2, $2)
       ON CONFLICT (member_id)
       DO UPDATE SET
         total_earned = reward_points_balances.total_earned + $2,
         available = reward_points_balances.available + $2,
         updated_at = NOW()`,
      [memberId, rpAmount]
    )

    // Create transaction
    const result = await client.query(
      `INSERT INTO reward_points_transactions
         (member_id, type, amount, source, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, member_id as "memberId", type, amount, source, metadata,
                 created_at as "createdAt"`,
      [memberId, 'earn_contribution', rpAmount, source, metadata || null]
    )

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Convert RP to TBC (with monthly throttling check)
 */
export async function convertRPToTBC(
  input: ConvertRPToTBCInput
): Promise<RPToTBCConversion> {
  const { memberId, rpAmount, conversionMonth } = input

  // Default conversion rate: 100 RP = 1 TBC
  const CONVERSION_RATE = 100
  const MONTHLY_TBC_CAP = 1 // Max 1 TBC per month

  const tbcReceived = rpAmount / CONVERSION_RATE

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Check monthly cap
    const capCheck = await client.query(
      `SELECT COALESCE(SUM(tbc_received), 0) as total
       FROM rp_to_tbc_conversions
       WHERE member_id = $1 AND conversion_month = $2`,
      [memberId, conversionMonth]
    )

    const currentMonthTotal = parseFloat(capCheck.rows[0].total)

    if (currentMonthTotal + tbcReceived > MONTHLY_TBC_CAP) {
      throw new Error(
        `Monthly TBC conversion cap exceeded. Current: ${currentMonthTotal}, Requested: ${tbcReceived}, Cap: ${MONTHLY_TBC_CAP}`
      )
    }

    // Check RP balance
    const balance = await client.query(
      `SELECT available FROM reward_points_balances WHERE member_id = $1`,
      [memberId]
    )

    if (!balance.rows[0] || parseFloat(balance.rows[0].available) < rpAmount) {
      throw new Error('Insufficient RP balance')
    }

    // Update RP balance
    await client.query(
      `UPDATE reward_points_balances
       SET available = available - $2,
           spent_on_tbc = spent_on_tbc + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [memberId, rpAmount]
    )

    // Update TBC balance
    await client.query(
      `UPDATE timebank_accounts
       SET balance = balance + $2,
           total_earned = total_earned + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [memberId, tbcReceived]
    )

    // Create RP transaction
    await client.query(
      `INSERT INTO reward_points_transactions (member_id, type, amount, source)
       VALUES ($1, 'spend_tbc', $2, 'conversion')`,
      [memberId, rpAmount]
    )

    // Create conversion record
    const result = await client.query(
      `INSERT INTO rp_to_tbc_conversions
         (member_id, rp_spent, tbc_received, conversion_month, rate_used)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, member_id as "memberId", rp_spent as "rpSpent",
                 tbc_received as "tbcReceived", conversion_month as "conversionMonth",
                 rate_used as "rateUsed", created_at as "createdAt"`,
      [memberId, rpAmount, tbcReceived, conversionMonth, CONVERSION_RATE]
    )

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get RP transaction history
 */
export async function getRewardPointsTransactions(
  memberId: string,
  limit = 50
): Promise<RewardPointsTransaction[]> {
  const result = await db.query(
    `SELECT id, member_id as "memberId", type, amount, source, metadata,
            created_at as "createdAt"
     FROM reward_points_transactions
     WHERE member_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [memberId, limit]
  )

  return result.rows
}

/**
 * Get RP earning rules
 */
export async function getRPEarningRules(): Promise<RPEarningRule[]> {
  const result = await db.query(
    `SELECT id, event_type as "eventType", rp_amount as "rpAmount",
            min_threshold as "minThreshold", active,
            created_at as "createdAt", updated_at as "updatedAt"
     FROM rp_earning_rules
     WHERE active = true
     ORDER BY event_type`
  )

  return result.rows
}

/**
 * Get RP amount for event type
 */
export async function getRPAmountForEvent(eventType: string): Promise<number> {
  const result = await db.query(
    `SELECT rp_amount FROM rp_earning_rules
     WHERE event_type = $1 AND active = true`,
    [eventType]
  )

  return result.rows[0]?.rp_amount || 0
}
