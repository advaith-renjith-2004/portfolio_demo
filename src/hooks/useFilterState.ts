import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CardType } from '@/types'

interface UseFilterStateReturn {
  activeTagFilters: string[]
  activeTypeFilters: CardType[]
  searchQuery: string
  setTagFilters: (tags: string[]) => void
  setTypeFilters: (types: CardType[]) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function useFilterState(): UseFilterStateReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([])
  const [activeTypeFilters, setActiveTypeFilters] = useState<CardType[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const types = (searchParams.get('types')?.split(',').filter(Boolean) || []) as CardType[]
    const search = searchParams.get('search') || ''

    setActiveTagFilters(tags)
    setActiveTypeFilters(types)
    setSearchQuery(search)
  }, [searchParams])

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const setTagFilters = useCallback(
    (tags: string[]) => {
      updateUrl({ tags: tags.length > 0 ? tags.join(',') : null })
    },
    [updateUrl]
  )

  const setTypeFilters = useCallback(
    (types: CardType[]) => {
      updateUrl({ types: types.length > 0 ? types.join(',') : null })
    },
    [updateUrl]
  )

  const handleSetSearchQuery = useCallback(
    (query: string) => {
      updateUrl({ search: query || null })
    },
    [updateUrl]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tags')
    params.delete('types')
    params.delete('search')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const hasActiveFilters =
    activeTagFilters.length > 0 || activeTypeFilters.length > 0 || searchQuery.length > 0

  return {
    activeTagFilters,
    activeTypeFilters,
    searchQuery,
    setTagFilters,
    setTypeFilters,
    setSearchQuery: handleSetSearchQuery,
    clearFilters,
    hasActiveFilters,
  }
}
