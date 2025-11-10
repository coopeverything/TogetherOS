/**
 * Bridge Microlessons API
 * GET /api/bridge/microlessons - Get available microlessons
 * POST /api/bridge/microlessons - Record microlesson completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * GET /api/bridge/microlessons
 * Returns available microlessons (60-90 second learning modules)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const cooperationPath = searchParams.get('cooperationPath');

    // TODO: Implement with PostgreSQL repo
    // For now, return mock microlessons
    const microlessons = [
      {
        id: crypto.randomUUID(),
        title: 'Consensus Building 101',
        topic: 'consensus-building',
        cooperationPath: 'collective-governance',
        content: {
          intro: 'Consensus means everyone consents to a decision, not that everyone loves it.',
          keyPoint1: 'Seek consent, not unanimous agreement',
          keyPoint2: 'Address objections with amendments',
          keyPoint3: 'Document minority reports for transparency',
          callToAction: 'Try proposing something in your group using consent-based decision making',
        },
        estimatedTimeSeconds: 75,
        difficulty: 'beginner',
        rpReward: 15,
      },
      {
        id: crypto.randomUUID(),
        title: 'Recognizing Confirmation Bias',
        topic: 'bias-awareness',
        cooperationPath: 'collective-governance',
        content: {
          intro: 'We tend to seek information that confirms our existing beliefs.',
          keyPoint1: 'Actively seek out opposing viewpoints',
          keyPoint2: 'Ask "What would change my mind?"',
          keyPoint3: 'Practice steel-manning (arguing the strongest version of opposing views)',
          callToAction: 'Before your next decision, list 3 reasons why you might be wrong',
        },
        estimatedTimeSeconds: 80,
        difficulty: 'intermediate',
        rpReward: 15,
      },
    ];

    // Filter by topic or cooperation path if provided
    const filtered = microlessons.filter((m) => {
      if (topic && m.topic !== topic) return false;
      if (cooperationPath && m.cooperationPath !== cooperationPath) return false;
      return true;
    });

    return NextResponse.json({
      userId: user.id,
      microlessons: filtered,
      totalAvailable: filtered.length,
    });
  } catch (error) {
    console.error('[Bridge Microlessons API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch microlessons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bridge/microlessons
 * Record microlesson completion
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { microlessonId, viewedAt, completedAt } = body;

    if (!microlessonId) {
      return NextResponse.json(
        { error: 'Missing required field: microlessonId' },
        { status: 400 }
      );
    }

    // TODO: Implement with PostgreSQL repo
    const response = {
      id: crypto.randomUUID(),
      userId: user.id,
      contentType: 'microlesson',
      contentId: microlessonId,
      viewedAt: viewedAt ? new Date(viewedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      rpAwarded: 15,
    };

    return NextResponse.json({
      success: true,
      response,
      message: 'Microlesson completion recorded',
    });
  } catch (error) {
    console.error('[Bridge Microlessons API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record microlesson completion' },
      { status: 500 }
    );
  }
}
