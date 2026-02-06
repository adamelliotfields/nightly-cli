export type FetchResult = {
  ok: boolean
  status: number
  data: unknown
  url: string
}

export type FetchInit = Parameters<typeof fetch>[1]

/** Fetches JSON data from a URL and normalizes the response. */
export async function fetchJson(url: string, init?: FetchInit): Promise<FetchResult> {
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    ...((init?.headers as Record<string, string>) ?? {})
  }

  const res = await fetch(url, { ...init, headers })
  const text = await res.text()

  let data: unknown = text
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
    url
  }
}

/** Extracts an error message from a FetchResult object. */
export function extractErrorMessage(result: FetchResult): string {
  if (typeof result.data === 'string') return result.data

  if (result.data && typeof result.data === 'object') {
    const dataObj = result.data as Record<string, unknown>
    if (typeof dataObj.message === 'string') return dataObj.message

    if (dataObj.data && typeof dataObj.data === 'object') {
      const nested = dataObj.data as Record<string, unknown>
      if (typeof nested.message === 'string') return nested.message
    }
  }

  return `HTTP ${result.status}`
}
