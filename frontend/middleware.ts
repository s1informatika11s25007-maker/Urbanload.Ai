import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Global role guard & session refresh
  return NextResponse.next();
}

export const config = {
  matcher: ['/rider/:path*', '/city/:path*', '/dishub/:path*', '/admin/:path*'],
};
