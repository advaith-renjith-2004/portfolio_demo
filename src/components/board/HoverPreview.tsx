'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface HoverPreviewProps {
  url: string
  x: number
  y: number
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverPreview({
  url,
  x,
  y,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: HoverPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [iframeUrl, setIframeUrl] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Sync iframe src only when open, and clear when closed to conserve memory
  useEffect(() => {
    if (isOpen && url) {
      setIsLoading(true)
      setIframeUrl(url)
    } else {
      // Small timeout to allow exit fade animation to finish before clearing source
      const timer = setTimeout(() => {
        setIframeUrl('')
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, url])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Parse hostname for browser mock bar
  const hostname = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  })()

  return (
    <AnimatePresence>
      {isOpen && iframeUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="fixed w-[380px] h-[260px] z-[9999] bg-card/90 dark:bg-zinc-950/90 border border-border/80 dark:border-white/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          style={{
            left: x,
            top: y,
          }}
        >
          {/* Mock Browser Header Bar */}
          <div className="h-8 min-h-[32px] px-3 bg-black/5 dark:bg-white/5 border-b border-border/80 dark:border-white/5 flex items-center gap-3 select-none">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[11px] font-mono font-medium text-muted-foreground/80 truncate">
              {hostname}
            </span>
          </div>

          {/* Iframe content container */}
          <div className="relative flex-1 w-full h-full bg-card/30 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card dark:bg-zinc-900 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-80" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              onLoad={handleIframeLoad}
              style={{
                width: '1280px',
                height: '768px',
                transform: 'scale(0.296875)', // Scale 1280px to fit exactly in 380px container width
                transformOrigin: 'top left',
              }}
              className="border-0 bg-transparent"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
