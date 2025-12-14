/**
 * Individual Timebank Service API
 * GET /api/timebank/services/[id] - Get service details
 * PATCH /api/timebank/services/[id] - Update service
 * DELETE /api/timebank/services/[id] - Deactivate service
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface TimebankServiceRow {
  id: string;
  member_id: string;
  service_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  images: string | null;
  tbc_per_hour: number;
  availability: string | null;
  location_preference: string | null;
  city_id: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  provider_name?: string;
  provider_email?: string;
  provider_avatar_url?: string | null;
  provider_avg_rating?: number;
  provider_total_reviews?: number;
  provider_badges?: string;
}

interface UpdateServiceRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  tbcPerHour?: number;
  availability?: string;
  locationPreference?: 'remote' | 'in_person' | 'both';
  cityId?: string;
  active?: boolean;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/timebank/services/[id] - Get service details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const result = await query<TimebankServiceRow>(
      `SELECT s.*,
              u.name as provider_name,
              u.email as provider_email,
              u.avatar_url as provider_avatar_url,
              COALESCE(ps.avg_rating, 0) as provider_avg_rating,
              COALESCE(ps.total_reviews, 0) as provider_total_reviews,
              COALESCE(ps.badges, '[]'::jsonb)::text as provider_badges
       FROM timebank_services s
       JOIN users u ON s.member_id = u.id
       LEFT JOIN timebank_provider_stats ps ON s.member_id = ps.member_id
       WHERE s.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = result.rows[0];

    // Parse badges from JSON string
    let badges: string[] = [];
    try {
      badges = service.provider_badges ? JSON.parse(service.provider_badges) : [];
    } catch {
      badges = [];
    }

    return NextResponse.json({
      service: {
        id: service.id,
        memberId: service.member_id,
        serviceType: service.service_type,
        title: service.title,
        description: service.description,
        imageUrl: service.image_url,
        tbcPerHour: Number(service.tbc_per_hour),
        availability: service.availability,
        locationPreference: service.location_preference,
        cityId: service.city_id,
        active: service.active,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
        provider: {
          id: service.member_id,
          name: service.provider_name,
          email: service.provider_email,
          avatarUrl: service.provider_avatar_url,
          avgRating: Number(service.provider_avg_rating) || 0,
          totalReviews: Number(service.provider_total_reviews) || 0,
          badges,
        },
      },
    });
  } catch (error) {
    console.error('Get timebank service error:', error);
    return NextResponse.json(
      { error: 'Failed to get service' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/timebank/services/[id] - Update service
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;
    const body = (await request.json()) as UpdateServiceRequest;

    // Check ownership
    const existing = await query<TimebankServiceRow>(
      `SELECT * FROM timebank_services WHERE id = $1`,
      [id]
    );

    if (!existing.rows[0]) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (existing.rows[0].member_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate pricing if provided
    if (body.tbcPerHour !== undefined) {
      if (body.tbcPerHour < 1 || body.tbcPerHour > 10) {
        return NextResponse.json(
          { error: 'tbcPerHour must be between 1 and 10' },
          { status: 400 }
        );
      }
    }

    // Build update query
    const updates: string[] = [];
    const params: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(body.title);
      paramIndex++;
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(body.description);
      paramIndex++;
    }

    if (body.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex}`);
      params.push(body.imageUrl || null);
      paramIndex++;
    }

    if (body.tbcPerHour !== undefined) {
      updates.push(`tbc_per_hour = $${paramIndex}`);
      params.push(body.tbcPerHour);
      paramIndex++;
    }

    if (body.availability !== undefined) {
      updates.push(`availability = $${paramIndex}`);
      params.push(body.availability);
      paramIndex++;
    }

    if (body.locationPreference !== undefined) {
      updates.push(`location_preference = $${paramIndex}`);
      params.push(body.locationPreference);
      paramIndex++;
    }

    if (body.cityId !== undefined) {
      updates.push(`city_id = $${paramIndex}`);
      params.push(body.cityId || null);
      paramIndex++;
    }

    if (body.active !== undefined) {
      updates.push(`active = $${paramIndex}`);
      params.push(body.active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query<TimebankServiceRow>(
      `UPDATE timebank_services SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    const service = result.rows[0];

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        memberId: service.member_id,
        serviceType: service.service_type,
        title: service.title,
        description: service.description,
        imageUrl: service.image_url,
        tbcPerHour: Number(service.tbc_per_hour),
        availability: service.availability,
        locationPreference: service.location_preference,
        cityId: service.city_id,
        active: service.active,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      },
    });
  } catch (error) {
    console.error('Update timebank service error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timebank/services/[id] - Deactivate service (soft delete)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;

    // Check ownership
    const existing = await query<TimebankServiceRow>(
      `SELECT * FROM timebank_services WHERE id = $1`,
      [id]
    );

    if (!existing.rows[0]) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (existing.rows[0].member_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by setting active = false
    await query(
      `UPDATE timebank_services SET active = FALSE, updated_at = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Service deactivated',
    });
  } catch (error) {
    console.error('Delete timebank service error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
