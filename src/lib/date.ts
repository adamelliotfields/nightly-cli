/** Parse a date string in YYYYMMDD, YYYY-MM-DD, or YYYY/MM/DD format. */
export function parseDate(value: string): Date {
  const trimmed = value.trim()
  const message = 'Date must be in YYYYMMDD, YYYY-MM-DD, or YYYY/MM/DD format'

  if (trimmed.includes('/') || trimmed.includes('-')) {
    const delimiter = trimmed.includes('/') ? '/' : '-'
    const parts = trimmed.split(delimiter)

    // Dates have 3 parts and the year is always 4 digits
    if (
      parts.length !== 3 ||
      parts[0].length !== 4 ||
      parts[1].length !== 2 ||
      parts[2].length !== 2 ||
      !parts.every((part) => /^\d+$/.test(part))
    ) {
      throw new Error(message)
    }

    const [year, month, day] = parts.map((part) => Number.parseInt(part, 10))
    return createValidDate(year, month, day, message)
  }

  if (/^\d{8}$/.test(trimmed)) {
    const year = Number.parseInt(trimmed.slice(0, 4), 10)
    const month = Number.parseInt(trimmed.slice(4, 6), 10)
    const day = Number.parseInt(trimmed.slice(6, 8), 10)
    return createValidDate(year, month, day, message)
  }

  throw new Error(message)
}

/** Create a Date object and validate that the components are correct. */
export function createValidDate(year: number, month: number, day: number, message: string): Date {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(message)
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(message)
  }

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(message)
  }

  return date
}

/** Parse just the date portion from a datetime string. */
export function parseDateOnly(value: string): Date | null {
  if (!value) return null
  try {
    return parseDate(value.split('T')[0])
  } catch {
    return null
  }
}

/** Get current datetime in America/Chicago timezone. */
export function centralNow(): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const parts = formatter.formatToParts(new Date())
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
    return new Date(
      parseInt(get('year'), 10),
      parseInt(get('month'), 10) - 1,
      parseInt(get('day'), 10),
      parseInt(get('hour'), 10),
      parseInt(get('minute'), 10)
    )
  } catch {
    return new Date()
  }
}

/** Resolve date string or default to yesterday/today based on 10pm cutoff. */
export function resolveDate(dateStr: string | undefined): Date {
  const now = centralNow()
  const baseDate =
    now.getHours() < 22
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!dateStr) return baseDate
  const trimmed = dateStr.trim()
  if (/^-\d+$/.test(trimmed)) {
    const offset = Number.parseInt(trimmed, 10)
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset)
  }
  return parseDate(trimmed)
}

/** Format a date as YYYY/MM/DD. */
export function formatDatePath(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

/** Return a human-readable relative date label. */
export function relativeDateLabel(then: Date, now: Date): string {
  const thenTime = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()
  const nowTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const deltaDays = Math.floor((nowTime - thenTime) / (1000 * 60 * 60 * 24))

  if (deltaDays <= 0) return 'today'
  if (deltaDays === 1) return 'yesterday'
  if (deltaDays < 7) return `${deltaDays} days ago`
  if (deltaDays < 30) {
    const weeks = Math.floor(deltaDays / 7)
    return weeks === 1 ? 'last week' : `${weeks} weeks ago`
  }
  if (deltaDays < 365) {
    const months = Math.max(1, Math.floor(deltaDays / 30))
    return months === 1 ? 'last month' : `${months} months ago`
  }

  const years = Math.max(1, Math.floor(deltaDays / 365))
  return years === 1 ? 'last year' : `${years} years ago`
}
