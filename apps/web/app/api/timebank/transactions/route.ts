/**
 * Timebank Transactions API
 * GET /api/timebank/transactions - Get transaction history
 * POST /api/timebank/transactions - Request a service (create transaction)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface TimebankTransactionRow {
  id: string;
  provider_id: string;
  receiver_id: string;
  service_id: string | null;
  service_description: string;
  tbc_cost: number;
  hourly_rate: number | null;
  hours_provided: number | null;
  status: string;
  confirmed_at: Date | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  provider_name?: string;
  receiver_name?: string;
}

interface CreateTransactionRequest {
  providerId: string;
  serviceId?: string;
  serviceDescription: string;
  tbcCost: number;
  hourlyRate?: number;
  hoursProvided?: number;
  metadata?: Record<string, unknown>;
}

interface TBCAccountRow {
  member_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

/**
 * GET /api/timebank/transactions - Get transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const url = new URL(request.url);
    const role = url.searchParams.get('role'); // 'provider', 'receiver', or null for both
    const status = url.searchParams.get('status'); // 'pending', 'confirmed', 'disputed', 'resolved'
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);
    const offset = Number(url.searchParams.get('offset')) || 0;

    let queryText = `
      SELECT t.*,
             p.name as provider_name,
             r.name as receiver_name
      FROM timebank_transactions t
      JOIN users p ON t.provider_id = p.id
      JOIN users r ON t.receiver_id = r.id
      WHERE (t.provider_id = $1 OR t.receiver_id = $1)
    `;
    const params: (string | number)[] = [user.id];
    let paramIndex = 2;

    if (role === 'provider') {
      queryText = queryText.replace(
        '(t.provider_id = $1 OR t.receiver_id = $1)',
        't.provider_id = $1'
      );
    } else if (role === 'receiver') {
      queryText = queryText.replace(
        '(t.provider_id = $1 OR t.receiver_id = $1)',
        't.receiver_id = $1'
      );
    }

    if (status) {
      queryText += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query<TimebankTransactionRow>(queryText, params);

    // Get pending count for badge
    const pendingResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM timebank_transactions
       WHERE (provider_id = $1 OR receiver_id = $1) AND status = 'pending'`,
      [user.id]
    );

    return NextResponse.json({
      transactions: result.rows.map((row) => ({
        id: row.id,
        providerId: row.provider_id,
        receiverId: row.receiver_id,
        serviceId: row.service_id,
        serviceDescription: row.service_description,
        tbcCost: Number(row.tbc_cost),
        hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : null,
        hoursProvided: row.hours_provided ? Number(row.hours_provided) : null,
        status: row.status,
        confirmedAt: row.confirmed_at,
        metadata: row.metadata,
        createdAt: row.created_at,
        provider: {
          id: row.provider_id,
          name: row.provider_name,
        },
        receiver: {
          id: row.receiver_id,
          name: row.receiver_name,
        },
        // Helpful flags for the current user
        isProvider: row.provider_id === user.id,
        isReceiver: row.receiver_id === user.id,
      })),
      pagination: {
        limit,
        offset,
      },
      summary: {
        pendingCount: Number(pendingResult.rows[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error('Get timebank transactions error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timebank/transactions - Request a service (create transaction)
 * The requester is the receiver; they pay TBC to the provider
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as CreateTransactionRequest;

    // Validate required fields
    if (!body.providerId || !body.serviceDescription || !body.tbcCost) {
      return NextResponse.json(
        { error: 'providerId, serviceDescription, and tbcCost are required' },
        { status: 400 }
      );
    }

    // Validate TBC cost is positive
    if (body.tbcCost <= 0) {
      return NextResponse.json(
        { error: 'tbcCost must be positive' },
        { status: 400 }
      );
    }

    // Cannot request service from yourself
    if (body.providerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot request service from yourself' },
        { status: 400 }
      );
    }

    // Check receiver (current user) has sufficient TBC balance
    const balanceResult = await query<TBCAccountRow>(
      `SELECT * FROM timebank_accounts WHERE member_id = $1`,
      [user.id]
    );

    if (!balanceResult.rows[0]) {
      return NextResponse.json(
        { error: 'No timebank account found. Convert some RP to TBC first.' },
        { status: 400 }
      );
    }

    const receiverBalance = balanceResult.rows[0];
    if (Number(receiverBalance.balance) < body.tbcCost) {
      return NextResponse.json(
        {
          error: `Insufficient TBC balance. Available: ${receiverBalance.balance}, Required: ${body.tbcCost}`,
        },
        { status: 400 }
      );
    }

    // Verify provider exists
    const providerResult = await query<{ id: string; name: string }>(
      `SELECT id, name FROM users WHERE id = $1`,
      [body.providerId]
    );

    if (!providerResult.rows[0]) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // 1. Create the transaction (pending status)
      const txResult = await query<TimebankTransactionRow>(
        `INSERT INTO timebank_transactions
         (provider_id, receiver_id, service_id, service_description, tbc_cost, hourly_rate, hours_provided, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
         RETURNING *`,
        [
          body.providerId,
          user.id,
          body.serviceId || null,
          body.serviceDescription,
          body.tbcCost,
          body.hourlyRate || null,
          body.hoursProvided || null,
          JSON.stringify(body.metadata || {}),
        ]
      );

      // 2. Reserve TBC from receiver's balance (deduct but don't give to provider yet)
      // This prevents spending more than available while waiting for confirmation
      await query(
        `UPDATE timebank_accounts
         SET balance = balance - $1,
             total_spent = total_spent + $1,
             updated_at = NOW()
         WHERE member_id = $2`,
        [body.tbcCost, user.id]
      );

      await query('COMMIT');

      const tx = txResult.rows[0];

      return NextResponse.json({
        success: true,
        transaction: {
          id: tx.id,
          providerId: tx.provider_id,
          receiverId: tx.receiver_id,
          serviceDescription: tx.service_description,
          tbcCost: Number(tx.tbc_cost),
          status: tx.status,
          createdAt: tx.created_at,
        },
        message:
          'Service request created. Provider must confirm to complete the transaction.',
        nextStep: 'Provider should confirm the transaction after providing the service.',
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create timebank transaction error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
