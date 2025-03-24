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

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Create a new response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Add the COOP and COEP headers to enable WASM features
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  
  // Add CORS headers for SQLite WASM files
  if (request.nextUrl.pathname.startsWith('/sqlite-wasm')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    // Set specific content type for WASM files
    if (request.nextUrl.pathname.endsWith('.wasm')) {
      response.headers.set('Content-Type', 'application/wasm')
    } else if (request.nextUrl.pathname.endsWith('.js') || request.nextUrl.pathname.endsWith('.mjs')) {
      response.headers.set('Content-Type', 'application/javascript')
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 