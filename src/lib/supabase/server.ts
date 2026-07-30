/**
 * Supabase Server Client
 *
 * Creates a Supabase client for Server Components (RSC).
 * Handles cookie-based session management for SSR.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server'
 *
 * async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('cards').select('*')
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components.
 * Must be called with `await` as it accesses cookies asynchronously.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Helper to get the session ID from cookies.
 * Used for anonymous session tracking.
 */
export async function getSessionIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('portfolio_session_id')?.value ?? null
}

// Export the client type for external usage
export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
