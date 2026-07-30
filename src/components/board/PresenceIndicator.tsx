'use client'

/**
 * PresenceIndicator Component
 *
 * Displays the number of active viewers on the board.
 * Shows viewer names in a tooltip on hover.
 */

import { useState, useEffect, useRef } from 'react'
import { Eye, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@/hooks'

// ============================================================================
// TYPES
// ============================================================================

interface Viewer {
  id: string
  name: string
}

interface PresenceIndicatorProps {
  /** Number of other viewers (excludes self) */
  viewerCount: number
  /** List of other viewers with display names */
  viewers: Viewer[]
  /** Whether connected to the presence channel */
  isConnected?: boolean
  /** Maximum dots to show (default 5) */
  maxDots?: number
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PresenceIndicator({
  viewerCount,
  viewers,
  isConnected = true,
  maxDots = 5,
  className,
}: PresenceIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevCountRef = useRef(viewerCount)
  const isMobile = useIsMobile()

  // Trigger pulse animation when viewer count changes
  useEffect(() => {
    if (prevCountRef.current !== viewerCount) {
      setIsAnimating(true)
      prevCountRef.current = viewerCount

      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [viewerCount])

  // Calculate number of dots to show
  const dotsToShow = Math.min(viewerCount, maxDots)
  const hasMoreViewers = viewerCount > maxDots

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={cn(
        // Mobile: bottom-left to avoid overlap with content
        // Desktop: bottom-right as original
        'fixed bottom-4 left-4 right-auto z-50 md:bottom-6 md:left-auto md:right-6',
        'flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2',
        'rounded-full bg-card shadow-lg',
        'border border-border',
        'text-xs text-muted-foreground md:text-sm',
        'transition-all duration-200',
        className
      )}
      onMouseEnter={() => !isMobile && setShowTooltip(true)}
      onMouseLeave={() => !isMobile && setShowTooltip(false)}
      onClick={() => isMobile && setShowTooltip(!showTooltip)}
    >
      {/* Connection status icon */}
      {isConnected ? <Eye className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-destructive" />}

      {/* Viewer count */}
      <motion.span
        key={viewerCount}
        initial={isAnimating ? { scale: 1.2 } : false}
        animate={{ scale: 1 }}
        className="font-medium tabular-nums"
      >
        {viewerCount === 0 ? 'Just you' : `${viewerCount} viewing`}
      </motion.span>

      {/* Viewer dots */}
      {viewerCount > 0 && (
        <div className="ml-1 flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: dotsToShow }).map((_, index) => (
              <motion.span
                key={viewers[index]?.id ?? index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={cn('h-2 w-2 rounded-full', getViewerDotColor(index))}
              />
            ))}
          </AnimatePresence>

          {hasMoreViewers && (
            <span className="ml-0.5 text-xs text-muted-foreground">+{viewerCount - maxDots}</span>
          )}
        </div>
      )}

      {/* Pulse animation overlay */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 rounded-full bg-primary/20"
        />
      )}

      {/* Tooltip showing viewer names */}
      <AnimatePresence>
        {showTooltip && viewerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute bottom-full mb-2',
              // Mobile: left-aligned, Desktop: right-aligned
              'left-0 md:left-auto md:right-0',
              'bg-popover text-popover-foreground',
              'rounded-lg border border-border shadow-lg',
              'min-w-[140px] px-3 py-2',
              'text-xs'
            )}
          >
            <p className="mb-1.5 font-medium">Currently viewing:</p>
            <ul className="space-y-0.5">
              {viewers.slice(0, 10).map((viewer) => (
                <li key={viewer.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      getViewerDotColor(viewers.indexOf(viewer))
                    )}
                  />
                  <span className="truncate">{viewer.name}</span>
                </li>
              ))}
              {viewers.length > 10 && (
                <li className="text-muted-foreground">...and {viewers.length - 10} more</li>
              )}
            </ul>

            {/* Tooltip arrow - positioned left on mobile, right on desktop */}
            <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 border-b border-r border-border bg-popover md:left-auto md:right-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get a color class for viewer dots based on index.
 * Creates visual variety while maintaining consistency.
 */
function getViewerDotColor(index: number): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ]
  return colors[index % colors.length]
}

// ============================================================================
// DISCONNECTED STATE COMPONENT
// ============================================================================

/**
 * Minimal indicator when disconnected from presence.
 */
export function PresenceDisconnected({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        // Mobile: bottom-left, Desktop: bottom-right
        'fixed bottom-4 left-4 right-auto z-50 md:bottom-6 md:left-auto md:right-6',
        'flex items-center gap-2 px-3 py-1.5',
        'rounded-full bg-destructive/10',
        'border border-destructive/20',
        'text-xs text-destructive',
        className
      )}
    >
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  )
}
