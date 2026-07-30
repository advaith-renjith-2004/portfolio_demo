'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (targetTheme: Theme) => {
      root.classList.remove('light', 'dark')

      if (targetTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        root.setAttribute('data-theme', systemTheme)
      } else {
        root.classList.add(targetTheme)
        root.setAttribute('data-theme', targetTheme)
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
