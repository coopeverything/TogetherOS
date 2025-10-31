/**
 * Support Points Balance API
 * GET /api/support-points/balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getSupportPointsBalance, initializeSupportPointsBalance } from '@/lib/db/support-points';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get balance, initialize if doesn't exist
    let balance = await getSupportPointsBalance(user.id);

    if (!balance) {
      balance = await initializeSupportPointsBalance(user.id);
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Get Support Points balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
