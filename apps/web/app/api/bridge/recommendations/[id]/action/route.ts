/**
 * Bridge Recommendation Action Endpoint
 * POST /api/bridge/recommendations/[id]/action
 *
 * Marks a recommendation as acted on or dismissed
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendationRepo } from '../../../../../../../api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, userId } = body;

    // Validate input
    if (!action || !['act', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "act" or "dismiss"' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get recommendation
    const recommendation = await recommendationRepo.getById(id);
    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (recommendation.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Take action
    if (action === 'act') {
      await recommendationRepo.markAsActedOn(id);
    } else {
      await recommendationRepo.markAsDismissed(id);
    }

    // Get updated recommendation
    const updated = await recommendationRepo.getById(id);

    return NextResponse.json({
      success: true,
      recommendation: updated,
    });
  } catch (error) {
    console.error('Error taking action on recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
