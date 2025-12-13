/**
 * Proposals API Endpoint
 * POST /api/proposals - Create new proposal
 * GET /api/proposals - List proposals with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createProposal,
  listProposals,
  type CreateProposalInput,
  type ListProposalsFilter,
} from '@togetheros/db';
import { reputationService } from '@/lib/services/ReputationService';
import { indexProposal } from '@/lib/bridge/content-indexer';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.summary || !body.scopeType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, scopeType' },
        { status: 400 }
      );
    }

    // For individual proposals, scopeId must equal authorId
    // For group proposals, scopeId must be provided
    let scopeId: string;
    if (body.scopeType === 'individual') {
      scopeId = user.id; // Always use authenticated user's ID
    } else if (body.scopeType === 'group') {
      if (!body.scopeId) {
        return NextResponse.json(
          { error: 'scopeId is required for group proposals' },
          { status: 400 }
        );
      }
      scopeId = body.scopeId;
    } else {
      return NextResponse.json(
        { error: 'Invalid scopeType. Must be "individual" or "group"' },
        { status: 400 }
      );
    }

    // Set author to authenticated user
    const input: CreateProposalInput = {
      scopeType: body.scopeType,
      scopeId,
      authorId: user.id,
      title: body.title,
      summary: body.summary,
    };

    const proposal = await createProposal(input);

    // Index proposal for Bridge RAG (non-blocking)
    indexProposal(proposal.id, {
      title: proposal.title,
      summary: proposal.summary,
      description: proposal.description || undefined,
      authorId: user.id,
      createdAt: proposal.createdAt,
    }).catch((err: unknown) => console.error('Failed to index proposal:', err));

    // Check and award proposal-related badges
    try {
      await reputationService.checkProposalBadges(user.id);
    } catch (badgeError) {
      // Don't fail the request if badge check fails
      console.error('Badge check failed:', badgeError);
    }

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/proposals error:', error.message || 'Unknown error');

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create proposal' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: ListProposalsFilter = {
      scopeType: searchParams.get('scopeType') as any,
      scopeId: searchParams.get('scopeId') || undefined,
      status: searchParams.get('status') as any,
      authorId: searchParams.get('authorId') || undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const result = await listProposals(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/proposals error:', error.message || 'Unknown error');
    return NextResponse.json(
      { error: error.message || 'Failed to list proposals' },
      { status: 500 }
    );
  }
}
