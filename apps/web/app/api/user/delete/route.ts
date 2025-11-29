/**
 * GDPR Right to Deletion Endpoint
 *
 * Allows users to delete their account and all personal data
 * Required for GDPR compliance (Right to Erasure / Right to be Forgotten)
 *
 * This is a destructive action that cannot be undone.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query, getClient } from '@togetheros/db';
import { logSecurityEvent, hashIP } from '@/lib/security/security-logger';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  const client = await getClient();

  try {
    // Require authentication
    const user = await requireAuth(request);
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Parse request body for confirmation
    const body = await request.json().catch(() => ({}));
    const { confirmation, password } = body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Please confirm deletion by providing: { "confirmation": "DELETE_MY_ACCOUNT" }',
        },
        { status: 400 }
      );
    }

    // Log deletion request
    await logSecurityEvent({
      event_type: 'ACCOUNT_DELETION_REQUEST',
      user_id: user.id,
      ip_hash: hashIP(clientIP),
      metadata: { confirmed: true },
    });

    // Start transaction for atomic deletion
    await client.query('BEGIN');

    try {
      // Delete user data in order (respecting foreign key constraints)
      // The order matters - delete dependent data first

      // 1. Delete notifications
      await client.query('DELETE FROM notifications WHERE user_id = $1', [user.id]);

      // 2. Delete saved searches
      await client.query('DELETE FROM saved_searches WHERE user_id = $1', [user.id]);

      // 3. Delete feed priorities/interests
      await client.query('DELETE FROM feed_priorities WHERE user_id = $1', [user.id]);

      // 4. Delete onboarding progress
      await client.query('DELETE FROM onboarding_progress WHERE user_id = $1', [user.id]);

      // 5. Delete proposal votes
      await client.query('DELETE FROM proposal_votes WHERE user_id = $1', [user.id]);

      // 6. Delete proposal ratings
      await client.query('DELETE FROM proposal_ratings WHERE user_id = $1', [user.id]);

      // 7. Delete feed post ratings
      await client.query('DELETE FROM feed_ratings WHERE user_id = $1', [user.id]);

      // 8. Delete forum reactions
      await client.query('DELETE FROM forum_reactions WHERE user_id = $1', [user.id]);

      // 9. Anonymize forum replies (keep content, remove author)
      await client.query(
        `UPDATE forum_replies SET author_id = NULL, author_name = '[Deleted User]' WHERE author_id = $1`,
        [user.id]
      );

      // 10. Anonymize forum posts (keep content for discussion continuity)
      await client.query(
        `UPDATE forum_posts SET author_id = NULL, author_name = '[Deleted User]' WHERE author_id = $1`,
        [user.id]
      );

      // 11. Anonymize feed posts (keep for historical record)
      await client.query(
        `UPDATE feed_posts SET author_id = NULL WHERE author_id = $1`,
        [user.id]
      );

      // 12. Anonymize proposals (keep for governance continuity)
      await client.query(
        `UPDATE proposals SET author_id = NULL WHERE author_id = $1`,
        [user.id]
      );

      // 13. Delete group memberships
      await client.query('DELETE FROM group_members WHERE user_id = $1', [user.id]);

      // 14. Delete support point transactions
      await client.query('DELETE FROM support_point_transactions WHERE user_id = $1', [user.id]);

      // 15. Delete support point allocations
      await client.query('DELETE FROM support_point_allocations WHERE user_id = $1', [user.id]);

      // 16. Delete support point balance
      await client.query('DELETE FROM support_point_balances WHERE user_id = $1', [user.id]);

      // 17. Delete reward points
      await client.query('DELETE FROM user_reward_points WHERE user_id = $1', [user.id]);

      // 18. Delete badge progress
      await client.query('DELETE FROM user_badge_progress WHERE user_id = $1', [user.id]);

      // 19. Delete learning path progress
      await client.query('DELETE FROM user_learning_progress WHERE user_id = $1', [user.id]);

      // 20. Delete challenge completions
      await client.query('DELETE FROM user_challenge_completions WHERE user_id = $1', [user.id]);

      // 21. Delete user profile
      await client.query('DELETE FROM user_profiles WHERE user_id = $1', [user.id]);

      // 22. Delete user sessions
      await client.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);

      // 23. Delete verification tokens
      await client.query('DELETE FROM verification_tokens WHERE user_id = $1', [user.id]);

      // 24. Finally, delete the user account
      await client.query('DELETE FROM users WHERE id = $1', [user.id]);

      // Commit transaction
      await client.query('COMMIT');

      // Log successful deletion
      await logSecurityEvent({
        event_type: 'ACCOUNT_DELETION_COMPLETE',
        user_id: user.id,
        ip_hash: hashIP(clientIP),
        metadata: { success: true },
      });

      // Clear session cookie
      const cookieStore = await cookies();
      cookieStore.delete('session');

      return NextResponse.json(
        {
          success: true,
          message: 'Your account and personal data have been permanently deleted.',
        },
        { status: 200 }
      );
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to delete your account' },
        { status: 401 }
      );
    }

    // Log failed deletion
    console.error('Account deletion error:', errorMessage);
    await logSecurityEvent({
      event_type: 'ACCOUNT_DELETION_FAILED',
      ip_hash: hashIP(request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'),
      metadata: { error: errorMessage },
    });

    return NextResponse.json(
      { error: 'Deletion failed', message: 'Unable to delete account. Please contact support.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// GET endpoint to check deletion status / requirements
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Return information about what will be deleted
    return NextResponse.json({
      message: 'Account deletion information',
      warning: 'This action is permanent and cannot be undone.',
      dataToBeDeleted: [
        'Account information (email, name, password)',
        'Profile data (bio, avatar, social links)',
        'Notifications and saved searches',
        'Support points and reward points',
        'Group memberships',
        'Onboarding progress',
        'Badge and learning progress',
      ],
      dataToBeAnonymized: [
        'Forum posts and replies (content preserved, author removed)',
        'Feed posts (content preserved for community)',
        'Governance proposals (content preserved for records)',
        'Votes and ratings (kept for aggregate statistics)',
      ],
      confirmation: {
        method: 'DELETE',
        body: { confirmation: 'DELETE_MY_ACCOUNT' },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to view deletion information' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
