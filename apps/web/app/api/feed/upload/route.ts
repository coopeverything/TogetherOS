// apps/web/app/api/feed/upload/route.ts
// POST /api/feed/upload - Upload images for feed posts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

// Upload directory (relative to apps/web/public)
const UPLOAD_DIR = 'uploads/feed'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload images.' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Limit number of files
    if (files.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 images allowed per post' },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    const uploadPath = path.join(process.cwd(), 'public', UPLOAD_DIR)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 5MB)`)
        continue
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Allowed: JPEG, PNG, GIF, WebP`)
        continue
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${uuidv4()}.${ext}`
      const filePath = path.join(uploadPath, filename)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Add URL to results
      uploadedUrls.push(`/${UPLOAD_DIR}/${filename}`)
    }

    // If no files were successfully uploaded
    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('POST /api/feed/upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500 }
    )
  }
}
