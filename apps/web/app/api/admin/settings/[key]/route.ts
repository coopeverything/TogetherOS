// apps/web/app/api/admin/settings/[key]/route.ts
// Admin Settings API - Get and update individual setting

import { NextRequest, NextResponse } from 'next/server'
import { getSetting, updateSetting, validateSettingValue } from '@togetheros/db'
import { updateSettingSchema } from '@togetheros/validators'

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
    const userId = 'admin-user-id' // TODO: Get from session
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
