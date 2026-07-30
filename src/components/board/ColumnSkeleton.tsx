import { cn } from '@/lib/utils'

export function ColumnSkeleton() {
  return (
    <div className="flex h-full w-full shrink-0 flex-col gap-4 md:w-[280px] lg:w-[320px]">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Cards Skeleton */}
      <div className="flex flex-col gap-3 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-border/50 bg-muted" />
        ))}
      </div>
    </div>
  )
}
