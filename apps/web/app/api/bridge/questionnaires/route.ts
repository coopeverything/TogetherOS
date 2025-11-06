/**
 * Bridge Questionnaires API
 * GET /api/bridge/questionnaires - Get available questionnaires for user
 * POST /api/bridge/questionnaires - Submit questionnaire response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * GET /api/bridge/questionnaires
 * Returns questionnaires user hasn't completed yet, in sequence order
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement with PostgreSQL repo
    // For now, return mock data based on seeded questionnaires
    const questionnaires = [
      {
        id: crypto.randomUUID(),
        type: 'location',
        question: 'Where are you based?',
        description: 'Help us connect you with nearby cooperators',
        answerType: 'single_choice',
        options: [
          { value: 'city', label: 'City/Town' },
          { value: 'region', label: 'Region/State' },
          { value: 'country', label: 'Country' },
          { value: 'prefer_not_say', label: 'Prefer not to say' },
        ],
        sequenceNumber: 1,
        estimatedTimeSeconds: 30,
        rpReward: 10,
      },
      {
        id: crypto.randomUUID(),
        type: 'interests',
        question: 'Which cooperation paths interest you most?',
        description: 'Select all that apply',
        answerType: 'multiple_choice',
        options: [
          { value: 'collaborative-education', label: 'Collaborative Education' },
          { value: 'social-economy', label: 'Social Economy' },
          { value: 'common-wellbeing', label: 'Common Wellbeing' },
          { value: 'cooperative-technology', label: 'Cooperative Technology' },
          { value: 'collective-governance', label: 'Collective Governance' },
          { value: 'community-connection', label: 'Community Connection' },
          { value: 'collaborative-media-culture', label: 'Collaborative Media & Culture' },
          { value: 'common-planet', label: 'Common Planet' },
        ],
        sequenceNumber: 2,
        estimatedTimeSeconds: 60,
        rpReward: 10,
      },
    ];

    return NextResponse.json({
      userId: user.id,
      questionnaires,
      totalAvailable: 10,
      completedCount: 0,
    });
  } catch (error) {
    console.error('[Bridge Questionnaires API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaires' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bridge/questionnaires
 * Submit a questionnaire response
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionnaireId, questionnaireType, answer, startedAt } = body;

    // Validate input
    if (!questionnaireId || !questionnaireType || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: questionnaireId, questionnaireType, answer' },
        { status: 400 }
      );
    }

    // TODO: Implement with PostgreSQL repo
    // For now, return mock response
    const response = {
      id: crypto.randomUUID(),
      userId: user.id,
      questionnaireId,
      questionnaireType,
      answer,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date(),
      durationSeconds: 45, // Mock duration
      rpAwarded: 10,
    };

    return NextResponse.json({
      success: true,
      response,
      message: 'Questionnaire response submitted successfully',
    });
  } catch (error) {
    console.error('[Bridge Questionnaires API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit questionnaire response' },
      { status: 500 }
    );
  }
}
