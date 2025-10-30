/**
 * User signup API
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, logActivity } from '@/lib/db/users';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, password);

    // Create session and log in automatically
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const token = await createSession(user.id, user.email, ip, userAgent);

    // Log activity
    await logActivity(user.id, 'signup', { method: 'email', ip, userAgent });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });

    // Set session cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
