/**
 * Support Points Reclaim API
 * POST /api/support-points/reclaim
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { reclaimSupportPoints } from '@/lib/db/support-points';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId } = body;

    // Validation
    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    const result = await reclaimSupportPoints(
      user.id,
      targetType,
      targetId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Support Points reclaimed successfully',
    });
  } catch (error) {
    console.error('Reclaim Support Points error:', error);
    return NextResponse.json(
      { error: 'Failed to reclaim Support Points' },
      { status: 500 }
    );
  }
}
