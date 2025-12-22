import { NextRequest, NextResponse } from 'next/server'
import { addOption, getProposalOptions, updateOption, deleteOption } from '../../../../../../api/src/modules/governance/handlers/optionHandlers'
import { requireAuth } from '@/lib/auth/middleware'
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
    // Require authentication
    const user = await requireAuth(request)
    const { id: proposalId } = await params
    const body = await request.json()

    const { title, description, tradeoffs, estimatedCost, estimatedTime } = body

    if (!title || !description || !tradeoffs) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, tradeoffs' },
        { status: 400 }
      )
    }

    // Use authenticated user ID instead of request body
    const option = await addOption({
      proposalId,
      title,
      description,
      tradeoffs: tradeoffs as Tradeoff[],
      proposedBy: user.id,
      estimatedCost,
      estimatedTime,
    })

    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add option'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get('optionId')

    if (!optionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: optionId' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, tradeoffs, estimatedCost, estimatedTime } = body

    // Use authenticated user ID instead of spoofable query param
    const updated = await updateOption(
      optionId,
      { title, description, tradeoffs, estimatedCost, estimatedTime },
      user.id
    )

    return NextResponse.json({ option: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update option'
    const status = message === 'Unauthorized' ? 401 : message.includes('Unauthorized') ? 403 : message.includes('not found') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get('optionId')

    if (!optionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: optionId' },
        { status: 400 }
      )
    }

    // Use authenticated user ID instead of spoofable query param
    const deleted = await deleteOption(optionId, user.id)

    if (!deleted) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete option'
    const status = message === 'Unauthorized' ? 401 : message.includes('Unauthorized') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
