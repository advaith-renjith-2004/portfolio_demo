'use client'

/**
 * useInitializeStore Hook
 *
 * Initializes Zustand stores with server-fetched data.
 * Call this in the main page component after fetching data from Supabase.
 */

import { useEffect, useRef } from 'react'
import { useBoardStore } from '@/stores/boardStore'
import type { Column, CardWithRelations, TagWithCount } from '@/types'

interface ServerData {
  columns: Column[]
  cards: CardWithRelations[]
  tags: TagWithCount[]
}

/**
 * Initializes the board store with server-fetched data.
 * Only updates when data actually changes to prevent infinite loops.
 */
export function useInitializeStore(serverData: ServerData) {
  const setColumns = useBoardStore((s) => s.setColumns)
  const setCards = useBoardStore((s) => s.setCards)
  const setTags = useBoardStore((s) => s.setTags)

  // Track if we've initialized to prevent unnecessary updates
  const initializedRef = useRef(false)
  const prevDataRef = useRef<ServerData | null>(null)

  useEffect(() => {
    // Skip if data is empty (still loading)
    if (
      serverData.columns.length === 0 &&
      serverData.cards.length === 0 &&
      serverData.tags.length === 0
    ) {
      return
    }

    // Skip if data hasn't changed
    if (
      initializedRef.current &&
      prevDataRef.current &&
      JSON.stringify(prevDataRef.current) === JSON.stringify(serverData)
    ) {
      return
    }

    setColumns(serverData.columns)
    setCards(serverData.cards)
    setTags(serverData.tags)

    initializedRef.current = true
    prevDataRef.current = serverData
  }, [serverData, setColumns, setCards, setTags])
}

/**
 * Alternative hook that also manages loading state.
 */
export function useInitializeStoreWithLoading(serverData: ServerData, isLoading: boolean) {
  const setColumns = useBoardStore((s) => s.setColumns)
  const setCards = useBoardStore((s) => s.setCards)
  const setTags = useBoardStore((s) => s.setTags)
  const setLoading = useBoardStore((s) => s.setLoading)

  const initializedRef = useRef(false)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  useEffect(() => {
    // Skip if still loading or already initialized with same data
    if (isLoading) return

    // Skip if data is empty
    if (
      serverData.columns.length === 0 &&
      serverData.cards.length === 0 &&
      serverData.tags.length === 0 &&
      initializedRef.current
    ) {
      return
    }

    setColumns(serverData.columns)
    setCards(serverData.cards)
    setTags(serverData.tags)

    initializedRef.current = true
  }, [serverData, isLoading, setColumns, setCards, setTags])
}
