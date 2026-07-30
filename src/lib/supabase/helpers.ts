/**
 * Supabase Query Helpers
 *
 * Utility functions for common database queries.
 * These helpers transform raw database results into typed composite objects.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  CardWithRelations,
  ColumnWithCards,
  BoardData,
  TagWithCount,
  ReactionCounts,
  ProfileData,
  Tag,
  Link,
} from '@/types'

type TypedSupabaseClient = SupabaseClient<Database>

// ============================================================================
// CARD QUERIES
// ============================================================================

/**
 * Fetches a single card with all its relations (tags and links).
 *
 * @example
 * ```ts
 * const card = await fetchCardWithRelations(supabase, cardId)
 * if (card) {
 *   console.log(card.tags) // Tag[]
 *   console.log(card.links) // Link[]
 * }
 * ```
 */
export async function fetchCardWithRelations(
  supabase: TypedSupabaseClient,
  cardId: string
): Promise<CardWithRelations | null> {
  const { data, error } = await supabase
    .from('cards')
    .select(
      `
      *,
      card_tags (
        tags (*)
      ),
      links (*)
    `
    )
    .eq('id', cardId)
    .single()

  if (error || !data) return null

  // Transform the nested structure
  return transformCardWithRelations(data)
}

/**
 * Fetches multiple cards with their relations.
 */
export async function fetchCardsWithRelations(
  supabase: TypedSupabaseClient,
  options: { columnId?: string; limit?: number } = {}
): Promise<CardWithRelations[]> {
  let query = supabase.from('cards').select(
    `
      *,
      card_tags (
        tags (*)
      ),
      links (*)
    `
  )

  if (options.columnId) {
    query = query.eq('column_id', options.columnId)
  }

  query = query.order('position', { ascending: true })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map(transformCardWithRelations)
}

// ============================================================================
// BOARD QUERIES
// ============================================================================

/**
 * Fetches all columns with their cards and card relations.
 * Optimized for initial board load.
 *
 * @example
 * ```ts
 * const board = await fetchBoardData(supabase)
 * board.forEach(column => {
 *   console.log(column.title, column.cards.length)
 * })
 * ```
 */
export async function fetchBoardData(supabase: TypedSupabaseClient): Promise<BoardData> {
  const { data, error } = await supabase
    .from('columns')
    .select(
      `
      *,
      cards (
        *,
        card_tags (
          tags (*)
        ),
        links (*)
      )
    `
    )
    .eq('is_visible', true)
    .order('position', { ascending: true })

  if (error || !data) return []

  // Transform nested structure and sort cards by position
  return data.map((column) => ({
    ...column,
    cards: ((column.cards as unknown[]) ?? [])
      .map((card) => transformCardWithRelations(card as Record<string, unknown>))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  }))
}

/**
 * Fetches a single column with its cards.
 */
export async function fetchColumnWithCards(
  supabase: TypedSupabaseClient,
  columnSlug: string
): Promise<ColumnWithCards | null> {
  const { data, error } = await supabase
    .from('columns')
    .select(
      `
      *,
      cards (
        *,
        card_tags (
          tags (*)
        ),
        links (*)
      )
    `
    )
    .eq('slug', columnSlug)
    .single()

  if (error || !data) return null

  return {
    ...data,
    cards: ((data.cards as unknown[]) ?? [])
      .map((card) => transformCardWithRelations(card as Record<string, unknown>))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  }
}

// ============================================================================
// TAG QUERIES
// ============================================================================

/**
 * Fetches all tags with their usage counts.
 */
export async function fetchTagsWithCounts(supabase: TypedSupabaseClient): Promise<TagWithCount[]> {
  const { data: tags, error: tagsError } = await supabase.from('tags').select('*').order('name')

  if (tagsError || !tags) return []

  // Get card counts for each tag
  const { data: counts, error: countsError } = await supabase.from('card_tags').select('tag_id')

  if (countsError || !counts) {
    // Return tags with 0 counts if count query fails
    return tags.map((tag) => ({ ...tag, card_count: 0 }))
  }

  // Count occurrences of each tag
  const tagCounts = new Map<string, number>()
  counts.forEach((ct) => {
    tagCounts.set(ct.tag_id, (tagCounts.get(ct.tag_id) ?? 0) + 1)
  })

  return tags.map((tag) => ({
    ...tag,
    card_count: tagCounts.get(tag.id) ?? 0,
  }))
}

// ============================================================================
// REACTION QUERIES
// ============================================================================

/**
 * Fetches reaction counts for a card.
 */
export async function fetchReactionCounts(
  supabase: TypedSupabaseClient,
  cardId: string
): Promise<ReactionCounts> {
  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('card_id', cardId)

  if (error || !data) {
    return { thumbsup: 0, fire: 0, eyes: 0, lightbulb: 0 }
  }

  const counts: ReactionCounts = { thumbsup: 0, fire: 0, eyes: 0, lightbulb: 0 }

  data.forEach((reaction) => {
    const type = reaction.reaction_type as keyof ReactionCounts
    if (type in counts) {
      counts[type]++
    }
  })

  return counts
}

/**
 * Fetches reactions for a card grouped by session (to show user's reactions).
 */
export async function fetchUserReactions(
  supabase: TypedSupabaseClient,
  cardId: string,
  sessionId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('card_id', cardId)
    .eq('session_id', sessionId)

  if (error || !data) return []

  return data.map((r) => r.reaction_type)
}

// ============================================================================
// REORDER OPERATIONS
// ============================================================================

/**
 * Reorders columns with batch update.
 *
 * @example
 * ```ts
 * await reorderColumns(supabase, [
 *   { id: 'col-1', position: 0 },
 *   { id: 'col-2', position: 1 },
 * ])
 * ```
 */
export async function reorderColumns(
  supabase: TypedSupabaseClient,
  items: Array<{ id: string; position: number }>
): Promise<boolean> {
  const updates = items.map(({ id, position }) =>
    supabase.from('columns').update({ position }).eq('id', id)
  )

  const results = await Promise.all(updates)
  return results.every((r) => !r.error)
}

/**
 * Reorders cards with batch update.
 *
 * @example
 * ```ts
 * await reorderCards(supabase, [
 *   { id: 'card-1', position: 0 },
 *   { id: 'card-2', position: 1 },
 *   { id: 'card-3', position: 2 },
 * ])
 * ```
 */
export async function reorderCards(
  supabase: TypedSupabaseClient,
  items: Array<{ id: string; position: number }>
): Promise<boolean> {
  const updates = items.map(({ id, position }) =>
    supabase.from('cards').update({ position }).eq('id', id)
  )

  const results = await Promise.all(updates)
  return results.every((r) => !r.error)
}

/**
 * Moves a card to a different column.
 */
export async function moveCardToColumn(
  supabase: TypedSupabaseClient,
  cardId: string,
  targetColumnId: string,
  position: number
): Promise<boolean> {
  const { error } = await supabase
    .from('cards')
    .update({ column_id: targetColumnId, position })
    .eq('id', cardId)

  return !error
}

// ============================================================================
// VIEW TRACKING
// ============================================================================

/**
 * Records a card view for analytics.
 */
export async function recordCardView(
  supabase: TypedSupabaseClient,
  cardId: string,
  sessionId: string,
  expanded: boolean = false,
  referrer?: string
): Promise<boolean> {
  const { error } = await supabase.from('card_views').insert({
    card_id: cardId,
    session_id: sessionId,
    expanded,
    referrer: referrer ?? null,
  })

  return !error
}

// ============================================================================
// PROFILE QUERIES
// ============================================================================

/**
 * Fetches profile data from personal_info table.
 * Transforms database fields to ProfileData format for AboutPanel.
 */
export async function fetchProfileData(supabase: TypedSupabaseClient): Promise<ProfileData | null> {
  const { data, error } = await supabase.from('personal_info').select('*').limit(1).single()

  if (error || !data) {
    console.error('Error fetching profile data:', error)
    return null
  }

  // Transform database fields to ProfileData format
  return {
    profileImageUrl: data.profile_image_url || '/profile.png',
    name: data.full_name,
    title: data.title,
    bio: data.professional_summary || '',
    location: data.location || '',
    email: data.email,
    socialLinks: {
      github: data.github_url || undefined,
      linkedin: data.linkedin_url || undefined,
      resume: data.resume_url || undefined,
    },
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforms raw card data with nested relations into CardWithRelations.
 */
function transformCardWithRelations(data: Record<string, unknown>): CardWithRelations {
  const cardTags = data.card_tags as Array<{ tags: Tag }> | null
  const links = data.links as Link[] | null

  return {
    id: data.id as string,
    column_id: data.column_id as string,
    card_type: data.card_type as CardWithRelations['card_type'],
    position: data.position as number,
    title: data.title as string,
    subtitle: data.subtitle as string | null,
    date_start: data.date_start as string | null,
    date_end: data.date_end as string | null,
    preview_text: data.preview_text as string | null,
    full_content: data.full_content as string | null,
    metadata: data.metadata as CardWithRelations['metadata'],
    thumbnail_url: data.thumbnail_url as string | null,
    is_pinned: data.is_pinned as boolean,
    is_visible: data.is_visible as boolean,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    tags: cardTags?.map((ct) => ct.tags).filter(Boolean) ?? [],
    links: links ?? [],
  }
}
