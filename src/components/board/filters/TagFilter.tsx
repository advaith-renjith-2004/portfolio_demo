import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagFilterProps {
  tags: Tag[]
  activeTags: string[] // slugs
  onChange: (tagSlugs: string[]) => void
}

export function TagFilter({ tags, activeTags, onChange }: TagFilterProps) {
  const toggleTag = (slug: string) => {
    if (activeTags.includes(slug)) {
      onChange(activeTags.filter((t) => t !== slug))
    } else {
      onChange([...activeTags, slug])
    }
  }

  // Sort tags by active status first, then name
  // In a real app, we might sort by usage count
  const sortedTags = [...tags].sort((a, b) => {
    const aActive = activeTags.includes(a.slug)
    const bActive = activeTags.includes(b.slug)
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="no-scrollbar mask-fade-right scroll-touch-x flex items-center gap-2 overflow-x-auto p-1">
      {sortedTags.map((tag) => {
        const isActive = activeTags.includes(tag.slug)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.slug)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-full border text-xs font-medium transition-all',
              'h-10 md:h-9 px-3.5 md:px-2.5',
              isActive
                ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background'
                : 'border-transparent bg-secondary/50 text-secondary-foreground hover:border-border hover:bg-secondary'
            )}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
