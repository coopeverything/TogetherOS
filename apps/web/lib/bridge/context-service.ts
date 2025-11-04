/**
 * Bridge Context Service
 * Fetches user and city context for context-aware recommendations
 *
 * Uses real database queries when available, falls back to mock data
 */

import type {
  UserContext,
  CityContext,
  FetchUserContextInput,
  FetchCityContextInput,
  InterestScore,
  BridgeGroupMembership,
  BridgeEventAttendance,
} from '@togetheros/types';
import { buildUserContextFromDB, buildCityContextFromDB } from './context-service-db';

// Cache TTL: 5 minutes for user context, 1 hour for city context
const USER_CONTEXT_CACHE_TTL = 5 * 60 * 1000;
const CITY_CONTEXT_CACHE_TTL = 60 * 60 * 1000;

// Simple in-memory cache
const userContextCache = new Map<string, { context: UserContext; expiresAt: number }>();
const cityContextCache = new Map<string, { context: CityContext; expiresAt: number }>();

/**
 * Fetch user context with caching
 */
export async function fetchUserContext(
  input: FetchUserContextInput
): Promise<UserContext> {
  const cacheKey = `${input.userId}`;
  const cached = userContextCache.get(cacheKey);

  // Return cached if valid
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context;
  }

  // Fetch fresh context
  const context = await buildUserContext(input);

  // Cache it
  userContextCache.set(cacheKey, {
    context,
    expiresAt: Date.now() + USER_CONTEXT_CACHE_TTL,
  });

  return context;
}

/**
 * Fetch city context with caching
 */
export async function fetchCityContext(
  input: FetchCityContextInput
): Promise<CityContext> {
  const cacheKey = `${input.city}-${input.region}`;
  const cached = cityContextCache.get(cacheKey);

  // Return cached if valid
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context;
  }

  // Fetch fresh context
  const context = await buildCityContext(input);

  // Cache it
  cityContextCache.set(cacheKey, {
    context,
    expiresAt: Date.now() + CITY_CONTEXT_CACHE_TTL,
  });

  return context;
}

// Toggle between database and mock data
const USE_DATABASE = process.env.BRIDGE_USE_DB !== 'false'; // Default to true

/**
 * Build user context
 * Uses database queries when available, falls back to mock data
 */
async function buildUserContext(
  input: FetchUserContextInput
): Promise<UserContext> {
  // Try database first if enabled
  if (USE_DATABASE) {
    try {
      return await buildUserContextFromDB(input);
    } catch (error) {
      console.warn('Failed to fetch user context from database, falling back to mock:', error);
      // Fall through to mock data
    }
  }
  // MVP: Mock data for demonstration
  // In production, this would query:
  // - profiles table for location and explicit interests
  // - group_memberships table
  // - event_attendance table
  // - feed_interactions table
  // - support_points_transactions table

  const mockContext: UserContext = {
    userId: input.userId,

    // Location (would come from profile)
    city: 'Portland',
    region: 'Oregon',
    country: 'USA',

    // Explicit interests (from profile tags)
    explicitInterests: ['housing', 'climate', 'food systems'],

    // Implicit interests (derived from behavior)
    implicitInterests: [
      {
        topic: 'cooperative housing',
        score: 85,
        derivedFrom: 'support_points',
        lastUpdated: new Date(),
      },
      {
        topic: 'community gardens',
        score: 72,
        derivedFrom: 'feed_view',
        lastUpdated: new Date(),
      },
      {
        topic: 'mutual aid',
        score: 68,
        derivedFrom: 'post',
        lastUpdated: new Date(),
      },
    ],

    // Activity
    groupMemberships: [
      {
        groupId: 'group_1',
        groupName: 'Portland Climate Action',
        joinedAt: new Date('2025-01-15'),
        role: 'member',
      },
    ],
    eventAttendance: [
      {
        eventId: 'event_1',
        eventName: 'Community Garden Workshop',
        attendedAt: new Date('2025-10-20'),
        rsvpStatus: 'attended',
      },
    ],
    feedInteractions: [],
    supportPointsAllocated: [],
    postsCount: 5,
    commentsCount: 12,
    lastActiveAt: new Date(),

    // Engagement
    engagementScore: 65, // 0-100
    onboardingComplete: true,

    // Cache metadata
    fetchedAt: new Date(),
  };

  return mockContext;
}

/**
 * Build city context
 * Uses database queries when available, falls back to mock data
 */
async function buildCityContext(
  input: FetchCityContextInput
): Promise<CityContext> {
  // Try database first if enabled
  if (USE_DATABASE) {
    try {
      return await buildCityContextFromDB(input);
    } catch (error) {
      console.warn('Failed to fetch city context from database, falling back to mock:', error);
      // Fall through to mock data
    }
  }
  // MVP: Mock data for demonstration
  // In production, this would query:
  // - groups table filtered by city
  // - events table filtered by city and date range
  // - posts table for recent activity
  // - Aggregate member counts and growth metrics

  const mockContext: CityContext = {
    city: input.city,
    region: input.region,
    country: 'USA',

    // Groups
    activeGroups: [
      {
        id: 'group_1',
        name: 'Portland Climate Action',
        memberCount: 34,
        category: 'environmental',
        topics: ['climate', 'sustainability', 'advocacy'],
        isActive: true,
        lastActivityAt: new Date(),
      },
      {
        id: 'group_2',
        name: 'Housing Cooperative Formation',
        memberCount: 23,
        category: 'housing',
        topics: ['cooperative housing', 'community living', 'real estate'],
        isActive: true,
        lastActivityAt: new Date(),
      },
      {
        id: 'group_3',
        name: 'Mutual Aid Network',
        memberCount: 45,
        category: 'mutual aid',
        topics: ['mutual aid', 'community support', 'solidarity'],
        isActive: true,
        lastActivityAt: new Date(),
      },
    ],
    totalGroupMembers: 87, // Total unique members across all groups

    // Events
    upcomingEvents: [
      {
        id: 'event_upcoming_1',
        title: 'Housing Cooperative Formation Workshop',
        date: new Date('2025-11-15'),
        location: 'Community Center',
        category: 'workshop',
        topics: ['housing', 'cooperatives', 'legal'],
        rsvpCount: 23,
        isUpcoming: true,
      },
      {
        id: 'event_upcoming_2',
        title: 'Community Dinner Potluck',
        date: new Date('2025-11-20'),
        location: 'Central Park',
        category: 'social',
        topics: ['community building', 'food'],
        rsvpCount: 18,
        isUpcoming: true,
      },
    ],
    recentEvents: [],

    // Activity
    recentPosts: [],
    activeDiscussions: [
      {
        id: 'discussion_1',
        title: 'Starting a Community Tool Library',
        groupId: 'group_3',
        groupName: 'Mutual Aid Network',
        topics: ['tool library', 'sharing economy', 'logistics'],
        participantCount: 8,
        commentCount: 18,
        lastActivityAt: new Date(),
      },
    ],

    // Trends
    trendingTopics: ['housing', 'climate action', 'mutual aid', 'community gardens'],
    popularInterests: ['cooperative living', 'sustainability', 'community building'],
    growthRate: 0.15, // 15% month-over-month growth

    // Cache metadata
    fetchedAt: new Date(),
  };

  return mockContext;
}

/**
 * Get city size category based on member count
 */
export function getCitySizeCategory(memberCount: number): '5-15' | '15-30' | '30-50' | '50-100' | '100+' {
  if (memberCount < 15) return '5-15';
  if (memberCount < 30) return '15-30';
  if (memberCount < 50) return '30-50';
  if (memberCount < 100) return '50-100';
  return '100+';
}

/**
 * Calculate user engagement score
 * Based on: posts, comments, group memberships, event attendance, recent activity
 */
export function calculateEngagementScore(context: UserContext): number {
  let score = 0;

  // Posts (max 20 points)
  score += Math.min(context.postsCount * 2, 20);

  // Comments (max 15 points)
  score += Math.min(context.commentsCount, 15);

  // Group memberships (max 20 points)
  score += Math.min(context.groupMemberships.length * 5, 20);

  // Event attendance (max 15 points)
  score += Math.min(context.eventAttendance.length * 3, 15);

  // Recent activity (max 15 points)
  const daysSinceActive = (Date.now() - context.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActive < 1) score += 15;
  else if (daysSinceActive < 7) score += 10;
  else if (daysSinceActive < 30) score += 5;

  // Onboarding complete (max 15 points)
  if (context.onboardingComplete) score += 15;

  return Math.min(Math.round(score), 100);
}

/**
 * Clear all caches (useful for testing)
 */
export function clearContextCache(): void {
  userContextCache.clear();
  cityContextCache.clear();
}
