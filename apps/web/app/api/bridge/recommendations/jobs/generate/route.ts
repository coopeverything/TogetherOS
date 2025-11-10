/**
 * Background Job: Generate Recommendations
 * POST /api/bridge/recommendations/jobs/generate
 *
 * Triggers batch recommendation generation for active users
 * Should be called by cron job or scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendationsForActiveUsers } from '../../../../../../lib/bridge/recommendation-jobs';

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
    const batchSize = body.batchSize || 100;
    const maxBatches = body.maxBatches || 10;

    // Run job
    const result = await generateRecommendationsForActiveUsers(batchSize, maxBatches);

    return NextResponse.json({
      success: result.success,
      stats: {
        usersProcessed: result.usersProcessed,
        recommendationsGenerated: result.recommendationsGenerated,
        errors: result.errors,
        duration: `${result.duration}ms`,
      },
      errorSample: result.errorMessages,
    });
  } catch (error) {
    console.error('Job execution error:', error);
    return NextResponse.json(
      {
        error: 'Job execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
