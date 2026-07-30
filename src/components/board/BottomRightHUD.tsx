'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, Timer, Compass } from 'lucide-react'
import { useIsMobile, useIsTouchDevice } from '@/hooks'

const FONT_MONO = "'SF Mono', 'Fira Mono', 'Consolas', monospace"

function exploredColor(pct: number): { r: number; g: number; b: number } {
  // Red -> Yellow -> Blue -> Green transition based on exploration
  if (pct < 25) {
    // Red to Yellow
    const t = pct / 25
    return { r: 239, g: Math.round(68 + 111 * t), b: 68 }
  } else if (pct < 60) {
    // Yellow to Blue
    const t = (pct - 25) / 35
    return { r: Math.round(234 - 175 * t), g: Math.round(179 - 49 * t), b: Math.round(8 + 238 * t) }
  } else {
    // Blue to Green
    const t = (pct - 60) / 40
    return { r: Math.round(59 + 15 * t), g: Math.round(130 + 92 * t), b: Math.round(246 - 118 * t) }
  }
}

function useSessionTime() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const key = '__portfolio_session_start'
    const stored = sessionStorage.getItem(key)
    const start = stored
      ? parseInt(stored)
      : (() => {
          const t = Date.now()
          sessionStorage.setItem(key, String(t))
          return t
        })()
    setElapsed(Math.floor((Date.now() - start) / 1000))
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return elapsed
}

function useMouseCoords() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: -(e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return pos
}

function fmtElapsed(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

function fmtCoord(n: number) {
  const fixed = n.toFixed(4)
  return (parseFloat(fixed) > 0 ? '+' : '') + fixed
}

export function BottomRightHUD() {
  const isMobile = useIsMobile()
  const isTouchDevice = useIsTouchDevice()
  const elapsed = useSessionTime()
  const { x, y } = useMouseCoords()

  const [explored, setExplored] = useState(0)
  const [showTop, setShowTop] = useState(false)
  
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setExplored((prev) => Math.max(prev, Math.round(progress)))
      setShowTop(scrollTop > 400)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleScrollToStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const btnSize = isMobile ? 34 : 46
  const btnR = btnSize / 2 - 2
  const btnCirc = 2 * Math.PI * btnR

  // Colors for compass
  const { r, g, b } = exploredColor(explored)
  const strokeColor = `rgb(${r},${g},${b})`
  const fillColor = `rgba(${r},${g},${b},0.13)`
  const compassSz = isMobile ? 34 : 40
  const compassR = compassSz / 2 - 2
  const compassCirc = 2 * Math.PI * compassR
  const compassOffset = compassCirc * (1 - explored / 100)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: '2rem',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Scroll to Start/Top Button */}
      <div
        style={{
          height: `${btnSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-end',
        }}
      >
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              onClick={handleScrollToStart}
              style={{
                width: `${btnSize}px`,
                height: `${btnSize}px`,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(10,10,10,0.85)',
                backdropFilter: 'blur(4px)',
                color: 'rgba(255,255,255,0.6)',
                borderWidth: '1px',
                borderColor: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isMobile || isTouchDevice ? 'pointer' : 'none',
                transition: 'color 0.2s',
                padding: 0,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }}
            >
              <ChevronUp size={isMobile ? 14 : 18} strokeWidth={1.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Widgets HUD Row */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? '0.6rem' : '1rem',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: FONT_MONO,
          fontSize: isMobile ? '0.7rem' : '0.8rem',
          userSelect: 'none',
          pointerEvents: 'none',
          padding: '0.4rem 0.8rem',
          background: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Session Uptime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Timer
            size={isMobile ? 12 : 14}
            strokeWidth={1.5}
            style={{ opacity: 0.6 }}
          />
          <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em' }}>
            {fmtElapsed(elapsed)}
          </span>
        </div>

        {/* Exploration Progress Dial */}
        <div
          style={{
            width: compassSz,
            height: compassSz,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={compassSz}
            height={compassSz}
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotate(-90deg)',
            }}
          >
            <circle
              cx={compassSz / 2}
              cy={compassSz / 2}
              r={compassR}
              fill={fillColor}
              stroke="none"
              style={{ transition: 'fill 0.6s ease' }}
            />
            <circle
              cx={compassSz / 2}
              cy={compassSz / 2}
              r={compassR}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
            <circle
              cx={compassSz / 2}
              cy={compassSz / 2}
              r={compassR}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={compassCirc}
              strokeDashoffset={compassOffset}
              style={{
                transition: 'stroke 0.6s ease, stroke-dashoffset 0.4s ease',
              }}
            />
          </svg>
          <Compass
            size={isMobile ? 12 : 14}
            strokeWidth={1.5}
            style={{
              position: 'relative',
              color: strokeColor,
              transition: 'color 0.6s ease',
            }}
          />
        </div>

        {/* Mouse Coordinates (Desktop only) */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.1rem',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              paddingLeft: '0.6rem',
              fontSize: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ opacity: 0.5 }}>X</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', width: '45px', textAlign: 'right' }}>
                {fmtCoord(x)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ opacity: 0.5 }}>Y</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', width: '45px', textAlign: 'right' }}>
                {fmtCoord(y)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
