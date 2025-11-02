/**
 * Evidence Verification API
 * PUT /api/feed/evidence/[evidenceId]/verify
 * Allows moderators to mark evidence as verified
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Check if user has moderator role

    const { verified } = await request.json();

    const result = await query(
      `UPDATE evidence
       SET verified = $1,
           verified_by = $2,
           verified_at = CASE WHEN $1 = TRUE THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [verified, userId, params.evidenceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Verify evidence error:', error);
    return NextResponse.json(
      { error: 'Failed to verify evidence' },
      { status: 500 }
    );
  }
}
