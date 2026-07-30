'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Use a royalty-free ambient space/lo-fi track
  const AUDIO_SRC = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_SRC)
    audioRef.current.loop = true
    audioRef.current.volume = 0.25 // Soft volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.warn('[AmbientPlayer] Playback blocked by browser:', err)
      })
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent play/pause toggle
    if (!audioRef.current) return
    const targetMute = !isMuted
    audioRef.current.muted = targetMute
    setIsMuted(targetMute)
  }

  return (
    <div
      onClick={togglePlayback}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          togglePlayback()
        }
      }}
      className={cn(
        'group fixed bottom-6 left-6 z-50 flex h-10 items-center gap-3 rounded-full border bg-background/80 px-3 py-1.5 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:border-primary/30',
        isPlaying ? 'max-w-[170px]' : 'max-w-[40px]'
      )}
    >
      {/* Play/Pause/Mute Controls */}
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/80 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {isPlaying ? (
          <Pause size={12} strokeWidth={2.5} />
        ) : (
          <Play size={12} strokeWidth={2.5} className="translate-x-[1px]" />
        )}
      </div>

      {/* Scrolling Track Name (Visible when playing) */}
      {isPlaying && (
        <div className="flex flex-1 flex-col overflow-hidden text-[9px] font-mono uppercase tracking-widest text-foreground/80">
          <div className="animate-marquee whitespace-nowrap">
            Ambient Lo-Fi Radio
          </div>
        </div>
      )}

      {/* Micro Equalizer or Mute Toggle */}
      {isPlaying ? (
        <button
          onClick={toggleMute}
          className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX size={13} />
          ) : (
            <div className="flex items-end gap-[2px] h-4">
              <span className="w-[2px] bg-primary rounded-full eq-bar-1" />
              <span className="w-[2px] bg-primary rounded-full eq-bar-2" />
              <span className="w-[2px] bg-primary rounded-full eq-bar-3" />
              <span className="w-[2px] bg-primary rounded-full eq-bar-4" />
            </div>
          )}
        </button>
      ) : null}
    </div>
  )
}
