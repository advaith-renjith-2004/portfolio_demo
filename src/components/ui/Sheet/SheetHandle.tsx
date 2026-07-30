/**
 * Visual drag handle indicator for bottom sheet.
 * Provides visual affordance that the sheet can be dragged.
 */
export function SheetHandle() {
  return (
    <div className="flex justify-center pb-2 pt-3">
      <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
    </div>
  )
}
