/**
 * Background Job: Generate Recommendations
 * POST /api/bridge/recommendations/jobs/generate
 *
 * Triggers batch recommendation generation for active users
 * Should be called by cron job or scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendationsForActiveUsers } from '../../../../../../lib/bridge/recommendation-jobs';

// Require API key for job endpoints
const JOB_API_KEY = process.env.JOB_API_KEY || 'dev-job-key';

export async function POST(request: NextRequest) {
  try {
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
