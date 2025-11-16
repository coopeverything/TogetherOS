// lib/db/budgets.ts
// Budget tracking database functions

import db from '@togetheros/db'
import type {
  GlobalBudget,
  MembershipFee,
  Donation,
  RecordMembershipFeeInput,
  RecordDonationInput,
} from '@togetheros/types'

/**
 * Get global budget balances
 */
export async function getGlobalBudgets(): Promise<GlobalBudget[]> {
  const result = await db.query(
    `SELECT id, fund_type as "fundType", balance_usd as "balanceUSD",
            total_allocated_usd as "totalAllocatedUSD", total_spent_usd as "totalSpentUSD",
            currency, created_at as "createdAt", updated_at as "updatedAt"
     FROM global_budgets
     ORDER BY fund_type`
  )

  return result.rows
}

/**
 * Record membership fee payment
 */
export async function recordMembershipFee(
  input: RecordMembershipFeeInput
): Promise<MembershipFee> {
  const {
    memberId,
    paymentDate,
    amountUSD,
    currency,
    rpGranted,
    allocationSplit,
    paymentMethod,
    metadata,
  } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Record fee
    const result = await client.query(
      `INSERT INTO membership_fees
         (member_id, payment_date, amount_usd, currency, rp_granted,
          allocation_split, payment_method, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, member_id as "memberId", payment_date as "paymentDate",
                 amount_usd as "amountUSD", currency, rp_granted as "rpGranted",
                 allocation_split as "allocationSplit", payment_method as "paymentMethod",
                 metadata, created_at as "createdAt"`,
      [
        memberId,
        paymentDate,
        amountUSD,
        currency,
        rpGranted,
        JSON.stringify(allocationSplit),
        paymentMethod || null,
        metadata || null,
      ]
    )

    // Grant RP
    await client.query(
      `INSERT INTO reward_points_balances (member_id, total_earned, available)
       VALUES ($1, $2, $2)
       ON CONFLICT (member_id)
       DO UPDATE SET
         total_earned = reward_points_balances.total_earned + $2,
         available = reward_points_balances.available + $2,
         updated_at = NOW()`,
      [memberId, rpGranted]
    )

    // Create RP transaction
    await client.query(
      `INSERT INTO reward_points_transactions (member_id, type, amount, source)
       VALUES ($1, 'earn_dues', $2, 'monthly_fee')`,
      [memberId, rpGranted]
    )

    // Allocate to budgets
    for (const [fundType, percentage] of Object.entries(allocationSplit)) {
      const allocAmount = amountUSD * percentage

      await client.query(
        `UPDATE global_budgets
         SET balance_usd = balance_usd + $2,
             total_allocated_usd = total_allocated_usd + $2,
             updated_at = NOW()
         WHERE fund_type = $1`,
        [fundType, allocAmount]
      )
    }

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
 * Record donation
 */
export async function recordDonation(
  input: RecordDonationInput
): Promise<Donation> {
  const {
    donorId,
    amountUSD,
    currency,
    rpGranted,
    campaignId,
    tier,
    allocationSplit,
    paymentMethod,
    metadata,
  } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Record donation
    const result = await client.query(
      `INSERT INTO donations
         (donor_id, amount_usd, currency, rp_granted, campaign_id, tier,
          allocation_split, payment_method, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, donor_id as "donorId", amount_usd as "amountUSD",
                 currency, rp_granted as "rpGranted", campaign_id as "campaignId",
                 tier, allocation_split as "allocationSplit",
                 payment_method as "paymentMethod", metadata,
                 created_at as "createdAt"`,
      [
        donorId || null,
        amountUSD,
        currency,
        rpGranted || null,
        campaignId || null,
        tier || null,
        JSON.stringify(allocationSplit),
        paymentMethod || null,
        metadata || null,
      ]
    )

    // Grant RP if donor is a member
    if (donorId && rpGranted) {
      await client.query(
        `INSERT INTO reward_points_balances (member_id, total_earned, available)
         VALUES ($1, $2, $2)
         ON CONFLICT (member_id)
         DO UPDATE SET
           total_earned = reward_points_balances.total_earned + $2,
           available = reward_points_balances.available + $2,
           updated_at = NOW()`,
        [donorId, rpGranted]
      )

      await client.query(
        `INSERT INTO reward_points_transactions (member_id, type, amount, source)
         VALUES ($1, 'earn_donation', $2, $3)`,
        [donorId, rpGranted, campaignId || 'one_time_donation']
      )
    }

    // Allocate to budgets
    for (const [fundType, percentage] of Object.entries(allocationSplit)) {
      const allocAmount = amountUSD * percentage

      await client.query(
        `UPDATE global_budgets
         SET balance_usd = balance_usd + $2,
             total_allocated_usd = total_allocated_usd + $2,
             updated_at = NOW()
         WHERE fund_type = $1`,
        [fundType, allocAmount]
      )
    }

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
