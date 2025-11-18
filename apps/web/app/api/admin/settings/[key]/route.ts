// apps/web/app/api/admin/settings/[key]/route.ts
// Admin Settings API - Get and update individual setting

import { NextRequest, NextResponse } from 'next/server'
import { getSetting, updateSetting, validateSettingValue, deleteSetting } from '@togetheros/db'
import { updateSettingSchema } from '@togetheros/validators'
import { z } from 'zod'

const deleteSettingSchema = z.object({
  reason: z.string().min(10).max(500),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const setting = await getSetting(key)

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: setting })
  } catch (error) {
    console.error('Error fetching setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch setting' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // TODO: Add authentication check - only admins can update settings
    // const session = await getServerSession()
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const body = await request.json()
    const validated = updateSettingSchema.parse(body)

    // Validate value constraints
    const validation = await validateSettingValue(key, validated.value)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422 }
      )
    }

    // Get IP for audit log
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

    // Update setting (automatically creates audit entry)
    // TODO: Get userId from session when auth is implemented
    const userId = '2214caba-da2c-4a3c-88eb-1cba645ae90d' // System admin user
    const updated = await updateSetting(validated, userId, ip || undefined)

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Error updating setting:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // TODO: Add authentication check - only admins can delete settings
    // const session = await getServerSession()
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const body = await request.json()
    const validated = deleteSettingSchema.parse(body)

    // Get IP for audit log
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

    // Delete setting (automatically creates audit entry)
    // TODO: Get userId from session when auth is implemented
    const userId = '2214caba-da2c-4a3c-88eb-1cba645ae90d' // System admin user
    await deleteSetting(key, userId, validated.reason, ip || undefined)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting setting:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 422 }
      )
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete setting' },
      { status: 500 }
    )
  }
}
