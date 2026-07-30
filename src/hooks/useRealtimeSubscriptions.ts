'use client'

/**
 * useRealtimeSubscriptions Hook
 *
 * Subscribes to Supabase Realtime for all table changes (cards, columns, tags).
 * Updates the board store automatically when changes are detected.
 */

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBoardStore } from '@/stores/boardStore'
import type { Card, Column, Tag } from '@/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

/**
 * Subscribe to all board-related realtime changes.
 */
export function useRealtimeSubscriptions() {
  // Get handlers from store
  const handleCardInsert = useBoardStore((s) => s.handleCardInsert)
  const handleCardUpdate = useBoardStore((s) => s.handleCardUpdate)
  const handleCardDelete = useBoardStore((s) => s.handleCardDelete)

  const handleColumnInsert = useBoardStore((s) => s.handleColumnInsert)
  const handleColumnUpdate = useBoardStore((s) => s.handleColumnUpdate)
  const handleColumnDelete = useBoardStore((s) => s.handleColumnDelete)

  const handleTagInsert = useBoardStore((s) => s.handleTagInsert)
  const handleTagUpdate = useBoardStore((s) => s.handleTagUpdate)
  const handleTagDelete = useBoardStore((s) => s.handleTagDelete)

  // Stable callback refs to avoid subscription churn
  const handleCardChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Card>) => {
      switch (payload.eventType) {
        case 'INSERT':
          handleCardInsert(payload.new as Card)
          break
        case 'UPDATE':
          handleCardUpdate(payload.new as Card)
          break
        case 'DELETE':
          handleCardDelete((payload.old as { id: string }).id)
          break
      }
    },
    [handleCardInsert, handleCardUpdate, handleCardDelete]
  )

  const handleColumnChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Column>) => {
      switch (payload.eventType) {
        case 'INSERT':
          handleColumnInsert(payload.new as Column)
          break
        case 'UPDATE':
          handleColumnUpdate(payload.new as Column)
          break
        case 'DELETE':
          handleColumnDelete((payload.old as { id: string }).id)
          break
      }
    },
    [handleColumnInsert, handleColumnUpdate, handleColumnDelete]
  )

  const handleTagChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Tag>) => {
      switch (payload.eventType) {
        case 'INSERT':
          handleTagInsert(payload.new as Tag)
          break
        case 'UPDATE':
          handleTagUpdate(payload.new as Tag)
          break
        case 'DELETE':
          handleTagDelete((payload.old as { id: string }).id)
          break
      }
    },
    [handleTagInsert, handleTagUpdate, handleTagDelete]
  )

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      console.warn('[Realtime] Supabase client not initialized. Realtime subscriptions disabled.')
      return
    }

    const channel = supabase
      .channel('board-changes')
      // Card events
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cards',
        },
        (payload) =>
          handleCardChange({
            ...payload,
            eventType: 'INSERT',
          } as RealtimePostgresChangesPayload<Card>)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cards',
        },
        (payload) =>
          handleCardChange({
            ...payload,
            eventType: 'UPDATE',
          } as RealtimePostgresChangesPayload<Card>)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'cards',
        },
        (payload) =>
          handleCardChange({
            ...payload,
            eventType: 'DELETE',
          } as RealtimePostgresChangesPayload<Card>)
      )
      // Column events
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'columns',
        },
        (payload) =>
          handleColumnChange({
            ...payload,
            eventType: 'INSERT',
          } as RealtimePostgresChangesPayload<Column>)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'columns',
        },
        (payload) =>
          handleColumnChange({
            ...payload,
            eventType: 'UPDATE',
          } as RealtimePostgresChangesPayload<Column>)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'columns',
        },
        (payload) =>
          handleColumnChange({
            ...payload,
            eventType: 'DELETE',
          } as RealtimePostgresChangesPayload<Column>)
      )
      // Tag events
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tags',
        },
        (payload) =>
          handleTagChange({
            ...payload,
            eventType: 'INSERT',
          } as RealtimePostgresChangesPayload<Tag>)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tags',
        },
        (payload) =>
          handleTagChange({
            ...payload,
            eventType: 'UPDATE',
          } as RealtimePostgresChangesPayload<Tag>)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tags',
        },
        (payload) =>
          handleTagChange({
            ...payload,
            eventType: 'DELETE',
          } as RealtimePostgresChangesPayload<Tag>)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to board changes channel')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Failed to connect to board changes channel')
        }
      })

    return () => {
      console.log('[Realtime] Cleaning up board changes subscription')
      supabase.removeChannel(channel)
    }
  }, [handleCardChange, handleColumnChange, handleTagChange])
}

/**
 * Subscribe to card changes only (lighter weight).
 */
export function useRealtimeCards() {
  const handleCardInsert = useBoardStore((s) => s.handleCardInsert)
  const handleCardUpdate = useBoardStore((s) => s.handleCardUpdate)
  const handleCardDelete = useBoardStore((s) => s.handleCardDelete)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const channel = supabase
      .channel('cards-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cards' }, (payload) =>
        handleCardInsert(payload.new as Card)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cards' }, (payload) =>
        handleCardUpdate(payload.new as Card)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cards' }, (payload) =>
        handleCardDelete((payload.old as { id: string }).id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [handleCardInsert, handleCardUpdate, handleCardDelete])
}
