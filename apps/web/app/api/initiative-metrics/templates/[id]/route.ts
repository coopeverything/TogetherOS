/**
 * Single Template API Endpoint
 * GET /api/initiative-metrics/templates/[id] - Get template by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTemplate } from '../../../../../../api/src/modules/metrics/handlers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const template = await getTemplate(id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/initiative-metrics/templates/[id] error:', message);
    return NextResponse.json(
      { error: message || 'Failed to get template' },
      { status: 500 }
    );
  }
}
