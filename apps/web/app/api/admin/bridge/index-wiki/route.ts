/**
 * Admin API: Index Wiki Content for Bridge RAG
 * POST /api/admin/bridge/index-wiki
 *
 * Indexes all wiki articles from static data into the Bridge content index.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { indexAllWikiArticles } from '@/lib/bridge/content-indexer';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request);

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Index all wiki articles
    const result = await indexAllWikiArticles();

    return NextResponse.json({
      success: true,
      indexed: result.indexed,
      errors: result.errors,
      message: `Indexed ${result.indexed} wiki articles for Bridge RAG`,
    });
  } catch (error: unknown) {
    console.error('Error indexing wiki:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to index wiki content' },
      { status: 500 }
    );
  }
}
