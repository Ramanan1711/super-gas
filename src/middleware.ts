import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  // 1. If accessing Login page
  if (pathname === '/login') {
    if (token) {
      if (role === 'DELIVERY_PARTNER') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin routes protection (both UI and API endpoints)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required. Please sign in with an administrator account.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // STRICT ENFORCEMENT: Delivery partner must NEVER access Admin flow or Admin APIs
    if (role === 'DELIVERY_PARTNER') {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied. Administrator privileges required.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('access_denied', 'admin');
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 3. Root '/' route handling:
  // - If unauthenticated: redirect to /login
  // - If Admin / Super Admin: redirect to /admin (Admin flow)
  // - If Delivery Partner: allow on '/' (Delivery flow)
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 4. Delivery routes protection
  const isProtectedDeliveryRoute =
    pathname.startsWith('/delivery') ||
    pathname.startsWith('/expenses') ||
    pathname.startsWith('/settlements') ||
    pathname.startsWith('/stocks') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/more') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/all-deliveries');

  if (isProtectedDeliveryRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Also export as proxy for future compatibility
export { middleware as proxy };

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - non-admin api routes (EXCEPT /api/admin/* which IS strictly protected)
     * - _next/static, _next/image
     * - static files (.png, .jpg, .svg, .ico, etc.)
     * - uploads
     */
    '/((?!api/(?!admin)|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
