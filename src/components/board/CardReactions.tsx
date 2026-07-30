import { cn } from '@/lib/utils'
import type { ReactionType } from '@/types'

interface CardReactionsProps {
  reactions: Record<ReactionType, number>
  className?: string
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  thumbsup: '👍',
  fire: '🔥',
  eyes: '👀',
  lightbulb: '💡',
}

export function CardReactions({ reactions, className }: CardReactionsProps) {
  // Filter out reactions with 0 count
  const activeReactions = Object.entries(reactions).filter(([_, count]) => count > 0) as [
    ReactionType,
    number,
  ][]

  if (activeReactions.length === 0) return null

  return (
    <div className={cn('flex items-center gap-3 text-[13px] font-semibold text-foreground/85', className)}>
      {activeReactions.map(([type, count]) => (
        <div key={type} className="flex items-center gap-1">
          <span role="img" aria-label={type}>
            {REACTION_EMOJIS[type]}
          </span>
          <span>{count}</span>
        </div>
      ))}
    </div>
  )
}
