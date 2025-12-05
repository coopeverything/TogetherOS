/**
 * Measurements API Endpoint
 * POST /api/initiative-metrics/[id]/measurements - Enter measurement for a metric
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getInitiativeMetrics,
  enterMeasurement,
} from '../../../../../../api/src/modules/metrics/handlers';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth(request);

    const { id } = await context.params;
    const body = await request.json();

    // Validate required fields
    if (!body.metricId || !body.actualValue) {
      return NextResponse.json(
        { error: 'Missing required fields: metricId, actualValue' },
        { status: 400 }
      );
    }

    // Check if initiative metrics exist
    const existing = await getInitiativeMetrics(id);
    if (!existing) {
      return NextResponse.json({ error: 'Initiative metrics not found' }, { status: 404 });
    }

    // Verify the metric belongs to this initiative metrics
    const metricBelongsToInitiative = existing.metrics?.some(m => m.id === body.metricId);
    if (!metricBelongsToInitiative) {
      return NextResponse.json(
        { error: 'Metric does not belong to this initiative metrics' },
        { status: 400 }
      );
    }

    // Enter the measurement
    const result = await enterMeasurement(body.metricId, {
      actualValue: body.actualValue,
      notes: body.notes,
    });

    return NextResponse.json({ metric: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/initiative-metrics/[id]/measurements error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message || 'Failed to enter measurement' },
      { status: 400 }
    );
  }
}
