/**
 * Bridge Questionnaires API
 * GET /api/bridge/questionnaires - Get available questionnaires for user
 * POST /api/bridge/questionnaires - Submit questionnaire response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { PostgresQuestionnaireRepo } from '../../../../../api/src/modules/bridge-behavioral/repos';

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

    const repo = new PostgresQuestionnaireRepo();
    const [questionnaires, stats] = await Promise.all([
      repo.getIncompleteQuestionnaires(user.id),
      repo.getCompletionStats(user.id),
    ]);

    return NextResponse.json({
      userId: user.id,
      questionnaires,
      totalAvailable: stats.totalQuestionnaires,
      completedCount: stats.completedCount,
      completionPercentage: stats.completionPercentage,
      totalRPEarned: stats.totalRPEarned,
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

    const repo = new PostgresQuestionnaireRepo();

    // Get the questionnaire to determine RP reward
    const questionnaire = await repo.getQuestionnaireById(questionnaireId);
    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Create the response
    const response = await repo.createResponse({
      userId: user.id,
      questionnaireId,
      questionnaireType,
      answer,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date(),
      rpAwarded: questionnaire.rpReward,
    });

    // TODO: Trigger RP award event (integrate with RP economy system)

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
