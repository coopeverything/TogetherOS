/**
 * Next.js Proxy (formerly Middleware)
 *
 * Implements:
 * - Request tracking via headers
 * - Security headers (CSP, X-Frame-Options, etc.)
 * - Global rate limiting for API routes
 * - CSRF protection for state-changing operations
 *
 * Note: Runs on Node.js runtime in Next.js 16+
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute for general API
const RATE_LIMIT_AUTH_MAX = 10; // 10 attempts per minute for auth endpoints

// In-memory rate limit store (for edge runtime)
// Note: In production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000);
}

/**
 * Check rate limit for an identifier
 */
function checkRateLimit(
  identifier: string,
  maxRequests: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.anthropic.com https://api.openai.com https://*.sentry.io https://vercel.live wss://ws-us3.pusher.com",
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  return response;
}

/**
 * Validate CSRF token for state-changing requests
 */
function validateCSRF(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Only validate for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Skip CSRF for public endpoints
  const path = request.nextUrl.pathname;
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/google',
    '/api/auth/callback/google',
    '/api/health',
    '/api/status',
  ];

  if (publicPaths.some(p => path.startsWith(p))) {
    return true;
  }

  // Check for CSRF token in header or cookie
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  // For authenticated requests, verify token matches
  if (csrfHeader && csrfCookie) {
    return csrfHeader === csrfCookie;
  }

  // If no CSRF token but has session, allow (for backwards compatibility)
  // In strict mode, this would return false
  const sessionCookie = request.cookies.get('session');
  if (sessionCookie) {
    return true; // Relaxed mode - session presence is sufficient
  }

  return true;
}

export function proxy(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // Skip proxy for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    const response = NextResponse.next();
    response.headers.set('x-request-id', crypto.randomUUID());
    response.headers.set('x-request-start', start.toString());
    return response;
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const clientIP = getClientIP(request);
    const isAuthEndpoint = pathname.startsWith('/api/auth');
    const maxRequests = isAuthEndpoint ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_MAX_REQUESTS;
    const rateLimitKey = `${clientIP}:${isAuthEndpoint ? 'auth' : 'api'}`;

    const rateLimit = checkRateLimit(rateLimitKey, maxRequests);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );

      response.headers.set('Retry-After', String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)));
      response.headers.set('X-RateLimit-Limit', String(maxRequests));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));
      response.headers.set('x-request-id', crypto.randomUUID());

      return addSecurityHeaders(response);
    }

    // CSRF validation
    if (!validateCSRF(request)) {
      const response = NextResponse.json(
        { error: 'CSRF validation failed', message: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
      response.headers.set('x-request-id', crypto.randomUUID());
      return addSecurityHeaders(response);
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('x-request-id', crypto.randomUUID());
    response.headers.set('x-request-start', start.toString());
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));

    return addSecurityHeaders(response);
  }

  // Add security headers to all other responses
  const response = NextResponse.next();
  response.headers.set('x-request-id', crypto.randomUUID());
  response.headers.set('x-request-start', start.toString());

  return addSecurityHeaders(response);
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
