'use client'

/**
 * UI Store
 *
 * Zustand store for managing UI state including theme, admin mode, and edit mode.
 * Note: Modal and filter state are managed via URL (useCardModal, useFilterState hooks).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// TYPES
// ============================================================================

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  // Theme
  theme: Theme

  // Admin mode
  isAdmin: boolean
  isEditMode: boolean

  // Actions
  setTheme: (theme: Theme) => void
  setAdmin: (isAdmin: boolean) => void
  toggleEditMode: () => void
  setEditMode: (isEditMode: boolean) => void
}

// ============================================================================
// STORE
// ============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'light',
      isAdmin: false,
      isEditMode: false,

      // Actions
      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document
        if (typeof window !== 'undefined') {
          const resolvedTheme =
            theme === 'system'
              ? 'light'
              : theme

          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(resolvedTheme)
          document.documentElement.setAttribute('data-theme', resolvedTheme)
          localStorage.setItem('theme', theme)
        }
      },

      setAdmin: (isAdmin) => set({ isAdmin }),

      toggleEditMode: () =>
        set((state) => ({
          isEditMode: state.isAdmin ? !state.isEditMode : false,
        })),

      setEditMode: (isEditMode) =>
        set((state) => ({
          isEditMode: state.isAdmin ? isEditMode : false,
        })),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        // Don't persist admin/edit mode for security
      }),
    }
  )
)

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

/**
 * Get resolved theme (accounts for 'system' preference).
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useUIStore((state) => state.theme)

  if (typeof window === 'undefined') return 'light'

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return theme
}

/**
 * Check if edit mode is currently active (requires admin).
 */
export function useIsEditing(): boolean {
  return useUIStore((state) => state.isAdmin && state.isEditMode)
}
