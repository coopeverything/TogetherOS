import { NextRequest, NextResponse } from 'next/server'
import { addOption, getProposalOptions, updateOption, deleteOption } from '../../../../../../api/src/modules/governance/handlers/optionHandlers'
import type { Tradeoff } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params
    const options = await getProposalOptions(proposalId)
    return NextResponse.json({ options })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch options'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params
    const body = await request.json()

    const { title, description, tradeoffs, proposedBy, estimatedCost, estimatedTime } = body

    if (!title || !description || !tradeoffs || !proposedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, tradeoffs, proposedBy' },
        { status: 400 }
      )
    }

    const option = await addOption({
      proposalId,
      title,
      description,
      tradeoffs: tradeoffs as Tradeoff[],
      proposedBy,
      estimatedCost,
      estimatedTime,
    })

    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add option'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get('optionId')
    const memberId = searchParams.get('memberId')

    if (!optionId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required parameters: optionId, memberId' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, tradeoffs, estimatedCost, estimatedTime } = body

    const updated = await updateOption(
      optionId,
      { title, description, tradeoffs, estimatedCost, estimatedTime },
      memberId
    )

    return NextResponse.json({ option: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update option'
    const status = message.includes('Unauthorized') ? 403 : message.includes('not found') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get('optionId')
    const memberId = searchParams.get('memberId')

    if (!optionId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required parameters: optionId, memberId' },
        { status: 400 }
      )
    }

    const deleted = await deleteOption(optionId, memberId)

    if (!deleted) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete option'
    const status = message.includes('Unauthorized') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
