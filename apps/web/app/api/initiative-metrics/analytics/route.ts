/**
 * Metrics Analytics API Endpoint
 * GET /api/initiative-metrics/analytics - Get platform-wide analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '../../../../../api/src/modules/metrics/handlers';

export async function GET(request: NextRequest) {
  try {
    const analytics = await getAnalytics();

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/initiative-metrics/analytics error:', message);
    return NextResponse.json(
      { error: message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
