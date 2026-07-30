'use client'

import { useTheme } from '@/lib/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CelestialToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-10 w-10" />

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // Sun rays lines SVG coordinates (centered around 50,50)
  const sunRays = [
    { x1: 74, y1: 50, x2: 81, y2: 50 },
    { x1: 70.8, y1: 62, x2: 76.8, y2: 65.5 },
    { x1: 62, y1: 70.8, x2: 65.5, y2: 76.8 },
    { x1: 50, y1: 74, x2: 50, y2: 81 },
    { x1: 38, y1: 70.8, x2: 34.5, y2: 76.8 },
    { x1: 29.2, y1: 62, x2: 23.2, y2: 65.5 },
    { x1: 26, y1: 50, x2: 19, y2: 50 },
    { x1: 29.2, y1: 38, x2: 23.2, y2: 34.5 },
    { x1: 38, y1: 29.2, x2: 34.5, y2: 23.2 },
    { x1: 50, y1: 26, x2: 50, y2: 19 },
    { x1: 62, y1: 29.2, x2: 65.5, y2: 23.2 },
    { x1: 70.8, y1: 38, x2: 76.8, y2: 34.5 },
  ]

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="group relative grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 shadow-sm backdrop-blur-md transition-colors hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {/* Outer pulsing ring for aesthetic interest */}
      <span className="pointer-events-none absolute inset-0 rounded-full border border-primary/20 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300" />
      
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="relative h-7 w-7"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="csun" cx="50%" cy="42%" r="62%">
              <stop offset="0%" stopColor="#fff7e8" />
              <stop offset="44%" stopColor="#ffd27a" />
              <stop offset="100%" stopColor="#f2a046" />
            </radialGradient>
            <radialGradient id="csunh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,206,128,0.55)" />
              <stop offset="55%" stopColor="rgba(255,176,92,0.16)" />
              <stop offset="100%" stopColor="rgba(255,176,92,0)" />
            </radialGradient>
            <radialGradient id="cmoon" cx="38%" cy="36%" r="72%">
              <stop offset="0%" stopColor="#fbf8f1" />
              <stop offset="58%" stopColor="#e7e6df" />
              <stop offset="100%" stopColor="#c6cad4" />
            </radialGradient>
            <radialGradient id="cmoonh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(205,216,242,0.4)" />
              <stop offset="55%" stopColor="rgba(158,176,222,0.12)" />
              <stop offset="100%" stopColor="rgba(158,176,222,0)" />
            </radialGradient>
          </defs>

          {/* Glow Rings */}
          <motion.circle
            cx="50"
            cy="50"
            r="49"
            fill="url(#csunh)"
            animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.7 : 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="49"
            fill="url(#cmoonh)"
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.7 }}
            transition={{ duration: 0.5 }}
          />

          {/* Stars (Only visible in Dark mode) */}
          <motion.g
            animate={{ opacity: isDark ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="20" cy="28" r="1.5" fill="#fbf8f1" className="opacity-80" />
            <circle cx="82" cy="24" r="1.1" fill="#fbf8f1" className="opacity-60" />
            <circle cx="84" cy="66" r="1" fill="#fbf8f1" className="opacity-70" />
          </motion.g>

          {/* Sun Ray Elements (Visible in Light mode) */}
          <motion.g
            animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.6 : 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {sunRays.map((ray, idx) => (
              <line
                key={idx}
                x1={ray.x1}
                y1={ray.y1}
                x2={ray.x2}
                y2={ray.y2}
                stroke="#ffce80"
                strokeWidth="2.8"
                strokeLinecap="round"
                className="opacity-90"
              />
            ))}
          </motion.g>

          {/* Sun Center */}
          <motion.circle
            cx="50"
            cy="50"
            r="16"
            fill="url(#csun)"
            animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.5 : 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Moon Center with Craters */}
          <motion.g
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5 }}
            transition={{ duration: 0.4 }}
          >
            <circle cx="50" cy="50" r="16" fill="url(#cmoon)" />
            {/* Craters */}
            <circle cx="44" cy="45" r="3" fill="rgba(150,160,186,0.3)" />
            <circle cx="56.5" cy="52" r="2" fill="rgba(150,160,186,0.25)" />
            <circle cx="48" cy="57.5" r="1.5" fill="rgba(150,160,186,0.22)" />
          </motion.g>
        </svg>
      </motion.div>
    </button>
  )
}
