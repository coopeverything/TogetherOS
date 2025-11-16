// lib/db/timebank.ts
// Timebank Credits (TBC) database functions

import db from './index'
import type {
  TimebankAccount,
  TimebankTransaction,
  TimebankService,
  CreateTimebankTransactionInput,
  CreateTimebankServiceInput,
} from '@togetheros/types'

/**
 * Get member's TBC balance
 */
export async function getTimebankBalance(
  memberId: string
): Promise<TimebankAccount | null> {
  const result = await db.query(
    `SELECT member_id as "memberId", balance, total_earned as "totalEarned",
            total_spent as "totalSpent", created_at as "createdAt",
            updated_at as "updatedAt"
     FROM timebank_accounts
     WHERE member_id = $1`,
    [memberId]
  )

  return result.rows[0] || null
}

/**
 * Create timebank transaction (service exchange)
 */
export async function createTimebankTransaction(
  input: CreateTimebankTransactionInput
): Promise<TimebankTransaction> {
  const {
    providerId,
    receiverId,
    serviceId,
    serviceDescription,
    tbcCost,
    hourlyRate,
    hoursProvided,
    metadata,
  } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Check receiver has sufficient TBC
    const balance = await client.query(
      `SELECT balance FROM timebank_accounts WHERE member_id = $1`,
      [receiverId]
    )

    if (!balance.rows[0] || parseFloat(balance.rows[0].balance) < tbcCost) {
      throw new Error('Insufficient TBC balance')
    }

    // Create transaction
    const result = await client.query(
      `INSERT INTO timebank_transactions
         (provider_id, receiver_id, service_id, service_description,
          tbc_cost, hourly_rate, hours_provided, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       RETURNING id, provider_id as "providerId", receiver_id as "receiverId",
                 service_id as "serviceId", service_description as "serviceDescription",
                 tbc_cost as "tbcCost", hourly_rate as "hourlyRate",
                 hours_provided as "hoursProvided", status, confirmed_at as "confirmedAt",
                 metadata, created_at as "createdAt"`,
      [
        providerId,
        receiverId,
        serviceId || null,
        serviceDescription,
        tbcCost,
        hourlyRate || null,
        hoursProvided || null,
        metadata || null,
      ]
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
 * Confirm timebank transaction (transfers TBC)
 */
export async function confirmTimebankTransaction(
  transactionId: string
): Promise<TimebankTransaction> {
  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Get transaction
    const txn = await client.query(
      `SELECT provider_id, receiver_id, tbc_cost, status
       FROM timebank_transactions
       WHERE id = $1`,
      [transactionId]
    )

    if (!txn.rows[0]) {
      throw new Error('Transaction not found')
    }

    if (txn.rows[0].status !== 'pending') {
      throw new Error('Transaction already processed')
    }

    const { provider_id, receiver_id, tbc_cost } = txn.rows[0]

    // Transfer TBC
    await client.query(
      `UPDATE timebank_accounts
       SET balance = balance - $2,
           total_spent = total_spent + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [receiver_id, tbc_cost]
    )

    await client.query(
      `UPDATE timebank_accounts
       SET balance = balance + $2,
           total_earned = total_earned + $2,
           updated_at = NOW()
       WHERE member_id = $1`,
      [provider_id, tbc_cost]
    )

    // Update transaction status
    const result = await client.query(
      `UPDATE timebank_transactions
       SET status = 'confirmed',
           confirmed_at = NOW()
       WHERE id = $1
       RETURNING id, provider_id as "providerId", receiver_id as "receiverId",
                 service_id as "serviceId", service_description as "serviceDescription",
                 tbc_cost as "tbcCost", hourly_rate as "hourlyRate",
                 hours_provided as "hoursProvided", status, confirmed_at as "confirmedAt",
                 metadata, created_at as "createdAt"`,
      [transactionId]
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
 * Get timebank transactions for member
 */
export async function getTimebankTransactions(
  memberId: string,
  limit = 50
): Promise<TimebankTransaction[]> {
  const result = await db.query(
    `SELECT id, provider_id as "providerId", receiver_id as "receiverId",
            service_id as "serviceId", service_description as "serviceDescription",
            tbc_cost as "tbcCost", hourly_rate as "hourlyRate",
            hours_provided as "hoursProvided", status, confirmed_at as "confirmedAt",
            metadata, created_at as "createdAt"
     FROM timebank_transactions
     WHERE provider_id = $1 OR receiver_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [memberId, limit]
  )

  return result.rows
}

/**
 * Create timebank service offering
 */
export async function createTimebankService(
  input: CreateTimebankServiceInput
): Promise<TimebankService> {
  const {
    memberId,
    serviceType,
    title,
    description,
    tbcPerHour,
    availability,
    locationPreference,
    cityId,
  } = input

  const result = await db.query(
    `INSERT INTO timebank_services
       (member_id, service_type, title, description, tbc_per_hour,
        availability, location_preference, city_id, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
     RETURNING id, member_id as "memberId", service_type as "serviceType",
               title, description, tbc_per_hour as "tbcPerHour", availability,
               location_preference as "locationPreference", city_id as "cityId",
               active, created_at as "createdAt", updated_at as "updatedAt"`,
    [
      memberId,
      serviceType,
      title,
      description || null,
      tbcPerHour,
      availability || null,
      locationPreference || null,
      cityId || null,
    ]
  )

  return result.rows[0]
}

/**
 * Get active timebank services
 */
export async function getTimebankServices(
  cityId?: string
): Promise<TimebankService[]> {
  const query = cityId
    ? `SELECT id, member_id as "memberId", service_type as "serviceType",
              title, description, tbc_per_hour as "tbcPerHour", availability,
              location_preference as "locationPreference", city_id as "cityId",
              active, created_at as "createdAt", updated_at as "updatedAt"
       FROM timebank_services
       WHERE active = true AND (city_id = $1 OR city_id IS NULL)
       ORDER BY created_at DESC`
    : `SELECT id, member_id as "memberId", service_type as "serviceType",
              title, description, tbc_per_hour as "tbcPerHour", availability,
              location_preference as "locationPreference", city_id as "cityId",
              active, created_at as "createdAt", updated_at as "updatedAt"
       FROM timebank_services
       WHERE active = true
       ORDER BY created_at DESC`

  const result = await db.query(query, cityId ? [cityId] : [])

  return result.rows
}
