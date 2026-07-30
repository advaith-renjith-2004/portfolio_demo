/**
 * Supabase Client Exports
 *
 * Re-exports all Supabase client utilities for convenient imports.
 *
 * @example
 * ```ts
 * // Browser usage
 * import { createClient, useSupabase } from '@/lib/supabase'
 *
 * // Server Component usage
 * import { createServerClient } from '@/lib/supabase'
 *
 * // API Route admin usage
 * import { createAdminClient } from '@/lib/supabase'
 * ```
 */

// Browser client exports
export { createClient, useSupabase, type SupabaseBrowserClient } from './client'

// Server client exports (for RSC)
export {
  createClient as createServerClient,
  getSessionIdFromCookies,
  type SupabaseServerClient,
} from './server'

// Admin client exports (service role)
export { createAdminClient, type SupabaseAdminClient } from './admin'

// Middleware client exports
export { createMiddlewareClient, type MiddlewareClient } from './middleware'

// Query helper exports
export {
  fetchCardWithRelations,
  fetchCardsWithRelations,
  fetchBoardData,
  fetchColumnWithCards,
  fetchTagsWithCounts,
  fetchReactionCounts,
  fetchUserReactions,
  reorderColumns,
  reorderCards,
  moveCardToColumn,
  recordCardView,
} from './helpers'

// Re-export database types for convenience
export type { Database } from '@/types/database'
