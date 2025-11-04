/**
 * Bridge Context Service - Database Implementation
 * Fetches real user and city context from PostgreSQL
 */

import type {
  UserContext,
  CityContext,
  FetchUserContextInput,
  FetchCityContextInput,
  InterestScore,
} from '@togetheros/types';
import { query } from '../../../../lib/db';

/**
 * Build user context from database queries
 */
export async function buildUserContextFromDB(
  input: FetchUserContextInput
): Promise<UserContext> {
  const { userId } = input;

  // Query 1: Get user profile
  const userResult = await query<{
    city: string | null;
    state: string | null;
    country: string | null;
    paths: string[];
    skills: string[];
    created_at: Date;
    last_seen_at: Date | null;
    onboarding_completed_at: Date | null;
  }>(
    `
    SELECT
      city, state, country,
      paths, skills,
      created_at, last_seen_at,
      onboarding_completed_at
    FROM users
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error(`User ${userId} not found`);
  }

  const user = userResult.rows[0];

  // Query 2: Get implicit interests from user_interests table
  const interestsResult = await query<{
    topic: string;
    interest_score: number;
    engagement_count: number;
    last_engaged: Date;
    trend: 'rising' | 'stable' | 'declining';
  }>(
    `
    SELECT topic, interest_score, engagement_count, last_engaged, trend
    FROM user_interests
    WHERE user_id = $1
    ORDER BY interest_score DESC
    LIMIT 20
    `,
    [userId]
  );

  const implicitInterests: InterestScore[] = interestsResult.rows.map((row: any) => ({
    topic: row.topic,
    score: Math.round(row.interest_score * 100), // Convert 0-1 to 0-100
    derivedFrom: 'post', // Simplified - actual source tracked in interest_events
    lastUpdated: row.last_engaged,
  }));

  // Query 3: Get support points allocations to understand user priorities
  const spResult = await query<{
    target_type: string;
    target_id: string;
    amount: number;
    created_at: Date;
  }>(
    `
    SELECT target_type, target_id, amount, created_at
    FROM support_points_transactions
    WHERE member_id = $1
      AND type = 'allocate'
    ORDER BY created_at DESC
    LIMIT 10
    `,
    [userId]
  );

  const supportPointsAllocated = spResult.rows.map((row: any) => ({
    targetType: row.target_type as 'post' | 'idea' | 'project',
    targetId: row.target_id,
    targetTopic: undefined, // Would need to join to target entity
    points: row.amount,
    allocatedAt: row.created_at,
  }));

  // Query 4: Get user activity metrics
  const activityResult = await query<{
    action_count: number;
  }>(
    `
    SELECT
      COUNT(*) FILTER (WHERE action LIKE 'post%') as post_count,
      COUNT(*) FILTER (WHERE action LIKE 'comment%') as comment_count
    FROM user_activity
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '90 days'
    `,
    [userId]
  );

  const postsCount = Number(activityResult.rows[0]?.action_count) || 0;
  const commentsCount = 0; // Would need separate query if tracked differently

  // Calculate engagement score (0-100)
  const daysActive = user.last_seen_at
    ? Math.max(1, Math.floor((Date.now() - user.last_seen_at.getTime()) / (1000 * 60 * 60 * 24)))
    : 999;
  const engagementScore = Math.min(100, Math.max(0,
    (postsCount * 5) +
    (commentsCount * 2) +
    (supportPointsAllocated.length * 3) +
    (implicitInterests.length * 1) -
    (daysActive * 0.5)
  ));

  return {
    userId,

    // Location from user profile
    city: user.city || 'Unknown',
    region: user.state || 'Unknown',
    country: user.country || 'USA',

    // Interests
    explicitInterests: Array.isArray(user.paths) ? user.paths : [],
    implicitInterests,

    // Activity (stub values for tables that don't exist yet)
    groupMemberships: [], // TODO: Add when groups table exists
    eventAttendance: [], // TODO: Add when events table exists
    feedInteractions: [], // TODO: Add when feed table exists
    supportPointsAllocated,
    postsCount,
    commentsCount,
    lastActiveAt: user.last_seen_at || user.created_at,

    // Engagement
    engagementScore: Math.round(engagementScore),
    onboardingComplete: !!user.onboarding_completed_at,

    // Cache metadata
    fetchedAt: new Date(),
  };
}

/**
 * Build city context from database queries
 */
export async function buildCityContextFromDB(
  input: FetchCityContextInput
): Promise<CityContext> {
  const { city, region } = input;

  // Query 1: Get users in this city (as proxy for activity level)
  const cityUsersResult = await query<{ user_count: number }>(
    `
    SELECT COUNT(*) as user_count
    FROM users
    WHERE city ILIKE $1
      AND state ILIKE $2
      AND deleted_at IS NULL
    `,
    [city, region]
  );

  const totalCityUsers = Number(cityUsersResult.rows[0]?.user_count) || 0;

  // Query 2: Get trending topics in this city (from user_interests)
  const trendingResult = await query<{
    topic: string;
    user_count: number;
    avg_score: number;
  }>(
    `
    SELECT
      ui.topic,
      COUNT(DISTINCT ui.user_id) as user_count,
      AVG(ui.interest_score) as avg_score
    FROM user_interests ui
    JOIN users u ON ui.user_id = u.id
    WHERE u.city ILIKE $1
      AND u.state ILIKE $2
      AND u.deleted_at IS NULL
      AND ui.last_engaged > NOW() - INTERVAL '30 days'
    GROUP BY ui.topic
    ORDER BY user_count DESC, avg_score DESC
    LIMIT 10
    `,
    [city, region]
  );

  const trendingTopics = trendingResult.rows.map((r: any) => r.topic);
  const popularInterests = trendingResult.rows.slice(0, 5).map((r: any) => r.topic);

  // Query 3: Calculate growth rate (users who joined in last 30 days)
  const growthResult = await query<{
    recent_users: number;
    prev_users: number;
  }>(
    `
    SELECT
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recent_users,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '60 days'
                       AND created_at <= NOW() - INTERVAL '30 days') as prev_users
    FROM users
    WHERE city ILIKE $1
      AND state ILIKE $2
      AND deleted_at IS NULL
    `,
    [city, region]
  );

  const recentUsers = Number(growthResult.rows[0]?.recent_users) || 0;
  const prevUsers = Number(growthResult.rows[0]?.prev_users) || 1;
  const growthRate = ((recentUsers - prevUsers) / prevUsers) * 100;

  return {
    city,
    region,
    country: 'USA', // Simplified for now

    // Groups (TODO: Add when groups table exists)
    activeGroups: [],
    totalGroupMembers: 0,

    // Events (TODO: Add when events table exists)
    upcomingEvents: [],
    recentEvents: [],

    // Activity (TODO: Add when feed/posts table exists)
    recentPosts: [],
    activeDiscussions: [],

    // Trends (derived from user_interests)
    trendingTopics,
    popularInterests,
    growthRate: Math.round(growthRate),

    // Cache metadata
    fetchedAt: new Date(),
  };
}
