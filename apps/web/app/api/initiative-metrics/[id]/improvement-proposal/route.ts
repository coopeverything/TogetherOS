/**
 * Improvement Proposal API Endpoint
 * POST /api/initiative-metrics/[id]/improvement-proposal - Generate improvement proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getInitiativeMetrics,
  generateImprovementProposal,
} from '../../../../../../api/src/modules/metrics/handlers';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth(request);

    const { id } = await context.params;

    // Check if initiative metrics exist
    const existing = await getInitiativeMetrics(id);
    if (!existing) {
      return NextResponse.json({ error: 'Initiative metrics not found' }, { status: 404 });
    }

    // Generate improvement proposal
    const result = await generateImprovementProposal(id);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/initiative-metrics/[id]/improvement-proposal error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (message.includes('No proposal linked') || message.includes('Can only generate')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: message || 'Failed to generate improvement proposal' },
      { status: 400 }
    );
  }
}
