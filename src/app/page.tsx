'use client'

import { createClient } from '@/lib/supabase/client'
import { fetchBoardData, fetchTagsWithCounts, fetchProfileData } from '@/lib/supabase/helpers'
import { Board } from '@/components/board/Board'
import { CardModal } from '@/components/board/CardModal'
import { PresenceIndicator } from '@/components/board/PresenceIndicator'
import { useCardModal } from '@/hooks/useCardModal'
import { useInitializeStore } from '@/hooks/useInitializeStore'
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions'
import { usePresence } from '@/hooks/usePresence'
import { useBoardStore } from '@/stores/boardStore'
import type { Column, CardWithRelations, TagWithCount, ProfileData } from '@/types'
import { useEffect, useState, Suspense } from 'react'

import { BottomRightHUD } from '@/components/board/BottomRightHUD'
import { AmbientPlayer } from '@/components/ui/AmbientPlayer'

export default function Home() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  // Server data state (for initial fetch)
  const [serverData, setServerData] = useState<{
    columns: Column[]
    cards: CardWithRelations[]
    tags: TagWithCount[]
  }>({ columns: [], cards: [], tags: [] })
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Card modal hook (URL-synced)
  const { isOpen, activeCardId, openCard, closeCard } = useCardModal()

  // Initialize stores with server data
  useInitializeStore(serverData)

  // Subscribe to ALL realtime updates (cards, columns, tags)
  useRealtimeSubscriptions()

  // Track presence
  const presence = usePresence()

  // Get data from store (reactive to realtime updates)
  const cards = useBoardStore((s) => s.cards)
  const columns = useBoardStore((s) => s.columns)
  const tags = useBoardStore((s) => s.tags)

  // Fetch real data from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch board data (columns with cards)
        const board = await fetchBoardData(supabase)
        const allCards = board.flatMap((col) => col.cards)
        const columnsOnly = board.map(({ cards: _, ...col }) => col)

        // Fetch tags with counts
        const tagsData = await fetchTagsWithCounts(supabase)

        // Fetch profile data
        const profile = await fetchProfileData(supabase)

        if (columnsOnly.length > 0) {
          setServerData({
            columns: columnsOnly,
            cards: allCards,
            tags: tagsData,
          })
          setProfileData(profile)
        } else {
          throw new Error('Database is empty or client not configured')
        }
      } catch (error) {
        console.warn('Supabase fetch failed, loading local mock fallback data:', error)
        const { MOCK_BOARD_COLUMNS, MOCK_BOARD_CARDS, MOCK_BOARD_TAGS, MOCK_PROFILE_DATA } = await import('@/lib/mockData')
        setServerData({
          columns: MOCK_BOARD_COLUMNS,
          cards: MOCK_BOARD_CARDS,
          tags: MOCK_BOARD_TAGS,
        })
        setProfileData(MOCK_PROFILE_DATA)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Find active card from store
  const activeCard = cards.find((c) => c.id === activeCardId) || null

  return (
    <main className="w-full bg-transparent">
      <Board
        columns={columns}
        cards={cards}
        tags={tags}
        profileData={profileData}
        isLoading={isLoading}
        onCardClick={openCard}
      />

      <CardModal
        card={activeCard}
        isOpen={isOpen}
        onClose={closeCard}
        onReactionAdd={(cardId, type) => console.log('Reaction added:', cardId, type)}
      />

      <PresenceIndicator
        viewerCount={presence.viewerCount}
        viewers={presence.viewers}
        isConnected={presence.isConnected}
      />

      <BottomRightHUD />
      <AmbientPlayer />
    </main>
  )
}
