/**
 * Bridge Recommendations Generate Endpoint
 * POST /api/bridge/recommendations/generate
 *
 * Generates personalized recommendations for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchUserContext, fetchCityContext } from '../../../../../lib/bridge/context-service';
import { generateRecommendations } from '../../../../../lib/bridge/recommendation-generator';
import { recommendationRepo } from '../../../../../../api/src/modules/bridge-recommendations/repos/InMemoryRecommendationRepo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, maxRecommendations = 5 } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

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
