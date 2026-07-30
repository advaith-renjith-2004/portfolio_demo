/**
 * Session Management Exports
 *
 * Re-exports session utilities for convenient imports.
 *
 * @example
 * ```tsx
 * import { getOrCreateSession, getSessionId } from '@/lib/session'
 *
 * // Get or create a session
 * const session = await getOrCreateSession()
 *
 * // Get just the session ID
 * const sessionId = getSessionId()
 * ```
 */

// Session management exports
export { getOrCreateSession, getCurrentSession, getSessionId, clearSession } from './session'

// Fingerprinting exports
export { generateFingerprint, isValidFingerprint, generateFallbackSessionId } from './fingerprint'

// Type exports
export type { SessionInfo, FingerprintData } from '@/types'
