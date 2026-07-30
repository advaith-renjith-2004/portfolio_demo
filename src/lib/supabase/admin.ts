/**
 * Supabase Admin Client
 *
 * Creates a Supabase admin client using the service role key.
 * BYPASSES Row Level Security - use with caution!
 *
 * Only use this for:
 * - Server-side operations that need to bypass RLS
 * - Admin operations in API routes
 * - Background jobs/cron tasks
 *
 * NEVER expose this client to the browser.
 *
 * @example
 * ```ts
 * // In an API route
 * import { createAdminClient } from '@/lib/supabase/admin'
 *
 * export async function POST(req: Request) {
 *   const supabase = createAdminClient()
 *   // Can now perform admin operations bypassing RLS
 * }
 * ```
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase admin client with service role privileges.
 * This client bypasses RLS and should only be used server-side.
 *
 * @throws Error if environment variables are not set
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export the client type for external usage
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>
