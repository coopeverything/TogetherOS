/**
 * Individual Proposal API Endpoint
 * GET /api/proposals/:id - Get proposal by ID
 * PUT /api/proposals/:id - Update proposal
 * DELETE /api/proposals/:id - Soft delete proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getProposalById,
  updateProposal,
  deleteProposal,
} from '../../../../../api/src/modules/governance/handlers/crud';
import type { UpdateProposalInput } from '@togetheros/types/governance';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = await getProposalById(params.id);

    if (!proposal) {
      return NextResponse.json(
        { error: `Proposal with id '${params.id}' does not exist` },
        { status: 404 }
      );
    }

    return NextResponse.json({ proposal });
  } catch (error: any) {
    console.error(`GET /api/proposals/${params.id} error:`, error.message || 'Unknown error');
    return NextResponse.json(
      { error: error.message || 'Failed to get proposal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Check if proposal exists
    const existing = await getProposalById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: `Proposal with id '${params.id}' does not exist` },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the proposal author can update it' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updates: UpdateProposalInput = {
      title: body.title,
      summary: body.summary,
      status: body.status,
      minorityReport: body.minorityReport,
      decisionOutcome: body.decisionOutcome,
    };

    const proposal = await updateProposal(params.id, updates);

    return NextResponse.json({ proposal });
  } catch (error: any) {
    console.error(`PUT /api/proposals/${params.id} error:`, error.message || 'Unknown error');

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update proposal' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Check if proposal exists
    const existing = await getProposalById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: `Proposal with id '${params.id}' does not exist` },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the proposal author can delete it' },
        { status: 403 }
      );
    }

    await deleteProposal(params.id);

    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error: any) {
    console.error(`DELETE /api/proposals/${params.id} error:`, error.message || 'Unknown error');

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete proposal' },
      { status: 400 }
    );
  }
}
