/**
 * Session Utility
 *
 * Utilities for managing session IDs and display names for presence tracking.
 * Both values are persisted in localStorage so returning users keep their identity.
 */

const SESSION_KEY = 'board-session-id'
const NAME_KEY = 'board-display-name'

/**
 * Animal names for anonymous users.
 * These create friendly, memorable identities for presence tracking.
 */
const ANIMAL_NAMES = [
  'Curious Penguin',
  'Swift Fox',
  'Wise Owl',
  'Busy Bee',
  'Happy Dolphin',
  'Clever Raccoon',
  'Gentle Deer',
  'Bold Eagle',
  'Playful Otter',
  'Brave Lion',
  'Calm Koala',
  'Quick Rabbit',
  'Sleepy Panda',
  'Merry Seal',
  'Bright Firefly',
  'Silent Hawk',
  'Nimble Squirrel',
  'Friendly Bear',
  'Graceful Swan',
  'Curious Cat',
]

/**
 * Get or create a unique session ID for this browser.
 * Persisted in localStorage so the same ID is used across page loads.
 *
 * @returns Session ID string, or empty string during SSR
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

/**
 * Get or create a display name for presence tracking.
 * Persisted in localStorage so returning users keep their name.
 *
 * @returns Display name string
 */
export function getOrCreateDisplayName(): string {
  if (typeof window === 'undefined') return 'Anonymous'

  let displayName = localStorage.getItem(NAME_KEY)
  if (!displayName) {
    displayName = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)]
    localStorage.setItem(NAME_KEY, displayName)
  }
  return displayName
}

/**
 * Clear session data (useful for testing or logout).
 */
export function clearPresenceSession(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(NAME_KEY)
}

/**
 * Check if a session already exists.
 */
export function hasSession(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SESSION_KEY) !== null
}

/**
 * Get current session info without creating new values.
 */
export function getSessionInfo(): { sessionId: string | null; displayName: string | null } {
  if (typeof window === 'undefined') {
    return { sessionId: null, displayName: null }
  }

  return {
    sessionId: localStorage.getItem(SESSION_KEY),
    displayName: localStorage.getItem(NAME_KEY),
  }
}
