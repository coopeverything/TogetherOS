/**
 * Bridge Recommendations Endpoint
 * GET /api/bridge/recommendations
 *
 * Retrieves recommendations for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendationRepo } from '../../../../../api/src/modules/bridge-recommendations/repos/InMemoryRecommendationRepo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const minRelevance = searchParams.get('minRelevance');
    const limit = searchParams.get('limit');

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

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
