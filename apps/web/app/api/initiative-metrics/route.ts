/**
 * Initiative Metrics API Endpoint
 * POST /api/initiative-metrics - Create initiative metrics
 * GET /api/initiative-metrics - List initiative metrics with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createInitiativeMetrics,
  listInitiativeMetrics,
} from '../../../../api/src/modules/metrics/handlers';
import type { EvaluationSchedule } from '@togetheros/types';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.evaluationSchedule || !body.metrics || !Array.isArray(body.metrics)) {
      return NextResponse.json(
        { error: 'Missing required fields: evaluationSchedule, metrics' },
        { status: 400 }
      );
    }

    // Require either proposalId or initiativeId
    if (!body.proposalId && !body.initiativeId) {
      return NextResponse.json(
        { error: 'Either proposalId or initiativeId is required' },
        { status: 400 }
      );
    }

    const result = await createInitiativeMetrics({
      proposalId: body.proposalId,
      initiativeId: body.initiativeId,
      evaluationSchedule: body.evaluationSchedule as EvaluationSchedule,
      customEvaluationDate: body.customEvaluationDate
        ? new Date(body.customEvaluationDate)
        : undefined,
      metrics: body.metrics,
      createdBy: user.id,
    });

    return NextResponse.json({ initiativeMetrics: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Sanitize error message for logging (prevent log injection)
    const sanitizedError = message.replace(/[\r\n]/g, ' ').substring(0, 200);
    console.error('POST /api/initiative-metrics error:', sanitizedError);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message || 'Failed to create initiative metrics' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      proposalId: searchParams.get('proposalId') || undefined,
      initiativeId: searchParams.get('initiativeId') || undefined,
      status: searchParams.get('status') as any || undefined,
      overallOutcome: searchParams.get('overallOutcome') as any || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    // Parse date range
    const evaluationDateFrom = searchParams.get('evaluationDateFrom');
    const evaluationDateTo = searchParams.get('evaluationDateTo');
    if (evaluationDateFrom || evaluationDateTo) {
      (filters as any).evaluationDateRange = {
        from: evaluationDateFrom ? new Date(evaluationDateFrom) : undefined,
        to: evaluationDateTo ? new Date(evaluationDateTo) : undefined,
      };
    }

    const result = await listInitiativeMetrics(filters);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Sanitize error message for logging (prevent log injection)
    const sanitizedError = message.replace(/[\r\n]/g, ' ').substring(0, 200);
    console.error('GET /api/initiative-metrics error:', sanitizedError);
    return NextResponse.json(
      { error: message || 'Failed to list initiative metrics' },
      { status: 500 }
    );
  }
}
