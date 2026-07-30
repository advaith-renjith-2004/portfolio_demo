'use client'

/**
 * Browser Fingerprinting
 *
 * Generates a browser fingerprint for anonymous session tracking.
 * Uses multiple browser characteristics to create a stable identifier.
 *
 * Note: This is NOT for tracking users across sites, but for:
 * - Maintaining session state without auth
 * - Rate limiting reactions/views per unique visitor
 * - Analytics on unique vs returning visitors
 */

import type { FingerprintData } from '@/types'

/**
 * Generates a browser fingerprint by collecting various browser characteristics.
 * Returns both the hash and the raw components for debugging/storage.
 *
 * @example
 * ```ts
 * const { fingerprint, components } = await generateFingerprint()
 * console.log(fingerprint) // '3a4b5c6d...' (SHA-256 hash)
 * ```
 */
export async function generateFingerprint(): Promise<FingerprintData> {
  const components = await collectComponents()
  const fingerprint = await hashComponents(components)

  return {
    fingerprint,
    components,
  }
}

/**
 * Collects all browser characteristics used for fingerprinting.
 */
async function collectComponents(): Promise<FingerprintData['components']> {
  const canvas = await getCanvasFingerprint()
  const webgl = await getWebGLFingerprint()

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    canvas,
    webgl,
  }
}

/**
 * Generates a canvas fingerprint by drawing patterns and extracting the data URL.
 * Different browsers/devices render text and shapes slightly differently.
 */
async function getCanvasFingerprint(): Promise<string | undefined> {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    // Set text properties
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'

    // Draw colored rectangle
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)

    // Draw text with shadows
    ctx.fillStyle = '#069'
    ctx.fillText('Advaith Portfolio fingerprint', 2, 15)

    // Draw semi-transparent text
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Advaith Portfolio fingerprint', 4, 17)

    // Get data URL (limited length for efficiency)
    return canvas.toDataURL().slice(0, 100)
  } catch {
    return undefined
  }
}

/**
 * Extracts WebGL renderer information.
 * Different GPUs report different vendor/renderer strings.
 */
async function getWebGLFingerprint(): Promise<string | undefined> {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return undefined
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return undefined

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}~${renderer}`
  } catch {
    return undefined
  }
}

/**
 * Hashes the fingerprint components using SHA-256.
 * Returns a hex string.
 */
async function hashComponents(components: FingerprintData['components']): Promise<string> {
  const str = JSON.stringify(components)
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Validates a fingerprint string format.
 * Fingerprints should be 64-character hex strings (SHA-256 output).
 */
export function isValidFingerprint(fingerprint: unknown): fingerprint is string {
  return typeof fingerprint === 'string' && /^[a-f0-9]{64}$/.test(fingerprint)
}

/**
 * Generates a simple fallback session ID if fingerprinting fails.
 * Uses crypto.randomUUID() for a secure random identifier.
 */
export function generateFallbackSessionId(): string {
  return crypto.randomUUID()
}
