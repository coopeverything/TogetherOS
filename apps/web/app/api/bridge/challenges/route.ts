/**
 * Bridge Bias Challenges API
 * GET /api/bridge/challenges - Get available bias challenges
 * POST /api/bridge/challenges - Submit challenge response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * GET /api/bridge/challenges
 * Returns available bias challenges (interactive exercises)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const biasType = searchParams.get('biasType');

    // TODO: Implement with PostgreSQL repo
    // For now, return mock challenges
    const challenges = [
      {
        id: crypto.randomUUID(),
        title: 'Spot the Confirmation Bias',
        biasType: 'confirmation',
        scenario:
          'You believe your local government is corrupt. You see a news article about a city official getting a parking ticket. What do you think?',
        question: 'Which response demonstrates confirmation bias?',
        options: [
          {
            value: 'A',
            label: 'This proves the whole government is corrupt!',
            feedback:
              'This is confirmation bias - using minor evidence to confirm pre-existing belief',
            isBiased: true,
          },
          {
            value: 'B',
            label: 'This is just a parking ticket, not evidence of corruption',
            feedback:
              'Correct - recognizing that minor evidence does not prove broader claims',
            isBiased: false,
          },
          {
            value: 'C',
            label: 'I need more evidence before drawing conclusions',
            feedback: 'Good approach - seeking more data before confirming beliefs',
            isBiased: false,
          },
        ],
        correctAnswer: 'A',
        explanation:
          'Confirmation bias leads us to interpret neutral or minor evidence as supporting our pre-existing beliefs. Good decision-making requires distinguishing between genuine evidence and noise.',
        rpReward: 20,
        rpBonus: 10,
      },
      {
        id: crypto.randomUUID(),
        title: 'Groupthink Detector',
        biasType: 'groupthink',
        scenario:
          'Your team is excited about a new project. One person raises concerns about timeline. The group quickly dismisses them. What should you do?',
        question: 'Which response avoids groupthink?',
        options: [
          {
            value: 'A',
            label: 'Go along with the group - they probably know best',
            feedback:
              'This is groupthink - suppressing dissent to maintain harmony',
            isBiased: true,
          },
          {
            value: 'B',
            label: 'Ask the dissenter to elaborate on their concerns',
            feedback:
              'Correct - actively seeking out minority viewpoints prevents groupthink',
            isBiased: false,
          },
          {
            value: 'C',
            label: 'Suggest a vote to settle it quickly',
            feedback:
              'Voting too quickly can suppress important concerns that need discussion',
            isBiased: true,
          },
        ],
        correctAnswer: 'B',
        explanation:
          'Groupthink happens when groups prioritize harmony over critical thinking. The best defense is actively seeking out and engaging with dissenting views.',
        rpReward: 20,
        rpBonus: 10,
      },
    ];

    // Filter by bias type if provided
    const filtered = challenges.filter((c) => {
      if (biasType && c.biasType !== biasType) return false;
      return true;
    });

    return NextResponse.json({
      userId: user.id,
      challenges: filtered,
      totalAvailable: filtered.length,
    });
  } catch (error) {
    console.error('[Bridge Challenges API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bridge/challenges
 * Submit challenge response
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, answer, viewedAt, completedAt } = body;

    if (!challengeId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: challengeId, answer' },
        { status: 400 }
      );
    }

    // TODO: Implement with PostgreSQL repo
    // For now, mock validation
    const isCorrect = answer === 'B'; // Mock - should check against DB

    const rpAwarded = isCorrect ? 30 : 20; // Base + bonus if correct

    const response = {
      id: crypto.randomUUID(),
      userId: user.id,
      contentType: 'bias_challenge',
      contentId: challengeId,
      viewedAt: viewedAt ? new Date(viewedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      response: {
        answer,
        correct: isCorrect,
        feedback: isCorrect
          ? 'Correct! You successfully identified the bias.'
          : 'Not quite, but good effort! Review the explanation.',
      },
      rpAwarded,
    };

    return NextResponse.json({
      success: true,
      response,
      correct: isCorrect,
      message: isCorrect
        ? 'Challenge completed successfully!'
        : 'Challenge completed. Review the explanation to learn more.',
    });
  } catch (error) {
    console.error('[Bridge Challenges API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge response' },
      { status: 500 }
    );
  }
}
