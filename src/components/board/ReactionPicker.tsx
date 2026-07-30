import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ReactionType } from '@/types'

interface ReactionPickerProps {
  onReactionClick: (type: ReactionType) => void
  userReactions?: ReactionType[]
}

const REACTION_TYPES: { type: ReactionType; emoji: string }[] = [
  { type: 'thumbsup', emoji: '👍' },
  { type: 'fire', emoji: '🔥' },
  { type: 'eyes', emoji: '👀' },
  { type: 'lightbulb', emoji: '💡' },
]

export function ReactionPicker({ onReactionClick, userReactions = [] }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-muted-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add Reaction
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close picker */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Picker Popover */}
          <div className="bg-popover animate-in fade-in zoom-in-95 absolute bottom-full left-0 z-50 mb-2 flex items-center gap-1 rounded-lg border p-1.5 shadow-lg duration-200">
            {REACTION_TYPES.map(({ type, emoji }) => {
              const isActive = userReactions.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => {
                    onReactionClick(type)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted',
                    isActive && 'bg-primary/10 ring-1 ring-primary/20'
                  )}
                  aria-label={`Add ${type} reaction`}
                  aria-pressed={isActive}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
