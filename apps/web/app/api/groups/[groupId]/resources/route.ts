// apps/web/app/api/groups/[groupId]/resources/route.ts
// Group resources API - Shared resource pool management

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getGroupResources,
  createGroupResource,
  updateGroupResource,
  deleteGroupResource,
} from '../../../../../../api/src/modules/groups/handlers'
import type { CreateGroupResourceInput } from '@togetheros/types/groups'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params

    const resources = await getGroupResources(groupId)
    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Failed to get group resources:', error)
    const message = error instanceof Error ? error.message : 'Failed to get resources'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { groupId } = await params
    const body = await request.json()

    const input: CreateGroupResourceInput = {
      groupId,
      name: body.name,
      description: body.description,
      resourceType: body.resourceType,
      quantity: body.quantity,
      unit: body.unit,
      availableFrom: body.availableFrom ? new Date(body.availableFrom) : undefined,
      availableUntil: body.availableUntil ? new Date(body.availableUntil) : undefined,
      tags: body.tags || [],
    }

    const resource = await createGroupResource(input, user.id)
    return NextResponse.json({ resource }, { status: 201 })
  } catch (error) {
    console.error('Failed to create group resource:', error)
    const message = error instanceof Error ? error.message : 'Failed to create resource'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    await requireAuth(request)
    await params // verify groupId exists
    const body = await request.json()

    if (!body.resourceId) {
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 })
    }

    const resource = await updateGroupResource(body.resourceId, {
      name: body.name,
      description: body.description,
      quantity: body.quantity,
      unit: body.unit,
    })
    return NextResponse.json({ resource })
  } catch (error) {
    console.error('Failed to update group resource:', error)
    const message = error instanceof Error ? error.message : 'Failed to update resource'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    await requireAuth(request)
    await params // verify groupId exists
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 })
    }

    await deleteGroupResource(resourceId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete group resource:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete resource'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
