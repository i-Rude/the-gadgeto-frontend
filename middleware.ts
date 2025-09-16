import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwtToken');

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/', '/seller/registration', '/admin/registration'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  );

  // If no token and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get user role from cookie
  const role = request.cookies.get('userRole');

  if (token && role) {
    // Admin routes protection
    if (request.nextUrl.pathname.startsWith('/admin') && role.value !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Seller routes protection
    if (request.nextUrl.pathname.startsWith('/seller') && 
        !request.nextUrl.pathname.startsWith('/seller/registration') && 
        role.value !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/dashboard/:path*',
  ],
};
