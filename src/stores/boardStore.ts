'use client'

/**
 * Board Store
 *
 * Zustand store for managing board state including columns, cards, and tags.
 * Provides optimistic updates with rollback and realtime event handlers.
 */

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Column, Card, CardWithRelations, Tag, TagWithCount } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface BoardState {
  // Data
  columns: Column[]
  cards: CardWithRelations[]
  tags: TagWithCount[]

  // Loading states
  isLoading: boolean
  error: string | null

  // Setters
  setColumns: (columns: Column[]) => void
  setCards: (cards: CardWithRelations[]) => void
  setTags: (tags: TagWithCount[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Card mutations (optimistic)
  updateCardPosition: (
    cardId: string,
    columnId: string,
    position: number,
    toast?: { error: (msg: string) => void }
  ) => Promise<void>
  addCard: (card: CardWithRelations) => void
  updateCard: (cardId: string, updates: Partial<CardWithRelations>) => void
  removeCard: (cardId: string) => void

  // Card realtime handlers
  handleCardInsert: (card: Card) => void
  handleCardUpdate: (card: Card) => void
  handleCardDelete: (cardId: string) => void

  // Column realtime handlers
  handleColumnInsert: (column: Column) => void
  handleColumnUpdate: (column: Column) => void
  handleColumnDelete: (columnId: string) => void

  // Tag realtime handlers
  handleTagInsert: (tag: Tag) => void
  handleTagUpdate: (tag: Tag) => void
  handleTagDelete: (tagId: string) => void
}

// ============================================================================
// STORE
// ============================================================================

export const useBoardStore = create<BoardState>((set, get) => ({
  // Initial state
  columns: [],
  cards: [],
  tags: [],
  isLoading: false,
  error: null,

  // Setters
  setColumns: (columns) => set({ columns }),
  setCards: (cards) => set({ cards }),
  setTags: (tags) => set({ tags }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // ============================================================================
  // CARD MUTATIONS (OPTIMISTIC)
  // ============================================================================

  updateCardPosition: async (cardId, columnId, position, toast) => {
    const previousCards = get().cards

    // Optimistic update
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, column_id: columnId, position } : card
      ),
    }))

    try {
      const supabase = createClient()
      if (!supabase) return

      const { error } = await supabase
        .from('cards')
        .update({ column_id: columnId, position })
        .eq('id', cardId)

      if (error) throw error
    } catch (error) {
      // Rollback on failure
      set({ cards: previousCards })
      toast?.error('Failed to move card. Please try again.')
      throw error
    }
  },

  addCard: (card) => {
    set((state) => ({
      cards: [...state.cards, card],
    }))
  },

  updateCard: (cardId, updates) => {
    set((state) => ({
      cards: state.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
    }))
  },

  removeCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== cardId),
    }))
  },

  // ============================================================================
  // CARD REALTIME HANDLERS
  // ============================================================================

  handleCardInsert: (card) => {
    // Check if card already exists (avoid duplicates)
    const exists = get().cards.some((c) => c.id === card.id)
    if (exists) return

    // Insert with empty relations (will be populated by full fetch if needed)
    const cardWithRelations: CardWithRelations = {
      ...card,
      tags: [],
      links: [],
    }

    set((state) => ({
      cards: [...state.cards, cardWithRelations],
    }))
  },

  handleCardUpdate: (card) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === card.id
          ? {
              ...c,
              ...card,
              // Preserve existing relations that aren't in the update payload
              tags: c.tags,
              links: c.links,
            }
          : c
      ),
    }))
  },

  handleCardDelete: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== cardId),
    }))
  },

  // ============================================================================
  // COLUMN REALTIME HANDLERS
  // ============================================================================

  handleColumnInsert: (column) => {
    // Check if column already exists
    const exists = get().columns.some((c) => c.id === column.id)
    if (exists) return

    set((state) => ({
      columns: [...state.columns, column].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    }))
  },

  handleColumnUpdate: (column) => {
    set((state) => ({
      columns: state.columns
        .map((c) => (c.id === column.id ? column : c))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    }))
  },

  handleColumnDelete: (columnId) => {
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
    }))
  },

  // ============================================================================
  // TAG REALTIME HANDLERS
  // ============================================================================

  handleTagInsert: (tag) => {
    // Check if tag already exists
    const exists = get().tags.some((t) => t.id === tag.id)
    if (exists) return

    const tagWithCount: TagWithCount = {
      ...tag,
      card_count: 0,
    }

    set((state) => ({
      tags: [...state.tags, tagWithCount].sort((a, b) => a.name.localeCompare(b.name)),
    }))
  },

  handleTagUpdate: (tag) => {
    set((state) => ({
      tags: state.tags
        .map((t) => (t.id === tag.id ? { ...t, ...tag } : t))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
  },

  handleTagDelete: (tagId) => {
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== tagId),
    }))
  },
}))

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

/**
 * Get cards for a specific column, sorted by pinned status and position.
 */
export function useColumnCards(columnId: string): CardWithRelations[] {
  return useBoardStore((state) =>
    state.cards
      .filter((card) => card.column_id === columnId && card.is_visible)
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return (a.position ?? 0) - (b.position ?? 0)
      })
  )
}

/**
 * Get a single card by ID.
 */
export function useCard(cardId: string | null): CardWithRelations | null {
  return useBoardStore((state) =>
    cardId ? (state.cards.find((c) => c.id === cardId) ?? null) : null
  )
}

/**
 * Get visible columns sorted by position.
 */
export function useVisibleColumns(): Column[] {
  return useBoardStore((state) =>
    state.columns.filter((c) => c.is_visible).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  )
}
