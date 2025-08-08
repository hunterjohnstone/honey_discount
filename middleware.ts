import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = ['/profile']; // Array is easier to maintain

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Handle unauthenticated access to protected routes
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();

  // Only process session for GET requests (avoid double execution on POST)
  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Safari-compatible cookie settings
      response.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: 'lax', // Change to 'none' if you need cross-site
        path: '/',
        expires: expiresInOneDay,
        // Domain should be set in production
        ...(process.env.NODE_ENV === 'production' && { domain: '.yourdomain.com' })
      });
    } catch (error) {
      console.error('Session verification failed:', error);
      // Clear invalid session
      response.cookies.delete('session');
      
      if (isProtectedRoute) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('error', 'session_expired');
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)'],
  runtime: 'edge' // Recommended for middleware
};