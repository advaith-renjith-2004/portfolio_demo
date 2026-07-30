'use client'

import { Pin, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardSpotlight } from '@/components/ui/card-spotlight'
import { TYPE_SPOTLIGHT_COLORS } from '@/lib/card-colors'
import { CardTags } from './CardTags'
import { CardReactions } from './CardReactions'
import { CardDateRange } from './CardDateRange'
import type { CardWithRelations, CardType } from '@/types'
import { useMotionValue, useTransform, motion } from 'framer-motion'

interface CardPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  card: CardWithRelations
  onClick?: () => void
  isAdmin?: boolean
  isDragging?: boolean
}

const TYPE_COLORS: Record<CardType, string> = {
  experience: 'bg-sky-500',
  project: 'bg-emerald-500',
  skill: 'bg-violet-500',
  education: 'bg-amber-500',
  about: 'bg-slate-500',
}

export function CardPreview({
  card,
  onClick,
  isAdmin = false,
  isDragging = false,
  className,
  ...props
}: CardPreviewProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left - width / 2
    const mouseY = e.clientY - rect.top - height / 2
    x.set(mouseX / width)
    y.set(mouseY / height)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(0)
    y.set(0)
    props.onMouseLeave?.(e)
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full"
    >
      <CardSpotlight
      radius={200}
      colors={TYPE_SPOTLIGHT_COLORS[card.card_type]}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        'group relative flex cursor-pointer select-none flex-col gap-3 overflow-hidden rounded-lg border border-border/60 bg-card/45 p-4 pl-6 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out dark:border-white/5 dark:bg-zinc-950/40',
        'hover:-translate-y-0.5 hover:border-primary/40 dark:hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isDragging && 'z-50 rotate-3 scale-[1.02] cursor-grabbing opacity-95 shadow-xl',
        className
      )}
      {...props}
    >
      {/* Accent Bar */}
      <div className={cn('absolute -left-6 bottom-0 top-0 w-1', TYPE_COLORS[card.card_type])} />

      {/* Header: Pin, Title, Subtitle, Drag Handle */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          {card.is_pinned && (
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Pin className="h-3 w-3 rotate-45" />
              <span>Pinned</span>
            </div>
          )}
          <h3 className="truncate pr-2 text-[19px] md:text-[20px] font-bold leading-snug tracking-tight text-foreground">{card.title}</h3>
          {card.subtitle && (
            <p className="truncate text-[15px] font-semibold text-primary/95">{card.subtitle}</p>
          )}
        </div>

        {/* Grip handle - hidden on mobile since drag-drop is desktop only */}
        <div
          className="-mr-2 -mt-2 hidden cursor-grab p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-muted-foreground active:cursor-grabbing group-hover:opacity-100 md:block"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Date Range */}
      {card.date_start && (
        <div>
          <CardDateRange startDate={card.date_start} endDate={card.date_end} />
        </div>
      )}

      {/* Preview Text */}
      {card.preview_text && (
        <p className="line-clamp-3 text-[15.5px] leading-relaxed text-foreground/85">
          {card.preview_text}
        </p>
      )}

      {/* Footer: Tags & Reactions */}
      <div className="mt-1 flex flex-col gap-3">
        <CardTags tags={card.tags} />

        {/* Mock reactions for now since they are not in CardWithRelations yet */}
        {/* In a real app, we'd pass these from props or join them in the query */}
        <CardReactions
          reactions={{
            thumbsup: 0,
            fire: 0,
            eyes: 0,
            lightbulb: 0,
            ...((card as any).reactions_by_type || {}),
          }}
        />
      </div>
    </CardSpotlight>
    </motion.div>
  )
}
