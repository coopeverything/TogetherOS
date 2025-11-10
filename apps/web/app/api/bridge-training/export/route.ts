/**
 * Export Training Data API
 * GET /api/bridge-training/export?format=csv|json
 *
 * Exports training examples in specified format
 */

import { NextRequest, NextResponse } from 'next/server';
import { listTrainingExamples } from '../../../../../api/src/modules/bridge-training/handlers';
import { requireAdmin } from '@/lib/auth/middleware';
import type { BridgeTrainingExample } from '@togetheros/types';

/**
 * Convert training examples to CSV format
 */
function convertToCSV(examples: BridgeTrainingExample[]): string {
  if (examples.length === 0) {
    return 'No data to export';
  }

  // CSV headers
  const headers = [
    'ID',
    'Question',
    'Context Path',
    'Category',
    'Bridge Response',
    'Bridge Model',
    'Helpfulness Rating',
    'Accuracy Rating',
    'Tone Rating',
    'Quality Score',
    'Ideal Response',
    'Training Status',
    'Reviewed By',
    'Reviewed At',
    'Review Notes',
    'Created By',
    'Created At',
    'Updated At',
  ];

  // CSV rows
  const rows = examples.map((ex) => [
    ex.id,
    `"${ex.question.replace(/"/g, '""')}"`, // Escape quotes
    ex.contextPath || '',
    ex.questionCategory || '',
    `"${ex.bridgeResponse.replace(/"/g, '""')}"`,
    ex.bridgeModel,
    ex.helpfulnessRating ?? '',
    ex.accuracyRating ?? '',
    ex.toneRating ?? '',
    ex.qualityScore ?? '',
    ex.idealResponse ? `"${ex.idealResponse.replace(/"/g, '""')}"` : '',
    ex.trainingStatus,
    ex.reviewedBy || '',
    ex.reviewedAt ? new Date(ex.reviewedAt).toISOString() : '',
    ex.reviewNotes ? `"${ex.reviewNotes.replace(/"/g, '""')}"` : '',
    ex.createdBy,
    new Date(ex.createdAt).toISOString(),
    new Date(ex.updatedAt).toISOString(),
  ]);

  // Combine headers and rows
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * GET /api/bridge-training/export
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Validate format
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "json".' },
        { status: 400 }
      );
    }

    // Fetch all training examples (no pagination for export)
    const result = await listTrainingExamples({
      page: 1,
      pageSize: 10000, // Large page size to get all examples
    });

    if (format === 'csv') {
      const csv = convertToCSV(result.items);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bridge-training-export-${Date.now()}.csv"`,
        },
      });
    }

    // JSON format
    return new NextResponse(JSON.stringify(result.items, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bridge-training-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Export training data error:', error);
    return NextResponse.json(
      { error: 'Failed to export training data' },
      { status: 500 }
    );
  }
}
