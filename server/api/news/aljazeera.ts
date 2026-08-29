// server/api/news/aljazeera.ts
import Parser from 'rss-parser'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
  }
})

export default defineEventHandler(async (_event) => {
  // استبدل هذا الرابط برابط RSS صحيح وموثوق
  const RSS_URL = 'https://www.aljazeera.net/rss' // أو رابط وكالة الأنباء السعودية

  try {
    const feed = await parser.parseURL(RSS_URL)

    return {
      success: true,
      title: feed.title,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet
      }))
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error('RSS Fetch Error:', message)

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch RSS: ${message}`
    })
  }
})
