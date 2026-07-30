'use client'

/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for browser/client-side usage.
 * Uses singleton pattern to avoid creating multiple clients.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function MyComponent() {
 *   const supabase = createClient()
 *   // supabase is typed with your Database schema
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Creates or returns the singleton Supabase browser client.
 * The client is cached to avoid creating multiple instances.
 */
export function createClient() {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('your-project') || key.includes('your-anon-key-here')) {
    return null as any
  }

  browserClient = createBrowserClient<Database>(url, key)

  return browserClient
}

/**
 * Hook-friendly alias for createClient.
 * Follows React naming conventions for hooks.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useSupabase } from '@/lib/supabase/client'
 *
 * function MyComponent() {
 *   const supabase = useSupabase()
 *   // Use supabase client in your component
 * }
 * ```
 */
export const useSupabase = createClient

// Export the client type for external usage
export type SupabaseBrowserClient = ReturnType<typeof createClient>
