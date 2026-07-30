import type { ReactNode } from 'react'

export interface SheetProps {
  /** Whether the sheet is open */
  isOpen: boolean
  /** Callback when the sheet should close */
  onClose: () => void
  /** Content to display inside the sheet */
  children: ReactNode
  /** Optional title for accessibility */
  title?: string
  /** Optional description for accessibility */
  description?: string
  /** Additional CSS classes */
  className?: string
  /** Max width on desktop (default: '2xl') */
  desktopMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
  /** Max height on mobile (default: '90vh') */
  mobileMaxHeight?: string
  /** Show drag handle indicator on mobile (default: true) */
  showHandle?: boolean
  /** Enable swipe-to-dismiss on mobile (default: true) */
  enableSwipeClose?: boolean
  /** ARIA labelledby ID */
  ariaLabelledby?: string
  /** ARIA describedby ID */
  ariaDescribedby?: string
}
