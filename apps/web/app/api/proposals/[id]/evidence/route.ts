import { NextRequest, NextResponse } from 'next/server'
import { addEvidence, getProposalEvidence, deleteEvidence } from '../../../../../../api/src/modules/governance/handlers/evidenceHandlers'
import type { EvidenceType } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id
    const evidence = await getProposalEvidence(proposalId)
    return NextResponse.json({ evidence })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch evidence'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id
    const body = await request.json()

    const { type, title, summary, attachedBy, url } = body

    if (!type || !title || !summary || !attachedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, summary, attachedBy' },
        { status: 400 }
      )
    }

    const evidence = await addEvidence({
      proposalId,
      type: type as EvidenceType,
      title,
      summary,
      attachedBy,
      url,
    })

    return NextResponse.json({ evidence }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add evidence'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('evidenceId')
    const memberId = searchParams.get('memberId')

    if (!evidenceId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required parameters: evidenceId, memberId' },
        { status: 400 }
      )
    }

    const deleted = await deleteEvidence(evidenceId, memberId)

    if (!deleted) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete evidence'
    const status = message.includes('Unauthorized') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
