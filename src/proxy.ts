import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
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

  // 2. Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // STRICT ENFORCEMENT: Delivery partner must NEVER access Admin flow
    if (role === 'DELIVERY_PARTNER') {
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('access_denied', 'admin');
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 3. Root and delivery routes protection
  const isProtectedDeliveryRoute =
    pathname === '/' ||
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

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - static files (.png, .jpg, .svg, .ico, etc.)
     * - uploads
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
