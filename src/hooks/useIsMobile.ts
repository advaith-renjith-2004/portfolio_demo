'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if the viewport is below a certain breakpoint.
 * Uses matchMedia for efficient updates.
 *
 * @param breakpoint - The max-width breakpoint in pixels (default: 768)
 * @returns boolean indicating if viewport is below the breakpoint
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile() // Below 768px
 * const isSmall = useIsMobile(640) // Below 640px
 * ```
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to detect if the device supports touch input.
 *
 * @returns boolean indicating if device has touch capability
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}
