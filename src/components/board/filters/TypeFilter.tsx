import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CardType } from '@/types'

interface TypeFilterProps {
  activeTypes: CardType[]
  onChange: (types: CardType[]) => void
}

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'experience', label: 'Experience' },
  { value: 'project', label: 'Project' },
  { value: 'skill', label: 'Skill' },
  { value: 'education', label: 'Education' },
  { value: 'about', label: 'About' },
]

export function TypeFilter({ activeTypes, onChange }: TypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleType = (type: CardType) => {
    if (activeTypes.includes(type)) {
      onChange(activeTypes.filter((t) => t !== type))
    } else {
      onChange([...activeTypes, type])
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-10 md:h-9 min-w-[120px] justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {activeTypes.length === 0
            ? 'All Types'
            : activeTypes.length === 1
              ? CARD_TYPES.find((t) => t.value === activeTypes[0])?.label
              : `${activeTypes.length} Types`}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')}
        />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="bg-popover animate-in fade-in zoom-in-95 absolute left-0 top-full z-50 mt-2 w-48 rounded-md border p-1 shadow-md duration-200">
            {CARD_TYPES.map((type) => {
              const isSelected = activeTypes.includes(type.value)
              return (
                <div
                  key={type.value}
                  className={cn(
                    'relative flex cursor-default cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent/50'
                  )}
                  onClick={() => toggleType(type.value)}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <span>{type.label}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
