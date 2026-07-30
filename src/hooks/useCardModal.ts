import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CardWithRelations } from '@/types'

interface UseCardModalReturn {
  isOpen: boolean
  activeCardId: string | null
  openCard: (cardId: string) => void
  closeCard: () => void
}

export function useCardModal(): UseCardModalReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    const cardId = searchParams.get('card')
    if (cardId) {
      setActiveCardId(cardId)
    } else {
      setActiveCardId(null)
    }
  }, [searchParams])

  const openCard = useCallback(
    (cardId: string) => {
      // Update URL without full page reload
      const params = new URLSearchParams(searchParams.toString())
      params.set('card', cardId)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const closeCard = useCallback(() => {
    // Remove card param from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('card')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    isOpen: !!activeCardId,
    activeCardId,
    openCard,
    closeCard,
  }
}
