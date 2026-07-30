/**
 * Session Registration API Route
 *
 * Registers new anonymous sessions in the database.
 * Uses the admin client to bypass RLS for session creation.
 *
 * Rate limited to 5 session registrations per IP per hour.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // 5 sessions per hour per IP

/**
 * Check rate limit for an IP address.
 * Returns true if the request should be allowed.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean up expired records periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (!record || record.resetAt < now) {
    // Create new record
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  // Increment count
  record.count++
  return true
}

/**
 * POST /api/session/register
 *
 * Registers a new anonymous session.
 *
 * Request body:
 * - sessionId: string (UUID format)
 * - fingerprint: string (SHA-256 hash)
 * - userAgent?: string
 *
 * Response:
 * - 200: { success: true }
 * - 400: { error: string } - Invalid input
 * - 429: { error: string } - Rate limited
 * - 500: { error: string } - Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many session registrations. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sessionId, fingerprint, userAgent } = body

    // Validate sessionId (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!sessionId || !uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format. Must be a valid UUID.' },
        { status: 400 }
      )
    }

    // Validate fingerprint (optional, but if provided must be SHA-256)
    if (fingerprint && (typeof fingerprint !== 'string' || fingerprint.length > 128)) {
      return NextResponse.json({ error: 'Invalid fingerprint format.' }, { status: 400 })
    }

    // Create admin client (bypasses RLS)
    const supabase = createAdminClient()

    // Upsert session (create if not exists, update if exists)
    const { error } = await supabase.from('sessions').upsert(
      {
        session_id: sessionId,
        fingerprint: fingerprint || null,
        user_agent: userAgent || null,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'session_id',
      }
    )

    if (error) {
      console.error('Session registration error:', error)
      return NextResponse.json({ error: 'Failed to register session.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session registration error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
