export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q || !q.trim()) {
    return []
  }

  try {
    const url = new URL('https://suggestqueries.google.com/complete/search')
    url.searchParams.set('client', 'firefox')
    url.searchParams.set('hl', 'ar')
    url.searchParams.set('q', q.trim())

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Hanan/1.0)',
        'Accept': 'application/json, text/javascript, */*'
      }
    })

    if (!response.ok) {
      console.error('Google suggestions API responded with status:', response.status)
      return []
    }

    const text = await response.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      console.error('Failed to parse Google suggestions response as JSON')
      return []
    }

    if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
      return parsed[1].filter((item): item is string => typeof item === 'string')
    }

    return []
  } catch (error) {
    console.error('Failed to fetch Google suggestions:', error)
    return []
  }
})
