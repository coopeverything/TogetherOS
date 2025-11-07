/**
 * Onboarding Progress API
 * GET /api/onboarding/progress - Get user's onboarding progress
 * POST /api/onboarding/progress - Update onboarding step
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import {
  getOnboardingProgress,
  updateOnboardingStep,
  completeOnboarding,
} from '../../../../../../api/src/services/bridge/OnboardingService';

/**
 * GET /api/onboarding/progress
 * Returns user's onboarding progress and next steps
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await getOnboardingProgress(user.id);

    // Auto-complete if criteria met but not yet marked complete
    if (progress.isComplete && !progress.completedAt) {
      await completeOnboarding(user.id);
      // Refresh progress
      const updatedProgress = await getOnboardingProgress(user.id);
      return NextResponse.json(updatedProgress);
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('[Onboarding Progress API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding/progress
 * Update user's current onboarding step
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { step, action } = body;

    if (action === 'complete') {
      // Attempt to mark onboarding as complete
      try {
        await completeOnboarding(user.id);
        return NextResponse.json({
          success: true,
          message: 'Onboarding completed!',
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Cannot complete onboarding yet' },
          { status: 400 }
        );
      }
    }

    if (!step) {
      return NextResponse.json(
        { error: 'Missing required field: step' },
        { status: 400 }
      );
    }

    await updateOnboardingStep(user.id, step);

    // Return updated progress
    const progress = await getOnboardingProgress(user.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('[Onboarding Progress API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}
