'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { backdropVariants, bottomSheetVariants, centeredModalVariants } from './animations'
import { SheetHandle } from './SheetHandle'
import type { SheetProps } from './types'

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

/**
 * Responsive modal/bottom sheet component.
 *
 * On mobile (<768px): Renders as a bottom sheet that slides up from the bottom
 * On desktop (>=768px): Renders as a centered modal
 *
 * Features:
 * - Framer Motion animations
 * - Swipe-to-dismiss on mobile
 * - Focus trap and keyboard navigation
 * - Accessible with ARIA attributes
 */
export function Sheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  desktopMaxWidth = '2xl',
  mobileMaxHeight = '90vh',
  showHandle = true,
  enableSwipeClose = true,
  ariaLabelledby,
  ariaDescribedby,
}: SheetProps) {
  const isMobile = useIsMobile(768)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Swipe-to-dismiss handler for bottom sheet
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableSwipeClose) return
    // Close if dragged down fast enough or far enough
    const shouldClose = info.velocity.y > 500 || info.offset.y > 200
    if (shouldClose) {
      onClose()
    }
  }

  // SSR safety check
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50',
            !isMobile && 'flex items-center justify-center p-4 sm:p-6'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal/Sheet Content */}
          <motion.div
            ref={containerRef}
            className={cn(
              'relative border bg-card shadow-2xl flex flex-col overflow-hidden',
              isMobile
                ? 'pb-safe fixed inset-x-0 bottom-0 rounded-t-2xl'
                : `w-full rounded-xl ${maxWidthClasses[desktopMaxWidth]}`,
              className
            )}
            style={isMobile ? { maxHeight: mobileMaxHeight } : { maxHeight: '85vh' }}
            variants={isMobile ? bottomSheetVariants : centeredModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isMobile && enableSwipeClose ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle indicator (mobile only) */}
            {isMobile && showHandle && <SheetHandle />}

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Optional title for screen readers */}
            {title && <span className="sr-only">{title}</span>}

            {/* Content with scroll */}
            <div className="overflow-y-auto overscroll-contain flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
