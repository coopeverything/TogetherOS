/**
 * Complete Evaluation API Endpoint
 * POST /api/initiative-metrics/[id]/evaluate - Complete the evaluation
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getInitiativeMetrics,
  completeEvaluation,
} from '../../../../../../api/src/modules/metrics/handlers';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const { id } = await context.params;

    // Check if initiative metrics exist
    const existing = await getInitiativeMetrics(id);
    if (!existing) {
      return NextResponse.json({ error: 'Initiative metrics not found' }, { status: 404 });
    }

    // Complete the evaluation
    const result = await completeEvaluation(id, user.id);

    return NextResponse.json({ initiativeMetrics: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/initiative-metrics/[id]/evaluate error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (message.includes('No metrics defined')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: message || 'Failed to complete evaluation' },
      { status: 400 }
    );
  }
}
