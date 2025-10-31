/**
 * Support Points Transactions API
 * GET /api/support-points/transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getSupportPointsTransactions } from '@/lib/db/support-points';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await getSupportPointsTransactions(user.id, limit);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get Support Points transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
