type DateFormat = 'short' | 'full'

/**
 * Formats a date string.
 * 'short' -> "JAN '22"
 * 'full' -> "25 May 2026"
 */
function formatDate(dateString: string, format: DateFormat = 'short'): string {
  const date = new Date(dateString)
  if (format === 'full') {
    const day = date.getDate()
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  } else {
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const year = date.getFullYear().toString().slice(-2)
    return `${month} '${year}`
  }
}

/**
 * Formats a start and end date into a range string.
 * Example: "JAN '22 → Present" or "25 May 2026 → 28 June 2026"
 */
export function formatDateRange(startDate: string | null, endDate: string | null, format: DateFormat = 'short'): string {
  if (!startDate) return ''

  const start = formatDate(startDate, format)
  const end = endDate ? formatDate(endDate, format) : 'Present'

  return `${start} → ${end}`
}
