/**
 * Supabase Middleware Client
 *
 * Creates a Supabase client for use in Next.js middleware.
 * Used to refresh expired sessions before they reach your app.
 *
 * @example
 * ```ts
 * // In middleware.ts
 * import { createMiddlewareClient } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = await createMiddlewareClient(request)
 *   // Use supabase client and return response
 *   return response
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for middleware with proper cookie handling.
 * Returns both the client and the response object with updated cookies.
 */
export async function createMiddlewareClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request for downstream handlers
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          // Create a new response with updated cookies
          response = NextResponse.next({
            request,
          })

          // Set cookies on the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - this updates the cookie
  await supabase.auth.getUser()

  return { supabase, response }
}

// Export types for external usage
export type MiddlewareClient = Awaited<ReturnType<typeof createMiddlewareClient>>
