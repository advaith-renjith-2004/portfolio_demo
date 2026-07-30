'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Column as ColumnType, CardWithRelations } from '@/types'
import { CardPreview } from './CardPreview'
import { AnimatePresence, motion } from 'framer-motion'
import { useBoardStore } from '@/stores/boardStore'

interface ColumnProps {
  column: ColumnType
  cards: CardWithRelations[]
  isAdmin?: boolean
  onCardClick?: (cardId: string) => void
  isVertical?: boolean
}

export function Column({ column, cards, isAdmin = false, onCardClick, isVertical = false }: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)
  const [activeDragCardId, setActiveDragCardId] = useState<string | null>(null)

  // Sort cards: pinned first, then by position
  const sortedCards = [...cards].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return (a.position ?? 0) - (b.position ?? 0)
  })

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId)
    e.dataTransfer.setData('sourceColumnId', column.id)
    e.dataTransfer.effectAllowed = 'move'
    setActiveDragCardId(cardId)
  }

  const handleDragEnd = () => {
    setActiveDragCardId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const cardId = e.dataTransfer.getData('text/plain')
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId')
    const targetColumnId = column.id

    if (cardId) {
      const updateCardPosition = useBoardStore.getState().updateCardPosition
      const cardsInStore = useBoardStore.getState().cards

      // Find all cards in target column (excluding the moved card)
      const targetColumnCards = cardsInStore
        .filter((c) => c.column_id === targetColumnId && c.id !== cardId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      // Place at bottom: lastCard.position + 1
      let newPosition = 0
      if (targetColumnCards.length > 0) {
        const lastCardPos = targetColumnCards[targetColumnCards.length - 1]?.position ?? 0
        newPosition = lastCardPos + 1
      } else {
        newPosition = 0
      }

      await updateCardPosition(cardId, targetColumnId, newPosition)
    }
  }

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(cardId)
  }

  const handleCardDragLeave = () => {
    setDragOverCardId(null)
  }

  const handleCardDrop = async (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(null)
    setIsDragOver(false)

    const cardId = e.dataTransfer.getData('text/plain')
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId')
    const targetColumnId = column.id

    if (cardId && cardId !== targetCardId) {
      const updateCardPosition = useBoardStore.getState().updateCardPosition
      const cardsInStore = useBoardStore.getState().cards

      const targetCard = cardsInStore.find((c) => c.id === targetCardId)
      if (!targetCard) return

      // Find all cards in target column (excluding the moved card)
      const targetColumnCards = cardsInStore
        .filter((c) => c.column_id === targetColumnId && c.id !== cardId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const targetIndex = targetColumnCards.findIndex((c) => c.id === targetCardId)

      let newPosition = 0
      if (targetIndex === 0) {
        // Dropped on first card - place at top
        const firstCardPos = targetColumnCards[0]?.position ?? 0
        newPosition = firstCardPos - 1
      } else {
        // Dropped in middle - place between targetIndex - 1 and targetIndex
        const prevCardPos = targetColumnCards[targetIndex - 1]?.position ?? 0
        const targetCardPos = targetColumnCards[targetIndex]?.position ?? 0
        newPosition = (prevCardPos + targetCardPos) / 2
      }

      await updateCardPosition(cardId, targetColumnId, newPosition)
    }
  }

  return (
    <div className={cn(
      "flex flex-col",
      isVertical
        ? "w-full h-auto"
        : "max-h-[60vh] w-full shrink-0 md:max-h-[calc(100vh-140px)] md:w-[280px] lg:w-[320px]"
    )}>
      {/* Column Header */}
      <div className="group flex items-center justify-between border-b border-transparent px-4 py-3 transition-colors hover:border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-[15.5px] md:text-[16px] font-black uppercase tracking-widest text-foreground">
            {column.title}
          </h3>
          <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full border border-border/80 bg-secondary px-1.5 text-[12px] font-bold text-foreground">
            {cards.length}
          </span>
        </div>

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Add card to ${column.title}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards Container */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'custom-scrollbar flex flex-col gap-2 px-2 pb-4 pt-2 transition-all duration-200 md:gap-3 md:pb-6',
          isVertical ? 'overflow-y-visible' : 'flex-1 overflow-y-auto',
          isDragOver ? 'rounded-lg bg-white/[0.03] ring-1 ring-white/10' : 'bg-transparent'
        )}
      >
        <AnimatePresence mode="popLayout">
          {sortedCards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: {
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              onDragOver={(e) => handleCardDragOver(e, card.id)}
              onDragLeave={handleCardDragLeave}
              onDrop={(e) => handleCardDrop(e, card.id)}
              className={cn(
                'rounded-lg transition-all duration-200',
                dragOverCardId === card.id ? 'border-t-2 border-primary/50 pt-2' : ''
              )}
            >
              <CardPreview
                card={card}
                isAdmin={isAdmin}
                onClick={() => onCardClick?.(card.id)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragEnd={handleDragEnd}
                isDragging={activeDragCardId === card.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted py-8 text-center text-muted-foreground"
          >
            <p className="text-sm">No cards match</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
