import { NextRequest, NextResponse } from 'next/server'
import { addEvidence, getProposalEvidence, deleteEvidence } from '../../../../../../api/src/modules/governance/handlers/evidenceHandlers'
import { requireAuth } from '@/lib/auth/middleware'
import type { EvidenceType } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params
    const evidence = await getProposalEvidence(proposalId)
    return NextResponse.json({ evidence })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch evidence'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    const { id: proposalId } = await params
    const body = await request.json()

    const { type, title, summary, url } = body

    if (!type || !title || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, summary' },
        { status: 400 }
      )
    }

    // Use authenticated user ID instead of request body
    const evidence = await addEvidence({
      proposalId,
      type: type as EvidenceType,
      title,
      summary,
      attachedBy: user.id,
      url,
    })

    return NextResponse.json({ evidence }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add evidence'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('evidenceId')

    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Missing required parameter: evidenceId' },
        { status: 400 }
      )
    }

    // Use authenticated user ID instead of spoofable query param
    const deleted = await deleteEvidence(evidenceId, user.id)

    if (!deleted) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete evidence'
    const status = message === 'Unauthorized' ? 401 : message.includes('Unauthorized') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
