/**
 * API Route: User Theme Preference
 * POST /api/user/theme - Save user's preferred theme
 * GET /api/user/theme - Get user's preferred theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById, updateUser } from '@togetheros/db';

// Valid themes (must match THEMES in dark-mode-provider.tsx)
const VALID_THEMES = [
  'default',
  'sage-earth',
  'fresh-peach',
  'gothic-noir',
  'yacht-club',
  'quiet-luxury',
  'night-sands',
  'old-photograph',
  'cappuccino',
  'sunny-day',
  'cool-revival',
  'sharp-edge',
  'tropical-punch',
  'cobalt-sky',
  'salt-pepper',
  'quite-clear',
  'breakfast-tea',
  'stone-path',
  'urban-loft',
  'spiced-mocha',
  'beachfront-view',
  'under-the-moonlight',
  'siltstone',
  'peach-skyline',
  'mountain-mist',
  'frozen-lake',
  'eucalyptus-grove',
  'winter-chill',
  'summer-breeze',
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ theme: 'default' });
    }

    const session = verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ theme: 'default' });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ theme: 'default' });
    }

    return NextResponse.json({
      theme: user.preferred_theme || 'default',
    });
  } catch (error) {
    console.error('Error getting user theme:', error);
    return NextResponse.json({ theme: 'default' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = verifySession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { theme } = body;

    if (!theme || !VALID_THEMES.includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    // Update user's preferred theme
    await updateUser(session.userId, { preferred_theme: theme });

    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('Error saving user theme:', error);
    return NextResponse.json(
      { error: 'Failed to save theme preference' },
      { status: 500 }
    );
  }
}
