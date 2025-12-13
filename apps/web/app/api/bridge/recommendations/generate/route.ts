/**
 * Bridge Recommendations Generate Endpoint
 * POST /api/bridge/recommendations/generate
 *
 * Generates personalized recommendations for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { fetchUserContext, fetchCityContext } from '@web/bridge/context-service';
import { generateRecommendations } from '@web/bridge/recommendation-generator';
import { recommendationRepo } from '../../../../../../api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { maxRecommendations = 5 } = body;

    // Use authenticated user's ID
    const userId = user.id;

    // Fetch user and city context
    const userContext = await fetchUserContext({ userId });
    const cityContext = await fetchCityContext({
      city: userContext.city,
      region: userContext.region,
    });

    // Generate recommendations
    const recommendations = await generateRecommendations(
      userContext,
      cityContext,
      maxRecommendations
    );

    // Save to repository
    await recommendationRepo.saveRecommendations(recommendations);

    return NextResponse.json({
      userId,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
