import { Sheet } from '@/components/ui/Sheet'
import { CardContent } from './CardContent'
import { CardLinks } from './CardLinks'
import { CardTags } from './CardTags'
import { CardReactions } from './CardReactions'
import { ReactionPicker } from './ReactionPicker'
import { CardDateRange } from './CardDateRange'
import type { CardWithRelations, ReactionType } from '@/types'

interface CardModalProps {
  card: CardWithRelations | null
  isOpen: boolean
  onClose: () => void
  onReactionAdd?: (cardId: string, reactionType: ReactionType) => void
}

export function CardModal({ card, isOpen, onClose, onReactionAdd }: CardModalProps) {
  // Early return if no card (Sheet handles the isOpen state)
  if (!card) return null

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={card.title}
      ariaLabelledby="modal-title"
      desktopMaxWidth="2xl"
      mobileMaxHeight="90vh"
    >
      <div className="space-y-6 p-4 pt-2 sm:p-6 md:p-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="pr-8">
            <h2
              id="modal-title"
              className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl font-serif text-foreground"
            >
              {card.title}
            </h2>
            {card.subtitle && (
              <p className="mt-1.5 text-[16px] font-semibold text-primary sm:text-[18px]">
                {card.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {card.date_start && (
              <CardDateRange startDate={card.date_start} endDate={card.date_end} />
            )}
            <CardTags tags={card.tags} maxVisible={10} />
          </div>
        </div>

        <div className="h-px w-full bg-border" />

        {/* Markdown Content */}
        <div className="min-h-[100px]">
          {card.full_content ? (
            <CardContent content={card.full_content} />
          ) : (
            <p className="italic text-muted-foreground">No content available.</p>
          )}
        </div>

        <div className="h-px w-full bg-border" />

        {/* Footer: Links & Reactions */}
        <div className="space-y-6">
          {card.links && card.links.length > 0 && <CardLinks links={card.links} />}

          <div className="flex items-center justify-between gap-4 pt-2">
            <CardReactions
              reactions={{
                thumbsup: 0,
                fire: 0,
                eyes: 0,
                lightbulb: 0,
                ...((card as any).reactions_by_type || {}),
              }}
              className="text-sm"
            />

            <ReactionPicker
              onReactionClick={(type) => onReactionAdd?.(card.id, type)}
              userReactions={[]}
            />
          </div>
        </div>
      </div>
    </Sheet>
  )
}
