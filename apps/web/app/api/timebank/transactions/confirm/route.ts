/**
 * Timebank Transaction Confirmation API
 * POST /api/timebank/transactions/confirm - Confirm a pending transaction
 *
 * Both parties must confirm:
 * 1. Provider confirms they provided the service
 * 2. Transaction status changes to 'confirmed'
 * 3. TBC transferred to provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface ConfirmRequest {
  transactionId: string;
}

interface TimebankTransactionRow {
  id: string;
  provider_id: string;
  receiver_id: string;
  service_description: string;
  tbc_cost: number;
  status: string;
  confirmed_at: Date | null;
  created_at: Date;
}

interface TBCAccountRow {
  member_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as ConfirmRequest;

    if (!body.transactionId) {
      return NextResponse.json(
        { error: 'transactionId is required' },
        { status: 400 }
      );
    }

    // Get the transaction
    const txResult = await query<TimebankTransactionRow>(
      `SELECT * FROM timebank_transactions WHERE id = $1`,
      [body.transactionId]
    );

    if (!txResult.rows[0]) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const tx = txResult.rows[0];

    // Only provider can confirm (they confirm they provided the service)
    if (tx.provider_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the service provider can confirm this transaction' },
        { status: 403 }
      );
    }

    // Must be pending
    if (tx.status !== 'pending') {
      return NextResponse.json(
        { error: `Transaction is already ${tx.status}` },
        { status: 400 }
      );
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // 1. Update transaction status to confirmed
      await query(
        `UPDATE timebank_transactions
         SET status = 'confirmed', confirmed_at = NOW()
         WHERE id = $1`,
        [body.transactionId]
      );

      // 2. Credit TBC to provider's account
      // (Receiver's TBC was already deducted when they created the request)
      const providerAccount = await query<TBCAccountRow>(
        `UPDATE timebank_accounts
         SET balance = balance + $1,
             total_earned = total_earned + $1,
             updated_at = NOW()
         WHERE member_id = $2
         RETURNING *`,
        [tx.tbc_cost, tx.provider_id]
      );

      // If provider doesn't have an account, create one
      if (!providerAccount.rows[0]) {
        await query(
          `INSERT INTO timebank_accounts (member_id, balance, total_earned, total_spent)
           VALUES ($1, $2, $2, 0)`,
          [tx.provider_id, tx.tbc_cost]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Transaction confirmed. TBC has been transferred.',
        transaction: {
          id: tx.id,
          status: 'confirmed',
          tbcTransferred: Number(tx.tbc_cost),
          confirmedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Confirm timebank transaction error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to confirm transaction' },
      { status: 500 }
    );
  }
}
