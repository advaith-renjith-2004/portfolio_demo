'use client'

/**
 * Session Management
 *
 * Manages anonymous visitor sessions using browser fingerprinting.
 * Sessions are stored in localStorage and synced with the database.
 */

import { createClient } from '@/lib/supabase/client'
import { generateFingerprint, generateFallbackSessionId, isValidFingerprint } from './fingerprint'
import type { SessionInfo } from '@/types'

const SESSION_STORAGE_KEY = 'portfolio_session'
const SESSION_COOKIE_NAME = 'portfolio_session_id'

/**
 * Gets or creates a session for the current browser.
 * Uses fingerprinting + localStorage for persistence.
 *
 * Flow:
 * 1. Check localStorage for existing session
 * 2. If exists, update last_seen_at and return
 * 3. Generate fingerprint
 * 4. Check if session exists for fingerprint in DB
 * 5. Create new session if needed
 * 6. Store in localStorage + cookie
 *
 * @example
 * ```tsx
 * 'use client'
 * import { getOrCreateSession } from '@/lib/session'
 *
 * function MyComponent() {
 *   useEffect(() => {
 *     getOrCreateSession().then(session => {
 *       console.log('Session ID:', session.sessionId)
 *     })
 *   }, [])
 * }
 * ```
 */
export async function getOrCreateSession(): Promise<SessionInfo> {
  // Check for existing session in localStorage
  const stored = getStoredSession()
  if (stored) {
    // Update last_seen_at in background (fire and forget)
    updateLastSeen(stored.sessionId).catch(() => {
      // Silently ignore errors - session update is not critical
    })
    return { ...stored, isNew: false }
  }

  // Generate new fingerprint
  let fingerprint: string
  try {
    const result = await generateFingerprint()
    fingerprint = result.fingerprint
  } catch {
    // Fall back to random UUID if fingerprinting fails
    fingerprint = generateFallbackSessionId()
  }

  // Generate a session ID (UUID format for database storage)
  const sessionId = generateFallbackSessionId()

  const supabase = createClient()

  if (!supabase) {
    const sessionInfo: SessionInfo = {
      sessionId,
      fingerprint,
      isNew: true,
    }
    storeSession(sessionInfo)
    return sessionInfo
  }

  // Check if session exists for this fingerprint
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id, session_id')
    .eq('fingerprint', fingerprint)
    .maybeSingle()

  if (existingSession) {
    // Session exists for this fingerprint - reuse it
    const sessionInfo: SessionInfo = {
      sessionId: existingSession.session_id,
      fingerprint,
      isNew: false,
    }
    storeSession(sessionInfo)
    await updateLastSeen(existingSession.session_id)
    return sessionInfo
  }

  // Register new session via API (to handle RLS properly)
  const response = await fetch('/api/session/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      fingerprint,
      userAgent: navigator.userAgent,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to register session')
  }

  const sessionInfo: SessionInfo = {
    sessionId,
    fingerprint,
    isNew: true,
  }

  storeSession(sessionInfo)
  return sessionInfo
}

/**
 * Gets the current session without creating one.
 * Returns null if no session exists.
 */
export function getCurrentSession(): SessionInfo | null {
  return getStoredSession()
}

/**
 * Gets just the session ID for API calls.
 * Returns null if no session exists.
 */
export function getSessionId(): string | null {
  return getStoredSession()?.sessionId ?? null
}

/**
 * Clears the current session.
 * Useful for testing or allowing users to "reset" their identity.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(SESSION_STORAGE_KEY)
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// ============================================================================
// Private Helpers
// ============================================================================

/**
 * Retrieves the stored session from localStorage.
 */
function getStoredSession(): SessionInfo | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Validate the stored data
    if (!parsed.sessionId || typeof parsed.sessionId !== 'string') {
      return null
    }

    // Fingerprint validation is optional (could be a fallback UUID)
    const fingerprint = isValidFingerprint(parsed.fingerprint)
      ? parsed.fingerprint
      : parsed.fingerprint || ''

    return {
      sessionId: parsed.sessionId,
      fingerprint,
      isNew: false,
    }
  } catch {
    return null
  }
}

/**
 * Stores the session in localStorage and sets a cookie for server access.
 */
function storeSession(session: SessionInfo): void {
  if (typeof window === 'undefined') return

  // Store in localStorage
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      sessionId: session.sessionId,
      fingerprint: session.fingerprint,
    })
  )

  // Set cookie for server-side access (1 year expiry)
  const maxAge = 60 * 60 * 24 * 365 // 1 year in seconds
  document.cookie = `${SESSION_COOKIE_NAME}=${session.sessionId}; path=/; max-age=${maxAge}; samesite=lax`
}

/**
 * Updates the last_seen_at timestamp for a session.
 */
async function updateLastSeen(sessionId: string): Promise<void> {
  const supabase = createClient()
  if (!supabase) return

  await supabase
    .from('sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('session_id', sessionId)
}
