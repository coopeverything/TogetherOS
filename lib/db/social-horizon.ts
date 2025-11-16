// lib/db/social-horizon.ts
// Social Horizon (SH) database functions

import db from '@togetheros/db'
import type {
  SocialHorizonWallet,
  SHPurchaseEvent,
  PurchaseSHWithRPInput,
} from '@togetheros/types'

/**
 * Get member's SH balance
 */
export async function getSocialHorizonBalance(
  memberId: string
): Promise<SocialHorizonWallet | null> {
  const result = await db.query(
    `SELECT member_id as "memberId", sh_balance as "shBalance",
            total_issued as "totalIssued", total_transferred as "totalTransferred",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM social_horizon_wallets
     WHERE member_id = $1`,
    [memberId]
  )

  return result.rows[0] || null
}

/**
 * Get active SH purchase events
 */
export async function getActiveSHPurchaseEvents(): Promise<SHPurchaseEvent[]> {
  const result = await db.query(
    `SELECT id, event_name as "eventName", cycle_id as "cycleId",
            start_date as "startDate", end_date as "endDate",
            rp_per_sh as "rpPerSH", money_per_sh as "moneyPerSH",
            sh_cap_per_person as "shCapPerPerson", global_sh_cap as "globalSHCap",
            sh_distributed as "shDistributed", fiscal_regularity_required as "fiscalRegularityRequired",
            status, metadata, created_at as "createdAt", updated_at as "updatedAt"
     FROM sh_purchase_events
     WHERE status = 'active' AND NOW() BETWEEN start_date AND end_date
     ORDER BY start_date DESC`
  )

  return result.rows
}

/**
 * Purchase SH with RP (during event)
 */
export async function purchaseSHWithRP(
  input: PurchaseSHWithRPInput
): Promise<void> {
  const { memberId, eventId, rpAmount, shAmount } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Get event details
    const event = await client.query(
      `SELECT rp_per_sh, sh_cap_per_person, global_sh_cap, sh_distributed,
              fiscal_regularity_required
       FROM sh_purchase_events
       WHERE id = $1 AND status = 'active'`,
      [eventId]
    )

    if (!event.rows[0]) {
      throw new Error('Event not found or not active')
    }

    const {
      rp_per_sh,
      sh_cap_per_person,
      global_sh_cap,
      sh_distributed,
      fiscal_regularity_required,
    } = event.rows[0]

    // Check RP amount matches SH amount
    const expectedRP = shAmount * rp_per_sh
    if (Math.abs(rpAmount - expectedRP) > 0.01) {
      throw new Error(`Invalid RP amount. Expected ${expectedRP} RP for ${shAmount} SH`)
    }

    // Check per-person cap
    const memberPurchases = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM sh_transactions
       WHERE to_wallet = $1 AND event_id = $2 AND transaction_type = 'rp_purchase'`,
      [memberId, eventId]
    )

    const memberTotal = parseFloat(memberPurchases.rows[0].total)
    if (memberTotal + shAmount > sh_cap_per_person) {
      throw new Error(
        `Per-person cap exceeded. Current: ${memberTotal}, Requested: ${shAmount}, Cap: ${sh_cap_per_person}`
      )
    }

    // Check global cap
    if (sh_distributed + shAmount > global_sh_cap) {
      throw new Error('Global SH cap exceeded for this event')
    }

    // Check RP balance
    const rpBalance = await client.query(
      `SELECT available FROM reward_points_balances WHERE member_id = $1`,
      [memberId]
    )

    if (!rpBalance.rows[0] || parseFloat(rpBalance.rows[0].available) < rpAmount) {
      throw new Error('Insufficient RP balance')
    }

    // Update RP balance (burn RP)
    await client.query(
      `UPDATE reward_points_balances
       SET available = available - $2,
           spent_on_sh = spent_on_sh + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [memberId, rpAmount]
    )

    // Update SH wallet
    await client.query(
      `UPDATE social_horizon_wallets
       SET sh_balance = sh_balance + $2,
           total_issued = total_issued + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [memberId, shAmount]
    )

    // Create RP transaction
    await client.query(
      `INSERT INTO reward_points_transactions (member_id, type, amount, source)
       VALUES ($1, 'spend_sh', $2, $3)`,
      [memberId, rpAmount, `sh_event_${eventId}`]
    )

    // Create SH transaction
    await client.query(
      `INSERT INTO sh_transactions (to_wallet, amount, transaction_type, event_id)
       VALUES ($1, $2, 'rp_purchase', $3)`,
      [memberId, shAmount, eventId]
    )

    // Update event distributed amount
    await client.query(
      `UPDATE sh_purchase_events
       SET sh_distributed = sh_distributed + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [eventId, shAmount]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
