/**
 * GDPR Data Export Endpoint
 *
 * Allows users to export all their personal data in JSON format
 * Required for GDPR compliance (Right to Data Portability)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';
import { logSecurityEvent, hashIP } from '@/lib/security/security-logger';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Log data export request
    await logSecurityEvent({
      event_type: 'DATA_EXPORT_REQUEST',
      user_id: user.id,
      ip_hash: hashIP(clientIP),
      metadata: { reason: 'user_initiated' },
    });

    // Gather all user data
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {},
      profile: null,
      posts: [],
      forumPosts: [],
      forumReplies: [],
      proposals: [],
      votes: [],
      ratings: [],
      supportPoints: null,
      rewardPoints: null,
      groups: [],
      notifications: [],
      savedSearches: [],
      feedInterests: [],
      onboardingProgress: null,
    };

    // 1. User account data (excluding password hash)
    const userResult = await query(
      `SELECT id, email, name, username, is_admin, email_verified, created_at, updated_at,
              google_id IS NOT NULL as has_google_linked
       FROM users WHERE id = $1`,
      [user.id]
    );
    if (userResult.rows[0]) {
      exportData.user = userResult.rows[0];
    }

    // 2. Profile data
    const profileResult = await query(
      `SELECT bio, avatar_url, location, website, visibility, social_links, interests, created_at, updated_at
       FROM user_profiles WHERE user_id = $1`,
      [user.id]
    );
    if (profileResult.rows[0]) {
      exportData.profile = profileResult.rows[0];
    }

    // 3. Feed posts
    const feedPostsResult = await query(
      `SELECT id, content, url, source, media_urls, cooperation_path, tags, created_at, updated_at
       FROM feed_posts WHERE author_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.posts = feedPostsResult.rows;

    // 4. Forum posts
    const forumPostsResult = await query(
      `SELECT id, topic_id, content, created_at, updated_at
       FROM forum_posts WHERE author_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.forumPosts = forumPostsResult.rows;

    // 5. Forum replies
    const forumRepliesResult = await query(
      `SELECT id, post_id, content, created_at, updated_at
       FROM forum_replies WHERE author_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.forumReplies = forumRepliesResult.rows;

    // 6. Proposals authored
    const proposalsResult = await query(
      `SELECT id, title, description, status, category, created_at, updated_at
       FROM proposals WHERE author_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.proposals = proposalsResult.rows;

    // 7. Votes cast
    const votesResult = await query(
      `SELECT proposal_id, option_id, created_at
       FROM proposal_votes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.votes = votesResult.rows;

    // 8. Ratings given
    const ratingsResult = await query(
      `SELECT proposal_id, feasibility, impact, equity, created_at
       FROM proposal_ratings WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.ratings = ratingsResult.rows;

    // 9. Support points
    const spResult = await query(
      `SELECT balance, total_earned, total_spent, last_activity
       FROM support_point_balances WHERE user_id = $1`,
      [user.id]
    );
    if (spResult.rows[0]) {
      exportData.supportPoints = spResult.rows[0];
    }

    // 10. Reward points
    const rpResult = await query(
      `SELECT balance, total_earned, lifetime_earned, level, level_progress, created_at, updated_at
       FROM user_reward_points WHERE user_id = $1`,
      [user.id]
    );
    if (rpResult.rows[0]) {
      exportData.rewardPoints = rpResult.rows[0];
    }

    // 11. Group memberships
    const groupsResult = await query(
      `SELECT g.id, g.name, g.location, gm.role, gm.joined_at
       FROM group_members gm
       JOIN groups g ON g.id = gm.group_id
       WHERE gm.user_id = $1 ORDER BY gm.joined_at DESC`,
      [user.id]
    );
    exportData.groups = groupsResult.rows;

    // 12. Notifications
    const notificationsResult = await query(
      `SELECT id, type, title, message, read, created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [user.id]
    );
    exportData.notifications = notificationsResult.rows;

    // 13. Saved searches
    const savedSearchesResult = await query(
      `SELECT id, name, query, filters, created_at
       FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    exportData.savedSearches = savedSearchesResult.rows;

    // 14. Feed interests/priorities
    const interestsResult = await query(
      `SELECT topic, weight, created_at, updated_at
       FROM feed_priorities WHERE user_id = $1`,
      [user.id]
    );
    exportData.feedInterests = interestsResult.rows;

    // 15. Onboarding progress
    const onboardingResult = await query(
      `SELECT current_step, completed_steps, skipped_steps, started_at, completed_at
       FROM onboarding_progress WHERE user_id = $1`,
      [user.id]
    );
    if (onboardingResult.rows[0]) {
      exportData.onboardingProgress = onboardingResult.rows[0];
    }

    // Log successful export
    await logSecurityEvent({
      event_type: 'DATA_EXPORT_COMPLETE',
      user_id: user.id,
      ip_hash: hashIP(clientIP),
      metadata: {
        dataPoints: {
          posts: (exportData.posts as unknown[]).length,
          forumPosts: (exportData.forumPosts as unknown[]).length,
          proposals: (exportData.proposals as unknown[]).length,
          votes: (exportData.votes as unknown[]).length,
          groups: (exportData.groups as unknown[]).length,
        },
      },
    });

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="togetheros-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to export your data' },
        { status: 401 }
      );
    }

    console.error('Data export error:', errorMessage);
    return NextResponse.json(
      { error: 'Export failed', message: 'Unable to export data. Please try again later.' },
      { status: 500 }
    );
  }
}
