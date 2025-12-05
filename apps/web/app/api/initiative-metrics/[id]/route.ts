/**
 * Single Initiative Metrics API Endpoint
 * GET /api/initiative-metrics/[id] - Get initiative metrics by ID
 * PUT /api/initiative-metrics/[id] - Update initiative metrics
 * DELETE /api/initiative-metrics/[id] - Delete initiative metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getInitiativeMetrics,
  updateInitiativeMetrics,
  deleteInitiativeMetrics,
} from '../../../../../api/src/modules/metrics/handlers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const initiativeMetrics = await getInitiativeMetrics(id);

    if (!initiativeMetrics) {
      return NextResponse.json({ error: 'Initiative metrics not found' }, { status: 404 });
    }

    return NextResponse.json({ initiativeMetrics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/initiative-metrics/[id] error:', message);

    if (message.includes('Invalid initiative metrics ID format')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: message || 'Failed to get initiative metrics' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth(request);

    const { id } = await context.params;
    const body = await request.json();

    // Check if initiative metrics exist
    const existing = await getInitiativeMetrics(id);
    if (!existing) {
      return NextResponse.json({ error: 'Initiative metrics not found' }, { status: 404 });
    }

    // Build updates object
    const updates: Record<string, unknown> = {};
    if (body.evaluationSchedule) updates.evaluationSchedule = body.evaluationSchedule;
    if (body.evaluationDate) updates.evaluationDate = new Date(body.evaluationDate);
    if (body.reminderDate) updates.reminderDate = new Date(body.reminderDate);
    if (body.status) updates.status = body.status;

    const result = await updateInitiativeMetrics(id, updates);

    return NextResponse.json({ initiativeMetrics: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PUT /api/initiative-metrics/[id] error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message || 'Failed to update initiative metrics' },
      { status: 400 }
    );
  }
}

export async function DELETE(
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

    await deleteInitiativeMetrics(id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DELETE /api/initiative-metrics/[id] error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message || 'Failed to delete initiative metrics' },
      { status: 400 }
    );
  }
}
