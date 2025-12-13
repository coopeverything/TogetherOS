/**
 * Background Job: Cleanup Old Recommendations
 * POST /api/bridge/recommendations/jobs/cleanup
 *
 * Removes old acted_on/dismissed recommendations
 * Should be called by cron job or scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldRecommendations } from '@web/bridge/recommendation-jobs';
import { refreshPerformanceView } from '@web/bridge/recommendation-analytics';

// Require API key for job endpoints (must be set in environment)
const JOB_API_KEY = process.env.JOB_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Fail closed if API key not configured
    if (!JOB_API_KEY) {
      console.error('JOB_API_KEY environment variable not set');
      return NextResponse.json({ error: 'Service misconfigured' }, { status: 500 });
    }

    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== JOB_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const olderThanDays = body.olderThanDays || 30;

    // Run cleanup
    const deletedCount = await cleanupOldRecommendations(olderThanDays);

    // Refresh analytics view
    await refreshPerformanceView();

    return NextResponse.json({
      success: true,
      stats: {
        deleted: deletedCount,
        olderThanDays,
      },
    });
  } catch (error) {
    console.error('Cleanup job error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
