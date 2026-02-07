import { styleText } from 'node:util'

import { parseDateOnly, relativeDateLabel } from './date.ts'

export type Repo = {
  full_name?: string
  name?: string
  url?: string
  html_url?: string
  language?: string
  stargazers_count?: number
  new_stargazers_count?: number
  occurrences?: number
  count?: number
  description?: string
  created_at?: string
}

/** Decode common HTML entities to their corresponding characters. */
function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>'
  }
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
      const code = Number.parseInt(hex, 16)
      return Number.isFinite(code) ? String.fromCharCode(code) : m
    })
    .replace(/&#(\d+);/g, (m, num) => {
      const code = Number.parseInt(num, 10)
      return Number.isFinite(code) ? String.fromCharCode(code) : m
    })
    .replace(/&[a-zA-Z]+;/g, (entity) => named[entity] ?? entity)
}

/** Get a unique identifier string for a repo. */
export function repoKey(repo: Repo): string | null {
  for (const key of ['full_name', 'html_url', 'url', 'name'] as const) {
    const value = repo[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

/** Extract the created_at date from a repo object. */
export function repoCreatedDate(repo: Repo): Date | null {
  const createdAt = repo.created_at
  if (typeof createdAt === 'string') {
    return parseDateOnly(createdAt.trim())
  }
  return null
}

/** Merge and deduplicate top_new and top_all repos, sorted by creation date. */
export function mergeRepos(topNew: Repo[], topAll: Repo[]): Repo[] {
  const combined: Repo[] = []
  const seen = new Set<string>()

  for (const repo of topAll) {
    const key = repoKey(repo)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    combined.push(repo)
  }

  for (const repo of topNew) {
    const key = repoKey(repo)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    combined.push(repo)
  }

  combined.sort((a, b) => {
    const dateA = repoCreatedDate(a)?.getTime() ?? 0
    const dateB = repoCreatedDate(b)?.getTime() ?? 0
    return dateB - dateA
  })

  return combined
}

/** Format a repo as display lines. */
export function formatRepoLines(repo: Repo, nowDate: Date, useColor: boolean): string[] {
  const name = repo.full_name || repo.name || repo.url || 'unknown'
  const language = (repo.language || 'unknown').toLowerCase()
  const stars = repo.stargazers_count
  const starsStr = stars !== undefined ? `★ ${Number(stars).toLocaleString()}` : '★ ?'
  const description = repo.description ? decodeEntities(repo.description) : '(no description)'
  const url = repo.html_url || repo.url || 'unknown'
  const createdAt = repo.created_at || ''

  let createdLabel = 'unknown'
  if (createdAt) {
    const createdDate = parseDateOnly(createdAt.trim())
    if (createdDate) {
      createdLabel = relativeDateLabel(createdDate, nowDate)
    }
  }

  const byline = [starsStr, createdLabel, language].join(' · ')

  if (useColor) {
    return [
      styleText('cyan', name),
      description,
      styleText('gray', url),
      styleText(['dim', 'gray'], byline)
    ]
  }

  return [name, description, url, byline]
}

/** Print a list of repos. */
export function printList(
  items: Repo[],
  nowDate: Date,
  useColor: boolean,
  limit: number | undefined
): void {
  if (items.length === 0) {
    console.log('(no repos)')
    return
  }

  const outputLines: string[] = []
  let shown = 0
  for (const repo of items) {
    if (typeof limit !== 'undefined' && shown >= limit) break

    for (const line of formatRepoLines(repo, nowDate, useColor)) {
      outputLines.push(line)
    }
    shown += 1

    const cap = limit ?? items.length
    if (shown < cap && shown < items.length) {
      outputLines.push('')
    }
  }

  // Final newline
  console.log(outputLines.join('\n'))
}
