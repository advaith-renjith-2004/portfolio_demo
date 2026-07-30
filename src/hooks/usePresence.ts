'use client'

/**
 * usePresence Hook
 *
 * Tracks and displays active viewers using Supabase Presence.
 * Shows who is currently viewing the board in real-time.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateSessionId, getOrCreateDisplayName } from '@/lib/utils/session'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface Viewer {
  id: string
  name: string
  online_at: string
}

export interface PresenceState {
  /** Number of other viewers (excludes self) */
  viewerCount: number
  /** List of other viewers with display names */
  viewers: Viewer[]
  /** Whether connected to the presence channel */
  isConnected: boolean
  /** The current user's session ID */
  sessionId: string
  /** The current user's display name */
  displayName: string
}

interface PresencePayload {
  session_id: string
  display_name: string
  online_at: string
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Track and display active viewers on the board.
 *
 * @returns Presence state including viewer count and list
 */
export function usePresence(): PresenceState {
  const [presence, setPresence] = useState<PresenceState>({
    viewerCount: 0,
    viewers: [],
    isConnected: false,
    sessionId: '',
    displayName: '',
  })

  // Track previous viewer count for animation triggers
  const prevCountRef = useRef(0)

  // Track channel for cleanup
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Handle presence sync
  const handlePresenceSync = useCallback((channel: RealtimeChannel, currentSessionId: string) => {
    const state = channel.presenceState<PresencePayload>()

    // Flatten all presence records and filter out self
    const allViewers: Viewer[] = []

    Object.values(state).forEach((presenceList) => {
      presenceList.forEach((p) => {
        const payload = p as unknown as PresencePayload
        if (payload.session_id !== currentSessionId) {
          allViewers.push({
            id: payload.session_id,
            name: payload.display_name,
            online_at: payload.online_at,
          })
        }
      })
    })

    // Deduplicate by session ID (in case of multiple presence records)
    const uniqueViewers = Array.from(new Map(allViewers.map((v) => [v.id, v])).values())

    setPresence((prev) => ({
      ...prev,
      viewerCount: uniqueViewers.length,
      viewers: uniqueViewers,
      isConnected: true,
    }))

    prevCountRef.current = uniqueViewers.length
  }, [])

  useEffect(() => {
    // Client-side only
    if (typeof window === 'undefined') return

    const supabase = createClient()
    const sessionId = getOrCreateSessionId()
    const displayName = getOrCreateDisplayName()

    // Update local state with session info
    setPresence((prev) => ({
      ...prev,
      sessionId,
      displayName,
    }))

    if (!supabase) {
      console.warn('[Presence] Supabase client not initialized. Presence tracking disabled.')
      return
    }

    // Create presence channel
    const channel = supabase.channel('board-presence', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    })

    channelRef.current = channel

    // Subscribe to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        handlePresenceSync(channel, sessionId)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence
          const presenceData: PresencePayload = {
            session_id: sessionId,
            display_name: displayName,
            online_at: new Date().toISOString(),
          }

          const trackResult = await channel.track(presenceData)

          if (trackResult === 'ok') {
            console.log('[Presence] Successfully tracking presence')
            setPresence((prev) => ({ ...prev, isConnected: true }))
          } else {
            console.error('[Presence] Failed to track presence:', trackResult)
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Presence] Channel error')
          setPresence((prev) => ({ ...prev, isConnected: false }))
        } else if (status === 'TIMED_OUT') {
          console.error('[Presence] Connection timed out')
          setPresence((prev) => ({ ...prev, isConnected: false }))
        }
      })

    // Cleanup on unmount
    return () => {
      console.log('[Presence] Cleaning up presence subscription')
      if (channelRef.current) {
        channelRef.current.untrack()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [handlePresenceSync])

  return presence
}

/**
 * Check if viewer count changed (useful for animations).
 */
export function useViewerCountChanged(): boolean {
  const { viewerCount } = usePresence()
  const [changed, setChanged] = useState(false)
  const prevCountRef = useRef(viewerCount)

  useEffect(() => {
    if (prevCountRef.current !== viewerCount) {
      setChanged(true)
      prevCountRef.current = viewerCount

      // Reset after animation duration
      const timer = setTimeout(() => setChanged(false), 500)
      return () => clearTimeout(timer)
    }
  }, [viewerCount])

  return changed
}
