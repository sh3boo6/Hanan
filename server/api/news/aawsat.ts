// server/api/news/aawsat.ts
import { XMLParser } from 'fast-xml-parser'

export default defineEventHandler(async (_event) => {
  const AAWSAT_RSS_URL = 'http://aawsat.com/feed'

  try {
    const response = await fetch(AAWSAT_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'ar-SA,ar;q=0.9'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ''
    })

    const result = parser.parse(xmlText)

    type RssItem = {
      'title'?: string | { '#text'?: string } | Record<string, unknown>
      'link'?: string | { href?: string } | Record<string, unknown>
      'pubDate'?: string
      'published'?: string
      'updated'?: string
      'description'?: string
      'summary'?: string
      'content'?: string
      'categories'?: string | string[] | Record<string, unknown>
      'category'?: string | string[] | Record<string, unknown>
      'enclosure'?: { url?: string } | Record<string, unknown>
      'media:content'?: { url?: string } | Record<string, unknown>
      [key: string]: unknown
    }

    const channel = result?.rss?.channel || result?.feed || result
    const rawItems = channel?.item || channel?.entry || []
    const items = Array.isArray(rawItems) ? rawItems : [rawItems]

    return {
      success: true,
      title: channel.title || 'الشرق الأوسط',
      description: channel.description || 'أحدث أخبار الشرق الأوسط',
      items: items.map((item: RssItem) => {
        const categories = Array.isArray(item.categories)
          ? item.categories
          : (item.categories || item.category)
        const categoryList = Array.isArray(categories)
          ? categories.map(c => typeof c === 'object' && c !== null && '#text' in c ? String(c['#text'] ?? '') : String(c ?? '')).filter(Boolean)
          : (typeof categories === 'string' ? [categories] : [])

        return {
          title: typeof item.title === 'object' && item.title !== null
            ? ('#text' in item.title ? String(item.title['#text'] ?? '') : '')
            : String(item.title ?? ''),
          link: typeof item.link === 'object' && item.link !== null
            ? ('href' in item.link ? String(item.link.href ?? '#') : '#')
            : String(item.link ?? '#'),
          pubDate: String(item.pubDate ?? item.published ?? item.updated ?? new Date().toISOString()),
          contentSnippet: String(item.description ?? item.summary ?? item.content ?? ''),
          categories: categoryList,
          image: (() => {
            const enc = item.enclosure
            if (enc && typeof enc === 'object' && enc !== null && 'url' in enc) {
              return String(enc.url ?? '')
            }
            const media = item['media:content']
            if (media && typeof media === 'object' && media !== null && 'url' in media) {
              return String(media.url ?? '')
            }
            return ''
          })()
        }
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error('Aawsat RSS Fetch Error:', message)

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Aawsat RSS: ${message}`
    })
  }
})
