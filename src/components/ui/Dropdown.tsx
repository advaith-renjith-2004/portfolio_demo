'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined)

function useDropdown() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error('useDropdown must be used within a Dropdown')
  }
  return context
}

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const { isOpen, setIsOpen } = useDropdown()

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    })
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      aria-expanded={isOpen}
      aria-haspopup={true}
    >
      {children}
      <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
    </button>
  )
}

export function DropdownContent({
  children,
  align = 'start',
}: {
  children: React.ReactNode
  align?: 'start' | 'end'
}) {
  const { isOpen } = useDropdown()

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'bg-popover animate-in fade-in zoom-in-95 absolute z-50 mt-2 w-56 rounded-md p-1 shadow-md ring-1 ring-black ring-opacity-5 backdrop-blur-md duration-200 focus:outline-none',
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabIndex={-1}
    >
      <div className="py-1" role="none">
        {children}
      </div>
    </div>
  )
}

export function DropdownItem({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  const { setIsOpen } = useDropdown()

  const handleClick = () => {
    onClick?.()
    setIsOpen(false)
  }

  return (
    <button
      className="text-popover-foreground flex w-full items-center rounded-sm px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
      role="menuitem"
      tabIndex={-1}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
