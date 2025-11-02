/**
 * Delete Priority API
 * DELETE /api/feed/priorities/[topic]
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { topic: string } }
) {
  try {
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await query(
      'DELETE FROM priorities WHERE user_id = $1 AND topic = $2',
      [userId, params.topic]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete priority error:', error);
    return NextResponse.json(
      { error: 'Failed to delete priority' },
      { status: 500 }
    );
  }
}
