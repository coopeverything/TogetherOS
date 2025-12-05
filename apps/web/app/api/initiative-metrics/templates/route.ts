/**
 * Metric Templates API Endpoint
 * GET /api/initiative-metrics/templates - List templates
 * POST /api/initiative-metrics/templates - Use a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  listTemplates,
  getTemplate,
  useTemplate,
} from '../../../../../api/src/modules/metrics/handlers';
import type { EvaluationSchedule } from '@togetheros/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const templates = await listTemplates(category);

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/initiative-metrics/templates error:', message);
    return NextResponse.json(
      { error: message || 'Failed to list templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.templateId || !body.proposalId) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, proposalId' },
        { status: 400 }
      );
    }

    // Check template exists
    const template = await getTemplate(body.templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Use the template
    const result = await useTemplate(
      body.templateId,
      body.proposalId,
      user.id,
      (body.evaluationSchedule as EvaluationSchedule) || '30-days'
    );

    return NextResponse.json({ initiativeMetrics: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/initiative-metrics/templates error:', message);

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: message || 'Failed to use template' },
      { status: 400 }
    );
  }
}
