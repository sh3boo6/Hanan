export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q || !q.trim()) {
    return []
  }

  const url = new URL('https://suggestqueries.google.com/complete/search')
  url.searchParams.set('client', 'firefox')
  url.searchParams.set('hl', 'ar')
  url.searchParams.set('q', q.trim())

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'ar,en;q=0.9'
      },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return []
    }

    const text = await response.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return []
    }

    if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
      return parsed[1].filter((item): item is string => typeof item === 'string')
    }

    return []
  } catch {
    return []
  }
})
