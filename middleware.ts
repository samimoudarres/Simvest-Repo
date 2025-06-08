import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if we're already on the setup page
  if (request.nextUrl.pathname === "/setup-env") {
    return NextResponse.next()
  }

  // Check if environment variables exist
  const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If either is missing, redirect to setup
  if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
    return NextResponse.redirect(new URL("/setup-env", request.url))
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/", "/challenge/:path*", "/game/:path*", "/profile/:path*", "/login", "/signup"],
}
