/**
 * Next.js Middleware
 *
 * Tracks request performance via headers
 * Note: Cannot use file system operations in Edge runtime
 * Performance logging happens in API routes instead
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();

  // Clone the response to allow modifications
  const response = NextResponse.next();

  // Add request ID for tracing
  response.headers.set('x-request-id', crypto.randomUUID());

  // Add timing header for observability
  response.headers.set('x-request-start', start.toString());

  return response;
}

// Configure which routes the middleware runs on
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
