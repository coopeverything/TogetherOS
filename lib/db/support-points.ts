/**
 * Support Points database operations
 * Handles SP wallet management, allocations, and reward events
 */

import { query } from '@togetheros/db';
import type { MemberRewardBalance, RewardEvent, CreateRewardEventInput } from '@togetheros/types/rewards';

export interface SupportPointsBalance {
  member_id: string;
  total_earned: number;
  available: number;
  allocated: number;
  created_at: Date;
  updated_at: Date;
}

export interface SupportPointsTransaction {
  id: string;
  member_id: string;
  type: 'initial' | 'earn' | 'allocate' | 'reclaim' | 'expire';
  amount: number;
  target_type?: string;
  target_id?: string;
  event_id?: string;
  reason?: string;
  created_at: Date;
}

export interface SupportPointsAllocation {
  id: string;
  member_id: string;
  target_type: string;
  target_id: string;
  amount: number;
  status: 'active' | 'reclaimed' | 'expired';
  allocated_at: Date;
  reclaimed_at?: Date;
}

/**
 * Get member's Support Points balance
 */
export async function getSupportPointsBalance(memberId: string): Promise<MemberRewardBalance | null> {
  const result = await query<SupportPointsBalance>(
    'SELECT * FROM support_points_balances WHERE member_id = $1',
    [memberId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const balance = result.rows[0];
  return {
    memberId: balance.member_id,
    total: balance.total_earned,
    available: balance.available,
    allocated: balance.allocated,
    updatedAt: balance.updated_at,
  };
}

/**
 * Initialize Support Points balance for a new user
 */
export async function initializeSupportPointsBalance(memberId: string): Promise<MemberRewardBalance> {
  const client = await query('BEGIN');

  try {
    // Create balance record
    await query(
      `INSERT INTO support_points_balances (member_id, total_earned, available, allocated)
       VALUES ($1, 100, 100, 0)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    // Create initial transaction
    await query(
      `INSERT INTO support_points_transactions (member_id, type, amount, reason)
       VALUES ($1, 'initial', 100, 'Initial Support Points allocation')`,
      [memberId]
    );

    await query('COMMIT');

    const balance = await getSupportPointsBalance(memberId);
    if (!balance) {
      throw new Error('Failed to initialize balance');
    }

    return balance;
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

/**
 * Allocate Support Points to a proposal/initiative
 */
export async function allocateSupportPoints(
  memberId: string,
  targetType: string,
  targetId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  // Validation
  if (amount <= 0 || amount > 10) {
    return { success: false, error: 'Amount must be between 1 and 10' };
  }

  const client = await query('BEGIN');

  try {
    // Check current balance
    const balanceResult = await query<SupportPointsBalance>(
      'SELECT * FROM support_points_balances WHERE member_id = $1 FOR UPDATE',
      [memberId]
    );

    if (!balanceResult.rows[0]) {
      await query('ROLLBACK');
      return { success: false, error: 'Member not found' };
    }

    const balance = balanceResult.rows[0];

    if (balance.available < amount) {
      await query('ROLLBACK');
      return { success: false, error: 'Insufficient available Support Points' };
    }

    // Check for existing allocation to this target
    const existingAllocation = await query(
      `SELECT * FROM support_points_allocations
       WHERE member_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'active'`,
      [memberId, targetType, targetId]
    );

    if (existingAllocation.rows[0]) {
      await query('ROLLBACK');
      return { success: false, error: 'Already allocated Support Points to this target' };
    }

    // Create allocation record
    await query(
      `INSERT INTO support_points_allocations (member_id, target_type, target_id, amount, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [memberId, targetType, targetId, amount]
    );

    // Update balance (decrease available, increase allocated)
    await query(
      `UPDATE support_points_balances
       SET available = available - $1, allocated = allocated + $1
       WHERE member_id = $2`,
      [amount, memberId]
    );

    // Create transaction record
    await query(
      `INSERT INTO support_points_transactions (member_id, type, amount, target_type, target_id, reason)
       VALUES ($1, 'allocate', $2, $3, $4, $5)`,
      [memberId, -amount, targetType, targetId, `Allocated ${amount} SP to ${targetType}`]
    );

    await query('COMMIT');

    return { success: true };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Allocate Support Points error:', error);
    return { success: false, error: 'Failed to allocate Support Points' };
  }
}

/**
 * Reclaim Support Points from a closed/cancelled proposal
 */
export async function reclaimSupportPoints(
  memberId: string,
  targetType: string,
  targetId: string
): Promise<{ success: boolean; error?: string }> {
  const client = await query('BEGIN');

  try {
    // Find active allocation
    const allocationResult = await query<SupportPointsAllocation>(
      `SELECT * FROM support_points_allocations
       WHERE member_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'active'
       FOR UPDATE`,
      [memberId, targetType, targetId]
    );

    if (!allocationResult.rows[0]) {
      await query('ROLLBACK');
      return { success: false, error: 'No active allocation found' };
    }

    const allocation = allocationResult.rows[0];

    // Update allocation status
    await query(
      `UPDATE support_points_allocations
       SET status = 'reclaimed', reclaimed_at = NOW()
       WHERE id = $1`,
      [allocation.id]
    );

    // Update balance (increase available, decrease allocated)
    await query(
      `UPDATE support_points_balances
       SET available = available + $1, allocated = allocated - $1
       WHERE member_id = $2`,
      [allocation.amount, memberId]
    );

    // Create transaction record
    await query(
      `INSERT INTO support_points_transactions (member_id, type, amount, target_type, target_id, reason)
       VALUES ($1, 'reclaim', $2, $3, $4, $5)`,
      [memberId, allocation.amount, targetType, targetId, `Reclaimed ${allocation.amount} SP from ${targetType}`]
    );

    await query('COMMIT');

    return { success: true };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Reclaim Support Points error:', error);
    return { success: false, error: 'Failed to reclaim Support Points' };
  }
}

/**
 * Award Support Points from a reward event
 */
export async function awardSupportPoints(
  memberId: string,
  amount: number,
  eventId?: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const client = await query('BEGIN');

  try {
    // Update balance (increase total and available)
    await query(
      `UPDATE support_points_balances
       SET total_earned = total_earned + $1, available = available + $1
       WHERE member_id = $2`,
      [amount, memberId]
    );

    // Create transaction record
    await query(
      `INSERT INTO support_points_transactions (member_id, type, amount, event_id, reason)
       VALUES ($1, 'earn', $2, $3, $4)`,
      [memberId, amount, eventId, reason || `Earned ${amount} SP from contribution`]
    );

    await query('COMMIT');

    return { success: true };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Award Support Points error:', error);
    return { success: false, error: 'Failed to award Support Points' };
  }
}

/**
 * Get Support Points transaction history for a member
 */
export async function getSupportPointsTransactions(
  memberId: string,
  limit: number = 50
): Promise<SupportPointsTransaction[]> {
  const result = await query<SupportPointsTransaction>(
    `SELECT * FROM support_points_transactions
     WHERE member_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [memberId, limit]
  );

  return result.rows;
}

/**
 * Get active Support Points allocations for a member
 */
export async function getSupportPointsAllocations(
  memberId: string
): Promise<SupportPointsAllocation[]> {
  const result = await query<SupportPointsAllocation>(
    `SELECT * FROM support_points_allocations
     WHERE member_id = $1 AND status = 'active'
     ORDER BY allocated_at DESC`,
    [memberId]
  );

  return result.rows;
}

/**
 * Get all allocations for a specific target (proposal/initiative)
 */
export async function getTargetAllocations(
  targetType: string,
  targetId: string
): Promise<{ total: number; count: number; allocations: SupportPointsAllocation[] }> {
  const result = await query<SupportPointsAllocation>(
    `SELECT * FROM support_points_allocations
     WHERE target_type = $1 AND target_id = $2 AND status = 'active'
     ORDER BY allocated_at DESC`,
    [targetType, targetId]
  );

  const allocations = result.rows;
  const total = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);

  return {
    total,
    count: allocations.length,
    allocations,
  };
}

/**
 * Create a reward event
 */
export async function createRewardEvent(input: CreateRewardEventInput): Promise<RewardEvent> {
  const {SP_WEIGHTS} = await import('@togetheros/types/rewards');

  // Calculate SP weight based on event type
  const sp_weight = SP_WEIGHTS[input.event_type] || 0;

  // Generate deduplication key
  const dedup_key = `${input.source}:${input.event_type}:${JSON.stringify(input.context)}`;

  const result = await query<RewardEvent>(
    `INSERT INTO reward_events (member_id, event_type, sp_weight, source, dedup_key, context, timestamp, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [
      input.memberId,
      input.event_type,
      sp_weight,
      input.source,
      dedup_key,
      JSON.stringify(input.context),
      input.timestamp || new Date(),
    ]
  );

  return result.rows[0];
}

/**
 * Process a pending reward event (award SP and mark as processed)
 */
export async function processRewardEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const client = await query('BEGIN');

  try {
    // Get the event
    const eventResult = await query<RewardEvent>(
      'SELECT * FROM reward_events WHERE id = $1 AND status = \'pending\' FOR UPDATE',
      [eventId]
    );

    if (!eventResult.rows[0]) {
      await query('ROLLBACK');
      return { success: false, error: 'Event not found or already processed' };
    }

    const event = eventResult.rows[0];

    // Award the Support Points
    const awardResult = await awardSupportPoints(
      event.memberId,
      event.sp_weight,
      event.id,
      `Earned from ${event.event_type}`
    );

    if (!awardResult.success) {
      await query('ROLLBACK');
      return awardResult;
    }

    // Mark event as processed
    await query(
      `UPDATE reward_events
       SET status = 'processed', processed_at = NOW()
       WHERE id = $1`,
      [eventId]
    );

    await query('COMMIT');

    return { success: true };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Process reward event error:', error);
    return { success: false, error: 'Failed to process reward event' };
  }
}
