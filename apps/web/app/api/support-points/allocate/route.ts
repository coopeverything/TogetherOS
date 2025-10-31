/**
 * Support Points Allocation API
 * POST /api/support-points/allocate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { allocateSupportPoints } from '@/lib/db/support-points';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, amount } = body;

    // Validation
    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'amount must be a number' },
        { status: 400 }
      );
    }

    if (amount < 1 || amount > 10) {
      return NextResponse.json(
        { error: 'amount must be between 1 and 10' },
        { status: 400 }
      );
    }

    const result = await allocateSupportPoints(
      user.id,
      targetType,
      targetId,
      amount
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Allocated ${amount} Support Points`,
    });
  } catch (error) {
    console.error('Allocate Support Points error:', error);
    return NextResponse.json(
      { error: 'Failed to allocate Support Points' },
      { status: 500 }
    );
  }
}
