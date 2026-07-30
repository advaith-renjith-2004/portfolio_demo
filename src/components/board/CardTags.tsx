import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface CardTagsProps {
  tags: Tag[]
  maxVisible?: number
  className?: string
}

export function CardTags({ tags, maxVisible = 3, className }: CardTagsProps) {
  if (!tags || tags.length === 0) return null

  const visibleTags = tags.slice(0, maxVisible)
  const overflowCount = tags.length - maxVisible

  // Map categories to specific color styles with gradients
  const getTagStyles = (category: string | null) => {
    switch (category) {
      case 'language':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 dark:border-blue-800/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300'
      case 'framework':
        return 'border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700 dark:border-violet-800/50 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-300'
      case 'database':
        return 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 dark:border-emerald-800/50 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300'
      case 'tool':
        return 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 dark:border-amber-800/50 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300'
      case 'platform':
        return 'border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 text-slate-700 dark:border-slate-800/50 dark:from-slate-900/30 dark:to-gray-900/30 dark:text-slate-300'
      case 'concept':
        return 'border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 dark:border-rose-800/50 dark:from-rose-900/30 dark:to-pink-900/30 dark:text-rose-300'
      default:
        // Fallback for no category or unknown category
        return 'border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700 dark:border-sky-800/50 dark:from-sky-900/30 dark:to-cyan-900/30 dark:text-sky-300'
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className={cn(
            'inline-flex items-center rounded border px-2.5 py-0.5 font-mono text-[11px] font-semibold md:text-[12.5px] tracking-tight',
            getTagStyles(tag.category)
          )}
        >
          {tag.name}
        </span>
      ))}

      {overflowCount > 0 && (
        <span className="inline-flex items-center rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold text-secondary-foreground md:text-[12.5px]">
          +{overflowCount}
        </span>
      )}
    </div>
  )
}
