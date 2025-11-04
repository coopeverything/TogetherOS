/**
 * Bridge Recommendations Endpoint
 * GET /api/bridge/recommendations
 *
 * Retrieves recommendations for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { recommendationRepo } from '../../../../../api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const minRelevance = searchParams.get('minRelevance');
    const limit = searchParams.get('limit');

    // Use authenticated user's ID
    const userId = user.id;

    // Get recommendations
    const recommendations = await recommendationRepo.getRecommendations({
      userId,
      status: status as any,
      type: type || undefined,
      minRelevance: minRelevance ? parseInt(minRelevance) : undefined,
      limit: limit ? parseInt(limit) : 10,
    });

    return NextResponse.json({
      userId,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
