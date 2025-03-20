import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Check authentication for other paths
  const authToken = request.cookies.get('auth-token')?.value
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify the token matches our env password
  const envPassword = process.env.APP_PASSWORD
  if (!envPassword || authToken !== envPassword) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 