/**
 * Bridge Proposal Similarity Check API
 * Detects similar proposals using OpenAI embeddings and pgvector
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkSimilarity } from '../../../../../../api/src/services/bridge/SimilarityDetector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, scopeType, scopeId, excludeProposalId } = body;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: title' },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: summary' },
        { status: 400 }
      );
    }

    if (!scopeType || !['individual', 'group'].includes(scopeType)) {
      return NextResponse.json(
        { error: 'scopeType must be "individual" or "group"' },
        { status: 400 }
      );
    }

    if (!scopeId || typeof scopeId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: scopeId' },
        { status: 400 }
      );
    }

    // Check for similar proposals
    const result = await checkSimilarity({
      title,
      summary,
      scopeType,
      scopeId,
      excludeProposalId,
    });

    return NextResponse.json({
      similarProposals: result.similarProposals,
      requiresClarification: result.requiresClarification,
      highestSimilarity: result.highestSimilarity,
      message: result.requiresClarification
        ? 'High similarity detected. Please clarify how your proposal differs.'
        : result.similarProposals.length > 0
        ? 'Similar proposals found. Review for potential duplication.'
        : 'No similar proposals found.',
    });
  } catch (error) {
    console.error('Similarity check error:', error);

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('OpenAI API error')) {
      return NextResponse.json(
        { error: 'Failed to generate embedding. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check similarity' },
      { status: 500 }
    );
  }
}
