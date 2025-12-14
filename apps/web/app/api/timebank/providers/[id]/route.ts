/**
 * Provider Profile API
 * GET /api/timebank/providers/[id] - Get provider profile with stats and services
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

interface ProviderRow {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date;
}

interface ProviderStatsRow {
  member_id: string;
  avg_rating: number;
  total_reviews: number;
  total_transactions: number;
  badges: string;
  response_time_hours: number | null;
  last_active_at: Date | null;
}

interface ServiceRow {
  id: string;
  service_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tbc_per_hour: number;
  availability: string | null;
  location_preference: string | null;
  created_at: Date;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/timebank/providers/[id] - Get provider profile
 * Returns user info, stats, badges, services, and recent reviews
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get provider basic info
    const userResult = await query<ProviderRow>(
      `SELECT id, name, email, avatar_url, bio, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (!userResult.rows[0]) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const provider = userResult.rows[0];

    // Get provider stats
    const statsResult = await query<ProviderStatsRow>(
      `SELECT member_id, avg_rating, total_reviews, total_transactions,
              badges::text, response_time_hours, last_active_at
       FROM timebank_provider_stats
       WHERE member_id = $1`,
      [id]
    );

    const stats = statsResult.rows[0];
    let badges: string[] = [];
    try {
      badges = stats?.badges ? JSON.parse(stats.badges) : [];
    } catch {
      badges = [];
    }

    // Get provider's active services
    const servicesResult = await query<ServiceRow>(
      `SELECT id, service_type, title, description, image_url,
              tbc_per_hour, availability, location_preference, created_at
       FROM timebank_services
       WHERE member_id = $1 AND active = TRUE
       ORDER BY created_at DESC`,
      [id]
    );

    // Get recent reviews
    const reviewsResult = await query<{
      id: string;
      rating: number;
      review_text: string | null;
      created_at: Date;
      reviewer_name: string;
      reviewer_avatar_url: string | null;
    }>(
      `SELECT r.id, r.rating, r.review_text, r.created_at,
              u.name as reviewer_name, u.avatar_url as reviewer_avatar_url
       FROM timebank_ratings r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.provider_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    // Calculate fair exchange index
    const exchangeResult = await query<{
      given_hours: number;
      received_hours: number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN provider_id = $1 THEN hours ELSE 0 END), 0)::numeric as given_hours,
         COALESCE(SUM(CASE WHEN receiver_id = $1 THEN hours ELSE 0 END), 0)::numeric as received_hours
       FROM timebank_transactions
       WHERE (provider_id = $1 OR receiver_id = $1)
         AND status = 'confirmed'
         AND confirmed_at >= NOW() - INTERVAL '6 months'`,
      [id]
    );

    const exchange = exchangeResult.rows[0];
    const givenHours = Number(exchange?.given_hours || 0);
    const receivedHours = Number(exchange?.received_hours || 0);
    const totalHours = givenHours + receivedHours;

    let fairExchangeIndex: 'excellent' | 'good' | 'balanced' | 'needs_balance' = 'balanced';
    if (totalHours > 0) {
      const ratio = givenHours / totalHours;
      if (ratio >= 0.4 && ratio <= 0.6) {
        fairExchangeIndex = 'excellent';
      } else if (ratio >= 0.3 && ratio <= 0.7) {
        fairExchangeIndex = 'good';
      } else if (ratio >= 0.2 && ratio <= 0.8) {
        fairExchangeIndex = 'balanced';
      } else {
        fairExchangeIndex = 'needs_balance';
      }
    }

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: provider.name,
        avatarUrl: provider.avatar_url,
        bio: provider.bio,
        memberSince: provider.created_at,
        stats: {
          avgRating: Number(stats?.avg_rating || 0),
          totalReviews: Number(stats?.total_reviews || 0),
          totalTransactions: Number(stats?.total_transactions || 0),
          responseTimeHours: stats?.response_time_hours
            ? Number(stats.response_time_hours)
            : null,
          lastActiveAt: stats?.last_active_at,
          badges,
        },
        fairExchange: {
          givenHours,
          receivedHours,
          index: fairExchangeIndex,
        },
        services: servicesResult.rows.map(s => ({
          id: s.id,
          serviceType: s.service_type,
          title: s.title,
          description: s.description,
          imageUrl: s.image_url,
          tbcPerHour: Number(s.tbc_per_hour),
          availability: s.availability,
          locationPreference: s.location_preference,
          createdAt: s.created_at,
        })),
        recentReviews: reviewsResult.rows.map(r => ({
          id: r.id,
          rating: Number(r.rating),
          reviewText: r.review_text,
          createdAt: r.created_at,
          reviewer: {
            name: r.reviewer_name,
            avatarUrl: r.reviewer_avatar_url,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get provider profile' },
      { status: 500 }
    );
  }
}
