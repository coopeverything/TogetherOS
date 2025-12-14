/**
 * Timebank Services API
 * GET /api/timebank/services - Browse available services
 * POST /api/timebank/services - List a new service offering
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
  tbc_per_hour: number;
  availability: string | null;
  location_preference: string | null;
  city_id: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  provider_name?: string;
  provider_email?: string;
  provider_avatar_url?: string | null;
  provider_avg_rating?: number;
  provider_total_reviews?: number;
  provider_badges?: string;
}

interface CreateServiceRequest {
  serviceType: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tbcPerHour: number;
  availability?: string;
  locationPreference?: 'remote' | 'in_person' | 'both';
  cityId?: string;
}

// Valid service types
const VALID_SERVICE_TYPES = [
  'tutoring',
  'massage',
  'repair',
  'medical',
  'childcare',
  'transport',
  'mentoring',
  'gardening',
  'cooking',
  'cleaning',
  'tech_support',
  'translation',
  'legal',
  'accounting',
  'counseling',
  'fitness',
  'art',
  'music',
  'photography',
  'writing',
  'other',
];

/**
 * GET /api/timebank/services - Browse available services
 */
export async function GET(request: NextRequest) {
  try {
    // Services are publicly browsable (auth optional for filtering own services)
    const user = await getCurrentUser(request);

    const url = new URL(request.url);
    const serviceType = url.searchParams.get('type');
    const location = url.searchParams.get('location');
    const cityId = url.searchParams.get('cityId');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const providerId = url.searchParams.get('providerId');
    const myServices = url.searchParams.get('myServices') === 'true';
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);
    const offset = Number(url.searchParams.get('offset')) || 0;

    // Build query with filters
    let queryText = `
      SELECT s.*,
             u.name as provider_name,
             u.email as provider_email,
             u.avatar_url as provider_avatar_url,
             COALESCE(ps.avg_rating, 0) as provider_avg_rating,
             COALESCE(ps.total_reviews, 0) as provider_total_reviews,
             COALESCE(ps.badges, '[]'::jsonb)::text as provider_badges
      FROM timebank_services s
      JOIN users u ON s.member_id = u.id
      LEFT JOIN timebank_provider_stats ps ON s.member_id = ps.member_id
      WHERE s.active = TRUE
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (serviceType) {
      queryText += ` AND s.service_type = $${paramIndex}`;
      params.push(serviceType);
      paramIndex++;
    }

    if (location) {
      queryText += ` AND (s.location_preference = $${paramIndex} OR s.location_preference = 'both')`;
      params.push(location);
      paramIndex++;
    }

    if (cityId) {
      queryText += ` AND s.city_id = $${paramIndex}`;
      params.push(cityId);
      paramIndex++;
    }

    if (minPrice) {
      queryText += ` AND s.tbc_per_hour >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      queryText += ` AND s.tbc_per_hour <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    if (providerId) {
      queryText += ` AND s.member_id = $${paramIndex}`;
      params.push(providerId);
      paramIndex++;
    }

    if (myServices && user) {
      queryText += ` AND s.member_id = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    }

    queryText += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query<TimebankServiceRow>(queryText, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM timebank_services s WHERE s.active = TRUE
    `;
    const countParams: (string | number)[] = [];
    let countParamIndex = 1;

    if (serviceType) {
      countQuery += ` AND s.service_type = $${countParamIndex}`;
      countParams.push(serviceType);
      countParamIndex++;
    }

    if (location) {
      countQuery += ` AND (s.location_preference = $${countParamIndex} OR s.location_preference = 'both')`;
      countParams.push(location);
      countParamIndex++;
    }

    if (cityId) {
      countQuery += ` AND s.city_id = $${countParamIndex}`;
      countParams.push(cityId);
      countParamIndex++;
    }

    if (minPrice) {
      countQuery += ` AND s.tbc_per_hour >= $${countParamIndex}`;
      countParams.push(Number(minPrice));
      countParamIndex++;
    }

    if (maxPrice) {
      countQuery += ` AND s.tbc_per_hour <= $${countParamIndex}`;
      countParams.push(Number(maxPrice));
      countParamIndex++;
    }

    if (providerId) {
      countQuery += ` AND s.member_id = $${countParamIndex}`;
      countParams.push(providerId);
      countParamIndex++;
    }

    if (myServices && user) {
      countQuery += ` AND s.member_id = $${countParamIndex}`;
      countParams.push(user.id);
    }

    const countResult = await query<{ total: number }>(countQuery, countParams);
    const total = Number(countResult.rows[0]?.total || 0);

    return NextResponse.json({
      services: result.rows.map((row) => {
        // Parse badges from JSON string
        let badges: string[] = [];
        try {
          badges = row.provider_badges ? JSON.parse(row.provider_badges) : [];
        } catch {
          badges = [];
        }
        return {
          id: row.id,
          memberId: row.member_id,
          serviceType: row.service_type,
          title: row.title,
          description: row.description,
          imageUrl: row.image_url,
          tbcPerHour: Number(row.tbc_per_hour),
          availability: row.availability,
          locationPreference: row.location_preference,
          cityId: row.city_id,
          active: row.active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          provider: {
            id: row.member_id,
            name: row.provider_name,
            email: row.provider_email,
            avatarUrl: row.provider_avatar_url,
            avgRating: Number(row.provider_avg_rating) || 0,
            totalReviews: Number(row.provider_total_reviews) || 0,
            badges,
          },
        };
      }),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
      filters: {
        availableTypes: VALID_SERVICE_TYPES,
        locationOptions: ['remote', 'in_person', 'both'],
      },
    });
  } catch (error) {
    console.error('Get timebank services error:', error);
    return NextResponse.json(
      { error: 'Failed to get services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timebank/services - List a new service offering
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as CreateServiceRequest;

    // Validate required fields
    if (!body.serviceType || !body.title || !body.tbcPerHour) {
      return NextResponse.json(
        { error: 'serviceType, title, and tbcPerHour are required' },
        { status: 400 }
      );
    }

    // Validate service type
    if (!VALID_SERVICE_TYPES.includes(body.serviceType)) {
      return NextResponse.json(
        {
          error: `Invalid service type. Valid types: ${VALID_SERVICE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate pricing (1-10 TBC per hour as per schema constraint)
    if (body.tbcPerHour < 1 || body.tbcPerHour > 10) {
      return NextResponse.json(
        { error: 'tbcPerHour must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Validate location preference
    if (
      body.locationPreference &&
      !['remote', 'in_person', 'both'].includes(body.locationPreference)
    ) {
      return NextResponse.json(
        { error: 'locationPreference must be: remote, in_person, or both' },
        { status: 400 }
      );
    }

    // Insert the service
    const result = await query<TimebankServiceRow>(
      `INSERT INTO timebank_services
       (member_id, service_type, title, description, image_url, tbc_per_hour, availability, location_preference, city_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.id,
        body.serviceType,
        body.title,
        body.description || null,
        body.imageUrl || null,
        body.tbcPerHour,
        body.availability || null,
        body.locationPreference || 'both',
        body.cityId || null,
      ]
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
    console.error('Create timebank service error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
