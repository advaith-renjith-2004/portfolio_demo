import { ColumnSkeleton } from './ColumnSkeleton'

export function BoardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-hidden p-4 md:flex-row md:p-6">
      {/* About Panel Skeleton */}
      <div className="hidden w-full shrink-0 flex-col gap-6 md:flex md:w-[240px] lg:w-[280px]">
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      </div>

      {/* Columns Skeleton */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        <ColumnSkeleton />
        <ColumnSkeleton />
        <ColumnSkeleton />
        <div className="hidden lg:block">
          <ColumnSkeleton />
        </div>
      </div>
    </div>
  )
}
