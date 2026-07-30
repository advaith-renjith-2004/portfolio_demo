/**
 * Type Exports and Composite Types
 *
 * This file re-exports database types and provides composite types
 * for common query patterns throughout the application.
 */

import type { Database, Json } from './database'

// ============================================================================
// TABLE ROW TYPE ALIASES
// ============================================================================

export type Column = Database['public']['Tables']['columns']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type CardTag = Database['public']['Tables']['card_tags']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type CardView = Database['public']['Tables']['card_views']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']

// ============================================================================
// INSERT TYPE ALIASES
// ============================================================================

export type ColumnInsert = Database['public']['Tables']['columns']['Insert']
export type CardInsert = Database['public']['Tables']['cards']['Insert']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type CardTagInsert = Database['public']['Tables']['card_tags']['Insert']
export type ReactionInsert = Database['public']['Tables']['reactions']['Insert']
export type CardViewInsert = Database['public']['Tables']['card_views']['Insert']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']

// ============================================================================
// UPDATE TYPE ALIASES
// ============================================================================

export type ColumnUpdate = Database['public']['Tables']['columns']['Update']
export type CardUpdate = Database['public']['Tables']['cards']['Update']
export type TagUpdate = Database['public']['Tables']['tags']['Update']
export type LinkUpdate = Database['public']['Tables']['links']['Update']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

// ============================================================================
// ENUM TYPE ALIASES
// ============================================================================

export type CardType = Database['public']['Enums']['card_type']
export type LinkType = Database['public']['Enums']['link_type']
export type TagCategory = Database['public']['Enums']['tag_category']

// Reaction types (not a database enum, but constrained by CHECK)
export type ReactionType = 'thumbsup' | 'fire' | 'eyes' | 'lightbulb'

// ============================================================================
// COMPOSITE TYPES FOR COMMON QUERIES
// ============================================================================

/**
 * Card with all related data - tags and links.
 * Used when displaying a card in detail view.
 */
export type CardWithRelations = Card & {
  tags: Tag[]
  links: Link[]
}

/**
 * Card with relations plus reaction/view counts.
 * Used for board display with engagement metrics.
 */
export type CardWithStats = CardWithRelations & {
  reaction_count: number
  view_count: number
  reactions_by_type: Record<ReactionType, number>
}

/**
 * Column with all its cards (including card relations).
 * Used for rendering the kanban board.
 */
export type ColumnWithCards = Column & {
  cards: CardWithRelations[]
}

/**
 * Full board structure for initial page load.
 */
export type BoardData = ColumnWithCards[]

/**
 * Tag with usage count - for tag management/filtering.
 */
export type TagWithCount = Tag & {
  card_count: number
}

/**
 * Reaction aggregation by type.
 */
export type ReactionCounts = {
  thumbsup: number
  fire: number
  eyes: number
  lightbulb: number
}

/**
 * Profile data for the AboutPanel component.
 * Transformed from personal_info table.
 */
export type ProfileData = {
  profileImageUrl: string
  name: string
  title: string
  bio: string
  location: string
  email: string
  socialLinks: {
    github?: string
    linkedin?: string
    resume?: string
  }
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// FORM/INPUT TYPES
// ============================================================================

/**
 * Input type for creating a new card.
 * Includes tag IDs and links to create associations.
 */
export type CreateCardInput = Omit<CardInsert, 'id' | 'created_at' | 'updated_at'> & {
  tag_ids?: string[]
  links?: Omit<LinkInsert, 'id' | 'card_id' | 'created_at'>[]
}

/**
 * Input type for updating a card.
 * Allows partial updates with optional tag reassignment.
 */
export type UpdateCardInput = Omit<CardUpdate, 'id' | 'created_at' | 'updated_at'> & {
  tag_ids?: string[]
}

/**
 * Input type for creating a new column.
 */
export type CreateColumnInput = Omit<ColumnInsert, 'id' | 'created_at' | 'updated_at'>

/**
 * Input type for reordering items.
 */
export type ReorderInput = {
  id: string
  position: number
}

// ============================================================================
// SESSION/FINGERPRINT TYPES
// ============================================================================

/**
 * Browser fingerprint data collected for session identification.
 */
export type FingerprintData = {
  fingerprint: string
  components: {
    userAgent: string
    language: string
    platform: string
    screenResolution: string
    timezone: string
    colorDepth: number
    deviceMemory?: number
    hardwareConcurrency?: number
    touchSupport: boolean
    canvas?: string
    webgl?: string
  }
}

/**
 * Session information stored in the client.
 */
export type SessionInfo = {
  sessionId: string
  fingerprint: string
  isNew: boolean
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type { Database, Json }
