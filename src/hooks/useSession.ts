'use client'

/**
 * useSession Hook
 *
 * React hook for managing anonymous sessions.
 * Automatically creates a session on mount if one doesn't exist.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useSession } from '@/hooks/useSession'
 *
 * function MyComponent() {
 *   const { session, isLoading, error } = useSession()
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error message={error.message} />
 *
 *   return <div>Session: {session?.sessionId}</div>
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react'
import { getOrCreateSession, clearSession as clearSessionFn } from '@/lib/session'
import type { SessionInfo } from '@/types'

type SessionState = {
  /** The current session information, or null if not loaded */
  session: SessionInfo | null
  /** Whether the session is being loaded */
  isLoading: boolean
  /** Any error that occurred during session creation */
  error: Error | null
}

type UseSessionReturn = SessionState & {
  /** Refreshes the session (clears and recreates) */
  refreshSession: () => Promise<void>
  /** Clears the current session */
  clearSession: () => void
}

/**
 * Hook to manage anonymous sessions.
 *
 * @param options.autoCreate - Whether to automatically create a session on mount (default: true)
 */
export function useSession(options: { autoCreate?: boolean } = {}): UseSessionReturn {
  const { autoCreate = true } = options

  const [state, setState] = useState<SessionState>({
    session: null,
    isLoading: autoCreate,
    error: null,
  })

  // Load session on mount
  useEffect(() => {
    if (!autoCreate) return

    let mounted = true

    getOrCreateSession()
      .then((session) => {
        if (mounted) {
          setState({ session, isLoading: false, error: null })
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ session: null, isLoading: false, error })
        }
      })

    return () => {
      mounted = false
    }
  }, [autoCreate])

  // Refresh session callback
  const refreshSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      clearSessionFn()
      const session = await getOrCreateSession()
      setState({ session, isLoading: false, error: null })
    } catch (error) {
      setState({ session: null, isLoading: false, error: error as Error })
    }
  }, [])

  // Clear session callback
  const clearSession = useCallback(() => {
    clearSessionFn()
    setState({ session: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    refreshSession,
    clearSession,
  }
}

/**
 * Hook to get just the session ID.
 * Useful when you only need the ID for API calls.
 *
 * @example
 * ```tsx
 * const { sessionId, isLoading } = useSessionId()
 *
 * const addReaction = () => {
 *   if (!sessionId) return
 *   supabase.from('reactions').insert({ session_id: sessionId, ... })
 * }
 * ```
 */
export function useSessionId(): { sessionId: string | null; isLoading: boolean } {
  const { session, isLoading } = useSession()
  return { sessionId: session?.sessionId ?? null, isLoading }
}
